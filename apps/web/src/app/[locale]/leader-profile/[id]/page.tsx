'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import {
    Box,
    Container,
    Typography,
    Chip,
    Paper,
    Button,
    CircularProgress,
    Alert,
    Grid,
    Divider,
    Stack,
    Dialog,
    IconButton,
    Tooltip,
} from '@mui/material';
import { useTranslations, useLocale } from 'next-intl';
import { useNavigate } from '@/hooks/use-navigate';
import { useState, useEffect } from 'react'; // useEffect kept for other uses
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import HandshakeIcon from '@mui/icons-material/Handshake';
import BadgeIcon from '@mui/icons-material/Badge';
import VerifiedIcon from '@mui/icons-material/Verified';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '@/hooks/use-auth';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlatformIcon from '@/components/PlatformIcon';
import { SocialPlatform } from '@/utils/socialMediaValidation';

const GET_LEADER = gql`
    query GetLeader($id: String!) {
        leader(id: $id) {
            id
            name
            district
            mandal
            reason
            serviceAreas
            values
            photo
            gallery
            partyYears
            partyPosition
            nominatedPost
            primaryPlatform
            primaryProfileUrl
            otherPlatforms {
                platform
                profileUrl
            }
            submittedBy
            createdAt
            status
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

export default function LeaderProfilePage({ params }: { params: { id: string } }) {
    const t = useTranslations('leaders');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const { navigate } = useNavigate();
    const id = params.id;
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const { data, loading, error, refetch } = useQuery(GET_LEADER, {
        variables: { id },
    });

    const [updateLeaderStatus, { loading: updating }] = useMutation(UPDATE_LEADER_STATUS);

    const handleStatusUpdate = async (status: string) => {
        try {
            await updateLeaderStatus({ variables: { id, status } });
            refetch();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleCopyUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedUrl(url);
            setTimeout(() => setCopiedUrl(null), 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;
    if (error) return <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3 } }}><Alert severity="error">{tCommon('error')}: {error.message}</Alert></Container>;
    if (!data?.leader) return <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3 } }}><Alert severity="warning">{t('profileNotFound')}</Alert></Container>;

    const leader = data.leader;

    return (
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: { xs: 2, md: 5 } }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>

                {/* Back Navigation */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/${locale}/leaders-society-needs`)}
                    sx={{ mb: 3, color: 'text.secondary', '&:hover': { background: 'transparent', color: 'text.primary' } }}
                >
                    {tCommon('back')}
                </Button>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', position: 'relative' }}>

                    {/* Admin Actions — Top Right */}
                    {isAdmin && (
                        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1, zIndex: 10 }}>
                            {leader.status !== 'APPROVED' && (
                                <Tooltip title={t('profile.approveLeader')}>
                                    <IconButton
                                        color="success"
                                        onClick={() => handleStatusUpdate('APPROVED')}
                                        disabled={updating}
                                        sx={{ bgcolor: 'success.50', '&:hover': { bgcolor: 'success.100' } }}
                                    >
                                        <CheckCircleIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Tooltip title={t('profile.hideProfile')}>
                                <IconButton
                                    color="error"
                                    onClick={() => handleStatusUpdate('HIDDEN')}
                                    disabled={updating || leader.status === 'HIDDEN'}
                                    sx={{ bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}
                                >
                                    <VisibilityOffIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t('profile.editData')}>
                                <IconButton
                                    color="primary"
                                    onClick={() => navigate(`/${locale}/submit-leader?id=${id}`)}
                                    sx={{ bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.100' } }}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}

                    {/* Header: Photo + Identity */}
                    <Grid container spacing={4} alignItems="flex-start">

                        {/* LEFT: Photo */}
                        <Grid item xs={12} md={4} lg={3}>
                            <Box sx={{
                                height: { xs: 300, md: 260 },
                                width: '100%',
                                backgroundColor: '#f5f5f5',
                                borderRadius: 2,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid',
                                borderColor: 'divider',
                                mb: 2,
                            }}>
                                {leader.photo ? (
                                    <Box
                                        component="img"
                                        src={leader.photo}
                                        alt={leader.name}
                                        sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <Typography variant="caption" color="text.secondary">{t('noPhoto')}</Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* RIGHT: Name, Location, Party Details */}
                        <Grid item xs={12} md={8} lg={9}>
                            <Box>
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                                    {leader.name}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary">
                                    {leader.district}{leader.mandal && ` • ${leader.mandal}`}
                                </Typography>

                                <Stack spacing={1} sx={{ mt: 3 }}>
                                    {leader.partyYears && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <HandshakeIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                                    {t('profile.years')}:
                                                </Typography>
                                                <strong>{leader.partyYears} years</strong>
                                            </Typography>
                                        </Box>
                                    )}
                                    {leader.partyPosition && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <BadgeIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                                    {t('profile.position')}:
                                                </Typography>
                                                {leader.partyPosition}
                                            </Typography>
                                        </Box>
                                    )}
                                    {leader.nominatedPost && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <VerifiedIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                                    {t('profile.nominatedPost')}:
                                                </Typography>
                                                {leader.nominatedPost}
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 5 }} />

                    {/* Service Areas & Values */}
                    <Grid container spacing={6}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 2 }}>
                                {t('profile.areaOfService')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {leader.serviceAreas.map((area: string, idx: number) => (
                                    <Chip key={idx} label={t('serviceAreas.' + area)} sx={{ backgroundColor: '#e3f2fd', fontWeight: 500 }} />
                                ))}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 2 }}>
                                {t('profile.values')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {leader.values.map((value: string, idx: number) => (
                                    <Chip key={idx} label={t('values.' + value)} sx={{ backgroundColor: '#f3e5f5', fontWeight: 500 }} />
                                ))}
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 5 }} />

                    {/* Why Society Needs */}
                    <Box sx={{ maxWidth: '80ch' }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                            {t('profile.whySocietyNeeds')}
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'text.primary', fontSize: '1.05rem' }}>
                            {leader.reason}
                        </Typography>
                    </Box>

                    {/* Gallery */}
                    {leader.gallery && leader.gallery.length > 0 && (
                        <Box sx={{ mt: 6 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 2 }}>
                                {tCommon('gallery')} ({leader.gallery.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {leader.gallery.map((img: string, idx: number) => (
                                    <Box
                                        key={idx}
                                        sx={{ width: 120, height: 120, borderRadius: 2, overflow: 'hidden', cursor: 'pointer', '&:hover': { opacity: 0.9 } }}
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <Box component="img" src={img} alt={`Gallery ${idx + 1}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    <Divider sx={{ my: 5 }} />

                    {/* Social Media */}
                    {leader.primaryPlatform && leader.primaryProfileUrl && (
                        <Box sx={{ mb: 5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                {t('profile.socialMedia')}
                            </Typography>
                            <Stack spacing={2}>

                                {/* Primary Platform */}
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', gap: 2, p: 2,
                                    borderRadius: 2, border: '1px solid', borderColor: 'primary.main',
                                    backgroundColor: 'primary.50', position: 'relative',
                                }}>
                                    <Chip
                                        label={t('profile.primary')}
                                        size="small"
                                        color="primary"
                                        sx={{ position: 'absolute', top: -12, left: 12, fontWeight: 600, fontSize: '0.7rem' }}
                                    />
                                    <Box sx={{ flexShrink: 0 }}>
                                        <PlatformIcon platform={leader.primaryPlatform as SocialPlatform} size={28} />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {leader.primaryPlatform}
                                        </Typography>
                                        <Typography
                                            component="a"
                                            href={leader.primaryProfileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variant="body2"
                                            sx={{ color: 'primary.main', textDecoration: 'none', wordBreak: 'break-all', '&:hover': { textDecoration: 'underline' }, fontFamily: 'monospace' }}
                                        >
                                            {leader.primaryProfileUrl}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        onClick={() => handleCopyUrl(leader.primaryProfileUrl!)}
                                        size="small"
                                        aria-label="Copy URL"
                                        sx={{ flexShrink: 0, color: copiedUrl === leader.primaryProfileUrl ? 'success.main' : 'text.secondary' }}
                                    >
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                    {copiedUrl === leader.primaryProfileUrl && (
                                        <Typography variant="caption" sx={{ position: 'absolute', right: 50, top: '50%', transform: 'translateY(-50%)', color: 'success.main', fontWeight: 600, backgroundColor: 'white', px: 1, py: 0.5, borderRadius: 1, boxShadow: 1 }}>
                                            {tCommon('copied')}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Other Platforms */}
                                {leader.otherPlatforms?.map((p: { platform: string; profileUrl: string }, idx: number) => (
                                    <Box key={idx} sx={{
                                        display: 'flex', alignItems: 'center', gap: 2, p: 2,
                                        borderRadius: 2, border: '1px solid', borderColor: 'divider',
                                        backgroundColor: 'background.paper', position: 'relative',
                                        '&:hover': { borderColor: 'text.secondary', backgroundColor: 'grey.50' },
                                    }}>
                                        <Box sx={{ flexShrink: 0 }}>
                                            <PlatformIcon platform={p.platform as SocialPlatform} size={28} />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {p.platform}
                                            </Typography>
                                            <Typography
                                                component="a"
                                                href={p.profileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                variant="body2"
                                                sx={{ color: 'text.primary', textDecoration: 'none', wordBreak: 'break-all', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, fontFamily: 'monospace' }}
                                            >
                                                {p.profileUrl}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            onClick={() => handleCopyUrl(p.profileUrl)}
                                            size="small"
                                            aria-label="Copy URL"
                                            sx={{ flexShrink: 0, color: copiedUrl === p.profileUrl ? 'success.main' : 'text.secondary' }}
                                        >
                                            <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                        {copiedUrl === p.profileUrl && (
                                            <Typography variant="caption" sx={{ position: 'absolute', right: 50, top: '50%', transform: 'translateY(-50%)', color: 'success.main', fontWeight: 600, backgroundColor: 'white', px: 1, py: 0.5, borderRadius: 1, boxShadow: 1 }}>
                                                {tCommon('copied')}
                                            </Typography>
                                        )}
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {!(leader.primaryPlatform && leader.primaryProfileUrl) && <Divider sx={{ my: 5 }} />}

                    {/* Profile Status */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            {t('profile.status')}
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Chip
                                    label={leader.status}
                                    color={leader.status === 'APPROVED' ? 'success' : leader.status === 'PENDING' ? 'warning' : 'default'}
                                    variant="outlined"
                                    sx={{ width: '100%', justifyContent: 'flex-start', pl: 1, fontWeight: 600 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={8} sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>{t('profile.submitted')}: </strong>{new Date(leader.createdAt).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>{t('profile.submittedBy')}: </strong>{leader.submittedBy}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                </Paper>

                {/* Disclaimer */}
                <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">{t('disclaimer.profileText')}</Typography>
                </Alert>

                {/* Lightbox */}
                <Dialog
                    open={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                    maxWidth="lg"
                    PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none' } }}
                >
                    <Box sx={{ position: 'relative' }}>
                        <IconButton
                            onClick={() => setSelectedImage(null)}
                            sx={{ position: 'absolute', top: -40, right: 0, color: 'white' }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Box component="img" src={selectedImage || ''} sx={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 1 }} />
                    </Box>
                </Dialog>

            </Container>
        </Box>
    );
}
