# RaftStack: Help & Guidance

Guide the user on what to do next based on their current project state.

## Tool Usage

**IMPORTANT:** Always use the `AskUserQuestion` tool for:
- Presenting recommendations
- Showing command options
- Getting user preferences

Never use plain text questions - always use the structured `AskUserQuestion` tool.

## Phase 1: Detect Current State

Check for existing RaftStack artifacts:

### Technical Documentation (`.claude/`)
- `.claude/context/constitution.md` → Project constitution
- `.claude/standards/**/*.md` → Coding standards
- `.claude/standards/REGISTRY.md` → Standards registry
- `.claude/specs/**/*` → Feature specifications
- `.claude/skills/*/SKILL.md` → RaftStack skills

### Required Marketplaces
Check if required Claude Code marketplaces are installed:

1. **Check for marketplace directories:**
   - `~/.claude/plugins/marketplaces/claude-plugins-official/` → Official plugins
   - `~/.claude/plugins/marketplaces/anthropic-agent-skills/` → Document skills

2. **If missing, note in Health Assessment for installation guidance**

### Business Documentation (`docs/`)
All business logic and product-specific files are stored in the `docs/` folder.

## Planning Protocol

**All RaftStack commands follow a plan-first workflow:**
- Commands always plan before implementing
- User approval is required before any file modifications
- Use `AskUserQuestion` for all approval gates

For details, see `.claude/commands/raftstack/_planning-protocol.md`

## RaftStack Folder Convention

### `.claude/` - Technical (AI Context)
```
.claude/
├── context/
│   └── constitution.md          # Project patterns & structure
├── standards/
│   ├── REGISTRY.md              # Index of all standards
│   ├── api/                     # Domain-specific standards
│   ├── react/
│   └── database/
├── specs/
│   └── {timestamp}-{slug}/      # Feature specifications
├── skills/                      # RaftStack skills
├── commands/
│   └── raftstack/
│       ├── _planning-protocol.md  # Internal: Planning enforcement protocol
│       ├── shape.md            # /raftstack/shape command
│       ├── discover.md         # /raftstack/discover command
│       └── ...                 # Other commands
└── subagents/                   # Subagent definitions
```

### `docs/` - Business (Human-Facing)
Contains all business logic and product-specific documentation.

## Phase 2: Assess Project State

Categorize the project state:

### New to RaftStack (No artifacts found)
- No constitution
- No standards
- No skills

### Partially Set Up
- Has constitution but no standards
- Has standards but no registry
- Has skills but no project-specific standards

### Fully Set Up
- Has constitution
- Has standards
- Has registry (recently updated)
- Has skills

### Needs Maintenance
- Has artifacts but registry is outdated (>30 days)
- Has standards that may have drifted

## Phase 3: Present State Summary

Show the user their current state:

```markdown
## 📊 RaftStack Project Status

### Artifacts Found
| Artifact | Status | Location |
|----------|--------|----------|
| Constitution | [✅ Found / ❌ Missing] | [path or -] |
| Standards | [[N] found / ❌ None] | [path or -] |
| Registry | [✅ Found / ❌ Missing] | [path or -] |
| Specs | [[N] found / ❌ None] | [path or -] |
| Skills | [✅ Installed / ❌ Missing] | [path or -] |
| Plugins | [✅ Ready / ⚠️ Marketplaces missing] | `.claude/settings.json` |

### 🔌 Marketplace Status (if any missing)
| Marketplace | Status | Install Command |
|-------------|--------|-----------------|
| claude-plugins-official | [✅ Installed / ❌ Missing] | `claude plugins add claude-plugins-official` |
| anthropic-agent-skills | [✅ Installed / ❌ Missing] | `claude plugins add https://github.com/anthropics/skills` |

**Note:** If marketplaces are missing, run the install commands above, then restart Claude Code.

### Health Assessment
- **Overall:** [New / Partially Set Up / Ready / Needs Maintenance]
- **Last Registry Update:** [date or Never]
- **Standards Coverage:** [list of domains covered]
```

## Phase 4: Determine Recommendation

Based on state, recommend next action:

### If no constitution:
**Recommended:** `/raftstack/init-context`
> "Start by analyzing your codebase and generating a constitution. This captures your project's structure, patterns, and conventions."

### If constitution but no standards:
**Recommended:** `/raftstack/discover`
> "You have project context. Consider extracting patterns from your code as reusable standards."

### If standards but no registry:
**Recommended:** `/raftstack/index`
> "You have standards but no registry. Index them to enable easy discovery and drift detection."

### If starting new work:
**Recommended:** `/raftstack/shape`
> "Use shape to plan your feature with the right level of detail - from quick fixes to full specs."

### If working on code:
**Recommended:** `/raftstack/inject`
> "Surface relevant standards and skills for your current task to ensure consistency."

### If registry is outdated (>30 days):
**Recommended:** `/raftstack/index`
> "Your standards registry hasn't been updated recently. Re-index to check for drift and updates."

### If fully set up and current:
**Recommended:** Based on what user wants to do
> "Your RaftStack setup is complete and current. What would you like to work on?"

## Phase 5: Present Options

Use `AskUserQuestion` with context-appropriate options:

### For New Projects
```markdown
**Recommended next step:** `/raftstack/init-context`
Start by generating a constitution that captures how your project works.

**Your options:**
- [A] Initialize project context (Recommended) - Generate a constitution
- [B] Skip to discover patterns - Extract standards from existing code
- [C] Show all commands - See everything RaftStack can do
- [D] Not now - Exit help
```

### For Partially Set Up Projects
```markdown
**Recommended next step:** [Based on what's missing]
[Explanation of why this is recommended]

**Your options:**
- [A] [Recommended action] (Recommended)
- [B] [Alternative action]
- [C] Show all commands
- [D] Not now
```

### For Ready Projects
```markdown
**Your RaftStack setup is complete!**

**What would you like to do?**
- [A] Shape a new feature - Plan work with /raftstack/shape
- [B] Inject context - Surface standards for current work
- [C] Check for drift - Re-index and detect changes
- [D] Show all commands
```

## Phase 6: All Commands Reference

If user requests to see all commands:

```markdown
## RaftStack Commands Reference

### Setup & Context
| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/raftstack/init-context` | Generate constitution | New project or first setup |
| `/raftstack/index` | Update standards registry | Standards changed, check drift |

### Planning & Discovery
| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/raftstack/shape [task]` | Plan feature/task | Starting any new work |
| `/raftstack/discover [area]` | Extract patterns | Document existing code patterns |

### Working with Code
| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/raftstack/inject [domain]` | Surface context | Before coding, need guidance |

### Help
| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/raftstack/help` | Get guidance | Unsure what to do next |

---

### Quick Start Guide

1. **First time?** Run `/raftstack/init-context` to analyze your project
2. **Have patterns?** Run `/raftstack/discover` to document them as standards
3. **Starting work?** Run `/raftstack/shape [task]` to plan your approach
4. **Need guidance?** Run `/raftstack/inject [domain]` to surface relevant standards

**Your options:** [A] Run a command [B] Back to recommendations [C] Exit help
```

Use `AskUserQuestion` for navigation.

## Example Sessions

### Example 1: New Project

**User:** `/raftstack/help`

**AI detects:** No RaftStack artifacts found

**AI responds:**
```markdown
## 📊 RaftStack Project Status

### Artifacts Found
| Artifact | Status | Location |
|----------|--------|----------|
| Constitution | ❌ Missing | - |
| Standards | ❌ None | - |
| Registry | ❌ Missing | - |
| Specs | ❌ None | - |
| Skills | ✅ Installed | `.claude/skills/` |

### Health Assessment
- **Overall:** New to RaftStack
- **Last Registry Update:** Never
- **Standards Coverage:** None

---

**Recommended next step:** `/raftstack/init-context`
Start by generating a constitution that captures how your project works. This analyzes your codebase structure, patterns, and conventions.
```

**Uses AskUserQuestion:**
- [A] Initialize project context (Recommended)
- [B] Skip to discover patterns
- [C] Show all commands
- [D] Not now

### Example 2: Ready Project

**User:** `/raftstack/help`

**AI detects:** Constitution, 5 standards, registry (3 days old), skills

**AI responds:**
```markdown
## 📊 RaftStack Project Status

### Artifacts Found
| Artifact | Status | Location |
|----------|--------|----------|
| Constitution | ✅ Found | `.claude/context/constitution.md` |
| Standards | 5 found | `.claude/standards/` |
| Registry | ✅ Found | `.claude/standards/REGISTRY.md` |
| Specs | 2 found | `.claude/specs/` |
| Skills | ✅ Installed | `.claude/skills/` |

### Health Assessment
- **Overall:** Ready
- **Last Registry Update:** 3 days ago
- **Standards Coverage:** API, React, Database

---

**Your RaftStack setup is complete and current!**
```

**Uses AskUserQuestion:**
- [A] Shape a new feature - Plan work with scale-adaptive depth
- [B] Inject context - Surface standards for current task
- [C] Check for drift - Re-index and detect changes
- [D] Show all commands

### Example 3: Needs Maintenance

**User:** `/raftstack/help`

**AI detects:** Constitution, standards, but registry is 45 days old

**AI responds:**
```markdown
## 📊 RaftStack Project Status

### Artifacts Found
| Artifact | Status | Location |
|----------|--------|----------|
| Constitution | ✅ Found | `.claude/context/constitution.md` |
| Standards | 3 found | `.claude/standards/` |
| Registry | ⚠️ Outdated | `.claude/standards/REGISTRY.md` |
| Specs | ❌ None | - |
| Skills | ✅ Installed | `.claude/skills/` |

### Health Assessment
- **Overall:** Needs Maintenance
- **Last Registry Update:** 45 days ago ⚠️
- **Standards Coverage:** API, React

---

**Recommended next step:** `/raftstack/index`
Your standards registry is over 30 days old. Re-index to check for drift and ensure standards are still accurate.
```

**Uses AskUserQuestion:**
- [A] Re-index standards (Recommended) - Check for drift
- [B] Shape a new feature - Plan work
- [C] Show all commands
- [D] Not now
