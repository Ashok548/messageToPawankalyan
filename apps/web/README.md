# @repo/web

Next.js frontend application with Apollo Client.

## Setup

1. **Copy environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Update environment variables:**
   ```env
   NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

4. **Generate GraphQL types (after backend is running):**
   ```bash
   pnpm codegen
   ```

5. **Start development server:**
   ```bash
   pnpm dev
   ```

## Available Scripts

- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- `pnpm codegen` - Generate TypeScript types from GraphQL schema

## Folder Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with Apollo Provider
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # React components
│   │   └── providers/
│   │       └── apollo-provider.tsx  # Apollo Client provider
│   │
│   ├── graphql/                # GraphQL operations
│   │   ├── queries/
│   │   │   └── index.ts        # Query definitions
│   │   ├── mutations/
│   │   │   └── index.ts        # Mutation definitions
│   │   └── generated/          # Auto-generated types (gitignored)
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-projects.ts     # Project query/mutation hooks
│   │   └── use-auth.ts         # Authentication hooks
│   │
│   └── lib/                    # Utilities and configurations
│       └── apollo-client.ts    # Apollo Client setup
│
├── public/                     # Static assets
├── .env.local.example          # Environment variables template
├── codegen.ts                  # GraphQL Code Generator config
├── next.config.mjs             # Next.js configuration
├── package.json
└── tsconfig.json
```

## Apollo Client Usage

### Queries

```typescript
'use client';

import { useQuery } from '@apollo/client';
import { GET_PROJECTS } from '@/graphql/queries';

export function ProjectsList() {
  const { data, loading, error } = useQuery(GET_PROJECTS, {
    variables: { status: 'ACTIVE' },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data.projects.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  );
}
```

### Mutations

```typescript
'use client';

import { useMutation } from '@apollo/client';
import { CREATE_PROJECT } from '@/graphql/mutations';
import { GET_PROJECTS } from '@/graphql/queries';

export function CreateProjectForm() {
  const [createProject, { loading }] = useMutation(CREATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS }],
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await createProject({
      variables: {
        input: {
          name: formData.get('name'),
          description: formData.get('description'),
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <textarea name="description" />
      <button type="submit" disabled={loading}>
        Create Project
      </button>
    </form>
  );
}
```

### Custom Hooks

```typescript
import { useProjects, useCreateProject } from '@/hooks/use-projects';

export function MyComponent() {
  const { projects, loading } = useProjects('ACTIVE');
  const { createProject } = useCreateProject();

  // Use projects and createProject...
}
```

### Authentication

```typescript
import { useAuth } from '@/hooks/use-auth';

export function LoginForm() {
  const { login, logout, loading } = useAuth();

  const handleLogin = async () => {
    await login('user@example.com', 'password');
    // Cache is automatically reset
  };

  const handleLogout = () => {
    logout(); // Clears cache and redirects
  };

  // ...
}
```

## Cache Policies

### Fetch Policies

- **`cache-first`** (default) - Use cache if available, otherwise fetch
- **`cache-and-network`** - Show cached data immediately, fetch fresh data in background
- **`network-only`** - Always fetch from network, update cache
- **`no-cache`** - Fetch from network, don't cache result
- **`cache-only`** - Only use cache, error if not cached

### Type Policies

Configured in `src/lib/apollo-client.ts`:

```typescript
typePolicies: {
  User: {
    keyFields: ['id'], // Cache key
  },
  Project: {
    keyFields: ['id'],
  },
}
```

### Cache Updates

**Automatic** (when mutation returns object with `id`):
```typescript
const [updateProject] = useMutation(UPDATE_PROJECT);
// Apollo automatically updates cache
```

**Manual** (for lists):
```typescript
const [createProject] = useMutation(CREATE_PROJECT, {
  update(cache, { data }) {
    cache.writeQuery({
      query: GET_PROJECTS,
      data: { projects: [...existing, data.createProject] },
    });
  },
});
```

**Refetch** (simplest but less efficient):
```typescript
const [createProject] = useMutation(CREATE_PROJECT, {
  refetchQueries: [{ query: GET_PROJECTS }],
});
```

## Security

### Authentication

- Tokens stored in `localStorage` (for demo only)
- **Production**: Use httpOnly cookies instead
- Authorization header added via `authLink`

### Cache Reset on Logout

```typescript
import { resetApolloCache } from '@/lib/apollo-client';

function logout() {
  localStorage.removeItem('authToken');
  resetApolloCache(); // Clears all cached data
  window.location.href = '/login';
}
```

This prevents:
- Data leakage between users
- Stale data after logout
- Unauthorized access to cached queries

## Best Practices

1. **Always include `id` field** in queries/mutations for cache normalization
2. **Use custom hooks** to encapsulate data fetching logic
3. **Reset cache on logout** to prevent data leakage
4. **Use `cache-and-network`** for frequently changing data
5. **Optimize with `update` function** instead of `refetchQueries` when possible
6. **Handle loading and error states** in components
7. **Use GraphQL Code Generator** for type safety

## Type Safety

After running `pnpm codegen`, you get:

```typescript
import { useGetProjectsQuery, useCreateProjectMutation } from '@/graphql/generated/types';

// Fully typed hooks
const { data } = useGetProjectsQuery();
const [createProject] = useCreateProjectMutation();
```

## Deployment

### Vercel (Recommended)

```bash
vercel
```

### Docker

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

## Troubleshooting

### Cache not updating after mutation

- Ensure mutation returns object with `id` field
- Check `typePolicies` configuration
- Use `update` function or `refetchQueries`

### "Cannot read property of undefined"

- Check if data is loaded: `if (!data) return null;`
- Use optional chaining: `data?.projects`

### CORS errors

- Ensure backend allows frontend origin
- Check `credentials: 'include'` in `httpLink`
