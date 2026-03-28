'use client';

import { useQuery, gql } from '@apollo/client';
import { Box, Container, Typography, Card, CardContent, CircularProgress, Alert, Button, IconButton } from '@mui/material';
import { useNavigate } from '@/hooks/use-navigate';
import { useTranslations, useLocale } from 'next-intl';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '@/hooks/use-auth';
import PlatformIcon from '@/components/PlatformIcon';
import { SocialPlatform, getPlatformName, getPlatformColor } from '@/utils/socialMediaValidation';

const GET_WARRIORS = gql`
    query GetSocialMediaWarriors {
        socialMediaWarriors {
            id
            name
            district
            mandal
            reason
            digitalContributions
            engagementStyle
            photo
            primaryPlatform
            primaryFollowersCount
            otherPlatforms {
                platform
                followersCount
            }
            createdAt
        }
    }
`;

interface WarriorOtherPlatform {
    platform: SocialPlatform;
    followersCount?: number;
}

interface SocialMediaWarrior {
    id: string;
    name: string;
    district: string;
    mandal?: string;
    reason: string;
    digitalContributions: string[];
    engagementStyle: string[];
    photo?: string;
    primaryPlatform?: SocialPlatform;
    primaryFollowersCount?: number;
    otherPlatforms?: WarriorOtherPlatform[];
    createdAt: string;
}

function formatFollowersCount(count?: number) {
    if (count == null) return null;

    return new Intl.NumberFormat('en', {
        notation: count >= 1000 ? 'compact' : 'standard',
        maximumFractionDigits: count >= 1000 ? 1 : 0,
    }).format(count);
}

export default function SocialMediaWarriorsPage() {
    const t = useTranslations('warriors');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const { navigate } = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const { data, loading, error } = useQuery(GET_WARRIORS);

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

    const warriors: SocialMediaWarrior[] = data?.socialMediaWarriors || [];

    return (
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#fafafa', py: 4 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
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

                    {/* Admin-only Create Button */}
                    {isAdmin && (
                        <Button
                            variant="contained"
                            onClick={() => navigate(`/${locale}/submit-social-warrior`)}
                            sx={{ whiteSpace: 'nowrap', minWidth: { xs: 'auto', sm: 64 } }}
                        >
                            <AddIcon />
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 1 }}>
                                {tCommon('submit')}
                            </Box>
                        </Button>
                    )}
                </Box>

                {/* Warriors List */}
                {warriors.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            {t('noWarriors')}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {warriors.map((warrior) => {
                            const platformBadges = [
                                warrior.primaryPlatform
                                    ? { platform: warrior.primaryPlatform, followersCount: warrior.primaryFollowersCount }
                                    : null,
                                ...(warrior.otherPlatforms || []),
                            ].filter((platform): platform is WarriorOtherPlatform => Boolean(platform));

                            return (
                            <Card
                                key={warrior.id}
                                onClick={() => navigate(`/${locale}/social-warrior-profile/${warrior.id}`)}
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
                                {/* LEFT SECTION: Image (Fixed 140px width on desktop) */}
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
                                    {warrior.photo ? (
                                        <Box
                                            component="img"
                                            src={warrior.photo}
                                            alt={warrior.name}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain', // Requirement: contain
                                                maxHeight: { xs: 200, sm: '100%' },
                                            }}
                                        />
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">
                                            {t('noPhoto')}
                                        </Typography>
                                    )}
                                </Box>

                                {/* CENTER & RIGHT SECTIONS: Content */}
                                <CardContent sx={{ flex: 1, p: 3, '&:last-child': { pb: 3 } }}>
                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                                        {/* CENTER: Main Content */}
                                        <Box sx={{ flex: 1 }}>
                                            {/* Name & Location */}
                                            <Box sx={{ mb: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5, color: '#1a1a1a' }}>
                                                    {warrior.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                    {warrior.district}{warrior.mandal ? `, ${warrior.mandal}` : ''}
                                                </Typography>
                                            </Box>

                                            {/* Description / Contribution Summary */}
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2,
                                                    lineHeight: 1.6,
                                                    display: { xs: 'none', sm: '-webkit-box' },
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {warrior.reason}
                                            </Typography>

                                            {/* Contribution Areas - Horizontal List (not chips) */}
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {warrior.digitalContributions.slice(0, 3).join(' • ')}
                                                    {warrior.digitalContributions.length > 3 && ` • +${warrior.digitalContributions.length - 3} ${t('more')}`}
                                                </Typography>
                                            </Box>

                                            {platformBadges.length > 0 && (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                                                    {platformBadges.map((platform, index) => {
                                                        const color = getPlatformColor(platform.platform);
                                                        const formattedCount = formatFollowersCount(platform.followersCount);
                                                        return (
                                                            <Box
                                                                key={`${warrior.id}-${platform.platform}-${index}`}
                                                                sx={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: 0.6,
                                                                    px: 1.5,
                                                                    py: 0.6,
                                                                    borderRadius: 100,
                                                                    background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`,
                                                                    boxShadow: `0 2px 8px ${color}55`,
                                                                    cursor: 'default',
                                                                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                                                    '&:hover': {
                                                                        transform: 'translateY(-2px)',
                                                                        boxShadow: `0 5px 16px ${color}88`,
                                                                    },
                                                                }}
                                                            >
                                                                <Box sx={{ color: '#fff', display: 'flex', alignItems: 'center', lineHeight: 0 }}>
                                                                    <PlatformIcon platform={platform.platform} size={13} colored={false} />
                                                                </Box>
                                                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                                                    {getPlatformName(platform.platform)}
                                                                </Typography>
                                                                {formattedCount && (
                                                                    <>
                                                                        <Box sx={{ width: '1px', height: 10, bgcolor: 'rgba(255,255,255,0.5)', mx: 0.25, flexShrink: 0 }} />
                                                                        <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '0.02em' }}>
                                                                            {formattedCount}
                                                                        </Typography>
                                                                    </>
                                                                )}
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                        </Box>

                                        {/* RIGHT: Actions */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: { xs: 'row', md: 'column' },
                                                alignItems: { xs: 'center', md: 'flex-end' },
                                                justifyContent: { xs: 'flex-end', md: 'center' },
                                                gap: 1,
                                                minWidth: { md: 100 }
                                            }}
                                        >
                                            {/* Admin Edit Button */}
                                            {isAdmin && (
                                                <IconButton
                                                    color="primary"
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/${locale}/submit-social-warrior?id=${warrior.id}`);
                                                    }}
                                                    aria-label="Edit Warrior"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            )}

                                            {/* View Profile Icon */}
                                            <IconButton
                                                color="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/${locale}/social-warrior-profile/${warrior.id}`);
                                                }}
                                                aria-label="View Profile"
                                                sx={{
                                                    '&:hover': { backgroundColor: 'primary.50' }
                                                }}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                            );
                        })}
                    </Box>
                )}
            </Container>
        </Box>
    );
}
