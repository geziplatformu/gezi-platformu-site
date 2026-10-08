// Tour-specific promises belong here so regeneration preserves them.
const overnightTours = new Set([
  'buyuk-bati-karadeniz.html', 'dogu-ekspresi.html',
  'kadim-topraklar-turu.html', 'sonbahar-ozel-bati-karadeniz.html'
]);
const cancellationOverrides = {'dogu-ekspresi.html': 15};

export function tourPolicy(file) {
  const overnight = overnightTours.has(file);
  return {overnight, cancellationDays: cancellationOverrides[file] ?? (overnight ? 7 : 2)};
}

export function renderTourTerms(file) {
  const {overnight, cancellationDays: days} = tourPolicy(file);
  const type = overnight ? 'Konaklamalı' : 'Günübirlik';
  const deadline = overnight ? `${days} gün` : '2 gün (48 saat)';
  const cancellation = overnight
    ? `<p>Katılımcı, tur hareketinden en az <strong>${days} gün önce</strong> yazılı bildirimde bulunarak rezervasyonunu ücretsiz iptal edebilir; kapora dâhil ödediği tur bedeli iade edilir.${days === 15 ? ' Bu turda daha önce duyurulan 15 günlük iade/değişiklik hakkı korunur.' : ''} Tarih değişikliği, yeni tarihin kontenjanı ve varsa önceden bildirilen fiyat farkına göre yapılır.</p>
       <p>Bu süre, ücretsiz iptal için son tarihtir; daha sonra iptal talebinde bulunma hakkını ortadan kaldırmaz. Son ${days} gün içindeki taleplerde yalnızca satın alma öncesinde açıkça bildirilen, sözleşmede yer alan ve mevzuatın izin verdiği kesintiler uygulanabilir. Kesintinin dayanağı ve hesabı katılımcıya açıklanır; kaporanın veya tüm bedelin kendiliğinden yanacağı kabul edilmez.</p>
       <p>Acente turu iptal ederse katılımcı, sunulması hâlinde eşdeğer/yüksek değerli alternatifi ek bedelsiz seçebilir, daha düşük değerli alternatifin farkını alabilir veya ödediği bedelin tamamının iadesini isteyebilir. Alternatif tarih zorunlu tutulmaz. Asgari katılım sayısı nedeniyle iptal koşulu varsa sayı ve bildirim süresi rezervasyon öncesinde açıklanır; paket turlarda ilgili mevzuattaki en az 20 günlük bildirim koşulu gözetilir.</p>`
    : `<p><strong>Katılımcı ve acente, tur hareketinden en az 2 gün (48 saat) önce yazılı bildirimle turu iptal edebilir.</strong> Katılımcının bu süre içinde iptalinde veya acentenin turu iptalinde kapora dâhil ödenen tur bedeli tamamen iade edilir. Alternatif tur/tarih ancak katılımcının onayıyla seçilir.</p>
       <p>Son 48 saatte katılımcının iptal, tarih değişikliği veya tura katılmama talebi; satın alma öncesinde açıklanan koşullar ve mevzuat çerçevesinde değerlendirilir. Varsa kesintiler, önceden bildirilen sözleşme koşulları ve belgelenebilen, geri alınamayan hizmet giderleriyle sınırlıdır; tutarı ve gerekçesi yazılı açıklanır. Önceden açıklanmayan bir ceza ya da otomatik tam bedel kesintisi uygulanmaz.</p>
       <p>Acente olağan işletme veya katılım yetersizliği kaynaklı iptali en geç 48 saat önce bildirir. Bu süreden sonra ortaya çıkan mücbir sebep, resmî karar veya güvenlik riski nedeniyle iptal gerekiyorsa katılımcılar gecikmeden bilgilendirilir; iade ve diğer yasal hakları korunur. Mevzuatın daha erken bildirim gerektirdiği hizmetlerde o süre uygulanır.</p>`;
  const scope = overnight
    ? 'Turun hareket/dönüş tarihleri, toplam süresi ve otel veya diğer konaklama gece sayısı ilgili programda ayrı ayrı belirtilir. Yolculukta geçen geceler otel konaklaması olarak sayılmaz. Ulaşım, konaklama, yemek ve gezilerden yalnızca “Ücrete Dahil Olanlar” bölümünde yazılı hizmetler fiyata dahildir.'
    : 'Bu program otel konaklaması içermez. Hareket bir önceki akşam, dönüş ertesi gece veya sabah olabilir; kesin hareket/dönüş bilgileri tur programından kontrol edilmelidir. Ulaşım, rehberlik, ikram ve diğer hizmetlerden yalnızca “Ücrete Dahil Olanlar” bölümünde yazılı olanlar fiyata dahildir.';
  const accommodation = overnight
    ? `<h3>Konaklama ve çocuk katılımı</h3><p>Otel, oda tipi, yemek planı ve konaklama sayısı tur programına göre belirlenir. Zorunlu durumlarda aynı veya daha yüksek standartta alternatif konaklama önerilebilir; önemli değişiklikler ve varsa fiyat etkisi katılımcıya bildirilir, yasal seçimlik hakları korunur. Tek kişilik oda farkı, çocuk indirimi ve ek yatak koşulları rezervasyon öncesinde açıklanır. Üç kişilik odalarda ek yatak kullanılabilir. Çocuk indirimlerinin yaş aralığı ve iki yetişkin yanında geçerliliği tur ilanına göre değişir; ücretsiz/indirimli çocuk için ayrı yatak verilmesi ancak açıkça belirtilmişse dahildir.</p>`
    : `<h3>Çocuk katılımı</h3><p>Çocuk yaş sınırları, indirimleri ve hizmet kapsamı ilgili tur ilanında belirtilir; tüm turlar için ortak bir indirim oranı yoktur. Çocuklar sorumlu bir yetişkin eşliğinde katılır. Kimlik, yaş ve katılımcı bilgilerinin doğru bildirilmesi gerekir.</p>`;
  const rotation = overnight
    ? 'Koltuk rotasyonu yalnızca en az 4 gece otel konaklamalı turlarda uygulanır; uygulanacak düzen tur öncesinde bildirilir. Daha kısa konaklamalı turlarda rotasyon yapılmaz.'
    : 'Günübirlik turlarda koltuk rotasyonu uygulanmaz.';
  return `
<section class="tour-terms" id="tour-terms" aria-labelledby="tour-terms-title" data-tour-type="${overnight ? 'overnight' : 'day'}" data-cancellation-days="${days}">
  <h2 id="tour-terms-title">Genel Katılım ve İptal Şartları</h2>
  <p class="tour-terms-deadline">Ücretsiz iptal: tur hareketinden en az <strong>${deadline} önce</strong>.</p>
  <details class="tour-terms-details">
    <summary>${type} tur şartlarını okuyun</summary>
    <div class="tour-terms-content">
      <h3>Turun süresi ve hizmet kapsamı</h3><p>${scope} Müze/ören yeri girişleri, ek geziler, kişisel harcamalar ve kapsam dışında belirtilen yemekler ayrıca ücretlendirilir. Program ve rezervasyon belgesindeki açık taahhütler esas alınır.</p>
      <h3>Rezervasyon, ödeme ve özel talepler</h3><p>Rezervasyon, kontenjanın uygun olması, katılımcı bilgilerinin tamamlanması, belirtilen kapora/bedelin ödenmesi ve acentenin yazılı teyidiyle kesinleşir. Kapora, toplam bedelin bir parçasıdır. Kalan ödeme tarihi tur ilanı veya rezervasyon belgesinde belirtilir. Özel oda, oturma yeri veya ulaşım talepleri ancak acente tarafından yazılı teyit edilirse bağlayıcıdır. Satın alma öncesinde program, toplam ücret, ek ücretler ve iptal koşulları katılımcıyla paylaşılır.</p>
      <h3>İptal, tarih değişikliği ve iade</h3>${cancellation}
      <p>İptal talepleri ad-soyad, tur adı, hareket tarihi ve rezervasyon bilgileriyle <a href="https://wa.me/905374978441" target="_blank" rel="noopener">0537 497 84 41 WhatsApp</a> veya <a href="mailto:ozbekturizm@gmail.com">ozbekturizm@gmail.com</a> adresine yazılı iletilir. Süre, tur programındaki ilk hareket tarih ve saatinden geriye doğru hesaplanır; gece çıkışlı turlarda gezi günü yerine gerçek hareket zamanı esas alınır. İadeler, bildirimin acenteye ulaşmasından itibaren en geç 14 gün içinde, mümkünse ödemenin yapıldığı yöntemle gerçekleştirilir. Bankanın hesaba yansıtma süresi değişebilir.</p>
      ${overnight ? '<p>Paket tur sözleşmesi, hareketten en az 7 gün önce yazılı bildirimle turun koşullarını karşılayan başka bir kişiye devredilebilir. Devirde yalnızca makul ve gerçek maliyeti aşmayan ek giderler alınabilir; devreden ve devralanın kalan bedel ve devir giderlerine ilişkin yasal sorumlulukları saklıdır.</p>' : ''}
      ${accommodation}
      <h3>Ulaşım, koltuk düzeni ve buluşma saatleri</h3><p>Araç türü katılımcı sayısı ve güzergâha göre belirlenebilir; taahhüt edilen hizmet standardı korunur. Yazılı teyit dışında belirli koltuk numarası garantisi verilmez. Rehber ve görevliler için ayrılmış koltuklar misafir kullanımına sunulmaz. ${rotation} Katılımcılar bildirilen biniş noktasında ve saatte hazır bulunmalıdır; gecikme hâlinde acente ile hemen iletişime geçilmelidir. Biniş noktası değişiklikleri önceden bildirilir. Dönüş saatleri tahminidir; trafik ve yol koşulları nedeniyle değişebilir.</p>
      <h3>Program değişiklikleri ve güvenlik</h3><p>Rehber; hava, yol, yoğunluk, ziyaret alanlarının durumu veya güvenlik gerekçeleriyle ziyaret sırasını ve mola yerlerini düzenleyebilir. Hizmet kapsamını önemli ölçüde etkileyen değişiklikler katılımcıya açıklanır; uygun alternatif, bedel farkı veya iade hakları mevzuata göre değerlendirilir. Normal yağış, güvenli koşullarda tek başına iptal nedeni olmayabilir; ciddi riskte gezi ertelenebilir, değiştirilebilir veya iptal edilebilir. Güvenlik kararı için yalnızca resmî afet ilanı beklenmez.</p>
      <h3>Ek geziler ve kullanılmayan hizmetler</h3><p>Ek geziler isteğe bağlıdır; ücretleri, asgari katılım ve uygulama koşulları katılım öncesinde bildirilir. Yol üzerindeki ek geziye katılmayan misafirler için güvenli bekleme/buluşma yeri ve zamanı açıklanır. Katılımcının kendi tercihiyle kullanmadığı, sözleşmeye uygun şekilde hazır sunulmuş hizmetler için otomatik ayrı iade doğmaz. Acentenin sunmadığı veya eksik sunduğu hizmetlere ilişkin haklar bu kuralın dışındadır.</p>
      <h3>Sağlık, kişisel eşya ve seyahat kuralları</h3><p>Turun yürüyüş/aktivite düzeyi değerlendirilerek katılım sağlanmalıdır. Seyahati etkileyebilecek sağlık veya erişilebilirlik ihtiyacı varsa gerekli düzenlemeler için rezervasyon öncesinde acenteye bilgi verilmelidir. Düzenli ilaçlar ve gerektiğinde ilgili reçete/rapor katılımcı tarafından temin edilir. Uygun kıyafet, ayakkabı ve kişisel ekipman bulundurulmalı; araçta emniyet kemeri takılmalı, rehberin güvenlik ve buluşma talimatlarına uyulmalıdır. Özellikle mola ve serbest zamanda kişisel eşyaların takibi katılımcıya aittir; bu hüküm acentenin kusurundan doğan sorumluluğunu kaldırmaz.</p>
      <h3>Sigorta ve yurt dışı geçişleri</h3><p>Tur kapsamında bulunan sigorta türleri ve teminatları tur ilanı/rezervasyon belgesinde açıklanır. Zorunlu paket tur sigortası, koltuk ferdi kaza sigortası ve seyahat sağlık sigortası farklı teminatlardır; biri diğerinin yerine geçmez. Sağlık ve tedavi giderlerinin karşılanması ancak ilgili poliçede bu teminatın bulunmasına bağlıdır. Yurt dışı bölümü varsa kimlik/pasaport, vize, reşit olmayanların seyahat izinleri ve ilaç/eşya taşıma kuralları ilgili ülkenin güncel şartlarına göre ayrıca bildirilir; tüm destinasyonlara aynı koşullar uygulanmaz.</p>
      <h3>Mücbir sebep ve yasal haklar</h3><p>Doğal afet, resmî kısıtlama, yol kapanması veya öngörülemeyen güvenlik riski gibi durumlarda taraflar mümkün olan en kısa sürede bilgilendirilir. Katılımcının öngöremediği ve engelleyemediği bir olay nedeniyle iptali ile acentenin turu iptal etmesi ayrı değerlendirilir. Paket tur kapsamındaki mücbir sebep iptallerinde mevzuatın izin verdiği zorunlu yasal giderler ve üçüncü kişilere ödenmiş, belgelenebilir ve geri alınamayan bedeller dışında kesinti yapılamaz; acente iptalinde katılımcının bedel iadesi ve seçimlik hakları saklıdır.</p>
      <p class="tour-terms-note">Bu koşullar, 6502 sayılı Kanun ve uygulanabildiği ölçüde Paket Tur Sözleşmeleri Yönetmeliği kapsamındaki hakları sınırlandırmaz. Paket tur niteliği, yalnızca ilan başlığına değil hizmetlerin kapsamına ve süresine göre belirlenir. Tur için önceden taahhüt edilmiş daha avantajlı koşullar korunur. Bu sayfayı görüntülemek tek başına sözleşme kabulü sayılmaz; satın alma öncesi bilgilendirme ve sözleşme ayrıca sunulur. Ayrıntılar: <a href="/iptal-iade.html">İptal, İade ve Değişiklik Koşulları</a>.</p>
    </div>
  </details>
</section>
`.replace(/^[ \t]+$/gm, '');
}
