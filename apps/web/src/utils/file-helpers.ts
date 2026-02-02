/**
 * File Helper Utilities
 * Shared utilities for file handling across the application
 */

/**
 * Convert a File object to base64 string
 */
export const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Validate an image file
 */
export const validateImageFile = (file: File, maxSizeKB = 500) => {
    if (!file.type.startsWith('image/')) {
        return {
            valid: false,
            error: 'Only image files are allowed',
        };
    }

    if (file.size > maxSizeKB * 1024) {
        return {
            valid: false,
            error: `Image "${file.name}" exceeds ${maxSizeKB}KB limit (${(file.size / 1024).toFixed(2)}KB)`,
        };
    }

    return { valid: true };
};

/**
 * Image file interface
 */
export interface ImageFile {
    file: File;
    preview: string;
    base64: string;
}
