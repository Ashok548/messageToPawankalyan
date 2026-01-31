import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AtrocitiesService } from './atrocities.service';
import { Atrocity } from './entities/atrocity.entity';
import { CreateAtrocityInput, UpdateAtrocityInput } from './dto/atrocity.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';

@Resolver(() => Atrocity)
export class AtrocitiesResolver {
    constructor(private readonly service: AtrocitiesService) { }

    @Query(() => [Atrocity], { name: 'atrocities' })
    async findAll(): Promise<Atrocity[]> {
        return this.service.findAll();
    }

    @Query(() => [Atrocity], { name: 'unverifiedAtrocities' })
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async findUnverified(): Promise<Atrocity[]> {
        return this.service.findUnverified();
    }

    @Query(() => Atrocity, { name: 'atrocity', nullable: true })
    async findOne(@Args('id') id: string): Promise<Atrocity | null> {
        return this.service.findById(id);
    }

    @Mutation(() => Atrocity)
    async createAtrocity(
        @Args('input') input: CreateAtrocityInput,
    ): Promise<Atrocity> {
        return this.service.create(input);
    }

    @Mutation(() => Atrocity)
    async updateAtrocity(
        @Args('id') id: string,
        @Args('input') input: UpdateAtrocityInput,
    ): Promise<Atrocity> {
        return this.service.update(id, input);
    }

    @Mutation(() => Atrocity)
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async approveAtrocity(@Args('id') id: string): Promise<Atrocity> {
        return this.service.approve(id);
    }

    @Mutation(() => Atrocity)
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async removeAtrocityImage(
        @Args('id') id: string,
        @Args('imageUrl') imageUrl: string,
    ): Promise<Atrocity> {
        return this.service.removeImage(id, imageUrl);
    }

    @Mutation(() => Atrocity)
    async deleteAtrocity(@Args('id') id: string): Promise<Atrocity> {
        return this.service.delete(id);
    }
}
