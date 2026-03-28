import { Injectable } from '@nestjs/common';
import { Prisma, Voice as PrismaVoice, VoiceStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateVoiceInput, UpdateVoiceInput, VoiceFilterInput } from './dto/voice.input';
import { Voice, VoiceDashboardStats } from './entities/voice.entity';

type VoiceWithRelations = PrismaVoice & {
    submittedByUser: {
        id: string;
        name: string;
        mobile: string;
        email: string | null;
        role: string;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        otp: string | null;
    } | null;
    reviewedByUser: {
        id: string;
        name: string;
        mobile: string;
        email: string | null;
        role: string;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        otp: string | null;
    } | null;
};

@Injectable()
export class VoicesRepository {
    constructor(private readonly prisma: PrismaService) { }

    private readonly includeRelations = {
        submittedByUser: true,
        reviewedByUser: true,
    } satisfies Prisma.VoiceInclude;

    private mapToEntity(voice: VoiceWithRelations): Voice {
        return voice as unknown as Voice;
    }

    private buildWhere(filter?: VoiceFilterInput): Prisma.VoiceWhereInput {
        const where: Prisma.VoiceWhereInput = {};

        if (!filter) {
            return where;
        }

        if (filter.status) {
            where.status = filter.status;
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

    async findAllPublic(take = 20, skip = 0): Promise<Voice[]> {
        const voices = await this.prisma.voice.findMany({
            where: { status: VoiceStatus.APPROVED },
            include: this.includeRelations,
            orderBy: { createdAt: 'desc' },
            take,
            skip,
        });

        return voices.map((voice) => this.mapToEntity(voice as VoiceWithRelations));
    }

    async findAllForAdmin(filter?: VoiceFilterInput, take = 50, skip = 0): Promise<Voice[]> {
        const voices = await this.prisma.voice.findMany({
            where: this.buildWhere(filter),
            include: this.includeRelations,
            orderBy: { createdAt: 'desc' },
            take,
            skip,
        });

        return voices.map((voice) => this.mapToEntity(voice as VoiceWithRelations));
    }

    async findById(id: string): Promise<Voice | null> {
        const voice = await this.prisma.voice.findUnique({
            where: { id },
            include: this.includeRelations,
        });

        return voice ? this.mapToEntity(voice as VoiceWithRelations) : null;
    }

    async findByUser(userId: string, take = 20, skip = 0): Promise<Voice[]> {
        const voices = await this.prisma.voice.findMany({
            where: { submittedById: userId },
            include: this.includeRelations,
            orderBy: { createdAt: 'desc' },
            take,
            skip,
        });

        return voices.map((voice) => this.mapToEntity(voice as VoiceWithRelations));
    }

    async create(submittedById: string | undefined, data: CreateVoiceInput & { images: string[]; videoUrl?: string; audioUrl?: string }): Promise<Voice> {
        const voice = await this.prisma.voice.create({
            data: {
                ...data,
                images: data.images || [],
                status: VoiceStatus.PENDING,
                ...(submittedById ? { submittedById } : {}),
            },
            include: this.includeRelations,
        });

        return this.mapToEntity(voice as VoiceWithRelations);
    }

    async update(id: string, data: UpdateVoiceInput & { images?: string[]; videoUrl?: string | null; audioUrl?: string | null }): Promise<Voice> {
        const voice = await this.prisma.voice.update({
            where: { id },
            data: {
                ...data,
                ...(data.videoUrl === undefined ? {} : { videoUrl: data.videoUrl }),
                ...(data.audioUrl === undefined ? {} : { audioUrl: data.audioUrl }),
            },
            include: this.includeRelations,
        });

        return this.mapToEntity(voice as VoiceWithRelations);
    }

    async updateStatus(id: string, status: VoiceStatus, reviewedById: string, adminNotes?: string, rejectionReason?: string): Promise<Voice> {
        const voice = await this.prisma.voice.update({
            where: { id },
            data: {
                status,
                reviewedById,
                reviewedAt: new Date(),
                adminNotes,
                rejectionReason,
            },
            include: this.includeRelations,
        });

        return this.mapToEntity(voice as VoiceWithRelations);
    }

    async delete(id: string): Promise<Voice> {
        const voice = await this.prisma.voice.delete({
            where: { id },
            include: this.includeRelations,
        });

        return this.mapToEntity(voice as VoiceWithRelations);
    }

    async countByStatus(): Promise<VoiceDashboardStats> {
        const [pending, approved, rejected, underReview, resolved, total] = await Promise.all([
            this.prisma.voice.count({ where: { status: VoiceStatus.PENDING } }),
            this.prisma.voice.count({ where: { status: VoiceStatus.APPROVED } }),
            this.prisma.voice.count({ where: { status: VoiceStatus.REJECTED } }),
            this.prisma.voice.count({ where: { status: VoiceStatus.UNDER_REVIEW } }),
            this.prisma.voice.count({ where: { status: VoiceStatus.RESOLVED } }),
            this.prisma.voice.count(),
        ]);

        return {
            pending,
            approved,
            rejected,
            underReview,
            resolved,
            total,
        };
    }
}