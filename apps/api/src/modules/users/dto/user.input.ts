import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

@InputType()
export class CreateUserInput {
    @Field()
    @IsString()
    @MinLength(2)
    name: string;

    @Field()
    @IsString()
    mobile: string;

    @Field({ nullable: true })
    @IsEmail()
    @IsOptional()
    email?: string;

    @Field({ nullable: true })
    @IsOptional()
    age?: number;

    @Field()
    @IsString()
    passwordHash: string;

    @Field({ nullable: true })
    @IsOptional()
    otp?: string;

    @Field({ nullable: true })
    @IsOptional()
    otpExpiresAt?: Date;
}

@InputType()
export class UpdateUserInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    mobile?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsEmail()
    email?: string;

    @Field({ nullable: true })
    @IsOptional()
    age?: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    passwordHash?: string;

    @Field({ nullable: true })
    @IsOptional()
    isVerified?: boolean;

    @Field({ nullable: true })
    @IsOptional()
    otp?: string;

    @Field({ nullable: true })
    @IsOptional()
    otpExpiresAt?: Date;
}
