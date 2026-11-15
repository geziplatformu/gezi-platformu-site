import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {renderTourTerms} from './tour-terms.mjs';
import {business,discoveryContent} from './discovery-content.mjs';
const root=path.resolve(import.meta.dirname,'..');
const origin='https://www.geziplatformuu.com';
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const write=(f,s)=>{if(!fs.existsSync(path.join(root,f))||read(f)!==s)fs.writeFileSync(path.join(root,f),s)};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const decode=s=>s.replace(/&(?:amp|lt|gt|quot|apos|#39|#\d+|#x[\da-f]+);/gi,x=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'"}[x]??String.fromCodePoint(x[2]==='x'?parseInt(x.slice(3),16):parseInt(x.slice(2)))));
// Small read-only HTML tree: preserves original source formatting on writes.
function parse(html){
 const doc={tag:'root',children:[],attrs:{},start:0,end:html.length};let stack=[doc];
 const tokens=/<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<!--[\s\S]*?-->|<[^>]+>|[^<]+/gi;
 for(const m of html.matchAll(tokens)){
  const token=m[0],parent=stack.at(-1);if(token.startsWith('<!--')||/^<!/i.test(token))continue;
  if(/^<\//.test(token)){const tag=token.match(/^<\/\s*([^\s>]+)/)?.[1].toLowerCase();const i=stack.findLastIndex(n=>n.tag===tag);if(i>0){for(const n of stack.slice(i))n.end=m.index+token.length;stack=stack.slice(0,i)}continue;}
  if(token[0]!=='<'){parent.children.push({tag:'#text',value:decode(token),attrs:{},children:[]});continue;}
  const tag=token.match(/^<\s*([^\s/>]+)/)?.[1].toLowerCase();if(!tag)continue;const open=token.slice(0,token.indexOf('>')+1),attrs={};
  for(const a of open.matchAll(/([^\s=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g))attrs[a[1].toLowerCase()]=decode(a[2]??a[3]??a[4]);
  const n={tag,attrs,children:[],start:m.index,end:m.index+token.length};parent.children.push(n);
  if(['script','style'].includes(tag)){n.children.push({tag:'#text',value:token.slice(open.length,token.lastIndexOf('</')),attrs:{},children:[]});continue;}
  if(!/\/>$/.test(token)&&!['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'].includes(tag))stack.push(n);
 }
 return doc;
}
const all=(n,test)=>[...(test(n)?[n]:[]),...n.children.flatMap(c=>all(c,test))];
const one=(n,test)=>all(n,test)[0];
const cls=(n,c)=>(n.attrs.class||'').split(/\s+/).includes(c);
const text=n=>!n?'':n.tag==='#text'?n.value:['script','style'].includes(n.tag)?'':n.children.map(text).join(' ').replace(/\s+/g,' ').trim();
const meta=(doc,key)=>one(doc,n=>n.tag==='meta'&&(n.attrs.name===key||n.attrs.property===key))?.attrs.content;
const absolute=u=>new URL(u,origin).href;
const canonical=f=>origin+(f==='index.html'?'/':'/'+f);
function replaceMeta(html,key,value,property=false){const re=new RegExp(`<meta\\b[^>]*(?:name|property)=["']${key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["'][^>]*>`, 'gi');html=html.replace(re,'');return html.replace(/<\/head>/i,`<meta ${property?'property':'name'}="${key}" content="${esc(value)}">\n</head>`)}
function section(doc,label){const h=one(doc,n=>/^h[23]$/.test(n.tag)&&text(n).includes(label));if(!h)return;return one(doc,n=>n.children.includes(h));}
const website={'@type':'WebSite','@id':origin+'/#website',name:'Gezi Platformu',alternateName:'Gezi Platformu Özbek Turizm',url:origin+'/',inLanguage:'tr-TR',publisher:{'@type':'TravelAgency','@id':business['@id'],name:business.name,url:business.url,logo:{'@type':'ImageObject',url:business.logo}}};
// Use the exact same source data, ordering, cover overrides and hidden-tour rules as the browser.
const context=vm.createContext({window:{}});
for(const f of ['tours.js','tours-extra.js','tour-images.js'])vm.runInContext(read(f),context);
const allTours=JSON.parse(JSON.stringify(context.window.TOURS));
vm.runInContext(read('app.js').split('const core=')[0],context);
const activeTours=JSON.parse(JSON.stringify(context.window.TOURS));
const hiddenFiles=new Set(['kadim-topraklar-turu.html','sonbahar-ozel-bati-karadeniz.html','sivas-divrigi-turu.html','aladaglar-doga-turu.html','nemrut-rumkale-gaziantep-turu.html']);
const calendar=vm.createContext({window:{},document:{getElementById:()=>null,querySelectorAll:()=>[]},Intl,Date});
vm.runInContext(read('app-core.js').split('function tourCard')[0],calendar);
const archivedFiles=new Set(['buyuk-bati-karadeniz.html','kayseri-doga-turu.html','hatay-turu.html']);
for(const t of activeTours){
 calendar.currentTour=t;
 if((t.scheduleYear||/20\d{2}/.test(t.dates||''))&&!vm.runInContext('nearestTourDate(currentTour)',calendar))archivedFiles.add(t.detailUrl);
}
const listedTours=activeTours.filter(t=>!archivedFiles.has(t.detailUrl)&&(t.scheduleYear||/20\d{2}/.test(t.dates||'')));
const unconfirmedYearFiles=new Set(activeTours.filter(t=>!t.scheduleYear&&!/20\d{2}/.test(t.dates||'')).map(t=>t.detailUrl));
const tourCopy={
 'dogu-ekspresi.html':'Mersin, Adana ve Niğde çıkışlı Doğu Ekspresi, Erzurum, Kars, Ağrı ve Van turu. Aralık 2026–Mart 2027 kış sezonu tarihlerini, otelleri ve dönemlik fiyatları inceleyin.',
 'kadim-topraklar-turu.html':'Mersin, Adana ve Niğde çıkışlı GAP turu: Nemrut, Diyarbakır, Midyat ve Mardin. Konaklama, fiyat, tur programı ve rezervasyon bilgilerini inceleyin.',
 'sonbahar-ozel-bati-karadeniz.html':'Mersin, Adana ve Niğde çıkışlı sonbahar turu: Yedigöller, Gölcük, Safranbolu, Amasra ve Horma Kanyonu. Tarihleri, oteli ve fiyatı inceleyin.',
 'sivas-divrigi-turu.html':'Mersin, Adana ve Niğde çıkışlı Sivas ve Divriği turu. Divriği Ulu Camii, Kongre Merkezi ve medreseler; tarih, fiyat ve hareket saatleri.',
 'yirce-kayin-ormanlari-doga-turu.html':'Mersin ve Adana çıkışlı Yirce Kayın Ormanları turu. Dağılcak, Kozan Gölü ve Arıkan Konağı; yürüyüş gerektirmeyen sonbahar rotası, tarih ve fiyat.',
 'camliyayla-doga-turu.html':'Mersin ve Adana çıkışlı Belemedik Tabiat Parkı turu. Varda Köprüsü, Gülek Kalesi, Şekerpınarı ve Yerköprü; Kasım 2026 tarihleri ve hafta içi/sonu fiyatları.',
 'baskonus-menzelet-ali-kayasi.html':'Mersin ve Adana çıkışlı Başkonuş Yaylası turu. Ali Kayası Cam Teras ve Menzelet Gölü tekne turu; program, tarih, fiyat ve dahil olan hizmetler.',
 'aladaglar-doga-turu.html':'Mersin ve Adana çıkışlı Ortaseki Ormanları turu. Tekir Göleti ve Erciyes teleferiğiyle sonbahar rotası; tarih, fiyat ve hareket saatleri.',
 'osmaniye-doga-turu.html':'Mersin ve Adana çıkışlı Dumanlı Yaylası turu. Karaçay Şelalesi, Zorkun Yaylası Cam Teras ve Harun Reşit Kalesi; tur tarihleri, program ve fiyat.',
 'nemrut-rumkale-gaziantep-turu.html':'Mersin, Adana ve Osmaniye çıkışlı Nemrut, Rumkale, Halfeti ve Gaziantep turu. Gün doğumu rotası, hareket saatleri, tarihler ve fiyat bilgileri.',
 'mardin-midyat-turu.html':'Mersin, Adana ve Osmaniye çıkışlı Mardin Midyat turu. Kasımiye Medresesi, Mor Gabriel ve taş sokaklar; program, tarihler ve rezervasyon bilgileri.',
 'buyuk-bati-karadeniz.html':'Büyük Batı Karadeniz turunun geçmiş programı: Yedigöller, Abant, Amasra, Safranbolu ve Sinop. Yeni tarih ve güncel ücret için acentemizle iletişime geçin.',
 'kayseri-doga-turu.html':'Kayseri Doğa Turu geçmiş programı: Kapuzbaşı Şelaleleri ve Sultan Sazlığı. Yeni hareket tarihi ve güncel fiyat için Gezi Platformu ile iletişime geçin.',
 'hatay-turu.html':'Hatay Turu geçmiş programı: Titus Tüneli, Beşikli Mağarası, Harbiye ve Uzun Çarşı. Yeni hareket tarihi ve güncel fiyat için acentemizle iletişime geçin.'
};
const tourFiles=new Set([...allTours,...activeTours].map(t=>t.detailUrl).concat(['hatay-turu.html','mardin-midyat-turu.html',...hiddenFiles]));
for(const f of tourFiles)if(!listedTours.some(t=>t.detailUrl===f)&&!hiddenFiles.has(f)&&!archivedFiles.has(f))unconfirmedYearFiles.add(f);
const privateFiles=new Set(['404.html','sepet.html','rezervasyon.html']);
const tourGuides={
 'dogu-ekspresi.html':['dogu-ekspresi-rehberi','kars-gezi-rehberi','erzurum-gezi-rehberi','van-gezi-rehberi'],
 'buyuk-bati-karadeniz.html':['bati-karadeniz-gezi-rehberi','safranbolu-amasra-gezi-rehberi'],
 'sonbahar-ozel-bati-karadeniz.html':['yedigoller-gezi-rehberi','horma-kanyonu-ilica-selalesi','safranbolu-amasra-gezi-rehberi'],
 'kadim-topraklar-turu.html':['nemrut-dagi-gezi-rehberi','diyarbakir-gezi-rehberi','mardin-midyat-gezi-rehberi'],
 'sivas-divrigi-turu.html':['sivas-divrigi-gezi-rehberi'], 'hatay-turu.html':['hatay-gezi-rehberi'],
 'mardin-midyat-turu.html':['mardin-midyat-gezi-rehberi'], 'camliyayla-doga-turu.html':['camliyayla-toroslar-gezi-rehberi'],
 'aladaglar-doga-turu.html':['kapuzbasi-sultan-sazligi-rehberi'], 'osmaniye-doga-turu.html':['osmaniye-gezi-rehberi'],
 'baskonus-menzelet-ali-kayasi.html':['kahramanmaras-doga-gezi-rehberi'], 'kayseri-doga-turu.html':['kapuzbasi-sultan-sazligi-rehberi'],
 'nemrut-rumkale-gaziantep-turu.html':['nemrut-dagi-gezi-rehberi','halfeti-rumkale-gezi-rehberi','gaziantep-gezi-rehberi'],
 'yirce-kayin-ormanlari-doga-turu.html':['yirce-kayin-ormanlari-gezi-rehberi']
};
// Ortaseki is a new route on an old URL: do not link it to an unrelated Aladağlar guide.
delete tourGuides['aladaglar-doga-turu.html'];
if(!fs.existsSync(path.join(root,'tur-rotalari.html'))){
 const header=read('hakkimizda.html').match(/<header\b[\s\S]*?<\/header>/)[0].replace(' aria-current="page"','');
 write('tur-rotalari.html',`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mersin Çıkışlı Tur Rotaları | Gezi Platformu</title><meta name="description" content="Mersin çıkışlı tur rotalarını, katılım şehirlerini ve fiyatları karşılaştırın. Düzenleyen acenta: Gezi Platformu – Özbek Turizm, TÜRSAB A-8660."><link rel="icon" href="/favicon-192.png"><link rel="stylesheet" href="/styles.css"><script defer src="/site-controls.js?v=20261009"></script></head><body>${header}<main><h1>Mersin Çıkışlı Tur Rotaları</h1></main><footer class="site-footer">Gezi Platformu · Dört Mevsim Gezi · TÜRSAB A-8660</footer></body></html>`);
}
const files=[...fs.readdirSync(root).filter(f=>f.endsWith('.html')),...fs.readdirSync(path.join(root,'gezi-rehberi')).filter(f=>f.endsWith('.html')).map(f=>'gezi-rehberi/'+f)].sort();
const digest=s=>createHash('sha256').update(s.replace(/\s+/g,' ').trim()).digest('hex');
const beforeBuild=new Map(files.map(f=>[f,digest(read(f))]));
const previousState=fs.existsSync(path.join(root,'scripts/seo-state.json'))?JSON.parse(read('scripts/seo-state.json')):{};
const pageInfo=new Map(files.map(f=>{const d=parse(read(f));return [f,{name:text(one(d,n=>n.tag==='h1')),desc:meta(d,'description')}]}));
// Only the verified current catalogue is advertised as available by city.
// Standalone pages without a confirmed season remain accessible as references.
const navigationTours=listedTours;
const link=(f,label)=>`<a href="/${f}">${esc(label||pageInfo.get(f)?.name||f)}</a>`;
const block=(id,title,links)=>`\n<section class="seo-links" id="${id}" aria-label="${esc(title)}"><h2>${esc(title)}</h2><nav>${links.join('')}</nav></section>\n`;
function publishedPrices(main){
 const blocks=all(main,n=>cls(n,'price-block'));
 return blocks.length?blocks.map(n=>({value:text(one(n,x=>x.tag==='strong')),description:text(n)})):[{value:text(one(main,n=>cls(n,'detail-price'))),description:text(one(main,n=>cls(n,'detail-price')))}];
}
const facts=listedTours.map(t=>({...t,title:pageInfo.get(t.detailUrl).name,prices:publishedPrices(one(parse(read(t.detailUrl)),n=>n.tag==='main'))}));
const discovery=discoveryContent({esc,link,facts});
const titles={
 'index.html':'Gezi Platformu | Mersin Tur Firması ve Mersin Çıkışlı Turlar',
 'hakkimizda.html':'Gezi Platformu Hakkımızda | Özbek Turizm TÜRSAB A-8660',
 'iletisim.html':'Gezi Platformu İletişim | Mersin Ofisi, Telefon ve Adres',
 'sss.html':'Sık Sorulan Sorular | Tur, Ödeme, İptal ve İade | Gezi Platformu',
 'gezi-rehberi.html':'Gezi Rehberi | Türkiye’de Gezilecek Yerler | Gezi Platformu',
 'tur-rotalari.html':'Mersin Çıkışlı Tur Rotaları ve Düzenleyen Acenta | Gezi Platformu',
 'mersin-cikisli-turlar.html':'Mersin Çıkışlı Turlar | Günübirlik ve Konaklamalı | Gezi Platformu',
 'adana-cikisli-turlar.html':'Adana Çıkışlı Turlar | Gezi Platformu Özbek Turizm',
 'nigde-cikisli-turlar.html':'Niğde Çıkışlı Turlar | Gezi Platformu Özbek Turizm'
};
const descriptions={
 'index.html':'Mersin tur firması Gezi Platformu – Özbek Turizm, TÜRSAB A-8660. Mersin, Tarsus, Adana ve Niğde çıkışlı turlar; güncel program, tarih ve fiyat bilgileri.',
 'mersin-cikisli-turlar.html':'Mersin çıkışlı günübirlik ve konaklamalı turlar. Gezi Platformu – Özbek Turizm TÜRSAB A-8660; tur rotaları, fiyatlar, biniş noktaları ve Mersin ofisi.',
 'adana-cikisli-turlar.html':'Adana katılımlı Gezi Platformu turları: yayımlanmış rota, fiyat ve kalkış bilgilerini karşılaştırın. Mersin merkezli Özbek Turizm, TÜRSAB A-8660.',
 'nigde-cikisli-turlar.html':'Niğde katılımlı tur programları, Doğu Ekspresi kış rotası ve kalkış bilgileri. Gezi Platformu – Mersin Özbek Turizm, TÜRSAB A-8660.',
 'iletisim.html':'Gezi Platformu Mersin Özbek Turizm ofisi: Camiişerif Mah. İstiklal Cad. No:45/D Akdeniz/Mersin. Telefon ve WhatsApp: 0537 497 84 41. TÜRSAB A-8660.',
 'sss.html':'Gezi Platformu turları hakkında rezervasyon, kapora, ödeme, koltuk düzeni, biniş noktaları, iptal ve iade sorularının yanıtları.',
 'tursab-dogrulama.html':'Mersin Özbek Turizm – Gezi Platformu TÜRSAB A-8660 seyahat acentası belge bilgileri ve resmî doğrulama bağlantısı.'
};
function faq(doc){return all(doc,n=>n.tag==='details'&&!cls(n,'tour-terms-details')).map(d=>{const s=one(d,n=>n.tag==='summary');const q=one(s||d,n=>cls(n,'faq-question'));const answer=one(d,n=>cls(n,'faq-answer'));return {'@type':'Question',name:text(q||s),acceptedAnswer:{'@type':'Answer',text:answer?text(answer):d.children.filter(c=>c!==s).map(text).join(' ').trim()}}}).filter(q=>q.name&&q.acceptedAnswer.text&&!q.name.includes('Tur tarihleri'));}
for(const f of files){
 let html=read(f),doc=parse(html),url=canonical(f),info=pageInfo.get(f),title=titles[f]||text(one(doc,n=>n.tag==='title')),desc=descriptions[f]||info.desc||`${info.name}. Gezi Platformu – Mersin Özbek Turizm tur ve seyahat bilgileri.`;
 // Remove previously generated sections before deterministic regeneration.
 html=html.replace(/<aside\b[^>]*id="seo-schedule-notice"[^>]*>[\s\S]*?<\/aside>/g,'');
 html=html.replace(/\n?<section\b[^>]*id="seo-[^"]+"[^>]*>[\s\S]*?<\/section>\n?/g,'').replace(/\n?<nav\b[^>]*id="seo-site-nav"[^>]*>[\s\S]*?<\/nav>\n?/g,'');
 html=html.replace(/\n?<section\b[^>]*id="tour-terms"[^>]*>[\s\S]*?<\/section>\n?/g,'');
 html=html.replace(/\n?<section\b[^>]*id="discovery-[^"]+"[^>]*>[\s\S]*?<\/section>\n?/g,'');
 if(f==='tur-rotalari.html')html=html.replace(/<main\b[\s\S]*?<\/main>/,discovery.routeMain);
 if(f==='index.html'){
  html=html.replace('<h1>Güncel Kültür, Tatil, Doğa ve Kış Turlarımız</h1>','<h1>Mersin Çıkışlı Günübirlik ve Konaklamalı Turlar</h1>');
  html=html.replace('</main>',discovery.home+'</main>');
 }
 if(f==='hakkimizda.html')html=html.replace('</main>',discovery.about+'</main>');
 const fact=facts.find(t=>t.detailUrl===f);
 if(fact)html=html.replace('</main>',discovery.tourFaq(fact)+'</main>');
 if(f.endsWith('-cikisli-turlar.html'))html=html.replace('</main>',discovery.cityContent({'mersin':'Mersin','adana':'Adana','nigde':'Niğde'}[f.split('-')[0]])+'</main>');
 if(html.includes('class="discovery-')){
  html=html.replace(/<link\b[^>]*href="\/discovery\.css[^"\s]*"[^>]*>\n?/g,'');
  html=html.replace('</head>','<link rel="stylesheet" href="/discovery.css?v=20261115">\n</head>');
 }
 if(tourFiles.has(f)){
  html=html.replace(/<link\b[^>]*href="\/?tour-terms\.css[^"\s]*"[^>]*>\n?/g,'');
  html=html.replace('</head>','<link rel="stylesheet" href="/tour-terms.css?v=20261008">\n</head>');
  const terms=renderTourTerms(f),reservation=/<(?:div|section) class="(?:reserve-box|contact-box)"/;
  html=reservation.test(html)?html.replace(reservation,m=>terms+m):html.replace('</main>',terms+'</main>');
  html=html.replace(/^[ \t]+$/gm,'');
 }
 if(f==='index.html'){
  const renderer=vm.createContext({window:context.window,document:{getElementById:()=>null,querySelectorAll:()=>[]},Intl,Date});
  vm.runInContext(read('app-core.js').split("function renderTours")[0],renderer);vm.runInContext('nearestTourDate=()=>null',renderer);
  const cards=listedTours.map(t=>{renderer.currentTour=t;return vm.runInContext('tourCard(currentTour)',renderer).replace('<div class="tour-actions">',`<details class="tour-static-dates"><summary>Tur tarihleri</summary><p>${esc(t.dates)}</p></details><div class="tour-actions">`)}).join('');
  html=html.replace(/(<div class="tour-grid" id="tourGrid"[^>]*>)[\s\S]*?(<\/div><\/div><\/section>)/,'$1'+cards+'$2');
  html=html.replace(/(<span class="stat-counter" data-target="(\d+)">)[^<]*/g,(_,open,n)=>open+new Intl.NumberFormat('tr-TR').format(Number(n)));
 }
 if(f.endsWith('-cikisli-turlar.html')){
  const city={'mersin':'Mersin','adana':'Adana','nigde':'Niğde'}[f.split('-')[0]];
  const cityTours=navigationTours.filter(t=>t.departure.includes(city));
  html=html.replace(/(<div class="tour-links">)[\s\S]*?<\/div>/,'$1'+cityTours.map(t=>link(t.detailUrl,t.title)).join('')+'</div>');
 }
 const related=(tourFiles.has(f)?(tourGuides[f]||[]).map(g=>'gezi-rehberi/'+g+'.html'):f.startsWith('gezi-rehberi/')?Object.entries(tourGuides).filter(([,gs])=>gs.includes(path.basename(f,'.html'))).map(([tour])=>tour):[]).filter(f=>!hiddenFiles.has(f));
 const currentRelated=related.filter(f=>facts.some(t=>t.detailUrl===f));
 if(f.startsWith('gezi-rehberi/')&&currentRelated.length){
  html=html.replace('</main>',discovery.guideOperator(currentRelated)+'</main>');
  if(!html.includes('href="/discovery.css'))html=html.replace('</head>','<link rel="stylesheet" href="/discovery.css?v=20261115">\n</head>');
 }
 if(archivedFiles.has(f)||unconfirmedYearFiles.has(f)){
  const notice=archivedFiles.has(f)?'<h2>Geçmiş tur programı</h2><p>Bu programdaki hareket tarihleri geçmiştir. Yeni tarih ve güncel ücret henüz doğrulanmamıştır.':'<h2>Hareket tarihinin yılını teyit edin</h2><p>Yayımlanan program için güncel hareket yılı doğrulanmamıştır. Rezervasyon öncesinde hareket tarihinin yılını, ücreti ve kontenjanı teyit edin.';
  html=html.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/i,'$1'+`<aside class="seo-schedule-notice" id="seo-schedule-notice">${notice} <a href="/iletisim.html">Acentemizle iletişime geçin</a>.</p></aside>`);
 }
 if(related.length)html=html.replace('</main>',block('seo-related',tourFiles.has(f)?'Bu rota için gezi rehberleri':'İlgili tur programları',related.map(x=>link(x)))+'</main>');
 if(!privateFiles.has(f))html=html.replace('</body>',`<nav class="seo-site-nav" id="seo-site-nav" aria-label="Firma ve seyahat bilgileri">${['tur-rotalari.html','mersin-cikisli-turlar.html','adana-cikisli-turlar.html','nigde-cikisli-turlar.html','hakkimizda.html','iletisim.html','tursab-dogrulama.html','gezi-rehberi.html','sss.html','iptal-iade.html','kvkk.html','gizlilik-politikasi.html','mesafeli-satis-sozlesmesi.html','on-bilgilendirme.html','teslimat-iade.html'].map(x=>link(x)).join('')}</nav>\n</body>`);
 doc=parse(html);const main=one(doc,n=>n.tag==='main')||doc;
 if(tourFiles.has(f)){
  const badge=one(main,n=>cls(n,'detail-badges'));let departures=text(badge?.children.find(n=>n.tag==='span'&&/Mersin|Adana|Niğde/.test(text(n))))||text(one(main,n=>n.tag==='p'&&text(n).includes('Kalkışlı')));
  departures=departures.replace(/[📍]/gu,'').replace(/Kalkışlı/gi,'').trim().split(/\s*•\s*/).join(', ');
  const name=info.name.replace(/^HATAY TURU$/,'Hatay Turu').replace(/^MARDİN & MİDYAT TURU$/,'Mardin Midyat Turu').replace(/^NEMRUT • GAZİANTEP • RUMKALE • HALFETİ$/,'Nemrut Gaziantep Rumkale Halfeti Turu');
  const titleCities=departures.split(', ').filter(c=>['Mersin','Adana','Niğde','Osmaniye'].includes(c)).join(' ');
  title=`${name} | ${titleCities} Çıkışlı | Gezi Platformu`;
  const cityFiles=['Mersin','Adana','Niğde'].filter(c=>departures.split(', ').includes(c)).map(c=>({'Mersin':'mersin','Adana':'adana','Niğde':'nigde'}[c])+'-cikisli-turlar.html');
  const peers=listedTours.filter(t=>t.detailUrl!==f&&t.departure.split(' • ').some(c=>departures.split(', ').includes(c))).slice(0,3);
  html=html.replace('</main>',block('seo-tour-cities','Kalkış şehrinize göre diğer turlar',cityFiles.map(x=>link(x)))+block('seo-tour-peers','Diğer tur programları',peers.map(t=>link(t.detailUrl,t.title)))+'</main>');
  const lead=text(one(main,n=>cls(n,'tour-detail-lead')))||allTours.find(t=>t.detailUrl===f)?.summary||'';
  desc=tourCopy[f]||`${departures} çıkışlı ${name}. ${lead.replace(/[🍁🍂💧🥰😌🍄‍🟫]/gu,'').trim()} Tarih, fiyat, rota ve dahil olan hizmetler.`.replace(/\s+/g,' ').slice(0,280);
 }
 // One shared measurement loader also measures AI referrals and contact clicks.
 if(!privateFiles.has(f)){
  html=html.replace(/<script\b[^>]*src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js[^"']*["'][^>]*>\s*<\/script>\s*/g,'');
  html=html.replace(/<script>\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];[\s\S]*?gtag\('config',\s*'G-SL0GWRTHRR'\);\s*<\/script>\s*/g,'');
  if(!/src=["']\/?ga4\.js/.test(html))html=html.replace('</head>','<script defer src="/ga4.js"></script>\n</head>');
  if(!/src=["']\/?site-controls\.js/.test(html))html=html.replace('</head>','<script defer data-gp-site-controls="1" src="/site-controls.js?v=20261009"></script>\n</head>');
 }
 html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${esc(title)}</title>`);
 html=html.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'').replace('</head>',`<link rel="canonical" href="${url}">\n</head>`);
 for(const [key,value,property] of [['description',desc],['robots',(privateFiles.has(f)||hiddenFiles.has(f))?'noindex,follow':'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'],['og:title',title,true],['og:description',desc,true],['og:url',url,true],['og:site_name','Gezi Platformu',true],['og:locale','tr_TR',true],['og:type',f.startsWith('gezi-rehberi/')?'article':'website',true],['twitter:card','summary_large_image'],['twitter:title',title],['twitter:description',desc]])html=replaceMeta(html,key,value,property);
 doc=parse(html);
 const cover=one(main,n=>cls(n,'tour-detail-cover')||cls(n,'detail-hero')||cls(n,'guide-hero'));
 const image=f==='index.html'?'/assets/gezi-platformu-paylasim-logo.jpg':f.endsWith('-cikisli-turlar.html')?'/assets/tours/dogu-ekspresi-cover.avif':one(cover||main,n=>n.tag==='img'&&n.attrs.src)?.attrs.src||'/assets/gezi-platformu-logo.webp';
 html=replaceMeta(html,'og:image',absolute(image),true);html=replaceMeta(html,'twitter:image',absolute(image));
 if(f==='index.html'){
  for(const [key,value,property] of [['og:image:secure_url',absolute(image),true],['og:image:type','image/jpeg',true],['og:image:width','640',true],['og:image:height','640',true],['og:image:alt','Gezi Platformu - Dört Mevsim Gezi logosu',true],['twitter:image:alt','Gezi Platformu - Dört Mevsim Gezi logosu']])html=replaceMeta(html,key,value,property);
 }
 const oldGraphs=all(doc,n=>n.tag==='script'&&n.attrs.type==='application/ld+json').flatMap(s=>{const j=JSON.parse(s.children[0]?.value||'{}');return j['@graph']||[j]});
 const graph=[];
 const pageType=f==='hakkimizda.html'?'AboutPage':f==='iletisim.html'?'ContactPage':f==='gezi-rehberi.html'||f==='tur-rotalari.html'||f.endsWith('-cikisli-turlar.html')||f==='index.html'?'CollectionPage':'WebPage';
 const webpage={'@type':pageType,'@id':url+'#webpage',url,name:title,description:desc,inLanguage:'tr-TR',isPartOf:{'@id':website['@id']},publisher:{'@type':'TravelAgency','@id':business['@id'],name:business.name,url:business.url,logo:{'@type':'ImageObject',url:business.logo}}};
 graph.push(webpage);
 graph.push(business);
 if(f==='index.html')graph.push(website);
 if(['index.html','hakkimizda.html','iletisim.html','tursab-dogrulama.html','tur-rotalari.html'].includes(f)||f.endsWith('-cikisli-turlar.html'))webpage.about={'@id':business['@id']};
 const crumbs=[{'@type':'ListItem',position:1,name:'Ana Sayfa',item:origin+'/'}];
 if(f.startsWith('gezi-rehberi/'))crumbs.push({'@type':'ListItem',position:2,name:'Gezi Rehberi',item:origin+'/gezi-rehberi.html'});
 if(f!=='index.html'){crumbs.push({'@type':'ListItem',position:crumbs.length+1,name:info.name,item:url});graph.push({'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:crumbs});webpage.breadcrumb={'@id':url+'#breadcrumb'}}
 if(tourFiles.has(f)){
  const trip={'@type':'TouristTrip','@id':url+'#tour',name:info.name,url,description:desc,image:absolute(image),provider:{'@type':'TravelAgency','@id':business['@id'],name:business.name,url:business.url,telephone:business.telephone},touristType:'Kültür ve doğa gezilerine katılan ziyaretçiler'};
  const fields=['Tur Tarihleri','Tarihler ve Fiyatlar','Ücrete Dahil Olanlar','Ücrete Dahil Olmayanlar','Dahil Olanlar','Dahil Olmayanlar','Hareket Saatleri','Çıkış Saatleri','Konaklama','Tur Rotası','Gezilecek Noktalar'];
  trip.mainEntityOfPage={'@id':webpage['@id']};
  const badge=one(main,n=>cls(n,'detail-badges'));
  const departureText=text(badge?.children.find(n=>n.tag==='span'&&/Mersin|Adana|Niğde/.test(text(n))))||text(one(main,n=>n.tag==='p'&&text(n).includes('Kalkışlı')));
  const cities=departureText.replace(/[📍]/gu,'').replace(/Kalkışlı/gi,'').trim().split(/\s*•\s*/).filter(Boolean);
  trip.tripOrigin=cities.map(name=>({'@type':'Place',name}));
  trip.description=[desc,...fields.map(label=>text(section(main,label))).filter(Boolean)].join(' ');
  const route=section(main,'Tur Rotası')||section(main,'Gezilecek Noktalar')||section(main,'Tur Programı');
  const stops=route?all(route,n=>n.tag==='li').map(text):fact?.subtitle.split(' • ')||[];
  if(stops.length)trip.itinerary={'@type':'ItemList',itemListElement:stops.map((name,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'Place',name}}))};
  // Prices are taken from visible detail content, never the older JS policy/catalog.
  const prices=publishedPrices(main);
  const archive=archivedFiles.has(f)||hiddenFiles.has(f)||unconfirmedYearFiles.has(f);
  if(!archive)trip.offers=prices.flatMap(p=>{const m=p.value.match(/(\d[\d.]*)\s*(?:₺|TL)/);return m?[{'@type':'Offer',url,price:m[1].replaceAll('.',''),priceCurrency:'TRY',description:p.description,seller:{'@type':'TravelAgency','@id':business['@id'],name:business.name,url:business.url}}]:[]});
  webpage.mainEntity={'@id':trip['@id']};graph.push(trip);
 }
 if(f.startsWith('gezi-rehberi/')){
  const article=oldGraphs.find(g=>g['@type']==='BlogPosting');if(article){article['@id']=url+'#article';article.url=url;article.author={'@type':'Organization',name:'Gezi Platformu Gezi Rehberi Editörleri',url:origin+'/hakkimizda.html'};article.publisher={'@type':'Organization','@id':business['@id'],name:business.name,url:business.url,logo:{'@type':'ImageObject',url:business.logo}};article.mainEntityOfPage={'@id':webpage['@id']};graph.push(article);webpage.mainEntity={'@id':article['@id']}}
 }
 const questions=faq(main);if(questions.length)graph.push({'@type':'FAQPage','@id':url+'#faq',mainEntity:questions});
 if(pageType==='CollectionPage'){
  const collectionMain=one(doc,n=>n.tag==='main')||doc;
  const urls=[...new Set(all(collectionMain,n=>n.tag==='a'&&n.attrs.href).map(n=>n.attrs.href).filter(h=>h.endsWith('.html')&&(tourFiles.has(h.replace(/^\//,''))||h.startsWith('/gezi-rehberi/'))))];
  if(urls.length){const list={'@type':'ItemList','@id':url+'#list',itemListElement:urls.map((u,i)=>({'@type':'ListItem',position:i+1,name:pageInfo.get(u.replace(/^\//,''))?.name||u,url:absolute(u)}))};graph.push(list);webpage.mainEntity={'@id':list['@id']}}
 }
 html=html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,'');
 if(!privateFiles.has(f))html=html.replace('</head>',`<script type="application/ld+json" id="gp-static-schema">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>\n</head>`);
 html=html.replace(/<head>([\s\S]*?)<\/head>/i,(_,head)=>'<head>'+head.replace(/\n[ \t]*\n(?:[ \t]*\n)*/g,'\n')+'</head>');
 write(f,html);
}
// Sitemap covers every public content page; transactional and administration pages stay out.
const previousDates=new Map([...read('sitemap.xml').matchAll(/<url><loc>(.*?)<\/loc>(?:<lastmod>(.*?)<\/lastmod>)?/g)].map(m=>[m[1],m[2]]));
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const nextState={};
const urls=files.filter(f=>!privateFiles.has(f)&&!hiddenFiles.has(f)).map(f=>{
 const u=canonical(f),hash=digest(read(f)),old=previousState[f];
 // A stable content hash preserves lastmod on unchanged rebuilds. Article
 // editorial dates remain intact; sitemap dates also reflect real schema changes.
 const date=old?.hash===hash?old.lastmod:(!old&&beforeBuild.get(f)===hash?previousDates.get(u):today);
 nextState[f]={hash,...(date?{lastmod:date}:{})};
 return `  <url><loc>${u}</loc>${date?`<lastmod>${date}</lastmod>`:''}</url>`;
});
write('scripts/seo-state.json',JSON.stringify(nextState,null,2)+'\n');
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
write('llms.txt',`# Gezi Platformu\n\nMersin merkezli Gezi Platformu, Mersin Özbek Turizm Sanayi ve Ticaret Limited Şirketi bünyesinde TÜRSAB A-8660 belgeli seyahat acentasıdır.\nTelefon / WhatsApp: +90 537 497 84 41\nAdres: Camiişerif Mah. İstiklal Cad. No:45/D Akdeniz / Mersin\n\nBilgi için resmi tur detay sayfaları esas alınmalıdır. Fiyat, tarih, kalkış noktası ve dahil olan hizmetler tur bazında değişir. Bu dizin indeksleme veya sıralama garantisi değildir.\n\n## Firma ve seyahat bilgileri\n${files.filter(f=>!tourFiles.has(f)&&!f.startsWith('gezi-rehberi/')&&!privateFiles.has(f)).map(f=>`- [${pageInfo.get(f).name}](${canonical(f)})`).join('\n')}\n\n## Yayımlanan güncel tur programları\n${listedTours.map(t=>`- [${pageInfo.get(t.detailUrl).name}](${canonical(t.detailUrl)})`).join('\n')}\n\n## Tarihi veya yeni hareket yılı teyit edilmesi gereken programlar\n${[...tourFiles].filter(f=>!hiddenFiles.has(f)&&!listedTours.some(t=>t.detailUrl===f)).map(f=>`- [${pageInfo.get(f).name}](${canonical(f)})`).join('\n')}\n\n## Gezi rehberleri\n${files.filter(f=>f.startsWith('gezi-rehberi/')).map(f=>`- [${pageInfo.get(f).name}](${canonical(f)})`).join('\n')}\n`);
console.log(`${files.length} HTML sayfası, ${tourFiles.size} tur, ${files.filter(f=>f.startsWith('gezi-rehberi/')).length} rehber optimize edildi; ${urls.length} URL site haritasında.`);
