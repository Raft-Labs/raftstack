# RaftStack

CLI tool for setting up Git hooks, commit conventions, and GitHub integration.

## Features

- Git hooks (pre-commit, commit-msg, pre-push) via Husky
- Commit message validation with Commitlint
- Interactive commit wizard with cz-git
- Code formatting with Prettier and lint-staged
- Branch naming validation
- GitHub PR workflows and CODEOWNERS
- Claude Code skills for AI-assisted development

## Installation

```bash
pnpm dlx @raftlabs/raftstack init
# or
npx @raftlabs/raftstack init
```

## Usage

Run the interactive setup wizard in your project:

```bash
raftstack init
```

This configures Git hooks, commit conventions, code formatting, and GitHub integration.

## Commands

```bash
raftstack init              # Interactive setup wizard
raftstack setup-protection  # Configure GitHub branch protection
raftstack metrics           # Check repository compliance
```

## Documentation

Full documentation and user guide: [github.com/Raft-Labs/raftstack](https://github.com/Raft-Labs/raftstack)

## License

MIT
