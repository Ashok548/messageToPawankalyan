'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
    Box,
    Container,
    Typography,
    Grid,
    TextField,
    MenuItem,
    Button,
    Stack,
    InputAdornment,
    CircularProgress,
    Alert
} from '@mui/material';
import { Search, Add, FilterList } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { DisciplinaryCaseCard } from '../../components/DisciplinaryCaseCard';
import { GET_DISCIPLINARY_CASES } from '../../graphql/disciplinary-cases';
import { CaseStatus, IssueCategory, CaseVisibility } from '../../components/ui/case-status-badge';
import { useAuth } from '../../hooks/use-auth';

export default function DisciplinaryCasesPage() {
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
        router.push('/disciplinary-cases/create');
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'start', sm: 'center' }} spacing={2} mb={4}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
                        Disciplinary Register
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Official records of disciplinary actions and internal reviews.
                    </Typography>
                </Box>

                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleCreateCase}
                        sx={{ bgcolor: '#E31E24', '&:hover': { bgcolor: '#B01419' } }}
                    >
                        New Case
                    </Button>
                )}
            </Stack>

            {/* Filters */}
            <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Search by Case ID or Leader Name"
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
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            value={filters.status}
                            onChange={handleFilterChange('status')}
                            size="small"
                        >
                            <MenuItem value="">All Statuses</MenuItem>
                            {Object.values(CaseStatus).map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status.replace(/_/g, ' ')}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Category"
                            value={filters.issueCategory}
                            onChange={handleFilterChange('issueCategory')}
                            size="small"
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {Object.values(IssueCategory).map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category.replace(/_/g, ' ')}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    {isAdmin && (
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                select
                                fullWidth
                                label="Visibility"
                                value={filters.visibility}
                                onChange={handleFilterChange('visibility')}
                                size="small"
                            >
                                <MenuItem value="">All</MenuItem>
                                {Object.values(CaseVisibility).map((viz) => (
                                    <MenuItem key={viz} value={viz}>
                                        {viz.replace(/_/g, ' ')}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    )}
                </Grid>
            </Box>

            {/* Content */}
            {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">Error loading disciplinary cases: {error.message}</Alert>
            ) : data?.disciplinaryCases?.length === 0 ? (
                <Box textAlign="center" py={8} bgcolor="background.paper" borderRadius={2}>
                    <Typography variant="h6" color="text.secondary">
                        No disciplinary cases found matching your criteria.
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {data?.disciplinaryCases.map((disciplinaryCase: any) => (
                        <Grid item xs={12} md={6} lg={4} key={disciplinaryCase.id}>
                            <DisciplinaryCaseCard
                                data={disciplinaryCase}
                                isAdmin={isAdmin}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}
