# RaftStack

[![npm version](https://img.shields.io/npm/v/@raftlabs/raftstack.svg)](https://www.npmjs.com/package/@raftlabs/raftstack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A CLI tool for setting up Git hooks, commit conventions, and GitHub integration in your projects.

RaftStack automates the setup of development best practices including:
- **Git hooks** with Husky (pre-commit, commit-msg, pre-push)
- **Commit conventions** with Commitlint and cz-git
- **Code formatting** with lint-staged and Prettier
- **Branch naming** validation
- **GitHub workflows** for PR checks
- **CODEOWNERS** for automatic reviewer assignment

## Installation

```bash
# Using pnpm (recommended)
pnpm dlx @raftlabs/raftstack init

# Using npx
npx @raftlabs/raftstack init

# Using yarn
yarn dlx @raftlabs/raftstack init

# Or install globally
pnpm add -g @raftlabs/raftstack
raftstack init
```

## Quick Start

Run the interactive setup wizard in your project directory:

```bash
raftstack init
```

The wizard will:
1. Detect your project type (NX, Turborepo, pnpm workspace, or single package)
2. Detect your package manager (npm, pnpm, Yarn)
3. Configure AI code review tools (optional)
4. Set up CODEOWNERS for automatic PR reviewers
5. Generate all configuration files

## Commands

### `raftstack init`

Interactive setup wizard that configures all tools.

```bash
raftstack init
```

### `raftstack setup-protection`

Configure GitHub branch protection rules via the GitHub API.

```bash
raftstack setup-protection
```

**Requirements:**
- GitHub CLI (`gh`) installed and authenticated
- Admin access to the repository

### `raftstack metrics`

Analyze repository compliance with RaftStack conventions.

```bash
raftstack metrics
```

This command checks:
- **Commit compliance** - Percentage of commits with task links
- **Branch naming** - Percentage following naming conventions
- **Overall compliance score** - Combined metrics

## What Gets Generated

### Git Hooks (via Husky)

| Hook | Purpose |
|------|---------|
| `pre-commit` | Runs lint-staged to format and lint staged files |
| `commit-msg` | Validates commit messages with Commitlint |
| `pre-push` | Validates branch naming conventions |

### Configuration Files

| File | Purpose |
|------|---------|
| `.husky/*` | Git hooks |
| `commitlint.config.js` | Commit message validation rules |
| `.czrc` + `cz.config.js` | Interactive commit wizard |
| `.lintstagedrc.js` | Pre-commit file processing |
| `.prettierrc` | Code formatting rules |

### GitHub Integration

| File | Purpose |
|------|---------|
| `.github/PULL_REQUEST_TEMPLATE.md` | PR template with checklist |
| `.github/workflows/pr-checks.yml` | CI workflow for PR validation |
| `.github/CODEOWNERS` | Automatic reviewer assignment |

## Commit Convention

RaftStack enforces [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

### Commit Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `build` | Build system changes |
| `ci` | CI configuration changes |
| `chore` | Other changes |

### Example Commits

```bash
feat(auth): add social login support
fix(api): handle null response from server
docs(readme): update installation instructions
```

## Branch Naming Convention

RaftStack validates branch names on push:

| Pattern | Example |
|---------|---------|
| `feature/*` | `feature/user-authentication` |
| `fix/*` | `fix/login-validation` |
| `hotfix/*` | `hotfix/security-patch` |
| `bugfix/*` | `bugfix/form-submission` |
| `release/*` | `release/v1.2.0` |
| `chore/*` | `chore/update-dependencies` |
| `docs/*` | `docs/api-reference` |
| `refactor/*` | `refactor/auth-module` |
| `test/*` | `test/user-service` |

Protected branches: `main`, `master`, `develop`, `staging`, `production`

## Requirements

- Node.js >= 18
- Git repository initialized
- Package manager: npm, pnpm, or yarn

## Documentation

For complete documentation including:
- Getting Started workflow
- Troubleshooting
- AI Code Review setup
- Claude Code Skills
- Organization rollout guide
- Contributing guidelines

Visit the [GitHub repository](https://github.com/Raft-Labs/raftstack).

## License

MIT
