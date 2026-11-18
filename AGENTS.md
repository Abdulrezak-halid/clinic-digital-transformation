# Çalışma kuralları

- Shell komutlarını `rtk` ile çalıştırın; `/home/abod/.codex/RTK.md` yerel talimattır.
- Gerçek hasta verisini kod, test, log, issue veya ekran görüntüsüne koymayın.
- İş kuralları ve yetkilendirme backend sorumluluğudur. Frontend kontrolü güvenlik sınırı değildir.
- Klinik kayıt, finans ve bildirim kapsamını ayrı onay olmadan genişletmeyin.
- Migration geçmişini değiştirmeyin; yeni migration ekleyin. PostgreSQL exclusion kısıtlarını koruyun.
- Değişiklikten sonra typecheck, lint, ilgili testler ve build çalıştırın. Transaction değişikliklerinde entegrasyon testleri zorunludur.
- Entegrasyon testleri yalnız `_test` veritabanında; kurtarma yalnız izole `_restore` veritabanında çalışır.
- Referans prototip çalıştırılabilir ürün değildir; uygulama `apps/` altındadır.
- Otomatik deploy yapmayın. Üretim için güvenlik, hukuk, kurtarma ve kullanıcı kabul kapıları tamamlanmalıdır.
