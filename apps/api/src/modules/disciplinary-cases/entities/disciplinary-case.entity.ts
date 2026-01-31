import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

import { IssueCategory, IssueSource, CaseStatus, ActionOutcome, CaseVisibility } from '@prisma/client';

export { IssueCategory, IssueSource, CaseStatus, ActionOutcome, CaseVisibility };

// Register enums with GraphQL
registerEnumType(IssueCategory, {
    name: 'IssueCategory',
    description: 'Category of disciplinary issue',
});

registerEnumType(IssueSource, {
    name: 'IssueSource',
    description: 'Source of the disciplinary issue',
});

registerEnumType(CaseStatus, {
    name: 'CaseStatus',
    description: 'Current status of the disciplinary case',
});

registerEnumType(ActionOutcome, {
    name: 'ActionOutcome',
    description: 'Final action outcome for the case',
});

registerEnumType(CaseVisibility, {
    name: 'CaseVisibility',
    description: 'Visibility level of the case',
});

@ObjectType()
export class DisciplinaryCase {
    @Field(() => ID)
    id: string;

    @Field()
    caseNumber: string;

    // Subject Information (Independent)
    @Field()
    leaderName: string;

    @Field()
    position: string;

    @Field({ nullable: true })
    leaderPhotoUrl?: string;

    @Field({ nullable: true })
    constituency?: string;

    @Field({ nullable: true })
    district?: string;

    // Case Details
    @Field(() => IssueCategory)
    issueCategory: IssueCategory;

    @Field()
    issueDescription: string;

    @Field(() => IssueSource)
    issueSource: IssueSource;

    // Timeline
    @Field()
    initiationDate: Date;

    @Field({ nullable: true })
    reviewStartDate?: Date;

    @Field({ nullable: true })
    decisionDate?: Date;

    @Field({ nullable: true })
    effectiveFrom?: Date;

    @Field({ nullable: true })
    effectiveTo?: Date;

    // Authorities
    @Field()
    initiatedBy: string;

    @Field(() => User, { nullable: true })
    initiatedByUser?: User;

    @Field({ nullable: true })
    reviewAuthority?: string;

    @Field(() => User, { nullable: true })
    reviewAuthorityUser?: User;

    @Field({ nullable: true })
    decisionAuthority?: string;

    @Field(() => User, { nullable: true })
    decisionAuthorityUser?: User;

    // Status & Decision
    @Field(() => CaseStatus)
    status: CaseStatus;

    @Field(() => ActionOutcome, { nullable: true })
    actionOutcome?: ActionOutcome;

    // Visibility
    @Field(() => CaseVisibility)
    visibility: CaseVisibility;

    // Evidence & Notes (internal notes not exposed in GraphQL for security)
    @Field({ nullable: true })
    internalNotes?: string;

    @Field(() => [String])
    evidenceUrls: string[];

    @Field(() => [String])
    imageUrls: string[];

    @Field(() => [String])
    sourceLinks: string[];

    @Field({ nullable: true })
    decisionRationale?: string;

    // Metadata
    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
