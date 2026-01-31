import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { ImageKitModule } from '../../common/imagekit/imagekit.module';
import { DisciplinaryCasesRepository } from './repositories/disciplinary-cases.repository';
import { DisciplinaryCaseService } from './services/disciplinary-case.service';
import { DisciplinaryCaseResolver } from './resolvers/disciplinary-case.resolver';

@Module({
    imports: [
        ImageKitModule,
        AuthModule,
        DatabaseModule
    ],
    providers: [
        DisciplinaryCasesRepository,
        DisciplinaryCaseService,
        DisciplinaryCaseResolver,
    ],
    exports: [DisciplinaryCaseService],
})
export class DisciplinaryCaseModule { }
