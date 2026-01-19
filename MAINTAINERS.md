# RaftStack Maintainers Guide

Internal documentation for the RaftStack development team.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Building](#building)
- [Local Testing](#local-testing)
- [Publishing to npm](#publishing-to-npm)
- [Release Process](#release-process)
- [Architecture Overview](#architecture-overview)
- [Adding New Features](#adding-new-features)

---

## Development Setup

### Prerequisites

- Node.js >= 18
- pnpm >= 9

### Initial Setup

```bash
# Clone the repository
git clone <repo-url>
cd raftstack

# Install dependencies
pnpm install

# Build the CLI
pnpm build

# Run tests
pnpm test:run
```

### Development Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Build the CLI (outputs to `dist/`) |
| `pnpm dev` | Build in watch mode |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |

---

## Project Structure

```
raftstack/
├── src/
│   ├── cli.ts                 # CLI entry point (Commander setup)
│   ├── index.ts               # Main exports
│   ├── commands/
│   │   ├── init.ts            # Main init command orchestration
│   │   └── setup-protection.ts # GitHub branch protection command
│   ├── generators/
│   │   ├── index.ts           # Re-exports all generators
│   │   ├── husky.ts           # Git hooks generation
│   │   ├── commitlint.ts      # Commitlint config generation
│   │   ├── cz-git.ts          # cz-git config generation
│   │   ├── lint-staged.ts     # lint-staged config generation
│   │   ├── branch-validation.ts # Branch naming rules
│   │   ├── pr-template.ts     # GitHub PR template
│   │   ├── github-workflows.ts # GitHub Actions workflows
│   │   ├── codeowners.ts      # CODEOWNERS file
│   │   ├── ai-review.ts       # AI review tool configs
│   │   ├── branch-protection.ts # Branch protection docs
│   │   ├── contributing.ts    # CONTRIBUTING.md generation
│   │   └── prettier.ts        # Prettier config
│   ├── prompts/
│   │   └── index.ts           # Interactive prompts (@clack/prompts)
│   ├── types/
│   │   └── config.ts          # TypeScript interfaces
│   └── utils/
│       ├── detect-project.ts  # Project type detection
│       ├── package-json.ts    # package.json manipulation
│       ├── file-system.ts     # File operations with backup
│       └── git.ts             # Git and gh CLI helpers
├── tests/
│   └── fixtures/              # Test fixture projects
├── dist/                      # Build output (generated)
├── tsconfig.json              # TypeScript configuration
├── tsup.config.ts             # Build configuration
├── vitest.config.ts           # Test configuration
└── package.json
```

---

## Running Tests

### Run All Tests

```bash
pnpm test:run
```

### Run Tests in Watch Mode

```bash
pnpm test
```

### Test Coverage

```bash
pnpm test:run --coverage
```

### Test Structure

Tests are located in `src/utils/__tests__/`:
- `detect-project.test.ts` - Project type detection tests
- `package-json.test.ts` - Package.json manipulation tests

Tests use temporary directories (`mkdtempSync`) to avoid conflicts between parallel test runs.

### Writing New Tests

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

let TEST_DIR: string;

describe("myFeature", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("should do something", async () => {
    // Test code here
  });
});
```

---

## Building

### Development Build

```bash
pnpm build
```

This outputs:
- `dist/cli.js` - Bundled CLI with shebang
- `dist/cli.d.ts` - TypeScript declarations
- `dist/cli.js.map` - Source maps

### Build Configuration

The build is configured in `tsup.config.ts`:
- **Format:** ESM only
- **Target:** Node.js 18
- **Features:** Automatic shebang injection, source maps, declarations

---

## Local Testing

### Test the CLI Locally

```bash
# Build first
pnpm build

# Run directly
node dist/cli.js --help
node dist/cli.js init
node dist/cli.js setup-protection

# Or link globally
pnpm link --global
raftstack --help
```

### Test in a Fresh Project

```bash
# Create a test project
mkdir /tmp/test-project
cd /tmp/test-project
npm init -y
git init

# Run the CLI from your development directory
node /path/to/raftstack/dist/cli.js init
```

### Test with pnpm dlx (simulates npm install)

```bash
# Pack the package
pnpm pack

# In a test project
pnpm dlx /path/to/raftstack-1.0.0.tgz init
```

---

## Publishing to npm

### Pre-publish Checklist

1. **Update version** in `package.json`
2. **Run all checks:**
   ```bash
   pnpm typecheck
   pnpm test:run
   pnpm build
   ```
3. **Test locally** in a fresh project
4. **Update CHANGELOG** (if you have one)
5. **Commit version bump:**
   ```bash
   git add -A
   git commit -m "chore: bump version to x.x.x"
   git tag vx.x.x
   ```

### Publish Commands

```bash
# Dry run (see what would be published)
pnpm publish --dry-run

# Publish to npm
pnpm publish --access public

# Push tags
git push --follow-tags
```

### npm Package Contents

The `files` field in `package.json` controls what gets published:
- `dist/` - Built CLI
- `templates/` - Template files (if used)

Verify with:
```bash
pnpm pack --dry-run
```

---

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backwards compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backwards compatible

### Release Steps

1. **Create release branch:**
   ```bash
   git checkout -b release/v1.2.0
   ```

2. **Update version:**
   ```bash
   npm version minor  # or major/patch
   ```

3. **Run full test suite:**
   ```bash
   pnpm typecheck && pnpm test:run && pnpm build
   ```

4. **Create PR and merge to main**

5. **Publish from main:**
   ```bash
   git checkout main
   git pull
   pnpm publish --access public
   git push --follow-tags
   ```

6. **Create GitHub release** with changelog notes

---

## Architecture Overview

### Data Flow

```
User runs `raftstack init`
         ↓
    CLI (cli.ts)
         ↓
    Init Command (commands/init.ts)
         ↓
    ┌────────────────────────────────┐
    │  Collect Config (prompts/)     │
    │  - Detect project type         │
    │  - Ask user preferences        │
    └────────────────────────────────┘
         ↓
    ┌────────────────────────────────┐
    │  Run Generators (generators/)  │
    │  - Each returns GeneratorResult│
    │  - Files created/modified      │
    └────────────────────────────────┘
         ↓
    Show summary and next steps
```

### Key Interfaces

```typescript
// Project configuration collected from user
interface RaftStackConfig {
  projectType: "nx" | "turbo" | "pnpm-workspace" | "single";
  asanaBaseUrl?: string;
  aiReviewTool: "coderabbit" | "copilot" | "none";
  codeowners: string[];
  usesTypeScript: boolean;
  usesEslint: boolean;
  usesPrettier: boolean;
}

// Result from each generator
interface GeneratorResult {
  created: string[];   // Files created
  modified: string[];  // Files modified
  skipped: string[];   // Files skipped (already exist)
  backedUp: string[];  // Files backed up
}
```

### Design Principles

1. **Generators are pure:** Each generator takes config and target directory, returns result
2. **Non-destructive by default:** Existing files are backed up before overwriting
3. **Project-type aware:** Configs adapt to NX, Turbo, pnpm workspaces
4. **Warnings not errors:** Asana task links use warning level (doesn't block commits)

---

## Adding New Features

### Adding a New Generator

1. **Create the generator file:**
   ```typescript
   // src/generators/my-feature.ts
   import type { GeneratorResult } from "../types/config.js";
   import { writeFileSafe } from "../utils/file-system.js";

   export async function generateMyFeature(
     targetDir: string,
     // ... other params
   ): Promise<GeneratorResult> {
     const result: GeneratorResult = {
       created: [],
       modified: [],
       skipped: [],
       backedUp: [],
     };

     // Generate files...

     return result;
   }
   ```

2. **Export from index:**
   ```typescript
   // src/generators/index.ts
   export { generateMyFeature } from "./my-feature.js";
   ```

3. **Add to init command:**
   ```typescript
   // src/commands/init.ts
   import { generateMyFeature } from "../generators/index.js";

   // In runInit():
   results.push(await generateMyFeature(targetDir, ...));
   ```

4. **Add tests:**
   ```typescript
   // src/generators/__tests__/my-feature.test.ts
   ```

### Adding a New Prompt

Edit `src/prompts/index.ts` and add your prompt function following the @clack/prompts patterns.

### Adding a New Command

1. Create `src/commands/my-command.ts`
2. Export the command function
3. Register in `src/cli.ts`:
   ```typescript
   program
     .command("my-command")
     .description("...")
     .action(async () => {
       await runMyCommand();
     });
   ```

---

## Troubleshooting

### Common Issues

**Build fails with TypeScript errors:**
```bash
pnpm typecheck  # See detailed errors
```

**Tests fail with timing issues:**
- Ensure tests use `mkdtempSync` for isolated directories
- Check for async/await issues

**CLI doesn't work after changes:**
```bash
pnpm build  # Rebuild
node dist/cli.js --help  # Test directly
```

### Debug Mode

Add console.log statements and run:
```bash
node dist/cli.js init 2>&1 | tee debug.log
```

---

## Contact

For questions about the codebase, reach out to the development team.
