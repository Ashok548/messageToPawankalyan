import { Module } from '@nestjs/common';
import { VisitorStatsResolver } from './visitor-stats.resolver';
import { VisitorStatsService } from './visitor-stats.service';

@Module({
    providers: [VisitorStatsResolver, VisitorStatsService],
    exports: [VisitorStatsService],
})
export class VisitorStatsModule { }
