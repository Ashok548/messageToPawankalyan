'use client';

import { Box, Typography, Button } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';
import { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 2,
                textAlign: 'center',
            }}
        >
            <Box
                sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                }}
            >
                {icon || <InboxIcon sx={{ fontSize: 32, color: 'text.secondary' }} />}
            </Box>

            <Typography variant="h6" fontWeight={600} gutterBottom>
                {title}
            </Typography>

            {description && (
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
                    {description}
                </Typography>
            )}

            {action && (
                <Button variant="contained" onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </Box>
    );
}
