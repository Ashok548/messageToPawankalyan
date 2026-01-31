import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Leader as PrismaLeader, Prisma } from '@prisma/client';
import { Leader, OtherPlatform, LeaderStatus } from './entities/leader.entity';
import { CreateLeaderInput, UpdateLeaderInput } from './dto/leader.input';

@Injectable()
export class LeadersRepository {
    constructor(private readonly prisma: PrismaService) { }

    private mapToEntity(leader: PrismaLeader): Leader {
        return {
            ...leader,
            otherPlatforms: (leader.otherPlatforms as unknown as OtherPlatform[]) ?? [],
        };
    }

    async findAll(): Promise<Leader[]> {
        const leaders = await this.prisma.leader.findMany({
            where: { status: LeaderStatus.APPROVED },
            orderBy: { createdAt: 'desc' },
        });
        return leaders.map(this.mapToEntity);
    }

    async findById(id: string): Promise<Leader | null> {
        const leader = await this.prisma.leader.findUnique({
            where: { id },
        });
        return leader ? this.mapToEntity(leader) : null;
    }

    async findByStatus(status: LeaderStatus): Promise<Leader[]> {
        const leaders = await this.prisma.leader.findMany({
            where: { status },
            orderBy: { createdAt: 'desc' },
        });
        return leaders.map(this.mapToEntity);
    }

    async create(data: CreateLeaderInput): Promise<Leader> {
        const leaderData = {
            ...data,
            otherPlatforms: data.otherPlatforms ? (data.otherPlatforms as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
            status: LeaderStatus.PENDING,
        };
        const leader = await this.prisma.leader.create({
            data: leaderData,
        });
        return this.mapToEntity(leader);
    }

    async update(id: string, data: UpdateLeaderInput): Promise<Leader> {
        const updateData: Prisma.LeaderUpdateInput = {
            ...data,
            otherPlatforms: data.otherPlatforms ? (data.otherPlatforms as unknown as Prisma.InputJsonValue) : undefined,
        };
        const leader = await this.prisma.leader.update({
            where: { id },
            data: updateData,
        });
        return this.mapToEntity(leader);
    }

    async updateStatus(id: string, status: LeaderStatus, adminNotes?: string): Promise<Leader> {
        const leader = await this.prisma.leader.update({
            where: { id },
            data: { status, adminNotes },
        });
        return this.mapToEntity(leader);
    }

    async delete(id: string): Promise<Leader> {
        const leader = await this.prisma.leader.delete({
            where: { id },
        });
        return this.mapToEntity(leader);
    }
}
