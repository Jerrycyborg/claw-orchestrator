import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { listRuns, getRun } from "./run-store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function startDashboard(options = {}) {
  const port = Number(options.port || process.env.ORCHESTRATOR_DASHBOARD_PORT || 3188);
  const app = express();

  app.get("/api/runs", (req, res) => {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 25)));
    const runs = listRuns(limit);
    res.json({ ok: true, limit, runs });
  });

  app.get("/api/runs/:id", (req, res) => {
    const run = getRun(req.params.id);
    if (!run) return res.status(404).json({ ok: false, error: "run_not_found" });
    res.json({ ok: true, run });
  });

  const dashboardDir = path.resolve(__dirname, "..", "dashboard");
  app.use(express.static(dashboardDir));

  app.get("/", (_req, res) => {
    res.sendFile(path.join(dashboardDir, "index.html"));
  });

  const server = app.listen(port, () => {
    console.log(JSON.stringify({ ok: true, dashboard: true, url: `http://localhost:${port}` }));
  });

  return { app, server, port };
}
