# Yerel doğrulama ve teslim sınırları

15.11.2026. Yalnız sentetik kayıtlar ve izole PostgreSQL16 `_test` veritabanı kullanıldı. Prototipin kaynağı doğrulanmamış örnek verileri kullanılmadı.

## Kontroller

- TypeScript strict typecheck, ESLint, Prettier ve production build.
- Backend5 + frontend2 birim testi: telefon normalizasyonu, klinik alan reddi, saat dönüşümü, ters zaman aralığı, rol ve şifreleme.
- PostgreSQL14 entegrasyon senaryosu: giriş/CSRF/Origin; kalıcılık/mükerrer; yarışan ve bitişik randevular; doğrudan DB exclusion; saat/izin; atomik ve idempotent seans; son paket hakkı yarışı; iptal/arşiv; stale taşıma; rol/devre dışı hesap; MFA/rotasyon; terapist nesne yetkisi; anahtar yeniden kullanım reddi; append-only geçmiş.
- Chromium1 uçtan uca iş akışı: MFA kur → hasta ekle → paket aç → randevu ver/taşı → seans tamamla → yenilemede kalıcılık → haftalık takvim → bakiye → mobil taşma kontrolü → çıkış.
- Masaüstü dashboard, haftalık takvim ve mobil hasta ekranı görüntüleri gözden geçirildi. Görüntüler ignored test-results altında yalnız yerel QA içindir.
- İki migration hem boş uygulama hem boş test DB'sine uygulandı; tekrar migrate kontrolünde bekleyen migration yok.
- npm audit production bağımlılıklarında0 açık; tüm bağımlılıklarda0 high/critical, 22 moderate ve4 low geliştirme aracı bildirimi. Bunlar bağımlılık bakımında izlenmeli; production imajı dev bağımlılıklarını prune eder.

## Doğrulanmayan işletim kapıları

Docker dağıtımı, sağlayıcı/TLS, disk şifrelemesi, dış secret yöneticisi, şifreli yedekten işletim geri yükleme, zamanlanmış görevler, GitHub hesap korumaları, bağımsız penetrasyon testi ve hukuk/müşteri kabulü bu yerel doğrulamanın parçası değildir. Docker/CI dosyaları sağlandı; harici hizmetlerde yayın yapılmadı.

Frontend takvim içeren bundle yaklaşık780KB (gzip236KB); kod bölme sonraki performans iyileştirmesidir. Hasta listesi200 ve audit100 kayıt sınırları dokümante edilmiştir. Üretim hacmi bunu aşarsa sayfalama ve yük testi gerekir.
