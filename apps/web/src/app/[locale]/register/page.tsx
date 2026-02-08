'use client';

import { useMutation, gql } from '@apollo/client';
import { Box, Button, Container, TextField, Typography, Alert, Paper, Link as MuiLink } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

const REGISTER_MUTATION = gql`
    mutation Register($input: RegisterInput!) {
        register(input: $input) {
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

export default function RegisterPage() {
    const t = useTranslations('auth.register');
    const tValidation = useTranslations('validation');
    const tMessages = useTranslations('messages');
    const locale = useLocale();
    const router = useRouter();
    const [register, { loading }] = useMutation(REGISTER_MUTATION);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        age: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(null);
    };

    const validate = () => {
        if (!formData.name || !formData.mobile || !formData.age || !formData.password) {
            setError(tValidation('fillAllFields'));
            return false;
        }

        if (!/^[0-9]{10}$/.test(formData.mobile)) {
            setError(tValidation('mobileInvalid'));
            return false;
        }

        // Email validation if provided
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError(tValidation('emailInvalid'));
            return false;
        }

        const ageNum = parseInt(formData.age);
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
            setError(tValidation('ageRange'));
            return false;
        }

        if (formData.password.length < 5 || formData.password.length > 10) {
            setError(tValidation('passwordLength'));
            return false;
        }

        if (!/^(?=.*[A-Z])(?=.*\d).*$/.test(formData.password)) {
            setError(tValidation('passwordFormat'));
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError(tValidation('passwordMismatch'));
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const { data, errors } = await register({
                variables: {
                    input: {
                        name: formData.name,
                        mobile: formData.mobile,
                        email: formData.email || undefined,
                        age: parseInt(formData.age),
                        password: formData.password,
                        confirmPassword: formData.confirmPassword,
                    },
                },
            });

            if (!data?.register) {
                const msg = errors?.[0]?.message || tMessages('error.registrationFailed');
                throw new Error(msg);
            }

            // Store mobile in sessionStorage for verification page
            sessionStorage.setItem('verificationMobile', formData.mobile);

            // Redirect to verify page without OTP in URL
            router.push(`/${locale}/verify-registration`);
        } catch (err: any) {
            console.error('Registration error:', err);
            // Better error messages
            if (err.message.includes('Unique constraint')) {
                setError(tValidation('alreadyRegistered'));
            } else {
                setError(err.message || tMessages('error.registrationFailed'));
            }
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
                    <Typography variant="h5" component="h1" align="center" sx={{ mb: 3, fontWeight: 600 }}>
                        {t('createAccount')}
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
                            id="name"
                            label={t('name')}
                            name="name"
                            autoComplete="name"
                            autoFocus
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="mobile"
                            label={t('mobile')}
                            name="mobile"
                            autoComplete="tel"
                            value={formData.mobile}
                            onChange={handleChange}
                            inputProps={{ maxLength: 10 }}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            id="email"
                            label={t('email')}
                            name="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            helperText={tValidation('emailFormat')}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="age"
                            label={t('age')}
                            name="age"
                            type="number"
                            value={formData.age}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label={t('password')}
                            type="password"
                            id="password"
                            helperText={t('passwordHint')}
                            value={formData.password}
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
                            {loading ? tMessages('loading.registering') : t('register')}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link href={`/${locale}/login`} passHref legacyBehavior>
                                <MuiLink variant="body2" underline="hover">
                                    {t('alreadyHaveAccount')}
                                </MuiLink>
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
