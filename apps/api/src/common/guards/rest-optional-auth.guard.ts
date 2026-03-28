import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class RestOptionalAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            return true;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return true;
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
        } catch {
            return true;
        }

        return true;
    }
}
