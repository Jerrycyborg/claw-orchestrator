# Tech Decisions

## Why currently JavaScript?
- Fast iteration while proving orchestration behavior.
- Lower setup friction for early prototype.

## Why move to TypeScript next?
- Better safety for evolving orchestration state models.
- Cleaner contracts for adapters and policy engines.
- Easier long-term maintenance.

## Migration plan
1. Introduce TS config + build target.
2. Migrate core modules first (`types`, `router`, `executor`).
3. Keep CLI compatibility.
4. Enable CI type-check gate.
