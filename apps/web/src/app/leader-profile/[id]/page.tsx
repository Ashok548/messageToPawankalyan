'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Box, Container, Typography, Button, Chip, Alert, CircularProgress, Paper, IconButton, Dialog, Zoom, Grid, Fade, Slide } from '@mui/material';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import PlatformIcon from '@/components/PlatformIcon';
import { SocialPlatform, getPlatformName } from '@/utils/socialMediaValidation';

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

interface Leader {
    id: string;
    name: string;
    district: string;
    mandal?: string;
    reason: string;
    serviceAreas: string[];
    values: string[];
    photo?: string;
    gallery?: string[];
    partyYears?: number;
    partyPosition?: string;
    nominatedPost?: string;
    primaryPlatform?: string;
    primaryProfileUrl?: string;
    otherPlatforms?: Array<{
        platform: string;
        profileUrl: string;
    }>;
    submittedBy: string;
    createdAt: string;
    status: 'PENDING' | 'APPROVED' | 'HIDDEN' | 'ARCHIVED';
}

export default function LeaderProfilePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { data, loading, error } = useQuery(GET_LEADER, {
        variables: { id: params.id },
    });

    const [updateLeaderStatus, { loading: updating }] = useMutation(UPDATE_LEADER_STATUS, {
        refetchQueries: [{ query: GET_LEADER, variables: { id: params.id } }],
    });

    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                // roles is usually an array or string depending on implementation, 
                // but based on previous code it seems to be payload.role
                setIsSuperAdmin(payload.role === 'SUPER_ADMIN');
            } catch (e) {
                console.error('Error decoding token:', e);
            }
        }
    }, []);

    const handleApprove = async () => {
        if (confirm('Are you sure you want to approve this leader profile?')) {
            try {
                await updateLeaderStatus({
                    variables: {
                        id: params.id,
                        status: 'APPROVED'
                    }
                });
            } catch (err) {
                console.error('Error approving leader:', err);
                alert('Failed to approve leader');
            }
        }
    };

    const handleOpenLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const handleCloseLightbox = () => {
        setLightboxOpen(false);
    };

    const handleNextImage = () => {
        if (leader?.gallery) {
            setSlideDirection('left');
            setCurrentImageIndex((prev) => (prev + 1) % leader.gallery!.length);
        }
    };

    const handlePrevImage = () => {
        if (leader?.gallery) {
            setSlideDirection('right');
            setCurrentImageIndex((prev) => (prev - 1 + leader.gallery!.length) % leader.gallery!.length);
        }
    };

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
                <Alert severity="error">Failed to load leader profile: {error.message}</Alert>
            </Container>
        );
    }

    const leader: Leader = data?.leader;

    if (!leader) {
        return (
            <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
                <Alert severity="warning">Leader profile not found</Alert>
            </Container>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getSubmittedByLabel = (submittedBy: string) => {
        switch (submittedBy) {
            case 'SELF':
                return 'Self';
            case 'SUPPORTER':
                return 'Supporter';
            case 'ANONYMOUS':
                return 'Anonymous';
            default:
                return submittedBy;
        }
    };

    return (
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#fafafa', position: 'relative' }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.back()}
                sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 10,
                }}
            >
                Back
            </Button>

            <Container maxWidth={false} sx={{ py: 8, px: { xs: 2, sm: 3 } }}>


                <Paper sx={{ overflow: 'hidden', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    {/* Photo */}
                    {leader.photo && (
                        <Box sx={{ position: 'relative', width: '100%', height: 400, backgroundColor: '#f5f5f5' }}>
                            <Image
                                src={leader.photo}
                                alt={leader.name}
                                fill
                                style={{ objectFit: 'contain' }}
                                unoptimized
                            />
                        </Box>
                    )}

                    {/* Content */}
                    <Box sx={{ p: { xs: 3, sm: 4 } }}>
                        {/* Name and Location */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                {leader.name}
                            </Typography>
                            {isSuperAdmin && leader.status !== 'APPROVED' && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircleIcon />}
                                    onClick={handleApprove}
                                    disabled={updating}
                                    size="small"
                                >
                                    {updating ? 'Approving...' : 'Approve'}
                                </Button>
                            )}
                        </Box>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                            {leader.district}{leader.mandal ? `, ${leader.mandal}` : ''}
                        </Typography>

                        {/* Service Areas */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                Area of Service
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {leader.serviceAreas.map((area, idx) => (
                                    <Chip
                                        key={idx}
                                        label={area}
                                        sx={{
                                            backgroundColor: '#e3f2fd',
                                            fontWeight: 500,
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* Values */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                Values Represented
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {leader.values.map((value, idx) => (
                                    <Chip
                                        key={idx}
                                        label={value}
                                        sx={{
                                            backgroundColor: '#f3e5f5',
                                            fontWeight: 500,
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* Reason */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                Why Society Needs This Leader
                            </Typography>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                                {leader.reason}
                            </Typography>
                        </Box>

                        {/* Party Association Details */}
                        {(leader.partyYears || leader.partyPosition || leader.nominatedPost) && (
                            <Box sx={{ mb: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
                                    Association Details
                                </Typography>
                                <Grid container spacing={2}>
                                    {leader.partyYears && (
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                Years of Association
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {leader.partyYears} Years
                                            </Typography>
                                        </Grid>
                                    )}
                                    {leader.partyPosition && (
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                Party Position
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {leader.partyPosition}
                                            </Typography>
                                        </Grid>
                                    )}
                                    {leader.nominatedPost && (
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                Nominated Post
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {leader.nominatedPost}
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        )}

                        {/* Social Media Presence */}
                        {leader.primaryPlatform && leader.primaryProfileUrl && (
                            <Box sx={{ mb: 4, p: 3, bgcolor: '#f9f9f9', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                    Social Media Presence
                                </Typography>

                                {/* Primary Platform */}
                                <Box sx={{ mb: leader.otherPlatforms && leader.otherPlatforms.length > 0 ? 3 : 0 }}>
                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1.5 }}>
                                        Primary Platform
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            p: 2,
                                            bgcolor: 'primary.light',
                                            borderRadius: 1,
                                            border: '2px solid',
                                            borderColor: 'primary.main',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 48,
                                                height: 48,
                                                borderRadius: 1,
                                                backgroundColor: 'background.paper',
                                            }}
                                        >
                                            <PlatformIcon platform={leader.primaryPlatform as SocialPlatform} size={32} />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body1" fontWeight={600}>
                                                {getPlatformName(leader.primaryPlatform as SocialPlatform)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Main social media presence
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            href={leader.primaryProfileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{ flexShrink: 0 }}
                                        >
                                            Visit Profile →
                                        </Button>
                                    </Box>
                                </Box>

                                {/* Other Platforms */}
                                {leader.otherPlatforms && leader.otherPlatforms.length > 0 && (
                                    <Box>
                                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1.5 }}>
                                            Other Platforms
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {leader.otherPlatforms.map((platform, index) => (
                                                <Grid item xs={12} sm={6} key={index}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1.5,
                                                            p: 1.5,
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 1,
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: 36,
                                                                height: 36,
                                                            }}
                                                        >
                                                            <PlatformIcon platform={platform.platform as SocialPlatform} size={24} />
                                                        </Box>
                                                        <Typography variant="body2" sx={{ flex: 1 }}>
                                                            {getPlatformName(platform.platform as SocialPlatform)}
                                                        </Typography>
                                                        <Button
                                                            variant="text"
                                                            size="small"
                                                            href={platform.profileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            sx={{ fontSize: '0.75rem' }}
                                                        >
                                                            Visit →
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}
                            </Box>
                        )}


                        {/* Gallery Section */}
                        {leader.gallery && leader.gallery.length > 0 && (
                            <Box sx={{ mb: 4, mt: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                    Gallery
                                </Typography>
                                <Grid container spacing={2}>
                                    {leader.gallery.map((img, index) => (
                                        <Grid item xs={6} sm={4} md={3} key={index}>
                                            <Paper
                                                elevation={1}
                                                sx={{
                                                    p: 0.5,
                                                    backgroundColor: '#f8f9fa',
                                                    border: '1px solid #c8ccd1',
                                                    borderRadius: 1,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease-in-out',
                                                    position: 'relative',
                                                    '&:hover': {
                                                        transform: 'scale(1.02)',
                                                        boxShadow: 3,
                                                    },
                                                }}
                                                onClick={() => handleOpenLightbox(index)}
                                            >
                                                <div style={{ position: 'relative', width: '100%', height: '150px', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <Image
                                                        src={img}
                                                        alt={`Gallery image ${index + 1}`}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        unoptimized
                                                    />
                                                </div>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Metadata */}
                        <Box sx={{ pt: 3, borderTop: '1px solid #e0e0e0' }}>
                            <Typography variant="body2" color="text.secondary">
                                Submitted: {formatDate(leader.createdAt)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Submitted by: {getSubmittedByLabel(leader.submittedBy)}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Disclaimer */}
                <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                        This profile is based on contributor submissions and does not constitute official endorsement. Content is moderated for community guidelines.
                    </Typography>
                </Alert>

                {/* Lightbox Dialog using standard MUI Dialog */}
                <Dialog
                    open={lightboxOpen}
                    onClose={handleCloseLightbox}
                    maxWidth={false}
                    TransitionComponent={Zoom}
                    transitionDuration={300}
                    PaperProps={{
                        style: {
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                            width: '100%',
                            height: '100%',
                            margin: 0,
                            maxHeight: '100%',
                            borderRadius: 0,
                            overflow: 'hidden'
                        }
                    }}
                    slotProps={{
                        backdrop: {
                            style: {
                                backgroundColor: 'rgba(0, 0, 0, 0.85)', // Semi-transparent dark background
                            }
                        }
                    }}
                >
                    <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                        {/* Close Button */}
                        <IconButton
                            onClick={handleCloseLightbox}
                            sx={{ position: 'absolute', top: 16, right: 16, color: 'white', zIndex: 10 }}
                        >
                            <CloseIcon />
                        </IconButton>

                        {/* Navigation Buttons */}
                        {leader.gallery && leader.gallery.length > 1 && (
                            <>
                                <IconButton
                                    onClick={handlePrevImage}
                                    sx={{ position: 'absolute', left: 16, color: 'white', zIndex: 10 }}
                                >
                                    <NavigateBeforeIcon fontSize="large" />
                                </IconButton>
                                <IconButton
                                    onClick={handleNextImage}
                                    sx={{ position: 'absolute', right: 16, color: 'white', zIndex: 10 }}
                                >
                                    <NavigateNextIcon fontSize="large" />
                                </IconButton>
                            </>
                        )}

                        {/* Main Lightbox Image */}
                        {leader.gallery && leader.gallery.length > 0 && (
                            <div style={{ position: 'relative', width: '100%', height: '90%', maxWidth: '1200px', overflow: 'hidden' }}>
                                {/* Custom Animation Styles */}
                                <style jsx global>{`
                                    @keyframes slideFromRight {
                                        0% { transform: translateX(100%); opacity: 0; }
                                        100% { transform: translateX(0); opacity: 1; }
                                    }
                                    @keyframes slideFromLeft {
                                        0% { transform: translateX(-100%); opacity: 0; }
                                        100% { transform: translateX(0); opacity: 1; }
                                    }
                                    .animate-slide-next {
                                        animation: slideFromRight 0.5s cubic-bezier(0.05, 0.9, 0.2, 1) forwards;
                                    }
                                    .animate-slide-prev {
                                        animation: slideFromLeft 0.5s cubic-bezier(0.05, 0.9, 0.2, 1) forwards;
                                    }
                                `}</style>

                                <div
                                    key={currentImageIndex}
                                    className={slideDirection === 'left' ? 'animate-slide-next' : 'animate-slide-prev'}
                                    style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                                >
                                    <Image
                                        src={leader.gallery[currentImageIndex]}
                                        alt={`Gallery Image ${currentImageIndex + 1}`}
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        unoptimized
                                    />
                                </div>
                                {leader.gallery.length > 1 && (
                                    <Typography sx={{ position: 'absolute', bottom: -30, width: '100%', textAlign: 'center', color: 'white' }}>
                                        {currentImageIndex + 1} / {leader.gallery.length}
                                    </Typography>
                                )}
                            </div>
                        )}
                    </Box>
                </Dialog>
            </Container>
        </Box>
    );
}
