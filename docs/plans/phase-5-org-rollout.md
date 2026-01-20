# Phase 5: Organization Rollout

## Goal

Deploy RaftStack to all active RaftLabs projects (30+ developers across multiple projects).

## Success Criteria

- [ ] All active projects using RaftStack
- [ ] All teams trained on new workflow
- [ ] Metrics trending toward targets from [goal.md](../goal.md)

---

## Tasks

### 5.1 Rollout Planning

#### Project Inventory

Create a complete inventory of projects to migrate:

| Project | Team Size | Activity | Priority | Status |
|---------|-----------|----------|----------|--------|
| _Example Project A_ | 4 | High | 1 | Pending |
| _Example Project B_ | 2 | Medium | 2 | Pending |
| ... | | | | |

#### Prioritization Criteria

1. **High Activity:** Projects with frequent commits (weekly+)
2. **Team Size:** Larger teams benefit more from standardization
3. **New Projects:** Easier to adopt from scratch
4. **Technical Debt:** Projects with known workflow issues

#### Rollout Schedule

| Week | Projects | Champion |
|------|----------|----------|
| Week 1 | Project A, Project B | TBD |
| Week 2 | Project C, Project D, Project E | TBD |
| Week 3 | Project F, Project G | TBD |
| ... | | |

**Target:** 2-3 projects per week

---

### 5.2 Champion Assignment

Assign a "champion" for each project migration:

#### Champion Responsibilities

- [ ] Run `raftstack init` on project
- [ ] Configure branch protection
- [ ] Train their team
- [ ] Handle initial questions
- [ ] Report issues

#### Champion Selection

| Project | Champion | Backup |
|---------|----------|--------|
| _Example_ | _Name_ | _Name_ |

---

### 5.3 Execution

#### Per-Project Deployment Checklist

- [ ] Champion runs `raftstack init`
- [ ] Champion configures GitHub branch protection
- [ ] All team members verify hooks work locally
- [ ] Team briefed on new workflow
- [ ] First PR using new format completed
- [ ] Project marked complete in tracking

#### Deployment Script

```bash
#!/bin/bash
# deploy-raftstack.sh

PROJECT_DIR=$1

cd "$PROJECT_DIR" || exit 1

# Create setup branch
git checkout -b chore/setup-raftstack

# Run RaftStack
pnpm dlx @raftlabs/raftstack init

# Commit
git add .
git commit -m "chore: setup RaftStack for Git workflow standardization

Task: [ASANA_LINK]"

# Push and create PR
git push -u origin chore/setup-raftstack
gh pr create --title "chore: setup RaftStack" --body "Standardizing Git workflow with RaftStack"
```

---

### 5.4 Training at Scale

#### Training Materials

- [ ] Video: "RaftStack in 5 minutes"
- [ ] Quick reference card (PDF/image)
- [ ] FAQ document
- [ ] Slack channel for questions

#### Training Sessions

| Session | Audience | Duration |
|---------|----------|----------|
| All-hands intro | Everyone | 15 min |
| Deep-dive workshop | Interested developers | 45 min |
| Champion training | Champions only | 30 min |

---

### 5.5 Metrics Tracking

#### Target Metrics (from goal.md)

| Metric | Target | Current | Progress |
|--------|--------|---------|----------|
| PRs reviewed before merge | 100% | - | - |
| Commits with task links | 100% | - | - |
| Branch naming compliance | 100% | - | - |
| Merge conflicts at PR time | < 5% | - | - |
| Average PR size | < 400 lines | - | - |
| Code review turnaround | < 3 hours | - | - |

#### Tracking Methods

- **Branch compliance:** GitHub branch protection logs
- **Commit format:** Git log analysis script
- **PR metrics:** GitHub API queries
- **Review turnaround:** GitHub PR analytics

#### Metrics Dashboard Script

```bash
#!/bin/bash
# metrics.sh - Quick metrics check for a repo

REPO=$1

# Commits with task links (last 30 days)
echo "Commits with Task links:"
git log --since="30 days ago" --oneline | grep -c "Task:"

# Branch naming compliance
echo "Branch names:"
git branch -a --format='%(refname:short)' | grep -v "^main\|^staging" | head -10

# PR sizes (requires gh CLI)
echo "Recent PR sizes:"
gh pr list --state merged --limit 5 --json additions,deletions
```

---

### 5.6 Ongoing Maintenance

#### Monthly Review

- [ ] Check metrics trending
- [ ] Address common issues
- [ ] Update RaftStack if needed
- [ ] Refresh training materials

#### Issue Escalation

| Issue Type | Action |
|------------|--------|
| Bug in RaftStack | Fix and release patch |
| Workflow confusion | Update documentation |
| Resistance to adoption | 1:1 conversation |
| Feature request | Add to backlog |

---

## Rollout Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| Week 0 | 1 week | Planning, champion selection |
| Weeks 1-4 | 4 weeks | Project deployments (2-3/week) |
| Week 5 | 1 week | Catch-up, stragglers |
| Week 6+ | Ongoing | Monitoring, maintenance |

**Total:** ~6 weeks for full org coverage

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Team resistance | Executive sponsorship, show benefits |
| Legacy projects | Gradual adoption, skip archived repos |
| Breaking existing CI | Test on branch first, review before merge |
| Champion unavailable | Assign backup champions |

---

## Dependencies

- Phase 4 pilot complete and successful
- Executive buy-in for org-wide mandate
- Time allocated for champions

---

## Estimated Effort

| Task | Effort |
|------|--------|
| 5.1 Planning | 2-4 hours |
| 5.2 Champion Assignment | 1-2 hours |
| 5.3 Execution | ~1 hour per project |
| 5.4 Training | 4-6 hours total |
| 5.5 Metrics Setup | 2-3 hours |
| 5.6 Ongoing | 2-4 hours/month |

**Total:** ~30-40 hours over 6 weeks

---

## Post-Rollout

After successful rollout:

1. **Celebrate!** Recognize champions and teams
2. **Document wins** - Before/after metrics
3. **Iterate** - Continuous improvement based on feedback
4. **Share** - Consider open-sourcing for community benefit

---

## Completion

The initiative is considered complete when:

- [ ] All active projects using RaftStack
- [ ] Metrics at or trending toward targets
- [ ] Self-sustaining (teams help each other)
- [ ] Monthly maintenance routine established
