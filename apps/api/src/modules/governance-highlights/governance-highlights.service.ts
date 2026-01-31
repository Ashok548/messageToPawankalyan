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

        // Create highlight with uploaded image URL
        return this.repository.create({
            ...input,
            image: imageUrl,
        });
    }

    async update(id: string, input: UpdateGovernanceHighlightInput): Promise<GovernanceHighlight> {
        const highlight = await this.repository.findById(id);
        if (!highlight) {
            throw new NotFoundException('Governance highlight not found');
        }

        let imageUrl: string | undefined = input.image;

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

        return this.repository.update(id, {
            ...input,
            image: imageUrl,
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
