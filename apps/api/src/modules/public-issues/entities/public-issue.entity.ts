import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IssuePriority, PublicIssueCategory, PublicIssueStatus, VerificationStatus } from '@prisma/client';
import { User } from '../../users/entities/user.entity';

export { IssuePriority, PublicIssueCategory, PublicIssueStatus, VerificationStatus };

registerEnumType(PublicIssueStatus, {
    name: 'PublicIssueStatus',
    description: 'Moderation status of a public issue submission',
});

registerEnumType(PublicIssueCategory, {
    name: 'PublicIssueCategory',
    description: 'Category of a public issue submission',
});

registerEnumType(VerificationStatus, {
    name: 'VerificationStatus',
    description: 'Strength of documentation evidence — indicates evidence quality, not truth validation',
});

registerEnumType(IssuePriority, {
    name: 'IssuePriority',
    description: 'Public importance level derived from community support count or admin override',
});

@ObjectType()
export class PublicIssue {
    @Field(() => ID)
    id: string;

    @Field()
    title: string;

    @Field()
    description: string;

    @Field(() => PublicIssueCategory)
    category: PublicIssueCategory;

    @Field()
    state: string;

    @Field()
    district: string;

    @Field({ nullable: true })
    constituency?: string;

    @Field({ nullable: true })
    mandal?: string;

    @Field({ nullable: true })
    village?: string;

    @Field(() => [String])
    images: string[];

    @Field(() => PublicIssueStatus)
    status: PublicIssueStatus;

    @Field({ nullable: true })
    adminNotes?: string;

    @Field({ nullable: true })
    rejectionReason?: string;

    @Field(() => User, { nullable: true })
    submittedByUser?: User;

    @Field(() => User, { nullable: true })
    reviewedByUser?: User;

    @Field({ nullable: true })
    reviewedAt?: Date;

    @Field(() => Int)
    supportCount: number;

    @Field()
    isHighPriority: boolean;

    @Field(() => IssuePriority)
    priority: IssuePriority;

    @Field()
    isHighlighted: boolean;

    @Field(() => Boolean, { nullable: true })
    hasUserSupported?: boolean;

    @Field({ nullable: true })
    approvedAt?: Date;

    @Field({ nullable: true })
    takenUpAt?: Date;

    @Field({ nullable: true })
    inProgressAt?: Date;

    @Field({ nullable: true })
    resolvedAt?: Date;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;

    @Field(() => [String])
    mediaUrls: string[];

    @Field(() => VerificationStatus)
    verificationStatus: VerificationStatus;

    @Field({ nullable: true })
    evidenceNote?: string;
}