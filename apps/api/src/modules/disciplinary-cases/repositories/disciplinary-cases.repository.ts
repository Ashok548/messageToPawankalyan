import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { DisciplinaryCase, Prisma } from '@prisma/client';
import { CreateDisciplinaryCaseInput, DisciplinaryCaseFilterInput, UpdateCaseStatusInput, RecordDecisionInput } from '../dto/disciplinary-case.input';
import { CaseVisibility } from '../entities/disciplinary-case.entity';

@Injectable()
export class DisciplinaryCasesRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(input: CreateDisciplinaryCaseInput, initiatedBy: string, caseNumber: string): Promise<DisciplinaryCase> {
        return this.prisma.disciplinaryCase.create({
            data: {
                caseNumber,
                leaderName: input.leaderName,
                leaderPhotoUrl: input.leaderPhotoUrl,
                position: input.position,
                constituency: input.constituency,
                district: input.district,
                issueCategory: input.issueCategory,
                issueDescription: input.issueDescription,
                issueSource: input.issueSource,
                initiatedBy,
                evidenceUrls: input.evidenceUrls || [],
                imageUrls: input.imageUrls || [],
                sourceLinks: input.sourceLinks || [],
            },
            include: {
                initiatedByUser: true,
            },
        });
    }

    async findById(id: string): Promise<DisciplinaryCase | null> {
        return this.prisma.disciplinaryCase.findUnique({
            where: { id },
            include: {
                initiatedByUser: true,
                reviewAuthorityUser: true,
                decisionAuthorityUser: true,
            },
        });
    }

    async findAll(filter?: DisciplinaryCaseFilterInput, userRole?: string): Promise<DisciplinaryCase[]> {
        const where: Prisma.DisciplinaryCaseWhereInput = {};

        // Apply visibility filter based on user role
        if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
            where.visibility = 'PUBLIC';
        }

        if (filter) {
            if (filter.status) {
                where.status = filter.status;
            }
            if (filter.issueCategory) {
                where.issueCategory = filter.issueCategory;
            }
            // Remove leaderId filter since we no longer have foreign key
            if (filter.visibility && (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN')) {
                where.visibility = filter.visibility;
            }
            if (filter.searchTerm) {
                where.OR = [
                    { caseNumber: { contains: filter.searchTerm, mode: 'insensitive' } },
                    { leaderName: { contains: filter.searchTerm, mode: 'insensitive' } },
                ];
            }
        }

        return this.prisma.disciplinaryCase.findMany({
            where,
            include: {
                initiatedByUser: true,
                reviewAuthorityUser: true,
                decisionAuthorityUser: true,
            },
            orderBy: {
                initiationDate: 'desc',
            },
        });
    }

    async updateStatus(id: string, input: UpdateCaseStatusInput): Promise<DisciplinaryCase> {
        return this.prisma.disciplinaryCase.update({
            where: { id },
            data: {
                status: input.status,
                internalNotes: input.internalNotes,
                reviewAuthority: input.reviewAuthority,
                reviewStartDate: input.reviewStartDate ? new Date(input.reviewStartDate) : undefined,
            },
            include: {
                initiatedByUser: true,
                reviewAuthorityUser: true,
                decisionAuthorityUser: true,
            },
        });
    }

    async recordDecision(id: string, input: RecordDecisionInput, decisionAuthority: string): Promise<DisciplinaryCase> {
        return this.prisma.disciplinaryCase.update({
            where: { id },
            data: {
                actionOutcome: input.actionOutcome,
                decisionRationale: input.decisionRationale,
                decisionAuthority,
                decisionDate: new Date(),
                effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : undefined,
                effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : undefined,
                status: 'ACTION_TAKEN',
            },
            include: {
                initiatedByUser: true,
                reviewAuthorityUser: true,
                decisionAuthorityUser: true,
            },
        });
    }

    async updateVisibility(id: string, visibility: CaseVisibility): Promise<DisciplinaryCase> {
        return this.prisma.disciplinaryCase.update({
            where: { id },
            data: { visibility },
            include: {
                initiatedByUser: true,
                reviewAuthorityUser: true,
                decisionAuthorityUser: true,
            },
        });
    }

    async addInternalNote(id: string, note: string): Promise<DisciplinaryCase> {
        const existingCase = await this.findById(id);
        const updatedNotes = existingCase?.internalNotes
            ? `${existingCase.internalNotes}\n\n---\n${new Date().toISOString()}\n${note}`
            : note;

        return this.prisma.disciplinaryCase.update({
            where: { id },
            data: { internalNotes: updatedNotes },
            include: {
                initiatedByUser: true,
                reviewAuthorityUser: true,
                decisionAuthorityUser: true,
            },
        });
    }

    async addImages(id: string, imageUrls: string[]): Promise<DisciplinaryCase> {
        const existingCase = await this.findById(id);
        const updatedImages = [...(existingCase?.imageUrls || []), ...imageUrls];

        return this.prisma.disciplinaryCase.update({
            where: { id },
            data: { imageUrls: updatedImages },
            include: {
                initiatedByUser: true,
                reviewAuthorityUser: true,
                decisionAuthorityUser: true,
            },
        });
    }

    async update(id: string, data: Partial<DisciplinaryCase>): Promise<DisciplinaryCase> {
        // Convert date strings to Date objects if present
        const updateData: any = { ...data };
        if (updateData.initiationDate && typeof updateData.initiationDate === 'string') {
            updateData.initiationDate = new Date(updateData.initiationDate);
        }

        return this.prisma.disciplinaryCase.update({
            where: { id },
            data: updateData,
            include: {
                initiatedByUser: true,
                reviewAuthorityUser: true,
                decisionAuthorityUser: true,
            },
        });
    }
}
