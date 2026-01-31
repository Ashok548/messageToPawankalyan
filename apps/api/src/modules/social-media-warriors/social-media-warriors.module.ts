import { Module } from '@nestjs/common';
import { SocialMediaWarriorsService } from './social-media-warriors.service';
import { SocialMediaWarriorsResolver } from './social-media-warriors.resolver';
import { SocialMediaWarriorsRepository } from './social-media-warriors.repository';
import { DatabaseModule } from '../../database/database.module';
import { ImageKitModule } from '../../common/imagekit/imagekit.module';
import { GqlAuthGuard } from '@/common/guards/gql-auth.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule, DatabaseModule, ImageKitModule],
    providers: [SocialMediaWarriorsService, SocialMediaWarriorsResolver, SocialMediaWarriorsRepository],
    exports: [SocialMediaWarriorsService],
})
export class SocialMediaWarriorsModule { }
