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

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Business logic in handler | Extract to service layer |
| AWS SDK calls scattered | Wrap in repository with interface |
| Manual validation | Use Zod schemas |
| Generic Error everywhere | Create domain-specific error classes |
| Can't test without AWS | Inject dependencies via factory functions |
| Cold start loading all deps | Lazy-load clients inside functions if needed |