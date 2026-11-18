import { config } from 'dotenv';
import { resolve } from 'node:path';
config({ path: resolve(__dirname, '../../../.env') });
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { token, digest } from './security';
async function main() {
  const email = z.email().parse(process.env.RECOVERY_EMAIL);
  const reason = z.string().min(10).parse(process.env.RECOVERY_REASON);
  const db = new PrismaClient();
  try {
    const raw = token();
    await db.$transaction(async (tx) => {
      const u = await tx.user.findUniqueOrThrow({ where: { email } });
      await tx.loginSession.deleteMany({ where: { userId: u.id } });
      await tx.invite.deleteMany({ where: { userId: u.id } });
      await tx.user.update({
        where: { id: u.id },
        data: { active: false, mfaSecret: null, lastTotpStep: null },
      });
      await tx.invite.create({
        data: {
          userId: u.id,
          tokenHash: digest(raw),
          expiresAt: new Date(Date.now() + 3600000),
        },
      });
      await tx.auditLog.create({
        data: {
          action: 'auth.operator_recovery',
          targetId: u.id,
          requestId: digest(reason),
        },
      });
    });
    console.log(
      'Tek kullanımlık kurtarma anahtarı (1 saat; güvenli kanaldan iletin):\n' +
        raw,
    );
  } finally {
    await db.$disconnect();
  }
}
void main().catch(() => {
  console.error(
    'Kurtarma başarısız. RECOVERY_EMAIL ve en az 10 karakter RECOVERY_REASON gereklidir.',
  );
  process.exitCode = 1;
});
