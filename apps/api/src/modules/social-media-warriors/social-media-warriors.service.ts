import { Injectable, BadRequestException } from '@nestjs/common';
import { SocialMediaWarriorsRepository } from './social-media-warriors.repository';
import { CreateSocialMediaWarriorInput, UpdateSocialMediaWarriorInput } from './dto/social-media-warrior.input';
import { SocialMediaWarrior, WarriorStatus } from './entities/social-media-warrior.entity';
import { ImageKitService } from '../../common/imagekit/imagekit.service';
import { type Uploadable } from '@imagekit/nodejs';

@Injectable()
export class SocialMediaWarriorsService {
    constructor(
        private readonly repository: SocialMediaWarriorsRepository,
        private readonly imagekitService: ImageKitService,
    ) { }

    async findAll(isSuperAdmin: boolean = false, take = 20, skip = 0): Promise<SocialMediaWarrior[]> {
        return this.repository.findAll(isSuperAdmin, take, skip);
    }

    async findById(id: string): Promise<SocialMediaWarrior | null> {
        return this.repository.findById(id);
    }

    async findByStatus(status: WarriorStatus): Promise<SocialMediaWarrior[]> {
        return this.repository.findByStatus(status);
    }

    async create(input: CreateSocialMediaWarriorInput): Promise<SocialMediaWarrior> {
        // Validate before any uploads
        if (input.photo) this.imagekitService.validateImageSize(input.photo);
        if (input.gallery?.length) input.gallery.forEach(img => this.imagekitService.validateImageSize(img));

        // Upload photo and gallery in parallel
        const ts = Date.now();
        const [photoResults, galleryResults] = await Promise.all([
            input.photo
                ? this.imagekitService.uploadMultipleImages(
                    [input.photo] as unknown as Uploadable[],
                    [`warrior_${ts}.jpg`],
                    'warriors',
                ).catch(err => { throw new BadRequestException(`Failed to upload photo: ${err instanceof Error ? err.message : 'Unknown error'}`); })
                : Promise.resolve([] as string[]),
            input.gallery?.length
                ? this.imagekitService.uploadMultipleImages(
                    input.gallery as unknown as Uploadable[],
                    input.gallery.map((_, i) => `warrior_gallery_${ts}_${i}.jpg`),
                    'warriors-gallery',
                ).catch(err => { throw new BadRequestException(`Failed to upload gallery: ${err instanceof Error ? err.message : 'Unknown error'}`); })
                : Promise.resolve([] as string[]),
        ]);

        return this.repository.create({
            ...input,
            photo: photoResults[0],
            gallery: galleryResults.length > 0 ? galleryResults : undefined,
        });
    }

    async update(id: string, input: UpdateSocialMediaWarriorInput): Promise<SocialMediaWarrior> {
        // If updating photo, handle upload
        if (input.photo) {
            try {
                this.imagekitService.validateImageSize(input.photo);
                const fileName = `warrior_${Date.now()}.jpg`;
                const uploadResult = await this.imagekitService.uploadMultipleImages(
                    [input.photo] as unknown as Uploadable[],
                    [fileName],
                    'warriors',
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
                const fileNames = input.gallery.map((_, i) => `warrior_gallery_${Date.now()}_${i}.jpg`);
                galleryUrls = await this.imagekitService.uploadMultipleImages(
                    input.gallery as unknown as Uploadable[],
                    fileNames,
                    'warriors-gallery'
                );
            } catch (error) {
                throw new BadRequestException(`Failed to upload gallery: ${error}`);
            }
        }

        return this.repository.update(id, {
            ...input,
            ...(input.photo ? { photo: (await this.imagekitService.uploadMultipleImages([input.photo] as unknown as Uploadable[], [`warrior_${Date.now()}.jpg`], 'warriors'))[0] } : {}),
            ...(galleryUrls ? { gallery: galleryUrls } : {}),
        });
    }

    async updateStatus(id: string, status: WarriorStatus, adminNotes?: string): Promise<SocialMediaWarrior> {
        return this.repository.updateStatus(id, status, adminNotes);
    }

    async delete(id: string): Promise<SocialMediaWarrior> {
        return this.repository.delete(id);
    }
}
