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

## Yerel arama ve yapay zekâ görünürlüğü

15 Kasım 2026 düzenlemesi:

- `scripts/discovery-content.mjs`, firma kimliğinin tek kaynağıdır. Marka/ticaret unvanı, TÜRSAB, MERSİS, telefon, adres ve mevcut Google Haritalar bağlantısı tüm açık sayfalarda aynı işletme kimliğiyle işaretlenir. Yorum puanı, çalışma saati, koordinat veya kontenjan uydurulmaz.
- `tur-rotalari.html`, yalnızca mevcut katalogda bulunan ve sezonu geçmemiş programlardan üretilir. Rota özeti katalogdan; ücretler tur detay sayfasında görünen fiyat bloklarından alınır. Yeni tur eklerken katalog ile detay sayfasını birlikte güncelleyin. Eski veya yılı doğrulanmamış bir program güncel listede gösterilmez ve güncel teklif şeması üretmez.
- Ana sayfa, şehir sayfaları, tur soru-cevapları ve ilgili gezi rehberleri; ziyaretçinin acentayı, Mersin ofisini, kalkış şehrini ve ilgili rotayı bulmasını sağlar. Adana/Niğde katılım noktaları ayrı ofis gibi tanıtılmaz. Bu içerik `npm run generate:seo` ile yeniden üretilir; oluşturulan HTML bölümlerini elle değiştirmeyin.
- `scripts/seo-state.json`, yayımlanacak sayfaların içerik özetini ve gerçek değişiklik tarihini tutar. Değişmeyen yeniden derlemede `lastmod` ilerlemez. Rehberlerin yazı içindeki editoryal yayın/güncelleme tarihi ayrıca korunur. İçerik düzenledikten sonra `npm run build` çalıştırın ve güncel HTML, sitemap, llms dizini ile bu dosyayı birlikte commit edin.
- `ga4.js`, mevcut ölçüm kimliğini korur. Kaynağı görülebilen yapay zekâ ziyaretlerini `ai_referral`, telefon/WhatsApp/e-posta tıklamalarını `contact_click` olayıyla ölçer. Sorgu, sohbet, ileti metni veya kişisel bilgi bu olaylara eklenmez. Kaynak bilgisini iletmeyen uygulamalardaki ziyaretler kesin olarak sınıflandırılamaz. Olayın kaydedilmesi GA4 paneline erişildiği veya dönüşüm olarak işaretlendiği anlamına gelmez.
- `npm run check`, görünür metin/FAQ eşleşmesini, acenta kimliğini, fiyatların varlığını, sayfalara bağlantıyla erişimi, güncelleme özetini ve ölçüm davranışını kontrol eder.

### Yayın sonrası IndexNow bildirimi

`scripts/indexnow.json` ve kökteki doğrulama dosyası site sahipliğini doğrular. `npm run indexnow -- --dry-run` gönderilecek URL'leri gösterir. `npm run indexnow` yalnızca canlı sitedeki içerik özeti yerel sürümle eşleştiğinde değişen veya kaldırılan URL'leri bildirir. Varsayılan karşılaştırma bir önceki commit'tir; birkaç commit'i tek yayında toplarken `npm run indexnow -- --since=<önceki-yayın-commit>` kullanın. İlk kurulumda bütün açık URL'ler bildirilir.

`.github/workflows/notify-search-engines.yml`, GitHub'a başarılı **Production** deployment durumu ulaştığında aynı işlemi çalıştırır. Önizleme/hatalı yayınlar bildirilmez; yayınlanan sürüm eşleşmezse işlem durur. İş akışı ayrıca bir erişim sırrı gerektirmez. Vercel Git bağlantısının deployment durumlarını GitHub'a iletmesi ve GitHub Actions'ın açık olması gerekir. IndexNow 200 alındı, 202 doğrulama bekleniyor anlamına gelir; taranma, indekslenme veya sıralama garantisi değildir. Bu protokol Google Search Console'a URL denetimi göndermez.

Gerçek sonuçlar için Search Console sorguları, Google İşletme Profili ve GA4 verileri birlikte değerlendirilmelidir. İlk sıra garantisi, yapay yorum, sahte ödül/üstünlük iddiası veya botlara gizlenmiş farklı içerik kullanılmaz.

12 Ekim 2026 SEO düzenlemesi: ana sayfanın Mersin, Adana ve Niğde bağlantıları ilk HTML yanıtında yer alır. Şehir listeleri, geçerli ana katalog ve ayrıntı sayfası bulunan ek programlardan üretilir; geçmiş programlar güncel listede veya teklif şemasında gösterilmez. `app.js` içindeki sonbahar kayıtlarının yayın yılı 2026 ile sabitlenmiştir. Gün/ay dışında yılı bulunmayan bir program için otomatik yıl veya en yakın tarih üretilmez; Doğu Ekspresi’nin Aralık 2026–Mart 2027 kış sezonunda her hareket tarihinin yılı açıkça yazılmıştır; yılbaşı geçişi Aralık 2026’dan Ocak 2027’ye yapılır. Yeni sezon açıldığında mevcut kayıtlar ve ayrıntı sayfaları doğrulanmış yıllarla birlikte güncellenmelidir.

Wix geçişinde yalnızca depoda kayıtlı eski yollar ilgili sayfaya kalıcı yönlendirilir. Aladağlar eski ürünü, aynı URL'deki yeni Ortaseki programına yönlendirilmez. Türkçe yolların URL kodlanmış karşılıkları da desteklenir. Karşılığı olmayan veya bilinmeyen `/product-page/` ve `/post/` yolları gerçek 404 döndürür. Sepet ve rezervasyon HTML'ine ek olarak HTTP `X-Robots-Tag` başlığı da indekslemeyi kapatır; rezervasyon işleyişi değişmez.
