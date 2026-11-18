# Veri modeli ve API

User(Role enum) → Staff isteğe bağlı bire bir; User → LoginSession çoklu. Invite tek kullanımlık hash ve son kullanma taşır. Patient → Appointment/SessionPackage/Session çoklu. Staff/Resource → Appointment çoklu. Staff → Absence çoklu. Appointment → Session en fazla bir. SessionPackage → PackageLedger/Session çoklu. AuditLog eklemeli işlem kaydıdır.

## Kurallar

- UUID kimlikler; veritabanı sıralı ve benzersiz dosya no.
- Hasta tıbbi alan içermez. Arşiv ilişkileri silmez; FK silme restrict.
- Başlangıç < bitiş; timestamptz; gösterim Europe/Istanbul.
- `[başlangıç,bitiş)` personel/hasta/kaynak exclusion; planlı, başladı ve tamamlandı durumları zaman aralığını tutar. Bitişik randevular serbesttir.
- İş saatleri ve izinler sunucuda kontrol edilir. Saat değişimi mevcut aktif randevuyu bozarsa reddedilir.
- scheduled → in_progress/completed/cancelled/no_show; in_progress → completed/cancelled/no_show. İstemciden keyfi completed yazılmaz.
- Tamamlanma tek transaction: Session + ledger -1 + status + audit. Bakiye toplam hak + ledger toplamıdır. Tekrar istek aynı anahtarda aynı sonucu döndürür; farklı içerikte 409.
- Ledger ve audit update/delete trigger ile engellenir. Session düzeltmesi yöneticiye özgüdür, ledger +1 ve cancelled durumunu üretir; yeniden randevu gerekir.
- NotificationPreference/NotificationLog kavramsal gelecek varlıklarıdır; MVP tablosu oluşturulmadı. Gelecekte kanal, dayanak/tercih sürümü, deneme ve teslimat kimliği içerir.

## REST sözleşmesi

`/auth/login`, `/verify`, `/session`, `/logout`, `/accept-invite`; `/patients` GET/POST/PATCH ve `/:id/archive`; `/staff`, `/:id/absences`, `/resources`; `/appointments?from&to`, POST/PATCH, `/:id/status`, `/:id/complete`; `/packages?patientId`, `/sessions?patientId`, `/:id/reverse`; `/users`, `/:id/disable`; `/audit`; `/health`. Hepsi `/api/v1` altında.

Yazmada Origin ve doğrulanmış oturumlarda X-CSRF-Token; domain yazmalarında Idempotency-Key. Sürüm taşıma/durum güncellemelerinde stale edit korur. 401 giriş, 403 yetki, 409 çakışma, 422 şema, 429 limit. Hatalar message/requestId; DB detayları saklanır. Hasta listesi en fazla 200, audit son100, takvim aralığı en fazla32gün. Pilot hacmi bunları aşarsa sayfalama ilk genişletmedir.
