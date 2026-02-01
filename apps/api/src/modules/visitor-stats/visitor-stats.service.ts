import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class VisitorStatsService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        // Get or create the stats record (there should only be one)
        let stats = await this.prisma.visitorStats.findFirst();

        if (!stats) {
            stats = await this.prisma.visitorStats.create({
                data: {
                    totalVisitors: 0,
                },
            });
        }

        return stats;
    }

    async incrementVisitors() {
        // Get or create stats
        const stats = await this.getStats();

        // Increment the counter atomically
        return this.prisma.visitorStats.update({
            where: { id: stats.id },
            data: {
                totalVisitors: {
                    increment: 1,
                },
            },
        });
    }
}
