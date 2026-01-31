import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const ctx = GqlExecutionContext.create(context);
        const { req } = ctx.getContext();

        const user = req.user;

        if (!user) {
            throw new ForbiddenException('Authentication required');
        }

        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            throw new ForbiddenException(`Admin access required. Current role: ${user.role}`);
        }

        return true;
    }
}
