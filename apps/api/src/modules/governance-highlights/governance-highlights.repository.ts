import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateGovernanceHighlightInput, UpdateGovernanceHighlightInput } from './dto/governance-highlight.input';
import { GovernanceHighlight } from './entities/governance-highlight.entity';

@Injectable()
export class GovernanceHighlightsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<GovernanceHighlight[]> {
        return this.prisma.governanceHighlight.findMany({
            where: {
                isVerified: true,
                isVisible: true,
            },
            orderBy: { createdAt: 'desc' },
        }) as Promise<GovernanceHighlight[]>;
    }

    async findByCategory(category: string): Promise<GovernanceHighlight[]> {
        return this.prisma.governanceHighlight.findMany({
            where: {
                category: category as any,
                isVerified: true,
                isVisible: true,
            },
            orderBy: { createdAt: 'desc' },
        }) as Promise<GovernanceHighlight[]>;
    }

    async findById(id: string): Promise<GovernanceHighlight | null> {
        return this.prisma.governanceHighlight.findUnique({
            where: { id },
        }) as Promise<GovernanceHighlight | null>;
    }

    async create(input: CreateGovernanceHighlightInput): Promise<GovernanceHighlight> {
        return this.prisma.governanceHighlight.create({
            data: {
                ...input,
                isVerified: true, // SUPER_ADMIN creates verified highlights
            },
        }) as Promise<GovernanceHighlight>;
    }

    async update(id: string, input: UpdateGovernanceHighlightInput): Promise<GovernanceHighlight> {
        return this.prisma.governanceHighlight.update({
            where: { id },
            data: input,
        }) as Promise<GovernanceHighlight>;
    }

    async delete(id: string): Promise<GovernanceHighlight> {
        return this.prisma.governanceHighlight.delete({
            where: { id },
        }) as Promise<GovernanceHighlight>;
    }
}
