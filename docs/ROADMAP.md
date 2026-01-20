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
| 0 | [Stabilization](./plans/phase-0-stabilization.md) | Not Started | Fix skills bundling, add CI, validate publishing |
| 1 | [Testing](./plans/phase-1-testing.md) | Not Started | Comprehensive test coverage (>80%) |
| 2 | [Features](./plans/phase-2-features.md) | Not Started | Complete remaining features from goal.md |
| 3 | [Pre-Release](./plans/phase-3-pre-release.md) | Not Started | Final validation and v1.0.0 release |
| 4 | [Pilot](./plans/phase-4-pilot.md) | Not Started | Deploy to one real project for validation |
| 5 | [Org Rollout](./plans/phase-5-org-rollout.md) | Not Started | Deploy to all RaftLabs projects |

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| CLI Framework | Complete | Commander.js + @clack/prompts |
| 13 Generators | Complete | husky, commitlint, lint-staged, etc. |
| 5 Claude Skills | Complete | React, Backend, Database, SEO, Code Quality |
| Init Command | Complete | Full orchestration flow |
| Setup-Protection | Complete | GitHub API via gh CLI |
| Unit Tests | Partial | Only 2 test files (~30 tests) |
| Skills Bundling | **Not Done** | `.claude/` not in package.json files |
| CI Workflow | **Not Done** | Only publish.yml exists |
| Pilot Rollout | Not Started | |

### Critical Gap

Skills exist but won't be included in npm package (missing from `files` array). This is the top priority for Phase 0.

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
