import { Viewer } from '@clinic/contracts';
let csrf = '';
export function setCsrf(value: string) {
  csrf = value;
}
export async function api<T>(
  path: string,
  method = 'GET',
  body?: unknown,
  key?: string,
): Promise<T> {
  const response = await fetch('/api/v1' + path, {
    method,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf,
      ...(method !== 'GET'
        ? { 'Idempotency-Key': key || crypto.randomUUID() }
        : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const value = (await response.json()) as T & {
    message?: string;
    requestId?: string;
  };
  if (!response.ok) {
    if (
      response.status === 401 &&
      path !== '/auth/login' &&
      path !== '/auth/verify' &&
      path !== '/auth/session'
    )
      window.dispatchEvent(new Event('session-expired'));
    throw new Error(value.message || 'İşlem başarısız.');
  }
  return value;
}
export async function getViewer() {
  const v = await api<Viewer>('/auth/session');
  setCsrf(v.csrf);
  return v;
}
export function instant(date: string, time: string) {
  return new Date(`${date}T${time}:00+03:00`).toISOString();
}
export function dayNow() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Istanbul',
  }).format(new Date());
}
export function localTime(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
export function localDay(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value));
}
