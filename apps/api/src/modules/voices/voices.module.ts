import { Module, forwardRef } from '@nestjs/common';
import { ImageKitModule } from '../../common/imagekit/imagekit.module';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { VoicesResolver } from './voices.resolver';
import { VoicesRepository } from './voices.repository';
import { VoicesService } from './voices.service';

@Module({
    imports: [DatabaseModule, ImageKitModule, forwardRef(() => AuthModule)],
    providers: [VoicesResolver, VoicesRepository, VoicesService],
    exports: [VoicesService],
})
export class VoicesModule { }