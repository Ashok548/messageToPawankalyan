import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GovernanceHighlightsService } from './governance-highlights.service';
import { GovernanceHighlight, HighlightCategory } from './entities/governance-highlight.entity';
import { CreateGovernanceHighlightInput, UpdateGovernanceHighlightInput } from './dto/governance-highlight.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';

@Resolver(() => GovernanceHighlight)
export class GovernanceHighlightsResolver {
    constructor(private readonly service: GovernanceHighlightsService) { }

    @Query(() => [GovernanceHighlight], { name: 'governanceHighlights', description: 'Get all verified and visible governance highlights' })
    async findAll(
        @Args('category', { type: () => HighlightCategory, nullable: true }) category?: HighlightCategory
    ): Promise<GovernanceHighlight[]> {
        if (category) {
            return this.service.findByCategory(category);
        }
        return this.service.findAll();
    }

    @Query(() => GovernanceHighlight, { name: 'governanceHighlight', nullable: true })
    async findOne(@Args('id') id: string): Promise<GovernanceHighlight | null> {
        return this.service.findById(id);
    }

    @Mutation(() => GovernanceHighlight, { description: 'SUPER_ADMIN only: Create new governance highlight' })
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async createGovernanceHighlight(
        @Args('input') input: CreateGovernanceHighlightInput,
    ): Promise<GovernanceHighlight> {
        return this.service.create(input);
    }

    @Mutation(() => GovernanceHighlight, { description: 'SUPER_ADMIN only: Update governance highlight' })
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async updateGovernanceHighlight(
        @Args('id') id: string,
        @Args('input') input: UpdateGovernanceHighlightInput,
    ): Promise<GovernanceHighlight> {
        return this.service.update(id, input);
    }

    @Mutation(() => GovernanceHighlight, { description: 'SUPER_ADMIN only: Toggle visibility' })
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async toggleGovernanceHighlightVisibility(@Args('id') id: string): Promise<GovernanceHighlight> {
        return this.service.toggleVisibility(id);
    }

    @Mutation(() => GovernanceHighlight, { description: 'SUPER_ADMIN only: Delete governance highlight' })
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async deleteGovernanceHighlight(@Args('id') id: string): Promise<GovernanceHighlight> {
        return this.service.delete(id);
    }
}
