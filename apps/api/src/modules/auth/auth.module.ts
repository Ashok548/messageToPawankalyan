import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: '7d' },
        }),
        forwardRef(() => UsersModule),
    ],
    providers: [AuthService, AuthResolver],
    exports: [AuthService],
})
export class AuthModule { }
