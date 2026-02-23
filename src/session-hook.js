import fs from "fs";

export function readHookEvent(args = process.argv.slice(2)) {
  const file = readFlag(args, "--event-file");
  if (file) {
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw);
  }

  const stdin = readStdinSync();
  if (stdin.trim()) {
    return JSON.parse(stdin);
  }

  const envJson = process.env.OPENCLAW_SESSION_EVENT_JSON;
  if (envJson) return JSON.parse(envJson);

  return null;
}

export function eventToRunInput(event = {}, fallbackPrompt = "") {
  const prompt = event.prompt || event.message?.text || event.text || fallbackPrompt || "";
  const channelContext = {
    channel: event.channel || event.message?.channel || "unknown",
    kind: event.isGroup ? "group" : event.channelType || event.message?.channelType || "unknown",
    actor: event.actor || event.user || event.message?.author || "unknown"
  };

  return {
    prompt,
    channelContext,
    meta: {
      eventType: event.type || "session_event",
      eventId: event.id || null
    }
  };
}

function readStdinSync() {
  try {
    if (process.stdin.isTTY) return "";
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function readFlag(argv, flag) {
  const idx = argv.indexOf(flag);
  if (idx === -1) return null;
  return argv[idx + 1] ?? null;
}
