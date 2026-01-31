import { Injectable, BadRequestException } from '@nestjs/common';
import ImageKit, { type Uploadable } from '@imagekit/nodejs';

export interface UploadedImage {
    url: string;
    fileId: string;
    name: string;
}

@Injectable()
export class ImageKitService {
    private imagekit: ImageKit;

    constructor() {
        const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
        const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

        if (!publicKey || !privateKey || !urlEndpoint) {
            console.warn('ImageKit credentials not configured. Image upload will not work.');
            console.warn('Required: IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT');
        }

        this.imagekit = new ImageKit({
            publicKey: publicKey || '',
            privateKey: privateKey || '',
            urlEndpoint: urlEndpoint || '',
        } as any);
    }

    /**
     * Upload a single image to ImageKit
     * @param file - Base64 encoded file, buffer, or file stream
     * @param fileName - Name for the uploaded file
     * @param folder - Optional folder path in ImageKit
     * @returns Uploaded image details
     */
    async uploadImage(
        file: Uploadable,
        fileName: string,
        folder: string = 'atrocities',
    ): Promise<UploadedImage> {
        try {
            const result = await this.imagekit.files.upload({
                file,
                fileName,
                folder,
            });

            return {
                url: result.url || '',
                fileId: result.fileId || '',
                name: result.name || '',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new BadRequestException(
                `Failed to upload image: ${errorMessage}`,
            );
        }
    }

    /**
     * Upload multiple images to ImageKit
     * @param files - Array of base64 encoded files, buffers, or file streams
     * @param fileNames - Array of file names
     * @param folder - Optional folder path in ImageKit
     * @returns Array of uploaded image URLs
     */
    async uploadMultipleImages(
        files: Uploadable[],
        fileNames: string[],
        folder: string = 'atrocities',
    ): Promise<string[]> {
        if (files.length !== fileNames.length) {
            throw new BadRequestException(
                'Number of files and file names must match',
            );
        }

        try {
            const uploadPromises = files.map((file, index) =>
                this.uploadImage(file, fileNames[index], folder),
            );

            const results = await Promise.all(uploadPromises);
            return results.map((result) => result.url);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new BadRequestException(
                `Failed to upload images: ${errorMessage}`,
            );
        }
    }

    /**
     * Delete an image from ImageKit
     * @param fileId - ImageKit file ID
     */
    async deleteImage(fileId: string): Promise<void> {
        try {
            await this.imagekit.files.delete(fileId);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Failed to delete image ${fileId}:`, errorMessage);
            // Don't throw error as this is cleanup operation
        }
    }

    /**
     * Validate image file size (max 500KB)
     * @param base64String - Base64 encoded image
     * @returns true if valid, throws error if invalid
     */
    validateImageSize(base64String: string): boolean {
        // Remove data URL prefix if present
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

        // Calculate size in bytes (base64 is ~4/3 of original size)
        const sizeInBytes = (base64Data.length * 3) / 4;
        const sizeInKB = sizeInBytes / 1024;

        if (sizeInKB > 500) {
            throw new BadRequestException(
                `Image size ${sizeInKB.toFixed(2)}KB exceeds maximum allowed size of 500KB`,
            );
        }

        return true;
    }

    /**
     * Validate number of images (max 2)
     * @param imageCount - Number of images
     * @returns true if valid, throws error if invalid
     */
    validateImageCount(imageCount: number): boolean {
        if (imageCount > 2) {
            throw new BadRequestException(
                `Maximum 2 images allowed, received ${imageCount}`,
            );
        }

        return true;
    }

    /**
     * Validate generic file size (default max 5MB)
     * @param base64String - Base64 encoded file
     * @param maxSizeKB - Maximum allowed size in KB (default 5120 = 5MB)
     * @returns true if valid, throws error if invalid
     */
    validateFileSize(base64String: string, maxSizeKB: number = 5120): boolean {
        // Remove data URL prefix if present (msg/pdf/doc etc)
        const base64Data = base64String.replace(/^data:.*?;base64,/, '');

        // Calculate size in bytes
        const sizeInBytes = (base64Data.length * 3) / 4;
        const sizeInKB = sizeInBytes / 1024;

        if (sizeInKB > maxSizeKB) {
            throw new BadRequestException(
                `File size ${sizeInKB.toFixed(2)}KB exceeds maximum allowed size of ${maxSizeKB}KB`,
            );
        }

        return true;
    }
}
