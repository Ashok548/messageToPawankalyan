'use client';

import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { getApolloClient } from '@/lib/apollo-client';
import { ReactNode } from 'react';

interface ApolloProviderProps {
    children: ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
    const client = getApolloClient();

    return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}
