'use client';

import { useMutation, gql } from '@apollo/client';
import { Box, Button, Container, TextField, Typography, Alert, Paper } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

const RESET_PASSWORD_MUTATION = gql`
    mutation ResetPassword($input: ResetPasswordInput!) {
        resetPassword(input: $input) {
            success
            message
        }
    }
`;

function ResetPasswordForm() {
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
            setError('Missing mobile number. Please restart the process.');
            return;
        }

        if (!formData.otp || formData.otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        if (formData.newPassword.length < 5 || formData.newPassword.length > 10) {
            setError('Password must be between 5 and 10 characters');
            return;
        }

        if (!/^(?=.*[A-Z])(?=.*\d).*$/.test(formData.newPassword)) {
            setError('Password must contain at least one uppercase letter and one number');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
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
                    router.push('/login');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || 'Password reset failed');
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
                        Reset Password
                    </Typography>

                    {success ? (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Password reset successful! Redirecting to login...
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
                                    label="Enter 6-digit OTP"
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
                                    label="New Password"
                                    type="password"
                                    id="newPassword"
                                    helperText="5-10 chars, 1 uppercase, 1 number"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirm New Password"
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
                                    {loading ? 'Resetting...' : 'Reset Password'}
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
