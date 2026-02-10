'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    TextField,
    MenuItem,
    Button,
    Stack,
    Alert,
    CircularProgress,
    IconButton
} from '@mui/material';
import { CloudUpload, Save, ArrowBack, Add, Delete } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { UPDATE_DISCIPLINARY_CASE, GET_DISCIPLINARY_CASE_DETAILS } from '@/graphql/disciplinary-cases';
import { IssueCategory, IssueSource } from '@/components/ui/case-status-badge';

export default function EditDisciplinaryCasePage() {
    const router = useRouter();
    const params = useParams();
    const caseId = params.id as string;
    const t = useTranslations('disciplinary.form');
    const tCommon = useTranslations('common');

    const [formData, setFormData] = useState({
        leaderName: '',
        position: '',
        constituency: '',
        district: '',
        issueCategory: '',
        issueDescription: '',
        issueSource: '',
        initiationDate: '',
        sourceLinks: [''] as string[],
    });

    // Separate state for file inputs
    const [evidenceFiles, setEvidenceFiles] = useState<FileList | null>(null);
    const [imageFiles, setImageFiles] = useState<FileList | null>(null);
    const [leaderPhotoFile, setLeaderPhotoFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch existing case data
    const { data, loading: fetching, error: fetchError } = useQuery(GET_DISCIPLINARY_CASE_DETAILS, {
        variables: { id: caseId },
    });

    const [updateCase, { loading: updating }] = useMutation(UPDATE_DISCIPLINARY_CASE);

    // Pre-fill form when data is loaded
    useEffect(() => {
        if (data?.disciplinaryCase) {
            const caseData = data.disciplinaryCase;
            setFormData({
                leaderName: caseData.leaderName || '',
                position: caseData.position || '',
                constituency: caseData.constituency || '',
                district: caseData.district || '',
                issueCategory: caseData.issueCategory || '',
                issueDescription: caseData.issueDescription || '',
                issueSource: caseData.issueSource || '',
                initiationDate: caseData.initiationDate ? caseData.initiationDate.split('T')[0] : '',
                sourceLinks: caseData.sourceLinks && caseData.sourceLinks.length > 0 ? caseData.sourceLinks : [''],
            });
        }
    }, [data]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const convertFilesToBase64 = (files: FileList | File[]): Promise<string[]> => {
        const fileArray = Array.isArray(files) ? files : Array.from(files);
        return Promise.all(
            fileArray.map(file => new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            }))
        );
    };

    const handleAddSourceLink = () => {
        setFormData({
            ...formData,
            sourceLinks: [...formData.sourceLinks, '']
        });
    };

    const handleRemoveSourceLink = (index: number) => {
        const newLinks = formData.sourceLinks.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            sourceLinks: newLinks.length > 0 ? newLinks : ['']
        });
    };

    const handleSourceLinkChange = (index: number, value: string) => {
        const newLinks = [...formData.sourceLinks];
        newLinks[index] = value;
        setFormData({
            ...formData,
            sourceLinks: newLinks
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.leaderName || !formData.position) {
            setError(t('errors.requiredFields'));
            return;
        }

        try {
            // Upload leader photo if provided
            let leaderPhotoUrl = undefined;
            if (leaderPhotoFile) {
                const leaderPhotoBase64 = await convertFilesToBase64([leaderPhotoFile]);
                leaderPhotoUrl = leaderPhotoBase64[0];
            }

            // Convert images to base64 for upload
            let imageUrls: string[] | undefined = undefined;
            if (imageFiles) {
                imageUrls = await convertFilesToBase64(imageFiles);
            }

            let evidenceUrls: string[] | undefined = undefined;
            if (evidenceFiles) {
                evidenceUrls = await convertFilesToBase64(evidenceFiles);
            }

            // Filter out empty source links
            const validSourceLinks = formData.sourceLinks.filter(link => link.trim() !== '');

            // Build update input - only include fields that have values
            const updateInput: any = {};
            if (formData.leaderName) updateInput.leaderName = formData.leaderName;
            if (formData.position) updateInput.position = formData.position;
            if (formData.constituency) updateInput.constituency = formData.constituency;
            if (formData.district) updateInput.district = formData.district;
            if (formData.issueCategory) updateInput.issueCategory = formData.issueCategory;
            if (formData.issueDescription) updateInput.issueDescription = formData.issueDescription;
            if (formData.issueSource) updateInput.issueSource = formData.issueSource;
            if (formData.initiationDate) updateInput.initiationDate = formData.initiationDate;
            if (leaderPhotoUrl) updateInput.leaderPhotoUrl = leaderPhotoUrl;
            if (imageUrls && imageUrls.length > 0) updateInput.imageUrls = imageUrls;
            if (evidenceUrls && evidenceUrls.length > 0) updateInput.evidenceUrls = evidenceUrls;
            if (validSourceLinks.length > 0) updateInput.sourceLinks = validSourceLinks;

            await updateCase({
                variables: {
                    id: caseId,
                    input: updateInput
                }
            });

            router.push(`/disciplinary-cases/${caseId}`);
        } catch (err: any) {
            setError(err.message || t('errors.updateFailed') || 'Failed to update case');
        }
    };

    if (fetching) {
        return (
            <Container maxWidth={false} sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (fetchError || !data?.disciplinaryCase) {
        return (
            <Container maxWidth={false} sx={{ py: 4 }}>
                <Alert severity="error">
                    {fetchError?.message || 'Case not found or you do not have permission to edit it'}
                </Alert>
                <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mt: 2 }}>
                    Go Back
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3 }, maxWidth: '900px', mx: 'auto' }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => router.push(`/disciplinary-cases/${caseId}`)}
                sx={{ mb: 2 }}
            >
                {t('actions.cancel')}
            </Button>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                    Edit Disciplinary Case
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Update case information. New images and documents will be added to existing ones.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Subject Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>{t('section.subjectDetails')}</Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={t('fields.leaderName')}
                                name="leaderName"
                                value={formData.leaderName}
                                onChange={handleInputChange}
                                required
                                helperText={t('fields.leaderNameHelper')}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={t('fields.position')}
                                name="position"
                                value={formData.position}
                                onChange={handleInputChange}
                                required
                                helperText={t('fields.positionHelper')}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={t('fields.constituency')}
                                name="constituency"
                                value={formData.constituency}
                                onChange={handleInputChange}
                                helperText={tCommon('optional') || 'Optional'}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={t('fields.district')}
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                helperText={tCommon('optional') || 'Optional'}
                            />
                        </Grid>

                        {/* Leader Profile Photo */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                {t('fields.leaderPhoto')} (Optional - Upload new to replace)
                            </Typography>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUpload />}
                                fullWidth
                                sx={{ height: 56, justifyContent: 'flex-start', pl: 2 }}
                            >
                                {leaderPhotoFile ? leaderPhotoFile.name : t('fields.uploadLeaderPhoto')}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => setLeaderPhotoFile(e.target.files?.[0] || null)}
                                />
                            </Button>
                            {leaderPhotoFile && (
                                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                                    ✓ Selected: {leaderPhotoFile.name}
                                </Typography>
                            )}
                        </Grid>

                        {/* Issue Details */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>{t('section.caseInformation')}</Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label={t('fields.issueCategory')}
                                name="issueCategory"
                                value={formData.issueCategory}
                                onChange={handleInputChange}
                                required
                            >
                                {Object.keys(IssueCategory).map((cat) => (
                                    <MenuItem key={cat} value={cat}>{t(`issueCategories.${cat}`)}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label={t('fields.issueSource')}
                                name="issueSource"
                                value={formData.issueSource}
                                onChange={handleInputChange}
                                required
                            >
                                {Object.keys(IssueSource).map((src) => (
                                    <MenuItem key={src} value={src}>{t(`issueSources.${src}`)}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Initiation Date"
                                name="initiationDate"
                                value={formData.initiationDate}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                helperText="Date when the issue was initiated"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={6}
                                label={t('fields.issueDescription')}
                                name="issueDescription"
                                value={formData.issueDescription}
                                onChange={handleInputChange}
                                required
                                helperText={t('fields.issueDescriptionHelper')}
                            />
                        </Grid>

                        {/* Source Links */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                                {t('fields.sourceLinks')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                {t('fields.sourceLinksHelper')}
                            </Typography>
                            <Stack spacing={2}>
                                {formData.sourceLinks.map((link, index) => (
                                    <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <TextField
                                            fullWidth
                                            placeholder={t('fields.sourceUrlPlaceholder') + ` ${index + 1}`}
                                            value={link}
                                            onChange={(e) => handleSourceLinkChange(index, e.target.value)}
                                            type="url"
                                        />
                                        {formData.sourceLinks.length > 1 && (
                                            <IconButton
                                                color="error"
                                                onClick={() => handleRemoveSourceLink(index)}
                                                aria-label="Remove source link"
                                            >
                                                <Delete />
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}
                                <Button
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={handleAddSourceLink}
                                    sx={{ alignSelf: 'flex-start' }}
                                >
                                    {t('fields.addSourceLink')}
                                </Button>
                            </Stack>
                        </Grid>

                        {/* Evidence Upload */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                {t('section.evidence')} (Optional - Add more files)
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUpload />}
                                fullWidth
                                sx={{ height: 56 }}
                            >
                                {t('fields.uploadPhotos')}
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setImageFiles(e.target.files)}
                                />
                            </Button>
                            {imageFiles && (
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                    {imageFiles.length} {t('fields.photosSelected')}
                                </Typography>
                            )}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUpload />}
                                fullWidth
                                sx={{ height: 56 }}
                            >
                                {t('fields.uploadDocuments')}
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={(e) => setEvidenceFiles(e.target.files)}
                                />
                            </Button>
                            {evidenceFiles && (
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                    {evidenceFiles.length} {t('fields.filesSelected')}
                                </Typography>
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                                <Button variant="outlined" onClick={() => router.push(`/disciplinary-cases/${caseId}`)}>
                                    {t('actions.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={updating ? <CircularProgress size={20} /> : <Save />}
                                    disabled={updating}
                                    sx={{ minWidth: 150 }}
                                >
                                    {updating ? 'Updating...' : 'Update Case'}
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}
