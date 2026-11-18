import { appointmentInput, patientInput } from '@clinic/contracts';
import { assertRole, localParts } from '../src/clinic';
import { encrypt, decrypt, localReviewEmail } from '../src/security';
test('local review is refused outside loopback development', () => {
  const previous = { ...process.env };
  try {
    process.env.LOCAL_REVIEW_MODE = 'true';
    process.env.LOCAL_REVIEW_EMAIL = 'demo@clinic.local';
    process.env.APP_ORIGIN = 'http://127.0.0.1:5173';
    process.env.HOST = '127.0.0.1';
    process.env.NODE_ENV = 'development';
    expect(localReviewEmail()).toBe('demo@clinic.local');
    process.env.NODE_ENV = 'production';
    expect(() => localReviewEmail()).toThrow();
    process.env.NODE_ENV = 'development';
    process.env.HOST = '0.0.0.0';
    expect(() => localReviewEmail()).toThrow();
    process.env.HOST = '127.0.0.1';
    process.env.APP_ORIGIN = 'https://example.invalid';
    expect(() => localReviewEmail()).toThrow();
  } finally {
    process.env = previous;
  }
});
describe('business boundaries', () => {
  test('uses Istanbul day across UTC midnight', () => {
    expect(localParts(new Date('2026-11-15T22:30:00Z'))).toEqual({
      day: '2026-11-16',
      minute: 90,
      weekday: 1,
    });
  });
  test('normalizes phone and rejects extra medical fields', () => {
    expect(
      patientInput.parse({ fullName: 'Sentetik Kişi', phone: '0532 000 00 00' })
        .phone,
    ).toBe('+905320000000');
    expect(
      patientInput.safeParse({
        fullName: 'Demo',
        phone: '05320000000',
        diagnosis: 'not permitted',
      }).success,
    ).toBe(false);
  });
  test('rejects inverted appointment range', () => {
    const id = '00000000-0000-4000-8000-000000000001';
    expect(
      appointmentInput.safeParse({
        patientId: id,
        staffId: id,
        resourceId: id,
        startsAt: '2026-11-16T12:00:00Z',
        endsAt: '2026-11-16T11:00:00Z',
      }).success,
    ).toBe(false);
  });
  test('rejects unauthorized package administration', () => {
    expect(() =>
      assertRole(
        {
          id: 'test',
          name: 'test',
          role: 'RECEPTIONIST',
          staffId: null,
          csrf: '',
        },
        ['ADMIN'],
      ),
    ).toThrow();
  });
  test('encrypts MFA secrets with authenticated encryption', () => {
    process.env.MFA_ENCRYPTION_KEY = 'a'.repeat(64);
    const value = encrypt('SECRET');
    expect(value).not.toContain('SECRET');
    expect(decrypt(value)).toBe('SECRET');
    expect(() => decrypt(value.slice(0, -2) + 'ff')).toThrow();
  });
});
