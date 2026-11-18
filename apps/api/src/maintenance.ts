import { config } from 'dotenv';
import { resolve } from 'node:path';
config({ path: resolve(__dirname, '../../../.env') });
import { PrismaClient } from '@prisma/client';
async function main() {
  const db = new PrismaClient();
  try {
    const now = new Date();
    await db.$transaction([
      db.loginSession.deleteMany({ where: { expiresAt: { lt: now } } }),
      db.invite.deleteMany({ where: { expiresAt: { lt: now } } }),
      db.idempotency.deleteMany({
        where: { createdAt: { lt: new Date(Date.now() - 86400000) } },
      }),
    ]);
    console.log('Expired authentication and retry records removed.');
  } finally {
    await db.$disconnect();
  }
}
void main().catch(() => {
  console.error('Maintenance failed');
  process.exitCode = 1;
});
