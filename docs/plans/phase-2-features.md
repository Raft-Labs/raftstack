# Phase 2: Feature Completion

## Goal

Complete remaining features from [goal.md](../goal.md) that haven't been implemented yet.

## Success Criteria

- [x] All goal.md features implemented
- [x] Tests added for new features (199 tests)
- [x] Documentation updated

---

## Tasks

### 2.1 ESLint Generator (Optional)

**Note:** This is optional as many projects already have ESLint configured. The generator should be smart about existing configs.

#### Tasks

- [x] Create `src/generators/eslint.ts`:
  - Generate ESLint 9+ flat config
  - Include RaftLabs recommended rules
  - Handle TypeScript projects
  - Handle React projects (detect and add react plugin)
- [x] Add prompt for ESLint in init flow
- [x] Write tests for generator (14 tests)
- [x] Update documentation

#### Configuration Template

```javascript
// eslint.config.js (ESLint 9+ flat config)
import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      // RaftLabs recommended rules
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
```

#### Files to Create/Modify

| File | Change |
|------|--------|
| `src/generators/eslint.ts` | Create new generator |
| `src/generators/index.ts` | Export new generator |
| `src/commands/init.ts` | Add ESLint prompt and call |
| `src/prompts/index.ts` | Add ESLint configuration prompt |
| `src/generators/__tests__/eslint.test.ts` | Unit tests |

---

### 2.2 Enhanced Branch Protection

**Current State:** Basic branch protection for `main` branch only.

#### Tasks

- [x] Extend `setup-protection` to support multiple branches:
  - main
  - staging
  - production
  - development
- [x] Add merge strategy configuration:
  - Rebase merge (recommended)
  - Squash merge
  - Merge commit
- [x] Update prompts to ask for branch configuration
- [x] Add tests for new functionality

#### Enhanced Prompt Flow

```typescript
const branches = await multiselect({
  message: "Which branches need protection?",
  options: [
    { value: "main", label: "main", hint: "recommended" },
    { value: "staging", label: "staging" },
    { value: "production", label: "production" },
    { value: "development", label: "development" },
  ],
  required: true,
});

const mergeStrategy = await select({
  message: "Default merge strategy for PRs?",
  options: [
    { value: "rebase", label: "Rebase merge", hint: "recommended - clean history" },
    { value: "squash", label: "Squash merge", hint: "single commit per PR" },
    { value: "merge", label: "Merge commit", hint: "preserve all commits" },
  ],
});
```

#### Files to Modify

| File | Change |
|------|--------|
| `src/generators/setup-protection.ts` | Support multiple branches, merge strategy |
| `src/prompts/index.ts` | Add branch/merge prompts |
| `src/types/config.ts` | Update types for new options |
| `src/generators/__tests__/setup-protection.test.ts` | Add tests |

---

### 2.3 Review Current Generator Completeness

Before adding new features, review existing generators against goal.md requirements:

- [x] Verify `commitlint.config.js` has custom Asana task rule
- [x] Verify `.czrc` prompts for Asana task link
- [x] Verify `CONTRIBUTING.md` includes all conventions
- [x] Verify `pr-workflow.yml` includes all required checks

---

## Files Overview

| File | Status | Notes |
|------|--------|-------|
| `src/generators/eslint.ts` | New | ESLint 9+ flat config |
| `src/generators/setup-protection.ts` | Modify | Multi-branch support |
| `src/prompts/index.ts` | Modify | New prompts |
| `src/types/config.ts` | Modify | New types |

---

## Verification

```bash
# Run tests
pnpm test:run

# Manual verification
cd /tmp && mkdir test-features && cd test-features
pnpm init -y
pnpm dlx @raftlabs/raftstack init

# Verify new features work
```

---

## Dependencies

- Phase 1 should be complete (tests provide confidence for changes)
- Can start 2.3 review in parallel with Phase 1

---

## Estimated Effort

| Task | Effort |
|------|--------|
| 2.1 ESLint Generator | 2-3 hours |
| 2.2 Enhanced Branch Protection | 2-3 hours |
| 2.3 Review Completeness | 1-2 hours |

**Total:** ~5-8 hours

---

## Decision: ESLint Generator

**Question:** Should we implement the ESLint generator?

**Pros:**
- Complete feature set
- Consistent ESLint config across projects

**Cons:**
- Many projects have custom ESLint configs
- ESLint 9 migration is ongoing
- Could conflict with existing setups

**Recommendation:** Make it optional with a clear prompt. Detect existing `.eslintrc*` and `eslint.config.*` files and skip if present.

---

## Next Phase

Upon completion, proceed to [Phase 3: Pre-Release](./phase-3-pre-release.md)
