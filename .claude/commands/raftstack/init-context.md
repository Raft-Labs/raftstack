# RaftStack: Initialize Project Context

Analyze this codebase and generate a constitution document that captures how this project works.

## 🔒 Planning Protocol

This command follows the RaftStack Planning Protocol:
- All changes are planned before implementation
- User approval is required before creating constitution file
- Use `AskUserQuestion` for all approval gates

**Reference:** See `_planning-protocol.md` for full protocol details.

## Tool Usage

**IMPORTANT:** Always use the `AskUserQuestion` tool for:
- Location negotiation (where to save files)
- **Constitution file creation approval** (required before writing file)
- Confirmation requests
- Clarification questions

Never use plain text questions - always use the structured `AskUserQuestion` tool.

## Phase 1: Structure Discovery

First, analyze the project structure:

1. **Detect project type:**
   - Check for `nx.json` → NX Monorepo
   - Check for `turbo.json` → Turborepo
   - Check for `pnpm-workspace.yaml` → pnpm Workspace
   - Check for `apps/` or `packages/` directories → Monorepo pattern
   - Otherwise → Single package

2. **Scan key configuration files:**
   - `package.json` - dependencies, scripts, name
   - `tsconfig.json` - TypeScript settings
   - Framework configs (next.config.*, vite.config.*, etc.)
   - `.env.example` or `.env.local` - environment patterns
   - Database configs (drizzle.config.ts, prisma/schema.prisma)

3. **Map directory structure:**
   - Source locations (`src/`, `app/`, `pages/`, `lib/`)
   - Test locations (`__tests__/`, `*.test.ts`, `*.spec.ts`)
   - Config locations (`.github/`, `.husky/`, etc.)

### Phase 1 Summary

After completing structure discovery, present:

```markdown
## ✅ Structure Discovery Completed

### 🎯 Key Discoveries (Top 3)
1. [Discovery] - **Significance:** [Why this matters]
2. [Discovery] - **Significance:** [Why this matters]
3. [Discovery] - **Significance:** [Why this matters]

### 📋 What Was Found
- **Project Type:** [Detected type]
- **Framework:** [Detected framework]
- **Key Directories:** [List main directories]

### 🔍 Important Configuration Files
1. [File and what it configures]
2. [File and what it configures]
3. [File and what it configures]

### ⚠️ Watch Out For
- [Potential issue or unusual pattern] - **Note:** [Guidance]
- [Missing expected config] - **Note:** [Guidance]

### 🔄 Ready for Next Phase
Pattern extraction will analyze code style and architecture.

**Your options:** [A] Proceed to Pattern Extraction [B] Re-analyze structure [C] Explain findings [D] Skip to constitution
```

Use `AskUserQuestion` to present options A/B/C/D.

## Phase 2: Pattern Extraction

Analyze the code to discover existing patterns:

1. **Component/Module patterns:**
   - How are React components structured? (file naming, export style)
   - How are API routes organized?
   - What's the state management approach?

2. **Code style patterns:**
   - Import ordering conventions
   - Error handling approach
   - Logging patterns
   - Naming conventions (camelCase, kebab-case for files, etc.)

3. **Architecture patterns:**
   - Data flow (client → API → database)
   - Authentication approach
   - Shared utilities location

### Phase 2 Summary

After completing pattern extraction, present:

```markdown
## ✅ Pattern Extraction Completed

### 🎯 Key Patterns Found (Top 3)
1. [Pattern] - **Significance:** [How it shapes development]
2. [Pattern] - **Significance:** [How it shapes development]
3. [Pattern] - **Significance:** [How it shapes development]

### 📋 What Was Analyzed
- **Components:** [Summary of component patterns]
- **API/Backend:** [Summary of backend patterns]
- **Code Style:** [Summary of style conventions]

### 🔍 Conventions Detected
1. [Naming convention with example]
2. [Import convention with example]
3. [Error handling approach]

### ⚠️ Inconsistencies Noted
- [Inconsistency] - **Impact:** [Why it matters]
- [Inconsistency] - **Impact:** [Why it matters]

### 🔄 Ready for Constitution Generation
The constitution will capture all discovered patterns and structure.

**Your options:** [A] Generate constitution [B] Analyze more patterns [C] Explain a pattern [D] Start over
```

Use `AskUserQuestion` to present options A/B/C/D.

## Phase 3: Generate Constitution

**IMPORTANT:** Prepare the constitution content but DO NOT write the file yet. Present it for approval first.

```markdown
# [Project Name] Constitution

## Overview
[One paragraph describing what this project does]

## Project Structure
[Detected structure - monorepo type, key directories]

## Tech Stack
| Layer | Technology | Config File |
|-------|------------|-------------|
| Framework | [detected] | [config path] |
| Database | [detected] | [config path] |
| Styling | [detected] | [config path] |
| Testing | [detected] | [config path] |

## Patterns
### Component Structure
[Detected patterns]

### API/Backend Structure
[Detected patterns]

### Error Handling
[Detected patterns]

## Conventions
### Naming
- Files: [detected]
- Functions: [detected]
- Components: [detected]

### Imports
[Detected ordering/aliasing patterns]

## Future Direction
[User provides this - project goals, planned features]
```

## Phase 4: Constitution Preview & Approval Gate

Present the generated constitution content to the user for review:

```markdown
## 📋 Constitution Preview

[Show first 30-40 lines of generated constitution content]

...

[Full constitution will be saved to `.claude/context/constitution.md`]
```

#### ⚠️ PLANNING GATE (Before Creating Constitution File)

**DO NOT CREATE CONSTITUTION FILE WITHOUT USER APPROVAL**

Before writing the constitution file:

1. **Present the Constitution Preview Above** (already done)

2. **Request Approval** using `AskUserQuestion` with these options:
   - [A] Create constitution file (Recommended)
   - [B] Modify the constitution content
   - [C] Show full preview
   - [D] Cancel

3. **Implementation Rules:**
   - ✅ Wait for explicit [A] selection before creating file
   - ✅ If [B] selected, revise content and re-present
   - ✅ If [C] selected, show full content and re-ask for approval
   - ❌ Never skip approval
   - ❌ Never create file without [A] selection

## Phase 5: Constitution Location

**ONLY proceed to this phase after receiving approval in Phase 4 Planning Gate.**

The constitution is always saved at: `.claude/context/constitution.md`

**Migration:** If a constitution exists at a legacy location (`CONSTITUTION.md` or `docs/constitution.md`), inform the user and offer to migrate it.

**Note:** For business-facing documentation (PRD, stakeholder docs), use `docs/` instead.

## Phase 6: Final Summary

After saving the constitution, present:

```markdown
## ✅ Context Initialization Completed

### 🎯 What Was Created
1. **Constitution Document** - **Location:** [path]
   - Captures project structure and patterns
2. **[N] Patterns Documented** - **Coverage:** [areas covered]
3. **Tech Stack Mapped** - **Frameworks:** [list]

### 📋 Constitution Highlights
- [Key insight about the project]
- [Key insight about the project]
- [Key insight about the project]

### 🔍 Important Items to Review
1. [Section that may need user refinement]
2. [Area with incomplete detection]
3. [Future Direction section - needs user input]

### ⚠️ Follow-up Recommendations
- **Run `/raftstack/discover`** - Extract specific patterns as reusable standards
- **Review Future Direction** - Add your project goals and planned features

### 🔄 What This Enables
- **Option A:** Run `/raftstack/discover [area]` - Document specific patterns as standards
- **Option B:** Run `/raftstack/shape [feature]` - Plan a feature using this context
- **Option C:** Edit constitution manually - Refine detected patterns

**Your options:** [A] Discover patterns [B] Shape a feature [C] Edit constitution [D] Done for now
```

Use `AskUserQuestion` to present final options.

## Output

Once location is confirmed:
1. Create the constitution file at the chosen location
2. Present the final summary with discoveries
3. Offer next step options via `AskUserQuestion`
