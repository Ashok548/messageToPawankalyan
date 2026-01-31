# @repo/api

NestJS backend API with GraphQL.

## Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update environment variables:**
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   JWT_SECRET="your-secret-key"
   ```

3. **Install dependencies (from root):**
   ```bash
   pnpm install
   ```

4. **Generate Prisma client:**
   ```bash
   pnpm db:generate
   ```

5. **Run database migrations:**
   ```bash
   pnpm db:migrate
   ```

6. **Start development server:**
   ```bash
   pnpm --filter @repo/api dev
   ```

## Available Scripts

- `pnpm dev` - Start development server with watch mode
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests

## GraphQL Playground

Once the server is running, access the GraphQL Playground at:
```
http://localhost:4000/graphql
```

## Architecture

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── database/               # Database module
│   ├── database.module.ts
│   └── prisma.service.ts
└── modules/                # Feature modules
    ├── auth/               # Authentication
    │   ├── auth.module.ts
    │   ├── auth.service.ts      # Business logic
    │   ├── auth.resolver.ts     # GraphQL resolver
    │   ├── dto/                 # Input types
    │   └── entities/            # GraphQL types
    ├── users/              # Users management
    │   ├── users.module.ts
    │   ├── users.service.ts     # Business logic
    │   ├── users.resolver.ts    # GraphQL resolver
    │   ├── users.repository.ts  # Data access
    │   ├── dto/
    │   └── entities/
    └── projects/           # Projects management
        ├── projects.module.ts
        ├── projects.service.ts
        ├── projects.resolver.ts
        ├── projects.repository.ts
        ├── dto/
        └── entities/
```

## Clean Architecture

- **Resolvers**: Thin layer, delegates to services
- **Services**: Business logic and validation
- **Repositories**: Data access with Prisma
- **No business logic in resolvers!**

## Example Queries

### Register
```graphql
mutation {
  register(input: {
    email: "user@example.com"
    password: "password123"
    name: "John Doe"
  }) {
    user {
      id
      email
      name
    }
    token
  }
}
```

### Login
```graphql
mutation {
  login(input: {
    email: "user@example.com"
    password: "password123"
  }) {
    user {
      id
      email
      name
    }
    token
  }
}
```

### Get Projects
```graphql
query {
  projects {
    id
    name
    description
    status
    owner {
      id
      name
    }
  }
}
```

### Create Project
```graphql
mutation {
  createProject(input: {
    name: "My Project"
    description: "Project description"
    status: ACTIVE
  }) {
    id
    name
    status
  }
}
```
