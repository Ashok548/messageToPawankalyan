import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, MinLength, MaxLength, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { SubmittedBy } from '../entities/social-media-warrior.entity';

@InputType()
export class WarriorOtherPlatformInput {
    @Field()
    @IsString()
    platform: string;

    @Field()
    @IsString()
    profileUrl: string;
}

@InputType()
export class CreateSocialMediaWarriorInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    district: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    mandal?: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    @MinLength(100)
    @MaxLength(2000)
    reason: string;

    @Field(() => [String])
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    @ArrayMaxSize(5)
    digitalContributions: string[];

    @Field(() => [String])
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    @ArrayMaxSize(3)
    engagementStyle: string[];

    @Field({ nullable: true, description: 'Base64 encoded image (max 500KB)' })
    @IsOptional()
    @IsString()
    photo?: string;

    @Field(() => [String], { nullable: true, description: 'Gallery images (max 10)' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    gallery?: string[];

    @Field({ nullable: true })
    @IsOptional()
    partyYears?: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    partyPosition?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    nominatedPost?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    primaryPlatform?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    primaryProfileUrl?: string;

    @Field(() => [WarriorOtherPlatformInput], { nullable: true })
    @IsOptional()
    @IsArray()
    otherPlatforms?: WarriorOtherPlatformInput[];

    @Field(() => SubmittedBy)
    @IsEnum(SubmittedBy)
    submittedBy: SubmittedBy;
}

@InputType()
export class UpdateSocialMediaWarriorInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    district?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    mandal?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MinLength(100)
    @MaxLength(2000)
    reason?: string;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    @ArrayMaxSize(5)
    digitalContributions?: string[];

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    @ArrayMaxSize(3)
    engagementStyle?: string[];

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    photo?: string;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    gallery?: string[];

    @Field({ nullable: true })
    @IsOptional()
    partyYears?: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    partyPosition?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    nominatedPost?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    primaryPlatform?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    primaryProfileUrl?: string;

    @Field(() => [WarriorOtherPlatformInput], { nullable: true })
    @IsOptional()
    @IsArray()
    otherPlatforms?: WarriorOtherPlatformInput[];

    @Field(() => SubmittedBy, { nullable: true })
    @IsOptional()
    @IsEnum(SubmittedBy)
    submittedBy?: SubmittedBy;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    adminNotes?: string;
}
