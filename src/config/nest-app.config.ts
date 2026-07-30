import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TypeORMErrorFilter } from '../utils/errors/db-exception.filter';
import { getServiceName } from '../utils/service-metadata';

export async function configureNestApp(app: INestApplication): Promise<void> {
  // Configure global filters
  app.useGlobalFilters(new TypeORMErrorFilter());

  // Service name for the docs title (shared resolver: .apsorc → APP_NAME → pkg).
  const serviceName = getServiceName('{Apso Service}');

  // Configure Swagger
  const options = new DocumentBuilder()
    .setTitle(serviceName)
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('_docs', app, document);
} 