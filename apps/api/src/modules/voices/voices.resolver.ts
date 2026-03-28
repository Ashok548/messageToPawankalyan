import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationInput } from '../../common/dto/pagination.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { GqlOptionalAuthGuard } from '../../common/guards/gql-optional-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { CreateVoiceInput, UpdateVoiceInput, UpdateVoiceStatusInput, VoiceFilterInput } from './dto/voice.input';
import { Voice, VoiceDashboardStats } from './entities/voice.entity';
import { VoicesService } from './voices.service';

@Resolver(() => Voice)
export class VoicesResolver {
    constructor(private readonly voicesService: VoicesService) { }

    @Query(() => [Voice], { name: 'voices', description: 'Approved voices for public; all voices for admins' })
    @UseGuards(GqlOptionalAuthGuard)
    async voices(
        @CurrentUser() user?: { id?: string; role?: string },
        @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    ): Promise<Voice[]> {
        return this.voicesService.findAll(user?.role, pagination?.take, pagination?.skip);
    }

    @Query(() => Voice, { name: 'voice' })
    @UseGuards(GqlOptionalAuthGuard)
    async voice(
        @Args('id') id: string,
        @CurrentUser() user?: { id?: string; role?: string },
    ): Promise<Voice> {
        return this.voicesService.findById(id, user?.id, user?.role);
    }

    @Query(() => [Voice], { name: 'myVoices' })
    @UseGuards(GqlAuthGuard)
    async myVoices(
        @CurrentUser() user: { id: string },
        @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    ): Promise<Voice[]> {
        return this.voicesService.findByUser(user.id, pagination?.take, pagination?.skip);
    }

    @Query(() => [Voice], { name: 'allVoices', description: 'SUPER_ADMIN only: all voices with moderation states' })
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async allVoices(
        @Args('filter', { nullable: true }) filter?: VoiceFilterInput,
        @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    ): Promise<Voice[]> {
        return this.voicesService.findAllForAdmin(filter, pagination?.take, pagination?.skip);
    }

    @Query(() => VoiceDashboardStats, { name: 'voiceDashboardStats' })
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async voiceDashboardStats(): Promise<VoiceDashboardStats> {
        return this.voicesService.getDashboardStats();
    }

    @Mutation(() => Voice)
    @UseGuards(GqlOptionalAuthGuard)
    async createVoice(
        @Args('input') input: CreateVoiceInput,
        @CurrentUser() user?: { id: string },
    ): Promise<Voice> {
        return this.voicesService.create(input, user?.id);
    }

    @Mutation(() => Voice)
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async updateVoice(
        @Args('id') id: string,
        @Args('input') input: UpdateVoiceInput,
    ): Promise<Voice> {
        return this.voicesService.update(id, input);
    }

    @Mutation(() => Voice)
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async updateVoiceStatus(
        @Args('id') id: string,
        @Args('input') input: UpdateVoiceStatusInput,
        @CurrentUser() user: { id: string },
    ): Promise<Voice> {
        return this.voicesService.updateStatus(id, input, user.id);
    }

    @Mutation(() => Voice)
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async deleteVoice(@Args('id') id: string): Promise<Voice> {
        return this.voicesService.delete(id);
    }
}