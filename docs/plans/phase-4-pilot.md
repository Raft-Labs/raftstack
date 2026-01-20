# Phase 4: Pilot Rollout

## Goal

Validate RaftStack with a real team on a real project before organization-wide deployment.

## Success Criteria

- [ ] Pilot team using RaftStack workflow for 1+ week
- [ ] No blocking issues encountered
- [ ] Positive feedback from team
- [ ] Any critical issues identified and fixed

---

## Tasks

### 4.1 Select Pilot Project

**Note:** Specific project will be selected when we reach this phase.

#### Selection Criteria

- [ ] Active development (PRs happening weekly)
- [ ] Low-risk (not mission-critical)
- [ ] Small team (2-4 developers)
- [ ] Team willing to participate
- [ ] Mix of experience levels

#### Candidate Types

| Type | Risk | Benefit |
|------|------|---------|
| Internal tool | Low | Safe to experiment |
| New client project | Low | Clean slate |
| Active maintenance project | Medium | Real workflow test |

#### Pre-Pilot Documentation

- [ ] Document current project state:
  - Existing git workflow
  - Current branch naming
  - Existing hooks/linting
  - Team size and roles
- [ ] Get explicit team buy-in
- [ ] Schedule kickoff meeting

---

### 4.2 Deploy to Pilot Project

#### Deployment Steps

```bash
# 1. Clone/navigate to pilot project
cd pilot-project

# 2. Create branch for RaftStack setup
git checkout -b chore/setup-raftstack

# 3. Run RaftStack init
pnpm dlx @raftlabs/raftstack init

# 4. Review generated files
git status
git diff

# 5. Commit and push
git add .
git commit -m "chore: setup RaftStack for Git workflow standardization"
git push -u origin chore/setup-raftstack

# 6. Create PR and merge
gh pr create --title "chore: setup RaftStack" --body "..."
```

#### Configuration Checklist

- [ ] Run `raftstack init` successfully
- [ ] Configure branch protection via GitHub UI or `setup-protection`
- [ ] Verify hooks work locally for all team members
- [ ] Update team's `CONTRIBUTING.md` with new workflow

---

### 4.3 Team Training

#### Training Topics

1. **New commit workflow:**
   - Use `pnpm commit` for interactive commits
   - Commit message format with emojis
   - Task link requirement

2. **Branch naming:**
   - `feature/`, `bugfix/`, `hotfix/`, etc.
   - Validation will reject invalid names

3. **PR workflow:**
   - Use PR template
   - Request reviews
   - Keep PRs small

#### Training Materials

- [ ] Create 10-minute video walkthrough
- [ ] Write quick-reference guide
- [ ] Schedule live demo session

---

### 4.4 Monitor and Iterate

#### Monitoring Period

- **Duration:** 1-2 weeks
- **Check-ins:** Daily for first 3 days, then every 2-3 days

#### Feedback Collection

- [ ] Create feedback channel (Slack channel or shared doc)
- [ ] Daily standup check-ins
- [ ] End-of-week survey

#### Feedback Template

```markdown
## RaftStack Pilot Feedback

**Developer:**
**Date:**
**Experience Level:**

### What's working well?

### What's frustrating?

### Bugs encountered?

### Suggestions?
```

#### Issue Tracking

| Issue | Severity | Status | Resolution |
|-------|----------|--------|------------|
| _Template_ | Low/Med/High | Open/Resolved | _Fix description_ |

---

### 4.5 Post-Pilot Actions

#### If Successful

- [ ] Document lessons learned
- [ ] Apply any configuration tweaks
- [ ] Publish patch release if needed
- [ ] Proceed to Phase 5

#### If Issues Found

- [ ] Categorize issues (blocker vs. nice-to-have)
- [ ] Fix blockers before proceeding
- [ ] Extend pilot if needed
- [ ] Consider rollback if fundamentally flawed

---

## Metrics to Track

During pilot, track these metrics:

| Metric | Baseline | Week 1 | Week 2 |
|--------|----------|--------|--------|
| PRs with proper format | - | - | - |
| Commits with task links | - | - | - |
| Branch naming compliance | - | - | - |
| Team satisfaction (1-5) | - | - | - |
| Blocked by tooling (hours) | - | - | - |

---

## Timeline

| Day | Activity |
|-----|----------|
| 1 | Deploy RaftStack, team training |
| 2-3 | Daily check-ins, address issues |
| 4-7 | Monitor, collect feedback |
| 8-14 | Extended monitoring if needed |
| End | Post-pilot review |

---

## Dependencies

- v1.0.0 released (Phase 3 complete)
- Project and team selected
- Time allocated for training

---

## Estimated Effort

| Task | Effort |
|------|--------|
| 4.1 Select Pilot | 1-2 hours |
| 4.2 Deploy | 1 hour |
| 4.3 Training | 2-3 hours |
| 4.4 Monitoring | 30 min/day for 2 weeks |
| 4.5 Post-Pilot | 1-2 hours |

**Total:** ~8-12 hours over 2 weeks

---

## Next Phase

Upon successful pilot completion, proceed to [Phase 5: Org Rollout](./phase-5-org-rollout.md)
