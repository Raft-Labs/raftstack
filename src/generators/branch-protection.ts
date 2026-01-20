import { join } from "node:path";
import type { GeneratorResult } from "../types/config.js";
import { ensureDir, writeFileSafe } from "../utils/file-system.js";

/**
 * Get branch protection setup documentation
 */
function getBranchProtectionDocs(): string {
  return `# Branch Protection Setup Guide

This guide explains how to configure branch protection rules for your repository.

## Quick Setup

Run the automated setup command:

\`\`\`bash
raftstack setup-protection
\`\`\`

This command supports:
- **Multiple branches**: main, staging, production, development, etc.
- **Merge strategies**: Rebase (recommended), squash, or merge commits
- **Review requirements**: Configurable number of required approvals

## Recommended Settings

### For \`main\` / \`master\` branch:

1. **Require a pull request before merging**
   - ✅ Require approvals: 1 (or more for larger teams)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require review from Code Owners

2. **Require status checks to pass before merging**
   - ✅ Require branches to be up to date before merging
   - Select required status checks:
     - \`check\` (from pr-checks.yml workflow)

3. **Require conversation resolution before merging**
   - ✅ All conversations on code must be resolved

4. **Do not allow bypassing the above settings**
   - ✅ Apply rules to administrators

5. **Restrict who can push to matching branches**
   - Only allow merges through pull requests

6. **Block force pushes**
   - ✅ Do not allow force pushes

7. **Block deletions**
   - ✅ Do not allow this branch to be deleted

## Manual Setup via GitHub UI

1. Go to your repository on GitHub
2. Click **Settings** > **Branches**
3. Click **Add branch protection rule**
4. Enter \`main\` (or \`master\`) as the branch name pattern
5. Configure the settings as described above
6. Click **Create** or **Save changes**

## Automated Setup (Recommended)

Use the \`raftstack setup-protection\` command to configure
branch protection rules automatically using the GitHub CLI.

Requirements:
- GitHub CLI (\`gh\`) installed and authenticated
- Admin access to the repository

\`\`\`bash
raftstack setup-protection
\`\`\`

### Features

The setup command will:
1. Prompt you to select branches to protect (main, staging, production, etc.)
2. Let you choose a merge strategy (rebase, squash, or merge commits)
3. Configure required review count
4. Apply branch protection rules to all selected branches
5. Set repository merge settings

### Merge Strategy Recommendations

| Strategy | Use Case |
|----------|----------|
| **Rebase** (recommended) | Clean linear history, easy to follow |
| **Squash** | Single commit per PR, cleaner history |
| **Merge commit** | Preserve all commits, show PR merge points |

## Branch Naming Convention

This project enforces branch naming conventions via \`validate-branch-name\`.

Allowed patterns:
- \`main\`, \`master\`, \`develop\`, \`staging\`, \`production\`
- \`feature/*\` - New features
- \`fix/*\` or \`bugfix/*\` - Bug fixes
- \`hotfix/*\` - Urgent fixes
- \`release/*\` - Release preparation
- \`chore/*\` - Maintenance tasks
- \`docs/*\` - Documentation updates
- \`refactor/*\` - Code refactoring
- \`test/*\` - Test additions/updates
- \`ci/*\` - CI/CD changes

Examples:
- \`feature/user-authentication\`
- \`fix/login-validation\`
- \`hotfix/security-patch\`
- \`release/v1.2.0\`
`;
}

/**
 * Generate branch protection documentation
 */
export async function generateBranchProtectionDocs(
  targetDir: string
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  const docsDir = join(targetDir, ".github");
  await ensureDir(docsDir);

  const docsPath = join(docsDir, "BRANCH_PROTECTION_SETUP.md");
  const writeResult = await writeFileSafe(docsPath, getBranchProtectionDocs(), {
    backup: true,
  });

  if (writeResult.created) {
    result.created.push(".github/BRANCH_PROTECTION_SETUP.md");
    if (writeResult.backedUp) {
      result.backedUp.push(writeResult.backedUp);
    }
  }

  return result;
}
