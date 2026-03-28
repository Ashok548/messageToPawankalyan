'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocale, useTranslations } from 'next-intl';
import { ANDHRA_PRADESH_DISTRICTS } from '@repo/constants';
import { VoiceCard } from '@/components/VoiceCard';
import { VoiceStatusBadge } from '@/components/ui/VoiceStatusBadge';
import {
    DELETE_VOICE,
    GET_ALL_VOICES,
    GET_VOICE_DASHBOARD_STATS,
    UPDATE_VOICE,
    UPDATE_VOICE_STATUS,
} from '@/graphql/voices';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from '@/hooks/use-navigate';
import { getErrorMessage } from '@/utils/error-helpers';

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW', 'RESOLVED'] as const;
const CATEGORY_OPTIONS = ['ISSUE', 'OPINION', 'SUGGESTION', 'COMPLAINT', 'FEEDBACK', 'OTHER'] as const;

export default function VoicesAdminPage() {
    const t = useTranslations('voices');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const { navigate } = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [filters, setFilters] = useState({
        searchTerm: '',
        status: '',
        category: '',
        district: '',
        dateFrom: '',
        dateTo: '',
    });
    const [selectedVoice, setSelectedVoice] = useState<any | null>(null);
    const [editForm, setEditForm] = useState<any | null>(null);
    const [adminError, setAdminError] = useState<string | null>(null);
    const [submittingAction, setSubmittingAction] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && user?.role !== 'SUPER_ADMIN') {
            navigate(`/${locale}/voices`);
        }
    }, [authLoading, locale, navigate, user]);

    const queryFilter = useMemo(() => ({
        searchTerm: filters.searchTerm || undefined,
        status: filters.status || undefined,
        category: filters.category || undefined,
        district: filters.district || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
    }), [filters]);

    const { data, loading, error, refetch } = useQuery(GET_ALL_VOICES, {
        skip: user?.role !== 'SUPER_ADMIN',
        variables: { filter: queryFilter, pagination: { take: 80, skip: 0 } },
        fetchPolicy: 'network-only',
    });

    const { data: statsData, loading: statsLoading, refetch: refetchStats } = useQuery(GET_VOICE_DASHBOARD_STATS, {
        skip: user?.role !== 'SUPER_ADMIN',
        fetchPolicy: 'network-only',
    });

    const [updateVoiceStatus] = useMutation(UPDATE_VOICE_STATUS);
    const [updateVoice] = useMutation(UPDATE_VOICE);
    const [deleteVoice] = useMutation(DELETE_VOICE);

    if (user?.role !== 'SUPER_ADMIN') {
        return null;
    }

    const voices = data?.allVoices ?? [];
    const stats = statsData?.voiceDashboardStats;

    const handleStatusAction = async (voiceId: string, status: string, rejectionReason?: string) => {
        setAdminError(null);
        setSubmittingAction(`${voiceId}-${status}`);

        try {
            await updateVoiceStatus({
                variables: {
                    id: voiceId,
                    input: {
                        status,
                        rejectionReason,
                        adminNotes: selectedVoice?.adminNotes || undefined,
                    },
                },
            });
            await Promise.all([refetch(), refetchStats()]);
            if (selectedVoice?.id === voiceId) {
                setSelectedVoice(null);
                setEditForm(null);
            }
        } catch (err) {
            setAdminError(getErrorMessage(err));
        } finally {
            setSubmittingAction(null);
        }
    };

    const handleSave = async () => {
        if (!selectedVoice || !editForm) {
            return;
        }

        setAdminError(null);
        setSubmittingAction(`edit-${selectedVoice.id}`);

        try {
            await updateVoice({
                variables: {
                    id: selectedVoice.id,
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
            await refetch();
            setSelectedVoice(null);
            setEditForm(null);
        } catch (err) {
            setAdminError(getErrorMessage(err));
        } finally {
            setSubmittingAction(null);
        }
    };

    const handleDelete = async () => {
        if (!selectedVoice) {
            return;
        }

        setAdminError(null);
        setSubmittingAction(`delete-${selectedVoice.id}`);

        try {
            await deleteVoice({ variables: { id: selectedVoice.id } });
            await Promise.all([refetch(), refetchStats()]);
            setSelectedVoice(null);
            setEditForm(null);
        } catch (err) {
            setAdminError(getErrorMessage(err));
        } finally {
            setSubmittingAction(null);
        }
    };

    return (
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#f6f7fb', py: 4 }}>
            <Box sx={{ maxWidth: '1240px', mx: 'auto', px: { xs: 2, sm: 3 } }}>
                <Box sx={{ mb: 3.5 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 900, mb: 1 }}>{t('admin.title')}</Typography>
                    <Typography color="text.secondary">{t('admin.subtitle')}</Typography>
                </Box>

                {adminError && <Alert severity="error" sx={{ mb: 3 }}>{adminError}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error.message}</Alert>}

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {[
                        { key: 'pending', label: t('status.PENDING'), value: stats?.pending, color: '#8a5a00', bg: '#fff7e1' },
                        { key: 'approved', label: t('status.APPROVED'), value: stats?.approved, color: '#0f6b34', bg: '#e8f7ee' },
                        { key: 'rejected', label: t('status.REJECTED'), value: stats?.rejected, color: '#a12727', bg: '#fdeaea' },
                        { key: 'underReview', label: t('status.UNDER_REVIEW'), value: stats?.underReview, color: '#0b5ea8', bg: '#e8f2ff' },
                        { key: 'resolved', label: t('status.RESOLVED'), value: stats?.resolved, color: '#6a2ca0', bg: '#f3e8ff' },
                    ].map((item) => (
                        <Grid item xs={6} md={2.4} key={item.key}>
                            <Card sx={{ bgcolor: item.bg, border: '1px solid rgba(0,0,0,0.05)' }}>
                                <CardContent>
                                    <Typography variant="caption" sx={{ color: item.color, fontWeight: 700 }}>{item.label}</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: item.color, mt: 0.5 }}>
                                        {statsLoading ? '...' : item.value ?? 0}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr repeat(5, 1fr)' }, gap: 2 }}>
                        <TextField label={t('filters.search')} value={filters.searchTerm} onChange={(event) => setFilters((prev) => ({ ...prev, searchTerm: event.target.value }))} size="small" />
                        <TextField select label={t('filters.status')} value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))} size="small">
                            <MenuItem value="">{t('filters.allStatuses')}</MenuItem>
                            {STATUS_OPTIONS.map((status) => <MenuItem key={status} value={status}>{t(`status.${status}`)}</MenuItem>)}
                        </TextField>
                        <TextField select label={t('filters.category')} value={filters.category} onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))} size="small">
                            <MenuItem value="">{t('filters.allCategories')}</MenuItem>
                            {CATEGORY_OPTIONS.map((category) => <MenuItem key={category} value={category}>{t(`categories.${category}`)}</MenuItem>)}
                        </TextField>
                        <TextField select label={t('filters.location')} value={filters.district} onChange={(event) => setFilters((prev) => ({ ...prev, district: event.target.value }))} size="small">
                            <MenuItem value="">{t('filters.allLocations')}</MenuItem>
                            {ANDHRA_PRADESH_DISTRICTS.map((district) => <MenuItem key={district} value={district}>{district}</MenuItem>)}
                        </TextField>
                        <TextField label={t('filters.fromDate')} type="date" value={filters.dateFrom} onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))} size="small" InputLabelProps={{ shrink: true }} />
                        <TextField label={t('filters.toDate')} type="date" value={filters.dateTo} onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))} size="small" InputLabelProps={{ shrink: true }} />
                    </CardContent>
                </Card>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
                ) : voices.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{t('admin.noResults')}</Typography>
                        <Typography color="text.secondary">{t('admin.noResultsHint')}</Typography>
                    </Box>
                ) : (
                    <Stack spacing={2.5}>
                        {voices.map((voice: any) => (
                            <VoiceCard
                                key={voice.id}
                                voice={voice}
                                showStatus
                                showAdminActions
                                actionLoading={submittingAction?.startsWith(voice.id)}
                                onOpen={() => {
                                    setSelectedVoice(voice);
                                    setEditForm({ ...voice });
                                }}
                                onApprove={() => handleStatusAction(voice.id, 'APPROVED')}
                                onReject={() => handleStatusAction(voice.id, 'REJECTED', t('admin.defaultRejectReason'))}
                            />
                        ))}
                    </Stack>
                )}

                <Dialog open={!!selectedVoice} onClose={() => { setSelectedVoice(null); setEditForm(null); }} fullWidth maxWidth="md">
                    <DialogTitle>{t('admin.reviewDialogTitle')}</DialogTitle>
                    <DialogContent sx={{ pt: '12px !important' }}>
                        {selectedVoice && editForm && (
                            <Stack spacing={2.5}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">{new Date(selectedVoice.createdAt).toLocaleString()}</Typography>
                                    <VoiceStatusBadge status={selectedVoice.status} />
                                </Stack>

                                <TextField label={t('fields.title')} value={editForm.title} onChange={(event) => setEditForm((prev: any) => ({ ...prev, title: event.target.value }))} size="small" fullWidth />
                                <TextField label={t('fields.description')} value={editForm.description} onChange={(event) => setEditForm((prev: any) => ({ ...prev, description: event.target.value }))} size="small" multiline minRows={5} fullWidth />

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                    <TextField select label={t('fields.category')} value={editForm.category} onChange={(event) => setEditForm((prev: any) => ({ ...prev, category: event.target.value }))} size="small">
                                        {CATEGORY_OPTIONS.map((category) => <MenuItem key={category} value={category}>{t(`categories.${category}`)}</MenuItem>)}
                                    </TextField>
                                    <TextField label={t('fields.state')} value={editForm.state} onChange={(event) => setEditForm((prev: any) => ({ ...prev, state: event.target.value }))} size="small" />
                                    <TextField label={t('fields.district')} value={editForm.district} onChange={(event) => setEditForm((prev: any) => ({ ...prev, district: event.target.value }))} size="small" />
                                    <TextField label={t('fields.constituency')} value={editForm.constituency || ''} onChange={(event) => setEditForm((prev: any) => ({ ...prev, constituency: event.target.value }))} size="small" />
                                    <TextField label={t('fields.mandal')} value={editForm.mandal || ''} onChange={(event) => setEditForm((prev: any) => ({ ...prev, mandal: event.target.value }))} size="small" />
                                    <TextField label={t('fields.village')} value={editForm.village || ''} onChange={(event) => setEditForm((prev: any) => ({ ...prev, village: event.target.value }))} size="small" />
                                </Box>

                                <TextField
                                    label={t('admin.adminNotesField')}
                                    value={editForm.adminNotes || ''}
                                    onChange={(event) => setEditForm((prev: any) => ({ ...prev, adminNotes: event.target.value }))}
                                    size="small"
                                    fullWidth
                                    multiline
                                    minRows={3}
                                />

                                {selectedVoice.images?.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>{tCommon('gallery')}</Typography>
                                        <Grid container spacing={1.5}>
                                            {selectedVoice.images.map((image: string) => (
                                                <Grid item xs={6} md={4} key={image}>
                                                    <Box component="img" src={image} alt={selectedVoice.title} sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 2 }} />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}

                                {(selectedVoice.videoUrl || selectedVoice.audioUrl) && (
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                        {selectedVoice.videoUrl && <Box component="video" controls src={selectedVoice.videoUrl} sx={{ width: '100%' }} />}
                                        {selectedVoice.audioUrl && <Box component="audio" controls src={selectedVoice.audioUrl} sx={{ width: '100%' }} />}
                                    </Stack>
                                )}
                            </Stack>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 1.5 }}>
                        <Stack direction="row" spacing={1}>
                            <Button color="error" onClick={handleDelete} disabled={!selectedVoice || submittingAction === `delete-${selectedVoice?.id}`}>
                                {tCommon('delete')}
                            </Button>
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            <Button onClick={() => selectedVoice && handleStatusAction(selectedVoice.id, 'UNDER_REVIEW')} disabled={!selectedVoice || submittingAction === `${selectedVoice?.id}-UNDER_REVIEW`}>
                                {t('admin.markUnderReview')}
                            </Button>
                            <Button onClick={() => selectedVoice && handleStatusAction(selectedVoice.id, 'RESOLVED')} disabled={!selectedVoice || submittingAction === `${selectedVoice?.id}-RESOLVED`}>
                                {t('admin.markResolved')}
                            </Button>
                            <Button color="error" onClick={() => selectedVoice && handleStatusAction(selectedVoice.id, 'REJECTED', editForm?.rejectionReason || t('admin.defaultRejectReason'))} disabled={!selectedVoice || submittingAction === `${selectedVoice?.id}-REJECTED`}>
                                {tCommon('reject')}
                            </Button>
                            <Button color="success" onClick={() => selectedVoice && handleStatusAction(selectedVoice.id, 'APPROVED')} disabled={!selectedVoice || submittingAction === `${selectedVoice?.id}-APPROVED`}>
                                {tCommon('approve')}
                            </Button>
                            <Button variant="contained" onClick={handleSave} disabled={!selectedVoice || submittingAction === `edit-${selectedVoice?.id}`}>
                                {tCommon('save')}
                            </Button>
                        </Stack>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}