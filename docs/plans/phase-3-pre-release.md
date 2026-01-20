# Phase 3: Pre-Release Validation

## Goal

Final validation and documentation before releasing v1.0.0 to npm.

## Success Criteria

- [x] Package works end-to-end on all project types (15 E2E tests)
- [x] Documentation complete and accurate
- [x] v1.2.0 released (automated via GitHub Actions)
- [ ] npm publish (requires NPM_TOKEN secret)

---

## Tasks

### 3.1 Manual Testing

Test RaftStack on real project scenarios to catch edge cases.

#### Test Matrix

| Project Type | Test Case | Status |
|--------------|-----------|--------|
| Fresh Next.js | `pnpm create next-app && raftstack init` | ✅ E2E tested |
| Fresh NX | `pnpm create nx-workspace && raftstack init` | ✅ E2E tested |
| Existing project | Project with partial config (some hooks exist) | ✅ E2E tested |
| Turbo monorepo | `pnpm create turbo && raftstack init` | ✅ E2E tested |

#### Test Checklist Per Project

- [x] `raftstack init` completes without errors
- [x] All expected files created
- [x] Existing files backed up (not overwritten)
- [x] `package.json` scripts added correctly
- [x] `devDependencies` added correctly
- [x] Git hooks work:
  - [x] `pre-commit` runs lint-staged
  - [x] `commit-msg` validates commit message
  - [x] `pre-push` runs build check
- [x] Branch name validation works
- [x] `pnpm commit` interactive flow works
- [x] Claude Code skills copied to `.claude/skills/`

#### Edge Cases to Test

- [x] Project with no `package.json` (handled gracefully)
- [x] Project with existing `.husky/` directory (backup behavior)
- [x] Project with existing `commitlint.config.js` (backup behavior)
- [x] Non-git directory (validated in E2E)
- [x] Idempotency (running init twice)

---

### 3.2 Documentation

#### Tasks

- [x] Update `README.md`:
  - [x] Clear installation instructions
  - [x] Feature list with examples
  - [x] Configuration options
  - [x] Troubleshooting section
- [x] Create `CHANGELOG.md`:
  - [x] v1.0.0 initial release notes
  - [x] v1.2.0 auto-generated changelog
  - [x] Feature summary
- [x] Review `CONTRIBUTING.md` template (the one we generate)
- [x] Add inline code comments where needed

#### README Structure

```markdown
# RaftStack

> Enforce consistent Git workflows and code quality across your projects

## Features
- Git hooks (husky)
- Commit conventions (commitlint + cz-git)
- Branch naming validation
- PR templates and workflows
- Claude Code skills for AI-assisted development

## Installation
\`\`\`bash
pnpm dlx @raftlabs/raftstack init
\`\`\`

## What Gets Generated
[List of files]

## Configuration Options
[Options during init]

## Troubleshooting
[Common issues and solutions]
```

---

### 3.3 Release

#### Pre-Release Checklist

- [x] All tests passing (199 tests)
- [x] CI workflow passing
- [x] Documentation complete
- [x] Version number correct in `package.json` (v1.2.0)
- [x] `CHANGELOG.md` updated (auto-generated)

#### Release Steps

```bash
# 1. Final verification
pnpm typecheck
pnpm test:run
pnpm build

# 2. Version bump
pnpm version 1.0.0

# 3. Push with tags (triggers publish workflow)
git push --follow-tags

# 4. Verify on npm
npm view @raftlabs/raftstack

# 5. Test installation
cd /tmp && mkdir final-test && cd final-test
pnpm init -y
pnpm dlx @raftlabs/raftstack init
```

#### Post-Release Verification

- [ ] Package visible on npm (requires NPM_TOKEN)
- [ ] `pnpm dlx @raftlabs/raftstack init` works (requires publish)
- [x] All files included in package (verified with pnpm pack)
- [x] No console errors or warnings

---

## Files to Create/Modify

| File | Change |
|------|--------|
| `README.md` | Update with final documentation |
| `CHANGELOG.md` | Create with v1.0.0 notes |
| `package.json` | Version bump to 1.0.0 |

---

## Verification

```bash
# Full verification suite
pnpm typecheck && pnpm test:run && pnpm build

# Pack and inspect
pnpm pack
tar -tzf raftlabs-raftstack-1.0.0.tgz

# Should include:
# - All src/ compiled files
# - .claude/skills/*.md
# - README.md
# - package.json
```

---

## Dependencies

- Phase 0, 1, 2 must be complete
- All tests passing
- CI workflow functional

---

## Estimated Effort

| Task | Effort |
|------|--------|
| 3.1 Manual Testing | 2-3 hours |
| 3.2 Documentation | 1-2 hours |
| 3.3 Release | 30 min |

**Total:** ~4-6 hours

---

## Rollback Plan

If critical issues are found after release:

1. Publish patch: `pnpm version patch && git push --follow-tags`
2. Or deprecate version: `npm deprecate @raftlabs/raftstack@1.0.0 "Critical bug, use 1.0.1"`

---

## Next Phase

Upon successful release, proceed to [Phase 4: Pilot](./phase-4-pilot.md)
