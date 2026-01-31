import { Module, forwardRef } from '@nestjs/common';
import { AtrocitiesService } from './atrocities.service';
import { AtrocitiesResolver } from './atrocities.resolver';
import { AtrocitiesRepository } from './atrocities.repository';
import { DatabaseModule } from '../../database/database.module';
import { ImageKitModule } from '../../common/imagekit/imagekit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [DatabaseModule, ImageKitModule, forwardRef(() => AuthModule)],
    providers: [AtrocitiesResolver, AtrocitiesService, AtrocitiesRepository],
    exports: [AtrocitiesService],
})
export class AtrocitiesModule { }
