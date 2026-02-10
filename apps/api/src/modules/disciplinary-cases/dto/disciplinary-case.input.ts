import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsEnum, IsOptional, IsUUID, IsArray, IsDateString } from 'class-validator';
import { IssueCategory, IssueSource, CaseStatus, ActionOutcome, CaseVisibility } from '../entities/disciplinary-case.entity';

@InputType()
export class CreateDisciplinaryCaseInput {
    @Field()
    @IsString()
    leaderName: string;

    @Field()
    @IsString()
    position: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    constituency?: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    district?: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    leaderPhotoUrl?: string;

    @Field(() => IssueCategory)
    @IsEnum(IssueCategory)
    issueCategory: IssueCategory;

    @Field()
    @IsString()
    issueDescription: string;

    @Field(() => IssueSource)
    @IsEnum(IssueSource)
    issueSource: IssueSource;

    @Field(() => [String], { nullable: true })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    evidenceUrls?: string[];

    @Field(() => [String], { nullable: true })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    imageUrls?: string[];

    @Field(() => [String], { nullable: true })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    sourceLinks?: string[];
}

@InputType()
export class UpdateCaseStatusInput {
    @Field(() => CaseStatus)
    @IsEnum(CaseStatus)
    status: CaseStatus;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    internalNotes?: string;

    @Field({ nullable: true })
    @IsUUID()
    @IsOptional()
    reviewAuthority?: string;

    @Field({ nullable: true })
    @IsDateString()
    @IsOptional()
    reviewStartDate?: string;
}

@InputType()
export class RecordDecisionInput {
    @Field(() => ActionOutcome)
    @IsEnum(ActionOutcome)
    actionOutcome: ActionOutcome;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    decisionRationale?: string;

    @Field({ nullable: true })
    @IsDateString()
    @IsOptional()
    effectiveFrom?: string;

    @Field({ nullable: true })
    @IsDateString()
    @IsOptional()
    effectiveTo?: string;
}

@InputType()
export class UpdateDisciplinaryCaseInput {
    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    leaderName?: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    position?: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    constituency?: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    district?: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    leaderPhotoUrl?: string;

    @Field(() => IssueCategory, { nullable: true })
    @IsEnum(IssueCategory)
    @IsOptional()
    issueCategory?: IssueCategory;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    issueDescription?: string;

    @Field(() => IssueSource, { nullable: true })
    @IsEnum(IssueSource)
    @IsOptional()
    issueSource?: IssueSource;

    @Field({ nullable: true })
    @IsDateString()
    @IsOptional()
    initiationDate?: string;

    @Field(() => [String], { nullable: true })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    evidenceUrls?: string[];

    @Field(() => [String], { nullable: true })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    imageUrls?: string[];

    @Field(() => [String], { nullable: true })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    sourceLinks?: string[];
}

@InputType()
export class DisciplinaryCaseFilterInput {
    @Field({ nullable: true })
    @IsEnum(CaseStatus)
    @IsOptional()
    status?: CaseStatus;

    @Field({ nullable: true })
    @IsEnum(IssueCategory)
    @IsOptional()
    issueCategory?: IssueCategory;

    @Field({ nullable: true })
    @IsUUID()
    @IsOptional()
    leaderId?: string;

    @Field({ nullable: true })
    @IsEnum(CaseVisibility)
    @IsOptional()
    visibility?: CaseVisibility;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    searchTerm?: string;
}
