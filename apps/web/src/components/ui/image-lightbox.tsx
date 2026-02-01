'use client';

import { useState, useEffect } from 'react';
import { Dialog, Box, IconButton } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface ImageLightboxProps {
    images: string[];
    open: boolean;
    initialIndex?: number;
    onClose: () => void;
}

export default function ImageLightbox({ images, open, initialIndex = 0, onClose }: ImageLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Update current index when initialIndex changes
    // Update current index when initialIndex changes
    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    const handleNext = () => {
        if (images.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }
    };

    const handlePrev = () => {
        if (images.length > 0) {
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    if (!images || images.length === 0) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            PaperProps={{
                sx: { backgroundColor: 'transparent', boxShadow: 'none', overflow: 'visible' }
            }}
        >
            <Box sx={{ position: 'relative' }}>
                {images.length > 1 && (
                    <IconButton
                        onClick={handlePrev}
                        sx={{
                            position: 'fixed',
                            left: 20,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                            zIndex: 1500
                        }}
                    >
                        <NavigateBeforeIcon fontSize="large" />
                    </IconButton>
                )}

                <Box
                    component="img"
                    src={images[currentIndex] || ''}
                    alt={`Image ${currentIndex + 1}`}
                    sx={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 1 }}
                />

                {images.length > 1 && (
                    <IconButton
                        onClick={handleNext}
                        sx={{
                            position: 'fixed',
                            right: 20,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                            zIndex: 1500
                        }}
                    >
                        <NavigateNextIcon fontSize="large" />
                    </IconButton>
                )}
            </Box>
        </Dialog>
    );
}
