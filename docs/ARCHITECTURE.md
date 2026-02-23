# Architecture (Draft)

## Components
1. Intent Classifier
2. Routing Engine
3. Role Executors
4. Handoff Manager (AAHP)
5. Policy Engine
6. Run Logger

## Default Pipeline
- Researcher -> Architect -> Implementer -> Reviewer
- Ops joins when prompt is deployment/security/config heavy.

## Execution Modes
- Stateless mode (current default)
- Persistent role session mode (when channel thread hooks are available)
