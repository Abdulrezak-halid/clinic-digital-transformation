# Prototip denetimi

Kaynak: 15.11.2026 tarihli kullanıcı ZIP'i. Statik inceleme; prototip bağımlılıkları kurulmadı. Yaklaşık 5.315 kaynak satırı. Orijinal başlangıç verilerinin sentetikliği doğrulanmadı; taşınmadı.

| Alan                           | Durum              | Kanıt                                                   |
| ------------------------------ | ------------------ | ------------------------------------------------------- |
| React/TypeScript/Vite/Tailwind | Uygulanmış         | package.json, src/main.tsx                              |
| Hasta listesi/filtre ve kayıt  | Kısmi              | PatientsList, NewPatientModal; yalnız bellek            |
| Takvim/randevu                 | Kısmi              | AppointmentsCalendar; yeni, ilişkisiz patientId üretimi |
| Seans ve paket                 | Kısmi              | App.tsx; sayaç artışı, transaction/idempotency yok      |
| Finans/CSV                     | Kısmi              | FinancialTracker; kalıcı muhasebe değil                 |
| WhatsApp                       | Manuel bağlantı    | WhatsAppModal; gönderim/teslimat API'si yok             |
| Dashboard                      | Örnek veri         | 2026-11-02 sabit tarihi                                 |
| Klinik kayıt/ağrı haritası     | Demo               | PatientDetailModal/AnatomicalBodyMap; MVP dışı          |
| Kalıcılık/API/Auth/RBAC        | Eksik              | Backend, DB veya auth kodu bulunmadı                    |
| Doğrulama                      | Kısmi              | required ve yerel kontroller; merkezi şema yok          |
| Test/CI/lockfile               | Eksik              | Arşiv envanteri                                         |
| Gemini/Express                 | Kullanımı belirsiz | Bağımlılık mevcut, uygulama çağrısı/server yok          |

Başlangıç dizileri: 6 hasta, 3 seans, 5 randevu, 8 finans kaydı, 3 protokol. Bunlar gerçeklik kanıtı değildir.

Riskler: varsayılan tedavi ifadeleri, isPaid=true, sabit tarihler, tarih tabanlı kimlikler, kayıtsız veri kaybı, sağlık bilgisini wa.me URL'sine koyma, CSV formül enjeksiyonu, strict olmayan tipler. Seçilen refaktör: idari UI tasarımını sadeleştir, domain işlemlerini sunucuya taşı, klinik ve tanıtım ekranlarını üretimden çıkar. reference/prototype yalnız denetim izidir ve build dışındadır.
