import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { WarriorStatus, SubmittedBy } from '@prisma/client';

export { WarriorStatus, SubmittedBy };

registerEnumType(WarriorStatus, {
    name: 'WarriorStatus',
    description: 'Moderation status of social media warrior profile',
});

registerEnumType(SubmittedBy, {
    name: 'SubmittedBy',
    description: 'Who submitted the warrior profile',
});

@ObjectType()
export class SocialMediaWarrior {
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
    digitalContributions: string[];

    @Field(() => [String])
    engagementStyle: string[];

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

    @Field(() => [WarriorOtherPlatform], { nullable: true })
    otherPlatforms?: WarriorOtherPlatform[];

    @Field(() => SubmittedBy)
    submittedBy: SubmittedBy;

    @Field(() => WarriorStatus)
    status: WarriorStatus;

    @Field({ nullable: true })
    adminNotes?: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}

@ObjectType()
export class WarriorOtherPlatform {
    @Field()
    platform: string;

    @Field()
    profileUrl: string;
}
