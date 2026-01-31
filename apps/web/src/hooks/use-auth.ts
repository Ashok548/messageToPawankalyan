'use client';

import { useMutation, useQuery } from '@apollo/client';
import { LOGIN_USER, REGISTER_USER } from '@/graphql/mutations';
import { GET_CURRENT_USER } from '@/graphql/queries';
import { resetApolloCache } from '@/lib/apollo-client';

export function useAuth() {
    const [loginMutation, { loading: loginLoading, error: loginError }] = useMutation(LOGIN_USER, {
        onCompleted: (data) => {
            if (data?.login?.token) {
                // Store token (use httpOnly cookie in production!)
                localStorage.setItem('authToken', data.login.token);

                // Reset cache to clear any cached data from previous user
                resetApolloCache();
            }
        },
    });

    const [registerMutation, { loading: registerLoading, error: registerError }] = useMutation(
        REGISTER_USER,
        {
            onCompleted: (data) => {
                if (data?.register?.token) {
                    localStorage.setItem('authToken', data.register.token);
                    resetApolloCache();
                }
            },
        }
    );

    const { data: userData, loading: userLoading, error: userError } = useQuery(GET_CURRENT_USER, {
        fetchPolicy: 'network-only',
        skip: typeof window === 'undefined' || !localStorage.getItem('authToken'),
    });

    const login = async (email: string, password: string) => {
        const result = await loginMutation({
            variables: {
                input: { email, password },
            },
        });
        return result.data?.login;
    };

    const register = async (email: string, password: string, name: string) => {
        const result = await registerMutation({
            variables: {
                input: { email, password, name },
            },
        });
        return result.data?.register;
    };

    const logout = () => {
        // Remove token
        localStorage.removeItem('authToken');

        // Clear Apollo cache and refetch active queries
        resetApolloCache();

        // Redirect to login
        window.location.href = '/login';
    };

    return {
        user: userData?.me,
        isAuthenticated: !!userData?.me,
        login,
        register,
        logout,
        loading: loginLoading || registerLoading || userLoading,
        error: loginError || registerError || userError,
    };
}
