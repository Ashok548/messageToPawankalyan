'use client';

import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { getApolloClient } from '@/lib/apollo-client';
import { ReactNode } from 'react';
import { LoadingProvider } from '@/contexts/loading-context';

interface ApolloProviderProps {
    children: ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
    const client = getApolloClient();

    return (
        <BaseApolloProvider client={client}>
            <LoadingProvider>
                {children}
            </LoadingProvider>
        </BaseApolloProvider>
    );
}
