import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsOptional, IsNotEmpty, IsInt, Min, Max, Matches } from 'class-validator';

@InputType()
export class RegisterInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    name: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    @Matches(/^[0-9]{10}$/, { message: 'Mobile number must be 10 digits' })
    mobile: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsEmail({}, { message: 'Please enter a valid email address' })
    email?: string;

    @Field()
    @IsInt()
    @Min(18, { message: 'Must be at least 18 years old' })
    @Max(100)
    age: number;

    @Field()
    @IsString()
    @MinLength(5, { message: 'Password must be at least 5 characters' })
    @Matches(/^(?=.*[A-Z])(?=.*\d).*$/, { message: 'Password must contain at least one uppercase letter and one number' })
    password: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}

@InputType()
export class LoginInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    mobile: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    password: string;
}

@InputType()
export class VerifyOtpInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    mobile: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    otp: string;
}

@ObjectType()
export class VerifyOtpResponse {
    @Field()
    success: boolean;

    @Field()
    message: string;

    @Field({ nullable: true })
    @IsOptional()
    otp?: string;

    @Field({ nullable: true })
    @IsOptional()
    token?: string;

    @Field(() => require('../../users/entities/user.entity').User, { nullable: true })
    @IsOptional()
    user?: any;
}

@InputType()
export class ForgotPasswordInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    mobile: string;
}

@InputType()
export class ResetPasswordInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    mobile: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    otp: string;

    @Field()
    @IsString()
    @MinLength(5, { message: 'Password must be at least 5 characters' })
    @Matches(/^(?=.*[A-Z])(?=.*\d).*$/, { message: 'Password must contain at least one uppercase letter and one number' })
    newPassword: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}

@InputType()
export class ResendOtpInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    mobile: string;
}
