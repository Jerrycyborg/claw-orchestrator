# Research Notes (Security & Orchestration)

_Last updated: 2026-02-23_

## Sources reviewed

1. OpenClaw Security docs
   - URL: https://docs.openclaw.ai/security
   - Notes:
     - recommends regular `openclaw security audit`
     - emphasizes least-privilege defaults
     - warns about trust boundaries and shared operators

2. Model Context Protocol intro
   - URL: https://modelcontextprotocol.io
   - Notes:
     - MCP defines standard interfaces for model-to-tool/data connections
     - useful reference for clean capability boundaries in orchestrator design

3. OWASP Top 10 (2025)
   - URL: https://owasp.org/www-project-top-ten/
   - Notes:
     - keep security controls aligned with common app risk categories
     - use as checklist lens for policy gate design and CI scanning

## Project updates based on research

- Added prompt policy gate for potential secrets/PII patterns.
- Added sensitive action approval requirement (`--approve-sensitive`).
- Positioned security scanning and least-privilege behavior as first-class design defaults.
