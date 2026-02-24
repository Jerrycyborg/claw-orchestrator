const runsEl = document.getElementById("runs");
const detailEl = document.getElementById("detail");
const refreshEl = document.getElementById("refresh");
const limitEl = document.getElementById("limit");
const reloadBtn = document.getElementById("reload");

let timer = null;
let activeId = null;

function fmtTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function chip(text, kind) {
  const c = document.createElement("span");
  c.className = `chip ${kind || ""}`.trim();
  c.textContent = text;
  return c;
}

function statusKind(status) {
  if (status === "completed") return "good";
  if (status === "running") return "warn";
  if (status === "failed" || status === "blocked") return "bad";
  return "";
}

async function fetchJson(url) {
  const res = await fetch(url);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: "invalid_json", raw: text };
  }
}

async function loadRuns() {
  const limit = Number(limitEl.value || 25);
  const data = await fetchJson(`/api/runs?limit=${limit}`);
  if (!data.ok) {
    runsEl.innerHTML = `<div class="run"><div class="small">Failed to load runs: ${data.error || "unknown"}</div></div>`;
    return;
  }

  const runs = data.runs || [];
  runsEl.innerHTML = "";

  if (!runs.length) {
    runsEl.innerHTML = `<div class="run"><div class="small">No runs yet. Create one via: <code>orchestrator run ...</code></div></div>`;
    return;
  }

  for (const run of runs) {
    const div = document.createElement("div");
    div.className = `run ${run.id === activeId ? "active" : ""}`.trim();
    div.addEventListener("click", () => selectRun(run.id));

    const top = document.createElement("div");
    top.className = "row";

    const left = document.createElement("div");
    left.innerHTML = `<div><strong>${run.intent || "(no intent)"}</strong></div><div class="small">${fmtTime(run.createdAt)}</div>`;

    const right = document.createElement("div");
    right.className = "small";
    right.textContent = run.id.slice(0, 8);

    top.appendChild(left);
    top.appendChild(right);

    const chips = document.createElement("div");
    chips.className = "chips";
    chips.appendChild(chip(run.status || "unknown", statusKind(run.status)));
    if (typeof run.confidence === "number") {
      chips.appendChild(chip(`conf ${run.confidence.toFixed(2)} (${run.confidenceTag || ""})`));
    }
    if (run.policy?.ok === false) chips.appendChild(chip("policy: blocked", "bad"));
    if (run.channelPolicy?.ok === false) chips.appendChild(chip("channel: blocked", "bad"));

    div.appendChild(top);
    div.appendChild(chips);

    runsEl.appendChild(div);
  }
}

async function selectRun(id) {
  activeId = id;
  await loadRuns();

  const data = await fetchJson(`/api/runs/${id}`);
  if (!data.ok) {
    detailEl.className = "detail";
    detailEl.textContent = `Failed to load run: ${data.error || "unknown"}`;
    return;
  }

  const run = data.run;
  const summary = {
    id: run.id,
    status: run.status,
    intent: run.intent,
    confidence: run.confidence,
    confidenceTag: run.confidenceTag,
    createdAt: run.createdAt,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    escalation: run.escalation,
    configSource: run.configSource,
    executionMode: run.executionMode,
    channelContext: run.channelContext,
    policy: run.policy,
    channelPolicy: run.channelPolicy,
    stages: run.stages
  };

  detailEl.className = "detail";
  detailEl.innerHTML = `
    <div class="chips" style="margin-bottom: 10px;">
      <span class="chip ${statusKind(run.status)}">${run.status || "unknown"}</span>
      <span class="chip">run ${run.id}</span>
    </div>
    <div class="small" style="margin-bottom: 10px;">Prompt:</div>
    <pre>${escapeHtml(run.prompt || "")}</pre>
    <div class="small" style="margin: 12px 0 8px;">Status / policy / audit</div>
    <pre>${escapeHtml(JSON.stringify(summary, null, 2))}</pre>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function setRefresh(ms) {
  if (timer) clearInterval(timer);
  timer = null;
  if (ms > 0) {
    timer = setInterval(async () => {
      const prev = activeId;
      await loadRuns();
      if (prev) {
        // keep details fresh if selected
        await selectRun(prev);
      }
    }, ms);
  }
}

reloadBtn.addEventListener("click", () => {
  loadRuns();
});

refreshEl.addEventListener("change", () => {
  setRefresh(Number(refreshEl.value || 0));
});

limitEl.addEventListener("change", () => {
  loadRuns();
});

(async function boot() {
  await loadRuns();
  setRefresh(Number(refreshEl.value || 0));
})();
