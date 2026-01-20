# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-01-20

### Added

#### Core Features
- **Interactive init wizard** - Configure Git hooks, commit conventions, and GitHub integration
- **Project type detection** - Auto-detect NX, Turborepo, pnpm workspace, or single package
- **Git hooks via Husky** - pre-commit, commit-msg, and pre-push hooks
- **Commit conventions** - Commitlint validation with conventional commits
- **Interactive commit wizard** - cz-git integration with `pnpm commit`
- **Branch naming validation** - Enforce consistent branch naming patterns
- **lint-staged integration** - Run formatters and linters on staged files only

#### GitHub Integration
- **PR template** - Structured pull request template with checklist
- **PR checks workflow** - CI workflow for linting, testing, and building
- **CODEOWNERS** - Automatic reviewer assignment
- **Branch protection docs** - Setup guide with automated configuration

#### Optional Integrations
- **Asana task linking** - Optional task reference in commits and PRs
- **CodeRabbit** - AI code review configuration
- **GitHub Copilot** - Copilot review workflow

#### Claude Code Skills
- **React skill** - React 19+ patterns, SOLID principles, performance optimization
- **Backend skill** - Clean architecture for serverless backends
- **Database skill** - PostgreSQL/Drizzle ORM best practices
- **SEO skill** - Technical SEO for modern web frameworks
- **Code quality skill** - Universal readability and maintainability rules

#### CLI Commands
- `raftstack init` - Interactive setup wizard
- `raftstack setup-protection` - Configure GitHub branch protection rules

#### Branch Protection Enhancements
- Multi-branch protection (main, staging, production, development)
- Merge strategy configuration (rebase, squash, merge)
- Repository-level merge settings

### Technical Details

- Built with Commander.js, @clack/prompts, and tsup
- ESM-only package with Node.js >= 18 requirement
- 191 automated tests (unit, integration, E2E)
- CI workflow for typecheck, test, and build validation

[Unreleased]: https://github.com/raftlabs/raftstack/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/raftlabs/raftstack/releases/tag/v1.0.0
