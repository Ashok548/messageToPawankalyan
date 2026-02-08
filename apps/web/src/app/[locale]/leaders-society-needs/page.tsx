'use client';

import { useQuery, gql } from '@apollo/client';
import { Box, Container, Typography, Button, Grid, Alert, CircularProgress, Card, CardContent } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import AddIcon from '@mui/icons-material/Add';
import PlatformIcon from '@/components/PlatformIcon';
import { SocialPlatform } from '@/utils/socialMediaValidation';

const GET_LEADERS = gql`
    query GetLeaders {
        leaders {
            id
            name
            district
            mandal
            reason
            serviceAreas
            values
            photo
            primaryPlatform
            primaryProfileUrl
            submittedBy
            createdAt
        }
    }
`;

interface Leader {
    id: string;
    name: string;
    district: string;
    mandal?: string;
    reason: string;
    serviceAreas: string[];
    values: string[];
    photo?: string;
    primaryPlatform?: string;
    primaryProfileUrl?: string;
    submittedBy: string;
    createdAt: string;
}

export default function LeadersSocietyNeedsPage() {
    const t = useTranslations('leaders');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();
    const { data, loading, error } = useQuery(GET_LEADERS);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        // Check if user is SUPER_ADMIN
        const checkSuperAdmin = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                // Decode JWT to check role field
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setIsSuperAdmin(payload.role === 'SUPER_ADMIN');
                } catch (e) {
                    setIsSuperAdmin(false);
                }
            }
        };
        checkSuperAdmin();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
                <Alert severity="error">{tCommon('error')}: {error.message}</Alert>
            </Container>
        );
    }

    const leaders: Leader[] = data?.leaders || [];

    return (
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#fafafa', py: 4 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
                {/* Disclaimer Banner */}
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {t('disclaimer.title')}
                    </Typography>
                    <Typography variant="body2">
                        {t('disclaimer.text')}
                    </Typography>
                </Alert>

                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
                            {t('title')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {t('subtitle')}
                        </Typography>
                    </Box>

                    {/* SUPER_ADMIN-only Create Button */}
                    {isSuperAdmin && (
                        <Button
                            variant="contained"
                            onClick={() => router.push(`/${locale}/submit-leader`)}
                            sx={{ whiteSpace: 'nowrap', minWidth: { xs: 'auto', sm: 64 } }}
                        >
                            <AddIcon />
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 1 }}>
                                {tCommon('submit')}
                            </Box>
                        </Button>
                    )}
                </Box>

                {/* Leaders Grid */}
                {leaders.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            {t('noLeaders')}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {leaders.map((leader) => (
                            <Card
                                key={leader.id}
                                onClick={() => router.push(`/${locale}/leader-profile/${leader.id}`)}
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    boxShadow: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'box-shadow 0.2s ease',
                                    '&:hover': {
                                        boxShadow: 3,
                                    },
                                }}
                            >
                                {/* Image Section (Fixed 140px width on desktop) */}
                                <Box
                                    sx={{
                                        width: { xs: '100%', sm: 140 },
                                        minWidth: { sm: 140 },
                                        height: { xs: 200, sm: 'auto' },
                                        bgcolor: '#f5f5f5', // Neutral background
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                    }}
                                >
                                    {leader.photo ? (
                                        <Box
                                            component="img"
                                            src={leader.photo}
                                            alt={leader.name}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain', // Requirement: contain
                                                maxHeight: { xs: 200, sm: '100%' },
                                            }}
                                        />
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">
                                            {tCommon('noPhoto')}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Content Section */}
                                <CardContent sx={{ flex: 1, p: 3, '&:last-child': { pb: 3 } }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={9}>
                                            <Box sx={{ mb: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5, color: '#1a1a1a' }}>
                                                    {leader.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                    {leader.district}{leader.mandal ? `, ${leader.mandal}` : ''}
                                                </Typography>
                                            </Box>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2,
                                                    lineHeight: 1.6,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {leader.reason}
                                            </Typography>

                                            {/* Tags */}
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {leader.serviceAreas.slice(0, 3).map((area, idx) => (
                                                    <Box
                                                        key={idx}
                                                        sx={{
                                                            px: 1.5,
                                                            py: 0.5,
                                                            bgcolor: '#f5f5f5',
                                                            color: 'text.secondary',
                                                            borderRadius: 1,
                                                            fontSize: '0.75rem',
                                                            fontWeight: 500,
                                                            letterSpacing: '0.02em',
                                                        }}
                                                    >
                                                        {area}
                                                    </Box>
                                                ))}
                                                {leader.serviceAreas.length > 3 && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 0.5 }}>
                                                        +{leader.serviceAreas.length - 3} {tCommon('more')}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Grid>

                                        {/* View Profile CTA (Desktop: Right aligned, Mobile: Hidden or bottom) */}
                                        <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, justifyContent: 'center', gap: 1 }}>
                                            {isSuperAdmin && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/${locale}/submit-leader?id=${leader.id}`);
                                                    }}
                                                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                                                >
                                                    {tCommon('edit')}
                                                </Button>
                                            )}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Typography
                                                    variant="button"
                                                    sx={{
                                                        color: 'primary.main',
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        fontSize: '0.9rem',
                                                        '&:hover': { textDecoration: 'underline' }
                                                    }}
                                                >
                                                    {tCommon('view')} →
                                                </Typography>

                                                {/* Primary Platform Icon */}
                                                {leader.primaryPlatform && leader.primaryProfileUrl && (
                                                    <Box
                                                        component="a"
                                                        href={leader.primaryProfileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 1,
                                                            backgroundColor: 'background.paper',
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: 2,
                                                                borderColor: 'primary.main',
                                                            }
                                                        }}
                                                        aria-label={`View on ${leader.primaryPlatform}`}
                                                        title={`View on ${leader.primaryPlatform}`}
                                                    >
                                                        <PlatformIcon platform={leader.primaryPlatform as SocialPlatform} size={20} />
                                                    </Box>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </Container>
        </Box>
    );
}
