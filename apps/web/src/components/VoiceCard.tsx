'use client';

import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { useTranslations } from 'next-intl';
import { VoiceStatusBadge, type VoiceStatusValue } from './ui/VoiceStatusBadge';

export interface VoiceCardData {
    id: string;
    title: string;
    description: string;
    category: string;
    district: string;
    constituency?: string | null;
    mandal?: string | null;
    images: string[];
    videoUrl?: string | null;
    audioUrl?: string | null;
    status: VoiceStatusValue;
    rejectionReason?: string | null;
    createdAt: string;
    submittedByUser?: { name: string } | null;
}

interface VoiceCardProps {
    voice: VoiceCardData;
    showStatus?: boolean;
    showAdminActions?: boolean;
    onOpen?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    actionLoading?: boolean;
}

export function VoiceCard({
    voice,
    showStatus = false,
    showAdminActions = false,
    onOpen,
    onApprove,
    onReject,
    actionLoading = false,
}: VoiceCardProps) {
    const t = useTranslations('voices');
    const tCommon = useTranslations('common');

    return (
        <Card
            onClick={onOpen}
            sx={{
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                cursor: onOpen ? 'pointer' : 'default',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                '&:hover': onOpen ? { transform: 'translateY(-2px)', boxShadow: '0 14px 34px rgba(0, 0, 0, 0.09)' } : {},
            }}
        >
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px 1fr' } }}>
                <Box
                    sx={{
                        position: 'relative',
                        minHeight: { xs: 180, md: '100%' },
                        background: voice.images[0]
                            ? '#f3f3f3'
                            : 'linear-gradient(135deg, #fdf3e6 0%, #fff 45%, #eef6ff 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {voice.images[0] && /^https?:\/\//i.test(voice.images[0]) ? (
                        <Image
                            src={voice.images[0]}
                            alt={voice.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 220px"
                            style={{ objectFit: 'cover' }}
                        />
                    ) : (
                        <Typography sx={{ px: 3, textAlign: 'center', fontWeight: 700, color: '#a06421' }}>
                            {t('noMedia')}
                        </Typography>
                    )}
                </Box>

                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.75 }}>
                                {voice.title}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                                <Chip
                                    label={t(`categories.${voice.category}`)}
                                    size="small"
                                    sx={{ fontWeight: 700, bgcolor: '#eef4ff', color: '#184f95' }}
                                />
                                {showStatus && <VoiceStatusBadge status={voice.status} />}
                            </Stack>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                            <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption">
                                {new Date(voice.createdAt).toLocaleDateString()}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            lineHeight: 1.7,
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {voice.description}
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2, color: 'text.secondary' }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                            <PlaceOutlinedIcon sx={{ fontSize: 18 }} />
                            <Typography variant="body2">
                                {[voice.district, voice.constituency, voice.mandal].filter(Boolean).join(', ')}
                            </Typography>
                        </Stack>

                        {(voice.videoUrl || voice.audioUrl) && (
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                                {voice.videoUrl && (
                                    <Chip icon={<VideocamOutlinedIcon />} label={t('media.video')} size="small" variant="outlined" />
                                )}
                                {voice.audioUrl && (
                                    <Chip icon={<GraphicEqOutlinedIcon />} label={t('media.audio')} size="small" variant="outlined" />
                                )}
                            </Stack>
                        )}
                    </Stack>

                    {showStatus && voice.status === 'REJECTED' && voice.rejectionReason && (
                        <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: '#fff1f1', border: '1px solid #f4c0c0' }}>
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: '#972929', mb: 0.5 }}>
                                {t('rejectionReason')}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6e2a2a' }}>
                                {voice.rejectionReason}
                            </Typography>
                        </Box>
                    )}

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            {voice.submittedByUser?.name ? `${t('submittedByLabel')}: ${voice.submittedByUser.name}` : t('anonymousSubmission')}
                        </Typography>

                        <Stack direction="row" spacing={1} onClick={(event) => event.stopPropagation()}>
                            {showAdminActions && (
                                <>
                                    <Button
                                        variant="outlined"
                                        color="success"
                                        disabled={actionLoading || voice.status === 'APPROVED'}
                                        onClick={onApprove}
                                    >
                                        {tCommon('approve')}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        disabled={actionLoading || voice.status === 'REJECTED'}
                                        onClick={onReject}
                                    >
                                        {tCommon('reject')}
                                    </Button>
                                </>
                            )}
                            <Button variant="text" onClick={onOpen}>{tCommon('view')}</Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Box>
        </Card>
    );
}