#!/bin/bash
#
# RaftStack Deployment Script
# Use this script to deploy RaftStack to a project during org rollout
#
# Usage: ./deploy-to-project.sh /path/to/project [asana-task-url]
#

set -e

PROJECT_DIR="${1:-.}"
ASANA_TASK="${2:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     RaftStack Deployment Script        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Error: Directory '$PROJECT_DIR' does not exist${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# Check if it's a git repo
if [ ! -d ".git" ]; then
    echo -e "${RED}Error: '$PROJECT_DIR' is not a git repository${NC}"
    exit 1
fi

# Check if on a clean branch
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch:${NC} $CURRENT_BRANCH"

# Create setup branch
SETUP_BRANCH="chore/setup-raftstack"
echo -e "\n${GREEN}Creating branch:${NC} $SETUP_BRANCH"

if git show-ref --verify --quiet "refs/heads/$SETUP_BRANCH"; then
    echo -e "${YELLOW}Branch already exists, checking it out${NC}"
    git checkout "$SETUP_BRANCH"
else
    git checkout -b "$SETUP_BRANCH"
fi

# Run RaftStack init
echo -e "\n${GREEN}Running RaftStack init...${NC}"
pnpm dlx @raftlabs/raftstack init

# Show what was generated
echo -e "\n${GREEN}Changes made:${NC}"
git status --short

# Stage all changes
git add .

# Create commit message
COMMIT_MSG="chore: setup RaftStack for Git workflow standardization

- Added Git hooks (husky)
- Added commit message validation (commitlint)
- Added interactive commit tool (cz-git)
- Added branch naming validation
- Added PR template and workflows
- Added Claude Code skills for AI-assisted development"

if [ -n "$ASANA_TASK" ]; then
    COMMIT_MSG="$COMMIT_MSG

Task: $ASANA_TASK"
fi

COMMIT_MSG="$COMMIT_MSG

Co-Authored-By: RaftStack CLI <noreply@raftlabs.com>"

# Commit
echo -e "\n${GREEN}Creating commit...${NC}"
git commit -m "$COMMIT_MSG"

# Push
echo -e "\n${GREEN}Pushing to remote...${NC}"
git push -u origin "$SETUP_BRANCH"

# Create PR (if gh CLI is available)
if command -v gh &> /dev/null; then
    echo -e "\n${GREEN}Creating pull request...${NC}"

    PR_BODY="## Summary
- Set up RaftStack for Git workflow standardization
- Added Git hooks, commit validation, and branch protection docs

## What's Included
- \`.husky/\` - Git hooks for pre-commit, commit-msg, pre-push
- \`commitlint.config.js\` - Commit message validation rules
- \`.czrc\` / \`cz.config.js\` - Interactive commit configuration
- \`.github/\` - PR template, workflows, CODEOWNERS
- \`CONTRIBUTING.md\` - Developer guidelines
- \`.claude/skills/\` - AI-assisted development rules

## Next Steps After Merge
1. Run \`pnpm install\` to install new devDependencies
2. Team members should use \`pnpm commit\` for commits
3. Review \`.github/BRANCH_PROTECTION_SETUP.md\` for branch protection

---
🤖 Generated with [RaftStack](https://github.com/Raft-Labs/raftstack)"

    if [ -n "$ASANA_TASK" ]; then
        PR_BODY="$PR_BODY

**Task:** $ASANA_TASK"
    fi

    gh pr create \
        --title "chore: setup RaftStack for Git workflow standardization" \
        --body "$PR_BODY" \
        --base main

    echo -e "\n${GREEN}✓ Pull request created!${NC}"
else
    echo -e "\n${YELLOW}gh CLI not found. Create PR manually on GitHub.${NC}"
    echo -e "Branch: $SETUP_BRANCH"
fi

echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Deployment Complete! 🚀            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo "  1. Review and merge the PR"
echo "  2. Have team run: pnpm install"
echo "  3. Brief team on new workflow"
echo "  4. Monitor for issues"
