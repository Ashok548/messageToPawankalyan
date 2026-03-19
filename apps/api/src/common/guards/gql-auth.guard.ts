import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class GqlAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const { req } = ctx.getContext();

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('[GqlAuthGuard] No auth header');
            return false;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('[GqlAuthGuard] No token in header');
            return false;
        }

        try {
            const payload = await this.authService.validateToken(token);
             console.log('[GqlAuthGuard] req.user set to:', payload);
            console.log('[GqlAuthGuard] Token validated, payload:', payload);
            req.user = {
                id: payload.userId,
                email: payload.email,
                mobile: payload.mobile,
                role: payload.role,
            };
            console.log('[GqlAuthGuard] req.user set to:', req.user);
            return true;
        } catch (e) {
            // console.log('[GqlAuthGuard] Token validation failed:', e instanceof Error ? e.message : String(e));
            return false;
        }
    }
}
