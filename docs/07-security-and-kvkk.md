# Güvenlik ve KVKK

Üretim için hukuki görüş yerine geçmez. KVKK güncel rehberi: https://www.kvkk.gov.tr/Icerik/8184/Ozel-Nitelikli-Kisisel-Verilerin-Islenmesine-Iliskin-Rehber . İşleme şartı yalnız açık rıza varsayımıyla belirlenmez. Randevu bağlamı da hassasiyet taşıyabilir.

Uygulanan: Argon2id, zorunlu TOTP, 5dakika geçici MFA ve 8saat mutlak oturum, oturum rotasyonu, tekrar TOTP adımı engeli, hash'lenmiş oturum token'ı, AES256GCM şifreli MFA ve idempotency yanıtı, SameSite/HttpOnly/prod Secure cookie, Origin/CSRF, hız sınırı, her istekte güncel rol/aktiflik, JSON şema, Helmet, append-only değişiklik denetimi. Davet24saat, operatör kurtarma1saat. Kapatılan kullanıcının oturum/davetleri iptal edilir. Davet parolası en az14karakterdir.

Gerçek veri geliştirme/testte yoktur. İdari notlara tıbbi bilgi girmeyin; teknik şema bunu semantik olarak garanti edemez. Loglar body/query içermez. Kaydedilen erişim/işlem izi kişisel veriyle doldurulmamalıdır. Değişiklikler, auth olayları ve korumalı GET erişimleri kaydedilir; query/body audit içine yazılmaz.

Üretim kapıları: işleme envanteri ve hukuki dayanak; aydınlatma; rol onayı; VERBİS değerlendirmesi; saklama ve düzeltme/silme prosedürü; sağlayıcı/alt işleyen ve yurt dışı erişim/aktarım kontrolü; TLS, şifreli disk ve yedek; anahtar yönetimi; güvenlik incelemesi; işletmeci ataması. Türkiye sunucusu tek başına aktarım değerlendirmesini çözmez.

Öneri RPO24saat/RTO8saat; günlük age şifreli yedek; teknik yedek döngüsü30gün; veri/audit hukuki saklama süresi henüz onaysız. Yedekten dönüşte önceden silinen kayıtlar için silme talepleri tekrar uygulanmalıdır. Yedek ve anahtar ayrı erişimlerle tutulur. Çalışan DB hesabı DDL yetkisi almamalı; migration hesabı ayrılmalıdır.

Silme: kimlik/başvuru doğrulama → yasal saklama/deletion değerlendirmesi → yetkili kayıt ve işlem → yedek politikası → gerekçeli sonuç. Arşivleme silme değildir. MFA kurtarma sunucu operatörüyle kimlik doğrulama sonrası yapılır; kamuya açık reset ucu yoktur.

Bildirim yok; ileride tanı/seans içeriği URL veya SMS'e yazılmaz, tercih ve hukuki dayanak ayrı değerlendirilir. Harici sağlayıcı onayı olmadan gerçek veri gönderilmez.
