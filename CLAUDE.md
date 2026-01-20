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

### Package Manager Detection

The CLI auto-detects package manager from lockfiles in `utils/detect-package-manager.ts`:

```
commands/init.ts → prompts/index.ts
    ↓
utils/detect-package-manager.ts
    ├─→ detectPackageManager(targetDir)
    │   • Priority: pnpm-lock.yaml > yarn.lock > package-lock.json
    │   • Returns PackageManagerInfo or null
    │
    ├─→ detectYarnVersion(targetDir)
    │   • Reads packageManager field from package.json
    │   • Distinguishes Yarn 1.x vs Yarn 2+ (Berry)
    │
    └─→ getPackageManagerInfo(name)
        • Returns metadata for npm/pnpm/yarn/yarn-berry
        • Commands: install, run, exec, installFrozen
        • Flags: needsSetupAction (pnpm only)
```

**Package Manager Metadata:**

Each PM has specific commands and settings in `PACKAGE_MANAGERS` constant:
- `install` - Regular install command (e.g., "npm install")
- `run` - Script runner (e.g., "npm run", "pnpm", "yarn")
- `exec` - Execute binaries (e.g., "npx", "pnpm dlx", "yarn dlx")
- `installFrozen` - Frozen/immutable install for CI (e.g., "npm ci", "pnpm install --frozen-lockfile")
- `needsSetupAction` - Whether GitHub Actions needs setup step (true for pnpm only)
- `lockfile` - Lockfile name (e.g., "package-lock.json")
- `cacheKey` - Cache key pattern for GitHub Actions

**Workflow:**
1. `detectPackageManager()` scans for lockfiles
2. If `yarn.lock` found, call `detectYarnVersion()` to check Yarn version
3. If no lockfile, user is prompted to select via `promptPackageManager()`
4. Selected PM is stored in `config.packageManager` (type: `PackageManagerInfo`)
5. Generators receive PM parameter and use it to customize commands

**Files Using Package Manager:**
- `generators/husky.ts` - Hooks use `pm.exec` for running tools
- `generators/github-workflows.ts` - CI uses `pm.installFrozen` and conditionally adds pnpm setup
- `generators/contributing.ts` - Docs show `pm.install` and `pm.run` commands
- `generators/quick-reference.ts` - Quick reference shows PM-specific commands

### Key Types

`src/types/config.ts` defines:
- `RaftStackConfig` - User configuration from prompts (includes `packageManager: PackageManagerInfo`)
- `GeneratorResult` - Standard return type for all generators
- `DetectionResult` - Project type with confidence level
- `ProjectType` - "nx" | "turbo" | "pnpm-workspace" | "single"
- `PackageManager` - "npm" | "pnpm" | "yarn" | "yarn-berry"
- `PackageManagerInfo` - Metadata for package manager (commands, flags, lockfile)
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