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
