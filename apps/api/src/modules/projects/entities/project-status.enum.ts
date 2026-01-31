import { registerEnumType } from '@nestjs/graphql';

/**
 * ProjectStatus enum matching the Prisma schema
 * This must stay in sync with packages/db/prisma/schema.prisma
 */
export enum ProjectStatus {
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
    COMPLETED = 'COMPLETED',
    ON_HOLD = 'ON_HOLD',
}

registerEnumType(ProjectStatus, {
    name: 'ProjectStatus',
    description: 'The status of a project',
});

