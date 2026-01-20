# Phase 0: Stabilization

> Priority: **HIGH** - Must complete before any other phase

## Goal

Ensure existing code is production-ready and skills are bundled correctly in the npm package.

## Success Criteria

- [ ] Skills included in `npm pack` output
- [ ] CI passes on all PRs
- [ ] Beta version installable from npm

---

## Tasks

### 0.1 Fix Skills Bundling

**Problem:** Skills exist in `.claude/skills/` but won't be included in the npm package because they're not listed in `package.json` files array.

#### Tasks

- [ ] Add `.claude/` to `package.json` files array
- [ ] Create `src/generators/claude-skills.ts`:
  - Copy `.claude/skills/` to target project
  - Handle existing `.claude/` directory
  - Return `GeneratorResult` with created/modified files
- [ ] Export from `src/generators/index.ts`
- [ ] Integrate into `src/commands/init.ts`
- [ ] Verify with `pnpm pack:test`

#### Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add `.claude/` to `files` array |
| `src/generators/claude-skills.ts` | Create new generator |
| `src/generators/index.ts` | Export new generator |
| `src/commands/init.ts` | Call generator in init flow |

#### Verification

```bash
# Pack and inspect contents
pnpm pack
tar -tzf raftlabs-raftstack-*.tgz | grep ".claude"

# Should show:
# package/.claude/skills/react.md
# package/.claude/skills/backend.md
# package/.claude/skills/database.md
# package/.claude/skills/seo.md
# package/.claude/skills/code-quality.md
```

---

### 0.2 Add CI Workflow

**Problem:** Only `publish.yml` exists. PRs don't run type checking or tests.

#### Tasks

- [ ] Create `.github/workflows/ci.yml`:
  - Trigger: PR to main
  - Jobs: typecheck, test, build
  - Node version: 20
- [ ] Test workflow passes

#### File to Create

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm test:run
      - run: pnpm build
```

#### Verification

1. Create PR with the ci.yml file
2. Verify workflow triggers
3. All checks pass

---

### 0.3 Validate Publishing

**Problem:** Need to verify the package can be published and installed.

#### Prerequisites

- NPM_TOKEN secret configured in GitHub repository settings

#### Tasks

- [ ] Verify NPM_TOKEN is configured
- [ ] Publish beta version: `v1.0.0-beta.1`
- [ ] Test installation works

#### Verification

```bash
# Publish beta
pnpm version prerelease --preid=beta
git push --follow-tags
# Wait for publish workflow

# Test in new directory
cd /tmp
mkdir test-raftstack && cd test-raftstack
pnpm init -y
pnpm dlx @raftlabs/raftstack@beta init

# Verify skills were copied
ls -la .claude/skills/
```

---

## Dependencies

None - this is the first phase.

---

## Estimated Effort

| Task | Effort |
|------|--------|
| 0.1 Fix Skills Bundling | 2-3 hours |
| 0.2 Add CI Workflow | 30 min |
| 0.3 Validate Publishing | 1 hour |

**Total:** ~4-5 hours

---

## Next Phase

Upon completion, proceed to [Phase 1: Testing](./phase-1-testing.md)
