import { Card, CardContent, CardMedia, Typography, Box, Chip, CardActionArea } from '@mui/material';
import { useState } from 'react';
import Link from 'next/link';

interface AtrocityCardProps {
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
    isVerified?: boolean;
}

export default function AtrocityCard({
    id,
    leaderName,
    state,
    district,
    constituency,
    mandal,
    village,
    position,
    description,
    subject,
    images,
    isVerified = false,
}: AtrocityCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleImageClick = () => {
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const locationText = `${village}, ${mandal}, ${constituency}, ${district}, ${state}`;

    return (
        <Card
            sx={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                },
            }}
        >
            {/* Image Section */}
            {images.length > 0 && (
                <Box sx={{ position: 'relative' }}>
                    <CardMedia
                        component="img"
                        height="240"
                        image={images[currentImageIndex]}
                        alt={`${leaderName} - Image ${currentImageIndex + 1}`}
                        onClick={handleImageClick}
                        sx={{
                            cursor: images.length > 1 ? 'pointer' : 'default',
                            objectFit: 'cover',
                        }}
                    />
                    {images.length > 1 && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: 12,
                                fontWeight: 500,
                            }}
                        >
                            {currentImageIndex + 1} / {images.length}
                        </Box>
                    )}
                </Box>
            )}

            {/* Content Section */}
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                {/* Leader Name */}
                <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                        fontWeight: 600,
                        mb: 1,
                        fontSize: { xs: 18, sm: 20 },
                    }}
                >
                    {leaderName}
                </Typography>

                {/* Position & Verification */}
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                    <Chip
                        label={position}
                        size="small"
                        sx={{
                            backgroundColor: 'primary.light',
                            color: 'primary.dark',
                            fontWeight: 500,
                        }}
                    />
                    {isVerified && (
                        <Chip
                            label="Verified"
                            size="small"
                            color="success"
                            sx={{
                                fontWeight: 500,
                            }}
                        />
                    )}
                </Box>

                {/* Location */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        fontSize: 13,
                        fontStyle: 'italic',
                    }}
                >
                    📍 {locationText}
                </Typography>

                {/* Description */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        lineHeight: 1.6,
                        fontSize: 14,
                        fontWeight: subject ? 600 : 400,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        color: subject ? 'text.primary' : 'text.secondary',
                    }}
                >
                    {subject || description}
                </Typography>
            </CardContent>

            <Link href={`/atrocity-description/${id}`} passHref style={{ textDecoration: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
        </Card>
    );
}
