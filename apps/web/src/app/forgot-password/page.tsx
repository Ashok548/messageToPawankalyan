'use client';

import { useMutation, gql } from '@apollo/client';
import { Box, Button, Container, TextField, Typography, Alert, Paper, Link as MuiLink } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
    const router = useRouter();
    const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD_MUTATION);
    const [error, setError] = useState<string | null>(null);
    const [mobile, setMobile] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!mobile || mobile.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
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
                router.push(`/reset-password?mobile=${mobile}&otp=${otp}`);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
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
                        Forgot Password
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                        Enter your mobile number to receive an OTP
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
                            label="Mobile Number"
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
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link href="/login" passHref legacyBehavior>
                                <MuiLink variant="body2" underline="hover">
                                    Back to Login
                                </MuiLink>
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
