# RaftStack Progress Tracking

> Live progress tracking for RaftStack implementation

## Phase Status

| Phase | Status | Started | Completed |
|-------|--------|---------|-----------|
| 0 - Stabilization | In Progress | 2026-01-20 | - |
| 1 - Testing | Not Started | - | - |
| 2 - Features | Not Started | - | - |
| 3 - Pre-Release | Not Started | - | - |
| 4 - Pilot | Not Started | - | - |
| 5 - Org Rollout | Not Started | - | - |

---

## Current Phase: 0 - Stabilization

> See [Phase 0 Plan](./plans/phase-0-stabilization.md) for full details

### 0.1 Fix Skills Bundling

- [x] Add `.claude/skills` to package.json `files` array
- [x] Create `src/generators/claude-skills.ts` to copy skills to target projects
- [x] Export from `src/generators/index.ts`
- [x] Integrate into `src/commands/init.ts`
- [x] Verify with `pnpm pack` - confirmed 5 skill files bundled

### 0.2 Add CI Workflow

- [x] Create `.github/workflows/ci.yml`
- [ ] Test workflow passes on PR (pending push to remote)

### 0.3 Validate Publishing

- [ ] Ensure NPM_TOKEN secret configured in GitHub
- [ ] Publish beta: `v1.0.0-beta.1`
- [ ] Test: `pnpm dlx @raftlabs/raftstack@beta init`

---

## Completed Items

### Phase 0

- **0.1 Skills Bundling** - Complete (2026-01-20)
  - Created `src/generators/claude-skills.ts` generator
  - Added to package.json files array
  - Integrated into init command
  - Verified with pnpm pack

- **0.2 CI Workflow** - Partially Complete (2026-01-20)
  - Created `.github/workflows/ci.yml`
  - Runs typecheck, test:run, build on PR/push to main
  - Pending: validation on actual PR

---

## Blockers & Issues

| Issue | Description | Status |
|-------|-------------|--------|
| _None_ | | |

---

## Notes

**2026-01-20:** Started Phase 0 implementation. Skills bundling is complete and verified. CI workflow created but needs to be tested with an actual PR.
