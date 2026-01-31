'use client';

import { useQuery, useMutation } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import { GET_GOVERNANCE_HIGHLIGHTS, CREATE_GOVERNANCE_HIGHLIGHT_MUTATION, UPDATE_GOVERNANCE_HIGHLIGHT_MUTATION, DELETE_GOVERNANCE_HIGHLIGHT_MUTATION } from '@/graphql/queries/governance-highlights';
import { Box, Container, Typography, ToggleButtonGroup, ToggleButton, Grid, CircularProgress, Alert, Chip, Card, CardContent, CardMedia, Link as MuiLink, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Snackbar } from '@mui/material';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LinkIcon from '@mui/icons-material/Link';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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

interface GovernanceHighlight {
    id: string;
    title: string;
    category: HighlightCategory;
    description: string;
    area: string;
    department?: string;
    state: string;
    district: string;
    yearCompleted: number;
    status: HighlightStatus;
    sourceType: SourceType;
    sourceUrl: string;
    image?: string;
    createdAt: string;
}

export default function GovernanceHighlightsPage() {
    const [category, setCategory] = useState<HighlightCategory | null>(HighlightCategory.PENDING_ISSUE_ADDRESSED);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingHighlight, setEditingHighlight] = useState<GovernanceHighlight | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        category: HighlightCategory.INNOVATIVE_INITIATIVE,
        description: '',
        area: '',
        department: '',
        state: 'Andhra Pradesh',
        district: '',
        constituency: '',
        mandal: '',
        village: '',
        yearStarted: undefined as number | undefined,
        yearCompleted: new Date().getFullYear(),
        period: '',
        status: HighlightStatus.ADDRESSED,
        sourceType: SourceType.GOVERNMENT_PORTAL,
        sourceUrl: '',
        sourceTitle: '',
        issueContext: '',
        adminNotes: '',
    });

    const tabContentVariants = {
        initial: { opacity: 0, y: 12 },
        enter: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.2,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            y: -12,
            position: 'absolute' as const,
            transition: { duration: 0.15 }
        }
    };

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

    const { data, loading, error, refetch } = useQuery(GET_GOVERNANCE_HIGHLIGHTS, {
        variables: category ? { category } : {},
        fetchPolicy: 'cache-and-network',
    });

    const [createHighlight, { loading: creating }] = useMutation(CREATE_GOVERNANCE_HIGHLIGHT_MUTATION, {
        onCompleted: () => {
            setSnackbarMessage('Highlight created successfully!');
            setSnackbarOpen(true);
            setDialogOpen(false);
            resetForm();
            refetch();
        },
        onError: (error) => {
            setSnackbarMessage(`Error: ${error.message}`);
            setSnackbarOpen(true);
        },
    });

    const [updateHighlight, { loading: updating }] = useMutation(UPDATE_GOVERNANCE_HIGHLIGHT_MUTATION, {
        onCompleted: () => {
            setSnackbarMessage('Highlight updated successfully!');
            setSnackbarOpen(true);
            setDialogOpen(false);
            resetForm();
            refetch();
        },
        onError: (error) => {
            setSnackbarMessage(`Error: ${error.message}`);
            setSnackbarOpen(true);
        },
    });

    const [deleteHighlight, { loading: deleting }] = useMutation(DELETE_GOVERNANCE_HIGHLIGHT_MUTATION, {
        onCompleted: () => {
            setSnackbarMessage('Highlight deleted successfully!');
            setSnackbarOpen(true);
            refetch();
        },
        onError: (error) => {
            setSnackbarMessage(`Error: ${error.message}`);
            setSnackbarOpen(true);
        },
    });

    const handleCategoryChange = (_event: React.MouseEvent<HTMLElement>, newCategory: HighlightCategory | null) => {
        setCategory(newCategory);
    };

    const getStatusLabel = (status: HighlightStatus) => {
        switch (status) {
            case HighlightStatus.ADDRESSED:
                return 'Completed';
            case HighlightStatus.IN_PROGRESS:
                return 'In Progress';
            case HighlightStatus.FOLLOW_UP_ONGOING:
                return 'Monitoring';
            default:
                return status;
        }
    };

    const getStatusColor = (status: HighlightStatus): 'success' | 'warning' | 'info' => {
        switch (status) {
            case HighlightStatus.ADDRESSED:
                return 'success';
            case HighlightStatus.IN_PROGRESS:
                return 'warning';
            case HighlightStatus.FOLLOW_UP_ONGOING:
                return 'info';
            default:
                return 'info';
        }
    };

    const getSourceTypeLabel = (sourceType: SourceType) => {
        switch (sourceType) {
            case SourceType.GOVERNMENT_PORTAL:
                return 'Government Portal';
            case SourceType.PRESS_RELEASE:
                return 'Official Press Release';
            case SourceType.PUBLIC_RECORD:
                return 'Public Record';
            case SourceType.NEWS_REPORT:
                return 'News Report';
            case SourceType.FIELD_VERIFICATION:
                return 'Field Documentation';
            default:
                return sourceType;
        }
    };

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const resetForm = () => {
        setFormData({
            title: '',
            category: HighlightCategory.INNOVATIVE_INITIATIVE,
            description: '',
            area: '',
            department: '',
            state: 'Andhra Pradesh',
            district: '',
            constituency: '',
            mandal: '',
            village: '',
            yearStarted: undefined,
            yearCompleted: new Date().getFullYear(),
            period: '',
            status: HighlightStatus.ADDRESSED,
            sourceType: SourceType.GOVERNMENT_PORTAL,
            sourceUrl: '',
            sourceTitle: '',
            issueContext: '',
            adminNotes: '',
        });
        setEditingHighlight(null);
    };

    const handleOpenDialog = (highlight?: GovernanceHighlight) => {
        if (highlight) {
            setEditingHighlight(highlight);
            setFormData({
                title: highlight.title,
                category: highlight.category,
                description: highlight.description,
                area: highlight.area,
                department: highlight.department || '',
                state: highlight.state,
                district: highlight.district,
                constituency: '',
                mandal: '',
                village: '',
                yearStarted: undefined,
                yearCompleted: highlight.yearCompleted,
                period: '',
                status: highlight.status,
                sourceType: highlight.sourceType,
                sourceUrl: highlight.sourceUrl,
                sourceTitle: '',
                issueContext: '',
                adminNotes: '',
            });
        } else {
            resetForm();
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        resetForm();
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.description || !formData.area || !formData.district || !formData.sourceUrl) {
            setSnackbarMessage('Please fill in all required fields');
            setSnackbarOpen(true);
            return;
        }

        const input = {
            ...formData,
            yearStarted: formData.yearStarted || undefined,
            department: formData.department || undefined,
            constituency: formData.constituency || undefined,
            mandal: formData.mandal || undefined,
            village: formData.village || undefined,
            period: formData.period || undefined,
            sourceTitle: formData.sourceTitle || undefined,
            issueContext: formData.issueContext || undefined,
            adminNotes: formData.adminNotes || undefined,
        };

        if (editingHighlight) {
            await updateHighlight({
                variables: {
                    id: editingHighlight.id,
                    input,
                },
            });
        } else {
            await createHighlight({
                variables: { input },
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this highlight?')) {
            await deleteHighlight({
                variables: { id },
            });
        }
    };

    // Only show full loading spinner if we have no data at all
    if (loading && !data) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">Failed to load governance highlights: {error.message}</Alert>
            </Container>
        );
    }

    const highlights: GovernanceHighlight[] = data?.governanceHighlights || [];

    return (
        <Box component="main" sx={{ backgroundColor: '#fafafa', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                            Governance Highlights
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Documenting governance actions for informed citizenship
                        </Typography>
                    </Box>
                    {isSuperAdmin && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            component={Link}
                            href="/governance-highlights/create"
                        >
                            Create Highlight
                        </Button>
                    )}
                </Box>

                {/* Animated Category Tabs */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{
                        position: 'relative',
                        display: 'flex',
                        bgcolor: 'white',
                        borderRadius: 2,
                        p: 0.5,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}>
                        {[
                            { value: HighlightCategory.PENDING_ISSUE_ADDRESSED, label: 'Long-Pending Issues Addressed' },
                            { value: HighlightCategory.INNOVATIVE_INITIATIVE, label: 'Innovative Initiatives' }
                        ].map((tab) => {
                            const isSelected = category === tab.value;
                            return (
                                <Box
                                    key={tab.value}
                                    onClick={(e) => handleCategoryChange(e as any, tab.value)}
                                    sx={{
                                        position: 'relative',
                                        px: 3,
                                        py: 1.5,
                                        cursor: 'pointer',
                                        zIndex: 1,
                                        userSelect: 'none',
                                        transition: 'color 0.2s',
                                        color: isSelected ? 'primary.main' : 'text.secondary',
                                        minWidth: 200,
                                        textAlign: 'center',
                                    }}
                                >
                                    {isSelected && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                height: 2,
                                                backgroundColor: '#1976d2',
                                                borderRadius: '2px 2px 0 0',
                                            }}
                                        />
                                    )}
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: isSelected ? 600 : 500,
                                            position: 'relative',
                                            zIndex: 2,
                                            letterSpacing: '0.01em'
                                        }}
                                    >
                                        {tab.label}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                {/* Highlights Grid with Transition */}
                <AnimatePresence mode="wait">
                    {highlights.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h6" color="text.secondary">
                                    No highlights in this category yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Check back soon for updates.
                                </Typography>
                            </Box>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={category}
                            variants={tabContentVariants}
                            initial="initial"
                            animate="enter"
                            exit="exit"
                        >
                            <Grid container spacing={3}>
                                {highlights.map((highlight) => (
                                    <Grid item xs={12} md={4} key={highlight.id}>
                                        <Link href={`/governance-highlights/${highlight.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                                            <Card sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                position: 'relative',
                                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                boxShadow: 'none',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                    transform: 'translateY(-2px)',
                                                },
                                            }}>
                                                {/* Status Strip (Left Border) */}
                                                <Box sx={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: 4,
                                                    bgcolor: highlight.status === HighlightStatus.ADDRESSED ? '#2e7d32' :
                                                        highlight.status === HighlightStatus.IN_PROGRESS ? '#ed6c02' : '#0288d1'
                                                }} />

                                                {/* Profile/Cover Photo */}
                                                {highlight.image && (
                                                    <CardMedia
                                                        component="img"
                                                        height="200"
                                                        image={highlight.image}
                                                        alt={highlight.title}
                                                        sx={{ objectFit: 'cover' }}
                                                    />
                                                )}

                                                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', paddingLeft: '24px' }}>
                                                    {/* Metadata Header */}
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                        <Typography variant="caption" sx={{
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            letterSpacing: '0.05em',
                                                            textTransform: 'uppercase',
                                                            color: 'text.secondary',
                                                        }}>
                                                            {highlight.yearCompleted} • {highlight.district}
                                                        </Typography>

                                                        {/* Status Label */}
                                                        <Typography variant="caption" sx={{
                                                            fontSize: '0.7rem',
                                                            fontWeight: 700,
                                                            color: highlight.status === HighlightStatus.ADDRESSED ? '#2e7d32' :
                                                                highlight.status === HighlightStatus.IN_PROGRESS ? '#ed6c02' : '#0288d1',
                                                            bgcolor: highlight.status === HighlightStatus.ADDRESSED ? '#e8f5e9' :
                                                                highlight.status === HighlightStatus.IN_PROGRESS ? '#fff3e0' : '#e1f5fe',
                                                            px: 1,
                                                            py: 0.25,
                                                            borderRadius: 1,
                                                            textTransform: 'uppercase',
                                                        }}>
                                                            {getStatusLabel(highlight.status)}
                                                        </Typography>
                                                    </Box>

                                                    {/* Title */}
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 700,
                                                        mb: 2,
                                                        fontFamily: '"Merriweather", "Roboto Slab", serif',
                                                        lineHeight: 1.4,
                                                        color: '#1a1a1a',
                                                        fontSize: '1.1rem'
                                                    }}>
                                                        {highlight.title}
                                                    </Typography>

                                                    {/* Description */}
                                                    <Typography variant="body2" sx={{
                                                        mb: 2,
                                                        flexGrow: 1,
                                                        color: 'text.secondary',
                                                        lineHeight: 1.6
                                                    }}>
                                                        {truncateText(highlight.description, 180)}
                                                    </Typography>

                                                    {/* Source Link */}
                                                    <Box sx={{ mt: 2 }}>
                                                        <MuiLink
                                                            href={highlight.sourceUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            sx={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 600,
                                                                color: 'primary.main',
                                                                textDecoration: 'none',
                                                                '&:hover': { textDecoration: 'underline' }
                                                            }}
                                                        >
                                                            <LinkIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                            Source: {getSourceTypeLabel(highlight.sourceType)}
                                                        </MuiLink>
                                                    </Box>
                                                </CardContent>

                                                {/* Admin Footer */}
                                                {isSuperAdmin && (
                                                    <Box sx={{
                                                        px: 2,
                                                        py: 1,
                                                        borderTop: '1px solid',
                                                        borderColor: 'divider',
                                                        bgcolor: '#fafafa',
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                        gap: 1
                                                    }}>
                                                        <IconButton size="small" onClick={() => handleOpenDialog(highlight)} title="Edit">
                                                            <EditIcon fontSize="small" sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => handleDelete(highlight.id)} color="error" title="Delete">
                                                            <DeleteIcon fontSize="small" sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Box>
                                                )}
                                            </Card>
                                        </Link>
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Create/Edit Dialog */}
                <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                    <DialogTitle>{editingHighlight ? 'Edit Highlight' : 'Create Highlight'}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                            <TextField
                                label="Title *"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                fullWidth
                            />

                            <FormControl fullWidth>
                                <InputLabel>Category *</InputLabel>
                                <Select
                                    value={formData.category}
                                    label="Category *"
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as HighlightCategory })}
                                >
                                    <MenuItem value={HighlightCategory.INNOVATIVE_INITIATIVE}>Innovative Initiative</MenuItem>
                                    <MenuItem value={HighlightCategory.PENDING_ISSUE_ADDRESSED}>Pending Issue Addressed</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Description *"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                multiline
                                rows={4}
                                fullWidth
                            />

                            <TextField
                                label="Area *"
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                placeholder="e.g., Infrastructure, Healthcare, Education"
                                fullWidth
                            />

                            <TextField
                                label="Department"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                fullWidth
                            />

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="State *"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    fullWidth
                                />
                                <TextField
                                    label="District *"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    fullWidth
                                />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Year Started"
                                    type="number"
                                    value={formData.yearStarted || ''}
                                    onChange={(e) => setFormData({ ...formData, yearStarted: e.target.value ? parseInt(e.target.value) : undefined })}
                                    fullWidth
                                />
                                <TextField
                                    label="Year Completed *"
                                    type="number"
                                    value={formData.yearCompleted}
                                    onChange={(e) => setFormData({ ...formData, yearCompleted: parseInt(e.target.value) })}
                                    fullWidth
                                />
                            </Box>

                            <FormControl fullWidth>
                                <InputLabel>Status *</InputLabel>
                                <Select
                                    value={formData.status}
                                    label="Status *"
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as HighlightStatus })}
                                >
                                    <MenuItem value={HighlightStatus.ADDRESSED}>Completed</MenuItem>
                                    <MenuItem value={HighlightStatus.IN_PROGRESS}>In Progress</MenuItem>
                                    <MenuItem value={HighlightStatus.FOLLOW_UP_ONGOING}>Monitoring</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Source Type *</InputLabel>
                                <Select
                                    value={formData.sourceType}
                                    label="Source Type *"
                                    onChange={(e) => setFormData({ ...formData, sourceType: e.target.value as SourceType })}
                                >
                                    <MenuItem value={SourceType.GOVERNMENT_PORTAL}>Government Portal</MenuItem>
                                    <MenuItem value={SourceType.PRESS_RELEASE}>Press Release</MenuItem>
                                    <MenuItem value={SourceType.PUBLIC_RECORD}>Public Record</MenuItem>
                                    <MenuItem value={SourceType.NEWS_REPORT}>News Report</MenuItem>
                                    <MenuItem value={SourceType.FIELD_VERIFICATION}>Field Verification</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Source URL *"
                                value={formData.sourceUrl}
                                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                                fullWidth
                            />

                            <TextField
                                label="Issue Context (for Pending Issues)"
                                value={formData.issueContext}
                                onChange={(e) => setFormData({ ...formData, issueContext: e.target.value })}
                                multiline
                                rows={3}
                                fullWidth
                            />

                            <TextField
                                label="Admin Notes (internal)"
                                value={formData.adminNotes}
                                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                                multiline
                                rows={2}
                                fullWidth
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained" disabled={creating || updating}>
                            {editingHighlight ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={4000}
                    onClose={() => setSnackbarOpen(false)}
                    message={snackbarMessage}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
            </Container>
        </Box>
    );
}
