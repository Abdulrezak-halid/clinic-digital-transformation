import { describe, it, expect } from 'vitest';
import { dayNow, instant, localDay, localTime } from './api';
describe('clinic timezone', () => {
  it('converts local appointment to UTC', () => {
    expect(instant('2026-11-16', '09:00')).toBe('2026-11-16T06:00:00.000Z');
  });
  it('shows Istanbul date and time', () => {
    expect(localDay('2026-11-15T22:30:00Z')).toBe('2026-11-16');
    expect(localTime('2026-11-15T22:30:00Z')).toBe('01:30');
    expect(dayNow()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
