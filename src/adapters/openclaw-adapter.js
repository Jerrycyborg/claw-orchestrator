import "../env.js";

import fs from "fs";
import path from "path";
import { exec, execFile, execSync } from "child_process";
import { getEnv } from "../env.js";
import { logger } from "../logger.js";

function hasOpenClawCli() {
  try {
    execSync("command -v openclaw", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function runCmd(command, args, timeoutMs = 20000) {
  return new Promise((resolve) => {
    execFile(command, args, { timeout: timeoutMs }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          ok: false,
          error: error.message,
          code: error.code,
          signal: error.signal,
          stdout,
          stderr
        });
        return;
      }
      resolve({ ok: true, stdout, stderr });
    });
  });
}

function loadRoleTemplate(role) {
  const file = path.resolve(process.cwd(), "config", "roles", `${role}.md`);
  if (!fs.existsSync(file)) {
    return "Role: {role}\nIntent: {intent}\nRun: {runId}\nPrompt:\n{prompt}";
  }
  return fs.readFileSync(file, "utf8");
}

function renderTemplate(template, ctx) {
  return template
    .replaceAll("{role}", ctx.role)
    .replaceAll("{prompt}", ctx.prompt)
    .replaceAll("{intent}", ctx.intent || "")
    .replaceAll("{runId}", ctx.runId)
    .replaceAll("{rolePrompt}", ctx.rolePrompt)
    .replaceAll("{rolePromptB64}", ctx.rolePromptB64);
}

export function resolveDispatchPlan(env = process.env, cliAvailable = hasOpenClawCli()) {
  const e = getEnv(env);
  if (e.OPENCLAW_API_URL) return "native-api";
  if (cliAvailable) return "native-cli";
  if (e.OPENCLAW_ROLE_CMD) return "legacy-shell-bridge";
  return "unavailable";
}

async function runNativeApi(ctx, rolePrompt) {
  const env = getEnv(process.env);
  const baseUrl = env.OPENCLAW_API_URL;
  const token = env.OPENCLAW_API_TOKEN;
  const endpoint = env.OPENCLAW_API_ROLE_PATH || "/api/roles/execute";

  const res = await fetch(new URL(endpoint, baseUrl).toString(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      role: ctx.role,
      prompt: rolePrompt,
      intent: ctx.intent,
      runId: ctx.runId,
      stageMode: ctx.stageMode,
      attempt: ctx.attempt
    })
  });

  const text = await res.text();
  if (!res.ok) {
    return {
      ok: false,
      error: `HTTP ${res.status}`,
      stdout: "",
      stderr: trim(text)
    };
  }

  return {
    ok: true,
    stdout: trim(text),
    stderr: ""
  };
}

async function runNativeCli(ctx, rolePrompt) {
  return runCmd(
    "openclaw",
    [
      "agent",
      "--agent",
      ctx.role,
      "--message",
      rolePrompt,
      "--thinking",
      "low",
      "--timeout",
      "120",
      "--json"
    ],
    130000
  );
}

async function runLegacyShellBridge(ctx, rolePrompt, rolePromptB64) {
  const env = getEnv(process.env);
  const commandTemplate = env.OPENCLAW_ROLE_CMD;
  const cmd = renderTemplate(commandTemplate, {
    ...ctx,
    rolePrompt,
    rolePromptB64
  });

  return new Promise((resolve) => {
    exec(cmd, { timeout: 60000 }, (error, stdout, stderr) => {
      if (error) resolve({ ok: false, error: error.message, stdout, stderr });
      else resolve({ ok: true, stdout, stderr });
    });
  });
}

export async function executeRole(ctx) {
  const roleTemplate = loadRoleTemplate(ctx.role);
  const rolePrompt = renderTemplate(roleTemplate, {
    ...ctx,
    rolePrompt: "",
    rolePromptB64: ""
  });

  const rolePromptB64 = Buffer.from(rolePrompt, "utf8").toString("base64");
  const env = getEnv(process.env);
  const plan = resolveDispatchPlan(process.env, hasOpenClawCli());

  if (plan === "unavailable") {
    return {
      role: ctx.role,
      status: "skipped",
      adapter: "openclaw",
      note: "No native OpenClaw dispatch available (set OPENCLAW_API_URL or install openclaw CLI)."
    };
  }

  if (plan === "native-api") {
    const apiResult = await runNativeApi(ctx, rolePrompt);
    if (apiResult.ok) {
      return {
        role: ctx.role,
        status: "ok",
        adapter: "openclaw",
        dispatch: "native-api",
        note: "Role executed via native OpenClaw API/plugin endpoint",
        output: trim(apiResult.stdout),
        error: ""
      };
    }

    // fall through to CLI when available for resilience
    if (!hasOpenClawCli()) {
      return {
        role: ctx.role,
        status: "failed",
        adapter: "openclaw",
        dispatch: "native-api",
        note: "Native OpenClaw API dispatch failed",
        output: "",
        error: trim(apiResult.stderr || apiResult.error || "")
      };
    }
  }

  const cliResult = await runNativeCli(ctx, rolePrompt);
  if (cliResult.ok) {
    return {
      role: ctx.role,
      status: "ok",
      adapter: "openclaw",
      dispatch: "native-cli",
      note: "Role executed via native OpenClaw CLI dispatch",
      output: trim(cliResult.stdout),
      error: trim(cliResult.stderr)
    };
  }

  if (env.OPENCLAW_ROLE_CMD) {
    const shellResult = await runLegacyShellBridge(ctx, rolePrompt, rolePromptB64);
    return {
      role: ctx.role,
      status: shellResult.ok ? "ok" : "failed",
      adapter: "openclaw",
      dispatch: "legacy-shell-bridge",
      note: shellResult.ok
        ? "Role executed via OPENCLAW_ROLE_CMD (fallback)"
        : "Role execution command failed",
      output: trim(shellResult.stdout),
      error: trim(shellResult.stderr || shellResult.error || "")
    };
  }

  logger.warn(
    {
      role: ctx.role,
      dispatch: "native-cli",
      code: cliResult.code,
      signal: cliResult.signal
    },
    "OpenClaw CLI dispatch failed"
  );

  return {
    role: ctx.role,
    status: "failed",
    adapter: "openclaw",
    dispatch: "native-cli",
    note: "Native OpenClaw CLI dispatch failed",
    output: trim(cliResult.stdout),
    error: trim(cliResult.stderr || cliResult.error || "")
  };
}

function trim(v) {
  if (!v) return "";
  return String(v).trim().slice(0, 1000);
}
