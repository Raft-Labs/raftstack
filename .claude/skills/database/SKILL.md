---
name: database
description: Use when designing database schemas, writing Drizzle ORM code, creating tables, choosing indexes, or when queries are slow and indexes might be missing
---

# Database Development

## Overview

Every foreign key needs an index. Every frequent filter needs an index. Use Drizzle ORM patterns correctly and think about query patterns before defining tables.

## When to Use

- Designing new database schemas
- Adding tables with Drizzle ORM
- Optimizing slow queries
- Choosing between UUID vs serial IDs
- Deciding index strategy

## The Iron Rules

### 1. Every Foreign Key Gets an Index

Foreign keys don't automatically create indexes in PostgreSQL. You MUST add them.

```typescript
// ❌ BAD: FK without index
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id), // No index!
});

// ✅ GOOD: FK with explicit index
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
}, (table) => ({
  userIdIdx: index("orders_user_id_idx").on(table.userId),
}));
```

### 2. Index Frequently Filtered Columns

If you WHERE on it, index it.

```typescript
// ✅ GOOD: Index on status and timestamps
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  status: orderStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("orders_user_id_idx").on(table.userId),
  statusIdx: index("orders_status_idx").on(table.status),
  createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
  // Composite for common query: "user's orders by status"
  userStatusIdx: index("orders_user_status_idx").on(table.userId, table.status),
}));
```

### 3. Use Partial Indexes for Filtered Subsets

When you frequently query a subset, use a partial index.

```typescript
// ✅ GOOD: Partial index for active products only
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
}, (table) => ({
  // Only index active products - smaller, faster
  activeIdx: index("products_active_idx")
    .on(table.isActive)
    .where(sql`${table.isActive} = true`),
  // Featured products (active AND featured)
  featuredIdx: index("products_featured_idx")
    .on(table.isFeatured)
    .where(sql`${table.isActive} = true AND ${table.isFeatured} = true`),
}));
```

### 4. JSONB with GIN Index for JSON Columns

Never store JSON as text. Use JSONB with GIN index for queries.

```typescript
import { jsonb } from "drizzle-orm/pg-core";

// ❌ BAD: JSON as text
imageUrls: text("image_urls"), // Can't query efficiently

// ✅ GOOD: JSONB with GIN index
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  metadata: jsonb("metadata").$type<ProductMetadata>(),
  tags: jsonb("tags").$type<string[]>().default([]),
}, (table) => ({
  tagsGinIdx: index("products_tags_gin_idx")
    .using("gin", table.tags),
}));
```

### 5. Auto-Update Timestamps

Use `$onUpdate` for automatic timestamp updates.

```typescript
// ✅ GOOD: Auto-updating timestamps
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
```

### 6. Primary Key Strategy

| Strategy | Use When | Pros | Cons |
|----------|----------|------|------|
| **UUID** | Distributed systems, public IDs | No collisions, hide growth | Larger, slower indexes |
| **Serial/bigserial** | Single DB, internal IDs | Compact, fast | Exposes growth, sequence issues |
| **ULID/NanoID** | Need sortability + randomness | Sortable, compact | Custom generation |

```typescript
// UUID (default recommendation)
id: uuid("id").defaultRandom().primaryKey(),

// Serial for internal/analytics tables
id: serial("id").primaryKey(),

// ULID for sortable + random
id: varchar("id", { length: 26 }).primaryKey().$default(() => ulid()),
```

## Quick Reference: Index Types

| Index Type | Use For | Example |
|------------|---------|---------|
| **B-tree** (default) | Equality, range, ORDER BY | `WHERE status = 'active'`, `ORDER BY created_at` |
| **GIN** | Arrays, JSONB, full-text | `WHERE tags @> '["sale"]'` |
| **BRIN** | Large sorted tables (logs) | Time-series data ordered by timestamp |
| **Hash** | Only exact equality | `WHERE id = 'abc'` (rare use) |

```typescript
// GIN for JSONB
index("idx").using("gin", table.tags)

// BRIN for time-series
index("idx").using("brin", table.createdAt)
```

## Schema Checklist

Before committing a schema:
- [ ] Every foreign key has an index
- [ ] Frequently filtered columns are indexed
- [ ] Composite indexes match common query patterns
- [ ] JSON columns use JSONB, not text
- [ ] `updatedAt` has `$onUpdate`
- [ ] Considered partial indexes for subsets
- [ ] Timestamps indexed if used in WHERE/ORDER BY

## Red Flags - STOP and Add Indexes

| Thought | Reality |
|---------|---------|
| "I'll add indexes later if queries are slow" | Add them now. FK indexes are mandatory. |
| "Indexes slow down writes" | Reads outnumber writes 100:1. Index it. |
| "The table is small" | Tables grow. Index from day one. |
| "I don't know the query patterns yet" | FK indexes are always needed. Start there. |
| "JSON as text is fine for now" | JSONB costs nothing extra. Use it. |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| FK without index | Add `.on(table.foreignKeyColumn)` |
| JSON as text | Use `jsonb()` with GIN index |
| No composite index | Add for common multi-column filters |
| Missing $onUpdate | Add for `updatedAt` columns |
| Unique without index awareness | `unique()` creates index, but document intent |
| No partial index | Use `where()` for subset queries |