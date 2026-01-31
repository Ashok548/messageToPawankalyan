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
            return false;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return false;
        }

        try {
            const payload = await this.authService.validateToken(token);
            req.user = {
                id: payload.userId,
                email: payload.email,
                mobile: payload.mobile,
                role: payload.role,
            };
            return true;
        } catch (e) {
            return false;
        }
    }
}
