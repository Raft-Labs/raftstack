import { join } from "node:path";
import type { GeneratorResult, PackageManagerInfo } from "../types/config.js";
import { writeFileSafe } from "../utils/file-system.js";

/**
 * Get CONTRIBUTING.md content
 */
function getContributingContent(hasAsana: boolean, pm: PackageManagerInfo): string {
  const asanaSection = hasAsana
    ? `
## Linking to Asana

When working on a task:
1. Create a branch following the naming convention (e.g., \`feature/task-description\`)
2. Include the Asana task link in your commit body or footer
3. Reference the Asana task in your PR description

Example commit:
\`\`\`
feat(auth): add password reset functionality

Implement password reset flow with email verification.

Asana: https://app.asana.com/0/workspace/task-id
\`\`\`
`
    : "";

  return `# Contributing Guide

Thank you for your interest in contributing! This document outlines our development workflow and standards.

## Getting Started

1. Clone the repository
2. Install dependencies: \`${pm.install}\`
3. Create a new branch following our naming convention

## Branch Naming Convention

We use structured branch names to keep our repository organized:

| Prefix | Purpose | Example |
|--------|---------|---------|
| \`feature/\` | New features | \`feature/user-authentication\` |
| \`fix/\` | Bug fixes | \`fix/login-validation\` |
| \`hotfix/\` | Urgent fixes | \`hotfix/security-patch\` |
| \`bugfix/\` | Bug fixes (alternative) | \`bugfix/form-submission\` |
| \`release/\` | Release preparation | \`release/v1.2.0\` |
| \`chore/\` | Maintenance tasks | \`chore/update-dependencies\` |
| \`docs/\` | Documentation | \`docs/api-reference\` |
| \`refactor/\` | Code refactoring | \`refactor/auth-module\` |
| \`test/\` | Test additions | \`test/user-service\` |
| \`ci/\` | CI/CD changes | \`ci/github-actions\` |

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/). Use the interactive commit tool:

\`\`\`bash
${pm.run} commit
\`\`\`

### Commit Types

| Type | Description |
|------|-------------|
| \`feat\` | New feature |
| \`fix\` | Bug fix |
| \`docs\` | Documentation changes |
| \`style\` | Code style changes (formatting, etc.) |
| \`refactor\` | Code refactoring |
| \`perf\` | Performance improvements |
| \`test\` | Adding or updating tests |
| \`build\` | Build system changes |
| \`ci\` | CI configuration changes |
| \`chore\` | Other changes |
| \`revert\` | Reverting changes |

### Commit Message Format

\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

Example:
\`\`\`
feat(auth): add social login support

Implement OAuth2 login for Google and GitHub providers.
Includes user profile sync and token refresh.

Closes #123
\`\`\`
${asanaSection}
## Pull Request Process

1. Ensure your branch is up to date with \`main\`/\`master\`
2. Run tests and linting locally
3. Create a pull request using the provided template
4. Request review from code owners
5. Address any feedback
6. Merge once approved and all checks pass

### PR Size Guidelines

Keep pull requests small and focused for faster reviews:

| Size | Lines Changed | Review Time |
|------|---------------|-------------|
| XS | 0-10 lines | Minutes |
| S | 11-50 lines | < 30 min |
| M | 51-200 lines | < 1 hour |
| L | 201-400 lines | 1-2 hours |
| XL | 400+ lines | Needs justification |

**Target: < 400 lines per PR**

If your PR is large:
- Consider splitting it into smaller, logical PRs
- Explain in the description why it can't be split

## Code Quality

Before committing, the following checks run automatically:

- **Linting**: ESLint checks for code quality
- **Formatting**: Prettier ensures consistent style
- **Type checking**: TypeScript validates types
- **Commit messages**: Commitlint validates format
- **Branch names**: validate-branch-name checks naming

## Questions?

If you have questions, please open an issue or reach out to the maintainers.
`;
}

/**
 * Generate CONTRIBUTING.md
 */
export async function generateContributing(
  targetDir: string,
  hasAsana: boolean,
  pm: PackageManagerInfo
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  const contributingPath = join(targetDir, "CONTRIBUTING.md");
  const writeResult = await writeFileSafe(
    contributingPath,
    getContributingContent(hasAsana, pm),
    { backup: true }
  );

  if (writeResult.created) {
    result.created.push("CONTRIBUTING.md");
    if (writeResult.backedUp) {
      result.backedUp.push(writeResult.backedUp);
    }
  }

  return result;
}
