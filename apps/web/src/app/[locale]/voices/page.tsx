'use client';

import { useQuery } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, Container, Stack, Typography } from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import AddIcon from '@mui/icons-material/Add';
import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { VoiceCard } from '@/components/VoiceCard';
import { GET_VOICES } from '@/graphql/voices';
import { useNavigate } from '@/hooks/use-navigate';
import { loadingManager } from '@/lib/loading-manager';

export default function VoicesPage() {
    const t = useTranslations('voices');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const { navigate } = useNavigate();

    useEffect(() => {
        loadingManager.stopNavigation();
    }, []);

    const { data, loading, error } = useQuery(GET_VOICES, {
        variables: { pagination: { take: 50, skip: 0 } },
        fetchPolicy: 'cache-and-network',
    });

    const voices = data?.voices ?? [];

    return (
        <Box component="main" sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #fff9f2 0%, #ffffff 35%, #f7fbff 100%)' }}>
            <Container maxWidth={false} sx={{ maxWidth: '1180px', px: { xs: 2, sm: 3 } }}>
                <Box sx={{ mb: 4, p: { xs: 3, md: 4 }, borderRadius: 4, background: 'linear-gradient(135deg, #fff2df 0%, #fff 48%, #eaf5ff 100%)', border: '1px solid #f0dfc6' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                        <Box>
                            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1 }}>
                                <CampaignOutlinedIcon sx={{ color: '#c26b00' }} />
                                <Typography variant="overline" sx={{ letterSpacing: '0.16em', color: '#9b5d16', fontWeight: 700 }}>
                                    {t('eyebrow')}
                                </Typography>
                            </Stack>
                            <Typography variant="h3" component="h1" sx={{ fontWeight: 900, lineHeight: 1.05, mb: 1.25, fontSize: { xs: '2rem', md: '2.8rem' } }}>
                                {t('title')}
                            </Typography>
                            <Typography sx={{ maxWidth: 760, color: 'text.secondary', lineHeight: 1.75 }}>
                                {t('subtitle')}
                            </Typography>
                        </Box>

                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(`/${locale}/voices/submit`)}>
                            {t('submitVoice')}
                        </Button>
                    </Stack>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                    {t('publicNotice')}
                </Alert>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{tCommon('error')}: {error.message}</Alert>
                ) : voices.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{t('emptyTitle')}</Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>{t('emptySubtitle')}</Typography>
                        <Button variant="contained" onClick={() => navigate(`/${locale}/voices/submit`)}>{t('submitFirstVoice')}</Button>
                    </Box>
                ) : (
                    <Stack spacing={2.5}>
                        {voices.map((voice: any) => (
                            <VoiceCard
                                key={voice.id}
                                voice={voice}
                                onOpen={() => navigate(`/${locale}/voices/${voice.id}`)}
                            />
                        ))}
                    </Stack>
                )}
            </Container>
        </Box>
    );
}

