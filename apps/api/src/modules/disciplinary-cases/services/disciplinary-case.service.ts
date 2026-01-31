import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { DisciplinaryCasesRepository } from '../repositories/disciplinary-cases.repository';
import { CreateDisciplinaryCaseInput, DisciplinaryCaseFilterInput, UpdateCaseStatusInput, RecordDecisionInput } from '../dto/disciplinary-case.input';
import { DisciplinaryCase, CaseStatus, ActionOutcome, CaseVisibility } from '../entities/disciplinary-case.entity';
import { ImageKitService } from '../../../common/imagekit/imagekit.service';
import { type Uploadable } from '@imagekit/nodejs';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class DisciplinaryCaseService {
    private readonly logger = new Logger(DisciplinaryCaseService.name);

    constructor(
        private readonly repository: DisciplinaryCasesRepository,
        private readonly imagekitService: ImageKitService,
    ) { }

    private generateCaseNumber(): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
        // Format: DC-YYYYMM-RAND
        return `DC-${year}${month}-${random}`;
    }

    async create(input: CreateDisciplinaryCaseInput, initiatedBy: string, userRole: UserRole): Promise<DisciplinaryCase> {
        // Only ADMIN and SUPER_ADMIN can create cases
        if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Only administrators can initiate disciplinary cases');
        }

        const caseNumber = this.generateCaseNumber();
        let evidenceUrls: string[] = input.evidenceUrls || [];
        let imageUrls: string[] = [];
        let leaderPhotoUrl: string | undefined = input.leaderPhotoUrl;

        // Handle leader photo upload if provided (base64 string)
        if (input.leaderPhotoUrl && !input.leaderPhotoUrl.startsWith('http')) {
            try {
                this.imagekitService.validateImageSize(input.leaderPhotoUrl);
                const fileName = `leader_photo_${caseNumber}_${Date.now()}.jpg`;
                const uploadedUrls = await this.imagekitService.uploadMultipleImages(
                    [input.leaderPhotoUrl] as unknown as Uploadable[],
                    [fileName],
                    'disciplinary-cases/leader-photos'
                );
                leaderPhotoUrl = uploadedUrls[0];
            } catch (error) {
                this.logger.error(`Failed to upload leader photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
                throw new BadRequestException(`Failed to upload leader photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        // Handle image uploads if provided (base64 strings or URLs)
        if (input.imageUrls && input.imageUrls.length > 0) {
            try {
                // Filter out already uploaded URLs (assuming they start with http/https)
                const newImages = input.imageUrls.filter(img => !img.startsWith('http'));
                const existingImages = input.imageUrls.filter(img => img.startsWith('http'));

                let uploadedUrls: string[] = [];

                if (newImages.length > 0) {
                    // Validate images
                    newImages.forEach(img => this.imagekitService.validateImageSize(img));

                    const fileNames = newImages.map((_, i) => `disciplinary_case_${caseNumber}_${Date.now()}_${i}.jpg`);

                    uploadedUrls = await this.imagekitService.uploadMultipleImages(
                        newImages as unknown as Uploadable[],
                        fileNames,
                        'disciplinary-cases'
                    );
                }

                imageUrls = [...existingImages, ...uploadedUrls];
            } catch (error) {
                this.logger.error(`Failed to upload case images: ${error instanceof Error ? error.message : 'Unknown error'}`);
                throw new BadRequestException(`Failed to upload case images: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        // Handle document evidence uploads (base64 strings or URLs)
        if (input.evidenceUrls && input.evidenceUrls.length > 0) {
            try {
                const newDocs = input.evidenceUrls.filter(doc => !doc.startsWith('http'));
                const existingDocs = input.evidenceUrls.filter(doc => doc.startsWith('http'));

                let uploadedDocUrls: string[] = [];

                if (newDocs.length > 0) {
                    // Validate docs (max 5MB)
                    newDocs.forEach(doc => this.imagekitService.validateFileSize(doc, 5120));

                    const fileNames = newDocs.map((_, i) => `disciplinary_case_doc_${caseNumber}_${Date.now()}_${i}`);

                    uploadedDocUrls = await this.imagekitService.uploadMultipleImages(
                        newDocs as unknown as Uploadable[],
                        fileNames,
                        'disciplinary-cases-docs'
                    );
                }

                evidenceUrls = [...existingDocs, ...uploadedDocUrls];
            } catch (error) {
                this.logger.error(`Failed to upload case documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
                throw new BadRequestException(`Failed to upload case documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        // Update input with processed URLs
        const caseInput = {
            ...input,
            leaderPhotoUrl,
            imageUrls,
            evidenceUrls,
            sourceLinks: input.sourceLinks || []
        };

        return this.repository.create(caseInput, initiatedBy, caseNumber);
    }

    async findAll(filter?: DisciplinaryCaseFilterInput, userRole?: string): Promise<DisciplinaryCase[]> {
        return this.repository.findAll(filter, userRole);
    }

    async findById(id: string, userRole?: string): Promise<DisciplinaryCase> {
        const disciplinaryCase = await this.repository.findById(id);

        if (!disciplinaryCase) {
            throw new NotFoundException(`Disciplinary case with ID ${id} not found`);
        }

        // Visibility check
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
        if (!isAdmin && disciplinaryCase.visibility === CaseVisibility.INTERNAL_ONLY) {
            throw new ForbiddenException('You do not have permission to view this case');
        }

        if (!isAdmin && disciplinaryCase.visibility === CaseVisibility.RESTRICTED) {
            // Add specific logic for restricted cases if needed (e.g., specific roles)
            // For now, treat restricted as internal-only for normal users
            throw new ForbiddenException('You do not have permission to view this case');
        }

        return disciplinaryCase;
    }

    async updateStatus(id: string, input: UpdateCaseStatusInput, userRole: string): Promise<DisciplinaryCase> {
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Only administrators can update case status');
        }

        const existingCase = await this.repository.findById(id);
        if (!existingCase) {
            throw new NotFoundException(`Disciplinary case with ID ${id} not found`);
        }

        // Validate status transitions if strict workflow is needed
        // For administrative flexibility, we allow most transitions for now

        return this.repository.updateStatus(id, input);
    }

    async recordDecision(id: string, input: RecordDecisionInput, decisionAuthority: string, userRole: string): Promise<DisciplinaryCase> {
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Only administrators can record decisions');
        }

        const existingCase = await this.repository.findById(id);
        if (!existingCase) {
            throw new NotFoundException(`Disciplinary case with ID ${id} not found`);
        }

        return this.repository.recordDecision(id, input, decisionAuthority);
    }

    async updateVisibility(id: string, visibility: CaseVisibility, userRole: string): Promise<DisciplinaryCase> {
        if (userRole !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Only Super Admins can change case visibility');
        }

        const existingCase = await this.repository.findById(id);
        if (!existingCase) {
            throw new NotFoundException(`Disciplinary case with ID ${id} not found`);
        }

        return this.repository.updateVisibility(id, visibility);
    }

    async addInternalNote(id: string, note: string, userRole: string): Promise<DisciplinaryCase> {
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Only administrators can add internal notes');
        }

        const existingCase = await this.repository.findById(id);
        if (!existingCase) {
            throw new NotFoundException(`Disciplinary case with ID ${id} not found`);
        }

        return this.repository.addInternalNote(id, note);
    }

    async addImages(id: string, images: string[], userRole: string): Promise<DisciplinaryCase> {
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Only administrators can add case images');
        }

        const existingCase = await this.repository.findById(id);
        if (!existingCase) {
            throw new NotFoundException(`Disciplinary case with ID ${id} not found`);
        }

        try {
            // Filter out already uploaded URLs
            const newImages = images.filter(img => !img.startsWith('http'));

            if (newImages.length === 0) {
                return existingCase;
            }

            // Validate images
            newImages.forEach(img => this.imagekitService.validateImageSize(img));

            const fileNames = newImages.map((_, i) => `disciplinary_case_${existingCase.caseNumber}_add_${Date.now()}_${i}.jpg`);

            const uploadedUrls = await this.imagekitService.uploadMultipleImages(
                newImages as unknown as Uploadable[],
                fileNames,
                'disciplinary-cases'
            );

            return this.repository.addImages(id, uploadedUrls);
        } catch (error) {
            this.logger.error(`Failed to add images: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new BadRequestException(`Failed to add images: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
