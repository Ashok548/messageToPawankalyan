import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

// Single-row sentinel used for upsert (there is always exactly one stats record)
const STATS_SENTINEL_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class VisitorStatsService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        return this.prisma.visitorStats.upsert({
            where: { id: STATS_SENTINEL_ID },
            update: {},
            create: { id: STATS_SENTINEL_ID, totalVisitors: 0 },
        });
    }

    async incrementVisitors() {
        return this.prisma.visitorStats.upsert({
            where: { id: STATS_SENTINEL_ID },
            update: { totalVisitors: { increment: 1 } },
            create: { id: STATS_SENTINEL_ID, totalVisitors: 1 },
        });
    }
}
