'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface User {
    id: string;
    name: string;
    role: string;
}

interface RoleChangeDialogProps {
    open: boolean;
    user: User | null;
    newRole: string;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
}

export function RoleChangeDialog({
    open,
    user,
    newRole,
    onConfirm,
    onCancel,
}: RoleChangeDialogProps) {
    const t = useTranslations('userManagement.dialog');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const isSuperAdminChange = newRole === 'SUPER_ADMIN' || user.role === 'SUPER_ADMIN';

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <WarningAmberIcon color="warning" />
                    <Typography variant="h6">{t('title')}</Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        {t('aboutToChange')}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>
                        {user.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                {t('currentRole')}
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                                {user.role}
                            </Typography>
                        </Box>
                        <Typography variant="h6" color="text.secondary">
                            →
                        </Typography>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                {t('newRole')}
                            </Typography>
                            <Typography variant="body1" fontWeight={600} color="primary">
                                {newRole}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {isSuperAdminChange && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            {t('superAdminWarning')}
                        </Typography>
                    </Alert>
                )}

                <Typography variant="body2" color="text.secondary">
                    {t('warningDetail')}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCancel} disabled={loading}>
                    {t('cancel')}
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={16} />}
                >
                    {loading ? t('updating') : t('confirm')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
