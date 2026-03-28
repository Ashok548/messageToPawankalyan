import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { AnalysisStatus } from '../entities/analysis.entity';

@InputType()
export class CreateAnalysisInput {
    @Field({ description: 'ID of the public issue this analysis belongs to' })
    @IsUUID()
    @IsNotEmpty()
    issueId: string;

    @Field({ description: 'Structured account of what the problem is and how it manifests' })
    @IsString()
    @IsNotEmpty()
    @MinLength(20)
    @MaxLength(3000)
    problemUnderstanding: string;

    @Field({ description: 'Assessment of how this issue affects the community' })
    @IsString()
    @IsNotEmpty()
    @MinLength(20)
    @MaxLength(3000)
    impact: string;

    @Field({ description: 'Factual observations gathered about the issue' })
    @IsString()
    @IsNotEmpty()
    @MinLength(20)
    @MaxLength(3000)
    observations: string;

    @Field({ nullable: true, description: 'Optional contextual or systemic considerations' })
    @IsOptional()
    @IsString()
    @MaxLength(3000)
    considerations?: string;
}

@InputType()
export class UpdateAnalysisStatusInput {
    @Field(() => AnalysisStatus)
    @IsEnum(AnalysisStatus)
    status: AnalysisStatus;

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

export class ApproveAnalysisDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    adminNotes?: string;
}

export class RejectAnalysisDto {
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

@InputType()
export class AnalysisFilterInput {
    @Field(() => AnalysisStatus, { nullable: true })
    @IsOptional()
    @IsEnum(AnalysisStatus)
    status?: AnalysisStatus;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    issueId?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    createdById?: string;
}
