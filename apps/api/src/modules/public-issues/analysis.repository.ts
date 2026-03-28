import { Injectable } from '@nestjs/common';
import { Analysis as PrismaAnalysis, AnalysisStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AnalysisFilterInput, CreateAnalysisInput } from './dto/analysis.input';
import { Analysis } from './entities/analysis.entity';

type SelectedUser = {
    id: string;
    name: string;
    mobile: string;
    email: string | null;
    role: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
};

type AnalysisWithRelations = PrismaAnalysis & {
    issue: {
        id: string;
        title: string;
        status: string;
    };
    createdByUser: SelectedUser;
    reviewedByUser: SelectedUser | null;
};

@Injectable()
export class AnalysisRepository {
    constructor(private readonly prisma: PrismaService) {}

    private readonly userSelect = {
        select: {
            id: true,
            name: true,
            mobile: true,
            email: true,
            role: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
        },
    };

    private readonly includeRelations = {
        issue: {
            select: {
                id: true,
                title: true,
                status: true,
            },
        },
        createdByUser: this.userSelect,
        reviewedByUser: this.userSelect,
    } satisfies Prisma.AnalysisInclude;

    private mapToEntity(analysis: AnalysisWithRelations): Analysis {
        return analysis as unknown as Analysis;
    }

    private buildWhere(filter?: AnalysisFilterInput): Prisma.AnalysisWhereInput {
        const where: Prisma.AnalysisWhereInput = {};

        if (!filter) {
            return where;
        }

        if (filter.status) {
            where.status = filter.status;
        }

        if (filter.issueId) {
            where.issueId = filter.issueId;
        }

        if (filter.createdById) {
            where.createdById = filter.createdById;
        }

        return where;
    }

    async findAllPublic(issueId: string, take = 20, skip = 0): Promise<Analysis[]> {
        const analyses = await this.prisma.analysis.findMany({
            where: { issueId, status: AnalysisStatus.APPROVED },
            include: this.includeRelations,
            orderBy: { createdAt: 'desc' },
            take,
            skip,
        });

        return analyses.map((a) => this.mapToEntity(a as unknown as AnalysisWithRelations));
    }

    async findAllForAdmin(filter?: AnalysisFilterInput, take = 50, skip = 0): Promise<Analysis[]> {
        const analyses = await this.prisma.analysis.findMany({
            where: this.buildWhere(filter),
            include: this.includeRelations,
            orderBy: { createdAt: 'desc' },
            take,
            skip,
        });

        return analyses.map((a) => this.mapToEntity(a as unknown as AnalysisWithRelations));
    }

    async findById(id: string): Promise<Analysis | null> {
        const analysis = await this.prisma.analysis.findUnique({
            where: { id },
            include: this.includeRelations,
        });

        if (!analysis) {
            return null;
        }

        return this.mapToEntity(analysis as unknown as AnalysisWithRelations);
    }

    async create(createdById: string, data: CreateAnalysisInput): Promise<Analysis> {
        const analysis = await this.prisma.analysis.create({
            data: {
                issueId: data.issueId,
                createdById,
                problemUnderstanding: data.problemUnderstanding,
                impact: data.impact,
                observations: data.observations,
                considerations: data.considerations,
                status: AnalysisStatus.PENDING,
            },
            include: this.includeRelations,
        });

        return this.mapToEntity(analysis as unknown as AnalysisWithRelations);
    }

    async updateStatus(
        id: string,
        status: AnalysisStatus,
        reviewedById: string,
        adminNotes?: string,
        rejectionReason?: string,
    ): Promise<Analysis> {
        const analysis = await this.prisma.analysis.update({
            where: { id },
            data: {
                status,
                reviewedById,
                reviewedAt: new Date(),
                adminNotes,
                rejectionReason: status === AnalysisStatus.REJECTED ? rejectionReason : null,
            },
            include: this.includeRelations,
        });

        return this.mapToEntity(analysis as unknown as AnalysisWithRelations);
    }
}
