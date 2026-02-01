'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_GOVERNANCE_HIGHLIGHT } from '@/graphql/queries/governance-highlights';
import { Box, Container, Typography, Chip, Link as MuiLink, Button, Grid, Paper, Divider, CircularProgress, Alert, Stack, Tooltip } from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import LinkIcon from '@mui/icons-material/Link';
import VerifiedIcon from '@mui/icons-material/Verified';
import ImageLightbox from '@/components/ui/image-lightbox';

import { motion } from 'framer-motion';

// Redefining enums locally since they aren't in a shared package yet
// Ideally, these should be moved to a shared types file
enum HighlightCategory {
    INNOVATIVE_INITIATIVE = 'INNOVATIVE_INITIATIVE',
    PENDING_ISSUE_ADDRESSED = 'PENDING_ISSUE_ADDRESSED',
}

enum HighlightStatus {
    ADDRESSED = 'ADDRESSED',
    IN_PROGRESS = 'IN_PROGRESS',
    FOLLOW_UP_ONGOING = 'FOLLOW_UP_ONGOING',
}

enum SourceType {
    GOVERNMENT_PORTAL = 'GOVERNMENT_PORTAL',
    PRESS_RELEASE = 'PRESS_RELEASE',
    PUBLIC_RECORD = 'PUBLIC_RECORD',
    NEWS_REPORT = 'NEWS_REPORT',
    FIELD_VERIFICATION = 'FIELD_VERIFICATION',
}

export default function GovernanceHighlightDetailPage({ params }: { params: { id: string } }) {
    const { data, loading, error } = useQuery(GET_GOVERNANCE_HIGHLIGHT, {
        variables: { id: params.id },
    });
    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const getStatusLabel = (status: HighlightStatus) => {
        switch (status) {
            case HighlightStatus.ADDRESSED: return 'Completed';
            case HighlightStatus.IN_PROGRESS: return 'In Progress';
            case HighlightStatus.FOLLOW_UP_ONGOING: return 'Monitoring';
            default: return status;
        }
    };

    const getStatusColor = (status: HighlightStatus) => {
        switch (status) {
            case HighlightStatus.ADDRESSED: return '#2e7d32'; // Green
            case HighlightStatus.IN_PROGRESS: return '#ed6c02'; // Orange
            case HighlightStatus.FOLLOW_UP_ONGOING: return '#0288d1'; // Blue
            default: return '#757575';
        }
    };

    const getSourceTypeLabel = (sourceType: SourceType) => {
        switch (sourceType) {
            case SourceType.GOVERNMENT_PORTAL: return 'Government Portal';
            case SourceType.PRESS_RELEASE: return 'Official Press Release';
            case SourceType.PUBLIC_RECORD: return 'Public Record';
            case SourceType.NEWS_REPORT: return 'News Report';
            case SourceType.FIELD_VERIFICATION: return 'Field Documentation';
            default: return sourceType;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 12, minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !data?.governanceHighlight) {
        return (
            <Container maxWidth={false} sx={{ py: 8, px: { xs: 2, sm: 3 } }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Record not found or access denied.
                </Alert>
                <Button component={Link} href="/governance-highlights" startIcon={<ArrowBackIcon />}>
                    Return to Highlights
                </Button>
            </Container>
        );
    }

    const highlight = data.governanceHighlight;

    // Combine main image and gallery for lightbox
    const allImages = [highlight.image, ...(highlight.gallery || [])].filter(Boolean);

    const handleImageClick = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    return (
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: { xs: 2, md: 5 } }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
                {/* Back Navigation */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    component={Link}
                    href="/governance-highlights"
                    sx={{ mb: 3, color: 'text.secondary', '&:hover': { background: 'transparent', color: 'text.primary' } }}
                >
                    Back to Governance Highlights
                </Button>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', position: 'relative' }}>

                    {/* 1. Header / Identity Section - Grid Layout */}
                    <Grid container spacing={4} alignItems="flex-start">

                        {/* LEFT COLUMN: Photo */}
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
                                    mb: 2
                                }}
                            >
                                {highlight.image ? (
                                    <Box
                                        component="img"
                                        onClick={() => handleImageClick(0)}
                                        src={highlight.image}
                                        alt={highlight.title}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                            cursor: 'pointer',
                                            '&:hover': { opacity: 0.95 }
                                        }}
                                    />
                                ) : (
                                    <Typography variant="caption" color="text.secondary">No Photo</Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* RIGHT COLUMN: Title & Key Info */}
                        <Grid item xs={12} md={8} lg={9}>
                            <Box>
                                {/* Status Chip */}
                                <Chip
                                    label={getStatusLabel(highlight.status)}
                                    sx={{
                                        bgcolor: highlight.status === HighlightStatus.ADDRESSED ? '#e8f5e9' :
                                            highlight.status === HighlightStatus.IN_PROGRESS ? '#fff3e0' : '#e1f5fe',
                                        color: getStatusColor(highlight.status),
                                        fontWeight: 700,
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        mb: 2
                                    }}
                                />

                                <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                                    {highlight.title}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    {highlight.district}, {highlight.state} • {highlight.yearCompleted}
                                </Typography>

                                {/* Key Metadata with Icons */}
                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                                        <BusinessIcon fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                                Area:
                                            </Typography>
                                            {highlight.area}
                                        </Typography>
                                    </Box>
                                    {highlight.department && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                                            <BusinessIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                                    Department:
                                                </Typography>
                                                {highlight.department}
                                            </Typography>
                                        </Box>
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                                        <CalendarTodayIcon fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                                Year Completed:
                                            </Typography>
                                            {highlight.yearCompleted}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                                        <VerifiedIcon fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                                Status:
                                            </Typography>
                                            {getStatusLabel(highlight.status)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 5 }} />

                    {/* 2. Project Details Grid */}
                    <Grid container spacing={6}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 2 }}>
                                Project Details
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Category
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {highlight.category === HighlightCategory.INNOVATIVE_INITIATIVE ? 'Innovative Initiative' : 'Long-Pending Issue Addressed'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Focus Area
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {highlight.area}
                                    </Typography>
                                </Box>
                                {highlight.issueContext && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Context
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                                            {highlight.issueContext}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 2 }}>
                                Source Information
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Source Type
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {getSourceTypeLabel(highlight.sourceType)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Verification Link
                                    </Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<LinkIcon />}
                                            href={highlight.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View Source
                                        </Button>
                                    </Box>
                                </Box>
                            </Stack>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 5 }} />

                    {/* 3. Main Content */}
                    <Box sx={{ maxWidth: '80ch' }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                            Description
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
                            {highlight.description}
                        </Typography>
                    </Box>

                    {/* 4. Gallery Section */}
                    {highlight.gallery && highlight.gallery.length > 0 && (
                        <Box sx={{ mt: 6 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 2 }}>
                                Gallery ({highlight.gallery.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {highlight.gallery.map((img: string, idx: number) => (
                                    <Box
                                        key={idx}
                                        onClick={() => handleImageClick(highlight.image ? idx + 1 : idx)}
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            '&:hover': { opacity: 0.9 }
                                        }}
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
                </Paper>

                {/* Metadata Footer */}
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        Document added on {new Date(highlight.createdAt).toLocaleDateString()} • Last updated on {new Date(highlight.updatedAt || highlight.createdAt).toLocaleDateString()}
                    </Typography>
                </Box>
                {/* Image Lightbox */}
                <ImageLightbox
                    images={allImages}
                    open={lightboxOpen}
                    initialIndex={currentImageIndex}
                    onClose={() => setLightboxOpen(false)}
                />
            </Container>
        </Box>
    );
}
