import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationInput } from '../../common/dto/pagination.input';
import { AdminGuard } from '../../common/guards/admin.guard';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { GqlOptionalAuthGuard } from '../../common/guards/gql-optional-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { AnalysisFilterInput, CreateAnalysisInput, UpdateAnalysisStatusInput } from './dto/analysis.input';
import { Analysis } from './entities/analysis.entity';
import { AnalysisService } from './analysis.service';

@Resolver(() => Analysis)
export class AnalysisResolver {
    constructor(private readonly analysisService: AnalysisService) {}

    @Query(() => [Analysis], {
        name: 'analyses',
        description: 'Approved analyses for a given public issue',
    })
    @UseGuards(GqlOptionalAuthGuard)
    async analyses(
        @Args('issueId') issueId: string,
        @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    ): Promise<Analysis[]> {
        return this.analysisService.findByIssue(issueId, pagination);
    }

    @Query(() => Analysis, { name: 'analysis', description: 'Single analysis by ID' })
    @UseGuards(GqlOptionalAuthGuard)
    async analysis(
        @Args('id') id: string,
        @CurrentUser() user?: { id: string; role?: string },
    ): Promise<Analysis> {
        return this.analysisService.findById(id, user?.role);
    }

    @Query(() => [Analysis], {
        name: 'allAnalyses',
        description: 'SUPER_ADMIN only: all analyses including pending and rejected',
    })
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async allAnalyses(
        @Args('filter', { nullable: true }) filter?: AnalysisFilterInput,
        @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    ): Promise<Analysis[]> {
        return this.analysisService.findAllForAdmin(filter, pagination);
    }

    @Mutation(() => Analysis, {
        description: 'Admin: submit a structured analysis on a public issue',
    })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async createAnalysis(
        @Args('input') input: CreateAnalysisInput,
        @CurrentUser() user: { id: string; role?: string },
    ): Promise<Analysis> {
        return this.analysisService.create(input, user.id, user.role);
    }

    @Mutation(() => Analysis, {
        description: 'SUPER_ADMIN: approve or reject an analysis submission',
    })
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async updateAnalysisStatus(
        @Args('id') id: string,
        @Args('input') input: UpdateAnalysisStatusInput,
        @CurrentUser() user: { id: string },
    ): Promise<Analysis> {
        return this.analysisService.updateStatus(id, input, user.id);
    }
}
