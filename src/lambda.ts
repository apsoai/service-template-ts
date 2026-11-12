// Must be the very first import: OpenTelemetry has to patch http/pg/typeorm
// before Nest and those libraries load. Safe no-op when OTel is disabled.
import './tracing';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { useApsoLogging } from '@apso/logging';
import { AppModule } from './app.module.rest';
import { configureNestApp } from './config/nest-app.config';

let cachedServer;

export const handler = async (event, context) => {
  if (!cachedServer) {
    const nestApp = await NestFactory.create(AppModule, { bufferLogs: true });
    // One JSON line per request with who called, and a request id on every line.
    useApsoLogging(nestApp);
    await configureNestApp(nestApp);
    await nestApp.init();
    cachedServer = serverlessExpress({ app: nestApp.getHttpAdapter().getInstance() });
  }

  return cachedServer(event, context);
}