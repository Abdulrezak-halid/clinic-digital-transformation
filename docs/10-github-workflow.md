# GitHub ve geliştirme akışı

Tek depo: apps/web, apps/api, packages/contracts, docs, ops. README ve AGENTS proje kurallarıdır. .env dosyaları ignored; .env.example yalnız örnektir. Hasta bilgisi, token veya parola issue/PR'a konmaz.

main korumalı; feat/,fix/,docs/ kısa dallar; Conventional Commits; bir bağımsız inceleme ve squash. PR şablonu test, veri/yetki ve migration etkisini ister. Issue şablonları kabul/test ve sentetik tekrar adımlarını ister.

CI: npm ci, Prisma generate, contracts build, format/lint/typecheck, unit, izole PostgreSQL migration ve entegrasyon, production build, Chromium E2E, dependency/secret taraması. main koruması ve zorunlu kontroller GitHub yöneticisi tarafından etkinleştirilir; yerel dosyalar bunu hesapta otomatik yapmaz.

Release: test → etiket/sürüm notu → hazırlık ortamı → migration öncesi yedek → tek operatör migration → deploy → sağlık/sentetik smoke → gözlem. Üretim deploy otomatik değil. Migration geri alma veriyi kaybedebilir; öncelik ileri düzeltme veya doğrulanmış yedekten izole dönüş planı.

Loglar requestId ve hata türü; DB hata detayı/istek body yok. API /health DB bağlantısını kontrol eder. Hazırlık ve üretim ayrı DB/secret kullanır.
