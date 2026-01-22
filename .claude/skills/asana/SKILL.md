---
name: asana
description: Use when working with Asana - creating tasks, updating tasks, adding comments, posting stories, searching tasks, managing projects, or any Asana MCP tool interaction. Essential for proper formatting and understanding MCP limitations.
---

# Asana MCP Guide

## Overview

This skill guides effective use of Asana MCP tools. **Critical limitation:** The Asana MCP server has restricted rich text support compared to the full Asana API.

## When to Use This Skill

Trigger on ANY Asana-related request:
- "Create a task in Asana"
- "Update the Asana task"
- "Add a comment to the task"
- "Post an update on Asana"
- "Leave a note on the Asana task"
- "Search for tasks in Asana"
- "Check my Asana tasks"
- "What's in my Asana project?"
- Any mention of Asana + task/project/comment/story

## ⚠️ Critical: MCP Rich Text Limitations

The Asana MCP server does **NOT** fully support rich text formatting:

| Tool | Rich Text Field | Plain Text Field | Rich Text Works? |
|------|-----------------|------------------|------------------|
| `asana_create_task` | `html_notes` ✅ | `notes` | **YES** |
| `asana_update_task` | ❌ None | `notes` | **NO** |
| `asana_create_task_story` | ❌ None | `text` | **NO** |

### What This Means

```typescript
// ✅ WORKS: Creating a NEW task with rich text
asana_create_task({
  name: "New feature",
  project_id: "123",
  html_notes: "<body><strong>Bold text</strong> works here!</body>"
})

// ❌ DOES NOT WORK: Updating existing task with rich text
// The MCP only exposes `notes` field (plain text)
asana_update_task({
  task_id: "456",
  notes: "Plain text only. <strong>Tags</strong> show as literal text."
})

// ❌ DOES NOT WORK: Comments with rich text
// The MCP only exposes `text` field (plain text)
asana_create_task_story({
  task_id: "456",
  text: "Plain text only. No formatting supported."
})
```

## The Iron Rules

### 1. Use `html_notes` ONLY for `asana_create_task`

Rich text formatting **only works** when creating new tasks.

```typescript
// ✅ CORRECT: Use html_notes for new tasks
asana_create_task({
  name: "Implementation task",
  project_id: "123456",
  html_notes: `<body>
<h2>Requirements</h2>
<ul>
<li>Feature A</li>
<li>Feature B</li>
</ul>
<strong>Owner:</strong> <a data-asana-gid="789012"/>
</body>`
})
```

### 2. Accept Plain Text for Updates and Comments

For `asana_update_task` and `asana_create_task_story`, write naturally like you're messaging a colleague:

```typescript
// ✅ CORRECT: Plain text for updates (only option available)
asana_update_task({
  task_id: "456",
  notes: `Quick update - finished features A and B. Waiting on John for review, should be good to merge after that.`
})

// ✅ CORRECT: Plain text for comments (only option available)
asana_create_task_story({
  task_id: "456",
  text: `Found the bug! It was in utils/parser.ts line 42 - missing a trim() call. Added .map(s => s.trim()) to fix it.

PR is up: https://github.com/org/repo/pull/123`
})
```

### 3. Wrap `html_notes` in `<body>` Tags

When using `html_notes` (only in `asana_create_task`), always wrap content in `<body>` tags:

```xml
<!-- ❌ BAD: No body wrapper -->
<strong>Important</strong> task details

<!-- ✅ GOOD: Properly wrapped -->
<body><strong>Important</strong> task details</body>
```

### 4. Use `data-asana-gid` for @-mentions (Task Creation Only)

In `html_notes` for new tasks, reference users/tasks using `data-asana-gid`:

```xml
<body>
Assigned to <a data-asana-gid="USER_GID"/>. Please review.
See related: <a data-asana-gid="TASK_GID"/>
</body>
```

## Writing Natural Comments

Since most operations only support plain text, write like you're messaging a colleague - natural, simple, conversational. But also format so Asana renders it cleanly.

### The Goal

Sound like a human, not a report generator. Skip the `===` underlines and formal structure.

### Do This

```
Hey, finished the code review!

Found a few things:
• auth.ts line 42 needs error handling around the API call
• types.ts line 15 has an 'any' that should be a proper interface
• query.ts could use some caching for performance

Otherwise looks good, just minor fixes needed. Let me know if you have questions!
```

### Not This

```
Code Review Complete
--------------------

Found 3 issues:

1. Missing error handling in auth.ts:42
   - Add try/catch around API call

2. Type safety issue in types.ts:15
   - Change 'any' to proper interface

Overall: Good implementation, minor fixes needed.
```

### Natural Writing Tips

- **Write conversationally** - "Hey, quick update" or "Found the issue!" is fine
- **Keep it brief** - say what matters, then stop
- **Links work fine** - just paste URLs directly: https://github.com/org/repo/pull/123
- **Don't over-structure** - skip the headers and category labels

### Asana Plain Text Formatting

Asana's plain text renderer has quirks. Use these patterns for clean rendering:

| Use | Not | Why |
|-----|-----|-----|
| `•` (bullet character) | `-` (dash) | Bullets render as proper list items |
| Flat lists | Nested/indented lists | Indentation doesn't preserve well |
| One blank line between sections | Multiple blank lines | Keeps spacing consistent |
| Inline items (no indent) | Indented sub-items | Sub-indentation gets flattened |

**Good list format:**
```
Found a few things:
• First item here
• Second item here
• Third item here
```

**Bad list format (indentation lost):**
```
Key Features:

- First item
  - Sub-item (will flatten)
- Second item
```

### Anti-Patterns to Avoid

| Don't Do This | Why |
|---------------|-----|
| `===` or `---` underlines | ASCII art formatting looks robotic |
| ALL CAPS FOR EMPHASIS | Comes across as shouting |
| Category headers everywhere | "Completed:", "Blocked:", "Next:" feels like a form |
| Nested indentation | Asana flattens it, looks broken |
| Report-style formatting | You're messaging a colleague, not filing a TPS report |

## HTML Tags Reference (for `html_notes` only)

| Markdown | Asana XML |
|----------|-----------|
| `**bold**` | `<strong>bold</strong>` |
| `*italic*` | `<em>italic</em>` |
| `~~strike~~` | `<s>strike</s>` |
| `__underline__` | `<u>underline</u>` |
| `` `code` `` | `<code>code</code>` |
| `- item` | `<ul><li>item</li></ul>` |
| `1. item` | `<ol><li>item</li></ol>` |
| `> quote` | `<blockquote>quote</blockquote>` |
| ` ```block``` ` | `<pre>block</pre>` |
| `# H1` | `<h1>H1</h1>` |
| `## H2` | `<h2>H2</h2>` |
| `[text](url)` | `<a href="url">text</a>` |
| `@mention` | `<a data-asana-gid="GID"/>` |

## Complete Examples

### Example 1: Create Task with Rich Formatting

```typescript
asana_create_task({
  name: "Implement user authentication",
  project_id: "111222333",
  html_notes: `<body>
<h1>User Authentication Feature</h1>

<h2>Requirements</h2>
<ul>
<li>OAuth 2.0 with Google</li>
<li>Session management</li>
<li>Password reset flow</li>
</ul>

<h2>Technical Notes</h2>
<blockquote>Must comply with security policy SEC-2024-001</blockquote>

<strong>Owner:</strong> <a data-asana-gid="12345678901234"/>
</body>`,
  due_on: "2024-03-15"
})
```

### Example 2: Update Task (Plain Text Only)

```typescript
asana_update_task({
  task_id: "1234567890",
  notes: `Quick update on this - API endpoints are done and tests are passing (95% coverage). Documentation draft is ready too.

Currently working on integration testing and addressing review feedback.

One blocker: still waiting on design approval for the UI changes. Pinged Sarah about it yesterday.

Once that's sorted, just need to finish integration tests and we can deploy to staging.`
})
```

### Example 3: Add Comment (Plain Text Only)

```typescript
asana_create_task_story({
  task_id: "1234567890",
  text: `Hey, finished the code review!

Found a few things:
• auth.ts line 42 needs error handling around the API call
• types.ts line 15 has an 'any' that should be a proper interface
• query.ts line 88 could use some caching for performance

Otherwise looks good - solid implementation, just minor fixes. Let me know if you have questions!

PR: https://github.com/org/repo/pull/456`
})
```

## Available Asana MCP Tools

### Task Operations
| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `asana_create_task` | Create new task | `name`, `project_id`, `html_notes`, `assignee`, `due_on` |
| `asana_update_task` | Update existing task | `task_id`, `notes` (plain text), `completed`, `assignee` |
| `asana_get_task` | Get task details | `task_id`, `opt_fields` |
| `asana_delete_task` | Delete a task | `task_id` |
| `asana_search_tasks` | Search tasks | `workspace`, `text`, `assignee_any`, `completed` |

### Comments/Stories
| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `asana_create_task_story` | Add comment | `task_id`, `text` (plain text only) |
| `asana_get_stories_for_task` | Get task comments | `task_id` |

### Project Operations
| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `asana_get_project` | Get project details | `project_id` |
| `asana_get_projects` | List projects | `workspace` |
| `asana_get_project_sections` | Get sections | `project_id` |
| `asana_create_project` | Create project | `name`, `workspace`, `team` |

### Search & Discovery
| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `asana_typeahead_search` | Quick search | `workspace_gid`, `resource_type`, `query` |
| `asana_list_workspaces` | Get workspaces | (none required) |
| `asana_get_user` | Get user info | `user_id` (default: "me") |

## Common Workflows

### Find and Update a Task
```typescript
// 1. Search for the task
asana_typeahead_search({
  workspace_gid: "WORKSPACE_ID",
  resource_type: "task",
  query: "authentication feature"
})

// 2. Get task details
asana_get_task({
  task_id: "FOUND_TASK_ID",
  opt_fields: "name,notes,assignee,due_on,completed"
})

// 3. Update the task (plain text only)
asana_update_task({
  task_id: "FOUND_TASK_ID",
  notes: "Updated description here (plain text)"
})
```

### Add Status Update Comment
```typescript
// Get current user first (for context)
asana_get_user({})  // Returns current user info

// Add comment to task
asana_create_task_story({
  task_id: "TASK_ID",
  text: `Making good progress here! Got the core functionality working, moving on to testing and docs now. No blockers.`
})
```

## Common Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Using `html_notes` in `asana_update_task` | Parameter doesn't exist, ignored | Use `notes` with plain text |
| Using `html_text` in `asana_create_task_story` | Parameter doesn't exist, ignored | Use `text` with plain text |
| Expecting markdown to render | Shows as literal `**text**` | Write naturally in plain text |
| Missing `<body>` tags in `html_notes` | May fail or render incorrectly | Always wrap in `<body>` tags |
| Not closing XML tags | Invalid XML error | Close all tags: `<li></li>` |

## Red Flags - STOP and Check

| Thought | Reality |
|---------|---------|
| "I'll use html_notes to update the task" | `asana_update_task` doesn't have `html_notes`. Use `notes`. |
| "I'll format the comment with HTML" | `asana_create_task_story` only has `text`. Plain text only. |
| "Markdown will render in Asana" | No. Write naturally in plain text, or use `html_notes` for new tasks only. |
| "I need the workspace ID" | Call `asana_list_workspaces` first to get it. |
| "I'll @mention with @username" | Use `<a data-asana-gid="GID"/>` in `html_notes` only. |

## References

- [Asana Rich Text Documentation](https://developers.asana.com/docs/rich-text) - Full API rich text (note: MCP has limited support)
- Asana MCP exposes subset of Asana API functionality
- Rich text via `html_notes` only available in `asana_create_task`
