import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProjectInput, UpdateProjectInput } from './dto/project.input';
import { Project } from './entities/project.entity';
import { ProjectStatus } from './entities/project-status.enum';

@Injectable()
export class ProjectsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Project | null> {
        return this.prisma.project.findUnique({
            where: { id },
            include: { owner: true },
        }) as Promise<Project | null>;
    }

    async findAll(status?: ProjectStatus): Promise<Project[]> {
        return this.prisma.project.findMany({
            where: status ? { status } : undefined,
            include: { owner: true },
            orderBy: { createdAt: 'desc' },
        }) as Promise<Project[]>;
    }

    async findByUserId(userId: string): Promise<Project[]> {
        return this.prisma.project.findMany({
            where: { ownerId: userId },
            include: { owner: true },
            orderBy: { createdAt: 'desc' },
        }) as Promise<Project[]>;
    }

    async create(input: CreateProjectInput & { ownerId: string }): Promise<Project> {
        return this.prisma.project.create({
            data: input,
            include: { owner: true },
        }) as Promise<Project>;
    }

    async update(id: string, input: UpdateProjectInput): Promise<Project> {
        return this.prisma.project.update({
            where: { id },
            data: input,
            include: { owner: true },
        }) as Promise<Project>;
    }

    async delete(id: string): Promise<Project> {
        return this.prisma.project.delete({
            where: { id },
            include: { owner: true },
        }) as Promise<Project>;
    }
}
