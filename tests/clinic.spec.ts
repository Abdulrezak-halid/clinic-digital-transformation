import { test, expect } from '@playwright/test';
import * as OTPAuth from 'otpauth';
test('administrator completes the administrative clinic workflow', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Kliniğinize giriş yapın' }),
  ).toBeVisible();
  await page.getByLabel('E-posta', { exact: true }).fill('e2e@example.invalid');
  await page
    .getByLabel('Parola', { exact: true })
    .fill('Synthetic-test-only-12345');
  await page.getByRole('button', { name: 'Giriş yap', exact: true }).click();
  const secret = await page.locator('.setup code').innerText();
  const otp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret) });
  await page.getByLabel('Doğrulama kodu').fill(otp.generate());
  await page.getByRole('button', { name: 'Doğrula', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Bugün klinikte' }),
  ).toBeVisible();
  await page.screenshot({ path: 'test-results/dashboard.png', fullPage: true });
  await page.getByRole('link', { name: 'Hastalar', exact: true }).click();
  await page.getByRole('button', { name: 'Hasta ekle' }).click();
  await page.getByLabel('Ad soyad').fill('Sentetik E2E Hasta');
  await page.getByLabel('Telefon', { exact: true }).fill('05320000009');
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await page.getByRole('button', { name: 'S Sentetik E2E Hasta' }).click();
  await page.getByLabel('Paket adı').fill('İdari Test Paketi');
  await page.getByLabel('Seans hakkı').fill('2');
  await page.getByRole('button', { name: 'Paket aç', exact: true }).click();
  await expect(
    page.getByText('İdari Test Paketi', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Kapat', exact: true }).click();
  await page.getByRole('link', { name: 'Randevular', exact: true }).click();
  await page.getByLabel('Takvim tarihi').fill('2026-11-16');
  await page.getByRole('button', { name: 'Randevu ekle' }).click();
  await page
    .getByLabel('Hasta', { exact: true })
    .selectOption({ label: 'Sentetik E2E Hasta · +905320000009' });
  await page.getByLabel('Tarih', { exact: true }).fill('2026-11-16');
  await page.getByRole('button', { name: 'Randevuyu kaydet' }).click();
  await expect(page.locator('.appointment-row')).toHaveCount(1);
  await page.getByRole('button', { name: 'Taşı', exact: true }).click();
  await page.getByLabel('Başlangıç', { exact: true }).fill('10:00');
  await page.getByLabel('Bitiş', { exact: true }).fill('11:00');
  await page.getByRole('button', { name: 'Randevuyu kaydet' }).click();
  await expect(page.locator('.time')).toContainText('10:00');
  await page.getByRole('button', { name: 'Tamamla', exact: true }).click();
  await page
    .getByLabel('Paket', { exact: true })
    .selectOption({ label: 'İdari Test Paketi · 2 kaldı' });
  await page.getByRole('button', { name: 'Tamamla ve bir seans düş' }).click();
  await expect(page.locator('.badge.completed')).toHaveText('Tamamlandı');
  await page.reload();
  await expect(page.locator('.badge.completed')).toHaveText('Tamamlandı');
  await page.getByRole('button', { name: 'Hafta', exact: true }).click();
  await expect(page.locator('.fc-timegrid')).toBeVisible();
  await page.screenshot({ path: 'test-results/calendar.png', fullPage: true });
  await page.getByRole('link', { name: 'Hastalar', exact: true }).click();
  await page.getByRole('button', { name: 'S Sentetik E2E Hasta' }).click();
  await expect(page.locator('.package')).toContainText('1 / 2 seans kaldı');
  await page.getByRole('button', { name: 'Kapat', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole('heading', { name: 'Hasta rehberi' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Çıkış yap' }).click();
  await expect(
    page.getByRole('heading', { name: 'Kliniğinize giriş yapın' }),
  ).toBeVisible();
});
