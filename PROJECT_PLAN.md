# Klinik yönetim sistemi uygulama planı ve durum

15.11.2026 — Kullanıcının uygulama onayıyla yerel idari MVP hazırlanmıştır. Mimari: React/Vite + NestJS modüler monolit + PostgreSQL/Prisma. Üretim yayını yapılmamıştır.

## Teslim

Hasta rehberi ve arşiv; gün/hafta takvim; personel/oda/izin; çakışma engeli; randevu taşıma/durum; seans paketi ve transaction/ledger; MFA/oturum/roller; davet ve operatör kurtarma; günlük özet; audit; Docker/CI ve testler. Ayrıntılar docs/01–11 içinde.

## Uygulama kararları

- Klinik veri/finans/mesajlaşma/AI üretilmez; prototipin kişisel örnek verileri taşınmaz.
- UI yeniden düzenlenmiştir; React/TypeScript ve mevcut sage görsel yön korunmuştur. Ortak UI küçük olduğu için Tailwind yerine yerel CSS kullanılmıştır.
- Tek klinik için kısa transaction lock, DB exclusion kısıtları ve encrypted idempotency yanıtları.
- Notification modelleri kavramsaldır; kullanılmayan tablolar açılmaz.

## Açık kapılar

Gerçek çalışma saatleri, kaynak ve rol onayı; sağlayıcı ve TLS; at-rest şifreleme; asgari DB rolü; hukuki inceleme; yedek/anahtar saklama ve geri yükleme tatbikatı; eğitim/kullanıcı kabulü. Bu kapılar tamamlanmadan gerçek verili üretim/pilot başlatılmaz.

Test sonuçları docs/verification.md dosyasında tutulur. Kaynak kod ve yerel doğrulama üretim güvenlik sertifikası değildir.
