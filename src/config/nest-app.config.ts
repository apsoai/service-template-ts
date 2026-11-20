import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { mountMcp } from '@apso/mcp';
import { TypeORMErrorFilter } from '../utils/errors/db-exception.filter';
import { getApsorc, getServiceName } from '../utils/service-metadata';
import * as autogen from '../autogen';

export async function configureNestApp(app: INestApplication): Promise<void> {
  // Configure global filters
  app.useGlobalFilters(new TypeORMErrorFilter());

  // Configure Swagger
  const document = SwaggerModule.createDocument(app, buildDocumentConfig());
  unwrapDataResponses(document);
  SwaggerModule.setup('_docs', app, document);

  // Serve the routes marked with @McpTool as MCP tools at /mcp. Nothing is
  // mounted until a route is marked (entities opt in with "mcp" in .apsorc).
  mountMcp(app, document);
}

/**
 * Title and auth for /_docs-json. Every route needs a credential (the
 * generated guards refuse a request without one), so the document declares
 * it: a bearer token when .apsorc has a sign-in provider, and the API key.
 */
export function buildDocumentConfig(): Omit<OpenAPIObject, 'paths'> {
  const signIn = Boolean(getApsorc().auth);
  const builder = new DocumentBuilder()
    .setTitle(getServiceName('API'))
    .setVersion('1.0');
  // The CLI (0.52+) generates the access rules from .apsorc into src/autogen:
  // sign-in provider, tenant scoping and the roles each operation needs.
  const generated = (autogen as unknown as { apiDescription?: unknown }).apiDescription;
  if (typeof generated === 'string' && generated) {
    builder.setDescription(generated);
  } else if (signIn) {
    builder.setDescription(
      "Send the signed-in user's token from the sign-in provider as `Authorization: Bearer <token>`. " +
        'The server reads the tenant and roles from the token and fills in the tenant field on every write.',
    );
  }
  if (signIn) {
    builder
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
      .addSecurityRequirements('bearer');
  }
  builder
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description:
          'The service API key, for server-side callers. Never put it in a browser app. ' +
          'A key caller is not limited to one tenant, so it sends the tenant field (scopeBy) itself.',
      },
      'apiKey',
    )
    .addSecurityRequirements('apiKey');
  return builder.build();
}

/**
 * The CRUD routes return the row itself, but @apso/crud documents some
 * responses as `{ data: row }`. Document what the server sends.
 */
export function unwrapDataResponses(document: OpenAPIObject): void {
  for (const pathItem of Object.values(document.paths ?? {})) {
    for (const operation of Object.values(pathItem ?? {}) as any[]) {
      for (const [status, response] of Object.entries(operation?.responses ?? {}) as [string, any][]) {
        const media = status.startsWith('2') && response?.content?.['application/json'];
        const props = media?.schema?.properties;
        if (props && Object.keys(props).length === 1 && props.data) media.schema = props.data;
      }
    }
  }
}
