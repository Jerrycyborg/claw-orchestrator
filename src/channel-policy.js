const DEFAULT_POLICY = Object.freeze({
  direct: { allowed: true, requiresApproval: false },
  group: { allowed: false, requiresApproval: true },
  unknown: { allowed: true, requiresApproval: false }
});

function normalizeChannelContext(channel = {}) {
  const kindRaw = `${channel.kind || channel.channelType || "unknown"}`.toLowerCase();
  const kind = kindRaw === "dm" ? "direct" : kindRaw;

  return {
    channel: channel.channel || channel.channelName || "unknown",
    kind,
    actor: channel.actor || channel.user || "unknown"
  };
}

export function enforceChannelPolicy(channelContext = {}, options = {}) {
  const ctx = normalizeChannelContext(channelContext);
  const profile = {
    ...DEFAULT_POLICY,
    ...(options.channelPolicy || {})
  };

  const rule = profile[ctx.kind] || profile.unknown;

  if (!rule.allowed) {
    return {
      ok: false,
      reason: `Channel policy blocked execution for '${ctx.kind}' context`,
      channelContext: ctx,
      requiresApproval: !!rule.requiresApproval
    };
  }

  if (rule.requiresApproval && !options.approveSensitive) {
    return {
      ok: false,
      reason: `Channel policy requires approval for '${ctx.kind}' context (--approve-sensitive)`,
      channelContext: ctx,
      requiresApproval: true
    };
  }

  return { ok: true, channelContext: ctx, requiresApproval: !!rule.requiresApproval };
}

export function parseChannelFlag(value = "direct") {
  const v = String(value || "direct").toLowerCase();
  if (["group", "channel", "thread"].includes(v)) return "group";
  if (["dm", "direct", "private"].includes(v)) return "direct";
  return "unknown";
}
