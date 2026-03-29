import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationInput } from '../../common/dto/pagination.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { GqlOptionalAuthGuard } from '../../common/guards/gql-optional-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import {
    CreatePublicIssueInput,
    PublicIssueFilterInput,
    UpdatePublicIssueInput,
    UpdatePublicIssueStatusInput,
} from './dto/public-issue.input';
import { PublicIssue } from './entities/public-issue.entity';
import { PublicIssuesService } from './public-issues.service';

@Resolver(() => PublicIssue)
export class PublicIssuesResolver {
    constructor(private readonly publicIssuesService: PublicIssuesService) { }

    @Query(() => [PublicIssue], { name: 'publicIssues', description: 'Approved public issues only' })
    @UseGuards(GqlOptionalAuthGuard)
    async publicIssues(
        @Args('filter', { nullable: true }) filter?: PublicIssueFilterInput,
        @Args('pagination', { nullable: true }) pagination?: PaginationInput,
        @CurrentUser() user?: { id: string },
    ): Promise<PublicIssue[]> {
        return this.publicIssuesService.findAllPublic(filter, pagination?.take, pagination?.skip, user?.id);
    }

    @Query(() => PublicIssue, { name: 'publicIssue' })
    @UseGuards(GqlOptionalAuthGuard)
    async publicIssue(
        @Args('id') id: string,
        @CurrentUser() user?: { id: string; role?: string },
    ): Promise<PublicIssue> {
        return this.publicIssuesService.findById(id, user?.role, user?.id);
    }

    @Query(() => [PublicIssue], { name: 'allPublicIssues', description: 'SUPER_ADMIN only: all public issues with moderation states' })
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async allPublicIssues(
        @Args('filter', { nullable: true }) filter?: PublicIssueFilterInput,
        @Args('pagination', { nullable: true }) pagination?: PaginationInput,
        @CurrentUser() user?: { id: string },
    ): Promise<PublicIssue[]> {
        return this.publicIssuesService.findAllForAdmin(filter, pagination?.take, pagination?.skip, user?.id);
    }

    @Mutation(() => PublicIssue)
    @UseGuards(GqlOptionalAuthGuard)
    async createPublicIssue(
        @Args('input') input: CreatePublicIssueInput,
        @CurrentUser() user?: { id: string },
    ): Promise<PublicIssue> {
        return this.publicIssuesService.create(input, user?.id);
    }

    @Mutation(() => PublicIssue)
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async updatePublicIssue(
        @Args('id') id: string,
        @Args('input') input: UpdatePublicIssueInput,
    ): Promise<PublicIssue> {
        return this.publicIssuesService.update(id, input);
    }

    @Mutation(() => PublicIssue)
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async updatePublicIssueStatus(
        @Args('id') id: string,
        @Args('input') input: UpdatePublicIssueStatusInput,
        @CurrentUser() user: { id: string },
    ): Promise<PublicIssue> {
        return this.publicIssuesService.updateStatus(id, input, user.id);
    }

    @Mutation(() => PublicIssue)
    @UseGuards(GqlOptionalAuthGuard)
    async togglePublicIssueSupport(
        @Args('id') id: string,
        @Args('anonymousSupporterKey', { nullable: true }) anonymousSupporterKey?: string,
        @CurrentUser() user?: { id: string },
    ): Promise<PublicIssue> {
        return this.publicIssuesService.toggleSupport(id, user?.id, anonymousSupporterKey);
    }

    @Mutation(() => PublicIssue)
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async deletePublicIssue(@Args('id') id: string): Promise<PublicIssue> {
        return this.publicIssuesService.delete(id);
    }
}