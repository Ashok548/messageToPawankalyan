'use client';

import { useMutation } from '@apollo/client';
import { CREATE_GOVERNANCE_HIGHLIGHT_MUTATION } from '@/graphql/queries/governance-highlights';
import { Box, Container, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert, Paper, Grid } from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

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

export default function CreateGovernanceHighlightPage() {
    const router = useRouter();
    const t = useTranslations('governance.form');
    const tGov = useTranslations('governance');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    // File upload state
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

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

    const [createHighlight, { loading: creating }] = useMutation(CREATE_GOVERNANCE_HIGHLIGHT_MUTATION, {
        onCompleted: () => {
            setSnackbarMessage(t('success'));
            setSnackbarOpen(true);
            setTimeout(() => {
                router.push('/governance-highlights');
            }, 1000);
        },
        onError: (error) => {
            setError(error.message);
            setSnackbarMessage(`Error: ${error.message}`);
            setSnackbarOpen(true);
        },
    });

    // File conversion utility
    const convertFilesToBase64 = (files: File[]): Promise<string[]> => {
        return Promise.all(
            files.map(file => new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }))
        );
    };

    const handleSubmit = async () => {
        setError(null);
        if (!formData.title || !formData.description || !formData.area || !formData.district || !formData.sourceUrl) {
            setError(t('errorFields'));
            return;
        }

        let imageBase64: string | undefined;
        let galleryBase64: string[] = [];

        // Convert profile photo
        if (profilePhoto) {
            const [base64] = await convertFilesToBase64([profilePhoto]);
            imageBase64 = base64;
        }

        // Convert gallery images
        if (galleryFiles.length > 0) {
            galleryBase64 = await convertFilesToBase64(galleryFiles);
        }

        const input = {
            ...formData,
            image: imageBase64,
            gallery: galleryBase64.length > 0 ? galleryBase64 : undefined,
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

        await createHighlight({
            variables: { input },
        });
    };

    return (
        <Box component="main" sx={{ backgroundColor: '#fafafa', minHeight: '100vh', py: 4 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 }, maxWidth: '900px', mx: 'auto' }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                    sx={{ mb: 3 }}
                >
                    {t('back')}
                </Button>

                <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                            {t('title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('subtitle')}
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label={t('fields.title')}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            fullWidth
                            helperText={t('fields.titleHelper')}
                        />

                        <FormControl fullWidth>
                            <InputLabel>{t('fields.category')}</InputLabel>
                            <Select
                                value={formData.category}
                                label={t('fields.category')}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as HighlightCategory })}
                            >
                                <MenuItem value={HighlightCategory.INNOVATIVE_INITIATIVE}>{t('categories.INNOVATIVE_INITIATIVE')}</MenuItem>
                                <MenuItem value={HighlightCategory.PENDING_ISSUE_ADDRESSED}>{t('categories.PENDING_ISSUE_ADDRESSED')}</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label={t('fields.description')}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            multiline
                            rows={4}
                            fullWidth
                            helperText={t('fields.descriptionHelper')}
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label={t('fields.area')}
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    placeholder={t('fields.areaPlaceholder')}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label={t('fields.department')}
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label={t('fields.state')}
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label={t('fields.district')}
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label={t('fields.yearStarted')}
                                    type="number"
                                    value={formData.yearStarted || ''}
                                    onChange={(e) => setFormData({ ...formData, yearStarted: e.target.value ? parseInt(e.target.value) : undefined })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label={t('fields.yearCompleted')}
                                    type="number"
                                    value={formData.yearCompleted}
                                    onChange={(e) => setFormData({ ...formData, yearCompleted: parseInt(e.target.value) })}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>

                        <FormControl fullWidth>
                            <InputLabel>{t('fields.status')}</InputLabel>
                            <Select
                                value={formData.status}
                                label={t('fields.status')}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as HighlightStatus })}
                            >
                                <MenuItem value={HighlightStatus.ADDRESSED}>{t('statusValues.ADDRESSED')}</MenuItem>
                                <MenuItem value={HighlightStatus.IN_PROGRESS}>{t('statusValues.IN_PROGRESS')}</MenuItem>
                                <MenuItem value={HighlightStatus.FOLLOW_UP_ONGOING}>{t('statusValues.FOLLOW_UP_ONGOING')}</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>{t('fields.sourceType')}</InputLabel>
                            <Select
                                value={formData.sourceType}
                                label={t('fields.sourceType')}
                                onChange={(e) => setFormData({ ...formData, sourceType: e.target.value as SourceType })}
                            >
                                <MenuItem value={SourceType.GOVERNMENT_PORTAL}>{t('sourceTypes.GOVERNMENT_PORTAL')}</MenuItem>
                                <MenuItem value={SourceType.PRESS_RELEASE}>{t('sourceTypes.PRESS_RELEASE')}</MenuItem>
                                <MenuItem value={SourceType.PUBLIC_RECORD}>{t('sourceTypes.PUBLIC_RECORD')}</MenuItem>
                                <MenuItem value={SourceType.NEWS_REPORT}>{t('sourceTypes.NEWS_REPORT')}</MenuItem>
                                <MenuItem value={SourceType.FIELD_VERIFICATION}>{t('sourceTypes.FIELD_VERIFICATION')}</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label={t('fields.sourceUrl')}
                            value={formData.sourceUrl}
                            onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                            fullWidth
                            helperText={t('fields.sourceUrlHelper')}
                        />

                        {formData.category === HighlightCategory.PENDING_ISSUE_ADDRESSED && (
                            <TextField
                                label={t('fields.issueContext')}
                                value={formData.issueContext}
                                onChange={(e) => setFormData({ ...formData, issueContext: e.target.value })}
                                multiline
                                rows={3}
                                fullWidth
                                helperText={t('fields.issueContextHelper')}
                            />
                        )}

                        {/* Profile Photo Upload */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                {t('fields.profilePhoto')}
                            </Typography>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{ justifyContent: 'flex-start', py: 1.5 }}
                            >
                                {profilePhoto ? profilePhoto.name : t('fields.uploadPhoto')}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setProfilePhoto(e.target.files[0]);
                                        }
                                    }}
                                />
                            </Button>
                            {profilePhoto && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    {t('fields.selected')}: {profilePhoto.name}
                                </Typography>
                            )}
                        </Box>

                        {/* Gallery Images Upload */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                {t('fields.gallery')}
                            </Typography>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{ justifyContent: 'flex-start', py: 1.5 }}
                            >
                                {galleryFiles.length > 0 ? `${galleryFiles.length} ${t('fields.imagesSelected')}` : t('fields.uploadGallery')}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setGalleryFiles(Array.from(e.target.files));
                                        }
                                    }}
                                />
                            </Button>
                            {galleryFiles.length > 0 && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    {galleryFiles.map(f => f.name).join(', ')}
                                </Typography>
                            )}
                        </Box>

                        <TextField
                            label={t('fields.adminNotes')}
                            value={formData.adminNotes}
                            onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                            multiline
                            rows={2}
                            fullWidth
                        />

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => router.back()}
                                disabled={creating}
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={creating}
                                startIcon={creating ? null : <SaveIcon />}
                            >
                                {creating ? t('creating') : t('create')}
                            </Button>
                        </Box>
                    </Box>
                </Paper>

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
