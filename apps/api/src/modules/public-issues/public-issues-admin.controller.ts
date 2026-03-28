import { BadRequestException, Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { RestSuperAdminGuard } from '../../common/guards/rest-super-admin.guard';
import {
    AdminPublicIssueQueryDto,
    ApprovePublicIssueDto,
    RejectPublicIssueDto,
    UpdatePublicIssuePriorityDto,
    UpdatePublicIssueVerificationStatusDto,
} from './dto/public-issue-admin.dto';
import { IssuePriority, PublicIssue, PublicIssueCategory, PublicIssueStatus, VerificationStatus } from './entities/public-issue.entity';
import { PublicIssuesService } from './public-issues.service';

@Controller('admin/issues')
@UseGuards(RestSuperAdminGuard)
export class PublicIssuesAdminController {
    constructor(private readonly publicIssuesService: PublicIssuesService) { }

    @Get()
    async findAll(
        @Query() query: AdminPublicIssueQueryDto,
        @Req() req: any,
    ): Promise<PublicIssue[]> {
        const status = query.status ?? PublicIssueStatus.PENDING;

        if (!Object.values(PublicIssueStatus).includes(status)) {
            throw new BadRequestException('Invalid status');
        }

        if (query.category && !Object.values(PublicIssueCategory).includes(query.category)) {
            throw new BadRequestException('Invalid category');
        }

        const parsedTake = Number.parseInt(query.take ?? '', 10);
        const parsedSkip = Number.parseInt(query.skip ?? '', 10);

        return this.publicIssuesService.findAllForAdmin(
            {
                status,
                category: query.category,
                district: query.district,
                searchTerm: query.searchTerm,
            },
            Number.isNaN(parsedTake) ? 50 : parsedTake,
            Number.isNaN(parsedSkip) ? 0 : parsedSkip,
            req.user?.id,
        );
    }

    @Patch(':id/approve')
    async approve(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() input: ApprovePublicIssueDto,
        @Req() req: any,
    ): Promise<PublicIssue> {
        return this.publicIssuesService.approveIssue(id, req.user.id, input.adminNotes);
    }

    @Patch(':id/reject')
    async reject(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() input: RejectPublicIssueDto,
        @Req() req: any,
    ): Promise<PublicIssue> {
        return this.publicIssuesService.rejectIssue(id, req.user.id, input.rejectionReason, input.adminNotes);
    }

    @Patch(':id/priority')
    async updatePriority(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() input: UpdatePublicIssuePriorityDto,
        @Req() req: any,
    ): Promise<PublicIssue> {
        if (!Object.values(IssuePriority).includes(input.priority)) {
            throw new BadRequestException('Invalid priority');
        }

        return this.publicIssuesService.updatePriority(id, input.priority, req.user.id);
    }

    @Patch(':id/verification-status')
    async updateVerificationStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() input: UpdatePublicIssueVerificationStatusDto,
        @Req() req: any,
    ): Promise<PublicIssue> {
        if (!Object.values(VerificationStatus).includes(input.verificationStatus)) {
            throw new BadRequestException('Invalid verification status');
        }

        return this.publicIssuesService.updateVerificationStatus(id, input.verificationStatus, req.user.id);
    }

    @Delete(':id')
    async delete(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<PublicIssue> {
        return this.publicIssuesService.delete(id);
    }
}