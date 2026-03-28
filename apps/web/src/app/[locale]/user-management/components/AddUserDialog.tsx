'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    IconButton,
    Tooltip,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { ADMIN_CREATE_USER } from '@/graphql/user-management';

interface AddUserDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface FormValues {
    name: string;
    mobile: string;
    email: string;
    age: string;
    role: string;
}

interface FormErrors {
    name?: string;
    mobile?: string;
    email?: string;
    age?: string;
}

const INITIAL_FORM: FormValues = {
    name: '',
    mobile: '',
    email: '',
    age: '',
    role: 'USER',
};

/** Dialog shown after successful user creation to reveal the temp password */
function PasswordRevealDialog({
    open,
    userName,
    tempPassword,
    onClose,
}: {
    open: boolean;
    userName: string;
    tempPassword: string;
    onClose: () => void;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(tempPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <CheckIcon color="success" />
                    <Typography variant="h6">User Created Successfully</Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <strong>{userName}</strong> has been added. Share the temporary password with them —
                    it will not be shown again.
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                        px: 2,
                        py: 1.5,
                    }}
                >
                    <Typography
                        variant="h6"
                        fontFamily="monospace"
                        letterSpacing={2}
                        flexGrow={1}
                    >
                        {tempPassword}
                    </Typography>
                    <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                        <IconButton size="small" onClick={handleCopy} color={copied ? 'success' : 'default'}>
                            {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="contained">
                    Done
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function AddUserDialog({ open, onClose, onSuccess }: AddUserDialogProps) {
    const [form, setForm] = useState<FormValues>(INITIAL_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [apiError, setApiError] = useState('');
    const [revealOpen, setRevealOpen] = useState(false);
    const [createdUser, setCreatedUser] = useState<{ name: string; tempPassword: string } | null>(null);

    const [adminCreateUser, { loading }] = useMutation(ADMIN_CREATE_USER);

    const handleChange = (field: keyof FormValues, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
        if (apiError) setApiError('');
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!form.name.trim() || form.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!form.mobile.trim()) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(form.mobile.trim())) {
            newErrors.mobile = 'Mobile must be exactly 10 digits';
        }

        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            newErrors.email = 'Enter a valid email address';
        }

        if (form.age.trim()) {
            const age = Number(form.age);
            if (!Number.isInteger(age) || age < 18 || age > 100) {
                newErrors.age = 'Age must be between 18 and 100';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            const variables: Record<string, unknown> = {
                input: {
                    name: form.name.trim(),
                    mobile: form.mobile.trim(),
                    role: form.role,
                    ...(form.email.trim() && { email: form.email.trim() }),
                    ...(form.age.trim() && { age: Number(form.age) }),
                },
            };

            const { data } = await adminCreateUser({ variables });
            const payload = data?.adminCreateUser;

            setCreatedUser({ name: payload.user.name, tempPassword: payload.tempPassword });
            setRevealOpen(true);
            resetForm();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create user';
            setApiError(message);
        }
    };

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setErrors({});
        setApiError('');
    };

    const handleClose = () => {
        if (loading) return;
        resetForm();
        onClose();
    };

    const handleRevealClose = () => {
        setRevealOpen(false);
        setCreatedUser(null);
        onSuccess();
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <PersonAddIcon color="primary" />
                        <Typography variant="h6">Add New User</Typography>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        {apiError && (
                            <Alert severity="error" onClose={() => setApiError('')}>
                                {apiError}
                            </Alert>
                        )}

                        <TextField
                            label="Full Name"
                            required
                            fullWidth
                            size="small"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            error={!!errors.name}
                            helperText={errors.name}
                            disabled={loading}
                        />

                        <TextField
                            label="Mobile Number"
                            required
                            fullWidth
                            size="small"
                            value={form.mobile}
                            onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                            error={!!errors.mobile}
                            helperText={errors.mobile || '10-digit mobile number'}
                            disabled={loading}
                            inputProps={{ maxLength: 10, inputMode: 'numeric' }}
                        />

                        <TextField
                            label="Email (optional)"
                            fullWidth
                            size="small"
                            type="email"
                            value={form.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            error={!!errors.email}
                            helperText={errors.email}
                            disabled={loading}
                        />

                        <TextField
                            label="Age (optional)"
                            fullWidth
                            size="small"
                            type="number"
                            value={form.age}
                            onChange={(e) => handleChange('age', e.target.value)}
                            error={!!errors.age}
                            helperText={errors.age}
                            disabled={loading}
                            inputProps={{ min: 18, max: 100 }}
                        />

                        <FormControl fullWidth size="small" required>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={form.role}
                                label="Role"
                                onChange={(e) => handleChange('role', e.target.value)}
                                disabled={loading}
                            >
                                <MenuItem value="USER">User</MenuItem>
                                <MenuItem value="ADMIN">Admin</MenuItem>
                                <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                            </Select>
                        </FormControl>

                        <Typography variant="caption" color="text.secondary">
                            A temporary password will be auto-generated and shown once after creation.
                        </Typography>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} /> : <PersonAddIcon />}
                    >
                        {loading ? 'Creating...' : 'Create User'}
                    </Button>
                </DialogActions>
            </Dialog>

            {createdUser && (
                <PasswordRevealDialog
                    open={revealOpen}
                    userName={createdUser.name}
                    tempPassword={createdUser.tempPassword}
                    onClose={handleRevealClose}
                />
            )}
        </>
    );
}
