# Teknoloji kararı

| Katman     | Seçim                                                  | Alternatif ve gerekçe                                                                                   |
| ---------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| UI         | React/Vite/TypeScript strict/Tailwind yerine yerel CSS | Prototipin sage renk ve Türkçe iş akışı korunur; az sayıda ortak bileşen için CSS bağımlılığı azaltıldı |
| Backend    | NestJS/Node                                            | Express'te özel altyapı; Next.js'te gereksiz frontend taşıma                                            |
| DB/ORM     | PostgreSQL16/Prisma6                                   | Drizzle SQL denetimini artırır; Prisma tipli erişim ve migration sunar                                  |
| Form       | React Hook Form/Zod                                    | Ortak client/server doğrulaması                                                                         |
| Veri cache | TanStack Query                                         | Kalıcı state yerine sunucu kaynağı                                                                      |
| Takvim     | FullCalendar standard + Luxon                          | Kaynak filtreleri; ücretli resource timeline gerekmez                                                   |
| Auth       | Argon2id, opak cookie oturumu, TOTP                    | Tarayıcıda JWT veya localStorage secret yok                                                             |
| Test       | Jest/Supertest, Vitest, Playwright                     | Gerçek PostgreSQL kısıtları test edilir                                                                 |
| İşletim    | Docker/Nginx, Türkiye hedefi                           | Sağlayıcı henüz seçilmedi                                                                               |

Bağımlılıklar lockfile ile sabit. Prototipin kullanılmayan AI/Express bağımlılıkları ürün paketlerine taşınmadı. Prisma özel SQL migration ile exclusion/append-only trigger kullanır. deepmerge-ts geçişli güvenlik düzeltmesi override ile uygulanır; build ve migration kontrolleriyle doğrulanmalıdır. Sürüm değişimleri ayrı PR ile yapılır.

Bildirim sağlayıcısı ve iş kuyruğu seçilmedi; Faz7 kararı. Loglar yalnız istek kimliği, tür ve meta veri içerir. Dış telemetry ve CDN font çağrısı yoktur.
