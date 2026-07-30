// Must be the very first import: OpenTelemetry has to patch http/pg/typeorm
// before Nest and those libraries load. Safe no-op when OTel is disabled.
import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.rest';
import { configureNestApp } from './config/nest-app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await configureNestApp(app);
  await app.listen(process.env.APP_PORT || 3000);
}

bootstrap();
