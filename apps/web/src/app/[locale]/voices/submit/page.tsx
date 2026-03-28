'use client';

import { useMutation } from '@apollo/client';
import {
    Alert,
    Box,
    Button,
    Container,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useCallback, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ANDHRA_PRADESH_CONSTITUENCIES, ANDHRA_PRADESH_DISTRICTS, STATES } from '@repo/constants';
import { ImageUploadField } from '@/components/forms/ImageUploadField';
import { CREATE_VOICE } from '@/graphql/voices';
import { useNavigate } from '@/hooks/use-navigate';
import { convertToBase64, type ImageFile } from '@/utils/file-helpers';
import { getErrorMessage } from '@/utils/error-helpers';

const MAX_MEDIA_SIZE_KB = 5120;

export default function SubmitVoicePage() {
    const t = useTranslations('voices');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const { navigate } = useNavigate();
    const videoInputRef = useRef<HTMLInputElement | null>(null);
    const audioInputRef = useRef<HTMLInputElement | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'ISSUE',
        state: STATES[0],
        district: '',
        constituency: '',
        mandal: '',
        village: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [mutationError, setMutationError] = useState<string | null>(null);
    const [images, setImages] = useState<ImageFile[]>([]);
    const [videoFile, setVideoFile] = useState<{ name: string; base64: string } | null>(null);
    const [audioFile, setAudioFile] = useState<{ name: string; base64: string } | null>(null);

    const [createVoice, { loading }] = useMutation(CREATE_VOICE);

    const handleImageChange = useCallback((nextImages: ImageFile[]) => {
        setImages(nextImages);
    }, []);

    const handleFieldChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
        if (mutationError) {
            setMutationError(null);
        }
    };

    const handleMediaFile = async (file: File, type: 'video' | 'audio') => {
        if (file.size > MAX_MEDIA_SIZE_KB * 1024) {
            setErrors((prev) => ({ ...prev, [type]: t('media.tooLarge') }));
            return;
        }

        try {
            const base64 = await convertToBase64(file);
            if (type === 'video') {
                setVideoFile({ name: file.name, base64 });
            } else {
                setAudioFile({ name: file.name, base64 });
            }
            setErrors((prev) => ({ ...prev, [type]: '' }));
        } catch {
            setErrors((prev) => ({ ...prev, [type]: t('media.readError') }));
        }
    };

    const validate = () => {
        const nextErrors: Record<string, string> = {};

        if (formData.title.trim().length < 5) {
            nextErrors.title = t('validation.title');
        }

        if (formData.description.trim().length < 20) {
            nextErrors.description = t('validation.description');
        }

        if (!formData.district) {
            nextErrors.district = t('validation.district');
        }

        if (!formData.constituency) {
            nextErrors.constituency = t('validation.constituency');
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setMutationError(null);

        if (!validate()) {
            return;
        }

        try {
            await createVoice({
                variables: {
                    input: {
                        ...formData,
                        images: images.map((image) => image.base64),
                        videoUrl: videoFile?.base64,
                        audioUrl: audioFile?.base64,
                    },
                },
            });

            images.forEach((image) => URL.revokeObjectURL(image.preview));
            navigate(`/${locale}/voices`);
        } catch (error) {
            setMutationError(getErrorMessage(error));
        }
    };

    return (
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#fafafa', py: 4 }}>
            <Container maxWidth={false} sx={{ maxWidth: '940px', px: { xs: 2, sm: 3 } }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/${locale}/voices`)} sx={{ mb: 2 }}>
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

                    {mutationError && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {mutationError}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                            minRows={6}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                            <TextField select label={t('fields.category')} value={formData.category} onChange={(event) => handleFieldChange('category', event.target.value)} size="small">
                                {['ISSUE', 'OPINION', 'SUGGESTION', 'COMPLAINT', 'FEEDBACK', 'OTHER'].map((category) => (
                                    <MenuItem key={category} value={category}>{t(`categories.${category}`)}</MenuItem>
                                ))}
                            </TextField>

                            <TextField select label={t('fields.state')} value={formData.state} onChange={(event) => handleFieldChange('state', event.target.value)} size="small">
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

                            <TextField
                                select
                                label={t('fields.constituency')}
                                value={formData.constituency}
                                onChange={(event) => handleFieldChange('constituency', event.target.value)}
                                error={!!errors.constituency}
                                helperText={errors.constituency}
                                size="small"
                            >
                                {ANDHRA_PRADESH_CONSTITUENCIES.map((constituency) => <MenuItem key={constituency} value={constituency}>{constituency}</MenuItem>)}
                            </TextField>

                            <TextField label={t('fields.mandal')} value={formData.mandal} onChange={(event) => handleFieldChange('mandal', event.target.value)} size="small" />
                            <TextField label={t('fields.village')} value={formData.village} onChange={(event) => handleFieldChange('village', event.target.value)} size="small" />
                        </Box>

                        <ImageUploadField label={t('fields.images')} maxImages={2} maxSizeKB={500} onChange={handleImageChange} />

                        <Stack spacing={2}>
                            <Box>
                                <input
                                    ref={videoInputRef}
                                    type="file"
                                    accept="video/*"
                                    hidden
                                    onChange={async (event) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                            await handleMediaFile(file, 'video');
                                        }
                                    }}
                                />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                                    <Button variant="outlined" startIcon={<AttachFileOutlinedIcon />} onClick={() => videoInputRef.current?.click()}>
                                        {t('fields.video')}
                                    </Button>
                                    {videoFile && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="body2">{videoFile.name}</Typography>
                                            <Button color="error" size="small" startIcon={<DeleteOutlineIcon />} onClick={() => setVideoFile(null)}>
                                                {tCommon('delete')}
                                            </Button>
                                        </Stack>
                                    )}
                                </Stack>
                                {errors.video && <Typography color="error" variant="caption">{errors.video}</Typography>}
                            </Box>

                            <Box>
                                <input
                                    ref={audioInputRef}
                                    type="file"
                                    accept="audio/*"
                                    hidden
                                    onChange={async (event) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                            await handleMediaFile(file, 'audio');
                                        }
                                    }}
                                />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                                    <Button variant="outlined" startIcon={<AttachFileOutlinedIcon />} onClick={() => audioInputRef.current?.click()}>
                                        {t('fields.audio')}
                                    </Button>
                                    {audioFile && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="body2">{audioFile.name}</Typography>
                                            <Button color="error" size="small" startIcon={<DeleteOutlineIcon />} onClick={() => setAudioFile(null)}>
                                                {tCommon('delete')}
                                            </Button>
                                        </Stack>
                                    )}
                                </Stack>
                                {errors.audio && <Typography color="error" variant="caption">{errors.audio}</Typography>}
                            </Box>
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
                            <Button variant="outlined" onClick={() => navigate(`/${locale}/voices`)}>{tCommon('cancel')}</Button>
                            <Button type="submit" variant="contained" disabled={loading}>
                                {loading ? tCommon('creating') : t('submitVoice')}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}