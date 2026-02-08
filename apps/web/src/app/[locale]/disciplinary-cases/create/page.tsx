'use client';

import React, { useState } from 'react';
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
    Autocomplete,
    IconButton
} from '@mui/material';
import { CloudUpload, Save, ArrowBack, Add, Delete } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CREATE_DISCIPLINARY_CASE } from '@/graphql/disciplinary-cases';
import { IssueCategory, IssueSource } from '@/components/ui/case-status-badge';

export default function CreateDisciplinaryCasePage() {
    const router = useRouter();
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
        sourceLinks: [''] as string[],
    });

    // Separate state for file inputs
    const [evidenceFiles, setEvidenceFiles] = useState<FileList | null>(null);
    const [imageFiles, setImageFiles] = useState<FileList | null>(null);
    const [leaderPhotoFile, setLeaderPhotoFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [createCase, { loading: creating }] = useMutation(CREATE_DISCIPLINARY_CASE);

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
            let leaderPhotoUrl = '';
            if (leaderPhotoFile) {
                const leaderPhotoBase64 = await convertFilesToBase64([leaderPhotoFile]);
                leaderPhotoUrl = leaderPhotoBase64[0];
            }

            // Convert images to base64 for upload
            let imageUrls: string[] = [];
            if (imageFiles) {
                imageUrls = await convertFilesToBase64(imageFiles);
            }

            let evidenceUrls: string[] = [];
            if (evidenceFiles) {
                evidenceUrls = await convertFilesToBase64(evidenceFiles);
            }

            // Filter out empty source links
            const validSourceLinks = formData.sourceLinks.filter(link => link.trim() !== '');

            // Note: Evidence docs handling would typically go to a separate storage service
            // For this implementation plan, we'll focus on the images integration

            await createCase({
                variables: {
                    input: {
                        leaderName: formData.leaderName,
                        leaderPhotoUrl: leaderPhotoUrl || undefined,
                        position: formData.position,
                        constituency: formData.constituency || undefined,
                        district: formData.district || undefined,
                        issueCategory: formData.issueCategory,
                        issueDescription: formData.issueDescription,
                        issueSource: formData.issueSource,
                        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
                        evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
                        sourceLinks: validSourceLinks.length > 0 ? validSourceLinks : undefined
                    }
                }
            });

            router.push('/disciplinary-cases');
        } catch (err: any) {
            setError(err.message || t('errors.createFailed'));
        }
    };

    return (
        <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3 }, maxWidth: '900px', mx: 'auto' }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => router.push('/disciplinary-cases')}
                sx={{ mb: 2 }}
            >
                {t('actions.cancel')}
            </Button>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                    {t('title')}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    {t('description')}
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
                                {t('fields.leaderPhoto')}
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
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>{t('section.evidence')}</Typography>
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
                                <Button variant="outlined" onClick={() => router.back()}>
                                    {t('actions.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={creating ? <CircularProgress size={20} /> : <Save />}
                                    disabled={creating}
                                    sx={{ minWidth: 150 }}
                                >
                                    {creating ? t('actions.creating') : t('actions.create')}
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}
