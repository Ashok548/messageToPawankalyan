import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AnalysisStatus } from '@prisma/client';
import { PaginationInput } from '../../common/dto/pagination.input';
import { AnalysisFilterInput, CreateAnalysisInput, UpdateAnalysisStatusInput } from './dto/analysis.input';
import { Analysis } from './entities/analysis.entity';
import { AnalysisRepository } from './analysis.repository';
import { PublicIssuesRepository } from './public-issues.repository';

@Injectable()
export class AnalysisService {
    constructor(
        private readonly repository: AnalysisRepository,
        private readonly publicIssuesRepository: PublicIssuesRepository,
    ) {}

    private async ensureIssueExists(issueId: string): Promise<void> {
        const issue = await this.publicIssuesRepository.findById(issueId);

        if (!issue) {
            throw new NotFoundException('Public issue not found');
        }
    }

    async create(input: CreateAnalysisInput, createdById: string, creatorRole?: string): Promise<Analysis> {
        await this.ensureIssueExists(input.issueId);
        const analysis = await this.repository.create(createdById, input);

        // Super admins shouldn't need their own submissions moderated — auto-approve immediately.
        if (creatorRole === 'SUPER_ADMIN') {
            return this.repository.updateStatus(
                analysis.id,
                AnalysisStatus.APPROVED,
                createdById,
            );
        }

        return analysis;
    }

    async findByIssue(issueId: string, pagination?: PaginationInput): Promise<Analysis[]> {
        await this.ensureIssueExists(issueId);
        return this.repository.findAllPublic(issueId, pagination?.take, pagination?.skip);
    }

    async findAllForAdmin(filter?: AnalysisFilterInput, pagination?: PaginationInput): Promise<Analysis[]> {
        return this.repository.findAllForAdmin(filter, pagination?.take, pagination?.skip);
    }

    async findById(id: string, userRole?: string): Promise<Analysis> {
        const analysis = await this.repository.findById(id);

        if (!analysis) {
            throw new NotFoundException('Analysis not found');
        }

        const isSuperAdmin = userRole === 'SUPER_ADMIN';

        if (analysis.status !== AnalysisStatus.APPROVED && !isSuperAdmin) {
            throw new ForbiddenException('You do not have permission to view this analysis');
        }

        return analysis;
    }

    async updateStatus(id: string, input: UpdateAnalysisStatusInput, reviewedById: string): Promise<Analysis> {
        const existing = await this.repository.findById(id);

        if (!existing) {
            throw new NotFoundException('Analysis not found');
        }

        if (input.status === AnalysisStatus.REJECTED && !input.rejectionReason) {
            throw new BadRequestException('Rejection reason is required when rejecting an analysis');
        }

        return this.repository.updateStatus(
            id,
            input.status,
            reviewedById,
            input.adminNotes,
            input.rejectionReason,
        );
    }

    async approveAnalysis(id: string, reviewedById: string, adminNotes?: string): Promise<Analysis> {
        return this.updateStatus(id, {
            status: AnalysisStatus.APPROVED,
            adminNotes,
        }, reviewedById);
    }

    async rejectAnalysis(id: string, reviewedById: string, rejectionReason: string, adminNotes?: string): Promise<Analysis> {
        return this.updateStatus(id, {
            status: AnalysisStatus.REJECTED,
            rejectionReason,
            adminNotes,
        }, reviewedById);
    }
}
