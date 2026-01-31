import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SocialMediaWarrior as PrismaWarrior, Prisma } from '@prisma/client';
import { SocialMediaWarrior, WarriorOtherPlatform, WarriorStatus } from './entities/social-media-warrior.entity';
import { CreateSocialMediaWarriorInput, UpdateSocialMediaWarriorInput } from './dto/social-media-warrior.input';

@Injectable()
export class SocialMediaWarriorsRepository {
    constructor(private readonly prisma: PrismaService) { }

    private mapToEntity(warrior: PrismaWarrior): SocialMediaWarrior {
        return {
            ...warrior,
            otherPlatforms: (warrior.otherPlatforms as unknown as WarriorOtherPlatform[]) ?? [],
        };
    }

    async findAll(): Promise<SocialMediaWarrior[]> {
        const warriors = await this.prisma.socialMediaWarrior.findMany({
            where: { status: WarriorStatus.APPROVED },
            orderBy: { createdAt: 'desc' },
        });
        return warriors.map(this.mapToEntity);
    }

    async findById(id: string): Promise<SocialMediaWarrior | null> {
        const warrior = await this.prisma.socialMediaWarrior.findUnique({
            where: { id },
        });
        return warrior ? this.mapToEntity(warrior) : null;
    }

    async findByStatus(status: WarriorStatus): Promise<SocialMediaWarrior[]> {
        const warriors = await this.prisma.socialMediaWarrior.findMany({
            where: { status },
            orderBy: { createdAt: 'desc' },
        });
        return warriors.map(this.mapToEntity);
    }

    async create(data: CreateSocialMediaWarriorInput): Promise<SocialMediaWarrior> {
        const warriorData = {
            ...data,
            otherPlatforms: data.otherPlatforms ? (data.otherPlatforms as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
            status: WarriorStatus.PENDING,
        };
        const warrior = await this.prisma.socialMediaWarrior.create({
            data: warriorData,
        });
        return this.mapToEntity(warrior);
    }

    async update(id: string, data: UpdateSocialMediaWarriorInput): Promise<SocialMediaWarrior> {
        const updateData: Prisma.SocialMediaWarriorUpdateInput = {
            ...data,
            otherPlatforms: data.otherPlatforms ? (data.otherPlatforms as unknown as Prisma.InputJsonValue) : undefined,
        };
        const warrior = await this.prisma.socialMediaWarrior.update({
            where: { id },
            data: updateData,
        });
        return this.mapToEntity(warrior);
    }

    async updateStatus(id: string, status: WarriorStatus, adminNotes?: string): Promise<SocialMediaWarrior> {
        const warrior = await this.prisma.socialMediaWarrior.update({
            where: { id },
            data: { status, adminNotes },
        });
        return this.mapToEntity(warrior);
    }

    async delete(id: string): Promise<SocialMediaWarrior> {
        const warrior = await this.prisma.socialMediaWarrior.delete({
            where: { id },
        });
        return this.mapToEntity(warrior);
    }
}
