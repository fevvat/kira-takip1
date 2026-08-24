# KiraTakip Yönetim Paneli

KiraTakip; site, bina ve bağımsız bölüm kayıtları, kiracılar, sözleşmeler, tahakkuk/tahsilat, gelir-gider, demirbaşlar, belge arşivi ve geciken kira hatırlatmalarını yöneten bir React, Express, tRPC ve MySQL/TiDB uygulamasıdır.

## Gereksinimler

Uygulama için **Node.js 22+**, **pnpm 10+** ve MySQL veya TiDB uyumlu bir veritabanı gerekir. Zamanlanmış geciken kira kontrolü, uygulamanın barındırıldığı ortamın `/api/scheduled/overdue-rent-reminders` yoluna güvenli cron çağrısı yapabilmesini gerektirir.

## Kurulum

```bash
pnpm install --frozen-lockfile
```

Kök dizinde `.env` dosyası oluşturun; gizli değerleri sürüm kontrolüne eklemeyin. Uygulama, OAuth ve bildirim altyapısı için aşağıdaki değerleri kullanır.

| Değişken | Amaç |
|---|---|
| `DATABASE_URL` | MySQL/TiDB bağlantı dizgesi |
| `JWT_SECRET` | Oturum çerezlerini imzalamak için rastgele gizli değer |
| `OAUTH_SERVER_URL` | OAuth sağlayıcısının temel adresi |
| `VITE_APP_ID` | OAuth uygulama kimliği |
| `VITE_OAUTH_PORTAL_URL` | Kullanıcı giriş portalı adresi |
| `OWNER_OPEN_ID` | Otomatik hatırlatma kuralını yönetebilen proje sahibi kimliği |
| `OWNER_NAME` | Proje sahibi görünen adı |
| `BUILT_IN_FORGE_API_URL` | Yerleşik hizmet API adresi |
| `BUILT_IN_FORGE_API_KEY` | Sunucu tarafı yerleşik hizmet anahtarı |
| `VITE_FRONTEND_FORGE_API_URL` | Ön yüz yerleşik hizmet API adresi |
| `VITE_FRONTEND_FORGE_API_KEY` | Ön yüz yerleşik hizmet anahtarı |

## Veritabanı ve çalıştırma

Mevcut migration dosyalarını veritabanına uygulayın, ardından geliştirme sunucusunu başlatın.

```bash
pnpm drizzle-kit migrate
pnpm dev
```

Üretim derlemesi ve yerel çalışma için aşağıdaki komutları kullanın.

```bash
pnpm build
pnpm start
```

Kontrol ve test komutları:

```bash
pnpm check
pnpm test
```

## Otomatik geciken kira hatırlatması

Uygulama yayınlandıktan sonra proje sahibi hesabıyla **Hatırlatmalar** ekranına girip **Kuralı başlat** düğmesini kullanın. Kural her gün Türkiye saatiyle 09:00'da geciken tahsilatları kontrol eder; sonuçları ilgili kullanıcının uygulama içi bildirim listesine kaydeder.

## Vercel ile yayınlama

Proje kök dizininde bulunan `vercel.json`, React çıktısını ve Express işlevini Vercel için yapılandırır. Vercel projesini GitHub deposundan içe aktardıktan sonra **Settings → Environment Variables** ekranında bu README'deki tüm gerekli değişkenleri tanımlayın. Buna ek olarak, Vercel cron çağrısını korumak için en az 16 karakterden oluşan rastgele bir `CRON_SECRET` değeri ekleyin.

Vercel’de günlük cron zamanlaması UTC ile çalışır. `vercel.json` içindeki `0 6 * * *` ifadesi, Türkiye saatiyle 09:00 kontrolünü hedefler. Üretim dağıtımı tamamlandıktan sonra Vercel Dashboard’da **Settings → Cron Jobs** bölümünden `/api/vercel/overdue-rent-reminders` görevinin etkin olduğunu kontrol edin. Bu endpoint, Vercel’in `CRON_SECRET` ile gönderdiği `Authorization: Bearer ...` başlığını doğrular.

OAuth sağlayıcınızdaki izinli geri dönüş adreslerine Vercel üretim alan adınızı ekleyin. Önce `vercel --prod` ile bir dağıtım alın veya GitHub entegrasyonunun üretim dağıtımını tamamlamasını bekleyin; ardından gerçek alan adını OAuth sağlayıcı ayarlarına tanımlayın.

```bash
pnpm install --frozen-lockfile
pnpm vercel-build
npx vercel --prod
```

Vercel Free/Hobby planlarında günlük cron işlerinin çalışma zamanı saat içindeki herhangi bir ana kayabilir. Saat hassasiyeti kritikse Vercel planınızı ve cron sınırlarınızı kontrol edin.

## Yayın notu

Manus üzerinde oluşturulan sürüm otomatik olarak yayınlanır. Başka bir barındırma ortamı seçerseniz OAuth geri dönüş adreslerini, zamanlanmış callback yolunu ve ortam değişkenlerini o platformun güvenli değişken yöneticisinden yapılandırın.
