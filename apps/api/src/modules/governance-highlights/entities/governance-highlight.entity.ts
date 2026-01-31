import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum HighlightCategory {
    INNOVATIVE_INITIATIVE = 'INNOVATIVE_INITIATIVE',
    PENDING_ISSUE_ADDRESSED = 'PENDING_ISSUE_ADDRESSED',
}

export enum HighlightStatus {
    ADDRESSED = 'ADDRESSED',
    IN_PROGRESS = 'IN_PROGRESS',
    FOLLOW_UP_ONGOING = 'FOLLOW_UP_ONGOING',
}

export enum SourceType {
    GOVERNMENT_PORTAL = 'GOVERNMENT_PORTAL',
    PRESS_RELEASE = 'PRESS_RELEASE',
    PUBLIC_RECORD = 'PUBLIC_RECORD',
    NEWS_REPORT = 'NEWS_REPORT',
    FIELD_VERIFICATION = 'FIELD_VERIFICATION',
}

registerEnumType(HighlightCategory, {
    name: 'HighlightCategory',
    description: 'Category of governance highlight',
});

registerEnumType(HighlightStatus, {
    name: 'HighlightStatus',
    description: 'Status of governance highlight implementation',
});

registerEnumType(SourceType, {
    name: 'SourceType',
    description: 'Type of source documentation',
});

@ObjectType()
export class GovernanceHighlight {
    @Field(() => ID)
    id: string;

    @Field()
    title: string;

    @Field(() => HighlightCategory)
    category: HighlightCategory;

    @Field()
    description: string;

    @Field()
    area: string;

    @Field({ nullable: true })
    department?: string;

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

    @Field({ nullable: true })
    yearStarted?: number;

    @Field()
    yearCompleted: number;

    @Field({ nullable: true })
    period?: string;

    @Field(() => HighlightStatus)
    status: HighlightStatus;

    @Field(() => SourceType)
    sourceType: SourceType;

    @Field()
    sourceUrl: string;

    @Field({ nullable: true })
    sourceTitle?: string;

    @Field({ nullable: true })
    issueContext?: string;

    @Field({ nullable: true })
    image?: string;

    @Field(() => [String], { nullable: 'itemsAndList' })
    gallery?: string[];

    @Field()
    isVerified: boolean;

    @Field()
    isVisible: boolean;

    @Field({ nullable: true })
    adminNotes?: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
