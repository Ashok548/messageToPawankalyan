'use client';

import { useQuery } from '@apollo/client';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Grid,
    Stack,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Image from 'next/image';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { useLocale, useTranslations } from 'next-intl';
import { VoiceStatusBadge } from '@/components/ui/VoiceStatusBadge';
import { GET_VOICE } from '@/graphql/voices';
import { useNavigate } from '@/hooks/use-navigate';

export default function VoiceDetailPage({ params }: { params: { id: string } }) {
    const t = useTranslations('voices');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const { navigate } = useNavigate();
    const { data, loading, error } = useQuery(GET_VOICE, {
        variables: { id: params.id },
        fetchPolicy: 'cache-and-network',
    });

    const voice = data?.voice;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !voice) {
        return (
            <Container maxWidth={false} sx={{ maxWidth: '1080px', py: 4 }}>
                <Alert severity="error">{error?.message || t('detailNotFound')}</Alert>
            </Container>
        );
    }

    const locationParts = [voice.state, voice.district, voice.constituency, voice.mandal, voice.village].filter(Boolean);

    return (
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#fafafa', py: 4 }}>
            <Container maxWidth={false} sx={{ maxWidth: '1080px', px: { xs: 2, sm: 3 } }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/${locale}/voices`)} sx={{ mb: 2 }}>
                    {tCommon('back')}
                </Button>

                <Card sx={{ borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
                    <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 2.5 }}>
                            <Box>
                                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', rowGap: 1 }}>
                                    <Chip label={t(`categories.${voice.category}`)} sx={{ fontWeight: 700, bgcolor: '#eef4ff', color: '#184f95' }} />
                                    <VoiceStatusBadge status={voice.status} />
                                </Stack>
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 900, lineHeight: 1.1, mb: 1.25 }}>
                                    {voice.title}
                                </Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ color: 'text.secondary' }}>
                                    <Stack direction="row" spacing={0.75} alignItems="center">
                                        <PlaceOutlinedIcon sx={{ fontSize: 18 }} />
                                        <Typography variant="body2">{locationParts.join(', ')}</Typography>
                                    </Stack>
                                    <Typography variant="body2">{new Date(voice.createdAt).toLocaleString()}</Typography>
                                </Stack>
                            </Box>

                            <Box sx={{ minWidth: { md: 220 } }}>
                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
                                    {t('submittedByLabel')}
                                </Typography>
                                <Typography sx={{ fontWeight: 700 }}>{voice.submittedByUser?.name || t('anonymousSubmission')}</Typography>
                                {voice.reviewedByUser?.name && (
                                    <>
                                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 1.5, mb: 0.5 }}>
                                            {t('reviewedByLabel')}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 700 }}>{voice.reviewedByUser.name}</Typography>
                                    </>
                                )}
                            </Box>
                        </Stack>

                        <Typography sx={{ lineHeight: 1.9, color: '#253041', whiteSpace: 'pre-wrap', mb: 3 }}>
                            {voice.description}
                        </Typography>

                        {voice.rejectionReason && (
                            <Alert severity="warning" sx={{ mb: 3 }}>
                                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{t('rejectionReason')}</Typography>
                                <Typography>{voice.rejectionReason}</Typography>
                            </Alert>
                        )}

                        {voice.adminNotes && (
                            <Alert severity="info" sx={{ mb: 3 }}>
                                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{t('adminNotes')}</Typography>
                                <Typography>{voice.adminNotes}</Typography>
                            </Alert>
                        )}

                        {voice.images?.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>{tCommon('gallery')}</Typography>
                                <Grid container spacing={2}>
                                    {voice.images.map((image: string, index: number) => (
                                        <Grid item xs={12} sm={6} md={4} key={image}>
                                            <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', minHeight: 240, bgcolor: '#f2f2f2' }}>
                                                <Image src={image} alt={`${voice.title}-${index + 1}`} fill sizes="(max-width: 900px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {(voice.videoUrl || voice.audioUrl) && (
                            <Grid container spacing={2}>
                                {voice.videoUrl && (
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: '#fffdf9' }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
                                                <VideocamOutlinedIcon sx={{ color: '#c26b00' }} />
                                                <Typography sx={{ fontWeight: 800 }}>{t('media.video')}</Typography>
                                            </Stack>
                                            <Box component="video" controls src={voice.videoUrl} sx={{ width: '100%', borderRadius: 2 }} />
                                        </Box>
                                    </Grid>
                                )}
                                {voice.audioUrl && (
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: '#fbfbff' }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
                                                <GraphicEqOutlinedIcon sx={{ color: '#205b9d' }} />
                                                <Typography sx={{ fontWeight: 800 }}>{t('media.audio')}</Typography>
                                            </Stack>
                                            <Box component="audio" controls src={voice.audioUrl} sx={{ width: '100%' }} />
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        )}
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}