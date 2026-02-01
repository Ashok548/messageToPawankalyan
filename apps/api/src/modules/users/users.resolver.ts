import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserInput, UpdateUserRoleInput } from './dto/user.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) { }

    @Query(() => User, { nullable: true })
    @UseGuards(GqlAuthGuard)
    async me(@CurrentUser() user: any): Promise<User | null> {
        if (!user?.id) {
            return null;
        }
        return this.usersService.findById(user.id);
    }

    @Query(() => User)
    async user(@Args('id') id: string): Promise<User> {
        return this.usersService.findById(id);
    }

    @Query(() => [User])
    async users(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Query(() => [User], { description: 'SUPER_ADMIN only: Get all users for management' })
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async getAllUsers(): Promise<User[]> {
        return this.usersService.getAllUsersForAdmin();
    }

    @Mutation(() => User)
    async updateUser(
        @Args('id') id: string,
        @Args('input') input: UpdateUserInput,
    ): Promise<User> {
        return this.usersService.update(id, input);
    }

    @Mutation(() => User, { description: 'SUPER_ADMIN only: Update user role' })
    @UseGuards(GqlAuthGuard, SuperAdminGuard)
    async updateUserRole(
        @Args('input') input: UpdateUserRoleInput,
    ): Promise<User> {
        return this.usersService.updateUserRole(input.userId, input.role);
    }

    @Mutation(() => User)
    async deleteUser(@Args('id') id: string): Promise<User> {
        return this.usersService.delete(id);
    }
}
