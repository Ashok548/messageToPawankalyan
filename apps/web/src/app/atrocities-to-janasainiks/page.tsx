'use client';

import { Box, Container, Typography, Grid, CircularProgress, Alert, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_ATROCITIES, GET_UNVERIFIED_ATROCITIES } from '@/graphql/queries/atrocities';
import AtrocityCard from '@/components/atrocities/AtrocityCard';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';

interface Atrocity {
    id: string;
    leaderName: string;
    state: string;
    district: string;
    constituency: string;
    mandal: string;
    village: string;
    position: string;
    description: string;
    subject?: string;
    images: string[];
    isVerified: boolean;
}

export default function AttrocitiesToJanasainiksPage() {
    const router = useRouter();
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unverified'>('all');

    // Check if user is SUPER_ADMIN
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setIsSuperAdmin(payload.role === 'SUPER_ADMIN');
            } catch (e) {
                setIsSuperAdmin(false);
            }
        }
    }, []);

    // Use different query based on filter
    const { data, loading, error } = useQuery(
        filter === 'unverified' ? GET_UNVERIFIED_ATROCITIES : GET_ATROCITIES
    );

    return (
        <Box
            component="main"
            sx={{
                minHeight: '100vh',
                backgroundColor: '#fafafa',
                py: { xs: 4, sm: 6 },
            }}
        >
            <Container maxWidth="lg">
                {/* Page Header */}
                <Box sx={{ mb: 5, textAlign: 'center' }}>
                    <Typography
                        component="h1"
                        sx={{
                            fontSize: { xs: 28, sm: 36, md: 42 },
                            fontWeight: 700,
                            lineHeight: 1.2,
                            color: '#1a1a1a',
                            mb: 2,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Atrocities Against Janasainiks
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: { xs: 16, sm: 18 },
                            color: 'text.secondary',
                            maxWidth: 680,
                            mx: 'auto',
                            mb: 3,
                        }}
                    >
                        Documenting incidents of violence, harassment, and injustice against our political workers
                    </Typography>

                    {/* SUPER_ADMIN Filter Toggle */}
                    {isSuperAdmin && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <ToggleButtonGroup
                                value={filter}
                                exclusive
                                onChange={(_, newFilter) => {
                                    if (newFilter !== null) {
                                        setFilter(newFilter);
                                    }
                                }}
                                sx={{
                                    backgroundColor: 'white',
                                    '& .MuiToggleButton-root': {
                                        px: 3,
                                        py: 1,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                    },
                                }}
                            >
                                <ToggleButton value="all">All</ToggleButton>
                                <ToggleButton value="unverified">Unverified</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    )}

                    {/* Report Button */}
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddIcon />}
                        onClick={() => router.push('/report-atrocity')}
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: 16,
                            fontWeight: 600,
                            borderRadius: 2,
                            textTransform: 'none',
                        }}
                    >
                        Report Atrocity
                    </Button>
                </Box>

                {/* Loading State */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Error State */}
                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        Failed to load atrocities: {error.message}
                    </Alert>
                )}

                {/* Cards Grid */}
                {data?.atrocities && (
                    <Grid container spacing={{ xs: 3, sm: 4 }}>
                        {data.atrocities.map((atrocity: Atrocity) => (
                            <Grid item xs={12} sm={6} md={4} key={atrocity.id}>
                                <AtrocityCard
                                    id={atrocity.id}
                                    leaderName={atrocity.leaderName}
                                    state={atrocity.state}
                                    district={atrocity.district}
                                    constituency={atrocity.constituency}
                                    mandal={atrocity.mandal}
                                    village={atrocity.village}
                                    position={atrocity.position}
                                    description={atrocity.description}
                                    subject={atrocity.subject}
                                    images={atrocity.images}
                                    isVerified={atrocity.isVerified}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Empty State */}
                {data?.atrocities && data.atrocities.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            No atrocities reported yet
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
}
