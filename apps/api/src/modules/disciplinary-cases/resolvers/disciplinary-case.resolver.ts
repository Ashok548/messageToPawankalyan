import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DisciplinaryCaseService } from '../services/disciplinary-case.service';
import { DisciplinaryCase, CaseVisibility } from '../entities/disciplinary-case.entity';
import { CreateDisciplinaryCaseInput, DisciplinaryCaseFilterInput, UpdateCaseStatusInput, RecordDecisionInput } from '../dto/disciplinary-case.input';
import { GqlAuthGuard } from '../../../common/guards/gql-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { SuperAdminGuard } from '../../../common/guards/super-admin.guard';
import { GqlOptionalAuthGuard } from '../../../common/guards/gql-optional-auth.guard';
import { UserRole } from '../../users/entities/user.entity';

@Resolver(() => DisciplinaryCase)
export class DisciplinaryCaseResolver {
    constructor(private readonly service: DisciplinaryCaseService) { }

    @Query(() => [DisciplinaryCase], { name: 'disciplinaryCases', description: 'List disciplinary cases with optional filtering' })
    @UseGuards(GqlOptionalAuthGuard)
    async findAll(
        @Context() context: any,
        @Args('filter', { nullable: true }) filter?: DisciplinaryCaseFilterInput,
    ) {
        // Allow public access for public cases, but restrict internal ones
        // If not authenticated, context.req.user will be undefined
        const userRole = context.req?.user?.role;
        return this.service.findAll(filter, userRole);
    }

    @Query(() => DisciplinaryCase, { name: 'disciplinaryCase', description: 'Get a single disciplinary case by ID' })
    @UseGuards(GqlOptionalAuthGuard)
    async findOne(
        @Args('id', { type: () => ID }) id: string,
        @Context() context: any,
    ) {
        const userRole = context.req?.user?.role;
        return this.service.findById(id, userRole);
    }

    @Mutation(() => DisciplinaryCase, { description: 'Create a new disciplinary case' })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async createDisciplinaryCase(
        @Args('input') input: CreateDisciplinaryCaseInput,
        @Context() context: any,
    ) {
        const user = context.req.user;
        return this.service.create(input, user.id, user.role);
    }

    @Mutation(() => DisciplinaryCase, { description: 'Update the status of a disciplinary case' })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async updateCaseStatus(
        @Args('id', { type: () => ID }) id: string,
        @Args('input') input: UpdateCaseStatusInput,
        @Context() context: any,
    ) {
        const user = context.req.user;
        return this.service.updateStatus(id, input, user.role);
    }

    @Mutation(() => DisciplinaryCase, { description: 'Record a final decision and action outcome' })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async recordCaseDecision(
        @Args('id', { type: () => ID }) id: string,
        @Args('input') input: RecordDecisionInput,
        @Context() context: any,
    ) {
        const user = context.req.user;
        return this.service.recordDecision(id, input, user.id, user.role);
    }

    @Mutation(() => DisciplinaryCase, { description: 'Update visibility setting of a case' })
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async updateCaseVisibility(
        @Args('id', { type: () => ID }) id: string,
        @Args('visibility', { type: () => CaseVisibility }) visibility: CaseVisibility,
        @Context() context: any,
    ) {
        const user = context.req.user;
        return this.service.updateVisibility(id, visibility, user.role);
    }

    @Mutation(() => DisciplinaryCase, { description: 'Add an internal note to a case' })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async addCaseInternalNote(
        @Args('id', { type: () => ID }) id: string,
        @Args('note') note: string,
        @Context() context: any,
    ) {
        const user = context.req.user;
        return this.service.addInternalNote(id, note, user.role);
    }

    @Mutation(() => DisciplinaryCase, { description: 'Upload and attach additional photos to a case' })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async uploadCaseImages(
        @Args('id', { type: () => ID }) id: string,
        @Args('images', { type: () => [String] }) images: string[],
        @Context() context: any,
    ) {
        const user = context.req.user;
        return this.service.addImages(id, images, user.role);
    }
}
