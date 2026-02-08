'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
    Box,
    Container,
    Typography,
    TextField,
    MenuItem,
    Button,
    InputAdornment,
    CircularProgress,
    Alert
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { DisciplinaryCaseCard } from '@/components/DisciplinaryCaseCard';
import { GET_DISCIPLINARY_CASES } from '@/graphql/disciplinary-cases';
import { useAuth } from '@/hooks/use-auth';
import { CaseStatus, IssueCategory, CaseVisibility } from '@/components/ui/case-status-badge';

export default function DisciplinaryCasesPage() {
    const t = useTranslations('disciplinary');
    const tCaseStatus = useTranslations('caseStatus');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    const [filters, setFilters] = useState({
        searchTerm: '',
        status: '',
        issueCategory: '',
        visibility: ''
    });

    const { data, loading, error } = useQuery(GET_DISCIPLINARY_CASES, {
        variables: {
            filter: {
                searchTerm: filters.searchTerm || undefined,
                status: filters.status || undefined,
                issueCategory: filters.issueCategory || undefined,
                visibility: filters.visibility || undefined
            }
        },
        fetchPolicy: 'network-only'
    });

    const handleFilterChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleCreateCase = () => {
        router.push(`/${locale}/disciplinary-cases/create`);
    };

    return (
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#fafafa', py: 4 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
                            {t('title')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {t('subtitle')}
                        </Typography>
                    </Box>

                    {isAdmin && (
                        <Button
                            variant="contained"
                            onClick={handleCreateCase}
                            sx={{ whiteSpace: 'nowrap', minWidth: { xs: 'auto', sm: 64 } }}
                        >
                            <Add />
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 1 }}>
                                {tCommon('submit')}
                            </Box>
                        </Button>
                    )}
                </Box>

                {/* Horizontal Filter Bar */}
                <Box
                    sx={{
                        mb: 4,
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2,
                        alignItems: { xs: 'stretch', md: 'center' }
                    }}
                >
                    {/* Search */}
                    <TextField
                        fullWidth
                        placeholder={t('searchPlaceholder')}
                        value={filters.searchTerm}
                        onChange={handleFilterChange('searchTerm')}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="action" />
                                </InputAdornment>
                            ),
                        }}
                        size="small"
                        sx={{ maxWidth: { md: 400 } }}
                    />

                    {/* Status Filter */}
                    <TextField
                        select
                        label="Status"
                        value={filters.status}
                        onChange={handleFilterChange('status')}
                        size="small"
                        sx={{ minWidth: { xs: '100%', md: 180 } }}
                    >
                        <MenuItem value="">{t('filters.allStatuses')}</MenuItem>
                        {Object.values(CaseStatus).map((status) => (
                            <MenuItem key={status} value={status}>
                                {tCaseStatus(`status.${status}`)}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Category Filter */}
                    <TextField
                        select
                        label="Category"
                        value={filters.issueCategory}
                        onChange={handleFilterChange('issueCategory')}
                        size="small"
                        sx={{ minWidth: { xs: '100%', md: 200 } }}
                    >
                        <MenuItem value="">{t('filters.allCategories')}</MenuItem>
                        {Object.values(IssueCategory).map((category) => (
                            <MenuItem key={category} value={category}>
                                {t(`form.issueCategories.${category}`)}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Visibility Filter (Admin Only) */}
                    {isAdmin && (
                        <TextField
                            select
                            label="Visibility"
                            value={filters.visibility}
                            onChange={handleFilterChange('visibility')}
                            size="small"
                            sx={{ minWidth: { xs: '100%', md: 150 } }}
                        >
                            <MenuItem value="">{t('filters.allVisibility')}</MenuItem>
                            {Object.values(CaseVisibility).map((viz) => (
                                <MenuItem key={viz} value={viz}>
                                    {tCaseStatus(`visibility.${viz}`)}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                </Box>

                {/* Content */}
                {loading ? (
                    <Box display="flex" justifyContent="center" py={8}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{tCommon('error')}: {error.message}</Alert>
                ) : data?.disciplinaryCases?.length === 0 ? (
                    <Box textAlign="center" py={8}>
                        <Typography variant="h6" color="text.secondary">
                            {t('noCases')}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {data?.disciplinaryCases.map((disciplinaryCase: any) => (
                            <DisciplinaryCaseCard
                                key={disciplinaryCase.id}
                                data={disciplinaryCase}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </Box>
                )}
            </Container>
        </Box>
    );
}
