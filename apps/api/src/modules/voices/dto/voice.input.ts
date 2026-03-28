import { InputType, Field } from '@nestjs/graphql';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import { VoiceCategory, VoiceStatus } from '../entities/voice.entity';

@InputType()
export class CreateVoiceInput {
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

    @Field(() => VoiceCategory)
    @IsEnum(VoiceCategory)
    category: VoiceCategory;

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

    @Field({ nullable: true, description: 'Base64 encoded video or existing URL' })
    @IsOptional()
    @IsString()
    videoUrl?: string;

    @Field({ nullable: true, description: 'Base64 encoded audio or existing URL' })
    @IsOptional()
    @IsString()
    audioUrl?: string;
}

@InputType()
export class UpdateVoiceInput {
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

    @Field(() => VoiceCategory, { nullable: true })
    @IsOptional()
    @IsEnum(VoiceCategory)
    category?: VoiceCategory;

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

    @Field({ nullable: true, description: 'Base64 encoded video or existing URL' })
    @IsOptional()
    @IsString()
    videoUrl?: string;

    @Field({ nullable: true, description: 'Base64 encoded audio or existing URL' })
    @IsOptional()
    @IsString()
    audioUrl?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    adminNotes?: string;
}

@InputType()
export class UpdateVoiceStatusInput {
    @Field(() => VoiceStatus)
    @IsEnum(VoiceStatus)
    status: VoiceStatus;

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
export class VoiceFilterInput {
    @Field(() => VoiceStatus, { nullable: true })
    @IsOptional()
    @IsEnum(VoiceStatus)
    status?: VoiceStatus;

    @Field(() => VoiceCategory, { nullable: true })
    @IsOptional()
    @IsEnum(VoiceCategory)
    category?: VoiceCategory;

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
}