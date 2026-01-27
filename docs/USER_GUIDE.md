# RaftStack User Guide

The complete guide for teams using RaftStack to enforce consistent Git workflows, commit conventions, and code quality.

---

## Table of Contents

- [What is RaftStack?](#what-is-raftstack)
- [Quick Start](#quick-start)
- [Features Overview](#features-overview)
  - [Git Hooks & Commit Conventions](#git-hooks--commit-conventions)
  - [Code Quality Tools](#code-quality-tools)
  - [Branch Management](#branch-management)
  - [GitHub Integration](#github-integration)
  - [Monorepo Support](#monorepo-support)
  - [Optional Integrations](#optional-integrations)
- [Claude Code Integration](#claude-code-integration)
  - [Skills](#skills-automatic-quality-enforcement)
  - [Slash Commands](#slash-commands-ai-workflows)
- [The Complete Workflow](#the-complete-workflow)
  - [Initial Setup](#initial-setup-one-time)
  - [Claude Code Setup](#first-time-claude-code-setup)
  - [Daily Development](#daily-development-workflow)
  - [Maintaining Standards](#maintaining-standards)
- [Command Reference](#command-reference)
- [Conventions Reference](#conventions-reference)
- [Troubleshooting](#troubleshooting)
- [Files Generated](#files-generated)
- [Getting Help](#getting-help)

---

## What is RaftStack?

RaftStack is a CLI tool and AI-assisted development framework that brings consistency to your Git workflows. It solves common problems that plague development teams:

| Problem | RaftStack Solution |
|---------|-------------------|
| Vague commit messages | Interactive commit wizard with conventional commits |
| Random branch names | Automated branch naming validation |
| PRs merged without review | GitHub workflow requiring approvals |
| Massive, unreviewable PRs | PR template encouraging small, focused changes |
| Inconsistent code style | ESLint + Prettier + lint-staged automation |
| No traceability | Optional Asana task linking in commits |

RaftStack is designed for teams who want to enforce strict standards without constant manual enforcement.

---

## Quick Start

### Installation

Run this command in your project root:

```bash
pnpm dlx @raftlabs/raftstack init
```

Or with npm:
```bash
npx @raftlabs/raftstack init
```

### What Happens During Init

The CLI will:

1. **Detect your project type** (NX, Turborepo, pnpm workspace, or single package)
2. **Detect your package manager** (npm, pnpm, yarn)
3. **Ask configuration questions:**
   - Asana integration (optional task linking)
   - AI code review tool (CodeRabbit, GitHub Copilot, or none)
   - CODEOWNERS (GitHub usernames for auto-assignment)
4. **Generate configuration files** (see [Files Generated](#files-generated))
5. **Update package.json** with scripts and devDependencies

### First Commit

After installation, make your first commit using the interactive wizard:

```bash
pnpm commit
```

This launches an interactive prompt that guides you through creating a properly formatted commit message.

---

## Features Overview

### Git Hooks & Commit Conventions

RaftStack installs three Git hooks via Husky:

#### Pre-commit Hook
Runs `lint-staged` to:
- Lint and auto-fix staged files with ESLint
- Format staged files with Prettier
- Run type checking on TypeScript files

#### Commit-msg Hook
Validates commit messages using Commitlint:
- Enforces conventional commit format
- Requires commit type (feat, fix, docs, etc.)
- Validates message structure

#### Pre-push Hook
Before pushing to remote:
- Validates branch naming convention
- Runs the project build
- Fails push if build fails

#### Interactive Commit Wizard

The `pnpm commit` command launches cz-git, providing:
- Type selection with emoji support
- Scope selection (optional)
- Subject line with character limit
- Body for detailed descriptions
- Breaking change prompts
- Issue/task linking

### Code Quality Tools

#### ESLint Configuration
RaftStack generates ESLint 9 flat config with:
- Framework-aware rules (Next.js, React detection)
- TypeScript support
- Import ordering
- Prettier integration

#### Prettier Configuration
Standard formatting rules:
- 2-space indentation
- Single quotes
- Trailing commas
- 100-character line width

#### lint-staged
Runs on pre-commit for staged files only:
```javascript
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

### Branch Management

#### Naming Convention

Branches must follow this pattern:
```
^(main|master|develop|staging|production)$|^(feature|fix|hotfix|bugfix|release|chore|docs|refactor|test|ci)\/[a-z0-9._-]+$
```

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/*` | `feature/user-authentication` |
| Bug fix | `fix/*` or `bugfix/*` | `fix/login-redirect` |
| Hotfix | `hotfix/*` | `hotfix/security-patch` |
| Release | `release/*` | `release/v1.2.0` |
| Chore | `chore/*` | `chore/update-deps` |
| Docs | `docs/*` | `docs/readme-update` |
| Refactor | `refactor/*` | `refactor/api-cleanup` |
| Test | `test/*` | `test/add-unit-tests` |
| CI | `ci/*` | `ci/update-workflow` |

**Rules:**
- All lowercase
- Words separated by hyphens
- No spaces or special characters (except `.`, `_`, `-`)

#### Protected Branches

RaftStack generates documentation for setting up branch protection. Recommended settings:

- Require pull request reviews (1+ approvals)
- Require status checks to pass
- Require conversation resolution
- Restrict who can push to main/master

### GitHub Integration

#### PR Template

Located at `.github/PULL_REQUEST_TEMPLATE.md`:
- Description section
- Type of change checkboxes
- Asana task link (if enabled)
- Changes made list
- Testing checklist
- Screenshots section
- Code quality checklist

#### CODEOWNERS

Auto-assigns reviewers based on file paths:
```
# Default reviewers for everything
* @username1 @username2
```

#### CI Workflow

`.github/workflows/pr-checks.yml` runs on all PRs:
- Type checking (if TypeScript)
- Linting (if ESLint)
- Build
- Tests

Adapts commands based on project type:
- **NX:** Uses `nx affected` for incremental builds
- **Turborepo:** Uses `turbo build`
- **Standard:** Uses `pnpm build`

#### AI Code Review

Optional integration with:
- **CodeRabbit:** Automated AI code review
- **GitHub Copilot:** Native GitHub AI review

### Monorepo Support

RaftStack detects and supports:

| Type | Detection | Build Command |
|------|-----------|---------------|
| NX | `nx.json` present | `nx affected --target=build` |
| Turborepo | `turbo.json` present | `turbo build` |
| pnpm Workspace | `pnpm-workspace.yaml` present | `pnpm -r build` |
| Single Package | Default | `pnpm build` |

For monorepos, RaftStack generates shared configuration files in appropriate locations.

### Optional Integrations

#### Asana Task Linking

When enabled:
- Commit wizard prompts for Asana task URL
- PR template includes Asana section
- Commitlint warns (not errors) for missing task links

Format: `Task: https://app.asana.com/0/PROJECT_ID/TASK_ID`

---

## Claude Code Integration

RaftStack includes skills and slash commands for AI-assisted development with Claude Code.

### Skills (Automatic Quality Enforcement)

When using Claude Code, these skills automatically apply best practices:

| Skill | Location | What It Enforces |
|-------|----------|------------------|
| React | `.claude/skills/react/` | Server Components by default, 30-line functions, max 3 concerns per component, React 19 patterns |
| Backend | `.claude/skills/backend/` | Handler→Service→Repository architecture, Zod validation, <50 line functions |
| Database | `.claude/skills/database/` | Foreign key indexes, `generatedAlwaysAsIdentity()`, JSONB over JSON, cursor pagination |
| SEO | `.claude/skills/seo/` | Core Web Vitals, metadata, structured data, Next.js Metadata API |
| Code Quality | `.claude/skills/code-quality/` | 30-line max functions, max 3 nesting levels, descriptive naming |
| Asana | `.claude/skills/asana/` | MCP tool usage, rich text formatting (only if Asana enabled) |

Skills are triggered automatically based on what you're working on.

### Slash Commands (AI Workflows)

Use these commands in Claude Code conversations:

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/raftstack/help` | Check project status and get guidance | Unsure what to do next |
| `/raftstack/init-context` | Generate a project constitution | First-time setup |
| `/raftstack/discover [area]` | Extract patterns as reusable standards | Document existing code patterns |
| `/raftstack/inject [domain]` | Surface relevant context for current work | Before coding in a specific domain |
| `/raftstack/shape [task]` | Plan a feature with appropriate depth | Starting new work |
| `/raftstack/index` | Update standards registry | After adding standards |

#### Command Details

**`/raftstack/help`**
Scans your project for RaftStack artifacts (constitution, standards, registry, skills) and recommends what to do next. Shows project health status.

**`/raftstack/init-context`**
Analyzes your codebase and generates a constitution document capturing:
- Project structure
- Tech stack
- Existing patterns
- Conventions

**`/raftstack/discover [area]`**
Deep-dives into a specific area (API, components, database, etc.) and extracts patterns into reusable standard documents.

**`/raftstack/inject [domain]`**
Surfaces relevant standards and skills for your current task. Useful before starting work in a specific domain.

**`/raftstack/shape [task]`**
Plans features with scale-adaptive depth:
- **Quick Flow:** Simple tasks → brief description → implement
- **Light Spec:** Medium tasks → implementation plan with steps
- **Full Spec:** Complex features → timestamped folder with architecture docs

**`/raftstack/index`**
Scans all standards files and creates a registry. Detects drift between standards and actual code.

---

## The Complete Workflow

### Initial Setup (One-Time)

1. **Install RaftStack**
   ```bash
   pnpm dlx @raftlabs/raftstack init
   ```

2. **Answer configuration prompts**
   - Select project type (or accept auto-detected)
   - Enable/disable Asana integration
   - Choose AI review tool
   - Add CODEOWNERS usernames

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Set up GitHub branch protection**
   - Go to Repository Settings → Branches → Add rule
   - Apply to `main` (or `master`)
   - Enable required reviews
   - Enable required status checks

### First-Time Claude Code Setup

If using Claude Code for development:

1. **Check project status**
   ```
   /raftstack/help
   ```

2. **Generate project constitution**
   ```
   /raftstack/init-context
   ```

3. **Document existing patterns** (optional)
   ```
   /raftstack/discover API
   /raftstack/discover components
   ```

4. **Create standards registry**
   ```
   /raftstack/index
   ```

### Daily Development Workflow

```
1. Create branch          git checkout -b feature/my-feature
2. Surface context        /raftstack/inject [domain]
3. Plan complex work      /raftstack/shape [task description]
4. Write code            (skills auto-enforce quality)
5. Stage changes         git add .
6. Commit                pnpm commit
7. Push                  git push (validates branch + runs build)
8. Create PR             (uses template)
9. Wait for reviews      AI review + human approval
10. Merge                After approval
```

### Maintaining Standards

- **Periodically:** Run `/raftstack/index` to check for drift
- **When patterns change:** Run `/raftstack/discover [area]` to update standards
- **When project evolves:** Update constitution with `/raftstack/init-context`

---

## Command Reference

### CLI Commands

| Command | Description |
|---------|-------------|
| `raftstack init` | Initialize RaftStack in a project |
| `raftstack metrics` | View compliance metrics and codebase statistics |

### Package.json Scripts Added

| Script | Command | Description |
|--------|---------|-------------|
| `prepare` | `husky` | Husky hook setup (runs on install) |
| `commit` | `czg` | Interactive commit wizard |
| `lint` | `eslint .` | Run ESLint |
| `lint:fix` | `eslint . --fix` | Auto-fix lint issues |
| `format` | `prettier --write .` | Format all files |
| `format:check` | `prettier --check .` | Check formatting |
| `typecheck` | `tsc --noEmit` | TypeScript validation |

---

## Conventions Reference

### Commit Types

| Type | Emoji | When to Use |
|------|-------|-------------|
| `feat` | ✨ | New feature for users |
| `fix` | 🐛 | Bug fix for users |
| `docs` | 📝 | Documentation changes |
| `style` | 💄 | Formatting (no logic change) |
| `refactor` | ♻️ | Code restructuring (no behavior change) |
| `perf` | ⚡️ | Performance improvement |
| `test` | ✅ | Adding or updating tests |
| `build` | 📦 | Build system or dependencies |
| `ci` | 🎡 | CI/CD configuration |
| `chore` | 🔧 | Other changes (tooling, etc.) |
| `revert` | ⏪ | Reverting previous changes |

### Commit Message Format

```
<emoji> <type>(<scope>): <description>

[optional body]

[optional footer]
```

**Examples:**
```
✨ feat(auth): add user login form

- Created LoginForm component with email/password fields
- Added form validation using react-hook-form
- Integrated with useLogin hook

Task: https://app.asana.com/0/1199376712191625/1212853704589953
```

```
🐛 fix(api): handle null response from user endpoint
```

---

## Troubleshooting

### Pre-commit Hook Failing

**Symptom:** Commit blocked with lint errors

**Solutions:**
1. Run `pnpm lint:fix` to auto-fix issues
2. Manually fix remaining errors
3. Stage the fixed files and commit again

### Commit Message Rejected

**Symptom:** Commitlint blocks the commit

**Common issues:**
- Missing type prefix → Use `feat:`, `fix:`, etc.
- Subject too long → Keep under 100 characters
- Empty subject → Add a description after the colon
- Wrong case → Subject must be lowercase

**Solution:** Use `pnpm commit` instead of `git commit` for guided commits

### Branch Name Validation Failed

**Symptom:** Push rejected with branch name error

**Solutions:**
1. Rename branch: `git branch -m old-name feature/new-name`
2. Ensure format: `type/description-with-hyphens`
3. Use lowercase only

### Build Errors on Push

**Symptom:** Pre-push hook fails

**Solutions:**
1. Run `pnpm build` locally to see errors
2. Fix build issues
3. Push again

### Missing Asana Link Warning

**Symptom:** Commit shows warning about missing task link

**Note:** This is a warning, not an error. Commits without task links are allowed but discouraged.

**Solution:** Add task link in commit body or accept the warning

### ESLint Not Finding Config

**Symptom:** ESLint can't find configuration

**Solutions:**
1. Check for `eslint.config.js` (ESLint 9 flat config)
2. Ensure all dependencies are installed: `pnpm install`
3. For monorepos, check workspace-level config

---

## Files Generated

RaftStack creates or modifies these files:

### Git Hooks
| File | Purpose |
|------|---------|
| `.husky/pre-commit` | Runs lint-staged |
| `.husky/commit-msg` | Runs commitlint |
| `.husky/pre-push` | Validates branch name, runs build |

### Configuration Files
| File | Purpose |
|------|---------|
| `commitlint.config.js` | Commit message rules + cz-git prompts |
| `.czrc` | Points to cz-git adapter |
| `eslint.config.js` | ESLint 9 flat config |
| `.prettierrc` | Prettier formatting rules |
| `.lintstagedrc.js` | lint-staged configuration |

### GitHub Files
| File | Purpose |
|------|---------|
| `.github/PULL_REQUEST_TEMPLATE.md` | PR template |
| `.github/CODEOWNERS` | Auto-assigns reviewers |
| `.github/workflows/pr-checks.yml` | CI workflow |

### Documentation
| File | Purpose |
|------|---------|
| `CONTRIBUTING.md` | Developer guidelines |
| `docs/BRANCH_PROTECTION.md` | Branch protection setup guide |
| `docs/QUICK_REFERENCE.md` | Commands quick reference |

### Claude Code (AI Integration)
| Directory | Purpose |
|-----------|---------|
| `.claude/skills/react/` | React development skill |
| `.claude/skills/backend/` | Backend development skill |
| `.claude/skills/database/` | Database design skill |
| `.claude/skills/seo/` | SEO optimization skill |
| `.claude/skills/code-quality/` | General code quality skill |
| `.claude/skills/asana/` | Asana integration skill (if enabled) |
| `.claude/commands/raftstack/` | Slash commands |

### Package.json Modifications
- Added scripts: `prepare`, `commit`, `lint`, `lint:fix`, `format`, `format:check`, `typecheck`
- Added devDependencies: husky, lint-staged, commitlint, cz-git, czg, validate-branch-name, eslint, prettier

---

## Getting Help

- **Documentation:** Check the generated `docs/` folder in your project
- **Issues:** Report bugs at [RaftStack GitHub Issues](https://github.com/raftlabs/raftstack/issues)
- **Claude Code:** Use `/raftstack/help` for AI-guided assistance
