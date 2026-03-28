import { Injectable } from '@nestjs/common';
import { IssuePriority, Prisma, PublicIssue as PrismaPublicIssue, PublicIssueStatus, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreatePublicIssueInput, PublicIssueFilterInput, PublicIssueSortBy, UpdatePublicIssueInput } from './dto/public-issue.input';
import { PublicIssue } from './entities/public-issue.entity';

const NOTABLE_THRESHOLD = 10;
const HIGH_THRESHOLD = 50;

function computePriority(count: number): IssuePriority {
    if (count >= HIGH_THRESHOLD) return IssuePriority.HIGH;
    if (count >= NOTABLE_THRESHOLD) return IssuePriority.NOTABLE;
    return IssuePriority.NORMAL;
}

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

type PublicIssueWithRelations = PrismaPublicIssue & {
    submittedByUser: SelectedUser | null;
    reviewedByUser: SelectedUser | null;
};

@Injectable()
export class PublicIssuesRepository {
    constructor(private readonly prisma: PrismaService) { }

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
        submittedByUser: this.userSelect,
        reviewedByUser: this.userSelect,
    } satisfies Prisma.PublicIssueInclude;

    private mapToEntity(issue: PublicIssueWithRelations): PublicIssue {
        return issue as unknown as PublicIssue;
    }

    private static readonly PRIORITY_RANK: Record<IssuePriority, number> = {
        [IssuePriority.NORMAL]: 0,
        [IssuePriority.NOTABLE]: 1,
        [IssuePriority.HIGH]: 2,
    };

    private async syncSupportMetadata(tx: Prisma.TransactionClient, issueId: string): Promise<PublicIssueWithRelations> {
        const supportCount = await tx.publicIssueSupport.count({ where: { issueId } });
        const computedPriority = computePriority(supportCount);

        // Preserve admin-set priority if it is higher than what the support count computes,
        // so manual overrides are never silently downgraded by community activity.
        const current = await tx.publicIssue.findUnique({
            where: { id: issueId },
            select: { priority: true },
        });
        const effectivePriority =
            current && PublicIssuesRepository.PRIORITY_RANK[current.priority] > PublicIssuesRepository.PRIORITY_RANK[computedPriority]
                ? current.priority
                : computedPriority;

        return tx.publicIssue.update({
            where: { id: issueId },
            data: {
                supportCount,
                priority: effectivePriority,
                isHighPriority: effectivePriority === IssuePriority.HIGH,
            },
            include: this.includeRelations,
        }) as Promise<PublicIssueWithRelations>;
    }

    private buildOrderBy(filter?: PublicIssueFilterInput): Prisma.PublicIssueOrderByWithRelationInput[] {
        if (filter?.priority === IssuePriority.HIGH) {
            return [
                { supportCount: 'desc' },
                { createdAt: 'desc' },
            ];
        }

        if (filter?.sortBy === PublicIssueSortBy.TRENDING) {
            return [
                { supportCount: 'desc' },
                { createdAt: 'desc' },
            ];
        }

        return [{ createdAt: 'desc' }];
    }

    private buildWhere(filter?: PublicIssueFilterInput): Prisma.PublicIssueWhereInput {
        const where: Prisma.PublicIssueWhereInput = {};

        if (!filter) {
            return where;
        }

        if (filter.status) {
            where.status = filter.status;
        }

        if (filter.priority) {
            where.priority = filter.priority;
        }

        if (filter.category) {
            where.category = filter.category;
        }

        if (filter.district) {
            where.district = filter.district;
        }

        if (filter.state) {
            where.state = filter.state;
        }

        if (filter.searchTerm) {
            where.OR = [
                { title: { contains: filter.searchTerm, mode: 'insensitive' } },
                { description: { contains: filter.searchTerm, mode: 'insensitive' } },
            ];
        }

        if (filter.dateFrom || filter.dateTo) {
            where.createdAt = {
                ...(filter.dateFrom ? { gte: new Date(filter.dateFrom) } : {}),
                ...(filter.dateTo ? { lte: new Date(filter.dateTo) } : {}),
            };
        }

        return where;
    }

    private async attachHasUserSupported(issues: PublicIssue[], userId?: string): Promise<PublicIssue[]> {
        if (!userId || issues.length === 0) {
            return issues.map((issue) => ({ ...issue, hasUserSupported: false }));
        }

        const issueIds = issues.map((issue) => issue.id);
        const supported = await this.prisma.publicIssueSupport.findMany({
            where: { userId, issueId: { in: issueIds } },
            select: { issueId: true },
        });

        const supportedSet = new Set(supported.map((s) => s.issueId));
        return issues.map((issue) => ({ ...issue, hasUserSupported: supportedSet.has(issue.id) }));
    }

    private static readonly PUBLIC_STATUSES: PublicIssueStatus[] = [
        PublicIssueStatus.APPROVED,
    ];

    async findAllPublic(filter?: PublicIssueFilterInput, take = 20, skip = 0, userId?: string): Promise<PublicIssue[]> {
        const filterWhere = this.buildWhere(filter);
        // When a specific status is requested via filter, honour it only if it's a public one
        const statusFilter = filter?.status && PublicIssuesRepository.PUBLIC_STATUSES.includes(filter.status)
            ? { status: filter.status }
            : { status: { in: PublicIssuesRepository.PUBLIC_STATUSES } };

        const issues = await this.prisma.publicIssue.findMany({
            where: {
                ...filterWhere,
                ...statusFilter,
            },
            include: this.includeRelations,
            orderBy: this.buildOrderBy(filter),
            take,
            skip,
        });

        const mapped = issues.map((issue) => this.mapToEntity(issue as PublicIssueWithRelations));
        return this.attachHasUserSupported(mapped, userId);
    }

    async findAllForAdmin(filter?: PublicIssueFilterInput, take = 50, skip = 0, userId?: string): Promise<PublicIssue[]> {
        const issues = await this.prisma.publicIssue.findMany({
            where: this.buildWhere(filter),
            include: this.includeRelations,
            orderBy: this.buildOrderBy(filter),
            take,
            skip,
        });

        const mapped = issues.map((issue) => this.mapToEntity(issue as PublicIssueWithRelations));
        return this.attachHasUserSupported(mapped, userId);
    }

    async findById(id: string, userId?: string): Promise<PublicIssue | null> {
        const issue = await this.prisma.publicIssue.findUnique({
            where: { id },
            include: this.includeRelations,
        });

        if (!issue) {
            return null;
        }

        const mapped = this.mapToEntity(issue as PublicIssueWithRelations);

        if (userId) {
            const support = await this.prisma.publicIssueSupport.findUnique({
                where: { issueId_userId: { issueId: id, userId } },
            });
            return { ...mapped, hasUserSupported: !!support };
        }

        return { ...mapped, hasUserSupported: false };
    }

    async create(submittedById: string | undefined, data: CreatePublicIssueInput & { images: string[] }): Promise<PublicIssue> {
        const issue = await this.prisma.publicIssue.create({
            data: {
                ...data,
                images: data.images || [],
                status: PublicIssueStatus.PENDING,
                ...(submittedById ? { submittedById } : {}),
            },
            include: this.includeRelations,
        });

        return { ...this.mapToEntity(issue as PublicIssueWithRelations), hasUserSupported: false };
    }

    async update(id: string, data: UpdatePublicIssueInput & { images?: string[] }): Promise<PublicIssue> {
        const issue = await this.prisma.publicIssue.update({
            where: { id },
            data,
            include: this.includeRelations,
        });

        return this.mapToEntity(issue as PublicIssueWithRelations);
    }

    async updateStatus(id: string, status: PublicIssueStatus, reviewedById: string, adminNotes?: string, rejectionReason?: string): Promise<PublicIssue> {
        const now = new Date();
        const lifecycleTimestamps: Partial<Record<string, Date | null>> = {
            approvedAt: status === PublicIssueStatus.APPROVED ? now : undefined,
            takenUpAt: status === PublicIssueStatus.TAKEN_UP ? now : undefined,
            inProgressAt: status === PublicIssueStatus.IN_PROGRESS ? now : undefined,
            resolvedAt: status === PublicIssueStatus.RESOLVED ? now : undefined,
        };
        // Remove undefined keys so we don't overwrite existing timestamps
        const timestampData = Object.fromEntries(
            Object.entries(lifecycleTimestamps).filter(([, v]) => v !== undefined),
        );

        const issue = await this.prisma.publicIssue.update({
            where: { id },
            data: {
                status,
                reviewedById,
                reviewedAt: now,
                adminNotes,
                rejectionReason: status === PublicIssueStatus.REJECTED ? rejectionReason : null,
                ...timestampData,
            },
            include: this.includeRelations,
        });

        return this.mapToEntity(issue as PublicIssueWithRelations);
    }

    async updatePriority(id: string, priority: IssuePriority, reviewedById: string): Promise<PublicIssue> {
        const issue = await this.prisma.publicIssue.update({
            where: { id },
            data: {
                priority,
                isHighPriority: priority === IssuePriority.HIGH,
                reviewedById,
                reviewedAt: new Date(),
            },
            include: this.includeRelations,
        });

        return this.mapToEntity(issue as PublicIssueWithRelations);
    }

    async updateVerificationStatus(id: string, verificationStatus: PrismaPublicIssue['verificationStatus'], reviewedById: string): Promise<PublicIssue> {
        const issue = await this.prisma.publicIssue.update({
            where: { id },
            data: {
                verificationStatus,
                reviewedById,
                reviewedAt: new Date(),
            },
            include: this.includeRelations,
        });

        return this.mapToEntity(issue as PublicIssueWithRelations);
    }

    async addSupport(issueId: string, userId: string): Promise<PublicIssue> {
        const result = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.publicIssueSupport.findUnique({
                where: { issueId_userId: { issueId, userId } },
            });

            if (!existing) {
                await tx.publicIssueSupport.create({ data: { issueId, userId } });
            }

            const updated = await this.syncSupportMetadata(tx, issueId);
            return { issue: updated, hasUserSupported: true };
        });

        const mapped = this.mapToEntity(result.issue as unknown as PublicIssueWithRelations);
        return { ...mapped, hasUserSupported: result.hasUserSupported };
    }

    async removeSupport(issueId: string, userId: string): Promise<PublicIssue> {
        const result = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.publicIssueSupport.findUnique({
                where: { issueId_userId: { issueId, userId } },
            });

            if (existing) {
                await tx.publicIssueSupport.delete({
                    where: { issueId_userId: { issueId, userId } },
                });
            }

            const updated = await this.syncSupportMetadata(tx, issueId);
            return { issue: updated, hasUserSupported: false };
        });

        const mapped = this.mapToEntity(result.issue as unknown as PublicIssueWithRelations);
        return { ...mapped, hasUserSupported: result.hasUserSupported };
    }

    async toggleSupport(issueId: string, userId: string): Promise<PublicIssue> {
        const existing = await this.prisma.publicIssueSupport.findUnique({
            where: { issueId_userId: { issueId, userId } },
        });

        if (existing) {
            return this.removeSupport(issueId, userId);
        }

        return this.addSupport(issueId, userId);
    }

    async delete(id: string): Promise<PublicIssue> {
        const issue = await this.prisma.publicIssue.delete({
            where: { id },
            include: this.includeRelations,
        });

        return this.mapToEntity(issue as PublicIssueWithRelations);
    }
}