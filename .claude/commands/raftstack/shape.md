# RaftStack: Shape Feature/Task

Plan a feature or task with scale-adaptive depth. Simple tasks get quick flow, complex tasks get full specs.

## 🔒 Planning Protocol

This command follows the RaftStack Planning Protocol:
- All changes are planned before implementation
- User approval is required before any file modifications
- Use `AskUserQuestion` for all approval gates

**Reference:** See `_planning-protocol.md` for full protocol details.

## Arguments

- `$ARGUMENTS` - Description of the feature or task to plan

## Tool Usage

**IMPORTANT:** Always use the `AskUserQuestion` tool for:
- Complexity confirmation
- Location negotiation
- Option selection
- Clarification questions
- **Implementation approval** (required before any file operations)

Never use plain text questions - always use the structured `AskUserQuestion` tool.

## Feature Status Tracking

Include status in every summary:

```
📊 **Feature Status:** [Feature Name] ([Stage])
   Progress: [●●●○○] [X]% | Phase: [Current] → Next: [Next Phase]
```

**Stage values:**
- `Shaping` (20%) - ●○○○○
- `Planning` (40%) - ●●○○○
- `Tasking` (60%) - ●●●○○
- `In Progress` (80%) - ●●●●○
- `Complete` (100%) - ●●●●●

## Phase 1: Complexity Assessment

Analyze the task to determine scale:

**Simple (Quick Flow):**
- Bug fix with clear cause
- Single-file change
- Adding a field/property
- Simple UI tweak

**Medium (Light Spec):**
- New component with clear requirements
- New API endpoint
- Refactoring a module
- Adding a straightforward feature

**Complex (Full Spec):**
- Multi-component feature
- New data flow/architecture
- Integration with external service
- Major refactoring
- Cross-cutting concerns (auth, logging, etc.)

After assessment, use `AskUserQuestion` to confirm the complexity level:
- Option A: Quick Flow (simple task)
- Option B: Light Spec (medium complexity)
- Option C: Full Spec (complex feature)
- Option D: Let me clarify the task

## Phase 2: Execute Based on Scale

**IMPORTANT:** Each flow level (Quick/Light/Full) MUST include an approval gate before implementation.

### Quick Flow (Simple Tasks)

1. Clarify scope in 2-3 sentences
2. Identify the file(s) to change
3. Describe the change briefly
4. **WAIT FOR APPROVAL** - Do NOT implement yet

Output format:
```markdown
## Quick Shape: [Task Name]

📊 **Feature Status:** [Task Name] (Shaping)
   Progress: [●○○○○] 20% | Phase: Quick Shape → Implementation

**Scope:** [What needs to change]
**Files:** [1-2 files]
**Approach:** [Brief description]

### 🔌 Use These Plugins
- [Plugin based on domain detected]
```

#### ⚠️ PLANNING GATE (Quick Flow)

**DO NOT IMPLEMENT WITHOUT USER APPROVAL**

Before implementing:

1. **Present the Plan Above** (already done)

2. **Request Approval** using `AskUserQuestion` with these options:
   - [A] Proceed to implement (Recommended)
   - [B] Add more detail
   - [C] Change approach
   - [D] Cancel

3. **Implementation Rules:**
   - ✅ Wait for explicit [A] selection
   - ✅ If [B] selected, provide more detail and re-present
   - ✅ If [C] selected, revise approach and re-present
   - ❌ Never skip approval
   - ❌ Never implement without [A] selection
   - ❌ Never create/modify files before approval

### Light Spec (Medium Tasks)

1. Define the requirement clearly
2. Identify related code patterns to follow
3. List files to create/modify
4. Note any standards to apply
5. **WAIT FOR APPROVAL** - Do NOT implement yet

Output format:
```markdown
## Shape: [Feature Name]

📊 **Feature Status:** [Feature Name] (Planning)
   Progress: [●●○○○] 40% | Phase: Light Spec → Implementation

### Requirement
[Clear statement of what needs to be built]

### Existing Patterns
[Reference similar code in the codebase to follow]

### Implementation Plan
1. [Step with file path]
2. [Step with file path]
3. [Step with file path]

### 🔌 Plugins to Use
| Plugin | Purpose | When |
|--------|---------|------|
| [Plugin] | [Why needed] | [Trigger condition] |

**Important:** Always use `context7` when researching libraries or getting documentation.

### Standards to Apply
- [Reference any discovered standards: @.claude/standards/...]
- [Reference any skills: @.claude/skills/...]
```

#### ⚠️ PLANNING GATE (Light Spec)

**DO NOT IMPLEMENT WITHOUT USER APPROVAL**

Before implementing:

1. **Present the Plan Above** (already done)

2. **Request Approval** using `AskUserQuestion` with these options:
   - [A] Proceed to implement (Recommended)
   - [B] Save spec to file
   - [C] Modify plan
   - [D] Upgrade to full spec

3. **Implementation Rules:**
   - ✅ Wait for explicit [A] selection
   - ✅ If [B] selected, save spec and await further instructions
   - ✅ If [C] selected, revise plan and re-present
   - ✅ If [D] selected, transition to Full Spec workflow
   - ❌ Never skip approval
   - ❌ Never implement without [A] selection
   - ❌ Never create/modify files before approval

### Full Spec (Complex Tasks)

1. **Understand the domain:**
   - What problem does this solve?
   - Who are the users/consumers?
   - What are the success criteria?

2. **Explore existing code:**
   - Find similar features to learn from
   - Identify integration points
   - Note architectural constraints

3. **Design the solution:**
   - Data model changes
   - API contracts
   - Component structure
   - State management approach
   - Error handling strategy

4. **Break into phases:**
   - Phase 1: Core functionality
   - Phase 2: Edge cases/polish
   - Phase 3: Testing/docs

5. **Spec folder location:**

Specs are always saved at: `.claude/specs/{YYYY-MM-DD-HHMM}-{feature-slug}/`

**Note:** For business requirements (PRD, user stories), use `docs/prd/` instead.

## Full Spec Folder Structure

Create folder: `{negotiated-path}/{YYYY-MM-DD-HHMM}-{feature-slug}/`

Example: `.claude/specs/2024-01-27-1430-comment-threading/`

Contents:
```
{spec-folder}/
├── README.md           # Overview, goals, success criteria
├── shape.md            # Shaping decisions and context
│   - Scope definition
│   - Key decisions made
│   - Constraints noted
├── standards.md        # Full content of applicable standards
│   - Copy relevant standards inline
│   - Note why each applies
├── references.md       # Similar code in codebase
│   - File paths studied
│   - Patterns to follow
│   - Patterns to avoid
├── architecture.md     # Technical design (if needed)
│   - Data model changes
│   - API contracts
│   - Component structure
└── visuals/            # Mockups, screenshots (if provided)
```

### Full Spec Summary

After creating the spec folder, present:

```markdown
## ✅ Full Spec Created

📊 **Feature Status:** [Feature Name] (Tasking)
   Progress: [●●●○○] 60% | Phase: Full Spec → Implementation

### 🎯 Key Decisions Made (Top 3)
1. [Decision] - **Rationale:** [Why this approach]
2. [Decision] - **Rationale:** [Why this approach]
3. [Decision] - **Rationale:** [Why this approach]

### 📋 Spec Contents
- **README.md:** Overview and success criteria
- **shape.md:** Scope and constraints
- **standards.md:** [N] applicable standards
- **references.md:** [N] similar patterns found
- **architecture.md:** Technical design

### 🔌 Plugins & Skills
| Plugin | Purpose | When |
|--------|---------|------|
| [Plugin] | [Why needed] | [Trigger condition] |

**Important:** Always use `context7` when researching libraries or getting documentation.

### 🔍 Implementation Phases
1. **Phase 1:** [Core functionality] - [N files]
2. **Phase 2:** [Edge cases] - [N files]
3. **Phase 3:** [Testing/docs] - [N files]

### ⚠️ Watch Out For
- [Risk or complexity] - **Mitigation:** [How to handle]
- [Dependency or blocker] - **Status:** [Current state]

### 📁 Spec Location
Spec folder created at: `{path}`
```

#### ⚠️ PLANNING GATE (Full Spec)

**DO NOT IMPLEMENT WITHOUT USER APPROVAL**

Before implementing:

1. **Present the Plan Above** (already done)

2. **Request Approval** using `AskUserQuestion` with these options:
   - [A] Start implementation (Recommended)
   - [B] Review spec files in detail
   - [C] Modify architecture
   - [D] Add more detail

3. **Implementation Rules:**
   - ✅ Wait for explicit [A] selection
   - ✅ If [B] selected, review spec files and re-present
   - ✅ If [C] selected, revise architecture and re-present
   - ✅ If [D] selected, expand spec and re-present
   - ❌ Never skip approval
   - ❌ Never implement without [A] selection
   - ❌ Never create/modify code files before approval
   - ✅ Spec folder creation is allowed (it's planning, not implementation)

## Phase 3: Standards Injection

Before finalizing the plan, check for relevant standards and skills:

1. Scan for standards at canonical location:
   - `.claude/standards/`

2. Identify relevant skills based on the task domain:
   - React work → `@.claude/skills/react/SKILL.md`
   - API work → `@.claude/skills/backend/SKILL.md`
   - Database work → `@.claude/skills/database/SKILL.md`
   - SEO work → `@.claude/skills/seo/SKILL.md`
   - General → `@.claude/skills/code-quality/SKILL.md`

3. Include references in the plan output

For Full Specs, copy the full content of applicable standards into `standards.md` with notes on why each applies.

## Examples

**User says:** "Fix the typo in the header"
→ Quick Flow: Identify file, describe fix, implement

**User says:** "Add a delete button to user cards"
→ Light Spec: Plan component changes, identify patterns, list steps

**User says:** "Implement comment threading for posts"
→ Full Spec: Create timestamped spec folder with architecture docs, phased plan
