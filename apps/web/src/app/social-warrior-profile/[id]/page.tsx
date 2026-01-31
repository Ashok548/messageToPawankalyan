'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
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
    Tooltip
} from '@mui/material';
import { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedIcon from '@mui/icons-material/Verified';
import BadgeIcon from '@mui/icons-material/Badge';
import HandshakeIcon from '@mui/icons-material/Handshake';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlatformIcon from '@/components/PlatformIcon';
import { SocialPlatform } from '@/utils/socialMediaValidation';

const GET_WARRIOR = gql`
    query GetSocialMediaWarrior($id: String!) {
        socialMediaWarrior(id: $id) {
            id
            name
            district
            mandal
            reason
            digitalContributions
            engagementStyle
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
            status
            createdAt
            updatedAt
        }
    }
`;

const UPDATE_WARRIOR_STATUS = gql`
    mutation UpdateWarriorStatus($id: String!, $status: WarriorStatus!, $adminNotes: String) {
        updateSocialMediaWarriorStatus(id: $id, status: $status, adminNotes: $adminNotes) {
            id
            status
        }
    }
`;

export default function SocialWarriorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const { data, loading, error, refetch } = useQuery(GET_WARRIOR, {
        variables: { id },
    });

    const [updateStatus, { loading: updating }] = useMutation(UPDATE_WARRIOR_STATUS);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setIsAdmin(payload.role === 'ADMIN' || payload.role === 'SUPER_ADMIN');
            } catch (e) {
                console.error('Invalid token');
            }
        }
    }, []);

    const handleStatusUpdate = async (status: string) => {
        try {
            await updateStatus({ variables: { id, status } });
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
    if (error) return <Container maxWidth="md" sx={{ py: 4 }}><Alert severity="error">Failed to load warrior profile</Alert></Container>;
    if (!data?.socialMediaWarrior) return <Container maxWidth="md" sx={{ py: 4 }}><Alert severity="warning">Warrior not found</Alert></Container>;

    const warrior = data.socialMediaWarrior;

    return (
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: { xs: 2, md: 5 } }}>
            <Container maxWidth="lg">
                {/* Back Navigation */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                    sx={{ mb: 3, color: 'text.secondary', '&:hover': { background: 'transparent', color: 'text.primary' } }}
                >
                    Back to Listing
                </Button>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', position: 'relative' }}>

                    {/* Admin Actions - Top Right */}
                    {isAdmin && (
                        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1, zIndex: 10 }}>
                            {warrior.status !== 'APPROVED' && (
                                <Tooltip title="Approve Warrior">
                                    <IconButton
                                        color="success"
                                        onClick={() => handleStatusUpdate('APPROVED')}
                                        disabled={updating}
                                        sx={{
                                            bgcolor: 'success.50',
                                            '&:hover': { bgcolor: 'success.100' }
                                        }}
                                    >
                                        <CheckCircleIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Tooltip title="Hide Profile">
                                <IconButton
                                    color="error"
                                    onClick={() => handleStatusUpdate('HIDDEN')}
                                    disabled={updating || warrior.status === 'HIDDEN'}
                                    sx={{
                                        bgcolor: 'error.50',
                                        '&:hover': { bgcolor: 'error.100' }
                                    }}
                                >
                                    <VisibilityOffIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Data">
                                <IconButton
                                    color="primary"
                                    onClick={() => router.push(`/submit-social-warrior?id=${id}`)}
                                    sx={{
                                        bgcolor: 'primary.50',
                                        '&:hover': { bgcolor: 'primary.100' }
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}

                    {/* 1. Header / Identity Section - Left Column Fixed + Right Fluid */}
                    <Grid container spacing={4} alignItems="flex-start"> {/* FIXED: alignItems flex-start prevents stretching */}

                        {/* LEFT COLUMN: Photo & Meta */}
                        <Grid item xs={12} md={4} lg={3}>
                            <Box
                                sx={{
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
                                    mb: 2 // Margin bottom for spacing
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
                                            objectFit: 'contain',
                                        }}
                                    />
                                ) : (
                                    <Typography variant="caption" color="text.secondary">No Photo</Typography>
                                )}
                            </Box>


                        </Grid>

                        {/* RIGHT COLUMN: Identity & Party Details */}
                        <Grid item xs={12} md={8} lg={9}>
                            <Box>
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                                    {warrior.name}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {warrior.district} {warrior.mandal && `• ${warrior.mandal}`}
                                </Typography>

                                {/* 2. Party Association Details */}
                                <Stack spacing={1} sx={{ mt: 3 }}>
                                    {warrior.partyYears && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                                            <HandshakeIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                                    Serving since:
                                                </Typography>
                                                <strong>{warrior.partyYears} years</strong>
                                            </Typography>
                                        </Box>
                                    )}
                                    {warrior.partyPosition && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                                            <BadgeIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                                    Position:
                                                </Typography>
                                                {warrior.partyPosition}
                                            </Typography>
                                        </Box>
                                    )}
                                    {warrior.nominatedPost && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                                            <VerifiedIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                                    Nominated Post:
                                                </Typography>
                                                {warrior.nominatedPost}
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>



                    <Divider sx={{ my: 5 }} />

                    {/* 4. Digital Contribution Metadata */}
                    <Grid container spacing={6}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 2 }}>
                                Contribution Areas
                            </Typography>
                            <Box component="ul" sx={{ m: 0, pl: 2, color: 'text.primary' }}>
                                {warrior.digitalContributions.map((area: string, idx: number) => (
                                    <Typography component="li" key={idx} variant="body2" sx={{ mb: 0.5 }}>
                                        {area}
                                    </Typography>
                                ))}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 2 }}>
                                Engagement Style
                            </Typography>
                            <Box component="ul" sx={{ m: 0, pl: 2, color: 'text.primary' }}>
                                {warrior.engagementStyle.map((style: string, idx: number) => (
                                    <Typography component="li" key={idx} variant="body2" sx={{ mb: 0.5 }}>
                                        {style}
                                    </Typography>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 5 }} />

                    {/* 6. Main Content */}
                    <Box sx={{ maxWidth: '80ch' }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                            Why This Digital Warrior Matters
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.8,
                                color: 'text.primary',
                                fontSize: '1.05rem'
                            }}
                        >
                            {warrior.reason}
                        </Typography>
                    </Box>

                    {/* 7. Gallery Section */}
                    {warrior.gallery && warrior.gallery.length > 0 && (
                        <Box sx={{ mt: 6 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 2 }}>
                                Gallery ({warrior.gallery.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {warrior.gallery.map((img: string, idx: number) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            '&:hover': { opacity: 0.9 }
                                        }}
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <Box
                                            component="img"
                                            src={img}
                                            alt={`Gallery ${idx + 1}`}
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    <Divider sx={{ my: 5 }} />

                    {/* Social Media Presence (Moved) */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                            Social Media Presence
                        </Typography>
                        <Stack spacing={2}>
                            {warrior.primaryPlatform && warrior.primaryProfileUrl && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'primary.main',
                                        backgroundColor: 'primary.50',
                                        position: 'relative',
                                    }}
                                >
                                    {/* Primary Badge */}
                                    <Chip
                                        label="Primary"
                                        size="small"
                                        color="primary"
                                        sx={{
                                            position: 'absolute',
                                            top: -12,
                                            left: 12,
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                        }}
                                    />

                                    {/* Platform Icon */}
                                    <Box sx={{ flexShrink: 0 }}>
                                        <PlatformIcon platform={warrior.primaryPlatform as SocialPlatform} size={28} />
                                    </Box>

                                    {/* URL Text */}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: 'block',
                                                color: 'text.secondary',
                                                mb: 0.5,
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                            }}
                                        >
                                            {warrior.primaryPlatform}
                                        </Typography>
                                        <Typography
                                            component="a"
                                            href={warrior.primaryProfileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variant="body2"
                                            sx={{
                                                color: 'primary.main',
                                                textDecoration: 'none',
                                                wordBreak: 'break-all',
                                                '&:hover': { textDecoration: 'underline' },
                                                fontFamily: 'monospace',
                                            }}
                                        >
                                            {warrior.primaryProfileUrl}
                                        </Typography>
                                    </Box>

                                    {/* Copy Button */}
                                    <IconButton
                                        onClick={() => handleCopyUrl(warrior.primaryProfileUrl)}
                                        size="small"
                                        aria-label="Copy URL"
                                        sx={{
                                            flexShrink: 0,
                                            color: copiedUrl === warrior.primaryProfileUrl ? 'success.main' : 'text.secondary',
                                        }}
                                    >
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>

                                    {/* Copy Feedback */}
                                    {copiedUrl === warrior.primaryProfileUrl && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                position: 'absolute',
                                                right: 50,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'success.main',
                                                fontWeight: 600,
                                                backgroundColor: 'white',
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                boxShadow: 1,
                                            }}
                                        >
                                            Copied
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {/* Other Platforms */}
                            {warrior.otherPlatforms?.map((p: any, idx: number) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        backgroundColor: 'background.paper',
                                        position: 'relative',
                                        '&:hover': {
                                            borderColor: 'text.secondary',
                                            backgroundColor: 'grey.50',
                                        },
                                    }}
                                >
                                    {/* Platform Icon */}
                                    <Box sx={{ flexShrink: 0 }}>
                                        <PlatformIcon platform={p.platform as SocialPlatform} size={28} />
                                    </Box>

                                    {/* URL Text */}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: 'block',
                                                color: 'text.secondary',
                                                mb: 0.5,
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                            }}
                                        >
                                            {p.platform}
                                        </Typography>
                                        <Typography
                                            component="a"
                                            href={p.profileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variant="body2"
                                            sx={{
                                                color: 'text.primary',
                                                textDecoration: 'none',
                                                wordBreak: 'break-all',
                                                '&:hover': { textDecoration: 'underline', color: 'primary.main' },
                                                fontFamily: 'monospace',
                                            }}
                                        >
                                            {p.profileUrl}
                                        </Typography>
                                    </Box>

                                    {/* Copy Button */}
                                    <IconButton
                                        onClick={() => handleCopyUrl(p.profileUrl)}
                                        size="small"
                                        aria-label="Copy URL"
                                        sx={{
                                            flexShrink: 0,
                                            color: copiedUrl === p.profileUrl ? 'success.main' : 'text.secondary',
                                        }}
                                    >
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>

                                    {/* Copy Feedback */}
                                    {copiedUrl === p.profileUrl && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                position: 'absolute',
                                                right: 50,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'success.main',
                                                fontWeight: 600,
                                                backgroundColor: 'white',
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                boxShadow: 1,
                                            }}
                                        >
                                            Copied
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    </Box>

                    <Divider sx={{ my: 5 }} />

                    {/* Profile Status (Moved) */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Profile Status
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Chip
                                    label={warrior.status}
                                    color={warrior.status === 'APPROVED' ? 'success' : 'default'}
                                    variant="outlined"
                                    sx={{ width: '100%', justifyContent: 'flex-start', pl: 1, fontWeight: 600 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={8} sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Added:</strong> {new Date(warrior.createdAt).toLocaleDateString()}
                                </Typography>
                                {warrior.updatedAt && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Updated:</strong> {new Date(warrior.updatedAt).toLocaleDateString()}
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </Box>

                </Paper>

                {/* Lightbox Dialog */}
                <Dialog
                    open={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                    maxWidth="lg"
                    PaperProps={{
                        sx: { backgroundColor: 'transparent', boxShadow: 'none' }
                    }}
                >
                    <Box sx={{ position: 'relative' }}>
                        <IconButton
                            onClick={() => setSelectedImage(null)}
                            sx={{ position: 'absolute', top: -40, right: 0, color: 'white' }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Box
                            component="img"
                            src={selectedImage || ''}
                            sx={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 1 }}
                        />
                    </Box>
                </Dialog>

            </Container>
        </Box>
    );
}
