'use client';

import {
    Alert,
    Box,
    Button,
    Container,
    MenuItem,
    Paper,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ANDHRA_PRADESH_DISTRICTS, STATES } from '@repo/constants';
import { ImageUploadField } from '@/components/forms/ImageUploadField';
import { useNavigate } from '@/hooks/use-navigate';
import { type ImageFile } from '@/utils/file-helpers';
import { getErrorMessage } from '@/utils/error-helpers';

const CATEGORY_OPTIONS = ['CORRUPTION', 'LAND_MAFIA', 'INDUSTRIAL_POLLUTION', 'POLICY_CONCERN', 'PUBLIC_SERVICES', 'INFRASTRUCTURE', 'OTHER'] as const;
const SENSITIVE_CATEGORIES = new Set(['CORRUPTION', 'LAND_MAFIA', 'INDUSTRIAL_POLLUTION']);
const STEP_LABELS = ['Title + Description', 'Category + Location', 'Media Upload', 'Review & Submit'];
const REST_BASE_URL = process.env.NEXT_PUBLIC_REST_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace('/graphql', '') || 'http://localhost:4000';

export default function SubmitPublicIssuePage() {
    const t = useTranslations('publicIssues');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const { navigate } = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'CORRUPTION',
        state: STATES[0],
        district: '',
        constituency: '',
        mandal: '',
        village: '',
    });
    const [currentStep, setCurrentStep] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [images, setImages] = useState<ImageFile[]>([]);

    useEffect(() => {
        return () => {
            images.forEach((image) => URL.revokeObjectURL(image.preview));
        };
    }, [images]);

    const isSensitiveCategory = SENSITIVE_CATEGORIES.has(formData.category);

    const handleImageChange = (nextImages: ImageFile[]) => {
        setImages(nextImages);
        if (errors.images) {
            setErrors((prev) => ({ ...prev, images: '' }));
        }
        if (submitError) {
            setSubmitError(null);
        }
    };

    const handleFieldChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
        if (submitError) {
            setSubmitError(null);
        }
    };

    const buildErrors = () => {
        const nextErrors: Record<string, string> = {};

        if (formData.title.trim().length < 5) {
            nextErrors.title = t('validation.title');
        }

        if (formData.description.trim().length < 20) {
            nextErrors.description = t('validation.description');
        }

        if (!formData.category) {
            nextErrors.category = 'Select a category.';
        }

        if (!formData.state.trim()) {
            nextErrors.state = 'Select a state.';
        }

        if (!formData.district) {
            nextErrors.district = t('validation.district');
        }

        if (isSensitiveCategory && images.length === 0) {
            nextErrors.images = 'Media is required for sensitive categories.';
        }

        return nextErrors;
    };

    const validateStep = (step: number) => {
        const nextErrors = buildErrors();
        let filteredErrors: Record<string, string> = {};

        if (step === 0) {
            filteredErrors = Object.fromEntries(
                Object.entries(nextErrors).filter(([key]) => key === 'title' || key === 'description'),
            );
        } else if (step === 1) {
            filteredErrors = Object.fromEntries(
                Object.entries(nextErrors).filter(([key]) => key === 'category' || key === 'state' || key === 'district'),
            );
        } else if (step === 2) {
            filteredErrors = Object.fromEntries(
                Object.entries(nextErrors).filter(([key]) => key === 'images'),
            );
        }

        setErrors(filteredErrors);
        return Object.keys(filteredErrors).length === 0;
    };

    const handleNext = () => {
        if (!validateStep(currentStep)) {
            return;
        }

        setCurrentStep((prev) => Math.min(prev + 1, STEP_LABELS.length - 1));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        const nextErrors = buildErrors();
        setSubmitError(null);

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);

            if (nextErrors.title || nextErrors.description) {
                setCurrentStep(0);
            } else if (nextErrors.category || nextErrors.state || nextErrors.district) {
                setCurrentStep(1);
            } else {
                setCurrentStep(2);
            }

            return;
        }

        setSubmitting(true);

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            const response = await fetch(`${REST_BASE_URL}/issues`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    constituency: formData.constituency || undefined,
                    mandal: formData.mandal || undefined,
                    village: formData.village || undefined,
                    images: images.map((image) => image.base64),
                }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                throw new Error(payload?.message || `Request failed with status ${response.status}`);
            }

            images.forEach((image) => URL.revokeObjectURL(image.preview));
            setImages([]);
            setSubmitted(true);
        } catch (error) {
            setSubmitError(getErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    const renderStepContent = () => {
        if (currentStep === 0) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                        label={t('fields.title')}
                        value={formData.title}
                        onChange={(event) => handleFieldChange('title', event.target.value)}
                        error={!!errors.title}
                        helperText={errors.title || `${formData.title.length}/160`}
                        size="small"
                        fullWidth
                    />

                    <TextField
                        label={t('fields.description')}
                        value={formData.description}
                        onChange={(event) => handleFieldChange('description', event.target.value)}
                        error={!!errors.description}
                        helperText={errors.description || `${formData.description.length}/3000`}
                        size="small"
                        fullWidth
                        multiline
                        minRows={7}
                    />
                </Box>
            );
        }

        if (currentStep === 1) {
            return (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                        select
                        label={t('fields.category')}
                        value={formData.category}
                        onChange={(event) => handleFieldChange('category', event.target.value)}
                        error={!!errors.category}
                        helperText={errors.category}
                        size="small"
                    >
                        {CATEGORY_OPTIONS.map((category) => (
                            <MenuItem key={category} value={category}>{t(`categories.${category}`)}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label={t('fields.state')}
                        value={formData.state}
                        onChange={(event) => handleFieldChange('state', event.target.value)}
                        error={!!errors.state}
                        helperText={errors.state}
                        size="small"
                    >
                        {STATES.map((state) => <MenuItem key={state} value={state}>{state}</MenuItem>)}
                    </TextField>

                    <TextField
                        select
                        label={t('fields.district')}
                        value={formData.district}
                        onChange={(event) => handleFieldChange('district', event.target.value)}
                        error={!!errors.district}
                        helperText={errors.district}
                        size="small"
                    >
                        {ANDHRA_PRADESH_DISTRICTS.map((district) => <MenuItem key={district} value={district}>{district}</MenuItem>)}
                    </TextField>

                    <TextField label={t('fields.constituency')} value={formData.constituency} onChange={(event) => handleFieldChange('constituency', event.target.value)} size="small" />
                    <TextField label={t('fields.mandal')} value={formData.mandal} onChange={(event) => handleFieldChange('mandal', event.target.value)} size="small" />
                    <TextField label={t('fields.village')} value={formData.village} onChange={(event) => handleFieldChange('village', event.target.value)} size="small" />
                </Box>
            );
        }

        if (currentStep === 2) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Alert severity={isSensitiveCategory ? 'warning' : 'info'}>
                        {isSensitiveCategory
                            ? 'This category requires supporting media before submission.'
                            : 'Add supporting images if available. This step is optional for this category.'}
                    </Alert>
                    <ImageUploadField label={t('fields.images')} maxImages={4} maxSizeKB={500} onChange={handleImageChange} />
                    {errors.images && <Alert severity="error">{errors.images}</Alert>}
                </Box>
            );
        }

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Alert severity="info">
                    Review the information below before submitting. New issues remain private until moderation is complete.
                </Alert>

                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">{t('fields.title')}</Typography>
                    <Typography sx={{ mb: 2 }}>{formData.title || '-'}</Typography>

                    <Typography variant="subtitle2" color="text.secondary">{t('fields.description')}</Typography>
                    <Typography sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>{formData.description || '-'}</Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">{t('fields.category')}</Typography>
                            <Typography>{t(`categories.${formData.category}`)}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">{t('fields.state')}</Typography>
                            <Typography>{formData.state || '-'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">{t('fields.district')}</Typography>
                            <Typography>{formData.district || '-'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">{t('fields.constituency')}</Typography>
                            <Typography>{formData.constituency || '-'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">{t('fields.mandal')}</Typography>
                            <Typography>{formData.mandal || '-'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">{t('fields.village')}</Typography>
                            <Typography>{formData.village || '-'}</Typography>
                        </Box>
                    </Box>

                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>{t('fields.images')}</Typography>
                    <Typography>{images.length > 0 ? `${images.length} file(s) attached` : 'No media attached'}</Typography>
                </Paper>
            </Box>
        );
    };

    return (
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#fafafa', py: 4 }}>
            <Container maxWidth={false} sx={{ maxWidth: '940px', px: { xs: 2, sm: 3 } }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/${locale}/public-issues`)} sx={{ mb: 2 }}>
                    {tCommon('back')}
                </Button>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: '1px solid', borderColor: '#eadfce' }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
                        {t('submitTitle')}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        {t('submitSubtitle')}
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3 }}>
                        {t('submissionRule')}
                    </Alert>

                    {submitError && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {submitError}
                        </Alert>
                    )}

                    {submitted ? (
                        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, backgroundColor: '#fffdf8' }}>
                            <Alert severity="success" sx={{ mb: 3 }}>
                                Your issue is under review
                            </Alert>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                                Your issue is under review
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 3 }}>
                                It will stay private until a moderator reviews it. Approved issues will appear in the public issues feed after moderation.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <Button variant="contained" onClick={() => navigate(`/${locale}/public-issues`)}>
                                    Back to issues
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setSubmitted(false);
                                        setCurrentStep(0);
                                        setErrors({});
                                        setSubmitError(null);
                                        setFormData({
                                            title: '',
                                            description: '',
                                            category: 'CORRUPTION',
                                            state: STATES[0],
                                            district: '',
                                            constituency: '',
                                            mandal: '',
                                            village: '',
                                        });
                                    }}
                                >
                                    Submit another issue
                                </Button>
                            </Box>
                        </Paper>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 1 }}>
                                {STEP_LABELS.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            {renderStepContent()}

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                                    <Button variant="outlined" onClick={() => navigate(`/${locale}/public-issues`)}>{tCommon('cancel')}</Button>
                                    <Button variant="outlined" onClick={handleBack} disabled={currentStep === 0}>Back</Button>
                                </Box>

                                {currentStep < STEP_LABELS.length - 1 ? (
                                    <Button variant="contained" onClick={handleNext}>Next</Button>
                                ) : (
                                    <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                                        {submitting ? tCommon('creating') : t('submitIssue')}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}