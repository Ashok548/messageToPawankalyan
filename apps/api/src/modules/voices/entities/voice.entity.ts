import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { VoiceCategory, VoiceStatus } from '@prisma/client';
import { User } from '../../users/entities/user.entity';

export { VoiceCategory, VoiceStatus };

registerEnumType(VoiceStatus, {
    name: 'VoiceStatus',
    description: 'Moderation status of a public voice submission',
});

registerEnumType(VoiceCategory, {
    name: 'VoiceCategory',
    description: 'Category of public voice submission',
});

@ObjectType()
export class Voice {
    @Field(() => ID)
    id: string;

    @Field()
    title: string;

    @Field()
    description: string;

    @Field(() => VoiceCategory)
    category: VoiceCategory;

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

    @Field({ nullable: true })
    videoUrl?: string;

    @Field({ nullable: true })
    audioUrl?: string;

    @Field(() => VoiceStatus)
    status: VoiceStatus;

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

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}

@ObjectType()
export class VoiceDashboardStats {
    @Field()
    total: number;

    @Field()
    pending: number;

    @Field()
    approved: number;

    @Field()
    rejected: number;

    @Field()
    underReview: number;

    @Field()
    resolved: number;
}