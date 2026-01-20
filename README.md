# RaftStack

A CLI tool for setting up Git hooks, commit conventions, and GitHub integration in your projects.

RaftStack automates the setup of development best practices including:
- **Git hooks** with Husky (pre-commit, commit-msg, pre-push)
- **Commit conventions** with Commitlint and cz-git
- **Code formatting** with lint-staged and Prettier
- **Branch naming** validation
- **GitHub workflows** for PR checks
- **CODEOWNERS** for automatic reviewer assignment
- **AI code review** integration (CodeRabbit, GitHub Copilot)

## Installation

```bash
# Using pnpm (recommended)
pnpm dlx @raftlabs/raftstack init

# Using npx
npx @raftlabs/raftstack init

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
2. Ask about Asana task linking preferences
3. Configure AI code review tools (optional)
4. Set up CODEOWNERS for automatic PR reviewers
5. Generate all configuration files

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
| `.czrc` + `cz.config.js` | Interactive commit wizard configuration |
| `.lintstagedrc.js` | Pre-commit file processing rules |
| `.prettierrc` | Code formatting rules (if not already configured) |
| `.prettierignore` | Files to exclude from formatting |

### GitHub Integration

| File | Purpose |
|------|---------|
| `.github/PULL_REQUEST_TEMPLATE.md` | PR template with checklist |
| `.github/workflows/pr-checks.yml` | CI workflow for PR validation |
| `.github/CODEOWNERS` | Automatic reviewer assignment |
| `.github/BRANCH_PROTECTION_SETUP.md` | Branch protection setup guide |

### Documentation

| File | Purpose |
|------|---------|
| `CONTRIBUTING.md` | Developer contribution guide |
| `.github/QUICK_REFERENCE.md` | One-page workflow cheat sheet for developers |

## Package Manager Support

RaftStack automatically detects and adapts to your package manager of choice:

| Package Manager | Detection Method | Lockfile |
|----------------|------------------|----------|
| **npm** | `package-lock.json` | `package-lock.json` |
| **pnpm** | `pnpm-lock.yaml` | `pnpm-lock.yaml` |
| **Yarn Classic (1.x)** | `yarn.lock` | `yarn.lock` |
| **Yarn Berry (2+)** | `yarn.lock` + `packageManager` field | `yarn.lock` |

**Auto-Detection:**
- RaftStack scans for lockfiles in your project root
- Priority order: pnpm > Yarn > npm
- For Yarn, the version is determined from the `packageManager` field in `package.json`
- If no lockfile is found, you'll be prompted to select your preferred package manager

**What Gets Customized:**
- All generated hooks use the correct package manager commands (`npx` vs `pnpm dlx` vs `yarn dlx`)
- GitHub workflows use appropriate install commands (`npm ci` vs `pnpm install --frozen-lockfile` vs `yarn install --immutable`)
- pnpm projects automatically include the `pnpm/action-setup` action in CI workflows
- Documentation shows the right commands for your package manager

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

Use during pilot rollout or ongoing maintenance to track team adoption.

## After Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Make commits using the interactive wizard:**
   ```bash
   pnpm commit
   ```

3. **Review the generated configuration** and customize as needed.

4. **Set up branch protection** on GitHub (see `.github/BRANCH_PROTECTION_SETUP.md`).

## Commit Convention

RaftStack enforces [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
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
| `revert` | Reverting changes |

### Example Commits

```bash
# Feature
feat(auth): add social login support

# Bug fix
fix(api): handle null response from server

# With Asana link (if configured)
feat(dashboard): add usage analytics widget

Implements real-time usage tracking for the dashboard.

Asana: https://app.asana.com/0/workspace/task-id
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
| `ci/*` | `ci/github-actions` |

Protected branches: `main`, `master`, `develop`, `staging`, `production`

## Project Type Detection

RaftStack automatically detects your project structure:

| Type | Detection |
|------|-----------|
| NX Monorepo | `nx.json` present |
| Turborepo | `turbo.json` present |
| pnpm Workspace | `pnpm-workspace.yaml` present |
| Single Package | Default when no monorepo config found |

## Asana Integration

If you enable Asana integration, RaftStack will:
- Add Asana task link prompts to the commit wizard
- Include an Asana section in the PR template
- Show warnings (not errors) for commits without task links

**Note:** Task link validation is set to warning level by default. To make it required, edit `commitlint.config.js` and change the rule level from `1` to `2`.

## AI Code Review

RaftStack supports optional AI code review integration:

- **CodeRabbit**: Generates `.coderabbit.yaml` configuration
- **GitHub Copilot**: Adds workflow for Copilot code review

## Claude Code Skills

RaftStack bundles AI-assisted development skills for Claude Code. When initialized, these skills are copied to `.claude/skills/`:

| Skill | Purpose |
|-------|---------|
| `react` | React 19+ patterns, SOLID components, performance optimization |
| `backend` | Clean architecture for serverless/Hono/Express backends |
| `database` | PostgreSQL/Drizzle ORM schema design and indexing |
| `seo` | Technical SEO for Next.js/React applications |
| `code-quality` | Universal readability rules (30-line functions, naming, etc.) |

These skills automatically apply best practices when using Claude Code for development.

## ESLint Configuration (Optional)

RaftStack can generate ESLint 9 flat config for projects without existing ESLint setup:

- **TypeScript support** with `typescript-eslint`
- **React support** auto-detected and configured
- **Modern flat config** format (ESLint 9+)
- **Skips** if ESLint is already configured

To add ESLint to the init flow, the generator automatically detects if ESLint is needed.

## Requirements

- Node.js >= 18
- Git repository initialized
- Package manager: pnpm, npm, or yarn

## Troubleshooting

### Husky hooks not running

```bash
# Reinstall husky
pnpm exec husky

# Make hooks executable
chmod +x .husky/*
```

### Commit validation failing

Check your commit message format:
```bash
# Use the interactive wizard
pnpm commit

# Or ensure format: type(scope): subject
git commit -m "feat(auth): add login page"
```

### Branch name validation failing

Ensure your branch follows the naming convention:
```bash
# Correct
git checkout -b feature/my-feature

# Incorrect
git checkout -b my-feature  # Missing prefix
```

### Permission denied on hooks

```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

### Files not being formatted

Check your `.lintstagedrc.js` configuration and ensure the file patterns match your project structure.

## Organization Rollout

For deploying RaftStack across multiple projects in your organization, use the deployment helper script:

```bash
# Download and run
curl -fsSL https://raw.githubusercontent.com/Raft-Labs/raftstack/main/scripts/deploy-to-project.sh -o deploy.sh
chmod +x deploy.sh

# Deploy to a project
./deploy.sh /path/to/project https://app.asana.com/0/project/task
```

The script:
1. Creates a `chore/setup-raftstack` branch
2. Runs `raftstack init`
3. Commits with proper message format
4. Pushes and creates a PR (if `gh` CLI is available)

## Versioning and Releases

This project uses [Semantic Versioning](https://semver.org/) and automated releases.

### Version Bumping

Use npm scripts to bump versions locally:

```bash
# Patch release (1.0.0 -> 1.0.1) - bug fixes
pnpm release:patch

# Minor release (1.0.0 -> 1.1.0) - new features, backwards compatible
pnpm release:minor

# Major release (1.0.0 -> 2.0.0) - breaking changes
pnpm release:major

# Automatic bump based on conventional commits
pnpm release
```

### Automated Releases

Releases are automated via GitHub Actions:

1. **Push to main** triggers the release workflow
2. Workflow runs tests, bumps version, generates changelog
3. Creates and pushes git tag
4. Creates GitHub release
5. Publishes to npm

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add new feature` → minor version bump
- `fix: bug fix` → patch version bump
- `feat!: breaking change` or `BREAKING CHANGE:` in footer → major version bump
- `docs:`, `chore:`, `style:`, `refactor:`, `test:` → no version bump

### Manual Publishing

To publish manually (emergency only):

```bash
npm version patch|minor|major
git push --follow-tags
```

The publish workflow will trigger automatically on tag push.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT
