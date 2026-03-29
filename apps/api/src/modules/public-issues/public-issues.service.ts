import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { type Uploadable } from '@imagekit/nodejs';
import { ImageKitService } from '../../common/imagekit/imagekit.service';
import {
    CreatePublicIssueInput,
    PublicIssueFilterInput,
    UpdatePublicIssueInput,
    UpdatePublicIssueStatusInput,
} from './dto/public-issue.input';
import { IssuePriority, PublicIssue, PublicIssueCategory, PublicIssueStatus, VerificationStatus } from './entities/public-issue.entity';
import { PublicIssuesRepository } from './public-issues.repository';

@Injectable()
export class PublicIssuesService {
    constructor(
        private readonly repository: PublicIssuesRepository,
        private readonly imagekitService: ImageKitService,
    ) { }

    private isUploadedUrl(value?: string | null): value is string {
        return typeof value === 'string' && /^https?:\/\//i.test(value);
    }

    private async uploadImages(images?: string[], prefix = 'public_issue'): Promise<string[]> {
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
            'public-issues/images',
        );

        return [...existingImages, ...uploadedImages];
    }

    private validateCreateInput(input: CreatePublicIssueInput): void {
        const title = input.title?.trim();
        const description = input.description?.trim();
        const state = input.state?.trim();
        const district = input.district?.trim();

        if (!title || title.length < 5) {
            throw new BadRequestException('Title must be at least 5 characters');
        }

        if (!description || description.length < 20) {
            throw new BadRequestException('Description must be at least 20 characters');
        }

        if (!input.category) {
            throw new BadRequestException('Category is required');
        }

        if (!state) {
            throw new BadRequestException('State is required');
        }

        if (!district) {
            throw new BadRequestException('District is required');
        }

        const sensitiveCategories = new Set<PublicIssueCategory>([
            PublicIssueCategory.CORRUPTION,
            PublicIssueCategory.LAND_MAFIA,
            PublicIssueCategory.INDUSTRIAL_POLLUTION,
        ]);
        const requiresMedia = sensitiveCategories.has(input.category);

        if (requiresMedia && !(input.images?.length || input.mediaUrls?.length)) {
            throw new BadRequestException('Media is required for sensitive categories');
        }
    }

    async create(input: CreatePublicIssueInput, submittedById?: string): Promise<PublicIssue> {
        this.validateCreateInput(input);
        const images = await this.uploadImages(input.images, 'public_issue');

        return this.repository.create(submittedById, {
            ...input,
            images,
        });
    }

    async findAllPublic(filter?: PublicIssueFilterInput, take = 20, skip = 0, userId?: string): Promise<PublicIssue[]> {
        return this.repository.findAllPublic(filter, take, skip, userId);
    }

    async findAllForAdmin(filter?: PublicIssueFilterInput, take = 50, skip = 0, userId?: string): Promise<PublicIssue[]> {
        return this.repository.findAllForAdmin(filter, take, skip, userId);
    }

    private static readonly PUBLIC_STATUSES = new Set<PublicIssueStatus>([
        PublicIssueStatus.APPROVED,
        PublicIssueStatus.TAKEN_UP,
        PublicIssueStatus.IN_PROGRESS,
        PublicIssueStatus.RESOLVED,
    ]);

    async findById(id: string, userRole?: string, userId?: string): Promise<PublicIssue> {
        const issue = await this.repository.findById(id, userId);

        if (!issue) {
            throw new NotFoundException('Public issue not found');
        }

        const isSuperAdmin = userRole === 'SUPER_ADMIN';

        if (!PublicIssuesService.PUBLIC_STATUSES.has(issue.status) && !isSuperAdmin) {
            throw new ForbiddenException('You do not have permission to view this issue');
        }

        return issue;
    }

    async update(id: string, input: UpdatePublicIssueInput): Promise<PublicIssue> {
        const existingIssue = await this.repository.findById(id);

        if (!existingIssue) {
            throw new NotFoundException('Public issue not found');
        }

        const images = input.images ? await this.uploadImages(input.images, 'public_issue_update') : undefined;

        return this.repository.update(id, {
            ...input,
            ...(images ? { images } : {}),
        });
    }

    private static readonly VALID_TRANSITIONS: Readonly<Record<PublicIssueStatus, Set<PublicIssueStatus>>> = {
        [PublicIssueStatus.PENDING]: new Set([PublicIssueStatus.APPROVED, PublicIssueStatus.REJECTED]),
        [PublicIssueStatus.APPROVED]: new Set([PublicIssueStatus.TAKEN_UP, PublicIssueStatus.REJECTED, PublicIssueStatus.PENDING]),
        [PublicIssueStatus.TAKEN_UP]: new Set([PublicIssueStatus.IN_PROGRESS, PublicIssueStatus.APPROVED, PublicIssueStatus.REJECTED]),
        [PublicIssueStatus.IN_PROGRESS]: new Set([PublicIssueStatus.RESOLVED, PublicIssueStatus.TAKEN_UP, PublicIssueStatus.REJECTED]),
        [PublicIssueStatus.RESOLVED]: new Set([PublicIssueStatus.APPROVED]),
        [PublicIssueStatus.REJECTED]: new Set([PublicIssueStatus.PENDING]),
    };

    async updateStatus(id: string, input: UpdatePublicIssueStatusInput, reviewedById: string): Promise<PublicIssue> {
        const existingIssue = await this.repository.findById(id);

        if (!existingIssue) {
            throw new NotFoundException('Public issue not found');
        }

        const allowedNextStatuses = PublicIssuesService.VALID_TRANSITIONS[existingIssue.status];
        if (!allowedNextStatuses.has(input.status)) {
            throw new BadRequestException(
                `Cannot transition from ${existingIssue.status} to ${input.status}. ` +
                `Allowed transitions: ${[...allowedNextStatuses].join(', ')}`,
            );
        }

        if (input.status === PublicIssueStatus.REJECTED && !input.rejectionReason) {
            throw new BadRequestException('Rejection reason is required when rejecting an issue');
        }

        return this.repository.updateStatus(
            id,
            input.status,
            reviewedById,
            input.adminNotes,
            input.rejectionReason,
        );
    }

    async approveIssue(id: string, reviewedById: string, adminNotes?: string): Promise<PublicIssue> {
        return this.updateStatus(id, {
            status: PublicIssueStatus.APPROVED,
            adminNotes,
        }, reviewedById);
    }

    async rejectIssue(id: string, reviewedById: string, rejectionReason: string, adminNotes?: string): Promise<PublicIssue> {
        return this.updateStatus(id, {
            status: PublicIssueStatus.REJECTED,
            rejectionReason,
            adminNotes,
        }, reviewedById);
    }

    async updatePriority(id: string, priority: IssuePriority, reviewedById: string): Promise<PublicIssue> {
        const existingIssue = await this.repository.findById(id);

        if (!existingIssue) {
            throw new NotFoundException('Public issue not found');
        }

        return this.repository.updatePriority(id, priority, reviewedById);
    }

    async updateVerificationStatus(id: string, verificationStatus: VerificationStatus, reviewedById: string): Promise<PublicIssue> {
        const existingIssue = await this.repository.findById(id);

        if (!existingIssue) {
            throw new NotFoundException('Public issue not found');
        }

        return this.repository.updateVerificationStatus(id, verificationStatus, reviewedById);
    }

    private async validateSupportableIssue(issueId: string, userId?: string): Promise<PublicIssue> {
        const existing = await this.repository.findById(issueId, userId);

        if (!existing) {
            throw new NotFoundException('Public issue not found');
        }

        if (!PublicIssuesService.PUBLIC_STATUSES.has(existing.status)) {
            throw new BadRequestException('You can only support publicly visible issues');
        }

        return existing;
    }

    private resolveSupportIdentity(userId?: string, anonymousSupporterKey?: string): { userId?: string; anonymousSupporterKey?: string } {
        if (userId) {
            return { userId };
        }

        const trimmedAnonymousSupporterKey = anonymousSupporterKey?.trim();

        if (!trimmedAnonymousSupporterKey) {
            throw new BadRequestException('Anonymous supporter key is required');
        }

        return { anonymousSupporterKey: trimmedAnonymousSupporterKey };
    }

    async addSupport(issueId: string, userId?: string, anonymousSupporterKey?: string): Promise<PublicIssue> {
        await this.validateSupportableIssue(issueId, userId);
        return this.repository.addSupport(issueId, this.resolveSupportIdentity(userId, anonymousSupporterKey));
    }

    async removeSupport(issueId: string, userId: string): Promise<PublicIssue> {
        await this.validateSupportableIssue(issueId, userId);
        return this.repository.removeSupport(issueId, userId);
    }

    async toggleSupport(issueId: string, userId?: string, anonymousSupporterKey?: string): Promise<PublicIssue> {
        await this.validateSupportableIssue(issueId, userId);
        return this.repository.addSupport(issueId, this.resolveSupportIdentity(userId, anonymousSupporterKey));
    }

    async delete(id: string): Promise<PublicIssue> {
        const existing = await this.repository.findById(id);

        if (!existing) {
            throw new NotFoundException('Public issue not found');
        }

        return this.repository.delete(id);
    }
}