import { Module, forwardRef } from '@nestjs/common';
import { LeadersResolver } from './leaders.resolver';
import { LeadersService } from './leaders.service';
import { LeadersRepository } from './leaders.repository';
import { DatabaseModule } from '../../database/database.module';
import { ImageKitModule } from '../../common/imagekit/imagekit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [DatabaseModule, ImageKitModule, forwardRef(() => AuthModule)],
    providers: [LeadersResolver, LeadersService, LeadersRepository],
    exports: [LeadersService],
})
export class LeadersModule { }
