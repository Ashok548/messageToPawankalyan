'use client';

import { useMutation, gql } from '@apollo/client';
import { Box, Button, Container, TextField, Typography, Alert, Paper, Link as MuiLink } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

const FORGOT_PASSWORD_MUTATION = gql`
    mutation ForgotPassword($input: ForgotPasswordInput!) {
        forgotPassword(input: $input) {
            success
            message
            otp
        }
    }
`;

export default function ForgotPasswordPage() {
    const t = useTranslations('auth.forgotPassword');
    const tValidation = useTranslations('validation');
    const tMessages = useTranslations('messages');
    const locale = useLocale();
    const router = useRouter();
    const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD_MUTATION);
    const [error, setError] = useState<string | null>(null);
    const [mobile, setMobile] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!mobile || mobile.length !== 10) {
            setError(tValidation('mobileInvalid'));
            return;
        }

        try {
            const { data } = await forgotPassword({
                variables: {
                    input: { mobile },
                },
            });

            if (data?.forgotPassword?.success) {
                // Redirect to reset password page with OTP for testing
                const otp = data.forgotPassword.otp || '';
                router.push(`/${locale}/reset-password?mobile=${mobile}&otp=${otp}`);
            }
        } catch (err: any) {
            setError(err.message || tMessages('error.generic'));
        }
    };

    return (
        <Box
            component="main"
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fafafa',
                py: 4,
            }}
        >
            <Container maxWidth="xs">
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h5" component="h1" align="center" sx={{ mb: 1, fontWeight: 600 }}>
                        {t('title')}
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                        {t('instruction')}
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="mobile"
                            label={t('mobile')}
                            name="mobile"
                            autoComplete="tel"
                            autoFocus
                            value={mobile}
                            onChange={(e) => {
                                setMobile(e.target.value.replace(/[^0-9]/g, ''));
                                setError(null);
                            }}
                            inputProps={{ maxLength: 10 }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            {loading ? tMessages('loading.submitting') : t('sendOtp')}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link href={`/${locale}/login`} passHref legacyBehavior>
                                <MuiLink variant="body2" underline="hover">
                                    {t('backToLogin')}
                                </MuiLink>
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
