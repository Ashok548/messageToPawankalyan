import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { ProjectStatus } from './project-status.enum';

@ObjectType()
export class Project {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field({ nullable: true })
    description: string | null;

    @Field(() => ProjectStatus)
    status: ProjectStatus;

    @Field(() => User)
    owner: User;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}

