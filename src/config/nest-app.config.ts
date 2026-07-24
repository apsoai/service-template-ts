import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { TypeORMErrorFilter } from '../utils/errors/db-exception.filter';
import * as fs from 'fs';
import * as path from 'path';

export async function configureNestApp(app: INestApplication): Promise<void> {
  // Secure response headers. CSP is disabled so the Swagger UI at /_docs still
  // renders; all other helmet protections (HSTS, X-Content-Type-Options,
  // X-Frame-Options, etc.) stay on.
  app.use(helmet({ contentSecurityPolicy: false }));

  // Enforce the class-validator decorators on generated DTOs. Controllers are
  // generated with `validation: false` (the @nestjsx/crud convention for
  // deferring body validation to an app-wide pipe), so without this pipe every
  // DTO constraint (@IsEmail, @IsString, ...) is silently ignored. `whitelist`
  // strips unknown fields; forbidNonWhitelisted is intentionally NOT set, so
  // callers sending extra fields keep working (strip, don't 400).
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // CORS from ALLOWED_ORIGINS: comma-separated, scheme-qualified origins
  // (e.g. https://app.example.com). Left disabled when unset rather than
  // defaulting to a permissive wildcard.
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (allowedOrigins.length > 0) {
    app.enableCors({ origin: allowedOrigins, credentials: true });
  }

  // Configure global filters
  app.useGlobalFilters(new TypeORMErrorFilter());

  // Read service name from .apsorc
  let serviceName = '{Apso Service}';
  try {
    const apsoConfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '.apsorc'), 'utf8'));
    serviceName = apsoConfig.serviceName || serviceName;
  } catch (error) {
    console.warn('Could not read serviceName from .apsorc, using default value');
  }

  // Configure Swagger
  const options = new DocumentBuilder()
    .setTitle(serviceName)
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('_docs', app, document);
} 