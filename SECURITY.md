# SECURITY.md

## Security Policy

This project must never store personal data, credentials, API keys, tokens, or secrets in Git.

### Reporting a security issue
If you discover a vulnerability:
1. Do not post it publicly in issues.
2. Report privately to the project owner.
3. Include reproduction steps and impact.

### Minimum security controls
- Use `.gitignore` for local secret files
- Run secret scanning before push/merge
- Keep dependencies updated
- Enforce review for security-sensitive changes
