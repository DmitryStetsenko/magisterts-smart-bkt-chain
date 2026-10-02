import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // 📜 Swagger API Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Smart-BKT-Chain API')
    .setDescription('REST API & WebSocket Backend for Smart-BKT-Chain Adaptive Learning System')
    .setVersion('1.0.0')
    .addTag('Health', 'Healthcheck and database connectivity endpoints')
    .addTag('BKT', 'Bayesian Knowledge Tracing calculation engine')
    .addTag('Tasks', 'Task sequencing and assessment endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v1/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Smart-BKT-Chain API backend is running on: http://localhost:${port}/api/v1`);
  logger.log(`📜 Swagger API Documentation available at: http://localhost:${port}/api/v1/docs`);
}

bootstrap();
