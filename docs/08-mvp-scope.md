# MVP iş listesi

Karmaşıklık K küçük / O orta / B büyük. P0 bütünlük-güvenlik, P1 çekirdek, P2 destekleyici.

| ID  | Kullanıcı ihtiyacı / görev | Bağımlılık | Kabul / test                            | Karmaşıklık | Öncelik |
| --- | -------------------------- | ---------- | --------------------------------------- | ----------- | ------- |
| M01 | Tekrarlanabilir kurulum/CI | Onay       | ci/build/typecheck/lint                 | O           | P0      |
| M02 | Giriş/MFA/çıkış            | M01        | TOTP, rotasyon, süresi dolan oturum     | B           | P0      |
| M03 | Rol ve nesne yetkisi       | M02        | Resepsiyon ret, kendi personeli         | O           | P0      |
| M04 | Veri/migration             | M01        | FK/check/exclusion temiz DB             | O           | P0      |
| M05 | Hasta ekle/ara/düzelt      | M03,M04    | Kalıcılık, aynı ad/telefon ret          | O           | P1      |
| M06 | Hasta arşiv                | M05        | Aktif randevuda ret, geçmiş korunur     | K           | P1      |
| M07 | Saat/kaynak/izin           | M03,M04    | Saat dışı ve izin çakışması             | O           | P1      |
| M08 | Gün/hafta takvim           | M05,M07    | İstanbul günü ve filtreler              | O           | P1      |
| M09 | Randevu oluştur/taşı       | M08        | İlişki, stale version                   | O           | P1      |
| M10 | Eş zamanlı çakışma         | M09        | Aynı anda yalnız bir kabul              | B           | P0      |
| M11 | İptal/gelmeme/başlat       | M09        | Durum geçişi, bakiye sabit              | O           | P1      |
| M12 | Paket aç/göster            | M05        | Pozitif hak, çoklu paket                | O           | P1      |
| M13 | Seans tamamla              | M10,M12    | Atomiklik, tekrar, son hak yarışı       | B           | P0      |
| M14 | Gerekçeli ters kayıt       | M13        | Tek +1, audit, ikinci ret               | O           | P1      |
| M15 | Günlük dashboard           | M09,M13    | Sunucu verisi, gerçek gün               | K           | P2      |
| M16 | Pilot/kurtarma             | Tümü       | Rol E2E, yedek dönüşü, kullanıcı kabulü | B           | P0      |

Bu teslim M01–M15 işlevlerini içerir. M16 için yerel testler yapılır; gerçek işletim kurtarma tatbikatı ve müşteri kabulü ayrı kapıdır. Klinik ve finans ekranları, otomatik hatırlatma bu kapsamın parçası değildir.
