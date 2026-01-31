'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
}

export function Loading({ message = 'Loading...', fullScreen = false }: LoadingProps) {
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
            {message && (
                <Typography variant="body2" color="text.secondary">
                    {message}
                </Typography>
            )}
        </Box>
    );
}
