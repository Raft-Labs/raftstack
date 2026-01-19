---
name: react
description: Use when writing React components, using hooks, handling state, working with Next.js/Remix/Vite/Astro, or when components feel bloated, have unnecessary re-renders, or violate single responsibility
---

# React Development

## Overview

Write components that are small, focused, and follow framework conventions. Detect the framework first - patterns differ significantly between Next.js App Router, Remix, Vite SPA, and Astro.

## When to Use

- Creating any React component
- Choosing state management approach
- Deciding client vs server rendering
- Optimizing re-renders
- Setting up data fetching

## Framework Detection

**Always check before writing React code:**

```typescript
// Check package.json for framework
import pkg from './package.json';

const framework = detectFramework(pkg.dependencies);
// 'next' → Next.js (check for app/ vs pages/)
// '@remix-run/react' → Remix
// 'astro' → Astro
// 'vite' only → Vite SPA
// none → Create React App or custom
```

| File/Config | Framework | Router Type |
|------------|-----------|-------------|
| `app/` directory + `next.config` | Next.js App Router | File-based, RSC |
| `pages/` directory + `next.config` | Next.js Pages Router | File-based, CSR/SSR |
| `remix.config.js` or `@remix-run/*` | Remix | Nested, loader-based |
| `astro.config.mjs` | Astro | Islands, mostly static |
| `vite.config.ts` only | Vite SPA | Client-side only |

## The Iron Rules

### 1. 'use client' Goes at File Top - NEVER Middle

```typescript
// ❌ FATAL: This breaks compilation
function ServerComponent() { ... }

'use client'; // WRONG - can't be after other code

function ClientComponent() { ... }

// ✅ CORRECT: Separate files
// -- server-component.tsx --
export function ServerComponent() { ... }

// -- client-component.tsx --
'use client';
export function ClientComponent() { ... }
```

**Never write "for demonstration" code that violates this.** Broken code teaches nothing.

### 2. Server Components by Default (Next.js App Router)

Data fetching belongs on the server. Only add 'use client' when you need:
- Event handlers (onClick, onChange)
- useState, useEffect, useReducer
- Browser APIs (localStorage, window)

```typescript
// ✅ GOOD: Server Component fetches data
// app/products/page.tsx
async function ProductsPage() {
  const products = await db.product.findMany(); // Direct DB access
  return <ProductList products={products} />;
}

// ❌ BAD: Client Component fetches in useEffect
'use client';
function ProductsPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('/api/products').then(...) // Extra round-trip
  }, []);
}
```

### 3. Component Responsibilities: Max 3 Concerns

A component should handle at most 3 concerns:
1. Data → Layout → Interaction (orchestrator)
2. Fetch → Transform → Display (data component)
3. State → Render → Events (interactive component)

If you have more, split.

```typescript
// ❌ BAD: Too many concerns
function ProductPage() {
  // Fetching
  // Validation
  // Cart logic
  // Analytics
  // Rendering
  // Error handling
}

// ✅ GOOD: Split by concern
function ProductPage() {
  return (
    <ProductDataProvider>
      <ProductDisplay />
      <AddToCartButton />
    </ProductDataProvider>
  );
}
```

### 4. State Placement Decision Tree

```
Need state?
├── Used by 1 component → useState in that component
├── Used by siblings → lift to parent
├── Used across routes → URL params or context
├── Complex/async → useReducer or server state (TanStack Query)
└── Global → Zustand or Jotai (NOT Redux unless massive app)
```

### 5. Hooks Rules

```typescript
// ❌ BAD: Conditional hook
if (condition) {
  useEffect(() => { ... }); // Breaks rules of hooks
}

// ✅ GOOD: Condition inside hook
useEffect(() => {
  if (!condition) return;
  // ... effect logic
}, [condition]);

// ❌ BAD: Too many useState
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [error, setError] = useState(null);
const [loading, setLoading] = useState(false);
const [submitted, setSubmitted] = useState(false);

// ✅ GOOD: Related state in reducer
const [formState, dispatch] = useReducer(formReducer, initialState);
```

## Quick Reference: Framework Patterns

| Task | Next.js App Router | Remix | Vite SPA |
|------|-------------------|-------|----------|
| Data fetching | async component | loader function | useQuery |
| Mutations | Server Action | action function | useMutation |
| Loading UI | loading.tsx | useNavigation | suspense |
| Error UI | error.tsx | ErrorBoundary | ErrorBoundary |
| Metadata | metadata export | meta function | react-helmet |
| Navigation | Link + router | Link + navigate | Link + navigate |

## Red Flags - STOP and Restructure

| Thought | Reality |
|---------|---------|
| "I'll put 'use client' here just for demo" | Broken code teaches nothing. Write it correctly. |
| "This component does a lot but it's fine" | Max 3 concerns. Split now. |
| "I'll fetch client-side, it's simpler" | Server fetching is simpler AND faster. |
| "Let me add useState for this" | Check: can it be URL params, server state, or derived? |
| "Redux for this small app" | Zustand/Jotai unless you have 50+ reducers. |
| "I need useEffect for this fetch" | In Next.js/Remix: no. Use server components or loaders. |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| 'use client' not at file top | Move to separate file |
| useEffect for data fetching in Next.js | Server component or loader |
| Prop drilling 3+ levels | Context or composition |
| Re-render on every keystroke | Debounce or uncontrolled input |
| window/localStorage in server component | 'use client' or dynamic import |
| Inline function in JSX causing re-renders | useCallback or extract |