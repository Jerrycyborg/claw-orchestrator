#!/usr/bin/env node
/**
 * Generate config/roles/<role>.md from skills/claw-<role>/SKILL.md.
 *
 * The skill files are the single source of truth for role behaviour. The Node
 * path (src/adapters/openclaw-adapter.js -> loadRoleTemplate) reads the
 * generated templates, so both paths run the same instructions.
 *
 *   node scripts/gen-role-prompts.js           regenerate
 *   node scripts/gen-role-prompts.js --check   exit 1 if regenerating would change anything
 *
 * Placeholders honoured by renderTemplate(): {role} {prompt} {intent} {runId}
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROLES = ["researcher", "architect", "implementer", "reviewer", "ops"];
const BANNER =
  "<!-- GENERATED FILE — do not edit.\n" +
  "     Source: skills/claw-<role>/SKILL.md\n" +
  "     Regenerate: npm run roles:gen -->";

function titleCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Strip YAML frontmatter and the H1, which the template header replaces. */
/** Strip YAML frontmatter, the H1, and skill-path-only lines. */
function body(md) {
  let t = md.replace(/^---\n[\s\S]*?\n---\n/, "").trimStart();
  // H1 title — the generated header states the role already.
  t = t.replace(/^#[^\n]*\n/, "").trimStart();
  // "The X role from `config/orchestrator.yaml`. Runtime-free ..." — the Node
  // path IS the runtime, so the note is wrong here. Also its claw-run variant.
  t = t.replace(/^The \w+ role from `config\/orchestrator\.yaml`\.[^\n]*\n/m, "");
  t = t.replace(/^Coordinates the five claw roles[\s\S]*?no orchestrator process\.\n/m, "");
  // references/ does not exist on the Node path; the gates are inlined below.
  t = t.replace(/^\*\*Read `references\/data-handling\.md`[^\n]*\n/m, "");
  t = t.replace(/^Full detail: `references\/data-handling\.md`\.\n/m, "");
  return t.replace(/\n{3,}/g, "\n\n").trim();
}

function render(role) {
  const src = path.join(ROOT, "skills", `claw-${role}`, "SKILL.md");
  if (!fs.existsSync(src)) throw new Error(`missing source skill: ${src}`);
  const header = [
    BANNER,
    "",
    `You are the ${titleCase(role)} role.`,
    "",
    "Run ID: {runId}",
    "Intent: {intent}",
    "",
    "User prompt:",
    "{prompt}",
    "",
    "---",
    ""
  ].join("\n");
  return `${header}\n${body(fs.readFileSync(src, "utf8"))}\n`;
}

const check = process.argv.includes("--check");
let changed = [];

for (const role of ROLES) {
  const dest = path.join(ROOT, "config", "roles", `${role}.md`);
  const next = render(role);
  const prev = fs.existsSync(dest) ? fs.readFileSync(dest, "utf8") : null;
  if (prev === next) continue;
  changed.push(path.relative(ROOT, dest));
  if (!check) fs.writeFileSync(dest, next);
}

if (check) {
  if (changed.length) {
    console.error("Role templates are stale — regenerate with: npm run roles:gen");
    for (const f of changed) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log("Role templates match their source skills ✅");
} else {
  console.log(
    changed.length
      ? `Regenerated ${changed.length} role template(s):`
      : "Role templates already current."
  );
  for (const f of changed) console.log(`  ${f}`);
}
