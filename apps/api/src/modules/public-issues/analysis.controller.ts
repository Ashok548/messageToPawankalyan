import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { RestAdminGuard } from '../../common/guards/rest-admin.guard';
import { RestOptionalAuthGuard } from '../../common/guards/rest-optional-auth.guard';
import { CreateAnalysisInput } from './dto/analysis.input';
import { Analysis } from './entities/analysis.entity';
import { AnalysisService } from './analysis.service';

@Controller()
export class AnalysisController {
    constructor(private readonly analysisService: AnalysisService) { }

    @Post('analysis')
    @UseGuards(RestAdminGuard)
    async create(
        @Body() input: CreateAnalysisInput,
        @Req() req: any,
    ): Promise<Analysis> {
        return this.analysisService.create(input, req.user.id, req.user?.role);
    }

    @Get('issues/:id/analysis')
    @UseGuards(RestOptionalAuthGuard)
    async findByIssue(
        @Param('id') issueId: string,
        @Query('take') take?: string,
        @Query('skip') skip?: string,
    ): Promise<Analysis[]> {
        const parsedTake = Number.parseInt(take ?? '', 10);
        const parsedSkip = Number.parseInt(skip ?? '', 10);

        return this.analysisService.findByIssue(issueId, {
            take: Number.isNaN(parsedTake) ? 20 : parsedTake,
            skip: Number.isNaN(parsedSkip) ? 0 : parsedSkip,
        });
    }
}