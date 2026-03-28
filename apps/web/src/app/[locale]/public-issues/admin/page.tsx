'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { ANDHRA_PRADESH_DISTRICTS } from '@repo/constants';
import { PublicIssueCard } from '@/components/public-issues/PublicIssueCard';
import { PublicIssueStatusBadge, type PublicIssueStatusValue } from '@/components/ui/PublicIssueStatusBadge';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from '@/hooks/use-navigate';
import { getErrorMessage } from '@/utils/error-helpers';

const REST_BASE_URL = process.env.NEXT_PUBLIC_REST_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace('/graphql', '') || 'http://localhost:4000';
const STATUS_TABS = ['PENDING', 'APPROVED', 'REJECTED'] as const;
const CATEGORY_OPTIONS = ['CORRUPTION', 'LAND_MAFIA', 'INDUSTRIAL_POLLUTION', 'POLICY_CONCERN', 'PUBLIC_SERVICES', 'INFRASTRUCTURE', 'OTHER'] as const;
const PRIORITY_OPTIONS = ['NORMAL', 'NOTABLE', 'HIGH'] as const;
const VERIFICATION_OPTIONS = ['UNVERIFIED', 'BASIC_REVIEWED', 'STRONG_EVIDENCE'] as const;

type AdminTabStatus = typeof STATUS_TABS[number];

type AdminIssue = {
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
    submittedByUser?: { name: string } | null;
    supportCount: number;
    isHighPriority: boolean;
    priority: typeof PRIORITY_OPTIONS[number];
    verificationStatus: typeof VERIFICATION_OPTIONS[number];
    hasUserSupported?: boolean;
    status: PublicIssueStatusValue;
    adminNotes?: string | null;
    rejectionReason?: string | null;
};

async function parseResponse(response: Response) {
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        const message = payload && typeof payload === 'object' && 'message' in payload
            ? Array.isArray(payload.message)
                ? payload.message.join(', ')
                : String(payload.message)
            : `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return payload;
}

export default function PublicIssuesAdminPage() {
    const t = useTranslations('publicIssues');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const { navigate } = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTabStatus>('PENDING');
    const [filters, setFilters] = useState({ searchTerm: '', category: '', district: '' });
    const [issues, setIssues] = useState<AdminIssue[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submittingAction, setSubmittingAction] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [rejectDialogIssue, setRejectDialogIssue] = useState<AdminIssue | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [deleteDialogIssue, setDeleteDialogIssue] = useState<AdminIssue | null>(null);

    useEffect(() => {
        if (!authLoading && user?.role !== 'SUPER_ADMIN') {
            navigate(`/${locale}/public-issues`);
        }
    }, [authLoading, locale, navigate, user]);

    const queryFilter = useMemo(() => ({
        searchTerm: filters.searchTerm || undefined,
        category: filters.category || undefined,
        district: filters.district || undefined,
        status: activeTab,
    }), [activeTab, filters]);

    useEffect(() => {
        if (authLoading || user?.role !== 'SUPER_ADMIN') {
            return;
        }

        let cancelled = false;

        async function loadIssues() {
            const token = typeof window === 'undefined' ? null : localStorage.getItem('authToken');

            if (!token) {
                if (!cancelled) {
                    setError(t('loginToSupport'));
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const searchParams = new URLSearchParams();
                searchParams.set('status', queryFilter.status);

                if (queryFilter.searchTerm) {
                    searchParams.set('searchTerm', queryFilter.searchTerm);
                }

                if (queryFilter.category) {
                    searchParams.set('category', queryFilter.category);
                }

                if (queryFilter.district) {
                    searchParams.set('district', queryFilter.district);
                }

                const response = await fetch(`${REST_BASE_URL}/admin/issues?${searchParams.toString()}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const payload = await parseResponse(response);

                if (!cancelled) {
                    setIssues(payload);
                }
            } catch (loadError) {
                if (!cancelled) {
                    setError(getErrorMessage(loadError));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadIssues();

        return () => {
            cancelled = true;
        };
    }, [authLoading, queryFilter, reloadKey, t, user?.role]);

    if (user?.role !== 'SUPER_ADMIN') {
        return null;
    }

    const triggerReload = () => setReloadKey((current) => current + 1);

    const applyUpdatedIssue = (updatedIssue: AdminIssue) => {
        setIssues((currentIssues) => {
            if (updatedIssue.status !== activeTab) {
                return currentIssues.filter((issue) => issue.id !== updatedIssue.id);
            }

            return currentIssues.map((issue) => issue.id === updatedIssue.id ? updatedIssue : issue);
        });
    };

    const runAction = async (actionKey: string, request: () => Promise<AdminIssue>) => {
        setSubmittingAction(actionKey);
        setError(null);

        try {
            const updatedIssue = await request();
            applyUpdatedIssue(updatedIssue);
        } catch (actionError) {
            setError(getErrorMessage(actionError));
            triggerReload();
        } finally {
            setSubmittingAction(null);
        }
    };

    const buildAuthHeaders = () => {
        const token = typeof window === 'undefined' ? null : localStorage.getItem('authToken');

        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    const handleApprove = async (issueId: string) => {
        await runAction(`${issueId}-approve`, async () => {
            const response = await fetch(`${REST_BASE_URL}/admin/issues/${issueId}/approve`, {
                method: 'PATCH',
                headers: buildAuthHeaders(),
                body: JSON.stringify({}),
            });

            return parseResponse(response);
        });
    };

    const handleReject = async () => {
        if (!rejectDialogIssue) {
            return;
        }

        await runAction(`${rejectDialogIssue.id}-reject`, async () => {
            const response = await fetch(`${REST_BASE_URL}/admin/issues/${rejectDialogIssue.id}/reject`, {
                method: 'PATCH',
                headers: buildAuthHeaders(),
                body: JSON.stringify({ rejectionReason: rejectReason.trim() }),
            });

            return parseResponse(response);
        });

        setRejectDialogIssue(null);
        setRejectReason('');
    };

    const handlePriorityChange = async (issueId: string, priority: typeof PRIORITY_OPTIONS[number]) => {
        await runAction(`${issueId}-priority`, async () => {
            const response = await fetch(`${REST_BASE_URL}/admin/issues/${issueId}/priority`, {
                method: 'PATCH',
                headers: buildAuthHeaders(),
                body: JSON.stringify({ priority }),
            });

            return parseResponse(response);
        });
    };

    const handleVerificationChange = async (issueId: string, verificationStatus: typeof VERIFICATION_OPTIONS[number]) => {
        await runAction(`${issueId}-verification`, async () => {
            const response = await fetch(`${REST_BASE_URL}/admin/issues/${issueId}/verification-status`, {
                method: 'PATCH',
                headers: buildAuthHeaders(),
                body: JSON.stringify({ verificationStatus }),
            });

            return parseResponse(response);
        });
    };

    const handleDelete = async (issueId: string) => {
        setSubmittingAction(`${issueId}-delete`);
        setError(null);

        try {
            const response = await fetch(`${REST_BASE_URL}/admin/issues/${issueId}`, {
                method: 'DELETE',
                headers: buildAuthHeaders(),
            });

            await parseResponse(response);
            setIssues((current) => current.filter((issue) => issue.id !== issueId));
        } catch (actionError) {
            setError(getErrorMessage(actionError));
        } finally {
            setSubmittingAction(null);
            setDeleteDialogIssue(null);
        }
    };

    return (
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#f6f7fb', py: 4 }}>
            <Box sx={{ maxWidth: '1240px', mx: 'auto', px: { xs: 2, sm: 3 } }}>
                <Box sx={{ mb: 3.5 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 900, mb: 1 }}>{t('admin.title')}</Typography>
                    <Typography color="text.secondary">{t('admin.subtitle')}</Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={(_, value: AdminTabStatus) => setActiveTab(value)}>
                        <Tab label={t('admin.tabs.PENDING')} value="PENDING" />
                        <Tab label={t('admin.tabs.APPROVED')} value="APPROVED" />
                        <Tab label={t('admin.tabs.REJECTED')} value="REJECTED" />
                    </Tabs>
                </Box>

                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2 }}>
                        <TextField label={t('filters.search')} value={filters.searchTerm} onChange={(event) => setFilters((prev) => ({ ...prev, searchTerm: event.target.value }))} size="small" />
                        <TextField select label={t('filters.category')} value={filters.category} onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))} size="small">
                            <MenuItem value="">{t('filters.allCategories')}</MenuItem>
                            {CATEGORY_OPTIONS.map((category) => <MenuItem key={category} value={category}>{t(`categories.${category}`)}</MenuItem>)}
                        </TextField>
                        <TextField select label={t('filters.location')} value={filters.district} onChange={(event) => setFilters((prev) => ({ ...prev, district: event.target.value }))} size="small">
                            <MenuItem value="">{t('filters.allLocations')}</MenuItem>
                            {ANDHRA_PRADESH_DISTRICTS.map((district) => <MenuItem key={district} value={district}>{district}</MenuItem>)}
                        </TextField>
                    </CardContent>
                </Card>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
                ) : issues.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{t('admin.noResults')}</Typography>
                        <Typography color="text.secondary">{t('admin.noResultsHint')}</Typography>
                    </Box>
                ) : (
                    <Stack spacing={2.5}>
                        {issues.map((issue) => (
                            <PublicIssueCard
                                key={issue.id}
                                issue={issue}
                                hideSupportButton
                                onOpen={() => navigate(`/${locale}/public-issues/${issue.id}`)}
                                footerActions={(
                                    <Stack spacing={1.5}>
                                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
                                            <PublicIssueStatusBadge status={issue.status} />
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    disabled={submittingAction === `${issue.id}-approve` || issue.status === 'APPROVED'}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        void handleApprove(issue.id);
                                                    }}
                                                >
                                                    {tCommon('approve')}
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    disabled={submittingAction === `${issue.id}-reject`}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setRejectDialogIssue(issue);
                                                        setRejectReason(issue.rejectionReason || '');
                                                    }}
                                                >
                                                    {tCommon('reject')}
                                                </Button>
                                            </Stack>
                                        </Stack>

                                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                label={t('admin.priorityField')}
                                                value={issue.priority}
                                                onClick={(event) => event.stopPropagation()}
                                                onChange={(event) => {
                                                    event.stopPropagation();
                                                    void handlePriorityChange(issue.id, event.target.value as typeof PRIORITY_OPTIONS[number]);
                                                }}
                                            >
                                                {PRIORITY_OPTIONS.map((priority) => (
                                                    <MenuItem key={priority} value={priority}>{t(`priority.${priority}`)}</MenuItem>
                                                ))}
                                            </TextField>

                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                label={t('admin.verificationField')}
                                                value={issue.verificationStatus}
                                                onClick={(event) => event.stopPropagation()}
                                                onChange={(event) => {
                                                    event.stopPropagation();
                                                    void handleVerificationChange(issue.id, event.target.value as typeof VERIFICATION_OPTIONS[number]);
                                                }}
                                            >
                                                {VERIFICATION_OPTIONS.map((verificationStatus) => (
                                                    <MenuItem key={verificationStatus} value={verificationStatus}>{t(`verification.${verificationStatus}`)}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Stack>
                                    </Stack>
                                )}
                            />
                        ))}
                    </Stack>
                )}

                <Dialog open={!!rejectDialogIssue} onClose={() => { setRejectDialogIssue(null); setRejectReason(''); }} fullWidth maxWidth="sm">
                    <DialogTitle>{t('admin.rejectDialogTitle')}</DialogTitle>
                    <DialogContent sx={{ pt: '12px !important' }}>
                        <TextField
                            label={t('rejectionReason')}
                            value={rejectReason}
                            onChange={(event) => setRejectReason(event.target.value)}
                            placeholder={t('admin.rejectReasonPlaceholder')}
                            size="small"
                            fullWidth
                            multiline
                            minRows={4}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setRejectDialogIssue(null); setRejectReason(''); }}>{tCommon('cancel')}</Button>
                        <Button color="error" variant="contained" onClick={() => void handleReject()} disabled={!rejectDialogIssue || rejectReason.trim().length < 10 || submittingAction === `${rejectDialogIssue?.id}-reject`}>
                            {tCommon('reject')}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={!!deleteDialogIssue} onClose={() => setDeleteDialogIssue(null)} fullWidth maxWidth="sm">
                    <DialogTitle>{t('admin.deleteDialogTitle')}</DialogTitle>
                    <DialogContent sx={{ pt: '12px !important' }}>
                        <Alert severity="error">{t('admin.deleteConfirmation')}</Alert>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogIssue(null)}>{tCommon('cancel')}</Button>
                        <Button color="error" variant="contained" onClick={() => void handleDelete(deleteDialogIssue!.id)} disabled={!deleteDialogIssue || submittingAction === `${deleteDialogIssue?.id}-delete`}>
                            {tCommon('delete')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}