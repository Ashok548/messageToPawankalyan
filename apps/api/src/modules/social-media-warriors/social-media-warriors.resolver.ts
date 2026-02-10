import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SocialMediaWarriorsService } from './social-media-warriors.service';
import { SocialMediaWarrior, WarriorStatus } from './entities/social-media-warrior.entity';
import { CreateSocialMediaWarriorInput, UpdateSocialMediaWarriorInput } from './dto/social-media-warrior.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { OptionalGqlAuthGuard } from '../../common/guards/optional-gql-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@Resolver(() => SocialMediaWarrior)
export class SocialMediaWarriorsResolver {
    constructor(private readonly service: SocialMediaWarriorsService) { }

    @Query(() => [SocialMediaWarrior], { name: 'socialMediaWarriors', description: 'Get social media warriors (all for super admin, approved only for others)' })
    @UseGuards(OptionalGqlAuthGuard)
    async findAll(@Context() context: any): Promise<SocialMediaWarrior[]> {
        const user = context.req?.user;
        console.log(user)
        const isSuperAdmin = user?.role === 'SUPER_ADMIN';
        return this.service.findAll(isSuperAdmin);
    }

    @Query(() => SocialMediaWarrior, { name: 'socialMediaWarrior', nullable: true })
    async findOne(@Args('id') id: string): Promise<SocialMediaWarrior | null> {
        return this.service.findById(id);
    }

    @Query(() => [SocialMediaWarrior], { name: 'socialMediaWarriorsByStatus', description: 'Admin only: Get warriors by status' })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async findByStatus(@Args('status', { type: () => WarriorStatus }) status: WarriorStatus): Promise<SocialMediaWarrior[]> {
        return this.service.findByStatus(status);
    }

    @Mutation(() => SocialMediaWarrior, { description: 'Admin only: Create new social media warrior profile' })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async createSocialMediaWarrior(
        @Args('input') input: CreateSocialMediaWarriorInput,
    ): Promise<SocialMediaWarrior> {
        return this.service.create(input);
    }

    @Mutation(() => SocialMediaWarrior, { description: 'Admin only: Update social media warrior profile' })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async updateSocialMediaWarrior(
        @Args('id') id: string,
        @Args('input') input: UpdateSocialMediaWarriorInput,
    ): Promise<SocialMediaWarrior> {
        return this.service.update(id, input);
    }

    @Mutation(() => SocialMediaWarrior, { description: 'Admin only: Update warrior status' })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async updateSocialMediaWarriorStatus(
        @Args('id') id: string,
        @Args('status', { type: () => WarriorStatus }) status: WarriorStatus,
        @Args('adminNotes', { nullable: true }) adminNotes?: string,
    ): Promise<SocialMediaWarrior> {
        return this.service.updateStatus(id, status, adminNotes);
    }

    @Mutation(() => SocialMediaWarrior, { description: 'Admin only: Delete warrior profile' })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async deleteSocialMediaWarrior(@Args('id') id: string): Promise<SocialMediaWarrior> {
        return this.service.delete(id);
    }
}
