'use client';

import { useMutation, gql } from '@apollo/client';
import { Box, Button, Container, TextField, Typography, Alert, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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
            router.push('/register');
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
            setError('Please enter a valid 6-digit OTP');
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
                setSuccess('Verification successful! Redirecting...');
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            }
        } catch (err: any) {
            console.error('Verification error:', err);
            if (err.message.includes('expired')) {
                setError('OTP has expired. Please request a new one.');
            } else if (err.message.includes('Invalid')) {
                setError('Invalid OTP. Please check and try again.');
            } else {
                setError(err.message || 'Verification failed');
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
                setSuccess('OTP resent successfully! Check server console.');
                setCountdown(60); // 60 second cooldown
            }
        } catch (err: any) {
            console.error('Resend OTP error:', err);
            setError(err.message || 'Failed to resend OTP');
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
                        Verify Mobile
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Please enter the OTP sent to <b>{mobile}</b>
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
                            label="Enter 6-digit OTP"
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
                            {loading ? 'Verifying...' : 'Verify'}
                        </Button>

                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleResendOtp}
                            disabled={resendLoading || countdown > 0}
                            sx={{ py: 1.5 }}
                        >
                            {resendLoading ? 'Sending...' : countdown > 0 ? `Resend OTP (${countdown}s)` : 'Resend OTP'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
