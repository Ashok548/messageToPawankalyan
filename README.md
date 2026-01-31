# Production-Ready Monorepo

Full-stack TypeScript monorepo with Next.js, NestJS, GraphQL, Prisma, and PostgreSQL.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) + Apollo Client + MUI v5
- **Backend**: NestJS + Apollo Server + GraphQL
- **Database**: PostgreSQL + Prisma ORM
- **Monorepo**: Turborepo + pnpm workspaces

## 📦 Project Structure

```
├── apps/
│   ├── web/                # Next.js frontend
│   └── api/                # NestJS backend
├── packages/
│   ├── db/                 # Prisma schema & client
│   ├── types/              # Shared TypeScript types
│   ├── constants/          # Shared constants
│   ├── utils/              # Shared utilities
│   └── graphql-schema/     # GraphQL schema
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # pnpm workspace config
└── turbo.json              # Turborepo config
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL >= 15

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd qustionToPk
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Database
   cp packages/db/.env.example packages/db/.env
   
   # Backend
   cp apps/api/.env.example apps/api/.env
   
   # Frontend
   cp apps/web/.env.local.example apps/web/.env.local
   ```

4. **Update environment variables**
   - `packages/db/.env`: Set `DATABASE_URL`
   - `apps/api/.env`: Set `DATABASE_URL`, `JWT_SECRET`
   - `apps/web/.env.local`: Set `NEXT_PUBLIC_GRAPHQL_URL`

5. **Generate Prisma client**
   ```bash
   pnpm db:generate
   ```

6. **Run database migrations**
   ```bash
   pnpm db:migrate
   ```

7. **Seed database (optional)**
   ```bash
   pnpm db:seed
   ```

8. **Start development servers**
   ```bash
   pnpm dev
   ```

   This starts:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000
   - GraphQL Playground: http://localhost:4000/graphql

## 📝 Available Scripts

### Root Level

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed database with sample data

### Individual Apps

```bash
# Frontend only
pnpm --filter @repo/web dev

# Backend only
pnpm --filter @repo/api dev

# Database operations
pnpm --filter @repo/db db:migrate
```

## 🏛️ Architecture Principles

### Clean Architecture

- **Resolvers** (API Layer): Thin, no business logic
- **Services** (Business Logic): Domain logic, validation
- **Repositories** (Data Access): Prisma operations only
- **Clear separation of concerns**

### GraphQL Schema

- All types have `id` fields for Apollo cache normalization
- Mutations return full objects for automatic cache updates
- No backend caching (Apollo Client InMemoryCache only)

### Monorepo Benefits

- **Shared packages**: Reuse code across apps
- **Type safety**: End-to-end TypeScript
- **Fast builds**: Turborepo caching
- **Consistent tooling**: Shared ESLint, Prettier, TypeScript configs

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [Prisma Setup Guide](./packages/db/README.md)
- [Apollo Client Guide](./apps/web/README.md)
- [Backend API Guide](./apps/api/README.md)

## 🔧 Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Apollo Client
- MUI v5
- React 18

### Backend
- NestJS
- Apollo Server
- GraphQL
- Prisma
- PostgreSQL
- JWT Authentication

### Tooling
- Turborepo (build system)
- pnpm (package manager)
- ESLint + Prettier
- TypeScript
- Jest (testing)

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd apps/web
vercel
```

### Backend (Railway/Render)
```bash
cd apps/api
# Deploy using platform CLI or Git integration
```

### Database
- Railway PostgreSQL
- Supabase
- AWS RDS
- Any PostgreSQL provider

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm lint` and `pnpm test`
4. Submit a pull request

## 📄 License

MIT

## 🙋 Support

For issues and questions, please open a GitHub issue.
