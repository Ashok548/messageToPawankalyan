import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class RestSuperAdminGuard implements CanActivate {
    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Authentication required');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Authentication required');
        }

        try {
            const payload = await this.authService.validateToken(token);
            Object.assign(request, {
                user: {
                    id: payload.userId,
                    email: payload.email,
                    mobile: payload.mobile,
                    role: payload.role,
                },
            });

            if (payload.role !== 'SUPER_ADMIN') {
                throw new ForbiddenException('Only SUPER_ADMIN can access this resource');
            }
        } catch (error) {
            if (error instanceof ForbiddenException) {
                throw error;
            }

            throw new UnauthorizedException('Invalid or expired token');
        }

        return true;
    }
}