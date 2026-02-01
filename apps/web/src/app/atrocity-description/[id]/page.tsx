'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_ATROCITY, APPROVE_ATROCITY_MUTATION, REMOVE_ATROCITY_IMAGE_MUTATION } from '@/graphql/queries/atrocities';
import { Box, Container, Typography, Grid, Paper, Chip, CircularProgress, Alert, Divider, Breadcrumbs, IconButton, Button, Snackbar } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';
import ImageLightbox from '@/components/ui/image-lightbox';

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
    images: string[];
    isVerified: boolean;
    createdAt: string;
}

export default function AtrocityDescriptionPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

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

    // Approve mutation
    const [approveAtrocity, { loading: approving }] = useMutation(APPROVE_ATROCITY_MUTATION, {
        onCompleted: () => {
            setSnackbarMessage('Atrocity approved successfully!');
            setSnackbarOpen(true);
        },
        onError: (error) => {
            setSnackbarMessage(`Error: ${error.message}`);
            setSnackbarOpen(true);
        },
        refetchQueries: [{ query: GET_ATROCITY, variables: { id } }],
    });

    // Remove image mutation
    const [removeImage, { loading: removing }] = useMutation(REMOVE_ATROCITY_IMAGE_MUTATION, {
        onCompleted: () => {
            setSnackbarMessage('Image removed successfully!');
            setSnackbarOpen(true);
        },
        onError: (error) => {
            setSnackbarMessage(`Error: ${error.message}`);
            setSnackbarOpen(true);
        },
        refetchQueries: [{ query: GET_ATROCITY, variables: { id } }],
    });

    const handleApprove = async () => {
        if (window.confirm('Are you sure you want to approve this atrocity?')) {
            await approveAtrocity({ variables: { id } });
        }
    };

    const handleRemoveImage = async (imageUrl: string) => {
        if (window.confirm('Are you sure you want to remove this image?')) {
            await removeImage({ variables: { id, imageUrl } });
        }
    };

    const handleOpenLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const handleCloseLightbox = () => {
        setLightboxOpen(false);
    };

    const { data, loading, error } = useQuery(GET_ATROCITY, {
        variables: { id },
        skip: !id,
        fetchPolicy: 'cache-and-network',
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
                <Alert severity="error">Failed to load atrocity details: {error.message}</Alert>
            </Container>
        );
    }

    if (!data?.atrocity) {
        return (
            <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
                <Alert severity="info">Atrocity not found.</Alert>
            </Container>
        );
    }

    const atrocity: Atrocity = data.atrocity;
    const title = atrocity.leaderName;

    return (
        <Box component="main" sx={{ backgroundColor: '#ffffff', minHeight: '100vh', py: 4 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
                {/* Breadcrumbs */}
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, fontSize: '0.9rem' }}>
                    <Link href="/" style={{ textDecoration: 'none', color: '#1976d2' }}>
                        Home
                    </Link>
                    <Link href="/atrocities-to-janasainiks" style={{ textDecoration: 'none', color: '#1976d2' }}>
                        Atrocities
                    </Link>
                    <Typography color="text.primary" sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {title}
                    </Typography>
                </Breadcrumbs>

                {/* Main Heading with Approve Button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #a2a9b1', pb: 1, mb: 3 }}>
                    <Typography component="h1" variant="h3" sx={{
                        fontFamily: '"Linux Libertine", "Georgia", "Times", serif',
                        fontWeight: 400,
                        flex: 1,
                    }}>
                        {title}
                    </Typography>

                    {/* SUPER_ADMIN Approve Button */}
                    {isSuperAdmin && !atrocity.isVerified && (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={handleApprove}
                            disabled={approving}
                            sx={{ ml: 2, whiteSpace: 'nowrap' }}
                        >
                            {approving ? 'Approving...' : 'Approve'}
                        </Button>
                    )}


                </Box>

                <Box sx={{ position: 'relative', display: 'flow-root' }}>
                    {/* Floating Image for Desktop - Now part of the flow to allow text wrapping */}
                    {atrocity.images && atrocity.images.length > 0 && (
                        <Box sx={{
                            float: 'right',
                            width: '280px',
                            ml: 4,
                            mb: 2,
                            display: { xs: 'none', md: 'block' }
                        }}>
                            <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                                <Image
                                    src={atrocity.images[0]}
                                    alt={atrocity.leaderName}
                                    fill
                                    style={{ objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
                                    unoptimized
                                    onClick={() => handleOpenLightbox(0)}
                                />
                            </div>
                        </Box>
                    )}

                    <Box sx={{ typography: 'body1', lineHeight: 1.6, fontSize: '1rem' }}>
                        {/* Introduction / Short Summary if subject exists, otherwise start of description could be here but we just show description */}
                        <Typography variant="body1" paragraph>
                            <strong>{atrocity.leaderName}</strong> from {atrocity.state}, {atrocity.district}, {atrocity.constituency}, {atrocity.mandal}, {atrocity.village}.
                        </Typography>

                        {/* Mobile Image (if on small screen, show image here) */}
                        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
                            {atrocity.images && atrocity.images.length > 0 && (
                                <Paper elevation={1} sx={{ p: 1, backgroundColor: '#f8f9fa', border: '1px solid #c8ccd1' }}>
                                    <div style={{ position: 'relative', width: '100%', height: '250px' }}>
                                        <Image
                                            src={atrocity.images[0]}
                                            alt={atrocity.leaderName}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            unoptimized
                                        />
                                    </div>
                                </Paper>
                            )}
                        </Box>

                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                            {atrocity.description}
                        </Typography>

                        {/* Additional Images Gallery if more than 1 image */}
                        {atrocity.images && atrocity.images.length > 1 && (
                            <Box sx={{ mt: 4, mb: 4, clear: 'both' }}>
                                <Typography variant="h5" sx={{ borderBottom: '1px solid #a2a9b1', pb: 0.5, mb: 2, fontFamily: '"Linux Libertine", "Georgia", "Times", serif' }}>
                                    Gallery
                                </Typography>
                                <Grid container spacing={2}>
                                    {atrocity.images.map((img, index) => (
                                        <Grid item xs={6} sm={4} md={3} key={index}>
                                            <Paper
                                                elevation={1}
                                                sx={{
                                                    p: 0.5,
                                                    backgroundColor: '#f8f9fa',
                                                    border: '1px solid #c8ccd1',
                                                    borderRadius: 1,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease-in-out',
                                                    position: 'relative',
                                                    '&:hover': {
                                                        transform: 'scale(1.02)',
                                                        boxShadow: 3,
                                                    },
                                                    '&:hover .delete-button': {
                                                        opacity: 1,
                                                    },
                                                }}
                                                onClick={() => handleOpenLightbox(index)}
                                            >
                                                {/* SUPER_ADMIN Delete Button */}
                                                {isSuperAdmin && (
                                                    <IconButton
                                                        className="delete-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveImage(img);
                                                        }}
                                                        disabled={removing}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            zIndex: 2,
                                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                            opacity: 0,
                                                            transition: 'opacity 0.2s',
                                                            '&:hover': {
                                                                backgroundColor: 'error.main',
                                                                color: 'white',
                                                            },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                                <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <Image
                                                        src={img}
                                                        alt={`${atrocity.leaderName} - ${index + 1}`}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                        unoptimized
                                                    />
                                                </div>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Container>

            {/* Lightbox Dialog using standard MUI Dialog */}
            {/* Reusable Image Lightbox */}
            {atrocity.images && (
                <ImageLightbox
                    images={atrocity.images}
                    open={lightboxOpen}
                    initialIndex={currentImageIndex}
                    onClose={handleCloseLightbox}
                />
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
}

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #eaecf0', alignItems: 'flex-start' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '80px', mr: 1 }}>{label}</Typography>
            <Typography variant="body2" align="right">{value}</Typography>
        </Box>
    );
}
