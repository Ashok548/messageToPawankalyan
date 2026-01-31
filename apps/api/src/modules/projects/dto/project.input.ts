import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ProjectStatus } from '../entities/project-status.enum';

@InputType()
export class CreateProjectInput {
    @Field()
    @IsString()
    @MinLength(3)
    name: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    description?: string;

    @Field(() => ProjectStatus, { nullable: true })
    @IsEnum(ProjectStatus)
    @IsOptional()
    status?: ProjectStatus;
}

@InputType()
export class UpdateProjectInput {
    @Field({ nullable: true })
    @IsString()
    @MinLength(3)
    @IsOptional()
    name?: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    description?: string;

    @Field(() => ProjectStatus, { nullable: true })
    @IsEnum(ProjectStatus)
    @IsOptional()
    status?: ProjectStatus;
}
