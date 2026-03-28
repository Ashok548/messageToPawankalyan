import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { RestAdminGuard } from '../../common/guards/rest-admin.guard';
import { ApproveAnalysisDto, RejectAnalysisDto } from './dto/analysis.input';
import { Analysis } from './entities/analysis.entity';
import { AnalysisService } from './analysis.service';

@Controller('admin/analysis')
@UseGuards(RestAdminGuard)
export class AnalysisAdminController {
    constructor(private readonly analysisService: AnalysisService) { }

    @Patch(':id/approve')
    async approve(
        @Param('id') id: string,
        @Body() input: ApproveAnalysisDto,
        @Req() req: any,
    ): Promise<Analysis> {
        return this.analysisService.approveAnalysis(id, req.user.id, input.adminNotes);
    }

    @Patch(':id/reject')
    async reject(
        @Param('id') id: string,
        @Body() input: RejectAnalysisDto,
        @Req() req: any,
    ): Promise<Analysis> {
        return this.analysisService.rejectAnalysis(id, req.user.id, input.rejectionReason, input.adminNotes);
    }
}