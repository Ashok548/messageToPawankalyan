import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class OptionalGqlAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const { req } = ctx.getContext();

        const authHeader = req.headers.authorization;

        // If no auth header, just continue without user context
        if (!authHeader) {
            return true;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return true;
        }

        try {
            // Try to validate and populate user
            const payload = await this.authService.validateToken(token);
            req.user = {
                id: payload.userId,
                email: payload.email,
                mobile: payload.mobile,
                role: payload.role,
            };
        } catch (e) {
            // Invalid token - just continue without user context
            // Don't throw error, query should still work
        }

        return true; // Always allow the query to proceed
    }
}
