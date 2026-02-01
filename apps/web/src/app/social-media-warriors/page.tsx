'use client';

import { useQuery, gql } from '@apollo/client';
import { Box, Container, Typography, Card, CardContent, CircularProgress, Alert, Button, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { useState, useEffect } from 'react';

const GET_WARRIORS = gql`
    query GetSocialMediaWarriors {
        socialMediaWarriors {
            id
            name
            district
            mandal
            reason
            digitalContributions
            engagementStyle
            photo
            createdAt
        }
    }
`;

interface SocialMediaWarrior {
    id: string;
    name: string;
    district: string;
    mandal?: string;
    reason: string;
    digitalContributions: string[];
    engagementStyle: string[];
    photo?: string;
    createdAt: string;
}

export default function SocialMediaWarriorsPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const { data, loading, error } = useQuery(GET_WARRIORS);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setIsAdmin(payload.role === 'ADMIN' || payload.role === 'SUPER_ADMIN');
            } catch (e) {
                console.error('Invalid token');
            }
        }
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
                <Alert severity="error">Failed to load social media warriors: {error.message}</Alert>
            </Container>
        );
    }

    const warriors: SocialMediaWarrior[] = data?.socialMediaWarriors || [];

    return (
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#fafafa', py: 4 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
                            Social Media Warriors
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Documenting digital activists contributing to political awareness and online engagement
                        </Typography>
                    </Box>

                    {/* Admin-only Create Button */}
                    {isAdmin && (
                        <Button
                            variant="contained"
                            onClick={() => router.push('/submit-social-warrior')}
                            sx={{ whiteSpace: 'nowrap', minWidth: { xs: 'auto', sm: 64 } }}
                        >
                            <AddIcon />
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 1 }}>
                                Create
                            </Box>
                        </Button>
                    )}
                </Box>

                {/* Warriors List */}
                {warriors.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            No social media warriors documented yet
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {warriors.map((warrior) => (
                            <Card
                                key={warrior.id}
                                onClick={() => router.push(`/social-warrior-profile/${warrior.id}`)}
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    boxShadow: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'box-shadow 0.2s ease',
                                    '&:hover': {
                                        boxShadow: 3,
                                    },
                                }}
                            >
                                {/* LEFT SECTION: Image (Fixed 140px width on desktop) */}
                                <Box
                                    sx={{
                                        width: { xs: '100%', sm: 140 },
                                        minWidth: { sm: 140 },
                                        height: { xs: 200, sm: 'auto' },
                                        bgcolor: '#f5f5f5', // Neutral background
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                    }}
                                >
                                    {warrior.photo ? (
                                        <Box
                                            component="img"
                                            src={warrior.photo}
                                            alt={warrior.name}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain', // Requirement: contain
                                                maxHeight: { xs: 200, sm: '100%' },
                                            }}
                                        />
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">
                                            No Photo
                                        </Typography>
                                    )}
                                </Box>

                                {/* CENTER & RIGHT SECTIONS: Content */}
                                <CardContent sx={{ flex: 1, p: 3, '&:last-child': { pb: 3 } }}>
                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                                        {/* CENTER: Main Content */}
                                        <Box sx={{ flex: 1 }}>
                                            {/* Name & Location */}
                                            <Box sx={{ mb: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5, color: '#1a1a1a' }}>
                                                    {warrior.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                    {warrior.district}{warrior.mandal ? `, ${warrior.mandal}` : ''}
                                                </Typography>
                                            </Box>

                                            {/* Description / Contribution Summary */}
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2,
                                                    lineHeight: 1.6,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {warrior.reason}
                                            </Typography>

                                            {/* Contribution Areas - Horizontal List (not chips) */}
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {warrior.digitalContributions.slice(0, 3).join(' • ')}
                                                    {warrior.digitalContributions.length > 3 && ` • +${warrior.digitalContributions.length - 3} more`}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* RIGHT: Actions */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: { xs: 'flex-start', md: 'flex-end' },
                                                justifyContent: 'center',
                                                gap: 1,
                                                minWidth: { md: 100 }
                                            }}
                                        >
                                            {/* Admin Edit Button */}
                                            {isAdmin && (
                                                <IconButton
                                                    color="primary"
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/submit-social-warrior?id=${warrior.id}`);
                                                    }}
                                                    aria-label="Edit Warrior"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            )}

                                            {/* View Profile Icon */}
                                            <IconButton
                                                color="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/social-warrior-profile/${warrior.id}`);
                                                }}
                                                aria-label="View Profile"
                                                sx={{
                                                    '&:hover': { backgroundColor: 'primary.50' }
                                                }}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </Container>
        </Box>
    );
}
