'use client';

import { useState, useRef } from 'react';
import { convertToBase64, validateImageFile, ImageFile } from '@/utils/file-helpers';

interface UseImageUploadOptions {
    maxImages?: number;
    maxSizeKB?: number;
}

export function useImageUpload({ maxImages = 2, maxSizeKB = 500 }: UseImageUploadOptions = {}) {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        // Clear previous errors
        setError(null);

        // Check if adding these files would exceed the limit
        if (images.length + files.length > maxImages) {
            setError(`Maximum ${maxImages} images allowed`);
            return;
        }

        const newImages: ImageFile[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validate file
            const validation = validateImageFile(file, maxSizeKB);
            if (!validation.valid) {
                setError(validation.error!);
                continue;
            }

            try {
                const base64 = await convertToBase64(file);
                newImages.push({
                    file,
                    preview: URL.createObjectURL(file),
                    base64,
                });
            } catch (err) {
                console.error('Error converting file to base64:', err);
                setError('Failed to process image');
            }
        }

        setImages((prev) => [...prev, ...newImages]);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages((prev) => {
            const newImages = [...prev];
            // Revoke object URL to prevent memory leaks
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });

        // Clear error if exists
        if (error) {
            setError(null);
        }
    };

    const clearImages = () => {
        // Clean up object URLs
        images.forEach((img) => URL.revokeObjectURL(img.preview));
        setImages([]);
        setError(null);
    };

    return {
        images,
        error,
        fileInputRef,
        handleImageSelect,
        handleRemoveImage,
        clearImages,
        setError,
    };
}
