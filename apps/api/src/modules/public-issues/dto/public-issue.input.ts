import { Field, InputType, registerEnumType } from '@nestjs/graphql';

export enum PublicIssueSortBy {
    TRENDING = 'TRENDING',
    LATEST = 'LATEST',
}

registerEnumType(PublicIssueSortBy, {
    name: 'PublicIssueSortBy',
    description: 'Sort order for public issue feed',
});
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import { IssuePriority, PublicIssueCategory, PublicIssueStatus, VerificationStatus } from '../entities/public-issue.entity';

@InputType()
export class CreatePublicIssueInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(160)
    title: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    @MinLength(20)
    @MaxLength(3000)
    description: string;

    @Field(() => PublicIssueCategory)
    @IsEnum(PublicIssueCategory)
    category: PublicIssueCategory;

    @Field()
    @IsString()
    @IsNotEmpty()
    state: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    district: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    constituency?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    mandal?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    village?: string;

    @Field(() => [String], { nullable: true, description: 'Base64 encoded images' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @Field(() => [String], { nullable: true, description: 'URLs of supporting media (video, audio, images)' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    mediaUrls?: string[];

    @Field(() => VerificationStatus, { nullable: true, description: 'Strength of evidence documentation' })
    @IsOptional()
    @IsEnum(VerificationStatus)
    verificationStatus?: VerificationStatus;

    @Field({ nullable: true, description: 'Notes describing the evidence provided' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    evidenceNote?: string;
}

@InputType()
export class UpdatePublicIssueInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MinLength(5)
    @MaxLength(160)
    title?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MinLength(20)
    @MaxLength(3000)
    description?: string;

    @Field(() => PublicIssueCategory, { nullable: true })
    @IsOptional()
    @IsEnum(PublicIssueCategory)
    category?: PublicIssueCategory;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    state?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    district?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    constituency?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    mandal?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    village?: string;

    @Field(() => [String], { nullable: true, description: 'Base64 encoded images or existing URLs' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @Field(() => [String], { nullable: true, description: 'URLs of supporting media (video, audio, images)' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    mediaUrls?: string[];

    @Field(() => VerificationStatus, { nullable: true, description: 'Strength of evidence documentation' })
    @IsOptional()
    @IsEnum(VerificationStatus)
    verificationStatus?: VerificationStatus;

    @Field({ nullable: true, description: 'Notes describing the evidence provided' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    evidenceNote?: string;

    @Field(() => IssuePriority, { nullable: true, description: 'Admin override for public importance level' })
    @IsOptional()
    @IsEnum(IssuePriority)
    priority?: IssuePriority;

    @Field({ nullable: true, description: 'Admin flag to highlight this issue in the UI' })
    @IsOptional()
    @IsBoolean()
    isHighlighted?: boolean;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    adminNotes?: string;
}

@InputType()
export class UpdatePublicIssueStatusInput {
    @Field(() => PublicIssueStatus)
    @IsEnum(PublicIssueStatus)
    status: PublicIssueStatus;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    adminNotes?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    rejectionReason?: string;
}

@InputType()
export class PublicIssueFilterInput {
    @Field(() => PublicIssueStatus, { nullable: true })
    @IsOptional()
    @IsEnum(PublicIssueStatus)
    status?: PublicIssueStatus;

    @Field(() => IssuePriority, { nullable: true })
    @IsOptional()
    @IsEnum(IssuePriority)
    priority?: IssuePriority;

    @Field(() => PublicIssueCategory, { nullable: true })
    @IsOptional()
    @IsEnum(PublicIssueCategory)
    category?: PublicIssueCategory;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    district?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    state?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    searchTerm?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsDateString()
    dateTo?: string;

    @Field(() => PublicIssueSortBy, { nullable: true })
    @IsOptional()
    @IsEnum(PublicIssueSortBy)
    sortBy?: PublicIssueSortBy;
}

export class ApprovePublicIssueDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    adminNotes?: string;
}

export class RejectPublicIssueDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(1000)
    rejectionReason: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    adminNotes?: string;
}

export class UpdatePublicIssuePriorityDto {
    @IsEnum(IssuePriority)
    priority: IssuePriority;
}

export class UpdatePublicIssueVerificationStatusDto {
    @IsEnum(VerificationStatus)
    verificationStatus: VerificationStatus;
}