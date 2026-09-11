import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return 200 OK with { status: "ok" }', async () => {
      await request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect({ status: 'ok' });
    });
  });
});
