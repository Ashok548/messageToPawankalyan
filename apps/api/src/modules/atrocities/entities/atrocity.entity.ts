import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum AtrocityType {
    TO_JSP_LEADER = 'TO_JSP_LEADER',
    TO_JANASENA_PARTY = 'TO_JANASENA_PARTY',
}

registerEnumType(AtrocityType, {
    name: 'AtrocityType',
    description: 'Type of atrocity report',
});

@ObjectType()
export class Atrocity {
    @Field(() => ID)
    id: string;

    @Field(() => AtrocityType)
    atrocityType: AtrocityType;

    @Field()
    leaderName: string;

    @Field({ nullable: true })
    atrocityBy?: string;

    @Field()
    state: string;

    @Field()
    district: string;

    @Field()
    constituency: string;

    @Field()
    mandal: string;

    @Field({ nullable: true })
    village?: string;

    @Field({ nullable: true })
    position?: string;

    @Field({ nullable: true })
    subject?: string;

    @Field()
    description: string;

    @Field(() => [String], { nullable: 'items' })
    images: string[];

    @Field()
    isVerified: boolean;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
