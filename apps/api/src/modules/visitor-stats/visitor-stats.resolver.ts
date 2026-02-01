import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { VisitorStatsService } from './visitor-stats.service';
import { VisitorStats } from './entities/visitor-stats.entity';

@Resolver(() => VisitorStats)
export class VisitorStatsResolver {
    constructor(private readonly visitorStatsService: VisitorStatsService) { }

    @Query(() => VisitorStats, { name: 'getVisitorStats' })
    async getVisitorStats() {
        return this.visitorStatsService.getStats();
    }

    @Mutation(() => VisitorStats, { name: 'incrementVisitorCount' })
    @Throttle({ default: { limit: 1, ttl: 60000 } }) // 1 request per minute per IP
    async incrementVisitorCount() {
        return this.visitorStatsService.incrementVisitors();
    }
}
