---
name: backend
description: Use when writing serverless functions, API handlers, backend services, or when code has tight coupling to infrastructure, no dependency injection, or mixed concerns
---

# Backend Development

## Overview

Backend code should separate business logic from infrastructure. Use dependency injection for testability, Zod for validation, and layer your code so business rules don't know about HTTP or AWS.

## When to Use

- Writing Lambda handlers or serverless functions
- Creating API endpoints
- Designing service layer architecture
- Setting up validation
- Making code testable without mocking infrastructure

## The Iron Rules

### 1. Layer Separation: Handler → Service → Repository

```
Handler (HTTP)     → Parses request, calls service, formats response
Service (Business) → Pure business logic, validates, orchestrates
Repository (Data)  → Database operations only
```

```typescript
// ❌ BAD: Everything in handler
export const handler = async (event) => {
  const body = JSON.parse(event.body);
  // validation...
  // business logic...
  // database call...
  // send email...
  // format response...
};

// ✅ GOOD: Layered with injection
export const createHandler = (userService: UserService) => async (event) => {
  const input = parseRequest(event);
  const result = await userService.createUser(input);
  return formatResponse(201, result);
};
```

### 2. Dependency Injection for Serverless

Inject dependencies into handlers. This enables testing without AWS mocks.

```typescript
// ✅ GOOD: Factory pattern for DI
// handler.ts
import { createUserService } from './services/user-service';
import { createUserRepository } from './repositories/user-repository';
import { createEmailService } from './services/email-service';

const userRepository = createUserRepository(docClient);
const emailService = createEmailService(sesClient);
const userService = createUserService(userRepository, emailService);

export const handler = createHandler(userService);

// In tests:
const mockRepo = { save: vi.fn(), findByEmail: vi.fn() };
const mockEmail = { send: vi.fn() };
const testService = createUserService(mockRepo, mockEmail);
// Test business logic without AWS!
```

### 3. Zod for Validation (Not Manual If/Else)

```typescript
// ❌ BAD: Manual validation
function validateRequest(body: unknown) {
  const errors: string[] = [];
  if (!body.email) errors.push('Email required');
  if (!body.email.includes('@')) errors.push('Invalid email');
  // ... 50 more lines
}

// ✅ GOOD: Zod schema
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be 8+ characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number'),
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

// In handler:
const result = CreateUserSchema.safeParse(body);
if (!result.success) {
  return { statusCode: 400, body: JSON.stringify(result.error.flatten()) };
}
const validInput: CreateUserInput = result.data;
```

### Advanced Zod Patterns

#### Discriminated Unions for API Responses

```typescript
import { z } from 'zod';

// ✅ GOOD: Type-safe response handling
const ApiResponse = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('success'),
    data: z.object({
      id: z.string(),
      email: z.string().email(),
    }),
  }),
  z.object({
    status: z.literal('error'),
    error: z.string(),
    code: z.enum(['VALIDATION_ERROR', 'CONFLICT', 'NOT_FOUND']),
  }),
]);

type ApiResponse = z.infer<typeof ApiResponse>;
// { status: "success"; data: {...} } | { status: "error"; error: string; code: ... }

// In handler
const response = ApiResponse.parse({ status: 'success', data: user });
```

#### Transforms & Coercion

```typescript
// ✅ GOOD: Coerce query params to numbers
const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// ?page=5&limit=50 → { page: 5, limit: 50 }
const params = PaginationSchema.parse(event.queryStringParameters);

// ✅ GOOD: Transform to normalize data
const EmailSchema = z.string()
  .email()
  .transform((val) => val.toLowerCase().trim());

// ✅ GOOD: Preprocess before validation
const DateSchema = z.preprocess(
  (val) => (typeof val === 'string' ? new Date(val) : val),
  z.date()
);
```

#### Refinements for Complex Validation

```typescript
// ✅ GOOD: Cross-field validation
const PasswordUpdateSchema = z.object({
  newPassword: z.string().min(8),
  confirmPassword: z.string(),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'], // Attach to specific field
  }
);

// ✅ GOOD: Async validation
const UniqueEmailSchema = z.string().email().refine(
  async (email) => {
    const exists = await userRepo.findByEmail(email);
    return !exists;
  },
  { message: 'Email already registered' }
);

// Use with parseAsync
const email = await UniqueEmailSchema.parseAsync('test@example.com');
```

#### Error Formatting for APIs

```typescript
// ✅ GOOD: Flatten errors for form display
const result = CreateUserSchema.safeParse(body);

if (!result.success) {
  const flattened = result.error.flatten();
  /*
  {
    formErrors: [],
    fieldErrors: {
      email: ['Invalid email format'],
      password: ['Password must be 8+ characters', 'Must contain uppercase']
    }
  }
  */
  return {
    statusCode: 400,
    body: JSON.stringify({
      error: 'Validation failed',
      details: flattened.fieldErrors,
    }),
  };
}

// ✅ GOOD: Format errors as nested object
const formatted = result.error.format();
/*
{
  email: { _errors: ['Invalid email format'] },
  password: {
    _errors: ['Password must be 8+ characters', 'Must contain uppercase']
  }
}
*/
```

### 4. Service Layer: Pure Business Logic

Services contain business rules. They don't know about HTTP, AWS, or databases - only interfaces.

```typescript
// services/user-service.ts
export interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

export interface EmailService {
  sendWelcome(email: string, name: string): Promise<void>;
}

export function createUserService(
  userRepo: UserRepository,
  emailService: EmailService
) {
  return {
    async createUser(input: CreateUserInput): Promise<User> {
      // Business rule: check duplicate
      const existing = await userRepo.findByEmail(input.email);
      if (existing) {
        throw new ConflictError('Email already registered');
      }

      // Business rule: create user
      const user = {
        id: crypto.randomUUID(),
        ...input,
        passwordHash: await hashPassword(input.password),
        createdAt: new Date(),
      };

      await userRepo.save(user);

      // Business rule: send welcome (fire-and-forget)
      emailService.sendWelcome(user.email, user.firstName).catch(console.error);

      return user;
    },
  };
}
```

### 5. Custom Error Types for Control Flow

```typescript
// errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

// In handler:
try {
  const result = await userService.createUser(input);
  return { statusCode: 201, body: JSON.stringify(result) };
} catch (error) {
  if (error instanceof AppError) {
    return { statusCode: error.statusCode, body: JSON.stringify({ error: error.message, code: error.code }) };
  }
  console.error('Unexpected error:', error);
  return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
}
```

## Lambda Optimization

### Connection Pooling (Cold Start Critical)

```typescript
// ❌ BAD: New connection per invocation
export const handler = async (event) => {
  const client = new DatabaseClient(); // Cold start penalty
  await client.connect();
  // ... use client
};

// ✅ GOOD: Connection at module level (reused)
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

export const handler = async (event) => {
  // Reuses existing connection across warm invocations
  const users = await db.select().from(users);
  return { statusCode: 200, body: JSON.stringify(users) };
};
```

**Key patterns:**
- Initialize clients **outside** handler (module level)
- Use connection pooling (RDS Proxy, Neon Pool)
- Reduces cold start by 80% for database operations

### SDK Client Initialization

```typescript
// ✅ GOOD: Initialize AWS SDK clients at module level
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

const dynamoClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION })
);
const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  // Clients already initialized (warm path)
};
```

### Lazy Loading for Heavy Dependencies

```typescript
// ✅ GOOD: Lazy load only when needed
export const handler = async (event) => {
  if (event.path === '/pdf') {
    const { generatePDF } = await import('./pdf-generator'); // Heavy lib
    return generatePDF(event.body);
  }

  // Fast path doesn't pay cold start cost
  return { statusCode: 200, body: 'OK' };
};
```

### Cold Start Optimization Checklist

- [ ] Database connections at module level
- [ ] AWS SDK clients initialized outside handler
- [ ] Small deployment package (< 10MB compressed)
- [ ] Minimal dependencies (tree-shake unused code)
- [ ] Use Node.js or Python for fastest cold starts
- [ ] Consider provisioned concurrency for critical paths
- [ ] Lazy load heavy libraries when possible

## Testing Strategy

| What to Test | How |
|--------------|-----|
| Service layer | Unit tests with mock repositories |
| Validation | Test Zod schemas with valid/invalid inputs |
| Error handling | Verify custom errors map to status codes |
| Handlers | Integration tests with test event objects |
| Async refinements | Use parseAsync and await results |

```typescript
// Test service layer (pure business logic)
import { describe, it, expect, vi } from 'vitest';
import { createUserService } from './user-service';

describe('UserService', () => {
  it('creates user and sends welcome email', async () => {
    const mockRepo = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
    };
    const mockEmail = {
      sendWelcome: vi.fn().mockResolvedValue(undefined),
    };

    const service = createUserService(mockRepo, mockEmail);
    const user = await service.createUser({
      email: 'test@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        firstName: 'John',
      })
    );
    expect(mockEmail.sendWelcome).toHaveBeenCalledWith(
      'test@example.com',
      'John'
    );
  });

  it('throws ConflictError for duplicate email', async () => {
    const mockRepo = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue({ id: '123' }),
    };

    const service = createUserService(mockRepo, {} as any);

    await expect(
      service.createUser({
        email: 'existing@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      })
    ).rejects.toThrow(ConflictError);
  });
});

// Test Zod validation
describe('CreateUserSchema', () => {
  it('validates correct input', () => {
    const result = CreateUserSchema.safeParse({
      email: 'test@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(result.success).toBe(true);
  });

  it('rejects weak password', () => {
    const result = CreateUserSchema.safeParse({
      email: 'test@example.com',
      password: 'weak',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toContain(
        'Password must be 8+ characters'
      );
    }
  });
});

// Test handler error mapping
describe('Handler', () => {
  it('returns 409 for ConflictError', async () => {
    const mockService = {
      createUser: vi.fn().mockRejectedValue(
        new ConflictError('Email already exists')
      ),
    };

    const handler = createHandler(mockService);
    const response = await handler({
      body: JSON.stringify({ email: 'test@example.com' }),
    } as any);

    expect(response.statusCode).toBe(409);
    const body = JSON.parse(response.body);
    expect(body.code).toBe('CONFLICT');
  });
});
```

## References

- [Zod Documentation](https://zod.dev) - Validation, transforms, error formatting
- [AWS Lambda Cold Starts](https://aws.amazon.com/blogs/compute/understanding-and-remediating-cold-starts-an-aws-lambda-perspective/) - Official optimization guide
- [AWS Lambda Performance](https://aws.amazon.com/blogs/compute/operating-lambda-performance-optimization-part-1/) - Best practices

**Version Notes:**
- Zod v3.24+: Improved error formatting, discriminated unions
- AWS Lambda: Node.js 20.x has faster cold starts than 18.x

## Quick Reference: Lambda Structure

```
src/
├── handlers/           # HTTP layer only
│   └── create-user.ts  # Parse, call service, format response
├── services/           # Business logic only
│   └── user-service.ts # Rules, orchestration
├── repositories/       # Data access only
│   └── user-repository.ts # DynamoDB operations
├── schemas/            # Zod schemas
│   └── user.ts         # CreateUserSchema, UpdateUserSchema
├── errors/             # Custom error types
│   └── index.ts        # AppError, ConflictError, etc.
└── types/              # Shared types
    └── user.ts         # User, CreateUserInput
```

## Red Flags - STOP and Refactor

| Thought | Reality |
|---------|---------|
| "It's just a Lambda, no need for architecture" | Lambdas grow. Layering now saves pain later. |
| "I'll add DI if it gets complex" | It's already complex enough. Inject from day one. |
| "Manual validation is fine for this" | Zod is 5 lines and type-safe. Use it. |
| "Tests can mock AWS SDK" | Mocking AWS is painful. Inject interfaces instead. |
| "I'll separate later" | Later means never. Separate now. |
| "Connection pooling is premature" | Cold starts cost 80% more without pooling. Do it now. |
| "I'll initialize clients in the handler" | Module-level initialization reuses across invocations. |
| "flatten() and format() do the same thing" | flatten() for forms, format() for nested objects. |
| "Discriminated unions are overkill" | They make response handling type-safe and explicit. |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Business logic in handler | Extract to service layer |
| AWS SDK calls scattered | Wrap in repository with interface |
| Manual validation | Use Zod schemas |
| Generic Error everywhere | Create domain-specific error classes |
| Can't test without AWS | Inject dependencies via factory functions |
| DB client in handler | Initialize at module level for connection reuse |
| Not using flatten() for errors | Use `.flatten().fieldErrors` for API responses |
| String validation without coercion | Use `z.coerce` for query params and form data |
| No discriminated unions | Use for type-safe API responses and request routing |
| Heavy deps loaded always | Lazy load with dynamic `import()` when needed |