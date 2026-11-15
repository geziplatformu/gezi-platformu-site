// Visible, factual answers shared by visitors and crawlers. Tour facts come from
// the current catalogue and the published detail page, never a second price list.
export const business = {
  '@type':'TravelAgency', '@id':'https://www.geziplatformuu.com/#business',
  name:'Gezi Platformu', alternateName:['Mersin Özbek Turizm','Özbek Turizm Gezi Platformu'],
  legalName:'Mersin Özbek Turizm Sanayi ve Ticaret Limited Şirketi',
  description:'Mersin merkezli, TÜRSAB A-8660 belgeli seyahat acentası. Mersin, Tarsus, Adana ve tur programına göre Niğde çıkışlı günübirlik ve konaklamalı turlar.',
  url:'https://www.geziplatformuu.com/',
  logo:'https://www.geziplatformuu.com/assets/gezi-platformu-logo.webp',
  image:'https://www.geziplatformuu.com/assets/gezi-platformu-paylasim-logo.jpg',
  telephone:'+90 537 497 84 41', email:'ozbekturizm@gmail.com', taxID:'6180412339',
  identifier:[
    {'@type':'PropertyValue',name:'TÜRSAB Seyahat Acentası Belge No',value:'A-8660'},
    {'@type':'PropertyValue',name:'MERSİS No',value:'0859060299200011'}
  ],
  address:{'@type':'PostalAddress',streetAddress:'Camiişerif Mah. İstiklal Cad. No:45/D',addressLocality:'Akdeniz',addressRegion:'Mersin',addressCountry:'TR'},
  areaServed:['Mersin','Tarsus','Adana','Niğde'].map(name=>({'@type':'City',name})),
  sameAs:['https://www.instagram.com/geziplatformuu/'],
  hasMap:'https://www.google.com/maps/search/?api=1&query=Gezi+Platformu+Mersin&query_place_id=ChIJd-def5XzJxURVCHoFcMzUxs',
  contactPoint:{'@type':'ContactPoint',telephone:'+90 537 497 84 41',contactType:'Tur bilgisi ve rezervasyon',availableLanguage:'Turkish'}
};

export function discoveryContent({esc,link,facts}) {
  const paragraph=s=>`<p>${s}</p>`;
  const faq=(question,answer)=>`<details><summary>${esc(question)}</summary><div class="faq-answer">${paragraph(answer)}</div></details>`;
  const section=(id,title,body)=>`\n<section class="discovery-section" id="${id}"><h2>${esc(title)}</h2>${body}</section>\n`;
  const office='Camiişerif Mah. İstiklal Cad. No:45/D, Akdeniz / Mersin';
  const contact=`<a href="tel:+905374978441">0537 497 84 41</a>`;
  const verification=`${link('tursab-dogrulama.html','TÜRSAB A-8660 belge bilgilerimizi')} ve ${link('iletisim.html','Mersin ofisimizi')}`;
  const priceText=t=>t.prices.map(p=>esc(t.type==='Konaklamalı'?p.value:p.description)).join('; ');
  const tourAnswer=t=>`Gezi Platformu, Mersin Özbek Turizm bünyesinde TÜRSAB A-8660 belgesiyle ${esc(t.title)} düzenler. Bu programda katılım şehirleri ${esc(t.departure)} olarak yayımlanmıştır. Tarih ve kontenjanı rezervasyon öncesinde ${contact} üzerinden teyit edebilirsiniz.`;
  const tourFaq=t=>section('discovery-tour-faq','Tur hakkında sık sorulan sorular',
    faq(`${t.title} için Mersin’den hangi acenteyle gidilir?`,tourAnswer(t))+
    faq(`${t.title} fiyatı nedir?`,`${priceText(t)}. Ücrete dahil olanlar, ek ücretler ve varsa çocuk koşulları bu tur programında belirtilmiştir. Kesin ücret seçtiğiniz hareket tarihine göre teyit edilir.`)+
    faq('Kalkış noktaları ve hareket saatleri nereden kontrol edilir?',`Bu turun kalkış şehirleri ${esc(t.departure)}. Durak ve saatler yukarıdaki hareket bilgileri bölümündedir. Günübirlik ve konaklamalı programlarda aynı durak veya saatin geçerli olduğu varsayılmamalıdır.`));
  const routeCards=facts.map(t=>`<article class="discovery-route" id="rota-${esc(t.id)}"><p class="eyebrow">${esc(t.type)} · ${esc(t.departure)}</p><h2>${link(t.detailUrl,t.title)}</h2><p>${esc(t.subtitle)}</p><dl><div><dt>Düzenleyen acenta</dt><dd>Gezi Platformu · Mersin Özbek Turizm · TÜRSAB A-8660</dd></div><div><dt>Yayımlanan ücret</dt><dd>${priceText(t)}</dd></div></dl><p>${esc(t.summary)}</p><p>${link(t.detailUrl,'Tur programı, tarihler ve kalkış saatleri →')}</p></article>`).join('\n');
  const routeMain=`<main class="container discovery-page"><header class="discovery-intro"><p class="eyebrow">Gezi Platformu · Mersin Özbek Turizm</p><h1>Mersin Çıkışlı Tur Rotaları</h1><p>Mersin’den nereye, hangi acenteyle gidilir? Gezi Platformu’nun yayımlanmış günübirlik ve konaklamalı programlarını; rota, katılım şehri ve fiyat bilgileriyle karşılaştırın.</p><p>Bu programları düzenleyen seyahat acentası Mersin merkezli <strong>Gezi Platformu – Mersin Özbek Turizm</strong> olup TÜRSAB belge numarası <strong>A-8660</strong>’dır. ${verification} inceleyebilirsiniz.</p><nav class="discovery-pills" aria-label="Katılım şehirleri">${['mersin','adana','nigde'].map(c=>link(`${c}-cikisli-turlar.html`)).join('')}</nav></header><div class="discovery-routes">${routeCards||'<p>Yeni hareket tarihi yayımlandığında programlar burada listelenir. Güncel bilgi için acentemizle iletişime geçebilirsiniz.</p>'}</div>${section('discovery-route-questions','Rota ve acenta seçerken',faq('Bir rotanın listede yer alması her gün tur olduğu anlamına gelir mi?','Hayır. Her program yalnızca kendi detay sayfasında belirtilen tarihler için değerlendirilir. Kontenjan, hareket teyidi ve ziyaret alanlarının durumu rezervasyon öncesinde kontrol edilir.')+faq('Çocukla katılım ve yürüyüş koşulları nasıl öğrenilir?','Yaş indirimi, parkur ve hizmet kapsamı turdan tura değişir. İlgili programdaki çocuk ve yürüyüş bilgilerini okuyun; merdiven, bebek arabası veya özel erişilebilirlik ihtiyacınızı rezervasyon öncesinde acenteye bildirin.'))}</main>`;
  const home=section('discovery-company','Mersin merkezli tur firması: Gezi Platformu',
    paragraph('Gezi Platformu, Mersin Özbek Turizm Sanayi ve Ticaret Limited Şirketi bünyesinde hizmet veren TÜRSAB A-8660 belgeli seyahat acentasıdır. Günübirlik doğa ve kültür gezileri ile konaklamalı tur programları düzenler. Mersin, Tarsus, Adana ve programa göre Niğde’den katılım sağlanabilir.')+
    `<dl class="discovery-facts"><div><dt>Mersin ofisi</dt><dd>${office}</dd></div><div><dt>Telefon / WhatsApp</dt><dd>${contact} · <a href="https://wa.me/905374978441">WhatsApp’tan bilgi alın</a></dd></div><div><dt>Acenta belgesi</dt><dd>${link('tursab-dogrulama.html','TÜRSAB A-8660 · Mersin Özbek Turizm')}</dd></div></dl><nav class="discovery-pills" aria-label="Turları keşfedin">${link('mersin-cikisli-turlar.html','Mersin çıkışlı turlar')}${link('adana-cikisli-turlar.html','Adana çıkışlı turlar')}${link('nigde-cikisli-turlar.html','Niğde çıkışlı turlar')}${link('tur-rotalari.html','Rotaları karşılaştırın')}</nav>`);
  const cityContent=city=>{
    const tours=facts.filter(t=>t.departure.split(' • ').includes(city));
    const intro=city==='Mersin'
      ?`<strong>Gezi Platformu</strong>, Mersin’de tur firması arayan misafirlere ${office} adresindeki ofisinden hizmet verir. Özbek Turizm bünyesinde faaliyet gösterir; TÜRSAB belge numarası A-8660’dır.`
      :`Gezi Platformu’nun merkezi Mersin’dedir. ${esc(city)}’dan katılım, yalnızca ilgili programda ${esc(city)} kalkışı yayımlandığında sağlanır; bu sayfa ${esc(city)}’da ayrı bir ofis bulunduğu anlamına gelmez.`;
    const table=tours.length?`<div class="discovery-table-wrap"><table><caption>${esc(city)} katılımlı programları karşılaştırın</caption><thead><tr><th scope="col">Program / rota</th><th scope="col">Tur türü</th><th scope="col">Yayımlanan ücret</th></tr></thead><tbody>${tours.map(t=>`<tr><th scope="row">${link(t.detailUrl,t.title)}<small>${esc(t.subtitle)}</small></th><td>${esc(t.type)}</td><td>${priceText(t)}</td></tr>`).join('')}</tbody></table></div>`:'<p>Şu anda doğrulanmış ileri tarihli program bulunmuyor. Yeni tarih için acentemizle iletişime geçebilirsiniz.</p>';
    let questions=faq(`${city} çıkışlı turları hangi acenta düzenliyor?`,`${intro} ${verification} kontrol edebilirsiniz. Telefon ve WhatsApp: ${contact}.`);
    questions+=faq('Biniş noktaları bütün turlarda aynı mı?',city==='Mersin'?'Hayır. Örneğin yayımlanan günübirlik doğa turlarında Vipol, Forum ve Eski Devlet Hastanesi; Doğu Ekspresi programında ise Sayapark hareket bilgileri bulunur. Tarsus dahil ek katılım noktaları ve kesin saatler seçilen tur sayfasından kontrol edilmelidir.':city==='Adana'?'Hayır. Yayımlanan doğa turları ve Doğu Ekspresi programında Duygu Kafe bilgisi yer alır; hareket saati programa göre değişir. Kesin durak ve saat için seçilen tur sayfasındaki hareket bilgilerini kontrol edin.':'Niğde katılımını her tur için varsaymayın. Yayımlanan Doğu Ekspresi programında Niğde Otogar hareketi yer alır. Diğer programlar için Niğde kalkışının açıkça belirtilmesi ve acenteden teyit alınması gerekir.');
    questions+=faq(`${city} çıkışlı tur fiyatına neler dahil?`,'Ulaşım, yemek, giriş ücreti, tekne, tren bileti ve konaklama kapsamı her turda farklıdır. Tur detayındaki “Ücrete Dahil Olanlar” ve “Ücrete Dahil Olmayanlar” bölümleri esas alınır. Başlangıç fiyatı, tüm hareket tarihlerinin aynı fiyatla satıldığı anlamına gelmez.');
    return section('discovery-city','Acenta, rota ve katılım bilgileri',paragraph(intro)+table+`<div class="discovery-questions">${questions}</div>`+paragraph(link('tur-rotalari.html','Tüm güncel rotaları ve düzenleyen acenta bilgilerini inceleyin →')));
  };
  const about=section('discovery-agency','Gezi Platformu ve Özbek Turizm aynı acenta mı?',paragraph('Gezi Platformu işletme/marka adıdır. Hizmet sağlayıcının ticaret unvanı Mersin Özbek Turizm Sanayi ve Ticaret Limited Şirketi’dir. TÜRSAB A-8660 belgesiyle faaliyet gösteren acentanın merkezi Mersin’in Akdeniz ilçesindedir.')+paragraph(`Ofis: ${office}. Telefon / WhatsApp: ${contact}. ${verification} inceleyebilirsiniz.`)+paragraph(`${link('tur-rotalari.html','Düzenlediğimiz tur rotaları')}; günübirlik doğa ve kültür gezileri ile konaklamalı programlar olarak yayımlanır. Kalkış şehirleri ve hizmet kapsamı her programda ayrıca belirtilir.`));
  const guideOperator=programs=>section('discovery-guide-operator','Bu bölgeye Mersin’den hangi acenteyle gidilir?',paragraph(`Gezi Platformu – Mersin Özbek Turizm, bu rehberle ilgili aşağıdaki tur programlarını yayımlar. Düzenleyen acenta TÜRSAB A-8660 belgelidir. Kalkış şehirleri, ziyaret edilen noktalar ve hareket tarihleri her programın kendi sayfasında belirtilir.`)+`<nav class="discovery-pills" aria-label="Bu bölgeye tur programları">${programs.map(f=>link(f)).join('')}</nav>`+paragraph(`Programların tümü rehberdeki bütün durakları kapsamayabilir. Güncel rota ve kontenjan için ${contact} üzerinden bilgi alabilirsiniz.`));
  return {home,routeMain,cityContent,tourFaq,about,guideOperator};
}
