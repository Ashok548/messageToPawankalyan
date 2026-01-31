import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput, RegisterInput, VerifyOtpInput, VerifyOtpResponse, ForgotPasswordInput, ResetPasswordInput, ResendOtpInput } from './dto/auth.input';
import { AuthPayload } from './entities/auth.entity';

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) { }

    @Mutation(() => AuthPayload)
    async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
        return this.authService.register(input);
    }

    @Mutation(() => AuthPayload)
    async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
        return this.authService.login(input);
    }

    @Mutation(() => VerifyOtpResponse)
    async verifyOtp(@Args('input') input: VerifyOtpInput): Promise<VerifyOtpResponse> {
        return this.authService.verifyOtp(input);
    }

    @Mutation(() => VerifyOtpResponse)
    async resendOtp(@Args('input') input: ResendOtpInput): Promise<VerifyOtpResponse> {
        return this.authService.resendOtp(input);
    }

    @Mutation(() => VerifyOtpResponse)
    async forgotPassword(@Args('input') input: ForgotPasswordInput): Promise<VerifyOtpResponse> {
        return this.authService.forgotPassword(input);
    }

    @Mutation(() => VerifyOtpResponse)
    async resetPassword(@Args('input') input: ResetPasswordInput): Promise<VerifyOtpResponse> {
        return this.authService.resetPassword(input);
    }

    @Mutation(() => Boolean)
    async logout(): Promise<boolean> {
        // In a real app, you might invalidate the token here
        return true;
    }
}
