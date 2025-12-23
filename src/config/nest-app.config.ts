import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TypeORMErrorFilter } from '../utils/errors/db-exception.filter';
import * as fs from 'fs';
import * as path from 'path';

export async function configureNestApp(app: INestApplication): Promise<void> {
  // Enable CORS for all origins - API Gateway handles authorization
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: false,
  });

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