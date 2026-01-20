# Developer Framework Standardization Strategy — Complete Planning Summary

This document summarizes everything discussed in the planning process for RaftLabs' developer framework standardization initiative.

---

## 1. Company Context & Background

**Company:** RaftLabs (https://www.raftlabs.com/)

**Team Size:** 30 developers working across multiple projects

**Team Structure:**
- Full-stack projects: 1 frontend developer, 1 backend developer, 1 QA analyst, 1 project manager
- MVP/smaller projects: 1-2 developers, no dedicated project manager
- Senior/lead developers handle infrastructure, CI/CD, and deployments

**Initiative Goal:** Establish a strict organizational framework that developers must follow — with the understanding that it may seem restrictive initially, but long-term they will recognize it as the best decision.

---

## 2. Current Technology Stack

### Frontend
- **React** — Used in different configurations:
  - Tan Stack + React for admin panels
  - Next.js for landing pages and SEO-critical sites
- Multiple frontend projects often share components via monorepo

### Backend
- **AWS Lambda** with Serverless Framework (Node.js/TypeScript)
- **Hasura GraphQL** running on EC2 instance connected to PostgreSQL
- Custom Lambda functions for Hasura custom actions
- Frontend interacts exclusively through Hasura

### Database
- **PostgreSQL** (99% of projects)
- Connected via Hasura GraphQL layer

### Infrastructure
- **NX Workspace** monorepo (current setup):
  - Segregated frontend, backend projects
  - Shared libraries (frontend components, backend utilities, shared types)
- **Better-T-Stack** (migrating toward):
  - Hono + Supabase
  - Vercel deployment
  - Lightweight, scalable architecture

### Package Manager
- **PNPM** (preferred, moving away from NPM)
- All CLI tools should use `pnpm dlx` instead of `npx`

---

## 3. Pain Points Driving This Initiative

The framework standardization was triggered by several critical issues:

| Problem | Impact |
|---------|--------|
| PRs merged without review | Code quality deterioration, bugs reaching production |
| Merge conflicts discovered late | Blocked deployments, wasted developer time |
| Random branch names | Impossible to understand repository state |
| Vague commit messages | No traceability, can't understand what changed |
| Massive PRs (thousands of changes in 1-2 commits) | Unreviewable, high defect risk |
| Code lost during merges | Production incidents, data loss |
| No standard merge process | Inconsistent git history, difficult rollbacks |

---

## 4. Git Workflow Conventions

### 4.1 Branch Naming Convention

**Pattern:** `<type>/<short-description>`

```
^(main|staging|development)$|^(feature|bugfix|hotfix|chore|refactor)\/[a-z0-9-]+$
```

**Valid Examples:**
- `feature/user-authentication`
- `bugfix/login-redirect-issue`
- `hotfix/payment-gateway-timeout`
- `chore/update-dependencies`
- `refactor/api-error-handling`

**Rules:**
- All lowercase
- Words separated by hyphens
- Maximum 50 characters total
- Must start with type prefix
- No task IDs in branch names (they go in commit messages)

### 4.2 Commit Message Format

**Structure:**
```
<emoji> <type>(<scope>): <short description>

<optional body - what and why>

Task: <asana-link>
```

**Example:**
```
✨ feat(auth): add user login form

- Created LoginForm component with email/password fields
- Added form validation using react-hook-form
- Integrated with useLogin hook

Task: https://app.asana.com/0/1199376712191625/1212853704589953
```

**Commit Types with Emojis:**

| Type | Emoji | Description |
|------|-------|-------------|
| feat | ✨ | New feature |
| fix | 🐛 | Bug fix |
| docs | 📝 | Documentation |
| style | 💄 | Formatting, no code change |
| refactor | ♻️ | Code restructuring |
| perf | ⚡ | Performance improvement |
| test | ✅ | Adding tests |
| build | 📦 | Build system changes |
| ci | 👷 | CI configuration |
| chore | 🔧 | Maintenance tasks |
| revert | ⏪ | Revert changes |

**Rules:**
- First line under 72 characters
- Body explains *what* and *why* (not *how*)
- Task link is **mandatory**
- Blank line between subject, body, and task link

### 4.3 PR Workflow

**Small PR Philosophy:**
- One logical change per PR
- Target: < 400 lines changed (soft limit)
- Larger PRs must be justified in description
- Feature branches merge into `development`

**PR Requirements:**
1. Title follows commit convention: `feat(scope): description`
2. Description uses template
3. At least one approval required
4. All checks passing
5. No merge conflicts
6. Review SLA: 2-3 hours

**Merge Strategy:** Rebase merge (clean, linear history)

---

## 5. Tooling Stack Decision

### Research Findings

| Component | Selected Tool | Rationale |
|-----------|---------------|-----------|
| CLI Framework | Commander.js | Zero dependencies, industry standard |
| Interactive Prompts | @clack/prompts | Beautiful UI, 80% smaller than alternatives |
| Build Tool | tsup | esbuild-powered, handles ESM output |
| Package Manager | pnpm | Required by RaftLabs |
| Commit CLI | czg (cz-git CLI) | Modern, actively maintained, AI support |
| Commit Validation | commitlint | 4.4M weekly downloads, industry standard |
| Git Hooks | Husky v9 | 1.7M projects, ~1ms execution |
| Staged File Linting | lint-staged | Only lint changed files |
| Branch Validation | validate-branch-name | Actively maintained, configurable |
| AI PR Review | CodeRabbit or GitHub Copilot | Optional, Pro tier recommended |

### Runtime Dependencies (installed in target project)
```json
{
  "devDependencies": {
    "@commitlint/cli": "^19.0.0",
    "@commitlint/config-conventional": "^19.0.0",
    "cz-git": "^1.12.0",
    "czg": "^1.12.0",
    "husky": "^9.1.0",
    "lint-staged": "^15.0.0",
    "validate-branch-name": "^1.3.0"
  }
}
```

---

## 6. RaftStack CLI — The Delivery Mechanism

### Concept
A single "standards" repository containing all configuration files, Claude rules, and enforcement mechanisms. When starting a new project, developers run:

```bash
pnpm dlx raftstack init
```

This scaffolds all standard files into the new repository.

### CLI Output Structure
After running `raftstack init`, the target project will have:

```
target-project/
├── .husky/
│   ├── pre-commit              # lint-staged + branch validation
│   ├── commit-msg              # commitlint validation
│   └── pre-push                # build check (with caching)
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODEOWNERS
│   └── workflows/
│       ├── pr-checks.yml       # Lint, test, build validation
│       └── ai-review.yml       # CodeRabbit/Copilot config (optional)
├── commitlint.config.js        # Commit message rules
├── .czrc                       # cz-git configuration
├── .lintstagedrc.js            # lint-staged configuration
├── .prettierrc                 # Prettier configuration
├── .eslintrc.js                # ESLint configuration (if not exists)
├── CONTRIBUTING.md             # Developer guidelines
└── package.json                # Updated with scripts and devDeps
```

### CLI Development Phases (9 Phases, ~7 Days)

| Phase | Focus | Duration |
|-------|-------|----------|
| 1 | Project Setup | 0.5 days |
| 2 | Interactive Prompts | 1 day |
| 3 | Core Generators | 1.5 days |
| 4 | GitHub Integration | 0.5 days |
| 5 | Documentation & Package.json | 0.5 days |
| 6 | ESLint & Prettier | 0.5 days |
| 7 | Main Init Command | 1 day |
| 8 | Testing & Polish | 1 day |
| 9 | Publishing | 0.5 days |

---

## 7. Claude Code Skills — The AI Enhancement Layer

Beyond the CLI tooling, the strategy includes creating Claude Code skills that get bundled with the repository. When developers use Claude Code for development, these skills automatically apply best practices.

### 7.1 React Skill

**Purpose:** Enforce React 19+ best practices for any React code (new features, bug fixes, refactoring, entire apps)

**Key Patterns:**
- SOLID principles applied to components
- Single Responsibility: One component = one purpose
- Feature-based folder structure
- Small, focused files (< 150 lines)
- Performance optimization (memo, useMemo, useCallback)
- React 19 features: useActionState, useOptimistic, use() hook, Server Components

**Framework Detection:** The skill should detect which framework is being used (Next.js, Remix, Vite, Astro, etc.) and dynamically research framework-specific patterns to apply.

**Enforcement Behavior:**
| Violation | Correction |
|-----------|------------|
| Component doing multiple things | Split into smaller components |
| File > 150 lines | Extract into modules |
| Props drilling > 2 levels | Use context or composition |
| Missing memoization on expensive ops | Add useMemo/useCallback |
| Class components | Convert to functional |

### 7.2 Backend Skill

**Purpose:** Ensure high-quality, modular, readable backend code across any TypeScript backend (AWS Lambda, Hono, Express, etc.)

**Key Patterns:**
- Clean Architecture: handlers → services → repositories
- SOLID principles strictly enforced
- Handler functions are thin (only orchestration)
- Business logic in service layer
- Dependency injection
- Small, focused functions (< 50 lines)
- Proper error handling with context
- Input validation (Zod)
- Performance optimization (parallel operations, efficient loops)

**Enforcement Behavior:**
| Violation | Correction |
|-----------|------------|
| Handler with business logic | Extract to service |
| Function > 50 lines | Split into smaller functions |
| Sequential `await` for independent ops | Use `Promise.all()` |
| `any` type used | Replace with proper type |
| Missing input validation | Add Zod schema |
| Direct `process.env` in business logic | Inject via config |

### 7.3 Database Skill

**Purpose:** Create scalable, optimized PostgreSQL schemas using Drizzle ORM with proper normalization, indexing, and relationship patterns.

**Key Patterns:**
- Normalization: 3NF as baseline
- When to split tables vs. keep together (decision framework)
- Index strategy: B-tree, GIN, GiST, partial, composite
- Primary keys: `generatedAlwaysAsIdentity()` not `serial()`
- Timestamps: `createdAt`, `updatedAt` on every table
- Soft delete pattern: `deletedAt` timestamp
- Foreign key cascade rules
- JSONB over JSON for queryable data
- Cursor-based pagination for large tables

**Enforcement Behavior:**
| Violation | Correction |
|-----------|------------|
| Missing timestamps | Add createdAt/updatedAt |
| Missing index on FK | Add index |
| serial() used | Use generatedAlwaysAsIdentity() |
| json() used | Use jsonb() |
| Non-atomic columns | Normalize into separate table |
| Missing onDelete on FK | Add cascade rule |
| Offset pagination on large table | Use cursor-based |

### 7.4 SEO Skill

**Purpose:** Achieve maximum technical SEO for any frontend project (Next.js, React SPA, Vite, Vue/Nuxt, Astro)

**Capabilities:**
- Framework detection and framework-specific research
- Meta tags and Open Graph implementation
- Structured data (JSON-LD): Organization, Article, Product, FAQ, BreadcrumbList
- Core Web Vitals optimization (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- XML sitemap generation
- robots.txt configuration
- Canonical URLs and duplicate content prevention
- Mobile-first optimization
- Image optimization patterns
- Rendering strategy recommendations (SSR, SSG, ISR, CSR)

**Use Cases:**
1. Setting up SEO for new projects
2. Debugging SEO issues
3. Improving existing SEO implementation
4. SEO audits and reviews

### 7.5 Code Quality Skill (Universal)

**Purpose:** Ensure code is immediately readable and understandable by developers of any experience level — the "10-second rule" (can a junior developer understand this code in under 10 seconds?)

**Key Patterns:**
- Intention-revealing names (variables, functions, files)
- Small, focused functions that do one thing
- Early returns to avoid deep nesting (max 3 levels)
- Consistent patterns throughout codebase
- Self-documenting code over comments
- Comments explain "why" not "what"
- Proper file organization (imports, constants, main code, helpers)
- AAA pattern for tests (Arrange, Act, Assert)

**Enforcement Behavior:**
| Violation | Correction |
|-----------|------------|
| Single-letter variable names | Use descriptive names |
| Functions > 30 lines | Split into smaller functions |
| Functions with > 3 parameters | Use object parameter |
| Nesting depth > 3 levels | Use early returns |
| Comments explaining "what" | Rewrite to explain "why" |
| Magic numbers/strings | Extract to named constants |
| Generic names (data, info, temp) | Use specific names |

**The Ultimate Check:**
> "Can a junior developer understand this code in under 10 seconds?"

---

## 8. Implementation Strategy

### Phase 1: RaftStack CLI Development
- Build and publish the CLI tool
- All configuration files, hooks, and templates ready
- Documentation (CONTRIBUTING.md, README)
- Testing and validation

### Phase 2: Claude Code Skills Creation
- Use deep research prompt to create each skill
- Skills are bundled with the standards repository
- When developers initialize a project, skills are included
- Skills activate during Claude Code usage

### Skill Creation Approach
A comprehensive prompt was developed for Claude Code to create each skill sequentially:
1. Research latest best practices (2024-2025) for the domain
2. Create SKILL.md with proper format
3. Include enforcement behaviors
4. Move to next skill

---

## 9. Key Configuration Files (Summary)

### commitlint.config.js
- Conventional commits with emojis
- Mandatory Asana task link rule (custom plugin)
- NX scopes support for monorepos

### .czrc (cz-git configuration)
- Emoji-enabled commit types
- Interactive prompts for scope, description, body
- Asana task link prompt (mandatory)

### .husky hooks
- **pre-commit:** lint-staged + branch validation
- **commit-msg:** commitlint validation
- **pre-push:** build check

### PR Template
- Structured sections: What, Why, Testing, Checklist
- Size classification (XS/S/M/L/XL)
- Mandatory items enforced via checklist

---

## 10. Success Metrics

When fully implemented, the framework should achieve:

| Metric | Target |
|--------|--------|
| PRs reviewed before merge | 100% |
| Commits with task links | 100% |
| Branch names following convention | 100% |
| Merge conflicts at PR time | < 5% |
| Average PR size | < 400 lines |
| Code review turnaround | < 3 hours |
| Codebase consistency | Visually indistinguishable between developers |

---

## 11. Next Steps

1. **Complete RaftStack CLI development** (currently in progress)
2. **Create Claude Code skills** using the comprehensive prompt
3. **Roll out to one pilot project** for validation
4. **Gather feedback and iterate**
5. **Organization-wide deployment**
6. **Ongoing maintenance** via centralized standards repository

---

*This summary represents the complete planning discussion for the RaftLabs developer framework standardization initiative. The goal is to create a sustainable, enforceable system that improves code quality, developer experience, and long-term maintainability across all projects.*
