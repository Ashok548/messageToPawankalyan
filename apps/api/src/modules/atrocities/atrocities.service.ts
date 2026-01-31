import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AtrocitiesRepository } from './atrocities.repository';
import { CreateAtrocityInput, UpdateAtrocityInput } from './dto/atrocity.input';
import { Atrocity } from './entities/atrocity.entity';
import { ImageKitService } from '../../common/imagekit/imagekit.service';
import { type Uploadable } from '@imagekit/nodejs';

@Injectable()
export class AtrocitiesService {
    constructor(
        private readonly repository: AtrocitiesRepository,
        private readonly imagekitService: ImageKitService,
    ) { }

    async findAll(): Promise<Atrocity[]> {
        return this.repository.findAll();
    }

    async findUnverified(): Promise<Atrocity[]> {
        return this.repository.findByVerificationStatus(false);
    }

    async findById(id: string): Promise<Atrocity | null> {
        return this.repository.findById(id);
    }

    async create(input: CreateAtrocityInput): Promise<Atrocity> {
        let imageUrls: string[] = [];

        // Handle image uploads if images are provided
        if (input.images && input.images.length > 0) {
            // Validate image count (max 2)
            this.imagekitService.validateImageCount(input.images.length);

            // Validate each image size (max 500KB)
            input.images.forEach((image, index) => {
                try {
                    this.imagekitService.validateImageSize(image);
                } catch (error) {
                    throw new BadRequestException(
                        `Image ${index + 1}: ${error instanceof Error ? error.message : 'Invalid image'}`,
                    );
                }
            });

            // Upload images to ImageKit
            try {
                const fileNames = input.images.map((_, index) =>
                    `atrocity_${Date.now()}_${index}.jpg`
                );

                imageUrls = await this.imagekitService.uploadMultipleImages(
                    input.images as unknown as Uploadable[],
                    fileNames,
                    'atrocities',
                );
            } catch (error) {
                // If upload fails, throw error and don't create DB entry
                throw new BadRequestException(
                    `Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`,
                );
            }
        }

        // Create atrocity entry with uploaded image URLs
        return this.repository.create({
            ...input,
            images: imageUrls,
        });
    }

    async update(id: string, input: UpdateAtrocityInput): Promise<Atrocity> {
        // If updating images, handle upload
        if (input.images && input.images.length > 0) {
            // Validate image count (max 2)
            this.imagekitService.validateImageCount(input.images.length);

            // Validate each image size (max 500KB)
            input.images.forEach((image, index) => {
                try {
                    this.imagekitService.validateImageSize(image);
                } catch (error) {
                    throw new BadRequestException(
                        `Image ${index + 1}: ${error instanceof Error ? error.message : 'Invalid image'}`,
                    );
                }
            });

            // Upload new images
            try {
                const fileNames = input.images.map((_, index) =>
                    `atrocity_${Date.now()}_${index}.jpg`
                );

                const imageUrls = await this.imagekitService.uploadMultipleImages(
                    input.images as unknown as Uploadable[],
                    fileNames,
                    'atrocities',
                );

                // Update with new image URLs
                return this.repository.update(id, {
                    ...input,
                    images: imageUrls,
                });
            } catch (error) {
                throw new BadRequestException(
                    `Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`,
                );
            }
        }

        return this.repository.update(id, input);
    }

    async approve(id: string): Promise<Atrocity> {
        const atrocity = await this.repository.findById(id);
        if (!atrocity) {
            throw new NotFoundException('Atrocity not found');
        }
        return this.repository.update(id, { isVerified: true });
    }

    async removeImage(id: string, imageUrl: string): Promise<Atrocity> {
        const atrocity = await this.repository.findById(id);
        if (!atrocity) {
            throw new NotFoundException('Atrocity not found');
        }

        const updatedImages = atrocity.images.filter(img => img !== imageUrl);
        return this.repository.update(id, { images: updatedImages });
    }

    async delete(id: string): Promise<Atrocity> {
        return this.repository.delete(id);
    }
}
