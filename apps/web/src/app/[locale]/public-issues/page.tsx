'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    MenuItem,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useLocale, useTranslations } from 'next-intl';
import { ANDHRA_PRADESH_DISTRICTS } from '@repo/constants';
import { PublicIssueCard } from '@/components/public-issues/PublicIssueCard';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from '@/hooks/use-navigate';
import { usePublicIssues, useTogglePublicIssueSupport } from '@/hooks/use-public-issues';
import { getAnonymousPublicIssueSupporterKey, getSupportedPublicIssueIds, hasSupportedPublicIssue, markPublicIssueSupported } from '@/lib/public-issue-support-storage';

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
    const [supportedIssueIds, setSupportedIssueIds] = useState<string[]>([]);

    const queryFilter = useMemo(() => ({
        searchTerm: filters.searchTerm || undefined,
        category: filters.category || undefined,
        district: filters.district || undefined,
        priority: feedSort === 'HIGH_PRIORITY' ? 'HIGH' : undefined,
        sortBy: feedSort === 'HIGH_PRIORITY' ? 'TRENDING' : 'LATEST',
    }), [filters, feedSort]);

    const { issues, initialLoading, isRefreshing, error, refetch } = usePublicIssues(queryFilter, { take: 50, skip: 0 });
    const { toggleSupport } = useTogglePublicIssueSupport();

    useEffect(() => {
        setSupportedIssueIds(getSupportedPublicIssueIds());
    }, []);

    const effectiveIssues = useMemo(() => (
        issues.map((issue: any) => ({
            ...issue,
            hasUserSupported: issue.hasUserSupported || supportedIssueIds.includes(issue.id),
        }))
    ), [issues, supportedIssueIds]);

    const handleSupport = async (issueId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (hasSupportedPublicIssue(issueId)) {
            return;
        }

        await toggleSupport({
            variables: {
                id: issueId,
                anonymousSupporterKey: user ? undefined : getAnonymousPublicIssueSupporterKey(),
            },
        });
        setSupportedIssueIds(markPublicIssueSupported(issueId));
        refetch();
    };

    return (
        <Box component="main" sx={{ minHeight: { xs: 'calc(100vh - 52px)', sm: 'calc(100vh - 48px)' }, backgroundColor: '#fafafa', py: { xs: 4, sm: 6 } }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
                {/* Header Section */}
                <Box
                    sx={{
                        mb: 5,
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'center', md: 'flex-start' },
                        justifyContent: 'space-between',
                        gap: 3,
                        textAlign: { xs: 'center', md: 'left' }
                    }}
                >
                    <Box sx={{ maxWidth: 680 }}>
                        <Typography
                            component="h1"
                            sx={{
                                fontSize: { xs: 28, sm: 36, md: 42 },
                                fontWeight: 700,
                                lineHeight: 1.2,
                                color: '#1a1a1a',
                                mb: 1.5,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {t('title')}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: { xs: 16, sm: 18 },
                                color: 'text.secondary',
                            }}
                        >
                            {t('subtitle')}
                        </Typography>
                    </Box>

                    {/* Actions Row */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: { xs: 'center', md: 'flex-end' } }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={() => navigate(`/${locale}/public-issues/submit`)}
                            sx={{
                                px: 3,
                                py: 1.2,
                                fontSize: 15,
                                fontWeight: 600,
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: 2,
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {t('submitIssue')}
                        </Button>

                        {isSuperAdmin && (
                            <Button variant="outlined" startIcon={<ShieldOutlinedIcon />} onClick={() => navigate(`/${locale}/public-issues/admin`)}>
                                {t('admin.openQueue')}
                            </Button>
                        )}
                    </Box>
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

                {isRefreshing && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}

                {initialLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{tCommon('error')}: {error.message}</Alert>
                ) : effectiveIssues.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{t('emptyTitle')}</Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>{t('emptySubtitle')}</Typography>
                        <Button variant="contained" onClick={() => navigate(`/${locale}/public-issues/submit`)}>{t('submitFirstIssue')}</Button>
                    </Box>
                ) : (
                    <Stack spacing={2.5}>
                        {effectiveIssues.map((issue: any) => (
                            <PublicIssueCard
                                key={issue.id}
                                issue={issue}
                                onOpen={() => navigate(`/${locale}/public-issues/${issue.id}`)}
                                onSupport={(e) => handleSupport(issue.id, e)}
                                supportButtonDisabled={issue.hasUserSupported}
                            />
                        ))}
                    </Stack>
                )}
            </Container>
        </Box>
    );
}