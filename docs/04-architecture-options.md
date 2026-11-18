# Mimari seçenekleri

Karar: uygulama planı kullanıcı tarafından uygulamaya açıldı; üretim/pilot kapıları ayrıdır.

| Seçenek                             | Koruma | İşletim           | Karar                                  |
| ----------------------------------- | ------ | ----------------- | -------------------------------------- |
| React/Vite + NestJS modüler monolit | Yüksek | İki uygulama + DB | Seçildi; açık iş kuralı/API sınırı     |
| Next.js tam kapsamlı                | Orta   | Tek uygulama + DB | Uygun; mevcut arayüz taşınması gerekir |
| React + yalın Express               | Yüksek | Benzer            | Özel auth/validation disiplini yükü    |

Modüler monolit backend; kimlik, klinik domain, kalıcılık ve sözleşmeler ayrıdır. Dağıtım frontend ve backend için aynı origin, `/api/v1` proxy, PostgreSQL özel ağ. Mikroservis, Redis ve mesajlaşma altyapısı MVP'de yoktur.

Küçük klinik hacminde tüm domain yazmaları kısa PostgreSQL advisory transaction lock ile sıralanır. Bu, paket ve müsaitlik yarışlarını basitçe engeller; büyümede ölçülüp daraltılmalıdır. DB exclusion kısıtları ikinci korumadır. DB tek kaynaktır; frontend Query cache yalnız görünüm içindir.
