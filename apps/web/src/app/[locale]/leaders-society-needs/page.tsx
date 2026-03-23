'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Box, Container, Typography, Button, Alert, CircularProgress, Card, CardContent, Chip, IconButton } from '@mui/material';
import { useNavigate } from '@/hooks/use-navigate';
import { useTranslations, useLocale } from 'next-intl';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlatformIcon from '@/components/PlatformIcon';
import { SocialPlatform } from '@/utils/socialMediaValidation';
import { useAuth } from '@/hooks/use-auth';

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
            status
            createdAt
        }
    }
`;

const GET_ALL_LEADERS_ADMIN = gql`
    query GetAllLeadersAdmin {
        allLeaders {
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
            status
            createdAt
        }
    }
`;

const UPDATE_LEADER_STATUS = gql`
    mutation UpdateLeaderStatus($id: String!, $status: LeaderStatus!) {
        updateLeaderStatus(id: $id, status: $status) {
            id
            status
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
    status: string;
    createdAt: string;
}

export default function LeadersSocietyNeedsPage() {
    const t = useTranslations('leaders');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const { navigate } = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    const { data: publicData, loading: publicLoading, error: publicError } = useQuery(GET_LEADERS, {
        skip: authLoading || isAdmin,
    });
    const { data: adminData, loading: adminLoading, error: adminError } = useQuery(GET_ALL_LEADERS_ADMIN, {
        skip: authLoading || !isAdmin,
        fetchPolicy: 'cache-and-network',
    });
    const [updateLeaderStatus, { loading: approving }] = useMutation(UPDATE_LEADER_STATUS, {
        refetchQueries: [{ query: GET_ALL_LEADERS_ADMIN }],
    });

    const loading = authLoading || publicLoading || adminLoading;
    const error = publicError || adminError;

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

    const leaders: Leader[] = (isAdmin ? adminData?.allLeaders : publicData?.leaders) || [];

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

                    {/* Admin Create Button */}
                    {isAdmin && (
                        <Button
                            variant="contained"
                            onClick={() => navigate(`/${locale}/submit-leader`)}
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
                                onClick={() => navigate(`/${locale}/leader-profile/${leader.id}`)}
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
                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>

                                        {/* CENTER: Main Content */}
                                        <Box sx={{ flex: 1 }}>
                                            {/* Name & Location */}
                                            <Box sx={{ mb: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5, color: '#1a1a1a' }}>
                                                    {leader.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                    {leader.district}{leader.mandal ? `, ${leader.mandal}` : ''}
                                                </Typography>
                                            </Box>

                                            {/* Description — hidden on mobile */}
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
                                                {leader.reason}
                                            </Typography>

                                            {/* Service Areas — dot-separated */}
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
                                                    {leader.serviceAreas.slice(0, 3).join(' • ')}
                                                    {leader.serviceAreas.length > 3 && ` • +${leader.serviceAreas.length - 3} ${tCommon('more')}`}
                                                </Typography>
                                            </Box>
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
                                            {isAdmin && (
                                                <>
                                                    <Chip
                                                        label={leader.status}
                                                        size="small"
                                                        color={
                                                            leader.status === 'APPROVED' ? 'success' :
                                                            leader.status === 'PENDING' ? 'warning' : 'default'
                                                        }
                                                        sx={{ display: { xs: 'none', md: 'flex' } }}
                                                    />
                                                    {leader.status === 'PENDING' && (
                                                        <IconButton
                                                            color="success"
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateLeaderStatus({ variables: { id: leader.id, status: 'APPROVED' } });
                                                            }}
                                                            disabled={approving}
                                                            aria-label="Approve Leader"
                                                        >
                                                            <CheckCircleIcon />
                                                        </IconButton>
                                                    )}
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/${locale}/submit-leader?id=${leader.id}`);
                                                        }}
                                                        aria-label="Edit Leader"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </>
                                            )}

                                            {/* View Profile */}
                                            <IconButton
                                                color="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/${locale}/leader-profile/${leader.id}`);
                                                }}
                                                aria-label="View Profile"
                                                sx={{ '&:hover': { backgroundColor: 'primary.50' } }}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </Container>
        </Box>
    );
}
