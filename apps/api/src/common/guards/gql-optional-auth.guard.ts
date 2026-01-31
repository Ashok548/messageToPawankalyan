import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class GqlOptionalAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const { req } = ctx.getContext();

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return true;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return true;
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
        } catch {
            return true;
        }
    }
}
