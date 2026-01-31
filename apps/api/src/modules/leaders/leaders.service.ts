import { Injectable, BadRequestException } from '@nestjs/common';
import { LeadersRepository } from './leaders.repository';
import { CreateLeaderInput, UpdateLeaderInput } from './dto/leader.input';
import { Leader, LeaderStatus } from './entities/leader.entity';
import { ImageKitService } from '../../common/imagekit/imagekit.service';
import { type Uploadable } from '@imagekit/nodejs';

@Injectable()
export class LeadersService {
    constructor(
        private readonly repository: LeadersRepository,
        private readonly imagekitService: ImageKitService,
    ) { }

    async findAll(): Promise<Leader[]> {
        return this.repository.findAll();
    }

    async findById(id: string): Promise<Leader | null> {
        return this.repository.findById(id);
    }

    async findByStatus(status: LeaderStatus): Promise<Leader[]> {
        return this.repository.findByStatus(status);
    }

    async create(input: CreateLeaderInput): Promise<Leader> {
        let photoUrl: string | undefined;

        // Handle photo upload if provided
        if (input.photo) {
            try {
                // Validate image size (max 500KB)
                this.imagekitService.validateImageSize(input.photo);

                // Upload image to ImageKit
                const fileName = `leader_${Date.now()}.jpg`;
                const uploadResult = await this.imagekitService.uploadMultipleImages(
                    [input.photo] as unknown as Uploadable[],
                    [fileName],
                    'leaders',
                );
                photoUrl = uploadResult[0];
            } catch (error) {
                throw new BadRequestException(
                    `Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}`,
                );
            }
        }

        let galleryUrls: string[] = [];
        // Handle gallery upload if provided
        if (input.gallery && input.gallery.length > 0) {
            try {
                // Validate each image
                input.gallery.forEach(img => this.imagekitService.validateImageSize(img));

                const fileNames = input.gallery.map((_, i) => `leader_gallery_${Date.now()}_${i}.jpg`);

                galleryUrls = await this.imagekitService.uploadMultipleImages(
                    input.gallery as unknown as Uploadable[],
                    fileNames,
                    'leaders-gallery'
                );
            } catch (error) {
                throw new BadRequestException(
                    `Failed to upload gallery: ${error instanceof Error ? error.message : 'Unknown error'}`,
                );
            }
        }

        // Create leader entry with uploaded photo URL
        return this.repository.create({
            ...input,
            photo: photoUrl,
            gallery: galleryUrls.length > 0 ? galleryUrls : undefined,
        });
    }

    async update(id: string, input: UpdateLeaderInput): Promise<Leader> {
        // If updating photo, handle upload
        if (input.photo) {
            try {
                this.imagekitService.validateImageSize(input.photo);

                const fileName = `leader_${Date.now()}.jpg`;
                const uploadResult = await this.imagekitService.uploadMultipleImages(
                    [input.photo] as unknown as Uploadable[],
                    [fileName],
                    'leaders',
                );

                return this.repository.update(id, {
                    ...input,
                    photo: uploadResult[0],
                });
            } catch (error) {
                throw new BadRequestException(
                    `Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}`,
                );
            }
        }

        let galleryUrls: string[] | undefined;
        if (input.gallery && input.gallery.length > 0) {
            try {
                input.gallery.forEach(img => this.imagekitService.validateImageSize(img));
                const fileNames = input.gallery.map((_, i) => `leader_gallery_${Date.now()}_${i}.jpg`);
                galleryUrls = await this.imagekitService.uploadMultipleImages(
                    input.gallery as unknown as Uploadable[],
                    fileNames,
                    'leaders-gallery'
                );
            } catch (error) {
                throw new BadRequestException(`Failed to upload gallery: ${error}`);
            }
        }

        return this.repository.update(id, {
            ...input,
            ...(input.photo ? { photo: (await this.imagekitService.uploadMultipleImages([input.photo] as unknown as Uploadable[], [`leader_${Date.now()}.jpg`], 'leaders'))[0] } : {}),
            ...(galleryUrls ? { gallery: galleryUrls } : {}),
        });
    }

    async updateStatus(id: string, status: LeaderStatus, adminNotes?: string): Promise<Leader> {
        return this.repository.updateStatus(id, status, adminNotes);
    }

    async delete(id: string): Promise<Leader> {
        return this.repository.delete(id);
    }
}
