import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { type Uploadable } from '@imagekit/nodejs';
import { ImageKitService } from '../../common/imagekit/imagekit.service';
import { CreateVoiceInput, UpdateVoiceInput, UpdateVoiceStatusInput, VoiceFilterInput } from './dto/voice.input';
import { Voice, VoiceDashboardStats, VoiceStatus } from './entities/voice.entity';
import { VoicesRepository } from './voices.repository';

@Injectable()
export class VoicesService {
    constructor(
        private readonly repository: VoicesRepository,
        private readonly imagekitService: ImageKitService,
    ) { }

    private isUploadedUrl(value?: string | null): value is string {
        return typeof value === 'string' && /^https?:\/\//i.test(value);
    }

    private async uploadImages(images?: string[], prefix = 'voice'): Promise<string[]> {
        if (!images?.length) {
            return [];
        }

        const existingImages = images.filter((image) => this.isUploadedUrl(image));
        const newImages = images.filter((image) => !this.isUploadedUrl(image));

        if (!newImages.length) {
            return existingImages;
        }

        this.imagekitService.validateImageCount(newImages.length);
        newImages.forEach((image) => this.imagekitService.validateImageSize(image));

        const fileNames = newImages.map((_, index) => `${prefix}_${Date.now()}_${index}.jpg`);
        const uploadedImages = await this.imagekitService.uploadMultipleImages(
            newImages as unknown as Uploadable[],
            fileNames,
            'voices/images',
        );

        return [...existingImages, ...uploadedImages];
    }

    private async uploadSingleMedia(media: string | undefined, folder: string, prefix: string): Promise<string | undefined> {
        if (!media) {
            return undefined;
        }

        if (this.isUploadedUrl(media)) {
            return media;
        }

        this.imagekitService.validateFileSize(media, 5120);

        const [uploadedUrl] = await this.imagekitService.uploadMultipleImages(
            [media] as unknown as Uploadable[],
            [`${prefix}_${Date.now()}`],
            folder,
        );

        return uploadedUrl;
    }

    async create(input: CreateVoiceInput, submittedById?: string): Promise<Voice> {
        const images = await this.uploadImages(input.images, 'voice');
        const videoUrl = await this.uploadSingleMedia(input.videoUrl, 'voices/video', 'voice_video');
        const audioUrl = await this.uploadSingleMedia(input.audioUrl, 'voices/audio', 'voice_audio');

        return this.repository.create(submittedById, {
            ...input,
            images,
            videoUrl,
            audioUrl,
        });
    }

    async findAll(userRole?: string, take = 50, skip = 0): Promise<Voice[]> {
        if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
            return this.repository.findAllForAdmin(undefined, take, skip);
        }
        return this.repository.findAllPublic(take, skip);
    }

    async findAllPublic(take = 20, skip = 0): Promise<Voice[]> {
        return this.repository.findAllPublic(take, skip);
    }

    async findAllForAdmin(filter?: VoiceFilterInput, take = 50, skip = 0): Promise<Voice[]> {
        return this.repository.findAllForAdmin(filter, take, skip);
    }

    async findById(id: string, userId?: string, userRole?: string): Promise<Voice> {
        const voice = await this.repository.findById(id);

        if (!voice) {
            throw new NotFoundException('Voice not found');
        }

        const isSuperAdmin = userRole === 'SUPER_ADMIN';

        if (voice.status !== VoiceStatus.APPROVED && !isSuperAdmin) {
            throw new ForbiddenException('You do not have permission to view this voice');
        }

        return voice;
    }

    async findByUser(userId: string, take = 20, skip = 0): Promise<Voice[]> {
        return this.repository.findByUser(userId, take, skip);
    }

    async update(id: string, input: UpdateVoiceInput): Promise<Voice> {
        const existingVoice = await this.repository.findById(id);

        if (!existingVoice) {
            throw new NotFoundException('Voice not found');
        }

        const images = input.images ? await this.uploadImages(input.images, 'voice_update') : undefined;
        const videoUrl = input.videoUrl === ''
            ? null
            : input.videoUrl !== undefined
                ? await this.uploadSingleMedia(input.videoUrl, 'voices/video', 'voice_video') ?? null
                : undefined;
        const audioUrl = input.audioUrl === ''
            ? null
            : input.audioUrl !== undefined
                ? await this.uploadSingleMedia(input.audioUrl, 'voices/audio', 'voice_audio') ?? null
                : undefined;

        return this.repository.update(id, {
            ...input,
            ...(images ? { images } : {}),
            ...(videoUrl !== undefined ? { videoUrl } : {}),
            ...(audioUrl !== undefined ? { audioUrl } : {}),
        });
    }

    async updateStatus(id: string, input: UpdateVoiceStatusInput, reviewedById: string): Promise<Voice> {
        const existingVoice = await this.repository.findById(id);

        if (!existingVoice) {
            throw new NotFoundException('Voice not found');
        }

        if (input.status === VoiceStatus.REJECTED && !input.rejectionReason) {
            throw new BadRequestException('Rejection reason is required when rejecting a voice');
        }

        return this.repository.updateStatus(
            id,
            input.status,
            reviewedById,
            input.adminNotes,
            input.rejectionReason,
        );
    }

    async delete(id: string): Promise<Voice> {
        const existingVoice = await this.repository.findById(id);

        if (!existingVoice) {
            throw new NotFoundException('Voice not found');
        }

        return this.repository.delete(id);
    }

    async getDashboardStats(): Promise<VoiceDashboardStats> {
        return this.repository.countByStatus();
    }
}