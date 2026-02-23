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

function renderTemplate(template, ctx) {
  return template
    .replaceAll("{role}", ctx.role)
    .replaceAll("{prompt}", ctx.prompt)
    .replaceAll("{intent}", ctx.intent || "")
    .replaceAll("{runId}", ctx.runId);
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

  const template = process.env.OPENCLAW_ROLE_CMD;
  if (!template) {
    const probe = await runCmd("openclaw", ["status"]);
    return {
      role: ctx.role,
      status: probe.ok ? "ok" : "warning",
      adapter: "openclaw",
      note: probe.ok
        ? "OpenClaw reachable (probe). Set OPENCLAW_ROLE_CMD for real role execution bridge."
        : `OpenClaw probe failed: ${probe.error}`,
      output: trim(probe.stdout),
      error: trim(probe.stderr)
    };
  }

  // Template should produce a shell command, e.g.:
  // OPENCLAW_ROLE_CMD='openclaw sessions send --label pool-{role} --message "{prompt}"'
  const cmd = renderTemplate(template, ctx);
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
