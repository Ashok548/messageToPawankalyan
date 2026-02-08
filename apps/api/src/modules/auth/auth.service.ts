import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginInput, RegisterInput, VerifyOtpInput, VerifyOtpResponse, ForgotPasswordInput, ResetPasswordInput, ResendOtpInput } from './dto/auth.input';
import { AuthPayload } from './entities/auth.entity';
import { User as PrismaUser } from '@prisma/client';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    // Generates a random 6-digit OTP
    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async register(input: RegisterInput): Promise<AuthPayload> {
        if (input.password !== input.confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        const otp = this.generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 10);

        // Create user with SUPER_ADMIN role by default
        const user = await this.usersService.create({
            email: input.email,
            mobile: input.mobile,
            name: input.name,
            age: input.age,
            passwordHash,
            otp,
            otpExpiresAt,
            role: UserRole.SUPER_ADMIN,
        });

        this.logger.warn(`
            ================================================
            [OTP] for mobile ${input.mobile}: ${otp}
            ================================================
            `);

        return { user, token: null };
    }

    async verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpResponse> {
        const user = await this.usersService.findByMobile(input.mobile);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const userData = user as unknown as PrismaUser;
        if (userData.otp !== input.otp) {
            throw new BadRequestException('Invalid OTP');
        }

        if (userData.otpExpiresAt && userData.otpExpiresAt < new Date()) {
            throw new BadRequestException('OTP expired');
        }

        // Verify user and clear OTP
        const updatedUser = await this.usersService.update(user.id, {
            isVerified: true,
            otp: null,
            otpExpiresAt: null,
        });

        // Generate token for auto-login
        const token = this.jwtService.sign({
            userId: updatedUser.id,
            email: updatedUser.email,
            mobile: updatedUser.mobile,
            role: updatedUser.role,
            isAdmin: updatedUser.role === UserRole.ADMIN || updatedUser.role === UserRole.SUPER_ADMIN,
        });

        return {
            success: true,
            message: 'Verification successful',
            token,
            user: updatedUser,
        };
    }

    async resendOtp(input: ResendOtpInput): Promise<VerifyOtpResponse> {
        const user = await this.usersService.findByMobile(input.mobile);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (user.isVerified) {
            throw new BadRequestException('User is already verified');
        }

        const otp = this.generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await this.usersService.update(user.id, { otp, otpExpiresAt });

        this.logger.warn(`
            ================================================
            [RESEND OTP] for mobile ${input.mobile}: ${otp}
            ================================================
        `);

        return {
            success: true,
            message: 'OTP resent successfully',
        };
    }

    async login(input: LoginInput): Promise<AuthPayload> {
        // Find user by mobile
        const user = await this.usersService.findByMobile(input.mobile);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(input.password, (user as unknown as PrismaUser).passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if verified
        if (!user.isVerified) {
            // Generate verify OTP
            const otp = this.generateOtp();
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await this.usersService.update(user.id, { otp, otpExpiresAt });
            this.logger.warn(`
                ================================================
                [OTP] for mobile ${user.mobile}: ${otp}
                ================================================
                `);

            throw new UnauthorizedException(`Account not verified. OTP sent to mobile. OTP: ${otp}`);
        }

        // Generate token
        const token = this.jwtService.sign({
            userId: user.id,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            isAdmin: user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN,
        });

        return { user, token };
    }

    async validateToken(token: string): Promise<any> {
        try {
            return this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }
    async forgotPassword(input: ForgotPasswordInput): Promise<VerifyOtpResponse> {
        const user = await this.usersService.findByMobile(input.mobile);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const otp = this.generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.usersService.update(user.id, { otp, otpExpiresAt });

        this.logger.warn(`
            ================================================
            [FORGOT PASSWORD OTP] for mobile ${user.mobile}: ${otp}
            ================================================
            `);

        return {
            success: true,
            message: 'OTP sent successfully',
            otp, // For testing purposes - display in UI
        };
    }

    async resetPassword(input: ResetPasswordInput): Promise<VerifyOtpResponse> {
        if (input.newPassword !== input.confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        const user = await this.usersService.findByMobile(input.mobile);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const userData = user as unknown as PrismaUser;
        if (userData.otp !== input.otp) {
            throw new BadRequestException('Invalid OTP');
        }

        if (userData.otpExpiresAt && userData.otpExpiresAt < new Date()) {
            throw new BadRequestException('OTP expired');
        }

        const passwordHash = await bcrypt.hash(input.newPassword, 10);

        await this.usersService.update(user.id, {
            passwordHash,
            otp: null,
            otpExpiresAt: null,
        });

        return {
            success: true,
            message: 'Password reset successful',
        };
    }
}
