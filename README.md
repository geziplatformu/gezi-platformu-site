# Gezi Platformu Web Sitesi

Bu site statik HTML/CSS/JS yapısında hazırlanmıştır ve Vercel üzerinden yayınlanmaktadır.

## Aktif yapı

- `index.html`: Ana sayfanın HTML yapısı. Görsel yerleşim ve ana bölümler burada bulunur.
- `styles.css`: Ana site görünümü ve ortak stiller.
- `app.js`: Ana sayfadaki tur kartları, Google yorumları ve canlı Instagram verilerinin ekrana işlenmesi.
- `tours.js` + `tours-extra.js`: Tur verileri.
- `tour-images.js`: Tur görsel eşleştirmeleri.
- `instagram-resilience.js`: Yalnızca Instagram bölümünün telefon/uygulama görünümünü destekleyen arayüz katmanı. Gerçek Instagram verisini üretmez; veriler `app.js` ve `/api/instagram` üzerinden gelir.
- `site-controls.js`: Dil (TR/EN) ve açık/koyu tema kontrolleri. Site genelinde tema ile ilgili yeni düzenlemeler mümkün olduğunca sadece bu dosyada yapılmalıdır.
- `api/instagram.js`: Instagram profil/gönderi verisini sağlayan sunucu tarafı endpoint.
- `api/instagram-image.js`: Instagram görselleri için yardımcı endpoint.
- `api/google-reviews.js`: Google yorum verisi endpoint'i.

## Düzenleme kuralı

Aynı görsel alan için birden fazla geçici JS/CSS dosyası oluşturulmamalıdır. Yeni bir özellik eklerken önce yukarıdaki aktif dosyalardan hangisinin sorumlu olduğu belirlenmeli ve mümkünse yalnızca o dosya değiştirilmelidir. Tek seferlik düzeltme scriptleri ve workflow'lar iş bittikten sonra depoda bırakılmamalıdır.

## Tur bilgilerini değiştirme

Temel tur bilgileri `tours.js`, ek tur kayıtları `tours-extra.js` dosyasındadır. Fiyat, tarih, rota, görsel ve açıklama değişikliklerinde mevcut veri yapısı korunmalıdır.

## Yerel önizleme

Klasörü bir statik sunucuda açın. Örneğin:

```bash
python -m http.server 8000
```

Ardından tarayıcıda `http://localhost:8000` adresini açın.

## Arama motoru ve yapay zekâ erişimi

`npm run build`, `scripts/generate-seo.mjs` ile tur kartlarını ilk HTML yanıtına yazar; tüm açık sayfalar için metadata, canonical, yapılandırılmış veri, iç bağlantılar, sitemap.xml ve mevcut llms.txt dizinini günceller. `npm run check` bağlantı ve SEO tutarlılığını doğrular. Vercel aynı komutu her yayında çalıştırır. Yeni turda ayrıntı HTML’ini ve mevcut tur verisini birlikte güncelleyin; fiyat yapısal verisi ayrıntı sayfasındaki görünen ücretten alınır.

Güncel tur adları tarayıcıdaki eski SEO koduyla değiştirilmez. Sepet, rezervasyon, hata sayfaları ve yönetim/API uçları indekslenmez. Geçmiş tarihli programlarda güncel teklif verisi üretilmez. Gezi yazılarının yayın/güncelleme tarihleri korunur. Genel robots.txt kuralı arama botlarının herkese açık içeriği taramasına izin verir. llms.txt yardımcı bir dizindir; Google veya yapay zekâ aramalarında çıkmayı garanti etmez.

Google’daki gerçek indeksleme durumu ve sorgu performansı için Search Console’da URL Denetimi kullanılmalı, https://www.geziplatformuu.com/sitemap.xml gönderilmelidir. Hesaba erişim olmadan her URL’nin Google’da indekslendiği doğrulanamaz.
