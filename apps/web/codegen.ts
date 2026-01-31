import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
    documents: ['src/**/*.{ts,tsx}'],
    generates: {
        './src/graphql/generated/': {
            preset: 'client',
            plugins: [],
            presetConfig: {
                gqlTagName: 'gql',
            },
        },
        './src/graphql/generated/types.ts': {
            plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
            config: {
                withHooks: true,
                withComponent: false,
                withHOC: false,
            },
        },
    },
    ignoreNoDocuments: true,
};

export default config;
