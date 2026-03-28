import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AnalysisStatus } from '@prisma/client';
import { User } from '../../users/entities/user.entity';
import { PublicIssue } from './public-issue.entity';

export { AnalysisStatus };

registerEnumType(AnalysisStatus, {
    name: 'AnalysisStatus',
    description: 'Moderation status of a public issue analysis',
});

@ObjectType()
export class Analysis {
    @Field(() => ID)
    id: string;

    @Field()
    issueId: string;

    @Field()
    createdById: string;

    @Field({ nullable: true })
    reviewedById?: string;

    @Field({ description: 'Structured account of what the problem is and how it manifests' })
    problemUnderstanding: string;

    @Field({ description: 'Assessment of how this issue affects the community' })
    impact: string;

    @Field({ description: 'Factual observations gathered about the issue' })
    observations: string;

    @Field({ nullable: true, description: 'Optional contextual or systemic considerations' })
    considerations?: string;

    @Field(() => AnalysisStatus)
    status: AnalysisStatus;

    @Field({ nullable: true })
    adminNotes?: string;

    @Field({ nullable: true })
    rejectionReason?: string;

    @Field(() => PublicIssue, { nullable: true })
    issue?: PublicIssue;

    @Field(() => User, { nullable: true })
    createdByUser?: User;

    @Field(() => User, { nullable: true })
    reviewedByUser?: User;

    @Field({ nullable: true })
    reviewedAt?: Date;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
