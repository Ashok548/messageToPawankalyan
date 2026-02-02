'use client';

import React from 'react';
import { Box, Button, Card, CardMedia, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useImageUpload } from '@/hooks/use-image-upload';

interface ImageUploadFieldProps {
    maxImages?: number;
    maxSizeKB?: number;
    onChange?: (images: Array<{ file: File; preview: string; base64: string }>) => void;
    label?: string;
}

export function ImageUploadField({
    maxImages = 2,
    maxSizeKB = 500,
    onChange,
    label = `Attach Images (Max ${maxImages}, each max ${maxSizeKB}KB)`,
}: ImageUploadFieldProps) {
    const { images, error, fileInputRef, handleImageSelect, handleRemoveImage } = useImageUpload({
        maxImages,
        maxSizeKB,
    });

    // Notify parent of changes
    React.useEffect(() => {
        if (onChange) {
            onChange(images);
        }
    }, [images, onChange]);

    return (
        <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {label}
            </Typography>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                style={{ display: 'none' }}
            />

            <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= maxImages}
                fullWidth
            >
                {images.length >= maxImages ? 'Maximum images reached' : 'Choose Images'}
            </Button>

            {error && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {error}
                </Typography>
            )}

            {/* Image Previews */}
            {images.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {images.map((image, index) => (
                        <Card key={index} sx={{ position: 'relative', width: 150, height: 150 }}>
                            <CardMedia
                                component="img"
                                image={image.preview}
                                alt={`Preview ${index + 1}`}
                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <IconButton
                                onClick={() => handleRemoveImage(index)}
                                sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                                    },
                                }}
                                size="small"
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                            <Typography
                                variant="caption"
                                sx={{
                                    position: 'absolute',
                                    bottom: 4,
                                    left: 4,
                                    right: 4,
                                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                                    color: 'white',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: '0.7rem',
                                }}
                            >
                                {(image.file.size / 1024).toFixed(2)} KB
                            </Typography>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
}
