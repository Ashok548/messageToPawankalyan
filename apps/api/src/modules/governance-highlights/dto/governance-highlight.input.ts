import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsUrl, Min, Max } from 'class-validator';
import { HighlightCategory, HighlightStatus, SourceType } from '../entities/governance-highlight.entity';

@InputType()
export class CreateGovernanceHighlightInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    title: string;

    @Field(() => HighlightCategory)
    @IsEnum(HighlightCategory)
    category: HighlightCategory;

    @Field()
    @IsString()
    @IsNotEmpty()
    description: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    area: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    department?: string;

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

    @Field({ nullable: true })
    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(2100)
    yearStarted?: number;

    @Field()
    @IsInt()
    @Min(1900)
    @Max(2100)
    yearCompleted: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    period?: string;

    @Field(() => HighlightStatus, { defaultValue: HighlightStatus.ADDRESSED })
    @IsOptional()
    @IsEnum(HighlightStatus)
    status?: HighlightStatus;

    @Field(() => SourceType)
    @IsEnum(SourceType)
    sourceType: SourceType;

    @Field()
    @IsUrl()
    @IsNotEmpty()
    sourceUrl: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    sourceTitle?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    issueContext?: string;

    @Field({ nullable: true, description: 'Base64 encoded image (max 500KB)' })
    @IsOptional()
    @IsString()
    image?: string;

    @Field(() => [String], { nullable: true, description: 'Array of base64 encoded gallery images (max 500KB each)' })
    @IsOptional()
    gallery?: string[];

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    adminNotes?: string;
}

@InputType()
export class UpdateGovernanceHighlightInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    title?: string;

    @Field(() => HighlightCategory, { nullable: true })
    @IsOptional()
    @IsEnum(HighlightCategory)
    category?: HighlightCategory;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    area?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    department?: string;

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

    @Field({ nullable: true })
    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(2100)
    yearStarted?: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(2100)
    yearCompleted?: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    period?: string;

    @Field(() => HighlightStatus, { nullable: true })
    @IsOptional()
    @IsEnum(HighlightStatus)
    status?: HighlightStatus;

    @Field(() => SourceType, { nullable: true })
    @IsOptional()
    @IsEnum(SourceType)
    sourceType?: SourceType;

    @Field({ nullable: true })
    @IsOptional()
    @IsUrl()
    sourceUrl?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    sourceTitle?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    issueContext?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    image?: string;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    gallery?: string[];

    @Field({ nullable: true })
    @IsOptional()
    isVisible?: boolean;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    adminNotes?: string;
}
