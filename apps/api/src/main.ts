import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bodyParser: true,
        rawBody: false,
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Increase body size limit for base64 media uploads.
    app.use(require('express').json({ limit: '12mb' }));
    app.use(require('express').urlencoded({ limit: '12mb', extended: true }));

    // Enable CORS
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000' || 'https://manajsp.com' || 'https://www.manajsp.com',
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const port = process.env.PORT || 4000;
    await app.listen(port);
}

bootstrap();
