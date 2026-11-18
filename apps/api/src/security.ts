import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';
export const digest = (v: string) =>
  createHash('sha256').update(v).digest('hex');
export const token = () => randomBytes(32).toString('hex');
function key() {
  const v = process.env.MFA_ENCRYPTION_KEY || '';
  if (!/^[a-f0-9]{64}$/i.test(v))
    throw new Error('MFA_ENCRYPTION_KEY must be 64 hex characters');
  return Buffer.from(v, 'hex');
}
export function encrypt(v: string) {
  const iv = randomBytes(12),
    c = createCipheriv('aes-256-gcm', key(), iv);
  const b = Buffer.concat([c.update(v, 'utf8'), c.final()]);
  return [
    iv.toString('hex'),
    c.getAuthTag().toString('hex'),
    b.toString('hex'),
  ].join('.');
}
export function decrypt(v: string) {
  const [iv, tag, b] = v.split('.');
  if (!iv || !tag || !b) throw new Error('Invalid encrypted secret');
  const c = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'hex'));
  c.setAuthTag(Buffer.from(tag, 'hex'));
  return Buffer.concat([c.update(Buffer.from(b, 'hex')), c.final()]).toString(
    'utf8',
  );
}
export function validateConfig() {
  key();
  const origin = new URL(process.env.APP_ORIGIN || '');
  if (process.env.NODE_ENV === 'production' && origin.protocol !== 'https:')
    throw new Error('Production requires HTTPS');
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required');
  if (process.env.LOCAL_REVIEW_MODE === 'true') localReviewEmail();
}

// Explicit opt-in for local UI review, scoped to a single account.
export function localReviewEmail(): string | null {
  if (process.env.LOCAL_REVIEW_MODE !== 'true') return null;
  const origin = new URL(process.env.APP_ORIGIN || '');
  if (
    process.env.NODE_ENV !== 'development' ||
    origin.protocol !== 'http:' ||
    !['127.0.0.1', 'localhost'].includes(origin.hostname) ||
    !['127.0.0.1', 'localhost'].includes(process.env.HOST || '127.0.0.1') ||
    !process.env.LOCAL_REVIEW_EMAIL
  )
    throw new Error(
      'Local review requires development, loopback binding and a designated account',
    );
  return process.env.LOCAL_REVIEW_EMAIL.toLowerCase();
}
