# @repo/db

Shared Prisma database package for the monorepo.

## Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update DATABASE_URL in `.env`:**
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   ```

3. **Generate Prisma Client:**
   ```bash
   pnpm db:generate
   ```

4. **Run migrations:**
   ```bash
   pnpm db:migrate
   ```

5. **Seed database (optional):**
   ```bash
   pnpm db:seed
   ```

## Available Scripts

- `pnpm db:generate` - Generate Prisma Client
- `pnpm db:migrate` - Create and apply migrations (development)
- `pnpm db:migrate:deploy` - Apply migrations (production)
- `pnpm db:push` - Push schema changes without migrations (development only)
- `pnpm db:studio` - Open Prisma Studio (database GUI)
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:reset` - Reset database and re-run migrations

## Usage in Apps

### NestJS (apps/api)

```typescript
// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
```

```typescript
// apps/api/src/database/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await prisma.$connect();
  }

  async onModuleDestroy() {
    await prisma.$disconnect();
  }

  get client() {
    return prisma;
  }
}
```

```typescript
// apps/api/src/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User, Prisma } from '@repo/db';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.client.user.findUnique({
      where: { id },
      include: { projects: true },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.client.user.create({ data });
  }
}
```

### Next.js (apps/web)

**Note:** Typically, you should NOT import Prisma directly in Next.js. Instead, call your GraphQL API. However, for server-side operations (API routes, server actions), you can use it:

```typescript
// apps/web/app/api/users/route.ts
import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await prisma.user.findMany({
    include: { projects: true },
  });
  return NextResponse.json(users);
}
```

## Schema Overview

### User Model
- `id` - UUID primary key
- `email` - Unique email address (indexed)
- `name` - User's full name
- `passwordHash` - Hashed password
- `createdAt` - Timestamp (indexed)
- `updatedAt` - Auto-updated timestamp

### Project Model
- `id` - UUID primary key
- `name` - Project name
- `description` - Optional text description
- `status` - Enum: ACTIVE, ARCHIVED, COMPLETED, ON_HOLD (indexed)
- `ownerId` - Foreign key to User (indexed)
- `createdAt` - Timestamp (indexed)
- `updatedAt` - Auto-updated timestamp

### Relations
- User → Projects (one-to-many)
- Project → User (many-to-one, cascade delete)

## Migration Workflow

### Development
```bash
# 1. Modify schema.prisma
# 2. Create migration
pnpm db:migrate

# 3. Migration is created in prisma/migrations/
# 4. Prisma Client is auto-regenerated
```

### Production
```bash
# Apply migrations without prompts
pnpm db:migrate:deploy
```

### Reset Database (Development Only)
```bash
pnpm db:reset
```

## Best Practices

1. **Always use migrations** - Don't use `db:push` in production
2. **Version control migrations** - Commit migration files to git
3. **Use transactions** - For operations that modify multiple tables
4. **Index strategically** - Add indexes for frequently queried fields
5. **Use enums** - For fields with fixed values (like status)
6. **Cascade deletes** - Define proper `onDelete` behavior
