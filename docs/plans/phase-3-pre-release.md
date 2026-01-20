# Phase 3: Pre-Release Validation

## Goal

Final validation and documentation before releasing v1.0.0 to npm.

## Success Criteria

- [ ] Package works end-to-end on all project types
- [ ] Documentation complete and accurate
- [ ] v1.0.0 published to npm
- [ ] Global installation works

---

## Tasks

### 3.1 Manual Testing

Test RaftStack on real project scenarios to catch edge cases.

#### Test Matrix

| Project Type | Test Case | Status |
|--------------|-----------|--------|
| Fresh Next.js | `pnpm create next-app && raftstack init` | - |
| Fresh NX | `pnpm create nx-workspace && raftstack init` | - |
| Existing project | Project with partial config (some hooks exist) | - |
| Turbo monorepo | `pnpm create turbo && raftstack init` | - |

#### Test Checklist Per Project

- [ ] `raftstack init` completes without errors
- [ ] All expected files created
- [ ] Existing files backed up (not overwritten)
- [ ] `package.json` scripts added correctly
- [ ] `devDependencies` added correctly
- [ ] Git hooks work:
  - [ ] `pre-commit` runs lint-staged
  - [ ] `commit-msg` validates commit message
  - [ ] `pre-push` runs build check
- [ ] Branch name validation works
- [ ] `pnpm commit` interactive flow works
- [ ] Claude Code skills copied to `.claude/skills/`

#### Edge Cases to Test

- [ ] Project with no `package.json`
- [ ] Project with existing `.husky/` directory
- [ ] Project with existing `commitlint.config.js`
- [ ] Non-git directory
- [ ] Read-only filesystem (should fail gracefully)

---

### 3.2 Documentation

#### Tasks

- [ ] Update `README.md`:
  - [ ] Clear installation instructions
  - [ ] Feature list with examples
  - [ ] Configuration options
  - [ ] Troubleshooting section
- [ ] Create `CHANGELOG.md`:
  - [ ] v1.0.0 initial release notes
  - [ ] Feature summary
  - [ ] Breaking changes (none for v1.0.0)
- [ ] Review `CONTRIBUTING.md` template (the one we generate)
- [ ] Add inline code comments where needed

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

- [ ] All tests passing
- [ ] CI workflow passing
- [ ] Documentation complete
- [ ] Version number correct in `package.json`
- [ ] `CHANGELOG.md` updated

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

- [ ] Package visible on npm
- [ ] `pnpm dlx @raftlabs/raftstack init` works
- [ ] All files included in package
- [ ] No console errors or warnings

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
