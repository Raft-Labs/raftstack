# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build the CLI
pnpm build

# Watch mode for development
pnpm dev

# Type checking
pnpm typecheck

# Run tests (watch mode)
pnpm test

# Run tests once
pnpm test:run

# Run a single test file
pnpm test src/utils/__tests__/detect-project.test.ts
```

## Project Context

RaftStack is part of a developer framework standardization initiative for RaftLabs (30+ developers). The goal is to enforce consistent Git workflows, commit conventions, and code quality across all projects. See `docs/goal.md` for the complete strategy.

This repository has two components:
1. **CLI tool** (`@raftlabs/raftstack`) - Sets up Git hooks, commit conventions, and GitHub integration
2. **Claude Code skills** (`.claude/skills/`) - AI-assisted code quality enforcement for React, backend, database, SEO, and general code quality

## Architecture

### Core Flow

```
cli.ts (Commander)
    ↓
commands/init.ts
    ├─→ utils/git.ts          (repo validation)
    ├─→ prompts/index.ts      (user config via @clack/prompts)
    │       ↓
    │   utils/detect-project.ts (auto-detect NX/Turbo/pnpm/single)
    │
    ├─→ generators/*.ts       (12 generators, each returns GeneratorResult)
    │       ↓
    │   utils/file-system.ts  (writeFileSafe with backup)
    │
    └─→ utils/package-json.ts (merge scripts & devDependencies)
```

### Generator Pattern

Each generator in `src/generators/`:
- Takes `targetDir` and tool-specific config parameters
- Returns a `GeneratorResult` with `created`, `modified`, `skipped`, and `backedUp` arrays
- Uses `writeFileSafe()` from `utils/file-system.ts` for safe file creation with backup support
- Content is inline as template strings (no external template files)

To add a new generator:
1. Create `src/generators/new-tool.ts` exporting `generateNewTool(targetDir, ...config): Promise<GeneratorResult>`
2. Export from `src/generators/index.ts`
3. Call in `src/commands/init.ts` and add result to `results` array

### Project Type Detection

The CLI auto-detects project type in `utils/detect-project.ts`:
- `nx.json` → NX Monorepo
- `turbo.json` → Turborepo
- `pnpm-workspace.yaml` → pnpm Workspace
- Fallback → Single Package

Detection also checks for existing tools: `hasTypeScript()`, `hasEslint()`, `hasPrettier()`.

### Key Types

`src/types/config.ts` defines:
- `RaftStackConfig` - User configuration from prompts
- `GeneratorResult` - Standard return type for all generators
- `DetectionResult` - Project type with confidence level
- `ProjectType` - "nx" | "turbo" | "pnpm-workspace" | "single"
- `AIReviewTool` - "coderabbit" | "copilot" | "none"

### Package.json Utilities

`utils/package-json.ts` provides:
- `mergeScripts(pkg, scripts, overwrite)` - Add scripts without clobbering
- `mergeDevDependencies(pkg, deps)` - Add devDependencies
- `RAFTSTACK_DEV_DEPENDENCIES` - Standard deps installed in target projects

## Claude Code Skills

Five skills in `.claude/skills/` enforce RaftLabs coding standards when using Claude Code:

| Skill | Purpose |
|-------|---------|
| `react` | React 19+ patterns, SOLID components, performance optimization |
| `backend` | Clean architecture for serverless/Hono/Express backends |
| `database` | PostgreSQL/Drizzle ORM schema design and indexing |
| `seo` | Technical SEO for Next.js/React applications |
| `code-quality` | Universal readability rules (30-line functions, naming, etc.) |

These skills are bundled with RaftStack and copied to target projects during init.

## Testing

Tests use Vitest with temporary directories for file system isolation. Test files are co-located in `__tests__` folders.

Pattern:
```typescript
beforeEach(() => {
  TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
});
afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});
```