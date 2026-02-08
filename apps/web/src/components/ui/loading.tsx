'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
}

export function Loading({ message, fullScreen = false }: LoadingProps) {
    const t = useTranslations('ui');
    const displayMessage = message || t('loading');
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                ...(fullScreen && {
                    minHeight: '100vh',
                }),
                ...(!fullScreen && {
                    py: 8,
                }),
            }}
        >
            <CircularProgress />
            {displayMessage && (
                <Typography variant="body2" color="text.secondary">
                    {displayMessage}
                </Typography>
            )}
        </Box>
    );
}
