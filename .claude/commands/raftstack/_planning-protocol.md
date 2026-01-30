# RaftStack Planning Protocol

**INTERNAL REFERENCE - NOT A USER-FACING COMMAND**

All RaftStack commands MUST follow this protocol to enforce plan-first workflows.

---

## Core Principle

**NEVER implement before planning and getting explicit user approval.**

This protocol ensures:
- Users understand what will happen before it happens
- No accidental file modifications
- Changes align with user expectations
- Clear decision points with explicit approval gates

---

## Phase: Planning Gate (Required Before Implementation)

Before ANY file creation or modification:

### 1. Present Plan Summary

```markdown
## 📋 Implementation Plan

### What Will Be Done
- [Bullet list of changes]
- [Standards that will be applied]
- [Files that will be created/modified]

### Files to Create/Modify
| File | Action | Purpose |
|------|--------|---------|
| [path] | [create/modify] | [why] |

### Standards Applied
- [List relevant RaftLabs standards]
- [Conventions being enforced]

### Estimated Scope
- [N] files affected
- [Complexity: Simple/Medium/Complex]
```

### 2. Request Approval via AskUserQuestion

**REQUIRED:** Use the `AskUserQuestion` tool with these options:

```json
{
  "questions": [{
    "question": "Ready to proceed with this implementation?",
    "header": "Approval",
    "multiSelect": false,
    "options": [
      {
        "label": "Proceed with implementation",
        "description": "Start implementing the plan as presented"
      },
      {
        "label": "Modify the plan",
        "description": "Revise the approach before implementing"
      },
      {
        "label": "Show more details",
        "description": "Provide additional context about the plan"
      },
      {
        "label": "Cancel",
        "description": "Stop and do not implement"
      }
    ]
  }]
}
```

### 3. Implementation Rules

#### ✅ ALWAYS:
- Wait for explicit "Proceed with implementation" selection
- Present complete plan before asking for approval
- If user selects "Modify the plan", revise and re-present with new approval gate
- If user selects "Show more details", expand explanation then re-ask for approval
- If user selects "Cancel", stop all implementation activities

#### ❌ NEVER:
- Skip the approval step
- Implement before presenting the plan
- Assume approval from partial agreement
- Proceed without explicit "Proceed" selection
- Create or modify files during the planning phase

---

## Standard Planning Gate Template

Use this template in command files:

```markdown
## ⚠️ PLANNING GATE

**DO NOT [ACTION] WITHOUT USER APPROVAL**

Before [specific action]:

1. **Present the Plan:**
   - What will be done
   - Files affected
   - Standards applied
   - Expected outcomes

2. **Request Approval:**
   Use `AskUserQuestion` with these options:
   - [A] Proceed with implementation (Recommended)
   - [B] Modify the plan
   - [C] Show more details
   - [D] Cancel

3. **Implementation Rules:**
   - ✅ Wait for explicit "Proceed" approval
   - ✅ If "Modify" selected, revise plan and re-present
   - ✅ If "Show details" selected, expand then re-ask
   - ❌ Never skip approval gate
   - ❌ Never implement without [A] selection
   - ❌ Never create/modify files during planning
```

---

## When to Use Planning Gates

### Required Gates (Every Command):
1. **Before any file creation**
2. **Before any file modification**
3. **Before running code generators**
4. **Before applying bulk changes**

### Optional Gates (Use judgment):
- After complex analysis when user might want to adjust scope
- When presenting multiple implementation options
- When significant decisions affect downstream work

---

## Command-Specific Guidelines

### `/raftstack/shape`
- Gate after complexity assessment (Quick/Light/Full)
- Gate before implementation phase
- All three complexity levels require approval

### `/raftstack/discover`
- Gate after pattern analysis
- Gate before creating standard files
- Gate before applying discovered standards

### `/raftstack/inject`
- No file modifications - guidance only
- Recommend `/raftstack/shape` for actual implementation
- Remind user that injected context is for planning

### `/raftstack/init-context`
- Gate after presenting constitution preview
- Gate before writing constitution file

### `/raftstack/index`
- Gate before creating/updating registry file
- Gate before resolving drift (file modifications)

---

## Example Flow

**Good:**
```
1. User: "/raftstack/shape Add login button"
2. Claude: [Analyzes, creates plan]
3. Claude: [Presents plan summary]
4. Claude: [Uses AskUserQuestion for approval]
5. User: [Selects "Proceed"]
6. Claude: [Implements plan]
```

**Bad:**
```
1. User: "/raftstack/shape Add login button"
2. Claude: [Analyzes]
3. Claude: [Immediately starts creating files] ❌
```

---

## Enforcement Strategy

This protocol relies on **instruction-based enforcement** because:
- Plan mode cannot be programmatically triggered
- Hooks execute after tool calls, can't prevent them
- No settings exist to enforce plan-first workflows

**Strong imperative language** ("DO NOT", "MUST", "NEVER") in command prompts is the most reliable enforcement mechanism.

---

## Verification Checklist

Before considering a command complete:

- [ ] Planning gate added before all file operations
- [ ] `AskUserQuestion` tool configured with standard options
- [ ] Clear instructions about when to implement
- [ ] "DO NOT IMPLEMENT WITHOUT APPROVAL" warning present
- [ ] Command references this protocol file
