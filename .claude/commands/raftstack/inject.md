# RaftStack: Inject Relevant Context

Surface relevant standards and skills for the current work context.

## 🔒 Planning Protocol

This command follows the RaftStack Planning Protocol:
- **No file modifications** - This command is read-only (context injection for planning)
- If user wants to implement after injecting context, recommend `/raftstack/shape [task]`
- That command will handle planning and approval gates

**Reference:** See `_planning-protocol.md` for full protocol details.

## Arguments

- `$ARGUMENTS` - (Optional) Specific domain or task context (e.g., "React component", "API endpoint", "database migration")

## Tool Usage

**IMPORTANT:** Always use the `AskUserQuestion` tool for:
- Context clarification
- Standard selection
- Follow-up options

Never use plain text questions - always use the structured `AskUserQuestion` tool.

## Important Note About Implementation

**This command does NOT implement code.** It only surfaces relevant context for planning.

After injecting context, if the user wants to proceed with implementation:
1. Recommend running `/raftstack/shape [task description]`
2. The shape command will plan the work and require approval before implementation
3. Never proceed directly to implementation from this command

## Phase 1: Context Detection

If no specific context provided, infer from:

1. **Recent conversation:** What has been discussed?
2. **Recent files:** What files were recently read/edited?
3. **Current task:** What is the user working on?

Identify the domain(s):
- React/Frontend
- API/Backend
- Database
- SEO
- Testing
- General code quality

If context is unclear, use `AskUserQuestion`:
- Option A: React/Frontend - Components, hooks, state
- Option B: API/Backend - Routes, services, validation
- Option C: Database - Schema, queries, migrations
- Option D: Other (let user specify)

## Phase 2: Standards Discovery

Scan for standards files:

1. **Canonical locations:**
   - `.claude/standards/` and subdirectories
   - `.claude/context/constitution.md`

2. **Legacy fallback (suggest migration):**
   - `docs/standards/`, `standards/`, `*.standard.md`
   - `CONSTITUTION.md`, `docs/constitution.md`

   If found at legacy locations, suggest migration to `.claude/`.

3. **Match by domain:**
   - React work → look for component, state, hooks standards
   - API work → look for route, validation, error standards
   - Database work → look for schema, query, migration standards

## Phase 3: Skills Matching

Based on the detected domain, identify relevant RaftStack skills:

| Domain | Skill | Path |
|--------|-------|------|
| React/Frontend | React Development | `.claude/skills/react/SKILL.md` |
| API/Backend | Backend Development | `.claude/skills/backend/SKILL.md` |
| Database | Database Design | `.claude/skills/database/SKILL.md` |
| SEO | Technical SEO | `.claude/skills/seo/SKILL.md` |
| General | Code Quality | `.claude/skills/code-quality/SKILL.md` |
| Asana Integration | Asana Workflow | `.claude/skills/asana/SKILL.md` |

## Phase 3.5: Plugin Recommendations

Based on the detected domain, identify required Claude Code plugins:

### Plugin Enforcement Matrix

| Domain | Plugin | Skill/Tool | When to Trigger |
|--------|--------|------------|-----------------|
| React/Frontend/JSX | `frontend-design` | `/frontend-design` skill | Any UI component, JSX, CSS work |
| React/Frontend/JSX | `figma` | `/implement-design` | Figma files to code |
| Testing | `playwright` | Browser tools | E2E tests, browser automation |
| Testing | `superpowers` | `/tdd` skill | Test-driven development |
| Research/Documentation | `context7` | Documentation lookup | Getting library docs, API references |
| Code Review | `code-review` | `/code-review` | Before commits, PR creation |
| Code Review | `pr-review-toolkit` | `/review-pr` | Specialized review agents |
| Git/Commits | `commit-commands` | `/commit`, `/commit-push-pr` | Any git operations |
| Git/Commits | `github` | GitHub tools | Issue/PR management |
| Backend/API | `security-guidance` | Security warnings | API routes, handlers, auth |
| Deployment | `vercel` | Vercel tools | Deployment-related tasks |
| Project Management | `linear` | Linear tools | Task tracking with Linear |
| Project Management | `asana` | Asana tools | Task tracking with Asana |

## Phase 4: Context-Aware Summary

Present the injected context as a structured summary:

```markdown
## 📚 Relevant Context for [Domain]

### Standards Found
| Standard | Path | Key Points |
|----------|------|------------|
| [Name] | `[Path]` | • [Point 1] • [Point 2] |
| [Name] | `[Path]` | • [Point 1] • [Point 2] |

### Skills to Apply
| Skill | Path | When to Use |
|-------|------|-------------|
| [Name] | `[Path]` | [Trigger condition] |
| [Name] | `[Path]` | [Trigger condition] |

### 🔌 Recommended Plugins
| Plugin | Purpose | Skill to Use |
|--------|---------|--------------|
| [plugin] | [why needed for this domain] | `/[skill-name]` or [tool description] |

**Important:** Always use `context7` when researching libraries or getting documentation.

### Quick Reference (Most Important Rules)
1. **[Rule]** - [Brief explanation]
2. **[Rule]** - [Brief explanation]
3. **[Rule]** - [Brief explanation]

### Constitution Context
[Key points from constitution relevant to this domain]

---

**Your options:** [A] Load full standard [B] Load specific skill [C] Show all details [D] Search for more
```

Use `AskUserQuestion` for options.

## Phase 5: Detailed Loading

If user selects to load full details:

### For Standards
```markdown
## [Standard Name] (Full)

**Source:** `path/to/standard.md`

[Full content of the standard]

---
**Your options:** [A] Load another standard [B] Back to summary [C] Done
```

### For Skills
```markdown
## [Skill Name] (Full)

**Source:** `path/to/SKILL.md`

[Key sections of the skill relevant to current task]

---
**Your options:** [A] Load another skill [B] Back to summary [C] Done
```

## Phase 6: Follow-up Suggestions

After injecting context, present recommendations:

```markdown
### 🔄 Suggestions Based on Context

**If no standards found:**
→ Consider running `/raftstack/discover [area]` to document patterns from your codebase

**If no constitution:**
→ Consider running `/raftstack/init-context` to generate a project constitution

**If standards may be outdated:**
→ Consider running `/raftstack/index` to check for drift

**Your options:** [A] [Relevant suggestion] [B] [Alternative] [C] Continue working [D] Show all commands
```

Use `AskUserQuestion` for follow-up options.

## Example Sessions

### Example 1: Working on React Component

**User:** `/raftstack/inject React`

**AI responds:**
```markdown
## 📚 Relevant Context for React

### Standards Found
| Standard | Path | Key Points |
|----------|------|------------|
| Components | `.claude/standards/react/components.md` | • Named exports • Max 3 concerns |

### Skills to Apply
| Skill | Path | When to Use |
|-------|------|-------------|
| React Development | `.claude/skills/react/SKILL.md` | Components, hooks, state |
| Code Quality | `.claude/skills/code-quality/SKILL.md` | All code changes |

### Quick Reference (Most Important Rules)
1. **Server Components by default** - Add 'use client' only when needed
2. **Max 3 concerns per component** - Split if handling more
3. **React 19: No manual memoization** - React Compiler handles it

**Your options:** [A] Load React skill [B] Load Components standard [C] Show all [D] Search more
```

### Example 2: Planning API Work

**User:** `/raftstack/inject API`

**AI responds:**
```markdown
## 📚 Relevant Context for API

### Standards Found
| Standard | Path | Key Points |
|----------|------|------------|
| Error Handling | `.claude/standards/api/error-handling.md` | • ApiError class • Correlation ID |
| Validation | `.claude/standards/api/validation.md` | • Zod schemas • 400 responses |

### Skills to Apply
| Skill | Path | When to Use |
|-------|------|-------------|
| Backend Development | `.claude/skills/backend/SKILL.md` | Routes, services, handlers |
| Code Quality | `.claude/skills/code-quality/SKILL.md` | All code changes |

### Quick Reference (Most Important Rules)
1. **Clean architecture** - Handler → Service → Repository
2. **Zod validation** - Validate at handler entry point
3. **Consistent error format** - Use ApiError with code, message, details

**Your options:** [A] Load Backend skill [B] Load Error standard [C] Show all [D] Search more
```

### Example 3: No Standards Found

**User:** `/raftstack/inject auth`

**AI responds:**
```markdown
## 📚 Relevant Context for Authentication

### Standards Found
| Standard | Path | Key Points |
|----------|------|------------|
| *No auth-specific standards found* | - | - |

### Skills to Apply
| Skill | Path | When to Use |
|-------|------|-------------|
| Backend Development | `.claude/skills/backend/SKILL.md` | Auth middleware, sessions |

### Quick Reference (From Backend Skill)
1. **Middleware pattern** - Check auth before handlers
2. **Error handling** - Return 401/403 appropriately
3. **Session management** - Use secure, httpOnly cookies

---

### 🔄 Suggestions
No auth-specific standards found in this project.

**Your options:** [A] Run `/raftstack/discover auth` to document patterns [B] Load Backend skill [C] Continue without standards [D] Show all commands
```

Use `AskUserQuestion` for options.
