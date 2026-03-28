'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    MenuItem,
    Snackbar,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import AddIcon from '@mui/icons-material/Add';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useLocale, useTranslations } from 'next-intl';
import { ANDHRA_PRADESH_DISTRICTS } from '@repo/constants';
import { PublicIssueCard } from '@/components/public-issues/PublicIssueCard';
import { GET_PUBLIC_ISSUES, TOGGLE_PUBLIC_ISSUE_SUPPORT } from '@/graphql/public-issues';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from '@/hooks/use-navigate';

type FeedSort = 'LATEST' | 'HIGH_PRIORITY';

const CATEGORY_OPTIONS = ['CORRUPTION', 'LAND_MAFIA', 'INDUSTRIAL_POLLUTION', 'POLICY_CONCERN', 'PUBLIC_SERVICES', 'INFRASTRUCTURE', 'OTHER'] as const;

export default function PublicIssuesPage() {
    const t = useTranslations('publicIssues');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const { navigate } = useNavigate();
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const [feedSort, setFeedSort] = useState<FeedSort>('LATEST');
    const [filters, setFilters] = useState({ searchTerm: '', category: '', district: '' });
    const [loginSnackbar, setLoginSnackbar] = useState(false);

    const queryFilter = useMemo(() => ({
        searchTerm: filters.searchTerm || undefined,
        category: filters.category || undefined,
        district: filters.district || undefined,
        priority: feedSort === 'HIGH_PRIORITY' ? 'HIGH' : undefined,
        sortBy: feedSort === 'HIGH_PRIORITY' ? 'TRENDING' : 'LATEST',
    }), [filters, feedSort]);

    const { data, loading, error, refetch } = useQuery(GET_PUBLIC_ISSUES, {
        variables: { filter: queryFilter, pagination: { take: 50, skip: 0 } },
        fetchPolicy: 'cache-and-network',
    });

    const [toggleSupport] = useMutation(TOGGLE_PUBLIC_ISSUE_SUPPORT);

    const issues = data?.publicIssues ?? [];

    const handleSupport = async (issueId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            setLoginSnackbar(true);
            return;
        }
        await toggleSupport({ variables: { id: issueId } });
        refetch();
    };

    return (
        <Box component="main" sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #fff9f2 0%, #ffffff 35%, #f7fbff 100%)' }}>
            <Container maxWidth={false} sx={{ maxWidth: '1180px', px: { xs: 2, sm: 3 } }}>
                <Box sx={{ mb: 4, p: { xs: 3, md: 4 }, borderRadius: 4, background: 'linear-gradient(135deg, #fff2df 0%, #fff 48%, #eaf5ff 100%)', border: '1px solid #f0dfc6' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                        <Box>
                            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1 }}>
                                <CampaignOutlinedIcon sx={{ color: '#c26b00' }} />
                                <Typography variant="overline" sx={{ letterSpacing: '0.16em', color: '#9b5d16', fontWeight: 700 }}>
                                    {t('eyebrow')}
                                </Typography>
                            </Stack>
                            <Typography variant="h3" component="h1" sx={{ fontWeight: 900, lineHeight: 1.05, mb: 1.25, fontSize: { xs: '2rem', md: '2.8rem' } }}>
                                {t('title')}
                            </Typography>
                            <Typography sx={{ maxWidth: 760, color: 'text.secondary', lineHeight: 1.75 }}>
                                {t('subtitle')}
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                            {isSuperAdmin && (
                                <Button variant="outlined" startIcon={<ShieldOutlinedIcon />} onClick={() => navigate(`/${locale}/public-issues/admin`)}>
                                    {t('admin.openQueue')}
                                </Button>
                            )}
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(`/${locale}/public-issues/submit`)}>
                                {t('submitIssue')}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                    {t('publicNotice')}
                </Alert>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={feedSort}
                        onChange={(_, value: FeedSort) => setFeedSort(value)}
                        sx={{ '& .MuiTab-root': { fontWeight: 700, textTransform: 'none' } }}
                    >
                        <Tab label={t('filters.highPriority')} value="HIGH_PRIORITY" />
                        <Tab label={t('filters.latest')} value="LATEST" />
                    </Tabs>
                </Box>

                <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2 }}>
                    <TextField label={tCommon('search')} value={filters.searchTerm} onChange={(event) => setFilters((prev) => ({ ...prev, searchTerm: event.target.value }))} size="small" />
                    <TextField select label={t('fields.category')} value={filters.category} onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))} size="small">
                        <MenuItem value="">{t('filters.allCategories')}</MenuItem>
                        {CATEGORY_OPTIONS.map((category) => <MenuItem key={category} value={category}>{t(`categories.${category}`)}</MenuItem>)}
                    </TextField>
                    <TextField select label={t('fields.district')} value={filters.district} onChange={(event) => setFilters((prev) => ({ ...prev, district: event.target.value }))} size="small">
                        <MenuItem value="">{t('filters.allLocations')}</MenuItem>
                        {ANDHRA_PRADESH_DISTRICTS.map((district) => <MenuItem key={district} value={district}>{district}</MenuItem>)}
                    </TextField>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{tCommon('error')}: {error.message}</Alert>
                ) : issues.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{t('emptyTitle')}</Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>{t('emptySubtitle')}</Typography>
                        <Button variant="contained" onClick={() => navigate(`/${locale}/public-issues/submit`)}>{t('submitFirstIssue')}</Button>
                    </Box>
                ) : (
                    <Stack spacing={2.5}>
                        {issues.map((issue: any) => (
                            <PublicIssueCard
                                key={issue.id}
                                issue={issue}
                                onOpen={() => navigate(`/${locale}/public-issues/${issue.id}`)}
                                onSupport={(e) => handleSupport(issue.id, e)}
                            />
                        ))}
                    </Stack>
                )}
            </Container>

            <Snackbar
                open={loginSnackbar}
                autoHideDuration={4000}
                onClose={() => setLoginSnackbar(false)}
                message={t('loginToSupport')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
}