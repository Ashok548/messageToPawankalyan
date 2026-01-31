import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { GovernanceHighlightsRepository } from './governance-highlights.repository';
import { CreateGovernanceHighlightInput, UpdateGovernanceHighlightInput } from './dto/governance-highlight.input';
import { GovernanceHighlight, HighlightCategory } from './entities/governance-highlight.entity';
import { ImageKitService } from '../../common/imagekit/imagekit.service';
import { type Uploadable } from '@imagekit/nodejs';

@Injectable()
export class GovernanceHighlightsService {
    constructor(
        private readonly repository: GovernanceHighlightsRepository,
        private readonly imagekitService: ImageKitService,
    ) { }

    async findAll(): Promise<GovernanceHighlight[]> {
        return this.repository.findAll();
    }

    async findByCategory(category: HighlightCategory): Promise<GovernanceHighlight[]> {
        return this.repository.findByCategory(category);
    }

    async findById(id: string): Promise<GovernanceHighlight | null> {
        return this.repository.findById(id);
    }

    async create(input: CreateGovernanceHighlightInput): Promise<GovernanceHighlight> {
        let imageUrl: string | undefined;
        let galleryUrls: string[] = [];

        // Handle image upload if provided
        if (input.image) {
            try {
                // Validate image size (max 500KB)
                this.imagekitService.validateImageSize(input.image);

                // Upload image to ImageKit
                const fileName = `governance_highlight_${Date.now()}.jpg`;
                const uploadResult = await this.imagekitService.uploadMultipleImages(
                    [input.image as unknown as Uploadable],
                    [fileName],
                    'governance-highlights',
                );
                imageUrl = uploadResult[0];
            } catch (error) {
                throw new BadRequestException(
                    `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
                );
            }
        }

        // Handle gallery upload if provided
        if (input.gallery && input.gallery.length > 0) {
            try {
                const base64Images = input.gallery.filter(img => img.startsWith('data:'));
                if (base64Images.length > 0) {
                    // Validate each image
                    base64Images.forEach(img => this.imagekitService.validateImageSize(img));

                    // Upload to ImageKit
                    const fileNames = base64Images.map((_, i) => `governance_gallery_${Date.now()}_${i}.jpg`);
                    galleryUrls = await this.imagekitService.uploadMultipleImages(
                        base64Images as unknown as Uploadable[],
                        fileNames,
                        'governance-highlights',
                    );
                }
            } catch (error) {
                throw new BadRequestException(
                    `Failed to upload gallery images: ${error instanceof Error ? error.message : 'Unknown error'}`,
                );
            }
        }

        // Create highlight with uploaded image URLs
        return this.repository.create({
            ...input,
            image: imageUrl,
            gallery: galleryUrls.length > 0 ? galleryUrls : undefined,
        });
    }

    async update(id: string, input: UpdateGovernanceHighlightInput): Promise<GovernanceHighlight> {
        const highlight = await this.repository.findById(id);
        if (!highlight) {
            throw new NotFoundException('Governance highlight not found');
        }

        let imageUrl: string | undefined = input.image;
        let galleryUrls: string[] | undefined = input.gallery;

        // Handle image upload if new image provided
        if (input.image && input.image.startsWith('data:')) {
            try {
                // Validate image size (max 500KB)
                this.imagekitService.validateImageSize(input.image);

                // Upload new image to ImageKit
                const fileName = `governance_highlight_${Date.now()}.jpg`;
                const uploadResult = await this.imagekitService.uploadMultipleImages(
                    [input.image as unknown as Uploadable],
                    [fileName],
                    'governance-highlights',
                );
                imageUrl = uploadResult[0];
            } catch (error) {
                throw new BadRequestException(
                    `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
                );
            }
        }

        // Handle gallery upload if new gallery images provided
        if (input.gallery && input.gallery.length > 0) {
            try {
                const base64Images = input.gallery.filter(img => img.startsWith('data:'));
                if (base64Images.length > 0) {
                    // Validate each image
                    base64Images.forEach(img => this.imagekitService.validateImageSize(img));

                    // Upload to ImageKit
                    const fileNames = base64Images.map((_, i) => `governance_gallery_${Date.now()}_${i}.jpg`);
                    const uploadedUrls = await this.imagekitService.uploadMultipleImages(
                        base64Images as unknown as Uploadable[],
                        fileNames,
                        'governance-highlights',
                    );

                    // Keep existing URLs and add new ones
                    const existingUrls = input.gallery.filter(img => !img.startsWith('data:'));
                    galleryUrls = [...existingUrls, ...uploadedUrls];
                }
            } catch (error) {
                throw new BadRequestException(
                    `Failed to upload gallery images: ${error instanceof Error ? error.message : 'Unknown error'}`,
                );
            }
        }

        return this.repository.update(id, {
            ...input,
            image: imageUrl,
            gallery: galleryUrls,
        });
    }

    async toggleVisibility(id: string): Promise<GovernanceHighlight> {
        const highlight = await this.repository.findById(id);
        if (!highlight) {
            throw new NotFoundException('Governance highlight not found');
        }

        return this.repository.update(id, {
            isVisible: !highlight.isVisible,
        });
    }

    async delete(id: string): Promise<GovernanceHighlight> {
        const highlight = await this.repository.findById(id);
        if (!highlight) {
            throw new NotFoundException('Governance highlight not found');
        }

        return this.repository.delete(id);
    }
}
