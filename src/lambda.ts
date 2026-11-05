// Must be the very first import: OpenTelemetry has to patch http/pg/typeorm
// before Nest and those libraries load. Safe no-op when OTel is disabled.
import './tracing';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.rest';
import { configureNestApp } from './config/nest-app.config';

let serverPromise: Promise<ReturnType<typeof serverlessExpress>> | undefined;

// Boots Nest once per instance. Called during Lambda init by lambda-entry.mjs;
// the handler also calls it so it still works when no entry file is used.
export const bootstrap = () => {
  if (!serverPromise) {
    serverPromise = (async () => {
      const nestApp = await NestFactory.create(AppModule);
      await configureNestApp(nestApp);
      await nestApp.init();
      return serverlessExpress({ app: nestApp.getHttpAdapter().getInstance() });
    })();
    // Allow a retry on the next request if boot failed (e.g. database error).
    serverPromise.catch(() => {
      serverPromise = undefined;
    });
  }
  return serverPromise;
};

export const handler = async (event, context) => {
  const server = await bootstrap();
  return server(event, context, () => undefined);
};
