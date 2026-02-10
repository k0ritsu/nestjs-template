import { VersioningType } from '@nestjs/common';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/shared/prisma/prisma.service';

describe('UserController (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  const baseUrl = '/api/v1/users';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({
        trustProxy: true,
      }),
    );

    app.setGlobalPrefix('api', {
      exclude: ['startupz', 'livez', 'readyz', 'metrics'],
    });

    app.enableVersioning({
      type: VersioningType.URI,
    });

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users создает пользователя', async () => {
    const res = await request(app.getHttpServer())
      .post(baseUrl)
      .send({ username: 'john' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      username: 'john',
    });
    expect(typeof res.body.id).toBe('string');
  });

  it('GET /users возвращает список пользователей', async () => {
    await prisma.user.create({
      data: {
        id: '00000000-0000-0000-0000-000000000001',
        username: 'john',
      },
    });

    const res = await request(app.getHttpServer()).get(baseUrl);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: '00000000-0000-0000-0000-000000000001',
      username: 'john',
    });
  });

  it('GET /users/:id возвращает пользователя по id', async () => {
    const created = await prisma.user.create({
      data: {
        id: '00000000-0000-0000-0000-000000000002',
        username: 'alice',
      },
    });

    const res = await request(app.getHttpServer()).get(
      `${baseUrl}/${created.id}`,
    );

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: created.id,
      username: 'alice',
    });
  });

  it('PATCH /users/:id обновляет пользователя', async () => {
    const created = await prisma.user.create({
      data: {
        id: '00000000-0000-0000-0000-000000000003',
        username: 'bob',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`${baseUrl}/${created.id}`)
      .send({ username: 'bobby' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: created.id,
      username: 'bobby',
    });
  });

  it('DELETE /users/:id удаляет пользователя и возвращает 204', async () => {
    const created = await prisma.user.create({
      data: {
        id: '00000000-0000-0000-0000-000000000004',
        username: 'charlie',
      },
    });

    const deleteRes = await request(app.getHttpServer()).delete(
      `${baseUrl}/${created.id}`,
    );

    expect(deleteRes.status).toBe(204);

    const getRes = await request(app.getHttpServer()).get(
      `${baseUrl}/${created.id}`,
    );

    expect(getRes.status).toBe(404);
  });
});
