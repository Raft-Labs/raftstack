# RaftStack Roadmap

> Master plan for completing the RaftStack CLI and rolling out across RaftLabs (30+ developers)

## Project Summary

RaftStack is a CLI tool that enforces consistent Git workflows, commit conventions, and code quality across all RaftLabs projects. It bundles Claude Code skills for AI-assisted code quality enforcement.

**Repository:** `@raftlabs/raftstack`
**Goal:** Standardize development practices for 30+ developers

---

## Phase Overview

| Phase | Name | Status | Description |
|-------|------|--------|-------------|
| 0 | [Stabilization](./plans/phase-0-stabilization.md) | ✅ Complete | Skills bundling, CI workflow |
| 1 | [Testing](./plans/phase-1-testing.md) | ✅ Complete | 191 tests (unit, integration, E2E) |
| 2 | [Features](./plans/phase-2-features.md) | ✅ Complete | ESLint generator, enhanced branch protection |
| 3 | [Pre-Release](./plans/phase-3-pre-release.md) | ✅ Ready | All dev complete, awaiting npm publish |
| 4 | [Pilot](./plans/phase-4-pilot.md) | Not Started | Deploy to one real project for validation |
| 5 | [Org Rollout](./plans/phase-5-org-rollout.md) | Not Started | Deploy to all RaftLabs projects |

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| CLI Framework | ✅ Complete | Commander.js + @clack/prompts |
| 14 Generators | ✅ Complete | husky, commitlint, lint-staged, eslint, etc. |
| 5 Claude Skills | ✅ Complete | React, Backend, Database, SEO, Code Quality |
| Init Command | ✅ Complete | Full orchestration flow |
| Setup-Protection | ✅ Complete | Multi-branch, merge strategies via gh CLI |
| Unit Tests | ✅ Complete | 165 tests across 14 test files |
| Integration Tests | ✅ Complete | 11 tests |
| E2E Tests | ✅ Complete | 15 tests across 4 project types |
| Skills Bundling | ✅ Complete | `.claude/skills/` in package.json files |
| CI Workflow | ✅ Complete | `ci.yml` + `publish.yml` |
| Documentation | ✅ Complete | README, CHANGELOG, CONTRIBUTING |
| NPM Publishing | ⏳ Action Required | Manual publish needed |
| Metrics Command | ✅ Complete | `raftstack metrics` for compliance tracking |
| Quick Reference | ✅ Complete | .github/QUICK_REFERENCE.md generated |
| Deployment Script | ✅ Complete | scripts/deploy-to-project.sh for rollout |

### Next Steps

1. **Publish to npm** (manual action required):
   ```bash
   npm login           # Requires @raftlabs org access
   pnpm publish --no-git-checks
   ```
2. Verify installation: `pnpm dlx @raftlabs/raftstack init`
3. Proceed to Phase 4: Pilot deployment
4. Use `raftstack metrics` to track adoption

---

## Phase Dependencies

```
Phase 0 (Stabilization) ─── MUST complete first
         │
         v
Phase 1 (Testing) ────────── Build confidence
         │
         v
Phase 2 (Features) ───────── Complete goal.md
         │
         v
Phase 3 (Pre-Release) ────── v1.0.0
         │
         v
Phase 4 (Pilot) ──────────── Validate with real team
         │
         v
Phase 5 (Org Rollout) ────── Full deployment
```

---

## Success Metrics

From [goal.md](./goal.md):

| Metric | Target |
|--------|--------|
| PRs reviewed before merge | 100% |
| Commits with task links | 100% |
| Branch naming compliance | 100% |
| Merge conflicts at PR time | < 5% |
| Average PR size | < 400 lines |
| Code review turnaround | < 3 hours |

---

## Progress Tracking

See [PROGRESS.md](./PROGRESS.md) for detailed progress tracking with checkboxes.

---

## Quick Links

- [Strategy Document](./goal.md)
- [Progress Tracking](./PROGRESS.md)
- **Phase Plans:**
  - [Phase 0: Stabilization](./plans/phase-0-stabilization.md)
  - [Phase 1: Testing](./plans/phase-1-testing.md)
  - [Phase 2: Features](./plans/phase-2-features.md)
  - [Phase 3: Pre-Release](./plans/phase-3-pre-release.md)
  - [Phase 4: Pilot](./plans/phase-4-pilot.md)
  - [Phase 5: Org Rollout](./plans/phase-5-org-rollout.md)
