import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { CreateProjectInput, UpdateProjectInput } from './dto/project.input';
import { ProjectStatus } from './entities/project-status.enum';

@Resolver(() => Project)
export class ProjectsResolver {
    constructor(private readonly projectsService: ProjectsService) { }

    @Query(() => Project)
    async project(@Args('id') id: string): Promise<Project> {
        return this.projectsService.findById(id);
    }

    @Query(() => [Project])
    async projects(
        @Args('status', { nullable: true }) status?: ProjectStatus,
    ): Promise<Project[]> {
        return this.projectsService.findAll(status);
    }

    @Query(() => [Project])
    async userProjects(@Args('userId') userId: string): Promise<Project[]> {
        return this.projectsService.findByUserId(userId);
    }

    @Mutation(() => Project)
    async createProject(
        @Args('input') input: CreateProjectInput,
    ): Promise<Project> {
        // In a real app, get ownerId from JWT context
        // For now, use a hardcoded ID (you'll need to create a user first)
        const ownerId = 'user-id-from-jwt';
        return this.projectsService.create(input, ownerId);
    }

    @Mutation(() => Project)
    async updateProject(
        @Args('id') id: string,
        @Args('input') input: UpdateProjectInput,
    ): Promise<Project> {
        return this.projectsService.update(id, input);
    }

    @Mutation(() => Project)
    async deleteProject(@Args('id') id: string): Promise<Project> {
        return this.projectsService.delete(id);
    }
}
