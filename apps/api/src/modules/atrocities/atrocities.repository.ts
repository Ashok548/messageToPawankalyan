import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAtrocityInput, UpdateAtrocityInput } from './dto/atrocity.input';
import { Atrocity } from './entities/atrocity.entity';

@Injectable()
export class AtrocitiesRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<Atrocity[]> {
        return this.prisma.atrocity.findMany({
            orderBy: { createdAt: 'desc' },
        }) as Promise<Atrocity[]>;
    }

    async findByVerificationStatus(isVerified: boolean): Promise<Atrocity[]> {
        return this.prisma.atrocity.findMany({
            where: { isVerified },
            orderBy: { createdAt: 'desc' },
        }) as Promise<Atrocity[]>;
    }

    async findById(id: string): Promise<Atrocity | null> {
        return this.prisma.atrocity.findUnique({
            where: { id },
        }) as Promise<Atrocity | null>;
    }

    async create(input: CreateAtrocityInput): Promise<Atrocity> {
        return this.prisma.atrocity.create({
            data: input,
        }) as Promise<Atrocity>;
    }

    async update(id: string, input: UpdateAtrocityInput): Promise<Atrocity> {
        return this.prisma.atrocity.update({
            where: { id },
            data: input,
        }) as Promise<Atrocity>;
    }

    async delete(id: string): Promise<Atrocity> {
        return this.prisma.atrocity.delete({
            where: { id },
        }) as Promise<Atrocity>;
    }
}
