'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    Link as MuiLink,
} from '@mui/material';
import { useMutation, gql } from '@apollo/client';
import { resetApolloCache } from '@/lib/apollo-client';

const LOGIN_MUTATION = gql`
    mutation Login($input: LoginInput!) {
        login(input: $input) {
            token
            user {
                id
                name
                mobile
                email
                role
            }
        }
    }
`;

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const verified = searchParams.get('verified');

    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION, {
        onCompleted: (data) => {
            console.log('Login mutation completed:', data);
            if (data?.login?.token) {
                console.log('Token received, saving to localStorage');
                localStorage.setItem('authToken', data.login.token);
                resetApolloCache();
                console.log('Redirecting to atrocities');
                router.push('/atrocities-to-janasainiks');
            } else {
                console.error('No token in response:', data);
                setError('Login failed - no token received');
            }
        },
        onError: (err) => {
            console.error('Login error:', err);
            // Check if error is related to verification
            if (err.message.includes('not verified')) {
                // Redirect to verification page
                router.push(`/verify-registration?mobile=${mobile}`);
                return;
            }
            setError(err.message || 'Invalid mobile or password');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setError('');

        console.log('Form submitted with mobile:', mobile);

        if (!mobile || !password) {
            setError('Please enter mobile number and password');
            return;
        }

        if (mobile.length !== 10) {
            setError('Mobile number must be 10 digits');
            return;
        }

        try {
            console.log('Calling login mutation...');
            await loginMutation({
                variables: {
                    input: { mobile, password },
                },
            });
        } catch (error) {
            console.error('Mutation error caught:', error);
            // Error is already handled by onError callback
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
            }}
        >
            <Container maxWidth="sm">
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Welcome Back
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Sign in to your account
                    </Typography>
                </Box>

                <Card>
                    <CardContent sx={{ p: 4 }}>
                        {verified && (
                            <Alert severity="success" sx={{ mb: 3 }}>
                                Verification successful! Please login.
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {error && (
                                    <Alert severity="error" onClose={() => setError('')}>
                                        {error}
                                    </Alert>
                                )}

                                <TextField
                                    label="Mobile Number"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                                    disabled={loading}
                                    fullWidth
                                    required
                                    autoFocus
                                    inputProps={{ maxLength: 10 }}
                                />

                                <TextField
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    fullWidth
                                    required
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    fullWidth
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Button>

                                <Box sx={{ textAlign: 'center' }}>
                                    <Link href="/forgot-password" passHref legacyBehavior>
                                        <MuiLink variant="body2" underline="hover" color="primary">
                                            Forgot Password?
                                        </MuiLink>
                                    </Link>
                                </Box>

                                <Box sx={{ textAlign: 'center' }}>
                                    <Link href="/register" passHref legacyBehavior>
                                        <MuiLink variant="body2" underline="hover">
                                            Don't have an account? Create one
                                        </MuiLink>
                                    </Link>
                                </Box>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography>Loading...</Typography></Box>}>
            <LoginForm />
        </Suspense>
    );
}
