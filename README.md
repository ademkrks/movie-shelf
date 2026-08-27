# MovieShelf

MovieShelf; film keşfetmek, kişisel film koleksiyonları oluşturmak ve filmler hakkında puanlama/yorum işlemleri yapmak için geliştirilmiş, web ve mobil uygulamalardan oluşan full-stack bir film platformudur.

Kullanıcılar TMDB kataloğundaki filmleri keşfedebilir, arama yapabilir, favori ve izleme listelerini yönetebilir, filmlere puan verebilir, yorum yazabilir ve hesaplarını hem web hem de mobil uygulama üzerinden kullanabilir.


---

## Ekran Görüntüleri

### Web Deneyimi

<p align="center">
  <img
    src="./docs/screenshots/web/web-01.png"
    alt="MovieShelf Web Ana Sayfa"
    width="1000"
  />
</p>

### Film Detayı

<p align="center">
  <img
    src="./docs/screenshots/web/web-03.png"
    alt="MovieShelf Web Film Detay Sayfası"
    width="1000"
  />
</p>

### Mobil Deneyim

<p align="center">
  <img
    src="./docs/screenshots/mobile/mobile-02.png"
    alt="MovieShelf Mobil Ana Sayfa"
    width="320"
  />
</p>

<details>
<summary><strong>Tüm web ekran görüntülerini göster</strong></summary>

<br>

<p align="center">
  <img src="./docs/screenshots/web/web-02.png" alt="MovieShelf Web Ekranı 02" width="1000" />
</p>

<p align="center">
  <img src="./docs/screenshots/web/web-04.png" alt="MovieShelf Web Ekranı 04" width="1000" />
</p>

<p align="center">
  <img src="./docs/screenshots/web/web-05.png" alt="MovieShelf Web Ekranı 05" width="1000" />
</p>

<p align="center">
  <img src="./docs/screenshots/web/web-06.png" alt="MovieShelf Web Ekranı 06" width="1000" />
</p>

<p align="center">
  <img src="./docs/screenshots/web/web-07.png" alt="MovieShelf Web Ekranı 07" width="1000" />
</p>

<p align="center">
  <img src="./docs/screenshots/web/web-08.png" alt="MovieShelf Web Ekranı 08" width="1000" />
</p>

<p align="center">
  <img src="./docs/screenshots/web/web-09.png" alt="MovieShelf Web Ekranı 09" width="1000" />
</p>

<p align="center">
  <img src="./docs/screenshots/web/web-10.png" alt="MovieShelf Web Ekranı 10" width="1000" />
</p>

<p align="center">
  <img src="./docs/screenshots/web/web-11.png" alt="MovieShelf Web Ekranı 11" width="1000" />
</p>

<p align="center">
  <img src="./docs/screenshots/web/web-12.png" alt="MovieShelf Web Ekranı 12" width="1000" />
</p>

<p align="center">
  <img src="./docs/screenshots/web/web-13.png" alt="MovieShelf Web Ekranı 13" width="1000" />
</p>

</details>

<br>

<details>
<summary><strong>Tüm mobil ekran görüntülerini göster</strong></summary>

<br>

<p align="center">
  <img src="./docs/screenshots/mobile/mobile-01.png" alt="MovieShelf Mobil Ekranı 01" width="260" />
  <img src="./docs/screenshots/mobile/mobile-03.png" alt="MovieShelf Mobil Ekranı 03" width="260" />
  <img src="./docs/screenshots/mobile/mobile-04.png" alt="MovieShelf Mobil Ekranı 04" width="260" />
</p>

<p align="center">
  <img src="./docs/screenshots/mobile/mobile-05.png" alt="MovieShelf Mobil Ekranı 05" width="260" />
  <img src="./docs/screenshots/mobile/mobile-06.png" alt="MovieShelf Mobil Ekranı 06" width="260" />
</p>

</details>

---

## Genel Bakış

MovieShelf üç ana uygulama katmanından oluşur:

- **Backend REST API** — Node.js, Express, PostgreSQL ve Prisma
- **Web uygulaması** — React ve Vite
- **Mobil uygulama** — React Native ve Expo

Web ve mobil uygulamaları aynı backend API ile iletişim kurar.

Kullanıcı hesabı, favoriler, izleme listesi, puanlar ve yorumlar iki istemci arasında aynı backend üzerinden yönetilir.

Film metadata bilgileri **TMDB API** üzerinden backend tarafından alınır.

---

## Özellikler

### Film Keşfi

- Gündemdeki filmler
- Popüler filmler
- En iyi puanlanan filmler
- Yakında çıkacak filmler
- Film arama
- Sayfalı arama sonuçları
- Film detay sayfaları
- Film açıklamaları ve metadata bilgileri
- Oyuncu kadrosu
- Fragman erişimi

### Kişisel Film Koleksiyonu

Giriş yapan kullanıcılar:

- Favorilerini
- İzleme listesini
- Film puanlarını
- Film yorumlarını

yönetebilir.

Favori ve izleme listesi verileri MovieShelf backend'i üzerinden PostgreSQL veritabanında saklanır.

### Puanlama

Kullanıcılar:

- Film puanlarını görüntüleyebilir
- Filmlere 1 ile 10 arasında puan verebilir
- Daha önce verdiği puanı güncelleyebilir
- Kendi puanını kaldırabilir

### Yorumlar

MovieShelf:

- Topluluk yorumlarını görüntüleme
- Yorum oluşturma
- Kendi yorumunu düzenleme
- Kendi yorumunu silme
- Sayfalı yorum listeleri
- Yorum sahipliği kontrolü

özelliklerini destekler.

### Kimlik Doğrulama ve Hesap Yönetimi

- Kullanıcı kaydı
- Giriş yapma
- Çıkış yapma
- JWT tabanlı kimlik doğrulama
- Korumalı rotalar
- Şifre sıfırlama akışı
- E-posta ile şifre sıfırlama bağlantısı
- Profil bilgilerini güncelleme
- Şifre değiştirme
- Oturum geçersizleştirme
- Süresi dolmuş oturum yönetimi

Mobil uygulamada kimlik doğrulama bilgileri **Expo SecureStore** kullanılarak saklanır.

---

## Mimari

```mermaid
flowchart LR
    WEB[React Web Uygulaması]
    MOBILE[Expo / React Native Uygulaması]

    API[Node.js / Express API]

    DB[(PostgreSQL)]
    TMDB[TMDB API]
    MAIL[SMTP Servisi]

    WEB --> API
    MOBILE --> API

    API --> DB
    API --> TMDB
    API --> MAIL
```

TMDB API anahtarı doğrudan istemci uygulamalarına verilmez.

Film verileri backend üzerinden alınırken; kullanıcı hesapları, favoriler, izleme listeleri, puanlar, yorumlar ve şifre sıfırlama kayıtları PostgreSQL üzerinde yönetilir.

---

## Backend Mimarisi

Backend katmanlı bir yapı kullanır:

```text
İstek
  ↓
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Prisma / Harici API
```

Bu yapı sayesinde:

- HTTP yönlendirmeleri
- doğrulama işlemleri
- iş mantığı
- veritabanı erişimi
- harici servis iletişimi

birbirinden ayrılmıştır.

---

## Kullanılan Teknolojiler

### Backend

- Node.js 22
- Express 5
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt
- Axios
- Nodemailer
- Helmet
- CORS
- Express Rate Limit
- Swagger

### Web

- React 19
- React DOM
- React Router
- Vite
- ESLint

### Mobil

- React Native
- Expo SDK 57
- Expo Router
- TypeScript
- Expo SecureStore
- Expo Splash Screen
- React Native Reanimated
- React Native Gesture Handler
- React Native Screens

### Geliştirme ve Kalite Araçları

- Git
- GitHub Actions
- Prisma Migrations
- ESLint
- TypeScript
- Expo Doctor
- npm güvenlik denetimi

---

## Proje Yapısı

```text
MovieShelf/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   └── server.js
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── frontend/
│   ├── src/
│   ├── .env.example
│   └── package.json
│
├── mobile/
│   ├── assets/
│   ├── src/
│   ├── .env.example
│   └── package.json
│
├── docs/
│   └── screenshots/
│       ├── web/
│       └── mobile/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── prisma.config.ts
└── README.md
```

---

## API Alanları

| Alan | Sorumluluk |
| --- | --- |
| Authentication | Kayıt, giriş ve şifre kurtarma |
| Users | Profil ve hesap güvenliği |
| Movies / TMDB | Film keşfi ve metadata |
| Favorites | Kullanıcının favori filmleri |
| Watchlist | Daha sonra izlenecek filmler |
| Ratings | Kullanıcı ve topluluk puanları |
| Reviews | Film yorumlarının yönetimi |
| Health | API sağlık durumu |

Backend içerisinde API dokümantasyonu için Swagger araçları bulunmaktadır.

---

## Güvenlik

MovieShelf backend ve istemci tarafında birden fazla güvenlik önlemi içerir.

### Kimlik Doğrulama Güvenliği

- JWT tabanlı kimlik doğrulama
- Korumalı API endpoint'leri
- Token version tabanlı oturum geçersizleştirme
- Süresi dolmuş oturum kontrolü
- Geçersiz kimlik doğrulama durumunda otomatik çıkış

### Şifre Güvenliği

- bcrypt ile şifre hashleme
- Şifre doğrulama kuralları
- Güvenli şifre sıfırlama token'ları
- Şifre sıfırlama süre sınırı
- Şifre değişiminden sonra eski oturumların geçersizleştirilmesi

### API Güvenliği

- Helmet güvenlik başlıkları
- CORS yapılandırması
- İstek hız sınırlaması
- Girdi doğrulama
- Merkezi hata yönetimi
- Kullanıcıya ait kaynaklarda sahiplik kontrolü
- Ortam değişkenleri üzerinden gizli bilgi yönetimi

### Mobil Güvenlik

Mobil uygulamadaki kimlik doğrulama bilgileri normal uygulama depolaması yerine **Expo SecureStore** içerisinde saklanır.

---

## Ortam Değişkenleri

MovieShelf backend, web ve mobil uygulamalar için ayrı ortam dosyaları kullanır.

Gerçek `.env` dosyaları Git tarafından takip edilmez.

Projede bulunan `.env.example` dosyaları şablon olarak kullanılabilir.

### Backend

Proje kök dizininde:

```text
.env
```

dosyasını oluşturun.

Şablon:

```text
.env.example
```

Örnek yapılandırma:

```env
NODE_ENV=development
PORT=5000

API_BASE_URL=http://localhost:5000

DATABASE_URL="postgresql://postgres:YOUR_DATABASE_PASSWORD@localhost:5432/movieshelf_db"

JWT_SECRET=RANDOM_JWT_SECRET
JWT_EXPIRES_IN=7d

TMDB_API_KEY=TMDB_API_KEY
TMDB_BASE_URL=TMDB_BASE_URL

CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

EMAIL_HOST=SMTP_HOST
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=SMTP_USERNAME
EMAIL_PASS=SMTP_PASSWORD
EMAIL_FROM=MovieShelf <noreply@example.com>
```

Gerçek veritabanı şifreleri, JWT secret değerleri, TMDB API anahtarları veya SMTP bilgileri Git'e gönderilmemelidir.

### Web

Oluşturulacak dosya:

```text
frontend/.env
```

Şablon:

```text
frontend/.env.example
```

Örnek:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Mobil

Oluşturulacak dosya:

```text
mobile/.env
```

Şablon:

```text
mobile/.env.example
```

Android Emulator örneği:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000
```

Fiziksel cihaz kullanıldığında bilgisayarın cihaz tarafından erişilebilen yerel ağ adresi kullanılmalıdır.

---

## Kurulum

### 1. Repoyu klonlayın

```bash
git clone https://github.com/ademkrks/movie-shelf.git
cd movie-shelf
```

### 2. Backend bağımlılıklarını yükleyin

```bash
npm install
```

### 3. Web bağımlılıklarını yükleyin

```bash
cd frontend
npm install
cd ..
```

### 4. Mobil bağımlılıklarını yükleyin

```bash
cd mobile
npm install
cd ..
```

---

## Veritabanı Kurulumu

MovieShelf, PostgreSQL ve Prisma kullanır.

Öncelikle PostgreSQL üzerinde bir veritabanı oluşturun ve backend `.env` dosyasındaki `DATABASE_URL` değerini yapılandırın.

Prisma Client oluşturmak için:

```bash
npm run db:generate
```

Mevcut migration'ları uygulamak için:

```bash
npm run db:deploy
```

Migration durumunu kontrol etmek için:

```bash
npm run db:status
```

---

## Backend'i Çalıştırma

Projenin kök dizininde:

```bash
npm start
```

Node.js watch modu ile geliştirme:

```bash
npm run dev
```

Varsayılan geliştirme portu:

```text
5000
```

---

## Web Uygulamasını Çalıştırma

```bash
cd frontend
npm run dev
```

Production build:

```bash
npm run build
```

Lint kontrolü:

```bash
npm run lint
```

---

## Mobil Uygulamayı Çalıştırma

```bash
cd mobile
npm start
```

Android:

```bash
npm run android
```

iOS:

```bash
npm run ios
```

Expo Web:

```bash
npm run web
```

---

## Kalite Kontrolleri

### Backend

Prisma Client oluşturma:

```bash
npm run db:generate
```

Prisma şemasını doğrulama:

```bash
npx prisma validate
```

Bağımlılık güvenlik denetimi:

```bash
npm audit
```

### Web

```bash
cd frontend
npm run lint
npm run build
```

### Mobil

Mobil proje için birleşik kalite kontrol komutu:

```bash
cd mobile
npm run check
```

Bu komut sırasıyla:

```text
TypeScript typecheck
        ↓
Expo ESLint
        ↓
Expo Doctor
```

kontrollerini çalıştırır.

Kontroller ayrı ayrı da çalıştırılabilir:

```bash
npm run typecheck
npm run lint
npm run doctor
```

---

## Sürekli Entegrasyon

GitHub Actions, MovieShelf'in üç ana uygulama katmanı için otomatik kalite kontrolleri gerçekleştirir.

### Backend

- Bağımlılıkların kurulması
- Prisma Client oluşturulması
- Prisma şemasının doğrulanması
- Bağımlılık güvenlik denetimi
- Kritik güvenlik açıklarının kontrol edilmesi

### Web

- Bağımlılıkların kurulması
- ESLint kontrolü
- Production build

### Mobil

- Bağımlılıkların kurulması
- TypeScript kontrolü
- ESLint
- Expo Doctor

---

## Uygulama Akışı

```text
Kayıt / Giriş
      ↓
Film Keşfi
      ↓
Arama / Listeleme
      ↓
Film Detayı
      ↓
┌────────────┬──────────────┬──────────┬──────────┐
│            │              │          │          │
Favoriler  İzleme Listesi  Puanlama  Yorumlar
│            │              │          │
└────────────┴──────────────┴──────────┴──────────┘
                     ↓
             Kişisel Koleksiyon
                     ↓
              Profil & Güvenlik
```

---

## Tasarım

MovieShelf, web ve mobil uygulamalarda sinema odaklı koyu bir tasarım sistemi kullanır.

Tasarım yaklaşımında:

- Koyu arka planlar
- Mor vurgu renkleri
- Poster odaklı film kartları
- Belirgin görsel hiyerarşi
- Responsive web tasarımı
- Mobil odaklı navigasyon
- Web ve mobil arasında tutarlı terminoloji
- MovieShelf'e özel uygulama kimliği

kullanılmıştır.

---

## Proje Durumu

MovieShelf'in mevcut proje kapsamındaki temel özellikleri tamamlanmıştır.

Backend, web ve mobil uygulama üzerinde manuel olarak doğrulanan temel akışlar:

- Kullanıcı kaydı
- Giriş yapma
- Şifre kurtarma
- Film keşfi
- Film arama
- Film detayları
- Favoriler
- İzleme listesi
- Puanlama
- Yorumlar
- Profil yönetimi
- Şifre değiştirme
- Korumalı navigasyon
- Çıkış yapma
- Süresi dolmuş oturum yönetimi

MovieShelf, full-stack web ve mobil uygulama geliştirme süreçlerini bir arada gösteren bir yazılım projesidir.

---

## Geliştirici

**Ali Adem Karakaş**

Bilgisayar Mühendisliği öğrencisi.


---

## Lisans

Projenin kök `package.json` dosyasında lisans bilgisi **ISC** olarak tanımlanmıştır.