import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN',
}

registerEnumType(UserRole, {
    name: 'UserRole',
    description: 'User access role',
});

@ObjectType()
export class User {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field()
    mobile: string;

    @Field({ nullable: true })
    email?: string;

    @Field(() => UserRole)
    role: UserRole;

    @Field()
    isVerified: boolean;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;


    @Field({ nullable: true })
    otp?: string;
}

