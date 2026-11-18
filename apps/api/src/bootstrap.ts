import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'node:path';
config({ path: resolve(__dirname, '../../../.env') });
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { z } from 'zod';
async function main() {
  const db = new PrismaClient();
  try {
    const input = z
      .object({
        email: z.email(),
        name: z.string().min(2),
        password: z.string().min(14),
      })
      .parse({
        email: process.env.BOOTSTRAP_EMAIL,
        name: process.env.BOOTSTRAP_NAME,
        password: process.env.BOOTSTRAP_PASSWORD,
      });
    if (await db.user.count())
      throw new Error('Bootstrap only allowed on an empty user table');
    await db.$transaction(async (tx) => {
      const staff = await tx.staff.create({ data: { name: input.name } });
      await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          name: input.name,
          passwordHash: await argon2.hash(input.password),
          role: 'ADMIN',
          staffId: staff.id,
        },
      });
      await tx.resource.create({ data: { name: 'Sedye 1' } });
    });
    console.log('Yönetici oluşturuldu. İlk girişte MFA kurulumu zorunludur.');
  } finally {
    await db.$disconnect();
  }
}
void main().catch(() => {
  console.error(
    'Bootstrap başarısız. Boş veritabanı, e-posta, ad ve en az 14 karakter parola gereklidir.',
  );
  process.exitCode = 1;
});
