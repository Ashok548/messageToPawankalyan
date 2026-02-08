'use client';

import { useQuery, useMutation } from '@apollo/client';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { GET_GOVERNANCE_HIGHLIGHTS, CREATE_GOVERNANCE_HIGHLIGHT_MUTATION, UPDATE_GOVERNANCE_HIGHLIGHT_MUTATION, DELETE_GOVERNANCE_HIGHLIGHT_MUTATION } from '@/graphql/queries/governance-highlights';
import { Box, Container, Typography, ToggleButtonGroup, ToggleButton, Grid, CircularProgress, Alert, Chip, Card, CardContent, CardMedia, Link as MuiLink, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Snackbar } from '@mui/material';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    const t = useTranslations('governance');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();
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

    const tabContentVariants: Variants = {
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
            setSnackbarMessage(t('form.success'));
            setSnackbarOpen(true);
            setDialogOpen(false);
            resetForm();
            refetch();
        },
        onError: (error) => {
            setSnackbarMessage(`${tCommon('error')}: ${error.message}`);
            setSnackbarOpen(true);
        },
    });

    const [updateHighlight, { loading: updating }] = useMutation(UPDATE_GOVERNANCE_HIGHLIGHT_MUTATION, {
        onCompleted: () => {
            setSnackbarMessage(t('form.success'));
            setSnackbarOpen(true);
            setDialogOpen(false);
            resetForm();
            refetch();
        },
        onError: (error) => {
            setSnackbarMessage(`${tCommon('error')}: ${error.message}`);
            setSnackbarOpen(true);
        },
    });

    const [deleteHighlight, { loading: deleting }] = useMutation(DELETE_GOVERNANCE_HIGHLIGHT_MUTATION, {
        onCompleted: () => {
            setSnackbarMessage(t('form.successDelete'));
            setSnackbarOpen(true);
            refetch();
        },
        onError: (error) => {
            setSnackbarMessage(`${tCommon('error')}: ${error.message}`);
            setSnackbarOpen(true);
        },
    });

    const handleCategoryChange = (_event: React.MouseEvent<HTMLElement>, newCategory: HighlightCategory | null) => {
        setCategory(newCategory);
    };

    const getStatusLabel = (status: HighlightStatus) => {
        switch (status) {
            case HighlightStatus.ADDRESSED:
                return t('statusValues.ADDRESSED');
            case HighlightStatus.IN_PROGRESS:
                return t('statusValues.IN_PROGRESS');
            case HighlightStatus.FOLLOW_UP_ONGOING:
                return t('statusValues.FOLLOW_UP_ONGOING');
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
                return t('sourceValues.GOVERNMENT_PORTAL');
            case SourceType.PRESS_RELEASE:
                return t('sourceValues.PRESS_RELEASE');
            case SourceType.PUBLIC_RECORD:
                return t('sourceValues.PUBLIC_RECORD');
            case SourceType.NEWS_REPORT:
                return t('sourceValues.NEWS_REPORT');
            case SourceType.FIELD_VERIFICATION:
                return t('sourceValues.FIELD_VERIFICATION');
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
            setSnackbarMessage(t('form.errorFields'));
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
        if (confirm(t('deleteConfirmation'))) {
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
            <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
                <Alert severity="error">{tCommon('error')}: {error.message}</Alert>
            </Container>
        );
    }

    const highlights: GovernanceHighlight[] = data?.governanceHighlights || [];

    return (
        <Box component="main" sx={{ backgroundColor: '#fafafa', minHeight: '100vh', py: 4 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                            {t('title')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {t('subtitle')}
                        </Typography>
                    </Box>
                    {isSuperAdmin && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            component={Link}
                            href={`/${locale}/governance-highlights/create`}
                        >
                            {tCommon('submit')}
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
                            { value: HighlightCategory.PENDING_ISSUE_ADDRESSED, label: t('categoryValues.PENDING_ISSUE_ADDRESSED') },
                            { value: HighlightCategory.INNOVATIVE_INITIATIVE, label: t('categoryValues.INNOVATIVE_INITIATIVE') }
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
                                    {t('noHighlights')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {t('checkBackSoon')}
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
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {highlights.map((highlight) => (
                                    <Card
                                        key={highlight.id}
                                        onClick={() => router.push(`/${locale}/governance-highlights/${highlight.id}`)}
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
                                                bgcolor: '#f5f5f5',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                            }}
                                        >
                                            {highlight.image ? (
                                                <Box
                                                    component="img"
                                                    src={highlight.image}
                                                    alt={highlight.title}
                                                    sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                        maxHeight: { xs: 200, sm: '100%' },
                                                    }}
                                                />
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('noImage')}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* CENTER & RIGHT SECTIONS: Content */}
                                        <CardContent sx={{ flex: 1, p: 3, '&:last-child': { pb: 3 } }}>
                                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                                                {/* CENTER: Main Content */}
                                                <Box sx={{ flex: 1 }}>
                                                    {/* Title & Location */}
                                                    <Box sx={{ mb: 1 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5, color: '#1a1a1a' }}>
                                                            {highlight.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                            {highlight.district}, {highlight.state} • {highlight.yearCompleted}
                                                        </Typography>
                                                    </Box>

                                                    {/* Description (2 lines max) */}
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
                                                        {highlight.description}
                                                    </Typography>

                                                    {/* Metadata - Horizontal List (1 line) */}
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
                                                        {highlight.area} • {getStatusLabel(highlight.status)} • {getSourceTypeLabel(highlight.sourceType)}
                                                    </Typography>
                                                </Box>

                                                {/* RIGHT: Actions */}
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: { xs: 'flex-start', md: 'flex-end' },
                                                        justifyContent: 'center',
                                                        gap: 1,
                                                        minWidth: { md: 100 }
                                                    }}
                                                >
                                                    {/* Admin Edit/Delete Buttons */}
                                                    {isSuperAdmin && (
                                                        <>
                                                            <IconButton
                                                                color="primary"
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenDialog(highlight);
                                                                }}
                                                                aria-label="Edit Highlight"
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(highlight.id);
                                                                }}
                                                                aria-label="Delete Highlight"
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Create/Edit Dialog */}
                <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                    <DialogTitle>{editingHighlight ? t('editHighlight') : t('create')}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                            <TextField
                                label={t('form.fields.title')}
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                fullWidth
                            />

                            <FormControl fullWidth>
                                <InputLabel>{t('form.fields.category')}</InputLabel>
                                <Select
                                    value={formData.category}
                                    label={t('form.fields.category')}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as HighlightCategory })}
                                >
                                    <MenuItem value={HighlightCategory.INNOVATIVE_INITIATIVE}>{t('form.categories.INNOVATIVE_INITIATIVE')}</MenuItem>
                                    <MenuItem value={HighlightCategory.PENDING_ISSUE_ADDRESSED}>{t('form.categories.PENDING_ISSUE_ADDRESSED')}</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label={t('form.fields.description')}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                multiline
                                rows={4}
                                fullWidth
                            />

                            <TextField
                                label={t('form.fields.area')}
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                placeholder={t('form.fields.areaPlaceholder')}
                                fullWidth
                            />

                            <TextField
                                label={t('form.fields.department')}
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                fullWidth
                            />

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label={t('form.fields.state')}
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    fullWidth
                                />
                                <TextField
                                    label={t('form.fields.district')}
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    fullWidth
                                />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label={t('form.fields.yearStarted')}
                                    type="number"
                                    value={formData.yearStarted || ''}
                                    onChange={(e) => setFormData({ ...formData, yearStarted: e.target.value ? parseInt(e.target.value) : undefined })}
                                    fullWidth
                                />
                                <TextField
                                    label={t('form.fields.yearCompleted')}
                                    type="number"
                                    value={formData.yearCompleted}
                                    onChange={(e) => setFormData({ ...formData, yearCompleted: parseInt(e.target.value) })}
                                    fullWidth
                                />
                            </Box>

                            <FormControl fullWidth>
                                <InputLabel>{t('form.fields.status')}</InputLabel>
                                <Select
                                    value={formData.status}
                                    label={t('form.fields.status')}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as HighlightStatus })}
                                >
                                    <MenuItem value={HighlightStatus.ADDRESSED}>{t('form.statusValues.ADDRESSED')}</MenuItem>
                                    <MenuItem value={HighlightStatus.IN_PROGRESS}>{t('form.statusValues.IN_PROGRESS')}</MenuItem>
                                    <MenuItem value={HighlightStatus.FOLLOW_UP_ONGOING}>{t('form.statusValues.FOLLOW_UP_ONGOING')}</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>{t('form.fields.sourceType')}</InputLabel>
                                <Select
                                    value={formData.sourceType}
                                    label={t('form.fields.sourceType')}
                                    onChange={(e) => setFormData({ ...formData, sourceType: e.target.value as SourceType })}
                                >
                                    <MenuItem value={SourceType.GOVERNMENT_PORTAL}>{t('form.sourceTypes.GOVERNMENT_PORTAL')}</MenuItem>
                                    <MenuItem value={SourceType.PRESS_RELEASE}>{t('form.sourceTypes.PRESS_RELEASE')}</MenuItem>
                                    <MenuItem value={SourceType.PUBLIC_RECORD}>{t('form.sourceTypes.PUBLIC_RECORD')}</MenuItem>
                                    <MenuItem value={SourceType.NEWS_REPORT}>{t('form.sourceTypes.NEWS_REPORT')}</MenuItem>
                                    <MenuItem value={SourceType.FIELD_VERIFICATION}>{t('form.sourceTypes.FIELD_VERIFICATION')}</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label={t('form.fields.sourceUrl')}
                                value={formData.sourceUrl}
                                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                                fullWidth
                            />

                            <TextField
                                label={t('form.fields.issueContext')}
                                value={formData.issueContext}
                                onChange={(e) => setFormData({ ...formData, issueContext: e.target.value })}
                                multiline
                                rows={3}
                                fullWidth
                            />

                            <TextField
                                label={t('form.fields.adminNotes')}
                                value={formData.adminNotes}
                                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                                multiline
                                rows={2}
                                fullWidth
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>{tCommon('cancel')}</Button>
                        <Button onClick={handleSubmit} variant="contained" disabled={creating || updating}>
                            {editingHighlight ? tCommon('save') : tCommon('submit')}
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
