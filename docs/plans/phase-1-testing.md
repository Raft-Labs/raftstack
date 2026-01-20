# Phase 1: Testing Expansion

## Goal

Achieve comprehensive test coverage for confidence in changes and refactoring.

## Success Criteria

- [ ] Test coverage > 80%
- [ ] All 13 generators have unit tests
- [ ] E2E tests pass for all 4 project types (NX, Turbo, pnpm-workspace, single)

---

## Tasks

### 1.1 Generator Unit Tests

**Current State:** Only 2 test files exist (~30 tests total)

#### Tasks

- [ ] Create test file for each generator:
  - [ ] `src/generators/__tests__/husky.test.ts`
  - [ ] `src/generators/__tests__/commitlint.test.ts`
  - [ ] `src/generators/__tests__/lint-staged.test.ts`
  - [ ] `src/generators/__tests__/prettier.test.ts`
  - [ ] `src/generators/__tests__/czrc.test.ts`
  - [ ] `src/generators/__tests__/validate-branch-name.test.ts`
  - [ ] `src/generators/__tests__/pr-template.test.ts`
  - [ ] `src/generators/__tests__/codeowners.test.ts`
  - [ ] `src/generators/__tests__/pr-workflow.test.ts`
  - [ ] `src/generators/__tests__/ai-review.test.ts`
  - [ ] `src/generators/__tests__/contributing.test.ts`
  - [ ] `src/generators/__tests__/setup-protection.test.ts`
  - [ ] `src/generators/__tests__/claude-skills.test.ts`

#### Test Coverage Per Generator

Each generator test should cover:

1. **File creation** - Correct files created with correct content
2. **File permissions** - Executable files have correct permissions (husky hooks)
3. **Project type variations** - Different output for NX vs Turbo vs single
4. **Existing file handling** - Backup behavior when files exist
5. **Return value** - Correct `GeneratorResult` shape

#### Test Pattern

```typescript
import { beforeEach, afterEach, describe, it, expect } from "vitest";
import { mkdtempSync, rmSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { generateXxx } from "../xxx";

describe("generateXxx", () => {
  let TEST_DIR: string;

  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("creates expected files", async () => {
    const result = await generateXxx(TEST_DIR);
    expect(result.created).toContain("path/to/file");
  });

  // More tests...
});
```

---

### 1.2 Integration Tests

#### Tasks

- [ ] Create `src/__tests__/integration/init-flow.test.ts`:
  - Test full init flow with mocked prompts
  - Test file conflict handling (backup/skip)
  - Test package.json merging
- [ ] Create `src/__tests__/integration/setup-protection.test.ts`:
  - Mock `gh` CLI calls
  - Test API response handling
  - Test error scenarios

#### Mocking Strategy

```typescript
// Mock @clack/prompts
vi.mock("@clack/prompts", () => ({
  text: vi.fn(),
  select: vi.fn(),
  multiselect: vi.fn(),
  confirm: vi.fn(),
  // Return predictable values
}));

// Mock gh CLI
vi.mock("child_process", () => ({
  execSync: vi.fn((cmd) => {
    if (cmd.includes("gh api")) {
      return JSON.stringify({ /* mock response */ });
    }
  }),
}));
```

---

### 1.3 E2E Tests

#### Tasks

- [ ] Create test fixtures directory: `test/fixtures/`
  - [ ] `test/fixtures/nx-project/` - Minimal NX workspace
  - [ ] `test/fixtures/turbo-project/` - Minimal Turborepo
  - [ ] `test/fixtures/pnpm-workspace/` - pnpm workspace
  - [ ] `test/fixtures/single-project/` - Single package project
- [ ] Create `test/e2e/init.test.ts`:
  - Copy fixture to temp directory
  - Run `raftstack init` programmatically
  - Verify all expected files created
  - Verify hooks are executable
  - Verify package.json updated correctly

#### Fixture Structure

```
test/fixtures/nx-project/
├── nx.json
├── package.json
├── tsconfig.base.json
└── apps/
    └── web/
        └── package.json

test/fixtures/turbo-project/
├── turbo.json
├── package.json
└── packages/
    └── ui/
        └── package.json
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/generators/__tests__/*.test.ts` | 13 generator unit test files |
| `src/__tests__/integration/init-flow.test.ts` | Init command integration tests |
| `src/__tests__/integration/setup-protection.test.ts` | GitHub protection tests |
| `test/fixtures/*/` | 4 project type fixtures |
| `test/e2e/init.test.ts` | End-to-end tests |

---

## Verification

```bash
# Run all tests with coverage
pnpm test:run --coverage

# Verify coverage > 80%
# Check coverage report in coverage/index.html
```

---

## Dependencies

- Phase 0 must be complete (skills generator needs tests)

---

## Estimated Effort

| Task | Effort |
|------|--------|
| 1.1 Generator Unit Tests | 4-6 hours |
| 1.2 Integration Tests | 2-3 hours |
| 1.3 E2E Tests | 2-3 hours |

**Total:** ~8-12 hours

---

## Next Phase

Upon completion, proceed to [Phase 2: Features](./phase-2-features.md)
