#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const IGNORE_DIRS = new Set([".git", "node_modules", "dist"]);
const TARGET_EXT = new Set([".js", ".mjs", ".cjs", ".json", ".md", ".yml", ".yaml", ".env", ".ts"]);

const PATTERNS = [
  { name: "generic-secret", re: /(?:api[_-]?key|secret|token|password)\s*[:=]\s*[^\s"']+/i },
  { name: "openai-key", re: /sk-[a-zA-Z0-9]{20,}/ },
  { name: "github-token", re: /ghp_[a-zA-Z0-9]{20,}/ },
  { name: "private-key", re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ }
];

const SAFE_SNIPPETS = [
  "process.env.",
  "secrets.",
  "secret:scan",
  "OPENCLAW_API_TOKEN",
  "<your_",
  "api_key=dummy_secret_value",
  "api_key=test_secret_value"
];

const findings = [];
walk(ROOT);

if (findings.length) {
  console.error("Secret scan failed. Potential secrets found:");
  for (const f of findings) {
    console.error(`- ${f.file}:${f.line} [${f.pattern}] ${f.sample}`);
  }
  process.exit(1);
}

console.log("Secret scan passed ✅");

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      walk(p);
      continue;
    }

    if (!TARGET_EXT.has(path.extname(entry.name)) && entry.name !== ".env.example") continue;

    const text = fs.readFileSync(p, "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, i) => {
      for (const pat of PATTERNS) {
        const isSafeContext = SAFE_SNIPPETS.some((s) => line.includes(s));
        if (pat.re.test(line) && !line.includes("example") && !isSafeContext) {
          findings.push({
            file: path.relative(ROOT, p),
            line: i + 1,
            pattern: pat.name,
            sample: line.trim().slice(0, 140)
          });
        }
      }
    });
  }
}
