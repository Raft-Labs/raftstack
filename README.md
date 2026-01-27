# RaftStack

CLI tool for setting up Git hooks, commit conventions, and GitHub integration in your projects.

[![npm version](https://badge.fury.io/js/%40raftlabs%2Fraftstack.svg)](https://www.npmjs.com/package/@raftlabs/raftstack)

## What It Does

RaftStack automates development best practices:

- **Git hooks** with Husky (pre-commit, commit-msg, pre-push)
- **Commit conventions** with Commitlint and cz-git
- **Code formatting** with lint-staged and Prettier
- **Branch naming** validation
- **GitHub workflows** for PR checks
- **CODEOWNERS** for automatic reviewer assignment
- **AI code review** integration (CodeRabbit, GitHub Copilot)
- **Claude Code skills** for AI-assisted development

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

After setup:
```bash
pnpm install        # Install dependencies
pnpm commit         # Make commits using interactive wizard
```

## Commands

| Command | Description |
|---------|-------------|
| `raftstack init` | Interactive setup wizard |
| `raftstack setup-protection` | Configure GitHub branch protection via API |
| `raftstack metrics` | Check repository compliance |

## Documentation

📖 **[Full User Guide](docs/USER_GUIDE.md)** — Complete reference including:
- All features explained in detail
- Claude Code skills and slash commands
- Daily development workflow
- Troubleshooting guide
- Files generated

## Commit & Branch Conventions

### Commit Types

Use `pnpm commit` for the interactive wizard, or follow this format:

```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

### Branch Naming

```
feature/description    fix/description    hotfix/description
release/v1.0.0        chore/task-name    docs/update
```

## Troubleshooting

### Hooks not running
```bash
pnpm exec husky
chmod +x .husky/*
```

### Commit validation failing
```bash
pnpm commit  # Use interactive wizard
```

### Branch name rejected
```bash
git branch -m old-name feature/new-name
```

See [docs/USER_GUIDE.md](docs/USER_GUIDE.md#troubleshooting) for more solutions.

## Requirements

- Node.js >= 18
- Git repository initialized
- Package manager: pnpm, npm, or yarn

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT
