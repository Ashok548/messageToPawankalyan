'use client';

import { useQuery } from '@apollo/client';
import { GET_GOVERNANCE_HIGHLIGHT } from '@/graphql/queries/governance-highlights';
import { Box, Container, Typography, Chip, Link as MuiLink, Button, Grid, Paper, Divider, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import LinkIcon from '@mui/icons-material/Link';
import VerifiedIcon from '@mui/icons-material/Verified';
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
            <Container maxWidth="md" sx={{ py: 8 }}>
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

    return (
        <Box component="main" sx={{ backgroundColor: '#fafafa', minHeight: '100vh', py: 6 }}>
            <Container maxWidth="md">
                {/* Navigation */}
                <Box sx={{ mb: 4 }}>
                    <Button
                        component={Link}
                        href="/governance-highlights"
                        startIcon={<ArrowBackIcon />}
                        sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                    >
                        Back to Governance Docket
                    </Button>
                </Box>

                {/* Main Digital Docket Paper */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 6 },
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Status Strip */}
                        <Box sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 6,
                            bgcolor: getStatusColor(highlight.status)
                        }} />

                        {/* Cover Image */}
                        {highlight.image && (
                            <Box sx={{
                                width: '100%',
                                height: 300,
                                mb: 4,
                                borderRadius: 2,
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={highlight.image}
                                    alt={highlight.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </Box>
                        )}

                        {/* Header Section */}
                        <Box sx={{ mb: 4, pl: { md: 2 } }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                                <Chip
                                    label={getStatusLabel(highlight.status)}
                                    sx={{
                                        bgcolor: highlight.status === HighlightStatus.ADDRESSED ? '#e8f5e9' :
                                            highlight.status === HighlightStatus.IN_PROGRESS ? '#fff3e0' : '#e1f5fe',
                                        color: getStatusColor(highlight.status),
                                        fontWeight: 700,
                                        borderRadius: 1,
                                        height: 24,
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase'
                                    }}
                                />
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    RECORD ID: {highlight.id.substring(0, 8).toUpperCase()}
                                </Typography>
                            </Box>

                            <Typography variant="h4" component="h1" sx={{
                                fontFamily: '"Merriweather", "Roboto Slab", serif',
                                fontWeight: 700,
                                color: '#1a1a1a',
                                mb: 2,
                                lineHeight: 1.3
                            }}>
                                {highlight.title}
                            </Typography>

                            {/* Meta Data Grid */}
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                        <CalendarTodayIcon sx={{ fontSize: 18 }} />
                                        <Typography variant="body2" fontWeight={500}>
                                            Completed: {highlight.yearCompleted}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                        <LocationOnIcon sx={{ fontSize: 18 }} />
                                        <Typography variant="body2" fontWeight={500}>
                                            {highlight.district}, {highlight.state}
                                        </Typography>
                                    </Box>
                                </Grid>
                                {highlight.department && (
                                    <Grid item xs={12} sm={4}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                            <BusinessIcon sx={{ fontSize: 18 }} />
                                            <Typography variant="body2" fontWeight={500}>
                                                {highlight.department}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>

                        <Divider sx={{ mb: 4, ml: { md: 2 } }} />

                        {/* Content Section */}
                        <Box sx={{ pl: { md: 2 } }}>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="overline" display="block" color="text.secondary" gutterBottom>
                                    {highlight.category === HighlightCategory.INNOVATIVE_INITIATIVE
                                        ? "Description of Initiative"
                                        : "Description of long pending issue"}
                                </Typography>
                                <Typography variant="body1" sx={{
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: 1.7,
                                    color: '#2c3e50',
                                    fontSize: '1.05rem'
                                }}>
                                    {highlight.description}
                                </Typography>
                            </Box>

                            {/* Area & Context */}
                            <Grid container spacing={4} sx={{ mb: 4 }}>
                                <Grid item xs={12}>
                                    <Typography variant="overline" display="block" color="text.secondary" gutterBottom>
                                        Focus Area
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {highlight.area}
                                    </Typography>
                                </Grid>
                                {highlight.issueContext && (
                                    <Grid item xs={12}>
                                        <Typography variant="overline" display="block" color="text.secondary" gutterBottom>
                                            Context & Background
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
                                            {highlight.issueContext}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>

                            {/* Source Verification */}
                            <Box sx={{
                                bgcolor: '#f8f9fa',
                                p: 3,
                                borderRadius: 2,
                                border: '1px dashed',
                                borderColor: 'divider'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <VerifiedIcon color="primary" sx={{ fontSize: 20 }} />
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        Verification Source
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    This record is verified via <strong>{getSourceTypeLabel(highlight.sourceType)}</strong>.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<LinkIcon />}
                                    href={highlight.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View Original Source
                                </Button>
                            </Box>
                        </Box>

                        {/* Gallery Section */}
                        {highlight.gallery && highlight.gallery.length > 0 && (
                            <>
                                <Divider sx={{ my: 4, ml: { md: 2 } }} />
                                <Box sx={{ pl: { md: 2 } }}>
                                    <Typography variant="overline" display="block" color="text.secondary" gutterBottom>
                                        Gallery
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {highlight.gallery.map((imageUrl, index) => (
                                            <Grid item xs={6} sm={4} key={index}>
                                                <Box sx={{
                                                    width: '100%',
                                                    paddingTop: '100%',
                                                    position: 'relative',
                                                    borderRadius: 1,
                                                    overflow: 'hidden',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        opacity: 0.9
                                                    }
                                                }}>
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Gallery ${index + 1}`}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </>
                        )}
                    </Paper>

                    {/* Metadata Footer */}
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            Document added on {new Date(highlight.createdAt).toLocaleDateString()} • Last updated on {new Date(highlight.updatedAt || highlight.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                </motion.div>
            </Container>
        </Box>
    );
}
