# RaftStack

CLI tool for setting up Git hooks, commit conventions, and GitHub integration.

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

This will configure:
- Git hooks (pre-commit, commit-msg, pre-push)
- Commit message validation
- Code formatting with Prettier
- Branch naming validation
- GitHub PR workflows and CODEOWNERS

## Other Commands

```bash
raftstack setup-protection  # Configure GitHub branch protection
raftstack metrics           # Check repository compliance
```

## Documentation

Full documentation: [github.com/Raft-Labs/raftstack](https://github.com/Raft-Labs/raftstack)
