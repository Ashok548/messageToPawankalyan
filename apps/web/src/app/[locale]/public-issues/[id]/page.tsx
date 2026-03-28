'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
    Alert,
    Box,
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
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
import { GET_PUBLIC_ISSUE, UPDATE_PUBLIC_ISSUE, UPDATE_PUBLIC_ISSUE_STATUS } from '@/graphql/public-issues';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from '@/hooks/use-navigate';
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

function getRestApiBaseUrl(): string {
    return process.env.NEXT_PUBLIC_REST_URL
        || process.env.NEXT_PUBLIC_API_URL
        || process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace('/graphql', '')
        || 'http://localhost:4000';
}

async function parseIssueResponse(response: Response) {
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        const errorMessage = payload && typeof payload === 'object' && 'message' in payload
            ? Array.isArray(payload.message)
                ? payload.message.join(', ')
                : String(payload.message)
            : 'Request failed';
        throw new Error(errorMessage);
    }

    return payload;
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
    const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
    const [analysisLoading, setAnalysisLoading] = useState(true);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisSubmitting, setAnalysisSubmitting] = useState(false);
    const [analysisSubmitted, setAnalysisSubmitted] = useState(false);
    const [analysisFieldErrors, setAnalysisFieldErrors] = useState<Partial<Record<keyof AnalysisFormState, string>>>({});
    const [analysisForm, setAnalysisForm] = useState<AnalysisFormState>({
        problemUnderstanding: '',
        impact: '',
        observations: '',
        considerations: '',
    });

    const [analysisSubmittedAsLive, setAnalysisSubmittedAsLive] = useState(false);

    const { data, loading, error, refetch } = useQuery(GET_PUBLIC_ISSUE, {
        variables: { id: params.id },
        fetchPolicy: 'cache-and-network',
    });

    const [updatePublicIssue, { loading: updatingIssue }] = useMutation(UPDATE_PUBLIC_ISSUE);
    const [updatePublicIssueStatus, { loading: updatingStatus }] = useMutation(UPDATE_PUBLIC_ISSUE_STATUS);

    const issue = data?.publicIssue;

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
            setSupportState({
                supportCount: issue.supportCount,
                hasUserSupported: issue.hasUserSupported,
                priority: issue.priority,
                isHighPriority: issue.isHighPriority,
            });
            setSelectedPriority(issue.priority);
            setSelectedVerificationStatus(issue.verificationStatus);
        }
    }, [issue]);

    const loadAnalyses = useCallback(async () => {
        setAnalysisLoading(true);
        setAnalysisError(null);

        try {
            const response = await fetch(`${getRestApiBaseUrl()}/issues/${params.id}/analysis`);
            const payload = await parseIssueResponse(response);
            setAnalyses(payload);
        } catch (loadError) {
            setAnalysisError(getErrorMessage(loadError));
        } finally {
            setAnalysisLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            setAnalysisLoading(true);
            setAnalysisError(null);

            try {
                const response = await fetch(`${getRestApiBaseUrl()}/issues/${params.id}/analysis`);
                const payload = await parseIssueResponse(response);

                if (!cancelled) {
                    setAnalyses(payload);
                }
            } catch (loadError) {
                if (!cancelled) {
                    setAnalysisError(getErrorMessage(loadError));
                }
            } finally {
                if (!cancelled) {
                    setAnalysisLoading(false);
                }
            }
        }

        void run();

        return () => {
            cancelled = true;
        };
    }, [params.id]);

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

        const token = typeof window === 'undefined' ? null : localStorage.getItem('authToken');
        if (!token) {
            setAdminError(t('loginToSupport'));
            return;
        }

        const previousState: SupportState = supportState ?? {
            supportCount: issue.supportCount,
            hasUserSupported: issue.hasUserSupported,
            priority: issue.priority,
            isHighPriority: issue.isHighPriority,
        };

        const nextSupportCount = previousState.hasUserSupported
            ? Math.max(previousState.supportCount - 1, 0)
            : previousState.supportCount + 1;
        const nextPriority = computePriority(nextSupportCount);
        const optimisticState: SupportState = {
            supportCount: nextSupportCount,
            hasUserSupported: !previousState.hasUserSupported,
            priority: nextPriority,
            isHighPriority: nextSupportCount >= HIGH_THRESHOLD,
        };

        setAdminError(null);
        setSupportSubmitting(true);
        setSupportState(optimisticState);

        try {
            const method = previousState.hasUserSupported ? 'DELETE' : 'POST';
            const response = await fetch(`${getRestApiBaseUrl()}/issues/${issue.id}/support`, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const updatedIssue = await parseIssueResponse(response);
            setSupportState({
                supportCount: updatedIssue.supportCount,
                hasUserSupported: updatedIssue.hasUserSupported,
                priority: updatedIssue.priority,
                isHighPriority: updatedIssue.isHighPriority,
            });
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

        const token = typeof window === 'undefined' ? null : localStorage.getItem('authToken');
        if (!token) {
            setAdminError(t('admin.authRequired'));
            return;
        }

        const previousPriority = selectedPriority;

        setAdminError(null);
        setSelectedPriority(priority);
        setAdminUpdateMode('priority');

        try {
            const response = await fetch(`${getRestApiBaseUrl()}/admin/issues/${issue.id}/priority`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ priority }),
            });

            await parseIssueResponse(response);
            setSupportState((current) => current
                ? {
                    ...current,
                    priority,
                    isHighPriority: priority === 'HIGH',
                }
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

        const token = typeof window === 'undefined' ? null : localStorage.getItem('authToken');
        if (!token) {
            setAdminError(t('admin.authRequired'));
            return;
        }

        const previousStatus = selectedVerificationStatus;

        setAdminError(null);
        setSelectedVerificationStatus(verificationStatus);
        setAdminUpdateMode('verification');

        try {
            const response = await fetch(`${getRestApiBaseUrl()}/admin/issues/${issue.id}/verification-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ verificationStatus }),
            });

            await parseIssueResponse(response);
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

        const token = typeof window === 'undefined' ? null : localStorage.getItem('authToken');
        if (!token) {
            setAnalysisError(t('analysis.restrictedLogin'));
            return;
        }

        setAnalysisSubmitting(true);
        setAnalysisError(null);
        setAnalysisSubmitted(false);

        try {
            const response = await fetch(`${getRestApiBaseUrl()}/analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    issueId: params.id,
                    problemUnderstanding: analysisForm.problemUnderstanding.trim(),
                    impact: analysisForm.impact.trim(),
                    observations: analysisForm.observations.trim(),
                    considerations: analysisForm.considerations.trim() || undefined,
                }),
            });

            await parseIssueResponse(response);

            if (isSuperAdmin) {
                // SUPER_ADMIN submissions are auto-approved — reload list so insight appears immediately
                setAnalysisSubmittedAsLive(true);
                await loadAnalyses();
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
        } finally {
            setAnalysisSubmitting(false);
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
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8', py: { xs: 3, md: 5 } }}>
            <Container maxWidth={false} sx={{ maxWidth: '1200px', px: { xs: 2, sm: 3, md: 4 } }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/${locale}/public-issues`)} sx={{ mb: 3, fontWeight: 700 }}>
                    {tCommon('back')}
                </Button>

                {adminError && <Alert severity="error" sx={{ mb: 3 }}>{adminError}</Alert>}

                <Grid container spacing={{ xs: 3, lg: 4 }} alignItems="flex-start">
                    <Grid item xs={12} lg={8}>
                        <Stack spacing={3}>
                            <Card sx={{ borderRadius: 5, border: '1px solid #e4e8ee', boxShadow: '0 18px 50px rgba(15, 23, 42, 0.06)' }}>
                                <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
                                    <Stack spacing={4}>
                                        <Box>
                                            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
                                                <Chip label={t(`categories.${issue.category}`)} size="small" sx={{ fontWeight: 700, color: '#1f4d8f', bgcolor: '#eef4ff', borderRadius: 2 }} />
                                                <Chip label={t(`status.${issue.status}`)} size="small" sx={{ fontWeight: 700, color: '#2d5b43', bgcolor: '#edf6ef', borderRadius: 2 }} />
                                                <Chip label={t(`priority.${currentPriority}`)} size="small" sx={{ fontWeight: 700, color: '#6c4d12', bgcolor: '#fff3d9', borderRadius: 2 }} />
                                            </Stack>

                                            <Typography variant="h3" component="h1" sx={{ fontWeight: 900, lineHeight: 1.12, letterSpacing: '-0.02em', color: '#1c2940', mb: 1.75, fontSize: { xs: '0.8rem', sm: '1.25rem', md: '1.75rem' } }}>
                                                {issue.title}
                                            </Typography>

                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2.25 }}>
                                                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, color: '#184f95', fontSize: { xs: '1rem', sm: '1.05rem' } }}>
                                                    <ThumbUpAltIcon sx={{ fontSize: 20 }} />
                                                    {t('supportersStatement', { count: formattedSupportCount })}
                                                </Typography>
                                                <Button
                                                    variant={hasUserSupported ? 'contained' : 'outlined'}
                                                    size="small"
                                                    startIcon={hasUserSupported ? <ThumbUpAltIcon /> : <ThumbUpAltOutlinedIcon />}
                                                    onClick={handleToggleSupport}
                                                    disabled={!isSupportable || supportSubmitting}
                                                    sx={{ minWidth: 132, fontWeight: 700 }}
                                                >
                                                    {hasUserSupported ? t('supported') : t('support')}
                                                </Button>
                                            </Stack>

                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }} flexWrap="wrap" sx={{ color: 'text.secondary', mb: 1.5 }}>
                                                <Stack direction="row" spacing={0.75} alignItems="center">
                                                    <PlaceOutlinedIcon sx={{ fontSize: 18 }} />
                                                    <Typography variant="body2">{locationParts.join(', ')}</Typography>
                                                </Stack>
                                                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, color: 'text.disabled' }}>•</Typography>
                                                <Stack direction="row" spacing={0.75} alignItems="center">
                                                    <AccessTimeOutlinedIcon sx={{ fontSize: 18 }} />
                                                    <Typography variant="body2">{formattedCreatedAt}</Typography>
                                                </Stack>
                                            </Stack>

                                            <Chip
                                                label={t(`verification.${currentVerificationStatus}`)}
                                                size="small"
                                                variant="outlined"
                                                sx={{ mb: 1.25, fontWeight: 700, borderColor: '#c9d4e4', color: '#314665', bgcolor: '#f9fbfd' }}
                                            />
                                            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: '68ch', lineHeight: 1.7 }}>
                                                {t('publicSubmissionDisclaimer')}
                                            </Typography>
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
                                                <Grid container spacing={2}>
                                                    {visibleImages.map((image: string, index: number) => (
                                                        <Grid item xs={12} sm={6} key={image}>
                                                            <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', aspectRatio: '4 / 3', bgcolor: '#e9edf2', border: '1px solid #e5e7eb', cursor: 'pointer' }} onClick={() => handleOpenLightbox(index)}>
                                                                <Image src={image} alt={`${issue.title}-${index + 1}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 420px" style={{ objectFit: 'cover' }} />
                                                                {hasMoreImages && index === visibleImages.length - 1 && hiddenImageCount > 0 && (
                                                                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(15, 23, 42, 0.58)', color: '#fff', backdropFilter: 'blur(2px)' }}>
                                                                        <Typography sx={{ fontSize: { xs: '1.1rem', sm: '1.35rem' }, fontWeight: 800, letterSpacing: '0.01em' }}>
                                                                            {t('moreImagesOverlay', { count: hiddenImageCount })}
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            ) : (
                                                <Alert severity="info">{t('noEvidence')}</Alert>
                                            )}
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>

                        </Stack>
                    </Grid>

                    <Grid item xs={12} lg={4}>
                        <Stack spacing={3} sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
                            <Card sx={{ borderRadius: 4, border: '1px solid #e4e8ee', boxShadow: '0 14px 36px rgba(15, 23, 42, 0.05)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1f2f46', mb: 2.5 }}>
                                        {t('summaryTitle')}
                                    </Typography>

                                    <Stack spacing={2} divider={<Divider flexItem />}>
                                        <Box>
                                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                                                {t('submittedByLabel')}
                                            </Typography>
                                            <Typography sx={{ fontWeight: 800, color: '#1c2940' }}>{t('anonymousSubmission')}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                                                {t('reviewedByLabel')}
                                            </Typography>
                                            <Typography sx={{ fontWeight: 800, color: '#1c2940' }}>
                                                {issue.reviewedByUser?.name || (issue.reviewedAt ? t('adminLabel') : '-')}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
                                                {t('admin.verificationField')}
                                            </Typography>
                                            <Chip label={t(`verification.${currentVerificationStatus}`)} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
                                                {t('admin.priorityField')}
                                            </Typography>
                                            <Chip label={t(`priority.${currentPriority}`)} size="small" sx={{ fontWeight: 700, color: '#6c4d12', bgcolor: '#fff3d9' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
                                                {t('totalSupportCount')}
                                            </Typography>
                                            <Typography sx={{ fontSize: '1.75rem', lineHeight: 1, fontWeight: 900, color: '#1c2940', mb: 0.5 }}>
                                                {formattedSupportCount}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('supportersCount', { count: currentSupportCount })}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>

                            {isSuperAdmin && (
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
                                            <Stack direction={{ xs: 'column', sm: 'row', lg: 'column' }} spacing={1.25}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<CheckCircleOutlineIcon />}
                                                    onClick={handleApprove}
                                                    disabled={updatingStatus || issue.status === 'APPROVED'}
                                                    fullWidth
                                                >
                                                    {tCommon('approve')}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<CancelOutlinedIcon />}
                                                    onClick={() => setDialogMode('reject')}
                                                    disabled={updatingStatus || issue.status === 'REJECTED'}
                                                    fullWidth
                                                >
                                                    {tCommon('reject')}
                                                </Button>
                                                <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setDialogMode('edit')} fullWidth>
                                                    {tCommon('edit')}
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            )}
                        </Stack>
                    </Grid>
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
                                    {analyses.map((analysis) => {
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