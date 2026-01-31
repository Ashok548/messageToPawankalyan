import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';
import { AtrocityType } from '../entities/atrocity.entity';

@InputType()
export class CreateAtrocityInput {
    @Field(() => AtrocityType, { defaultValue: AtrocityType.TO_JSP_LEADER })
    @IsEnum(AtrocityType)
    @IsOptional()
    atrocityType?: AtrocityType;

    @Field()
    @IsString()
    @IsNotEmpty()
    leaderName: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    atrocityBy?: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    state: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    district: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    constituency: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    mandal: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    village: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    position?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    subject?: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    description: string;

    @Field(() => [String], { nullable: true, description: 'Base64 encoded images (max 2, each max 500KB)' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];
}

@InputType()
export class UpdateAtrocityInput {
    @Field(() => AtrocityType, { nullable: true })
    @IsEnum(AtrocityType)
    @IsOptional()
    atrocityType?: AtrocityType;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    leaderName?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    atrocityBy?: string;

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
    @IsString()
    position?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    subject?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @Field({ nullable: true })
    @IsOptional()
    isVerified?: boolean;
}
