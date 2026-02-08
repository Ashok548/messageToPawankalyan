'use client';

import { useMutation, gql } from '@apollo/client';
import { Box, Button, Container, TextField, Typography, Alert, Paper } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useTranslations, useLocale } from 'next-intl';

const RESET_PASSWORD_MUTATION = gql`
    mutation ResetPassword($input: ResetPasswordInput!) {
        resetPassword(input: $input) {
            success
            message
        }
    }
`;

function ResetPasswordForm() {
    const t = useTranslations('auth.resetPassword');
    const tValidation = useTranslations('validation');
    const tMessages = useTranslations('messages');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();
    const mobile = searchParams.get('mobile');

    // Auto-fill OTP if present in URL (for easier testing as requested)
    const urlOtp = searchParams.get('otp') || '';

    const [resetPassword, { loading }] = useMutation(RESET_PASSWORD_MUTATION);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        otp: urlOtp,
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!mobile) {
            setError(t('missingMobile'));
            return;
        }

        if (!formData.otp || formData.otp.length !== 6) {
            setError(t('invalidOtp'));
            return;
        }

        if (formData.newPassword.length < 5 || formData.newPassword.length > 10) {
            setError(tValidation('passwordLength'));
            return;
        }

        if (!/^(?=.*[A-Z])(?=.*\d).*$/.test(formData.newPassword)) {
            setError(tValidation('passwordFormat'));
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError(tValidation('passwordMismatch'));
            return;
        }

        try {
            const { data } = await resetPassword({
                variables: {
                    input: {
                        mobile,
                        otp: formData.otp,
                        newPassword: formData.newPassword,
                        confirmPassword: formData.confirmPassword,
                    },
                },
            });

            if (data?.resetPassword?.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push(`/${locale}/login`);
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || tMessages('error.generic'));
        }
    };

    if (!mobile) return null;

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
                    <Typography variant="h5" component="h1" align="center" sx={{ mb: 3, fontWeight: 600 }}>
                        {t('title')}
                    </Typography>

                    {success ? (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {t('success')}
                        </Alert>
                    ) : (
                        <>
                            {error && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    {error}
                                </Alert>
                            )}

                            {/* Display OTP for testing if available in strict mode, or just as a hint */}
                            {/* The user request said "otp will be displayed in ui". 
                                 We assume this means on the previous page or passed here. 
                                 If passed in URL, we auto-filled it. 
                                 If they look at the console from the backend, they see it. 
                                 But for "UI display", maybe we can show it here if it's in the URL? 
                             */}
                            {urlOtp && (
                                <Box sx={{ mb: 2, p: 1, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px dashed #2196f3', color: '#0d47a1', textAlign: 'center', fontWeight: 'bold' }}>
                                    Your OTP: {urlOtp}
                                </Box>
                            )}

                            <Box component="form" onSubmit={handleSubmit} noValidate>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="otp"
                                    label={t('otp')}
                                    name="otp"
                                    autoComplete="off"
                                    value={formData.otp}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                        setFormData({ ...formData, otp: value });
                                        setError(null);
                                    }}
                                    inputProps={{ maxLength: 6 }}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="newPassword"
                                    label={t('newPassword')}
                                    type="password"
                                    id="newPassword"
                                    helperText={tValidation('passwordFormat')}
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="confirmPassword"
                                    label={t('confirmPassword')}
                                    type="password"
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                                >
                                    {loading ? tMessages('loading.submitting') : t('resetPassword')}
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography>Loading...</Typography></Box>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
