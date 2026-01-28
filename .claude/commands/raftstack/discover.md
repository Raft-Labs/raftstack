# RaftStack: Discover and Extract Patterns

Analyze a specific area of the codebase and extract patterns into reusable standards.

## Arguments

- `$ARGUMENTS` - (Optional) Focus area to analyze (e.g., "API", "components", "database", "error handling")

## Tool Usage

**IMPORTANT:** Always use the `AskUserQuestion` tool for:
- Focus area selection
- Standard creation decisions
- Location negotiation
- Option selection

Never use plain text questions - always use the structured `AskUserQuestion` tool.

## Phase 1: Focus Selection

If no focus area provided, use `AskUserQuestion` with these options:
- Option A: API/Backend - Route structure, error handling, validation
- Option B: Components - File structure, prop patterns, styling
- Option C: Database - Schema conventions, query patterns
- Option D: Other (let user specify)

**Common areas:**
- **API/Backend** - Route structure, error handling, validation, response formats
- **Components** - File structure, prop patterns, state management, styling
- **Database** - Schema conventions, query patterns, migrations
- **Error Handling** - Error types, logging, user-facing messages
- **Testing** - Test structure, mocking patterns, coverage approach
- **Authentication** - Auth flow, session management, permissions
- **Utilities** - Helper function patterns, shared logic

## Phase 2: Deep Pattern Analysis

For the selected area, analyze:

1. **Find representative files:**
   - Locate 3-5 files that implement this pattern well
   - Note file paths for reference

2. **Extract structural patterns:**
   - File naming convention
   - Directory organization
   - Export patterns

3. **Extract code patterns:**
   - Common function signatures
   - Type definitions
   - Error handling approach
   - Import structure

4. **Identify conventions:**
   - Naming (variables, functions, types)
   - Formatting preferences
   - Comment style

## Phase 3: Pattern Analysis Summary

After analyzing patterns, present:

```markdown
## ✅ Pattern Discovery Completed

### 🎯 Key Patterns Found (Top 3)
1. **[Pattern Name]** - Location: `path/to/files/`
   - [Brief description of pattern]
2. **[Pattern Name]** - Location: `path/to/files/`
   - [Brief description of pattern]
3. **[Pattern Name]** - Location: `path/to/files/`
   - [Brief description of pattern]

### 📋 Files Analyzed
- `path/to/file1.ts` - [what it demonstrates]
- `path/to/file2.ts` - [what it demonstrates]
- `path/to/file3.ts` - [what it demonstrates]

### 🔍 Consistency Assessment
- ✅ **Consistent:** [list consistent patterns]
- ⚠️ **Inconsistent:** [list inconsistencies with file references]

### ⚠️ Technical Debt Noted
- [Debt item] - **Impact:** [why it matters] - **Files:** [affected files]
- [Debt item] - **Impact:** [why it matters] - **Files:** [affected files]

### 🔄 Recommended Standards to Create
1. **[Standard Name]** - Captures: [what pattern]
2. **[Standard Name]** - Captures: [what pattern]
3. **[Standard Name]** - Captures: [what pattern]

**Your options:** [A] Create all standards [B] Select specific standards [C] Analyze another area [D] Skip standardization
```

Use `AskUserQuestion` for options.

## Phase 4: Standard Creation

For each selected pattern, create a standard document:

```markdown
# [Pattern Name] Standard

## Purpose
[Why this pattern exists]

## When to Use
[Situations where this applies]

## Pattern

### Structure
[File/directory structure]

### Code Template
```typescript
// Template with placeholders
[code template]
```

### Examples
[Real examples from codebase with file paths]

## Anti-patterns
[What NOT to do]

## References
- [Link to related file in codebase]
- [Link to related skill if applicable]
```

## Phase 5: Location Negotiation

Use `AskUserQuestion` with these options:
- Option A: `.claude/standards/[area]/` - Claude-specific standards folder (Recommended)
- Option B: `docs/standards/[area]/` - With project documentation
- Option C: `standards/[area]/` - At project root
- Option D: Other (let user specify)

## Phase 6: Completion Summary

After creating standards, present:

```markdown
## ✅ Standards Created

### 🎯 What Was Created
1. **[Standard Name]** - **Location:** `path/to/standard.md`
   - Captures: [what pattern]
2. **[Standard Name]** - **Location:** `path/to/standard.md`
   - Captures: [what pattern]

### 📋 Standards Contents
| Standard | Patterns Captured | Examples Included |
|----------|-------------------|-------------------|
| [Name] | [List] | [Count] |

### 🔍 Coverage Assessment
- **Fully Covered:** [list of patterns now documented]
- **Partially Covered:** [patterns that could use more detail]
- **Not Covered:** [patterns skipped for now]

### ⚠️ Follow-up Recommendations
- **Run `/raftstack/index`** - Update the standards registry
- **Run `/raftstack/inject [area]`** - Use these standards when working on related code

### 🔄 What This Enables
- **Option A:** Run `/raftstack/index` - Update standards registry
- **Option B:** Run `/raftstack/discover [other-area]` - Analyze another area
- **Option C:** Run `/raftstack/inject [area]` - Test the new standards
- **Option D:** Done for now

**Your options:** [A] Index standards [B] Discover more [C] Test with inject [D] Done
```

Use `AskUserQuestion` for final options.

## Example Session

**User:** `/raftstack/discover API`

**AI analyzes API routes, finds patterns:**
- RESTful structure with `/api/[resource]/route.ts`
- Zod validation on all inputs
- Consistent error response format
- Auth middleware pattern

**AI presents Pattern Analysis Summary**

**User selects:** [B] Select specific standards

**AI uses AskUserQuestion:** Which patterns to document?
- [A] Error handling
- [B] Validation
- [C] Auth middleware
- [D] All of the above

**User selects:** Error handling and Validation

**AI creates:**
- `.claude/standards/api/error-handling.md`
- `.claude/standards/api/validation.md`

**AI presents Completion Summary with next steps**
