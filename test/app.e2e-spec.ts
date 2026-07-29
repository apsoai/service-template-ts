/**
 * Smoke E2E: the scaffolded app boots on the in-memory pglite database and
 * serves /health. Runs with the published @apso/crud packages — this is the
 * template's minimal proof that a generated service actually starts.
 */
process.env.DATABASE_TYPE = 'pglite';
process.env.DATABASE_SYNC = 'true';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module.rest';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /health responds', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
  });
});
