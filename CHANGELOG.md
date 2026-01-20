# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.2.1](https://github.com/Raft-Labs/raftstack/compare/v1.2.0...v1.2.1) (2026-01-20)


### Bug Fixes

* correct path resolution for Claude skills directory ([c4ce1b8](https://github.com/Raft-Labs/raftstack/commit/c4ce1b858496a3993585ecd00751528a6c65e4c6))


### Documentation

* add automated versioning implementation plan ([d023e62](https://github.com/Raft-Labs/raftstack/commit/d023e6294f1de72f6f1fd1316f867afdc9c3a402))
* add repository setup instructions ([144d188](https://github.com/Raft-Labs/raftstack/commit/144d188277263d247a032a6aa99c40346a114382))
* add version commands quick reference ([4b0698d](https://github.com/Raft-Labs/raftstack/commit/4b0698de8512d468a2dc7522dd5f014b70616c8c))
* mark completed items in phase plans ([ad90c74](https://github.com/Raft-Labs/raftstack/commit/ad90c74a18db37f402fb613d451729d2aa355587))
* mark Phase 1 and Phase 2 tasks complete ([a6b972c](https://github.com/Raft-Labs/raftstack/commit/a6b972c01ce8729bba7ccb5ffb87fd77e645dd3e))
* mark Phase 3 pre-release tasks complete ([c24cf2c](https://github.com/Raft-Labs/raftstack/commit/c24cf2ceaef19492447226d9bf823ceefe934e95))
* update progress with automated versioning status ([52a2d47](https://github.com/Raft-Labs/raftstack/commit/52a2d474209d54f4647b1315aeaf842f2db9acbe))

## [1.2.0](https://github.com/Raft-Labs/raftstack/compare/v1.0.0...v1.2.0) (2026-01-20)


### Features

* add backend skill for Claude Code ([a5a75bf](https://github.com/Raft-Labs/raftstack/commit/a5a75bf59572a5878d8faf27c3c4d59863d52478))
* add code-quality skill for Claude Code ([a1a5ac9](https://github.com/Raft-Labs/raftstack/commit/a1a5ac9f098f9876fe81bfa3d812160a26909b79))
* add database skill for Claude Code ([bccb704](https://github.com/Raft-Labs/raftstack/commit/bccb7040313360dc387b9964cb21b8b775d91a23))
* add react skill for Claude Code ([4507c00](https://github.com/Raft-Labs/raftstack/commit/4507c00e63fe60d416783cd4245dafc0088e1a52))
* add seo skill for Claude Code ([51054ee](https://github.com/Raft-Labs/raftstack/commit/51054eefae10408149fd0f0bddb1913c40afd9e1))
* **cli:** add claude skills generator for bundling skills in npm package ([8131683](https://github.com/Raft-Labs/raftstack/commit/81316838e55a0541280c1837a145b2b70a1684db))
* **cli:** add metrics command for compliance analysis ([0cff3db](https://github.com/Raft-Labs/raftstack/commit/0cff3db14d5730d89c8f5c2e31161e0548067926))
* **cli:** enhance branch protection with multi-branch and merge strategy support ([084f5eb](https://github.com/Raft-Labs/raftstack/commit/084f5eb31fb760d92d373cf02d1041fd99ee0eb1))
* **generator:** add quick reference guide generator ([c5515a8](https://github.com/Raft-Labs/raftstack/commit/c5515a8d3141f43645ff0257edca6d9e032c844b))
* **generators:** add ESLint 9+ flat config generator ([0d5c246](https://github.com/Raft-Labs/raftstack/commit/0d5c246ff3497a2f82dec70ada56d3956e5a01b4))


### Bug Fixes

* **generators:** enable Asana task link rule and add PR size guidelines ([56e65c5](https://github.com/Raft-Labs/raftstack/commit/56e65c5a16de41d72edfca2125ca573e97902f64))


### Code Refactoring

* **skills:** enhance backend skill with Context7 research ([cdbf90a](https://github.com/Raft-Labs/raftstack/commit/cdbf90a30ef0b64fed8e6f2dd646708216585d73))
* **skills:** enhance backend skill with Context7 research ([92d97dd](https://github.com/Raft-Labs/raftstack/commit/92d97dd1a31cec292c508082896a00e674bcafa2))
* **skills:** enhance code-quality skill with automated enforcement ([34146da](https://github.com/Raft-Labs/raftstack/commit/34146da35bb52156f1317a0f92bd752dd436f921))
* **skills:** enhance database skill with Context7 research ([e83e73d](https://github.com/Raft-Labs/raftstack/commit/e83e73da928d26d16868fc1dd8f8a528a4fa679f))
* **skills:** enhance react skill with Context7 research ([9e6edc7](https://github.com/Raft-Labs/raftstack/commit/9e6edc7eb886508d25ac7b3a8cda481841d6a3cf))
* **skills:** enhance seo skill with Context7 research ([16c6a26](https://github.com/Raft-Labs/raftstack/commit/16c6a261d5fb9c1949c9570eb40de68982027073))


### Build System

* add standard-version for automated versioning ([63d84ac](https://github.com/Raft-Labs/raftstack/commit/63d84ac47b3cda97e6062c95e0dc640b59f9cc18))


### Tests

* add unit tests for quick-reference generator ([c92a170](https://github.com/Raft-Labs/raftstack/commit/c92a1709b777d2c895bdac3aba0f56ab857e0979))
* **e2e:** add E2E tests with project fixtures ([f8dcf0e](https://github.com/Raft-Labs/raftstack/commit/f8dcf0e667dd0cd6b173060845589ac3920db96a))
* **generators:** add unit tests for 8 generators ([772a560](https://github.com/Raft-Labs/raftstack/commit/772a5604073495f5a8d9eecfcf3ef90d24fc9de9))
* **generators:** complete unit tests for all 13 generators ([f74ef09](https://github.com/Raft-Labs/raftstack/commit/f74ef0926b36e184dd28216963a1ae7a62fadfa5))
* **integration:** add integration tests for generators ([b7be81c](https://github.com/Raft-Labs/raftstack/commit/b7be81c22b0e18746beaa0328b43db7207a7ed65))


### Documentation

* add comprehensive README and CHANGELOG for v1.0.0 ([c00362c](https://github.com/Raft-Labs/raftstack/commit/c00362c412a5cd64ea2a40c457e6ac1a9a575210))
* add metrics command and org rollout documentation ([cecf3ab](https://github.com/Raft-Labs/raftstack/commit/cecf3ab2d47383aa91c3727173a375f6500e44ec))
* add project strategy and goals documentation ([7621d75](https://github.com/Raft-Labs/raftstack/commit/7621d75a5535fc2224c5de0f9d88b54f0966e59b))
* add release process guide ([0a658ab](https://github.com/Raft-Labs/raftstack/commit/0a658abdf871f3c7712416ce7ce07f1c59f1c82f))
* add roadmap, progress tracking, and phase plans ([890015d](https://github.com/Raft-Labs/raftstack/commit/890015d2900157bda35b4c7a2ddc7072e6ec9800))
* add versioning and release documentation ([f0f7687](https://github.com/Raft-Labs/raftstack/commit/f0f7687faa81110babe5e3e4a303a5f37f9121f2))
* enhance CLAUDE.md with architecture and skills ([c615635](https://github.com/Raft-Labs/raftstack/commit/c6156354d7009a76e268f12505ddd99831812ee4))
* mark Phase 3 as ready for release ([2ec2932](https://github.com/Raft-Labs/raftstack/commit/2ec293289077332fa561585c540a5a7232c98482))
* update progress tracking for Phase 3 ([40805ea](https://github.com/Raft-Labs/raftstack/commit/40805eaa267c197190af00c95adb863b0094cd37))
* update progress with Phase 4/5 tooling completion ([f1dfce8](https://github.com/Raft-Labs/raftstack/commit/f1dfce8a3cde789b16b8e84cfa6eee3621321ca6))
* update PROGRESS.md with Phase 1 completion ([6a542fe](https://github.com/Raft-Labs/raftstack/commit/6a542fef5a17fc582b8e9201bf0c104f7272b244))
* update PROGRESS.md with Phase 1.1 completion ([f99a2dc](https://github.com/Raft-Labs/raftstack/commit/f99a2dcdc1e29e8d1ad55ac82271d374273ba8aa))
* update PROGRESS.md with Phase 2 completion ([bbd90ec](https://github.com/Raft-Labs/raftstack/commit/bbd90ec7d66b67f68916c74c7aabb4b99441d261))
* update roadmap with current completion status ([0521937](https://github.com/Raft-Labs/raftstack/commit/0521937b6784a054c3a8ea3e01d9b0bda1ba9d88))


### CI/CD

* add automated release workflow ([1a5bbcc](https://github.com/Raft-Labs/raftstack/commit/1a5bbccf4eb519efc47ee6ad5a629417dd490743))
* add CI workflow for PR and push validation ([44da447](https://github.com/Raft-Labs/raftstack/commit/44da447ba0b155ba46c4793fd0cadf17b59fd27e))
* skip CI on automated release commits ([7bbaaf4](https://github.com/Raft-Labs/raftstack/commit/7bbaaf45ea56f372352126c9088aac019b7234e3))
* update publish workflow to trigger on GitHub releases ([cc1e823](https://github.com/Raft-Labs/raftstack/commit/cc1e82361ddce586a57616fb14d91c40e2caacc6))

## [1.1.0] - 2026-01-20

### Added

#### CLI Commands
- `raftstack metrics` - Analyze repository compliance with RaftStack conventions
  - Commit task link compliance (Asana/GitHub issue references)
  - Branch naming convention compliance
  - Color-coded compliance percentages

#### Generators
- **Quick Reference guide** - `.github/QUICK_REFERENCE.md` one-page cheat sheet
  - Branch naming conventions
  - Commit format with emojis
  - PR checklist
  - Common mistakes to avoid

#### Org Rollout Support
- **Deployment helper script** - `scripts/deploy-to-project.sh` for batch rollout
  - Creates setup branch
  - Runs init with defaults
  - Commits and creates PR

### Changed
- Test count increased from 191 to 199 (8 new quick-reference tests)
- Updated documentation for Phase 4/5 rollout support

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
- 199 automated tests (unit, integration, E2E)
- CI workflow for typecheck, test, and build validation

[Unreleased]: https://github.com/raftlabs/raftstack/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/raftlabs/raftstack/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/raftlabs/raftstack/releases/tag/v1.0.0
