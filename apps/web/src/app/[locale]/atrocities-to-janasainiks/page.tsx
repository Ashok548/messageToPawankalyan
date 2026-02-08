'use client';

import { Box, Container, Typography, CircularProgress, Alert, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_ATROCITIES, GET_UNVERIFIED_ATROCITIES } from '@/graphql/queries/atrocities';
import AtrocityCard from '@/components/atrocities/AtrocityCard';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import AddIcon from '@mui/icons-material/Add';
import { Spinner } from '@/components/ui/spinner';

interface Atrocity {
    id: string;
    leaderName: string;
    state: string;
    district: string;
    constituency: string;
    mandal: string;
    village: string;
    position: string;
    description: string;
    subject?: string;
    images: string[];
    isVerified: boolean;
}

export default function AttrocitiesToJanasainiksPage() {
    const t = useTranslations('atrocities');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unverified'>('all');

    // Check if user is SUPER_ADMIN
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setIsSuperAdmin(payload.role === 'SUPER_ADMIN');
            } catch (e) {
                setIsSuperAdmin(false);
            }
        }
    }, []);

    // Use different query based on filter
    const { data, loading, error } = useQuery(
        filter === 'unverified' ? GET_UNVERIFIED_ATROCITIES : GET_ATROCITIES
    );

    return (
        <Box
            component="main"
            sx={{
                minHeight: {
                    xs: 'calc(100vh - 52px)', // Mobile header: 52px
                    sm: 'calc(100vh - 48px)'  // Desktop header: 48px
                },
                backgroundColor: '#fafafa',
                py: { xs: 4, sm: 6 },
            }}
        >
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
                {/* Header Section */}
                <Box
                    sx={{
                        mb: 5,
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'center', md: 'flex-start' },
                        justifyContent: 'space-between',
                        gap: 3,
                        textAlign: { xs: 'center', md: 'left' }
                    }}
                >
                    <Box sx={{ maxWidth: 680 }}>
                        <Typography
                            component="h1"
                            sx={{
                                fontSize: { xs: 28, sm: 36, md: 42 },
                                fontWeight: 700,
                                lineHeight: 1.2,
                                color: '#1a1a1a',
                                mb: 1.5,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {t('title')}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: { xs: 16, sm: 18 },
                                color: 'text.secondary',
                            }}
                        >
                            {t('subtitle')}
                        </Typography>
                    </Box>

                    {/* Actions Row */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: { xs: 'center', md: 'flex-end' } }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={() => router.push(`/${locale}/report-atrocity`)}
                            sx={{
                                px: 3,
                                py: 1.2,
                                fontSize: 15,
                                fontWeight: 600,
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: 2,
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {t('reportNew')}
                        </Button>

                        {/* SUPER_ADMIN Filter Toggle */}
                        {isSuperAdmin && (
                            <ToggleButtonGroup
                                value={filter}
                                exclusive
                                onChange={(_, newFilter) => {
                                    if (newFilter !== null) {
                                        setFilter(newFilter);
                                    }
                                }}
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                                    height: 36,
                                    '& .MuiToggleButton-root': {
                                        px: 2,
                                        py: 0.5,
                                        textTransform: 'none',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        border: 'none',
                                        borderRadius: 2,
                                        margin: '2px',
                                        '&.Mui-selected': {
                                            backgroundColor: 'error.main',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'error.dark',
                                            }
                                        }
                                    },
                                }}
                            >
                                <ToggleButton value="all">{t('filters.all')}</ToggleButton>
                                <ToggleButton value="unverified">{t('filters.pending')}</ToggleButton>
                            </ToggleButtonGroup>
                        )}
                    </Box>
                </Box>

                {/* Loading State */}
                {loading && (
                    <Spinner message={t('loadingAtrocities')} fullScreen />
                )}

                {/* Error State */}
                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {tCommon('error')}: {error.message}
                    </Alert>
                )}

                {/* Atrocities List (Vertical Stack) */}
                {data?.atrocities && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {data.atrocities.map((atrocity: Atrocity) => (
                            <AtrocityCard
                                key={atrocity.id}
                                id={atrocity.id}
                                leaderName={atrocity.leaderName}
                                state={atrocity.state}
                                district={atrocity.district}
                                constituency={atrocity.constituency}
                                mandal={atrocity.mandal}
                                village={atrocity.village}
                                position={atrocity.position}
                                description={atrocity.description}
                                subject={atrocity.subject}
                                images={atrocity.images}
                                isVerified={atrocity.isVerified}
                            />
                        ))}
                    </Box>
                )}

                {/* Empty State */}
                {data?.atrocities && data.atrocities.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 2, border: '1px dashed #e0e0e0' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {t('noAtrocities')}
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => router.push(`/${locale}/report-atrocity`)}
                            sx={{ mt: 1, textTransform: 'none' }}
                        >
                            {t('reportNew')}
                        </Button>
                    </Box>
                )}
            </Container>
        </Box>
    );
}
