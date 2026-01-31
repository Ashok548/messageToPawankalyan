import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LeadersService } from './leaders.service';
import { Leader, LeaderStatus } from './entities/leader.entity';
import { CreateLeaderInput, UpdateLeaderInput } from './dto/leader.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@Resolver(() => Leader)
export class LeadersResolver {
    constructor(private readonly service: LeadersService) { }

    @Query(() => [Leader], { name: 'leaders', description: 'Get all approved leaders' })
    async findAll(): Promise<Leader[]> {
        return this.service.findAll();
    }

    @Query(() => Leader, { name: 'leader', nullable: true })
    async findOne(@Args('id') id: string): Promise<Leader | null> {
        return this.service.findById(id);
    }

    @Query(() => [Leader], { name: 'leadersByStatus', description: 'Admin only: Get leaders by status' })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async findByStatus(@Args('status', { type: () => LeaderStatus }) status: LeaderStatus): Promise<Leader[]> {
        return this.service.findByStatus(status);
    }

    @Mutation(() => Leader, { description: 'Admin only: Create new leader profile' })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async createLeader(
        @Args('input') input: CreateLeaderInput,
    ): Promise<Leader> {
        return this.service.create(input);
    }

    @Mutation(() => Leader, { description: 'Admin only: Update leader profile' })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async updateLeader(
        @Args('id') id: string,
        @Args('input') input: UpdateLeaderInput,
    ): Promise<Leader> {
        return this.service.update(id, input);
    }

    @Mutation(() => Leader, { description: 'Admin only: Update leader status' })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async updateLeaderStatus(
        @Args('id') id: string,
        @Args('status', { type: () => LeaderStatus }) status: LeaderStatus,
        @Args('adminNotes', { nullable: true }) adminNotes?: string,
    ): Promise<Leader> {
        return this.service.updateStatus(id, status, adminNotes);
    }

    @Mutation(() => Leader, { description: 'Admin only: Delete leader profile' })
    @UseGuards(GqlAuthGuard, AdminGuard)
    async deleteLeader(@Args('id') id: string): Promise<Leader> {
        return this.service.delete(id);
    }
}
