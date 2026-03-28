import { Module, forwardRef } from '@nestjs/common';
import { RestAdminGuard } from '../../common/guards/rest-admin.guard';
import { RestAuthGuard } from '../../common/guards/rest-auth.guard';
import { RestOptionalAuthGuard } from '../../common/guards/rest-optional-auth.guard';
import { RestSuperAdminGuard } from '../../common/guards/rest-super-admin.guard';
import { ImageKitModule } from '../../common/imagekit/imagekit.module';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { AnalysisAdminController } from './analysis-admin.controller';
import { AnalysisController } from './analysis.controller';
import { AnalysisRepository } from './analysis.repository';
import { AnalysisResolver } from './analysis.resolver';
import { AnalysisService } from './analysis.service';
import { PublicIssuesAdminController } from './public-issues-admin.controller';
import { PublicIssuesController } from './public-issues.controller';
import { PublicIssuesResolver } from './public-issues.resolver';
import { PublicIssuesRepository } from './public-issues.repository';
import { PublicIssuesService } from './public-issues.service';

@Module({
    imports: [DatabaseModule, ImageKitModule, forwardRef(() => AuthModule)],
    controllers: [PublicIssuesController, PublicIssuesAdminController, AnalysisController, AnalysisAdminController],
    providers: [
        RestAdminGuard,
        RestAuthGuard,
        RestOptionalAuthGuard,
        RestSuperAdminGuard,
        PublicIssuesResolver,
        PublicIssuesRepository,
        PublicIssuesService,
        AnalysisResolver,
        AnalysisRepository,
        AnalysisService,
    ],
    exports: [PublicIssuesService],
})
export class PublicIssuesModule { }