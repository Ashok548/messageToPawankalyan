import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AuthModule } from './modules/auth/auth.module';
import { AtrocitiesModule } from './modules/atrocities/atrocities.module';
import { LeadersModule } from './modules/leaders/leaders.module';
import { SocialMediaWarriorsModule } from './modules/social-media-warriors/social-media-warriors.module';
import { GovernanceHighlightsModule } from './modules/governance-highlights/governance-highlights.module';
import { ImageKitModule } from './common/imagekit/imagekit.module';
import { DisciplinaryCaseModule } from './modules/disciplinary-cases/disciplinary-case.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            sortSchema: true,
            playground: true,
            context: ({ req, res }) => ({ req, res }),
        }),
        DatabaseModule,
        ImageKitModule,
        AuthModule,
        UsersModule,
        ProjectsModule,
        AtrocitiesModule,
        LeadersModule,
        SocialMediaWarriorsModule,
        GovernanceHighlightsModule,
        DisciplinaryCaseModule,
    ],
})
export class AppModule { }
