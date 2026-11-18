import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/main';
import { digest } from '../src/security';
import { totp } from '../src/auth';
const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test'))
  throw new Error(
    'TEST_DATABASE_URL must point to an isolated *_test database',
  );
process.env.DATABASE_URL = url;
process.env.APP_ORIGIN = 'http://127.0.0.1:5173';
process.env.MFA_ENCRYPTION_KEY = 'a'.repeat(64);
process.env.LOCAL_REVIEW_MODE = 'false';
const db = new PrismaClient({ datasources: { db: { url } } });
let app: INestApplication;
let staffId: string, resourceId: string, patientId: string;
let raw: string, csrf: string;
const origin = 'http://127.0.0.1:5173';
function post(path: string, body: object = {}, key = randomUUID()) {
  return request(app.getHttpServer())
    .post('/api/v1' + path)
    .set('Origin', origin)
    .set('Cookie', 'clinic_session=' + raw)
    .set('X-CSRF-Token', csrf)
    .set('Idempotency-Key', key)
    .send(body);
}
function get(path: string) {
  return request(app.getHttpServer())
    .get('/api/v1' + path)
    .set('Cookie', 'clinic_session=' + raw);
}
const booking = () => ({
  patientId,
  staffId,
  resourceId,
  startsAt: '2026-11-16T06:00:00Z',
  endsAt: '2026-11-16T07:00:00Z',
});
beforeAll(async () => {
  app = await createApp();
  await app.init();
});
afterAll(async () => {
  await app.close();
  await db.$disconnect();
});
beforeEach(async () => {
  await db.$executeRawUnsafe(
    'TRUNCATE "Idempotency", "AuditLog", "PackageLedger", "Session", "SessionPackage", "Appointment", "Patient", "Absence", "Resource", "Invite", "LoginSession", "User", "Staff" RESTART IDENTITY CASCADE',
  );
  const staff = await db.staff.create({ data: { name: 'Sentetik Terapist' } });
  staffId = staff.id;
  resourceId = (await db.resource.create({ data: { name: 'Test Sedye' } })).id;
  patientId = (
    await db.patient.create({
      data: { fullName: 'Sentetik Hasta', phone: '+905320000000' },
    })
  ).id;
  const user = await db.user.create({
    data: {
      name: 'Test Yönetici',
      email: 'admin@example.invalid',
      passwordHash: await argon2.hash('Only-for-tests-12345'),
      role: 'ADMIN',
      staffId,
    },
  });
  raw = randomUUID();
  csrf = randomUUID();
  await db.loginSession.create({
    data: {
      id: digest(raw),
      userId: user.id,
      csrf,
      verified: true,
      expiresAt: new Date(Date.now() + 3600000),
    },
  });
});
test('requires session, CSRF and matching origin', async () => {
  expect(
    (await request(app.getHttpServer()).get('/api/v1/patients')).status,
  ).toBe(401);
  expect(
    (
      await request(app.getHttpServer())
        .post('/api/v1/patients')
        .set('Origin', origin)
        .set('Cookie', 'clinic_session=' + raw)
        .send({})
    ).status,
  ).toBe(403);
  expect(
    (
      await request(app.getHttpServer())
        .post('/api/v1/patients')
        .set('Origin', 'https://evil.invalid')
        .send({})
    ).status,
  ).toBe(403);
});
test('patient registration is persistent and duplicate safe', async () => {
  const v = { fullName: 'Başka Sentetik', phone: '05320000001' };
  expect((await post('/patients', v)).status).toBe(201);
  expect((await post('/patients', v)).status).toBe(409);
  expect((await get('/patients')).body).toHaveLength(2);
});
test('simultaneous overlapping bookings accept exactly one, adjacent booking works', async () => {
  const results = await Promise.all([
    post('/appointments', booking()),
    post('/appointments', booking()),
  ]);
  expect(results.map((x) => x.status).sort()).toEqual([201, 409]);
  expect(
    (
      await post('/appointments', {
        ...booking(),
        startsAt: '2026-11-16T07:00:00Z',
        endsAt: '2026-11-16T08:00:00Z',
      })
    ).status,
  ).toBe(201);
});
test('database itself rejects overlapping direct inserts', async () => {
  await db.appointment.create({
    data: {
      ...booking(),
      startsAt: new Date(booking().startsAt),
      endsAt: new Date(booking().endsAt),
    },
  });
  await expect(
    db.appointment.create({
      data: {
        ...booking(),
        startsAt: new Date(booking().startsAt),
        endsAt: new Date(booking().endsAt),
      },
    }),
  ).rejects.toThrow();
});
test('outside working hours and staff absence are rejected', async () => {
  expect(
    (
      await post('/appointments', {
        ...booking(),
        startsAt: '2026-11-16T03:00:00Z',
        endsAt: '2026-11-16T04:00:00Z',
      })
    ).status,
  ).toBe(409);
  expect(
    (
      await post('/staff/' + staffId + '/absences', {
        startsAt: booking().startsAt,
        endsAt: booking().endsAt,
      })
    ).status,
  ).toBe(201);
  expect((await post('/appointments', booking())).status).toBe(409);
});
test('completion is atomic, idempotent and reversible once', async () => {
  const pkg = (
    await post('/packages', { patientId, label: 'Test Paket', total: 1 })
  ).body;
  const a = (await post('/appointments', booking())).body;
  const key = randomUUID();
  const [one, two] = await Promise.all([
    post('/appointments/' + a.id + '/complete', { packageId: pkg.id }, key),
    post('/appointments/' + a.id + '/complete', { packageId: pkg.id }, key),
  ]);
  expect(one.status).toBe(201);
  expect(two.body.id).toBe(one.body.id);
  expect(await db.session.count()).toBe(1);
  expect(
    (await get('/packages?patientId=' + patientId)).body[0].remaining,
  ).toBe(0);
  expect(
    (
      await post('/sessions/' + one.body.id + '/reverse', {
        reason: 'Yanlış seans düzeltmesi',
      })
    ).status,
  ).toBe(201);
  expect(
    (await get('/packages?patientId=' + patientId)).body[0].remaining,
  ).toBe(1);
  expect(
    (
      await post('/sessions/' + one.body.id + '/reverse', {
        reason: 'Tekrar düzeltme',
      })
    ).status,
  ).toBe(409);
});
test('concurrent distinct completions cannot overdraw last package credit', async () => {
  const pkg = (
    await post('/packages', { patientId, label: 'Son Hak', total: 1 })
  ).body;
  const a = (await post('/appointments', booking())).body;
  const b = (
    await post('/appointments', {
      ...booking(),
      startsAt: '2026-11-16T07:00:00Z',
      endsAt: '2026-11-16T08:00:00Z',
    })
  ).body;
  const results = await Promise.all([
    post('/appointments/' + a.id + '/complete', { packageId: pkg.id }),
    post('/appointments/' + b.id + '/complete', { packageId: pkg.id }),
  ]);
  expect(results.map((x) => x.status).sort()).toEqual([201, 409]);
  expect(await db.packageLedger.count()).toBe(1);
});
test('cancellation leaves balance unchanged and archived patients cannot be booked', async () => {
  const pkg = (await post('/packages', { patientId, label: 'Test', total: 2 }))
    .body;
  const a = (await post('/appointments', booking())).body;
  expect(
    (
      await post('/appointments/' + a.id + '/status', {
        status: 'cancelled',
        version: 0,
      })
    ).status,
  ).toBe(201);
  expect(
    (await get('/packages?patientId=' + patientId)).body.find(
      (p: { id: string }) => p.id === pkg.id,
    ).remaining,
  ).toBe(2);
  expect((await post('/patients/' + patientId + '/archive')).status).toBe(201);
  expect((await post('/appointments', booking())).status).toBe(409);
});
test('stale rescheduling is rejected', async () => {
  const a = (await post('/appointments', booking())).body;
  const move = {
    appointment: {
      ...booking(),
      startsAt: '2026-11-16T08:00:00Z',
      endsAt: '2026-11-16T09:00:00Z',
    },
    version: 0,
  };
  const call = () =>
    request(app.getHttpServer())
      .patch('/api/v1/appointments/' + a.id)
      .set('Origin', origin)
      .set('Cookie', 'clinic_session=' + raw)
      .set('X-CSRF-Token', csrf)
      .set('Idempotency-Key', randomUUID())
      .send(move);
  expect((await call()).status).toBe(200);
  expect((await call()).status).toBe(409);
});
test('receptionist cannot open packages and disabled users lose access', async () => {
  const s = await db.loginSession.findUniqueOrThrow({
    where: { id: digest(raw) },
  });
  await db.user.update({
    where: { id: s.userId },
    data: { role: 'RECEPTIONIST' },
  });
  expect(
    (await post('/packages', { patientId, label: 'Test', total: 1 })).status,
  ).toBe(403);
  await db.user.update({ where: { id: s.userId }, data: { active: false } });
  expect((await get('/patients')).status).toBe(401);
});
test('MFA enrollment required, code verified and session rotated', async () => {
  const result = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .set('Origin', origin)
    .send({ email: 'admin@example.invalid', password: 'Only-for-tests-12345' });
  expect(result.status).toBe(201);
  expect(result.body.secret).toBeTruthy();
  const cookies = result.headers['set-cookie'] as unknown as string[];
  const cookie = cookies[0]!.split(';')[0]!;
  expect(
    (
      await request(app.getHttpServer())
        .get('/api/v1/patients')
        .set('Cookie', cookie)
    ).status,
  ).toBe(401);
  const code = totp(result.body.secret).generate();
  const verified = await request(app.getHttpServer())
    .post('/api/v1/auth/verify')
    .set('Origin', origin)
    .set('Cookie', cookie)
    .set('X-CSRF-Token', result.body.csrf)
    .send({ code });
  expect(verified.status).toBe(201);
  expect(
    (
      await request(app.getHttpServer())
        .get('/api/v1/auth/session')
        .set(
          'Cookie',
          (verified.headers['set-cookie'] as unknown as string[])[0]!.split(
            ';',
          )[0]!,
        )
    ).status,
  ).toBe(200);
  expect(
    (
      await request(app.getHttpServer())
        .get('/api/v1/auth/session')
        .set('Cookie', cookie)
    ).status,
  ).toBe(401);
});

test('therapist cannot change another staff calendar or manage users', async () => {
  const session = await db.loginSession.findUniqueOrThrow({
    where: { id: digest(raw) },
  });
  await db.user.update({
    where: { id: session.userId },
    data: { role: 'THERAPIST' },
  });
  const other = await db.staff.create({
    data: { name: 'Başka Sentetik Terapist' },
  });
  expect(
    (await post('/appointments', { ...booking(), staffId: other.id })).status,
  ).toBe(403);
  expect((await get('/users')).status).toBe(403);
  expect((await post('/appointments', booking())).status).toBe(201);
});

test('retry keys reject a different payload', async () => {
  const key = randomUUID();
  expect(
    (
      await post(
        '/patients',
        { fullName: 'Sentetik Tekrar', phone: '05320000007' },
        key,
      )
    ).status,
  ).toBe(201);
  expect(
    (
      await post(
        '/patients',
        { fullName: 'Değişen Sentetik', phone: '05320000008' },
        key,
      )
    ).status,
  ).toBe(409);
});

test('history cannot be silently rewritten', async () => {
  await post('/patients', {
    fullName: 'Sentetik Denetim',
    phone: '05320000006',
  });
  await expect(
    db.$executeRaw`UPDATE "AuditLog" SET action = 'changed'`,
  ).rejects.toThrow();
});

test('local review still validates password and issues a protected session', async () => {
  const previous = { ...process.env };
  try {
    process.env.NODE_ENV = 'development';
    process.env.LOCAL_REVIEW_MODE = 'true';
    process.env.LOCAL_REVIEW_EMAIL = 'admin@example.invalid';
    process.env.HOST = '127.0.0.1';
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Origin', origin)
      .send({
        email: 'admin@example.invalid',
        password: 'Only-for-tests-12345',
      });
    expect(response.status).toBe(201);
    expect(response.body.authenticated).toBe(true);
    expect(response.body.secret).toBeNull();
    const cookie = (
      response.headers['set-cookie'] as unknown as string[]
    )[0]!.split(';')[0]!;
    expect(
      (
        await request(app.getHttpServer())
          .get('/api/v1/auth/session')
          .set('Cookie', cookie)
      ).status,
    ).toBe(200);
    const wrong = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Origin', origin)
      .send({ email: 'admin@example.invalid', password: 'wrong' });
    expect(wrong.status).toBe(401);
  } finally {
    process.env = previous;
  }
});
