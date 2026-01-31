import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class SuperAdminGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const { req } = ctx.getContext();

        if (!req.user) {
            throw new UnauthorizedException('Not authenticated');
        }

        if (req.user.role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Only SUPER_ADMIN can access this resource');
        }

        return true;
    }
}
