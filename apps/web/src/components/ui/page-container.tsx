'use client';

import { Box, Container, ContainerProps } from '@mui/material';
import { ReactNode } from 'react';

interface PageContainerProps extends ContainerProps {
    children: ReactNode;
}

export function PageContainer({ children, ...props }: PageContainerProps) {
    return (
        <Container maxWidth="xl" {...props}>
            <Box sx={{ py: 3 }}>{children}</Box>
        </Container>
    );
}
