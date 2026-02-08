'use client';

import { useMutation, gql } from '@apollo/client';
import { Box, Button, Container, TextField, Typography, Alert, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';

const VERIFY_OTP_MUTATION = gql`
    mutation VerifyOtp($input: VerifyOtpInput!) {
        verifyOtp(input: $input) {
            success
            message
            token
            user {
                id
                name
                email
                mobile
            }
        }
    }
`;

const RESEND_OTP_MUTATION = gql`
    mutation ResendOtp($input: ResendOtpInput!) {
        resendOtp(input: $input) {
            success
            message
        }
    }
`;

export default function VerifyRegistrationPage() {
    const t = useTranslations('auth.verify');
    const tMessages = useTranslations('messages');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();
    const [mobile, setMobile] = useState<string | null>(null);

    const [verifyOtp, { loading }] = useMutation(VERIFY_OTP_MUTATION);
    const [resendOtp, { loading: resendLoading }] = useMutation(RESEND_OTP_MUTATION);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [otp, setOtp] = useState('');
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        // Get mobile from sessionStorage
        const storedMobile = sessionStorage.getItem('verificationMobile');
        if (!storedMobile) {
            router.push(`/${locale}/register`);
        } else {
            setMobile(storedMobile);
        }
    }, [router]);

    useEffect(() => {
        // Countdown timer for resend button
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setError(t('otpLabel'));
            return;
        }

        try {
            const { data } = await verifyOtp({
                variables: {
                    input: {
                        mobile,
                        otp,
                    },
                },
            });

            if (data?.verifyOtp?.success) {
                // Store token for auto-login
                if (data.verifyOtp.token) {
                    localStorage.setItem('token', data.verifyOtp.token);
                }

                // Clear verification mobile from sessionStorage
                sessionStorage.removeItem('verificationMobile');

                // Show success message briefly then redirect
                setSuccess(tMessages('success.verified'));
                setTimeout(() => {
                    router.push(`/${locale}/dashboard`);
                }, 1500);
            }
        } catch (err: any) {
            console.error('Verification error:', err);
            if (err.message.includes('expired')) {
                setError(t('expired'));
            } else if (err.message.includes('Invalid')) {
                setError(t('invalid'));
            } else {
                setError(err.message || tMessages('error.generic'));
            }
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;

        try {
            setError(null);
            setSuccess(null);

            const { data } = await resendOtp({
                variables: {
                    input: { mobile },
                },
            });

            if (data?.resendOtp?.success) {
                setSuccess(tMessages('success.submitted'));
                setCountdown(60); // 60 second cooldown
            }
        } catch (err: any) {
            console.error('Resend OTP error:', err);
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
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h5" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
                        {t('verifyOtp')}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {t('instruction')} <b>{mobile}</b>
                        <br />
                        (Check server console for OTP)
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                            {success}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="otp"
                            label={t('otpLabel')}
                            name="otp"
                            autoComplete="one-time-code"
                            autoFocus
                            value={otp}
                            onChange={(e) => {
                                setOtp(e.target.value.replace(/[^0-9]/g, ''));
                                setError(null);
                            }}
                            inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem' } }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            {loading ? tMessages('loading.submitting') : t('verify')}
                        </Button>

                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleResendOtp}
                            disabled={resendLoading || countdown > 0}
                            sx={{ py: 1.5 }}
                        >
                            {resendLoading ? tMessages('loading.submitting') : countdown > 0 ? `${tCommon('resend')} (${countdown}s)` : tCommon('resend')}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
