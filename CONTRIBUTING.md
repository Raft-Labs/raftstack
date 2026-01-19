# Contributing to RaftStack

Thank you for your interest in contributing to RaftStack! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9
- Git

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/raftstack.git
cd raftstack

# Install dependencies
pnpm install

# Build the CLI
pnpm build

# Run tests to verify setup
pnpm test:run
```

## Development Workflow

### Branch Naming

Create branches following this convention:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/add-yarn-support` |
| `fix/` | Bug fixes | `fix/nx-detection` |
| `docs/` | Documentation | `docs/update-readme` |
| `refactor/` | Code refactoring | `refactor/generator-utils` |
| `test/` | Test additions | `test/prompts-coverage` |

### Making Changes

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and ensure:
   - TypeScript compiles without errors: `pnpm typecheck`
   - All tests pass: `pnpm test:run`
   - Build succeeds: `pnpm build`

3. **Test locally** in a fresh project:
   ```bash
   mkdir /tmp/test-project && cd /tmp/test-project
   npm init -y && git init
   node /path/to/raftstack/dist/cli.js init
   ```

4. **Commit your changes** following Conventional Commits:
   ```bash
   git commit -m "feat(generators): add support for yarn workspaces"
   ```

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Scopes:** `cli`, `generators`, `prompts`, `utils`, `types`, `docs`

**Examples:**
```bash
feat(generators): add ESLint flat config support
fix(utils): handle missing package.json gracefully
docs(readme): add troubleshooting section
test(detect-project): add pnpm workspace tests
```

## Pull Request Process

1. **Update documentation** if you've changed functionality
2. **Add tests** for new features
3. **Ensure CI passes** (typecheck, tests, build)
4. **Fill out the PR template** completely
5. **Request review** from maintainers

### PR Title Format

Use the same format as commits:
```
feat(generators): add support for Bun
```

## Project Structure

```
src/
├── cli.ts              # CLI entry point
├── commands/           # CLI commands (init, setup-protection)
├── generators/         # Config file generators
├── prompts/            # Interactive prompts
├── types/              # TypeScript interfaces
└── utils/              # Utility functions
```

### Key Files

| File | Purpose |
|------|---------|
| `src/cli.ts` | Commander setup, command registration |
| `src/commands/init.ts` | Main init orchestration |
| `src/prompts/index.ts` | @clack/prompts interactive flow |
| `src/generators/*.ts` | Individual config generators |
| `src/types/config.ts` | Shared TypeScript interfaces |

## Adding Features

### Adding a New Generator

1. Create `src/generators/my-feature.ts`:
   ```typescript
   import type { GeneratorResult } from "../types/config.js";
   import { writeFileSafe } from "../utils/file-system.js";

   export async function generateMyFeature(
     targetDir: string
   ): Promise<GeneratorResult> {
     const result: GeneratorResult = {
       created: [],
       modified: [],
       skipped: [],
       backedUp: [],
     };

     // Your generation logic here

     return result;
   }
   ```

2. Export from `src/generators/index.ts`

3. Call from `src/commands/init.ts`

4. Add tests in `src/generators/__tests__/`

### Adding a New Prompt

Add to `src/prompts/index.ts` using [@clack/prompts](https://github.com/natemoo-re/clack):

```typescript
import * as p from "@clack/prompts";

const answer = await p.select({
  message: "Choose an option:",
  options: [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ],
});
```

## Testing

### Run Tests

```bash
# Run once
pnpm test:run

# Watch mode
pnpm test

# With coverage
pnpm test:run --coverage
```

### Writing Tests

Tests use [Vitest](https://vitest.dev/) and temporary directories:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let TEST_DIR: string;

describe("myFeature", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("should work", async () => {
    // Test implementation
  });
});
```

## Code Style

- **TypeScript:** Strict mode enabled
- **Formatting:** Follow existing patterns (no Prettier in this repo)
- **Imports:** Use `.js` extension for local imports (ESM)
- **Naming:** camelCase for functions, PascalCase for types

## Getting Help

- **Questions:** Open a GitHub Discussion
- **Bugs:** Open a GitHub Issue with reproduction steps
- **Security:** Email maintainers directly (do not open public issues)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
