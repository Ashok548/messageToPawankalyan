import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { LeaderStatus, SubmittedBy } from '@prisma/client';

export { LeaderStatus, SubmittedBy };

registerEnumType(LeaderStatus, {
    name: 'LeaderStatus',
    description: 'Moderation status of leader profile',
});

registerEnumType(SubmittedBy, {
    name: 'SubmittedBy',
    description: 'Who submitted the leader profile',
});

@ObjectType()
export class Leader {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field()
    district: string;

    @Field({ nullable: true })
    mandal?: string;

    @Field()
    reason: string;

    @Field(() => [String])
    serviceAreas: string[];

    @Field(() => [String])
    values: string[];

    @Field({ nullable: true })
    photo?: string;

    @Field(() => [String], { nullable: true })
    gallery?: string[];

    @Field(() => Number, { nullable: true })
    partyYears?: number;

    @Field({ nullable: true })
    partyPosition?: string;

    @Field({ nullable: true })
    nominatedPost?: string;

    @Field({ nullable: true })
    primaryPlatform?: string;

    @Field({ nullable: true })
    primaryProfileUrl?: string;

    @Field(() => [OtherPlatform], { nullable: true })
    otherPlatforms?: OtherPlatform[];

    @Field(() => SubmittedBy)
    submittedBy: SubmittedBy;

    @Field(() => LeaderStatus)
    status: LeaderStatus;

    @Field({ nullable: true })
    adminNotes?: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}

@ObjectType()
export class OtherPlatform {
    @Field()
    platform: string;

    @Field()
    profileUrl: string;
}
