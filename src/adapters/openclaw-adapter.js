import fs from "fs";
import path from "path";
import { exec, execFile, execSync } from "child_process";

function hasOpenClawCli() {
  try {
    execSync("command -v openclaw", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function runCmd(command, args) {
  return new Promise((resolve) => {
    execFile(command, args, { timeout: 20000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ ok: false, error: error.message, stdout, stderr });
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

export async function executeRole(ctx) {
  const cliExists = hasOpenClawCli();
  if (!cliExists) {
    return {
      role: ctx.role,
      status: "skipped",
      adapter: "openclaw",
      note: "OpenClaw CLI not found on host; set OPENCLAW_ROLE_CMD to bridge role execution"
    };
  }

  const roleTemplate = loadRoleTemplate(ctx.role);
  const rolePrompt = renderTemplate(roleTemplate, {
    ...ctx,
    rolePrompt: "",
    rolePromptB64: ""
  });

  const rolePromptB64 = Buffer.from(rolePrompt, "utf8").toString("base64");
  const commandTemplate = process.env.OPENCLAW_ROLE_CMD;

  if (!commandTemplate) {
    const probe = await runCmd("openclaw", ["status"]);
    return {
      role: ctx.role,
      status: probe.ok ? "ok" : "warning",
      adapter: "openclaw",
      note: probe.ok
        ? "OpenClaw reachable (probe). Set OPENCLAW_ROLE_CMD for real role execution bridge."
        : `OpenClaw probe failed: ${probe.error}`,
      output: trim(probe.stdout),
      error: trim(probe.stderr),
      rolePromptPreview: trim(rolePrompt).slice(0, 300)
    };
  }

  const cmd = renderTemplate(commandTemplate, {
    ...ctx,
    rolePrompt,
    rolePromptB64
  });

  const shellResult = await new Promise((resolve) => {
    exec(cmd, { timeout: 60000 }, (error, stdout, stderr) => {
      if (error) resolve({ ok: false, error: error.message, stdout, stderr });
      else resolve({ ok: true, stdout, stderr });
    });
  });

  return {
    role: ctx.role,
    status: shellResult.ok ? "ok" : "failed",
    adapter: "openclaw",
    note: shellResult.ok ? "Role executed via OPENCLAW_ROLE_CMD" : "Role execution command failed",
    output: trim(shellResult.stdout),
    error: trim(shellResult.stderr)
  };
}

function trim(v) {
  if (!v) return "";
  return String(v).trim().slice(0, 1000);
}
