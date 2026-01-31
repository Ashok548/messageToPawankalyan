import { Module } from '@nestjs/common';
import { GovernanceHighlightsResolver } from './governance-highlights.resolver';
import { GovernanceHighlightsService } from './governance-highlights.service';
import { GovernanceHighlightsRepository } from './governance-highlights.repository';
import { DatabaseModule } from '../../database/database.module';
import { ImageKitModule } from '../../common/imagekit/imagekit.module';

import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [DatabaseModule, ImageKitModule, AuthModule],
    providers: [
        GovernanceHighlightsResolver,
        GovernanceHighlightsService,
        GovernanceHighlightsRepository,
    ],
    exports: [GovernanceHighlightsService],
})
export class GovernanceHighlightsModule { }
