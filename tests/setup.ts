import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
export default async function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url || !new URL(url).pathname.endsWith('_test'))
    throw new Error('Isolated test DB required');
  const db = new PrismaClient({ datasources: { db: { url } } });
  try {
    await db.$executeRawUnsafe(
      'TRUNCATE "Idempotency", "AuditLog", "PackageLedger", "Session", "SessionPackage", "Appointment", "Patient", "Absence", "Resource", "Invite", "LoginSession", "User", "Staff" RESTART IDENTITY CASCADE',
    );
    const staff = await db.staff.create({
      data: { name: 'Sentetik Terapist' },
    });
    await db.resource.create({ data: { name: 'Test Odası' } });
    await db.user.create({
      data: {
        email: 'e2e@example.invalid',
        name: 'Test Yönetici',
        passwordHash: await argon2.hash('Synthetic-test-only-12345'),
        role: 'ADMIN',
        staffId: staff.id,
      },
    });
  } finally {
    await db.$disconnect();
  }
}
