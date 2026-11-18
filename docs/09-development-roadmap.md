# Geliştirme yol haritası

| Faz             | Teslim                         | Çıkış                           | Durum                                             |
| --------------- | ------------------------------ | ------------------------------- | ------------------------------------------------- |
| 0 Keşif/denetim | Envanter ve kapsam             | Kullanıcı kararları             | Tamamlandı; saatler/roller ayrıntısı açık         |
| 1 Temel         | Monorepo, strict, CI, ortam    | Build/typecheck/lint            | Yerel doğrulama                                   |
| 2 Kimlik/veri   | MFA, rol, migration            | Auth ve DB testleri             | Yerel doğrulama                                   |
| 3 Hasta/randevu | Rehber/takvim/çakışma          | Eş zamanlılık testleri          | Yerel doğrulama                                   |
| 4 Seans/paket   | Transaction ve ledger          | Tek tüketim ve ters kayıt       | Yerel doğrulama                                   |
| 5 Stabilizasyon | Test raporu ve işletim şablonu | Açık risk değerlendirmesi       | Yerel tamamlandı; bağımsız güvenlik kontrolü açık |
| 6 Pilot         | Eğitim, TLS, yedek dönüşü      | Hukuk/kurtarma/kullanıcı kabulü | Bekliyor                                          |
| 7 Bildirim      | Ayrı kapsam ve sağlayıcı       | Tercih/gizlilik onayı           | Kapsam dışı                                       |

Takvim sözleşme değildir. Bir geliştirici ve düzenli geri bildirim için Faz1–5 toplam8–12hafta, pilot2hafta ön tahmindir. Yerel uygulama çıktısı bu süre tahminini üretim taahhüdüne dönüştürmez.

Pilot sırası: operasyon ayarları → sentetik kabul → güvenlik ve hukuk kapıları → sağlayıcı/TLS/şifreleme → geri yükleme → sınırlı gerçek kullanım → geri bildirim. Gerçek veri göçü ayrı onay ve uzlaştırma planı gerektirir.
