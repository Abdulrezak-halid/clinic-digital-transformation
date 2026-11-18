# Fizyoterapist Hamit Gümüş Klinik Yönetimi

Tek şubeli klinik için Türkçe idari MVP. React/Vite, NestJS, PostgreSQL ve Prisma. Hasta rehberi, randevu, personel/kaynak müsaitliği, seans paketleri, katılım ve denetim kaydı içerir.

## Yerel kurulum

Gereksinim: Node.js 24+, npm, PostgreSQL 16 (`btree_gist` kurulum yetkisi). Gerçek hasta verisi kullanmayın.

1. `npm ci`
2. `.env.example` dosyasını `.env` olarak kopyalayın. Yerel PostgreSQL bağlantısını, `APP_ORIGIN` değerini ve `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` ile oluşturulan MFA anahtarını ayarlayın. Bu anahtarı güvenli yedekleyin.
3. `npm run db:generate`
4. `npm run db:migrate` (root ortam dosyası için aşağıdaki notu okuyun)
5. `npm run build`
6. Ortama `BOOTSTRAP_EMAIL`, `BOOTSTRAP_NAME`, `BOOTSTRAP_PASSWORD` (en az 14 karakter) vererek `npm run bootstrap` çalıştırın. Komut yalnız boş kullanıcı tablosunda çalışır. Parolayı shell geçmişine yazmak yerine güvenli ortam aktarımı kullanın.
7. `npm run dev` → http://127.0.0.1:5173
8. İlk girişte authenticator uygulamasına MFA anahtarını ekleyin; kodla giriş yapın. Varsayılan hesap/parola yoktur. Bootstrap yalnız bir personel ve bir sedye oluşturur; hasta oluşturmaz.

Prisma CLI, uygulama ve operatör komutları kökteki `.env` dosyasını okur. Shell ortamındaki değerler önceliklidir; CI ve test için ayrı DATABASE_URL kullanılır. CLI için apps/api/.env oluşturmayın.

## Kullanım

- Yönetici: personel ve çalışma saatlerini kontrol eder, kaynak ekler, kullanıcı davet eder ve paket açar.
- Resepsiyon: hasta ekler/düzeltir, randevu oluşturur/taşır, iptal ve gelmeme kaydeder.
- Fizyoterapist: bağlı olduğu personelin takvimini görür ve seansını tamamlar.
- Hasta ekranında idari not dışında klinik veri girmeyin. Aynı telefon farklı hastalarca paylaşılabilir.
- Paket yalnız tamamlanan seansta bir azalır. Tamamlanmış seansın gerekçeli ters kaydı yalnız yöneticiye açıktır; randevu iptal durumuna geçer, yeniden randevu oluşturulur.
- Davet bağlantısı 24 saat geçerlidir ve tek kullanımlıktır; kullanıcı kendi parolasını belirler ve MFA kurar.

## Kontroller

```sh
npm run typecheck
npm run lint
npm test
TEST_DATABASE_URL=postgresql://.../clinic_test npm run test:integration
npm run build
npm run format:check
npm run test:e2e
```

Entegrasyon testlerinden önce migration'ları ayrı `_test` veritabanına uygulayın. Testler bu veritabanını temizler. E2E de yalnız bu izole ortamı kullanır. `TEST_DATABASE_URL` olmadan çalışmaz. PostgreSQL erişimi ve tarayıcı gereklidir; Linux'ta mevcut Chrome `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` ile seçilebilir.

## Kurtarma ve işletim

Kimlik doğrulama cihazı kaybolduğunda sunucu operatörü kimliği ayrı kanaldan doğrular. `RECOVERY_EMAIL` ve en az 10 karakter `RECOVERY_REASON` ile `npm run recover -w apps/api` çalıştırır. Tüm oturumlar kapanır, eski MFA sıfırlanır; bir saat geçerli tek kullanımlık anahtar oluşur. Kullanıcı `/#invite=ANAHTAR` bağlantısıyla yeni parola ve MFA kurar. Anahtarları log sistemine göndermeyin.

`compose.yaml` ve `ops/` üretim hazırlığı için şablondur. Türkiye'deki sağlayıcı, TLS terminasyonu, şifreli disk/yedek, uygulamaya özel asgari yetkili veritabanı hesabı ve secret yöneticisi işletmeci tarafından hazırlanır. Dışarıya yalnız HTTPS sunulur; DB portu yayımlanmaz. Migration kontrollü tek operatör adımıdır; web ve API başlatılmadan önce uygulanır. `MIGRATION_DATABASE_URL` DDL yetkili ayrı hesaptır; `docker compose --profile tools run --rm migrate` ile migration uygulayın. API imajı yalnız production bağımlılıklarını tutar.

Günlük `npm run maintenance -w apps/api` süresi dolan oturum/davetleri ve 24 saatten eski şifreli tekrar yanıtlarını temizler. `ops/runtime-grants.sql` uygulama rolü için asgari izin şablonudur.

Günlük `ops/backup.sh` age ile şifreli dump üretir; anahtarlar yedeklerden ayrı tutulur. `ops/restore.sh` yalnız izole `_restore` hedefini kabul eder. Üretim dağıtımı, gerçek veri göçü ve geri yükleme tatbikatı bu yerel teslimde gerçekleştirilmemiştir.

## Kapsam ve belgeler

Klinik dosya, teşhis, ağrı skoru, finans, otomatik bildirim, AI ve halka açık site entegrasyonu kapsam dışıdır. `docs/` karar ve riskleri, `PROJECT_PLAN.md` durum ve sonraki kapıları açıklar. Referans ZIP'in kişisel örnek verileri ve görselleri depoya alınmadı.

## Yalnız yerel inceleme için doğrudan giriş

İsteğe bağlı `LOCAL_REVIEW_MODE=true` ve `LOCAL_REVIEW_EMAIL` ile belirlenen tek hesap, development ortamında parola kontrolünden sonra MFA adımı olmadan giriş yapabilir. APP_ORIGIN http://localhost veya http://127.0.0.1 ve HOST loopback olmalıdır; production veya dış ağa bağlanma yapılandırması reddedilir. Diğer hesaplarda MFA devam eder. Parolalar kaynak kodda veya bu belgede tutulmaz; yerel .env dosyası ignored kalır.
