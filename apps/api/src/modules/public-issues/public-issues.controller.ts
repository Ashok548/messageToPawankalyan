import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { RestAuthGuard } from '../../common/guards/rest-auth.guard';
import { RestOptionalAuthGuard } from '../../common/guards/rest-optional-auth.guard';
import { CreatePublicIssueInput, PublicIssueFilterInput, PublicIssueSortBy } from './dto/public-issue.input';
import { IssuePriority } from './entities/public-issue.entity';
import { PublicIssue } from './entities/public-issue.entity';
import { PublicIssuesService } from './public-issues.service';

@Controller('issues')
@UseGuards(RestOptionalAuthGuard)
export class PublicIssuesController {
    constructor(private readonly publicIssuesService: PublicIssuesService) { }

    @Get()
    async findAll(
        @Query('filter') filterMode: 'latest' | 'priority' = 'latest',
        @Query('take') take?: string,
        @Query('skip') skip?: string,
        @Req() req?: any,
    ): Promise<PublicIssue[]> {
        const filter: PublicIssueFilterInput = filterMode === 'priority'
            ? { priority: IssuePriority.HIGH, sortBy: PublicIssueSortBy.TRENDING }
            : { sortBy: PublicIssueSortBy.LATEST };

        const parsedTake = Number.parseInt(take ?? '', 10);
        const parsedSkip = Number.parseInt(skip ?? '', 10);

        return this.publicIssuesService.findAllPublic(
            filter,
            Number.isNaN(parsedTake) ? undefined : parsedTake,
            Number.isNaN(parsedSkip) ? undefined : parsedSkip,
            req.user?.id,
        );
    }

    @Post()
    async create(
        @Body() input: CreatePublicIssueInput,
        @Req() req: any,
    ): Promise<PublicIssue> {
        return this.publicIssuesService.create(input, req.user?.id);
    }

    @Get(':id')
    async findById(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req?: any,
    ): Promise<PublicIssue> {
        return this.publicIssuesService.findById(id, req.user?.role, req.user?.id);
    }

    @Post(':id/support')
    @UseGuards(RestAuthGuard)
    async addSupport(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: any,
    ): Promise<PublicIssue> {
        return this.publicIssuesService.addSupport(id, req.user.id);
    }

    @Delete(':id/support')
    @UseGuards(RestAuthGuard)
    async removeSupport(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: any,
    ): Promise<PublicIssue> {
        return this.publicIssuesService.removeSupport(id, req.user.id);
    }
}
