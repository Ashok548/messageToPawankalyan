import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { IssuePriority, PublicIssueCategory, PublicIssueStatus, VerificationStatus } from '../entities/public-issue.entity';

export class AdminPublicIssueQueryDto {
    @IsOptional()
    @IsEnum(PublicIssueStatus)
    status?: PublicIssueStatus;

    @IsOptional()
    @IsEnum(PublicIssueCategory)
    category?: PublicIssueCategory;

    @IsOptional()
    @IsString()
    district?: string;

    @IsOptional()
    @IsString()
    searchTerm?: string;

    @IsOptional()
    @IsString()
    take?: string;

    @IsOptional()
    @IsString()
    skip?: string;
}

export class ApprovePublicIssueDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    adminNotes?: string;
}

export class RejectPublicIssueDto {
    @IsString()
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