'use client';

import { Card as MuiCard, CardProps as MuiCardProps, CardContent, CardHeader, CardActions } from '@mui/material';
import { ReactNode } from 'react';

interface CardProps extends Omit<MuiCardProps, 'title'> {
    title?: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
}

export function Card({ title, subtitle, actions, children, ...props }: CardProps) {
    return (
        <MuiCard {...props}>
            {(title || subtitle) && (
                <CardHeader
                    title={title}
                    subheader={subtitle}
                    titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    subheaderTypographyProps={{ variant: 'body2' }}
                />
            )}
            <CardContent>{children}</CardContent>
            {actions && <CardActions>{actions}</CardActions>}
        </MuiCard>
    );
}
