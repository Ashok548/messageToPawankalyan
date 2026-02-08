'use client';

import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import { useTranslations } from 'next-intl';

export default function MemorialPage() {
    const t = useTranslations('memorial');

    return (
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#fafafa', py: 8 }}>
            <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
                        {t('title')}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                        {t('subtitle')}
                    </Typography>
                </Box>

                <Card sx={{ p: 4, textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <CardContent>
                        <Box
                            component="img"
                            src="/assets/images/placeholder.svg"
                            alt="Memorial"
                            sx={{ width: 120, height: 120, mb: 3, opacity: 0.5, display: 'none' }}
                        // Hiding image for now as we don't have asset
                        />
                        <Typography variant="h5" color="text.secondary">
                            {t('comingSoon')}
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}
