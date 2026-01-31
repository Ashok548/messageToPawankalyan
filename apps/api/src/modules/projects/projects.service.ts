import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectInput, UpdateProjectInput } from './dto/project.input';
import { Project } from './entities/project.entity';
import { ProjectStatus } from './entities/project-status.enum';

@Injectable()
export class ProjectsService {
    constructor(private readonly projectsRepository: ProjectsRepository) { }

    async findById(id: string): Promise<Project> {
        const project = await this.projectsRepository.findById(id);
        if (!project) {
            throw new NotFoundException('Project not found');
        }
        return project;
    }

    async findAll(status?: ProjectStatus): Promise<Project[]> {
        return this.projectsRepository.findAll(status);
    }

    async findByUserId(userId: string): Promise<Project[]> {
        return this.projectsRepository.findByUserId(userId);
    }

    async create(input: CreateProjectInput, ownerId: string): Promise<Project> {
        return this.projectsRepository.create({
            ...input,
            ownerId,
        });
    }

    async update(id: string, input: UpdateProjectInput): Promise<Project> {
        // Check if project exists
        await this.findById(id);
        return this.projectsRepository.update(id, input);
    }

    async delete(id: string): Promise<Project> {
        // Check if project exists
        await this.findById(id);
        return this.projectsRepository.delete(id);
    }
}
