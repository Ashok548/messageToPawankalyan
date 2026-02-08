'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
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
    const t = useTranslations('auth.login');
    const tValidation = useTranslations('validation');
    const tMessages = useTranslations('messages');
    const locale = useLocale();
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
                router.push(`/${locale}/atrocities-to-janasainiks`);
            } else {
                console.error('No token in response:', data);
                setError(tMessages('error.loginFailed'));
            }
        },
        onError: (err) => {
            console.error('Login error:', err);
            // Check if error is related to verification
            if (err.message.includes('not verified')) {
                // Redirect to verification page
                router.push(`/${locale}/verify-registration?mobile=${mobile}`);
                return;
            }
            setError(err.message || tValidation('invalidCredentials'));
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setError('');

        console.log('Form submitted with mobile:', mobile);

        if (!mobile || !password) {
            setError(tValidation('fillAllFields'));
            return;
        }

        if (mobile.length !== 10) {
            setError(tValidation('mobileInvalid'));
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
                        {t('welcomeBack')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('signInToAccount')}
                    </Typography>
                </Box>

                <Card>
                    <CardContent sx={{ p: 4 }}>
                        {verified && (
                            <Alert severity="success" sx={{ mb: 3 }}>
                                {tMessages('success.verificationSuccess')}
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
                                    label={t('mobile')}
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                                    disabled={loading}
                                    fullWidth
                                    required
                                    autoFocus
                                    inputProps={{ maxLength: 10 }}
                                />

                                <TextField
                                    label={t('password')}
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
                                    {loading ? tMessages('loading.signingIn') : t('signIn')}
                                </Button>

                                <Box sx={{ textAlign: 'center' }}>
                                    <Link href={`/${locale}/forgot-password`} passHref legacyBehavior>
                                        <MuiLink variant="body2" underline="hover" color="primary">
                                            {t('forgotPassword')}
                                        </MuiLink>
                                    </Link>
                                </Box>

                                <Box sx={{ textAlign: 'center' }}>
                                    <Link href={`/${locale}/register`} passHref legacyBehavior>
                                        <MuiLink variant="body2" underline="hover">
                                            {t('noAccount')}
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
    const tCommon = useTranslations('common');

    return (
        <Suspense fallback={<Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography>{tCommon('loading')}</Typography></Box>}>
            <LoginForm />
        </Suspense>
    );
}
