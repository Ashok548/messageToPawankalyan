'use client';

import type { ReactNode } from 'react';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import Image from 'next/image';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import { useTranslations } from 'next-intl';

type PublicIssuePriorityValue = 'NORMAL' | 'NOTABLE' | 'HIGH';
type PublicIssueVerificationValue = 'UNVERIFIED' | 'BASIC_REVIEWED' | 'STRONG_EVIDENCE';

const PRIORITY_CHIP_STYLES: Record<PublicIssuePriorityValue, { color: string; bg: string; border: string }> = {
    NORMAL: { color: '#475569', bg: '#f8fafc', border: '#cbd5e1' },
    NOTABLE: { color: '#9a3412', bg: '#fff7ed', border: '#fdba74' },
    HIGH: { color: '#b42318', bg: '#fef3f2', border: '#fda29b' },
};

const VERIFICATION_CHIP_STYLES: Record<PublicIssueVerificationValue, { color: string; bg: string; border: string }> = {
    UNVERIFIED: { color: '#6b7280', bg: '#f9fafb', border: '#d1d5db' },
    BASIC_REVIEWED: { color: '#92400e', bg: '#fffbeb', border: '#fcd34d' },
    STRONG_EVIDENCE: { color: '#166534', bg: '#f0fdf4', border: '#86efac' },
};

export interface PublicIssueCardData {
    id: string;
    title: string;
    description: string;
    category: string;
    state: string;
    district: string;
    constituency?: string | null;
    mandal?: string | null;
    village?: string | null;
    images: string[];
    createdAt: string;
    supportCount: number;
    isHighPriority: boolean;
    priority: PublicIssuePriorityValue;
    verificationStatus: PublicIssueVerificationValue;
    hasUserSupported?: boolean;
}

interface PublicIssueCardProps {
    issue: PublicIssueCardData;
    onOpen?: () => void;
    onSupport?: (e: React.MouseEvent) => void;
    hideSupportButton?: boolean;
    supportButtonDisabled?: boolean;
    footerActions?: ReactNode;
}

export function PublicIssueCard({ issue, onOpen, onSupport, hideSupportButton = false, supportButtonDisabled = false, footerActions }: PublicIssueCardProps) {
    const t = useTranslations('publicIssues');
    const tCommon = useTranslations('common');
    const priorityStyle = PRIORITY_CHIP_STYLES[issue.priority] ?? PRIORITY_CHIP_STYLES.NORMAL;
    const verificationStyle = VERIFICATION_CHIP_STYLES[issue.verificationStatus] ?? VERIFICATION_CHIP_STYLES.UNVERIFIED;

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
                        background: issue.images[0]
                            ? '#f3f3f3'
                            : 'linear-gradient(135deg, #fff3e6 0%, #fff 45%, #edf7f0 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {issue.images[0] && /^https?:\/\//i.test(issue.images[0]) ? (
                        <Image
                            src={issue.images[0]}
                            alt={issue.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 220px"
                            style={{ objectFit: 'cover' }}
                        />
                    ) : (
                        <Typography sx={{ px: 3, textAlign: 'center', fontWeight: 700, color: '#a06421' }}>
                            {t('noEvidence')}
                        </Typography>
                    )}
                </Box>

                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.75 }}>
                                {issue.title}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                                <Chip
                                    label={t(`categories.${issue.category}`)}
                                    size="small"
                                    sx={{ fontWeight: 700, bgcolor: '#eef4ff', color: '#184f95' }}
                                />
                                <Chip
                                    icon={<PriorityHighOutlinedIcon />}
                                    label={issue.isHighPriority ? t('priority.high') : t(`priority.${issue.priority}`)}
                                    size="small"
                                    sx={{
                                        fontWeight: 700,
                                        color: priorityStyle.color,
                                        backgroundColor: priorityStyle.bg,
                                        border: '1px solid',
                                        borderColor: priorityStyle.border,
                                        '& .MuiChip-icon': { color: priorityStyle.color },
                                    }}
                                />
                                <Chip
                                    icon={<VerifiedOutlinedIcon />}
                                    label={t(`verification.${issue.verificationStatus}`)}
                                    size="small"
                                    sx={{
                                        fontWeight: 700,
                                        color: verificationStyle.color,
                                        backgroundColor: verificationStyle.bg,
                                        border: '1px solid',
                                        borderColor: verificationStyle.border,
                                        '& .MuiChip-icon': { color: verificationStyle.color },
                                    }}
                                />
                            </Stack>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                            <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption">
                                {new Date(issue.createdAt).toLocaleDateString()}
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
                        {issue.description}
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2, color: 'text.secondary' }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                            <PlaceOutlinedIcon sx={{ fontSize: 18 }} />
                            <Typography variant="body2">
                                {[issue.state, issue.district, issue.constituency, issue.mandal, issue.village].filter(Boolean).join(', ')}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            {`${t('submittedByLabel')}: ${t('anonymousSubmission')}`}
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center">
                            {!hideSupportButton && (
                                <Button
                                    variant={issue.hasUserSupported ? 'contained' : 'outlined'}
                                    size="small"
                                    startIcon={issue.hasUserSupported ? <ThumbUpAltIcon fontSize="small" /> : <ThumbUpAltOutlinedIcon fontSize="small" />}
                                    onClick={(e) => { e.stopPropagation(); onSupport?.(e); }}
                                    disabled={supportButtonDisabled}
                                    color={issue.hasUserSupported ? 'primary' : 'inherit'}
                                    sx={{ minWidth: 0 }}
                                >
                                    {issue.supportCount > 0
                                        ? t('supportersCount', { count: issue.supportCount })
                                        : t('support')
                                    }
                                </Button>
                            )}
                            <Button variant="text" onClick={onOpen}>{tCommon('view')}</Button>
                        </Stack>
                    </Stack>

                    {footerActions && (
                        <Box sx={{ mt: 2 }} onClick={(event) => event.stopPropagation()}>
                            {footerActions}
                        </Box>
                    )}
                </CardContent>
            </Box>
        </Card>
    );
}