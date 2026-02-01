import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink, Observable } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { loadingManager } from './loading-manager';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path, extensions }) => {
            console.error(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
                extensions
            );

            // Handle authentication errors
            if (extensions?.code === 'UNAUTHENTICATED') {
                // Redirect to login or clear auth state
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        });
    }

    if (networkError) {
        console.error(`[Network error]: ${networkError}`);
    }
});

// Loading interceptor link
const loadingLink = new ApolloLink((operation, forward) => {
    // Start loading when request begins
    loadingManager.startLoading();

    // Use Observable to handle both success and error cases
    return new Observable((observer) => {
        const subscription = forward(operation).subscribe({
            next: (result) => {
                loadingManager.stopLoading();
                observer.next(result);
            },
            error: (error) => {
                loadingManager.stopLoading();
                observer.error(error);
            },
            complete: () => {
                observer.complete();
            },
        });

        // Return cleanup function
        return () => {
            subscription.unsubscribe();
        };
    });
});

// HTTP link to GraphQL API
const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
    credentials: 'include', // Send cookies with requests
});

// Auth link to add authorization header
const authLink = new ApolloLink((operation, forward) => {
    // Get token from wherever you store it (cookie, localStorage, etc.)
    // For production, use httpOnly cookies instead of localStorage
    // For production, use httpOnly cookies instead of localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    // Add authorization header if token exists
    operation.setContext(({ headers = {} }) => ({
        headers: {
            ...headers,
            ...(token && { authorization: `Bearer ${token}` }),
        },
    }));

    return forward(operation);
});

// Create Apollo Client instance
function createApolloClient() {
    return new ApolloClient({
        ssrMode: typeof window === 'undefined', // Enable SSR mode on server
        link: from([loadingLink, errorLink, authLink, httpLink]),
        cache: new InMemoryCache({
            typePolicies: {
                Query: {
                    fields: {
                        // Example: Merge paginated results
                        projects: {
                            keyArgs: ['status'], // Cache separately by status filter
                            merge(existing = [], incoming) {
                                return [...existing, ...incoming];
                            },
                        },
                    },
                },
                User: {
                    keyFields: ['id'], // Use 'id' as cache key (default, but explicit)
                    fields: {
                        // Example: Custom field policy
                        projects: {
                            merge(existing = [], incoming) {
                                return incoming; // Replace existing projects
                            },
                        },
                    },
                },
                Project: {
                    keyFields: ['id'], // Use 'id' as cache key
                },
            },
        }),
        defaultOptions: {
            watchQuery: {
                fetchPolicy: 'cache-and-network', // Always fetch fresh data but show cached first
                errorPolicy: 'all',
            },
            query: {
                fetchPolicy: 'cache-first', // Use cache when available
                errorPolicy: 'all',
            },
            mutate: {
                errorPolicy: 'all',
            },
        },
    });
}

// Singleton instance for client-side
let apolloClient: ApolloClient<any> | undefined;

export function getApolloClient() {
    // Create new client for server-side rendering
    if (typeof window === 'undefined') {
        return createApolloClient();
    }

    // Reuse client on client-side (singleton)
    if (!apolloClient) {
        apolloClient = createApolloClient();
    }

    return apolloClient;
}

// Helper function to reset cache on logout
export function resetApolloCache() {
    if (apolloClient) {
        apolloClient.resetStore(); // Clears cache and refetches active queries
    }
}

// Helper function to clear cache without refetching
export function clearApolloCache() {
    if (apolloClient) {
        apolloClient.clearStore(); // Clears cache but doesn't refetch
    }
}
