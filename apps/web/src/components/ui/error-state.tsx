'use client';

import { Alert, AlertTitle, Box } from '@mui/material';
import { ReactNode } from 'react';

interface ErrorStateProps {
    title?: string;
    message: string;
    action?: ReactNode;
}

export function ErrorState({ title = 'Error', message, action }: ErrorStateProps) {
    return (
        <Box sx={{ py: 4 }}>
            <Alert severity="error" action={action}>
                <AlertTitle>{title}</AlertTitle>
                {message}
            </Alert>
        </Box>
    );
}
