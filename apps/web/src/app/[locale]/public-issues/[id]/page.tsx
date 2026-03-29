'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import Link from 'next/link';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ANDHRA_PRADESH_DISTRICTS, STATES } from '@repo/constants';
import ImageLightbox from '@/components/ui/image-lightbox';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from '@/hooks/use-navigate';
import { usePublicIssue, useUpdatePublicIssue, useUpdatePublicIssueStatus, useTogglePublicIssueSupport, useIssueAnalyses, useCreateAnalysis } from '@/hooks/use-public-issues';
import { getAnonymousPublicIssueSupporterKey, hasSupportedPublicIssue, markPublicIssueSupported } from '@/lib/public-issue-support-storage';
import { getErrorMessage } from '@/utils/error-helpers';

const CATEGORY_OPTIONS = ['CORRUPTION', 'LAND_MAFIA', 'INDUSTRIAL_POLLUTION', 'POLICY_CONCERN', 'PUBLIC_SERVICES', 'INFRASTRUCTURE', 'OTHER'] as const;
const PRIORITY_OPTIONS = ['NORMAL', 'NOTABLE', 'HIGH'] as const;
const VERIFICATION_OPTIONS = ['UNVERIFIED', 'BASIC_REVIEWED', 'STRONG_EVIDENCE'] as const;
const NOTABLE_THRESHOLD = 10;
const HIGH_THRESHOLD = 50;
const SUPPORTABLE_STATUSES = new Set(['APPROVED', 'TAKEN_UP', 'IN_PROGRESS', 'RESOLVED']);

type SupportState = {
    supportCount: number;
    hasUserSupported: boolean;
    priority: 'NORMAL' | 'NOTABLE' | 'HIGH';
    isHighPriority: boolean;
};

type AnalysisItem = {
    id: string;
    issueId: string;
    problemUnderstanding: string;
    impact: string;
    observations: string;
    considerations?: string | null;
    createdAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdByUser?: {
        id: string;
        name: string;
        role: string;
    } | null;
};

type AnalysisFormState = {
    problemUnderstanding: string;
    impact: string;
    observations: string;
    considerations: string;
};

type VerificationStatusValue = typeof VERIFICATION_OPTIONS[number];

function computePriority(count: number): SupportState['priority'] {
    if (count >= HIGH_THRESHOLD) {
        return 'HIGH';
    }

    if (count >= NOTABLE_THRESHOLD) {
        return 'NOTABLE';
    }

    return 'NORMAL';
}



export default function PublicIssueDetailPage({ params }: { params: { id: string } }) {
    const t = useTranslations('publicIssues');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const { navigate } = useNavigate();
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const canSubmitAnalysis = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const [dialogMode, setDialogMode] = useState<'edit' | 'reject' | null>(null);
    const [adminError, setAdminError] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [supportState, setSupportState] = useState<SupportState | null>(null);
    const [supportSubmitting, setSupportSubmitting] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedPriority, setSelectedPriority] = useState<SupportState['priority']>('NORMAL');
    const [selectedVerificationStatus, setSelectedVerificationStatus] = useState<VerificationStatusValue>('UNVERIFIED');
    const [adminUpdateMode, setAdminUpdateMode] = useState<'priority' | 'verification' | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisSubmitted, setAnalysisSubmitted] = useState(false);
    const [analysisFieldErrors, setAnalysisFieldErrors] = useState<Partial<Record<keyof AnalysisFormState, string>>>({});
    const [analysisForm, setAnalysisForm] = useState<AnalysisFormState>({
        problemUnderstanding: '',
        impact: '',
        observations: '',
        considerations: '',
    });

    const [analysisSubmittedAsLive, setAnalysisSubmittedAsLive] = useState(false);

    const { issue, loading, error, refetch } = usePublicIssue(params.id);
    const { updatePublicIssue, loading: updatingIssue } = useUpdatePublicIssue();
    const { updatePublicIssueStatus, loading: updatingStatus } = useUpdatePublicIssueStatus();
    const { toggleSupport } = useTogglePublicIssueSupport();
    const { analyses, loading: analysisLoading, refetch: refetchAnalyses } = useIssueAnalyses(params.id);
    const { createAnalysis, loading: analysisSubmitting } = useCreateAnalysis();

    useEffect(() => {
        if (issue) {
            setEditForm({
                title: issue.title,
                description: issue.description,
                category: issue.category,
                state: issue.state,
                district: issue.district,
                constituency: issue.constituency || '',
                mandal: issue.mandal || '',
                village: issue.village || '',
                adminNotes: issue.adminNotes || '',
            });
            setRejectionReason(issue.rejectionReason || '');
        }
    }, [issue]);

    useEffect(() => {
        if (issue) {
            const locallySupported = hasSupportedPublicIssue(issue.id);
            setSupportState({
                supportCount: issue.supportCount,
                hasUserSupported: issue.hasUserSupported || locallySupported,
                priority: issue.priority,
                isHighPriority: issue.isHighPriority,
            });
            setSelectedPriority(issue.priority);
            setSelectedVerificationStatus(issue.verificationStatus);
        }
    }, [issue]);

    const locationParts = useMemo(() => (
        [issue?.state, issue?.district, issue?.constituency, issue?.mandal, issue?.village].filter(Boolean)
    ), [issue]);

    const validateAnalysisForm = (): boolean => {
        const nextErrors: Partial<Record<keyof AnalysisFormState, string>> = {};

        if (analysisForm.problemUnderstanding.trim().length < 20) {
            nextErrors.problemUnderstanding = t('analysis.validation.problemUnderstanding');
        }

        if (analysisForm.impact.trim().length < 20) {
            nextErrors.impact = t('analysis.validation.impact');
        }

        if (analysisForm.observations.trim().length < 20) {
            nextErrors.observations = t('analysis.validation.observations');
        }

        setAnalysisFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleAnalysisFieldChange = (field: keyof AnalysisFormState, value: string) => {
        setAnalysisForm((current) => ({
            ...current,
            [field]: value,
        }));
        setAnalysisSubmitted(false);

        if (analysisFieldErrors[field]) {
            setAnalysisFieldErrors((current) => ({
                ...current,
                [field]: undefined,
            }));
        }
    };

    const handleApprove = async () => {
        if (!issue) {
            return;
        }

        setAdminError(null);
        try {
            await updatePublicIssueStatus({
                variables: {
                    id: issue.id,
                    input: {
                        status: 'APPROVED',
                        adminNotes: editForm?.adminNotes || undefined,
                    },
                },
            });
            await refetch();
        } catch (mutationError) {
            setAdminError(getErrorMessage(mutationError));
        }
    };

    const handleReject = async () => {
        if (!issue) {
            return;
        }

        setAdminError(null);
        try {
            await updatePublicIssueStatus({
                variables: {
                    id: issue.id,
                    input: {
                        status: 'REJECTED',
                        rejectionReason,
                        adminNotes: editForm?.adminNotes || undefined,
                    },
                },
            });
            setDialogMode(null);
            await refetch();
        } catch (mutationError) {
            setAdminError(getErrorMessage(mutationError));
        }
    };

    const handleSave = async () => {
        if (!issue || !editForm) {
            return;
        }

        setAdminError(null);
        try {
            await updatePublicIssue({
                variables: {
                    id: issue.id,
                    input: {
                        title: editForm.title,
                        description: editForm.description,
                        category: editForm.category,
                        state: editForm.state,
                        district: editForm.district,
                        constituency: editForm.constituency || undefined,
                        mandal: editForm.mandal || undefined,
                        village: editForm.village || undefined,
                        adminNotes: editForm.adminNotes || undefined,
                    },
                },
            });
            setDialogMode(null);
            await refetch();
        } catch (mutationError) {
            setAdminError(getErrorMessage(mutationError));
        }
    };

    const handleToggleSupport = async () => {
        if (!issue) {
            return;
        }

        const alreadySupported = hasSupportedPublicIssue(issue.id) || supportState?.hasUserSupported || issue.hasUserSupported;

        if (alreadySupported) {
            return;
        }

        const previousState: SupportState = supportState ?? {
            supportCount: issue.supportCount,
            hasUserSupported: issue.hasUserSupported,
            priority: issue.priority,
            isHighPriority: issue.isHighPriority,
        };

        const nextSupportCount = previousState.supportCount + 1;
        const nextPriority = computePriority(nextSupportCount);
        const optimisticState: SupportState = {
            supportCount: nextSupportCount,
            hasUserSupported: true,
            priority: nextPriority,
            isHighPriority: nextSupportCount >= HIGH_THRESHOLD,
        };

        setAdminError(null);
        setSupportSubmitting(true);
        setSupportState(optimisticState);

        try {
            const result = await toggleSupport({
                variables: {
                    id: issue.id,
                    anonymousSupporterKey: user ? undefined : getAnonymousPublicIssueSupporterKey(),
                },
            });
            const updatedIssue = result.data?.togglePublicIssueSupport;
            if (updatedIssue) {
                markPublicIssueSupported(issue.id);
                setSupportState({
                    supportCount: updatedIssue.supportCount,
                    hasUserSupported: true,
                    priority: updatedIssue.priority,
                    isHighPriority: updatedIssue.isHighPriority,
                });
            }
        } catch (mutationError) {
            setSupportState(previousState);
            setAdminError(getErrorMessage(mutationError));
        } finally {
            setSupportSubmitting(false);
        }
    };

    const handlePriorityChange = async (priority: SupportState['priority']) => {
        if (!issue || !isSuperAdmin) {
            return;
        }

        const previousPriority = selectedPriority;

        setAdminError(null);
        setSelectedPriority(priority);
        setAdminUpdateMode('priority');

        try {
            await updatePublicIssue({ variables: { id: issue.id, input: { priority } } });
            setSupportState((current) => current
                ? { ...current, priority, isHighPriority: priority === 'HIGH' }
                : current);
            await refetch();
        } catch (updateError) {
            setSelectedPriority(previousPriority);
            setAdminError(getErrorMessage(updateError));
        } finally {
            setAdminUpdateMode(null);
        }
    };

    const handleVerificationStatusChange = async (verificationStatus: VerificationStatusValue) => {
        if (!issue || !isSuperAdmin) {
            return;
        }

        const previousStatus = selectedVerificationStatus;

        setAdminError(null);
        setSelectedVerificationStatus(verificationStatus);
        setAdminUpdateMode('verification');

        try {
            await updatePublicIssue({ variables: { id: issue.id, input: { verificationStatus } } });
            await refetch();
        } catch (updateError) {
            setSelectedVerificationStatus(previousStatus);
            setAdminError(getErrorMessage(updateError));
        } finally {
            setAdminUpdateMode(null);
        }
    };

    const handleOpenLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const handleAnalysisSubmit = async () => {
        if (!validateAnalysisForm()) {
            return;
        }

        setAnalysisError(null);
        setAnalysisSubmitted(false);

        try {
            await createAnalysis({
                variables: {
                    input: {
                        issueId: params.id,
                        problemUnderstanding: analysisForm.problemUnderstanding.trim(),
                        impact: analysisForm.impact.trim(),
                        observations: analysisForm.observations.trim(),
                        considerations: analysisForm.considerations.trim() || undefined,
                    },
                },
            });

            if (isSuperAdmin) {
                // SUPER_ADMIN submissions are auto-approved — reload list so insight appears immediately
                setAnalysisSubmittedAsLive(true);
                await refetchAnalyses();
            } else {
                setAnalysisSubmitted(true);
            }

            setAnalysisForm({
                problemUnderstanding: '',
                impact: '',
                observations: '',
                considerations: '',
            });
            setAnalysisFieldErrors({});
        } catch (submitError) {
            setAnalysisError(getErrorMessage(submitError));
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !issue) {
        return (
            <Container maxWidth={false} sx={{ maxWidth: '1080px', py: 4 }}>
                <Alert severity="error">{error?.message || t('detailNotFound')}</Alert>
            </Container>
        );
    }

    const currentSupportCount = supportState?.supportCount ?? issue.supportCount;
    const hasUserSupported = supportState?.hasUserSupported ?? issue.hasUserSupported;
    const currentPriority = supportState?.priority ?? issue.priority;
    const isSupportable = SUPPORTABLE_STATUSES.has(issue.status);
    const currentVerificationStatus = selectedVerificationStatus ?? issue.verificationStatus;
    const formattedSupportCount = new Intl.NumberFormat(locale).format(currentSupportCount);
    const formattedCreatedAt = new Date(issue.createdAt).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    const visibleImages = issue.images?.slice(0, 4) ?? [];
    const hiddenImageCount = Math.max((issue.images?.length ?? 0) - visibleImages.length, 0);
    const hasMoreImages = (issue.images?.length ?? 0) > visibleImages.length;
    const analysisBadgeLabel = (analysis: AnalysisItem) => (
        analysis.createdByUser?.role === 'ADMIN' || analysis.createdByUser?.role === 'SUPER_ADMIN'
            ? t('adminLabel')
            : t('verifiedLabel')
    );

    return (
        <Box component="main" sx={{ backgroundColor: '#ffffff', minHeight: '100vh', py: 4 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
                {/* Breadcrumbs */}
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, fontSize: '0.9rem' }}>
                    <Link href={`/${locale}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                        {tCommon('home')}
                    </Link>
                    <Link href={`/${locale}/public-issues`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                        {t('title')}
                    </Link>
                    <Typography color="text.primary" sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {issue.title}
                    </Typography>
                </Breadcrumbs>

                {/* Main Heading with Admin Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #a2a9b1', pb: 1, mb: 3 }}>
                    <Typography component="h1" variant="h3" sx={{
                        fontFamily: '"Linux Libertine", "Georgia", "Times", serif',
                        fontWeight: 400,
                        flex: 1,
                    }}>
                        {issue.title}
                    </Typography>

                    {isSuperAdmin && (
                        <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleOutlineIcon />}
                                onClick={handleApprove}
                                disabled={updatingStatus || issue.status === 'APPROVED'}
                                sx={{ whiteSpace: 'nowrap' }}
                            >
                                {tCommon('approve')}
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CancelOutlinedIcon />}
                                onClick={() => setDialogMode('reject')}
                                disabled={updatingStatus || issue.status === 'REJECTED'}
                                sx={{ whiteSpace: 'nowrap' }}
                            >
                                {tCommon('reject')}
                            </Button>
                            <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setDialogMode('edit')} sx={{ whiteSpace: 'nowrap' }}>
                                {tCommon('edit')}
                            </Button>
                        </Stack>
                    )}
                </Box>

                {adminError && <Alert severity="error" sx={{ mb: 3 }}>{adminError}</Alert>}

                <Grid container spacing={{ xs: 3, lg: 4 }} alignItems="flex-start">
                    <Grid item xs={12} lg={isSuperAdmin ? 8 : 12}>
                        <Stack spacing={3}>
                            <Card sx={{ borderRadius: 5, border: '1px solid #e4e8ee', boxShadow: '0 18px 50px rgba(15, 23, 42, 0.06)' }}>
                                <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
                                    <Stack spacing={2.5}>
                                        <Box>
                                            {/* Row 1: chips left, support button right */}
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1.5 }}>
                                                <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', rowGap: 0.75 }}>
                                                    <Chip label={t(`categories.${issue.category}`)} size="small" sx={{ fontWeight: 700, color: '#1f4d8f', bgcolor: '#eef4ff', borderRadius: 2 }} />
                                                    <Chip label={t(`status.${issue.status}`)} size="small" sx={{ fontWeight: 700, color: '#2d5b43', bgcolor: '#edf6ef', borderRadius: 2 }} />
                                                    <Chip label={t(`priority.${currentPriority}`)} size="small" sx={{ fontWeight: 700, color: '#6c4d12', bgcolor: '#fff3d9', borderRadius: 2 }} />
                                                    <Chip label={t(`verification.${currentVerificationStatus}`)} size="small" variant="outlined" sx={{ fontWeight: 700, borderColor: '#c9d4e4', color: '#314665', bgcolor: '#f9fbfd', borderRadius: 2 }} />
                                                </Stack>
                                                <Button
                                                    variant={hasUserSupported ? 'contained' : 'outlined'}
                                                    size="small"
                                                    startIcon={hasUserSupported ? <ThumbUpAltIcon /> : <ThumbUpAltOutlinedIcon />}
                                                    onClick={handleToggleSupport}
                                                    disabled={!isSupportable || supportSubmitting || hasUserSupported}
                                                    sx={{ fontWeight: 700, flexShrink: 0 }}
                                                >
                                                    {hasUserSupported ? `${t('supported')} (${formattedSupportCount})` : `${t('support')} (${formattedSupportCount})`}
                                                </Button>
                                            </Stack>

                                            {/* Row 2: location · date · submitted by · approved by */}
                                            <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" sx={{ color: 'text.secondary', rowGap: 0.5 }}>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <PlaceOutlinedIcon sx={{ fontSize: 16 }} />
                                                    <Typography variant="body2">{locationParts.join(', ')}</Typography>
                                                </Stack>
                                                <Typography variant="body2" sx={{ color: 'text.disabled' }}>·</Typography>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <AccessTimeOutlinedIcon sx={{ fontSize: 16 }} />
                                                    <Typography variant="body2">{formattedCreatedAt}</Typography>
                                                </Stack>
                                                <Typography variant="body2" sx={{ color: 'text.disabled' }}>·</Typography>
                                                <Typography variant="body2">
                                                    <Box component="span" sx={{ fontWeight: 600, color: '#1c2940' }}>{t('submittedByLabel')}:</Box>{' '}
                                                    {t('anonymousSubmission')}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.disabled' }}>·</Typography>
                                                <Typography variant="body2">
                                                    <Box component="span" sx={{ fontWeight: 600, color: '#1c2940' }}>{t('reviewedByLabel')}:</Box>{' '}
                                                    {issue.reviewedAt ? t('superAdminLabel') : '-'}
                                                </Typography>
                                            </Stack>
                                        </Box>

                                        <Divider />

                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1f2f46', mb: 1.25 }}>
                                                {t('aboutTitle')}
                                            </Typography>
                                            <Typography sx={{ lineHeight: 1.9, color: '#253041', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                                {issue.description}
                                            </Typography>
                                        </Box>

                                        {issue.rejectionReason && (
                                            <Alert severity="warning">
                                                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{t('rejectionReason')}</Typography>
                                                <Typography>{issue.rejectionReason}</Typography>
                                            </Alert>
                                        )}

                                        {issue.adminNotes && isSuperAdmin && (
                                            <Alert severity="info">
                                                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{t('adminNotes')}</Typography>
                                                <Typography>{issue.adminNotes}</Typography>
                                            </Alert>
                                        )}

                                        <Box>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1.75 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1f2f46' }}>
                                                    {t('evidenceTitle')}
                                                </Typography>
                                                {hasMoreImages && (
                                                    <Button variant="outlined" size="small" onClick={() => handleOpenLightbox(0)} sx={{ fontWeight: 700 }}>
                                                        {t('viewAllEvidence')}
                                                    </Button>
                                                )}
                                            </Stack>

                                            {visibleImages.length > 0 ? (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {visibleImages.map((image: string, index: number) => (
                                                        <Box
                                                            key={image}
                                                            onClick={() => handleOpenLightbox(index)}
                                                            sx={{
                                                                position: 'relative',
                                                                width: 80,
                                                                height: 80,
                                                                borderRadius: 2,
                                                                overflow: 'hidden',
                                                                border: '1px solid #e5e7eb',
                                                                cursor: 'pointer',
                                                                bgcolor: '#e9edf2',
                                                                flexShrink: 0,
                                                                '&:hover': { opacity: 0.85, borderColor: '#1976d2' },
                                                                transition: 'opacity 0.15s, border-color 0.15s',
                                                            }}
                                                        >
                                                            <Image src={image} alt={`${issue.title}-${index + 1}`} fill sizes="80px" style={{ objectFit: 'cover' }} />
                                                            {hasMoreImages && index === visibleImages.length - 1 && hiddenImageCount > 0 && (
                                                                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(15, 23, 42, 0.58)', color: '#fff', backdropFilter: 'blur(2px)' }}>
                                                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 800 }}>
                                                                        +{hiddenImageCount}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Alert severity="info">{t('noEvidence')}</Alert>
                                            )}
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>

                        </Stack>
                    </Grid>

                    {isSuperAdmin && (
                        <Grid item xs={12} lg={4}>
                            <Stack spacing={3} sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
                                <Card sx={{ borderRadius: 4, border: '1px solid #e4e8ee', boxShadow: '0 14px 36px rgba(15, 23, 42, 0.05)' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1f2f46', mb: 2.5 }}>
                                            {t('adminControlsTitle')}
                                        </Typography>

                                        <Stack spacing={2}>
                                            <TextField
                                                select
                                                size="small"
                                                label={t('admin.priorityField')}
                                                value={selectedPriority}
                                                onChange={(event) => void handlePriorityChange(event.target.value as SupportState['priority'])}
                                                disabled={adminUpdateMode === 'priority'}
                                                fullWidth
                                            >
                                                {PRIORITY_OPTIONS.map((priority) => (
                                                    <MenuItem key={priority} value={priority}>{t(`priority.${priority}`)}</MenuItem>
                                                ))}
                                            </TextField>
                                            <TextField
                                                select
                                                size="small"
                                                label={t('admin.verificationField')}
                                                value={selectedVerificationStatus}
                                                onChange={(event) => void handleVerificationStatusChange(event.target.value as VerificationStatusValue)}
                                                disabled={adminUpdateMode === 'verification'}
                                                fullWidth
                                            >
                                                {VERIFICATION_OPTIONS.map((verificationStatus) => (
                                                    <MenuItem key={verificationStatus} value={verificationStatus}>{t(`verification.${verificationStatus}`)}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Stack>
                        </Grid>
                    )}
                </Grid>

                <Box sx={{ mt: 3 }}>
                    <Card sx={{ borderRadius: 4, boxShadow: '0 8px 28px rgba(0,0,0,0.05)' }}>
                        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 3 }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.75 }}>{t('analysis.title')}</Typography>
                                    <Typography color="text.secondary">{t('analysis.subtitle')}</Typography>
                                </Box>
                                {canSubmitAnalysis && (
                                    <Chip label={t('analysis.restrictedBadge')} variant="outlined" sx={{ fontWeight: 700, alignSelf: { xs: 'flex-start', md: 'center' } }} />
                                )}
                            </Stack>

                            {analysisError && <Alert severity="error" sx={{ mb: 2 }}>{analysisError}</Alert>}
                            {analysisSubmitted && <Alert severity="success" sx={{ mb: 2 }}>{t('analysis.underReview')}</Alert>}
                            {analysisSubmittedAsLive && <Alert severity="success" sx={{ mb: 2 }}>{t('analysis.publishedLive')}</Alert>}

                            {analysisLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress size={28} />
                                </Box>
                            ) : analyses.length === 0 ? (
                                <Alert severity="info" sx={{ mb: canSubmitAnalysis ? 3 : 0 }}>{t('analysis.empty')}</Alert>
                            ) : (
                                <Stack spacing={2} sx={{ mb: canSubmitAnalysis ? 3 : 0 }}>
                                    {(analyses as AnalysisItem[]).map((analysis) => {
                                        const summary = analysis.problemUnderstanding.length > 140
                                            ? `${analysis.problemUnderstanding.slice(0, 140).trimEnd()}...`
                                            : analysis.problemUnderstanding;

                                        return (
                                            <Card key={analysis.id} variant="outlined" sx={{ borderRadius: 3, backgroundColor: '#fcfcfd' }}>
                                                <CardContent>
                                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" sx={{ mb: 2 }}>
                                                        <Box>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.4, color: '#223047', mb: 0.5 }}>
                                                                {summary}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {t('analysis.byline', { date: new Date(analysis.createdAt).toLocaleDateString(locale) })}
                                                            </Typography>
                                                        </Box>
                                                        <Chip label={analysisBadgeLabel(analysis)} color="success" size="small" sx={{ fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'center' } }} />
                                                    </Stack>

                                                    <Stack spacing={2}>
                                                        <Box>
                                                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                                {t('analysis.fields.problemUnderstanding')}
                                                            </Typography>
                                                            <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{analysis.problemUnderstanding}</Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                                {t('analysis.fields.impact')}
                                                            </Typography>
                                                            <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{analysis.impact}</Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                                {t('analysis.fields.observations')}
                                                            </Typography>
                                                            <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{analysis.observations}</Typography>
                                                        </Box>
                                                        {analysis.considerations && (
                                                            <Box>
                                                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                                    {t('analysis.fields.considerations')}
                                                                </Typography>
                                                                <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{analysis.considerations}</Typography>
                                                            </Box>
                                                        )}
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </Stack>
                            )}

                            {canSubmitAnalysis && (
                                <Box>
                                    <Divider sx={{ mb: 3 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.75 }}>{t('analysis.submitTitle')}</Typography>
                                    <Typography color="text.secondary" sx={{ mb: 2.5 }}>{t('analysis.restrictedNote')}</Typography>
                                    <Stack spacing={2}>
                                        <TextField
                                            label={t('analysis.fields.problemUnderstanding')}
                                            value={analysisForm.problemUnderstanding}
                                            onChange={(event) => handleAnalysisFieldChange('problemUnderstanding', event.target.value)}
                                            error={!!analysisFieldErrors.problemUnderstanding}
                                            helperText={analysisFieldErrors.problemUnderstanding}
                                            size="small"
                                            fullWidth
                                            multiline
                                            minRows={4}
                                        />
                                        <TextField
                                            label={t('analysis.fields.impact')}
                                            value={analysisForm.impact}
                                            onChange={(event) => handleAnalysisFieldChange('impact', event.target.value)}
                                            error={!!analysisFieldErrors.impact}
                                            helperText={analysisFieldErrors.impact}
                                            size="small"
                                            fullWidth
                                            multiline
                                            minRows={4}
                                        />
                                        <TextField
                                            label={t('analysis.fields.observations')}
                                            value={analysisForm.observations}
                                            onChange={(event) => handleAnalysisFieldChange('observations', event.target.value)}
                                            error={!!analysisFieldErrors.observations}
                                            helperText={analysisFieldErrors.observations}
                                            size="small"
                                            fullWidth
                                            multiline
                                            minRows={4}
                                        />
                                        <TextField
                                            label={t('analysis.fields.considerations')}
                                            value={analysisForm.considerations}
                                            onChange={(event) => handleAnalysisFieldChange('considerations', event.target.value)}
                                            size="small"
                                            fullWidth
                                            multiline
                                            minRows={3}
                                        />
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">{t('analysis.submitHint')}</Typography>
                                            <Button variant="contained" onClick={handleAnalysisSubmit} disabled={analysisSubmitting}>
                                                {analysisSubmitting ? t('analysis.submitting') : t('analysis.submitCta')}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                <ImageLightbox
                    images={issue.images}
                    open={lightboxOpen}
                    initialIndex={currentImageIndex}
                    onClose={() => setLightboxOpen(false)}
                />

                <Dialog open={dialogMode === 'edit'} onClose={() => setDialogMode(null)} fullWidth maxWidth="md">
                    <DialogTitle>{t('admin.editDialogTitle')}</DialogTitle>
                    <DialogContent sx={{ pt: '12px !important' }}>
                        {editForm && (
                            <Stack spacing={2.5}>
                                <TextField label={t('fields.title')} value={editForm.title} onChange={(event) => setEditForm((prev: any) => ({ ...prev, title: event.target.value }))} size="small" fullWidth />
                                <TextField label={t('fields.description')} value={editForm.description} onChange={(event) => setEditForm((prev: any) => ({ ...prev, description: event.target.value }))} size="small" multiline minRows={5} fullWidth />
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                    <TextField select label={t('fields.category')} value={editForm.category} onChange={(event) => setEditForm((prev: any) => ({ ...prev, category: event.target.value }))} size="small">
                                        {CATEGORY_OPTIONS.map((category) => <MenuItem key={category} value={category}>{t(`categories.${category}`)}</MenuItem>)}
                                    </TextField>
                                    <TextField select label={t('fields.state')} value={editForm.state} onChange={(event) => setEditForm((prev: any) => ({ ...prev, state: event.target.value }))} size="small">
                                        {STATES.map((state) => <MenuItem key={state} value={state}>{state}</MenuItem>)}
                                    </TextField>
                                    <TextField select label={t('fields.district')} value={editForm.district} onChange={(event) => setEditForm((prev: any) => ({ ...prev, district: event.target.value }))} size="small">
                                        {ANDHRA_PRADESH_DISTRICTS.map((district) => <MenuItem key={district} value={district}>{district}</MenuItem>)}
                                    </TextField>
                                    <TextField label={t('fields.constituency')} value={editForm.constituency} onChange={(event) => setEditForm((prev: any) => ({ ...prev, constituency: event.target.value }))} size="small" />
                                    <TextField label={t('fields.mandal')} value={editForm.mandal} onChange={(event) => setEditForm((prev: any) => ({ ...prev, mandal: event.target.value }))} size="small" />
                                    <TextField label={t('fields.village')} value={editForm.village} onChange={(event) => setEditForm((prev: any) => ({ ...prev, village: event.target.value }))} size="small" />
                                </Box>
                                <TextField label={t('admin.adminNotesField')} value={editForm.adminNotes} onChange={(event) => setEditForm((prev: any) => ({ ...prev, adminNotes: event.target.value }))} size="small" multiline minRows={3} fullWidth />
                                <Alert severity="info">{t('admin.editNotice')}</Alert>
                            </Stack>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogMode(null)}>{tCommon('cancel')}</Button>
                        <Button variant="contained" onClick={handleSave} disabled={updatingIssue}>{tCommon('save')}</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={dialogMode === 'reject'} onClose={() => setDialogMode(null)} fullWidth maxWidth="sm">
                    <DialogTitle>{t('admin.rejectDialogTitle')}</DialogTitle>
                    <DialogContent sx={{ pt: '12px !important' }}>
                        <TextField
                            label={t('rejectionReason')}
                            value={rejectionReason}
                            onChange={(event) => setRejectionReason(event.target.value)}
                            size="small"
                            fullWidth
                            multiline
                            minRows={4}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogMode(null)}>{tCommon('cancel')}</Button>
                        <Button color="error" variant="contained" onClick={handleReject} disabled={updatingStatus || rejectionReason.trim().length < 10}>{tCommon('reject')}</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}