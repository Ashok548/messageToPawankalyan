import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
    const t = useTranslations('atrocityCard');
    const locationText = `${village}, ${mandal}, ${constituency}, ${district}`;

    return (
        <Card
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: 1,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'box-shadow 0.2s ease',
                position: 'relative',
                '&:hover': {
                    boxShadow: 3,
                },
            }}
        >
            {/* Clickable Link Overlay */}
            <Link
                href={`/atrocity-description/${id}`}
                passHref
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                }}
            />

            {/* LEFT SECTION: Image */}
            <Box
                sx={{
                    width: { xs: '100%', sm: 140 },
                    minWidth: { sm: 140 },
                    height: { xs: 200, sm: 'auto' },
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                {images.length > 0 ? (
                    <Box
                        component="img"
                        src={images[0]}
                        alt={leaderName}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            maxHeight: { xs: 200, sm: '100%' },
                        }}
                    />
                ) : (
                    <Typography variant="caption" color="text.secondary">
                        {t('noPhoto')}
                    </Typography>
                )}

                {/* Image Counter Badge */}
                {images.length > 1 && (
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: 11,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                        }}
                    >
                        +{images.length - 1} {t('more')}
                    </Box>
                )}
            </Box>

            {/* RIGHT SECTION: Content */}
            <CardContent
                sx={{
                    flex: 1,
                    p: 3,
                    '&:last-child': { pb: 3 },
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    {/* CENTER: Main Content */}
                    <Box sx={{ flex: 1 }}>
                        {/* Name & Location */}
                        <Box sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        lineHeight: 1.2,
                                        color: '#1a1a1a',
                                    }}
                                >
                                    {leaderName}
                                </Typography>
                                {isVerified && (
                                    <CheckCircleIcon color="primary" sx={{ fontSize: 18 }} />
                                )}
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {position} • {district}{mandal ? `, ${mandal}` : ''}
                            </Typography>
                        </Box>

                        {/* Description */}
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mb: 2,
                                lineHeight: 1.6,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {subject && (
                                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    {subject}:{' '}
                                </Box>
                            )}
                            {description}
                        </Typography>

                        {/* State Badge */}
                        <Box>
                            <Chip
                                label={state}
                                size="small"
                                variant="outlined"
                                sx={{ borderRadius: 1, height: 24, fontSize: 11, fontWeight: 600 }}
                            />
                        </Box>
                    </Box>

                    {/* RIGHT: Actions */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: { xs: 'flex-start', md: 'flex-end' },
                            justifyContent: 'center',
                            minWidth: { md: 80 },
                        }}
                    >
                        {/* Arrow Icon (desktop only) */}
                        <Box sx={{ display: { xs: 'none', sm: 'block' }, color: 'action.disabled' }}>
                            <ArrowForwardIosIcon fontSize="small" />
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
