import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bodyParser: true,
        rawBody: false,
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Increase body size limit for image uploads (base64 encoded)
    // Default is 100kb, we need more for images
    app.use(require('express').json({ limit: '2mb' }));
    app.use(require('express').urlencoded({ limit: '2mb', extended: true }));

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

    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
}

bootstrap();
