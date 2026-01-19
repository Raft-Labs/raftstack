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

## Architecture

RaftStack is a CLI tool that sets up Git hooks, commit conventions, and GitHub integration. It uses Commander for CLI parsing, @clack/prompts for interactive UIs, and generates configuration files for various tools.

### Core Flow

1. **CLI entry** (`src/cli.ts`) - Commander-based command routing
2. **Commands** (`src/commands/`) - `init` and `setup-protection` command handlers
3. **Prompts** (`src/prompts/`) - Interactive configuration collection using @clack/prompts
4. **Generators** (`src/generators/`) - File generation for each tool (Husky, Commitlint, etc.)
5. **Utils** (`src/utils/`) - Shared utilities for file operations, project detection, git

### Generator Pattern

Each generator:
- Takes `targetDir` and tool-specific config parameters
- Returns a `GeneratorResult` with `created`, `modified`, `skipped`, and `backedUp` arrays
- Uses `writeFileSafe()` from `utils/file-system.ts` for safe file creation with backup support
- Hook content is inline as template strings (no external template files)

### Project Type Detection

The CLI auto-detects project type by checking for:
- `nx.json` → NX Monorepo
- `turbo.json` → Turborepo
- `pnpm-workspace.yaml` → pnpm Workspace
- Fallback → Single Package

This affects lint-staged and workflow configurations.

### Key Types

`RaftStackConfig` in `src/types/config.ts` holds all user configuration collected during init, including project type, Asana settings, AI review tool choice, and code quality tool detection.

## Testing

Tests use Vitest and create temporary directories for file system operations. Test files are co-located in `__tests__` folders within the relevant module directories.