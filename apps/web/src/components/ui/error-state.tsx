'use client';

import { Alert, AlertTitle, Box } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

interface ErrorStateProps {
    title?: string;
    message: string;
    action?: ReactNode;
}

export function ErrorState({ title, message, action }: ErrorStateProps) {
    const t = useTranslations('ui');
    const displayTitle = title || t('error');
    return (
        <Box sx={{ py: 4 }}>
            <Alert severity="error" action={action}>
                <AlertTitle>{displayTitle}</AlertTitle>
                {message}
            </Alert>
        </Box>
    );
}
