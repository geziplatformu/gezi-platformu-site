import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
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
const business={'@type':'TravelAgency','@id':origin+'/#business',name:'Gezi Platformu',alternateName:'Mersin Özbek Turizm',legalName:'Mersin Özbek Turizm Sanayi ve Ticaret Limited Şirketi',url:origin+'/',logo:origin+'/assets/gezi-platformu-logo.webp',telephone:'+90 537 497 84 41',email:'ozbekturizm@gmail.com',identifier:{'@type':'PropertyValue',name:'TÜRSAB Seyahat Acentası Belge No',value:'A-8660'},address:{'@type':'PostalAddress',streetAddress:'Camiişerif Mah. İstiklal Cad. No:45/D',addressLocality:'Akdeniz',addressRegion:'Mersin',addressCountry:'TR'},sameAs:['https://www.instagram.com/geziplatformuu/'],contactPoint:{'@type':'ContactPoint',telephone:'+90 537 497 84 41',contactType:'Tur bilgisi ve rezervasyon',availableLanguage:'Turkish'}};
const website={'@type':'WebSite','@id':origin+'/#website',name:'Gezi Platformu',alternateName:'Gezi Platformu Özbek Turizm',url:origin+'/',inLanguage:'tr-TR',publisher:{'@type':'TravelAgency','@id':business['@id'],name:business.name,url:business.url,logo:{'@type':'ImageObject',url:business.logo}}};
// Use the exact same source data, ordering, cover overrides and hidden-tour rules as the browser.
const context=vm.createContext({window:{}});
for(const f of ['tours.js','tours-extra.js','tour-images.js'])vm.runInContext(read(f),context);
const allTours=JSON.parse(JSON.stringify(context.window.TOURS));
vm.runInContext(read('app.js').split('const core=')[0],context);
const activeTours=JSON.parse(JSON.stringify(context.window.TOURS));
const tourFiles=new Set([...allTours,...activeTours].map(t=>t.detailUrl).concat(['hatay-turu.html','mardin-midyat-turu.html']));
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
const files=[...fs.readdirSync(root).filter(f=>f.endsWith('.html')),...fs.readdirSync(path.join(root,'gezi-rehberi')).filter(f=>f.endsWith('.html')).map(f=>'gezi-rehberi/'+f)].sort();
const pageInfo=new Map(files.map(f=>{const d=parse(read(f));return [f,{name:text(one(d,n=>n.tag==='h1')),desc:meta(d,'description')}]}));
const link=(f,label)=>`<a href="/${f}">${esc(label||pageInfo.get(f)?.name||f)}</a>`;
const block=(id,title,links)=>`\n<section class="seo-links" id="${id}" aria-label="${esc(title)}"><h2>${esc(title)}</h2><nav>${links.join('')}</nav></section>\n`;
const titles={
 'index.html':'Gezi Platformu | Mersin Adana Çıkışlı Turlar ve Gezi Rehberi',
 'hakkimizda.html':'Gezi Platformu Hakkımızda | Özbek Turizm TÜRSAB A-8660',
 'iletisim.html':'Gezi Platformu İletişim | Mersin Ofisi, Telefon ve Adres',
 'sss.html':'Sık Sorulan Sorular | Tur, Ödeme, İptal ve İade | Gezi Platformu',
 'gezi-rehberi.html':'Gezi Rehberi | Türkiye’de Gezilecek Yerler | Gezi Platformu'
};
const descriptions={
 'iletisim.html':'Gezi Platformu Mersin Özbek Turizm ofisi: Camiişerif Mah. İstiklal Cad. No:45/D Akdeniz/Mersin. Telefon ve WhatsApp: 0537 497 84 41. TÜRSAB A-8660.',
 'sss.html':'Gezi Platformu turları hakkında rezervasyon, kapora, ödeme, koltuk düzeni, biniş noktaları, iptal ve iade sorularının yanıtları.',
 'tursab-dogrulama.html':'Mersin Özbek Turizm – Gezi Platformu TÜRSAB A-8660 seyahat acentası belge bilgileri ve resmî doğrulama bağlantısı.'
};
function faq(doc){return all(doc,n=>n.tag==='details').map(d=>{const s=one(d,n=>n.tag==='summary');const q=one(s||d,n=>cls(n,'faq-question'));const answer=one(d,n=>cls(n,'faq-answer'));return {'@type':'Question',name:text(q||s),acceptedAnswer:{'@type':'Answer',text:answer?text(answer):d.children.filter(c=>c!==s).map(text).join(' ').trim()}}}).filter(q=>q.name&&q.acceptedAnswer.text&&!q.name.includes('Tur tarihleri'));}
for(const f of files){
 let html=read(f),doc=parse(html),url=canonical(f),info=pageInfo.get(f),title=titles[f]||text(one(doc,n=>n.tag==='title')),desc=descriptions[f]||info.desc||`${info.name}. Gezi Platformu – Mersin Özbek Turizm tur ve seyahat bilgileri.`;
 // Remove previously generated sections before deterministic regeneration.
 html=html.replace(/\n?<section\b[^>]*id="seo-[^"]+"[^>]*>[\s\S]*?<\/section>\n?/g,'').replace(/\n?<nav\b[^>]*id="seo-site-nav"[^>]*>[\s\S]*?<\/nav>\n?/g,'');
 if(f==='index.html'){
  const renderer=vm.createContext({window:context.window,document:{getElementById:()=>null,querySelectorAll:()=>[]},Intl,Date});
  vm.runInContext(read('app-core.js').split("function renderTours")[0],renderer);vm.runInContext('nearestTourDate=()=>null',renderer);
  const cards=activeTours.map(t=>{renderer.currentTour=t;return vm.runInContext('tourCard(currentTour)',renderer).replace('<div class="tour-actions">',`<details class="tour-static-dates"><summary>Tur tarihleri</summary><p>${esc(t.dates)}</p></details><div class="tour-actions">`)}).join('');
  html=html.replace(/(<div class="tour-grid" id="tourGrid"[^>]*>)[\s\S]*?(<\/div><\/div><\/section>)/,'$1'+cards+'$2');
  html=html.replace(/(<span class="stat-counter" data-target="(\d+)">)[^<]*/g,(_,open,n)=>open+new Intl.NumberFormat('tr-TR').format(Number(n)));
 }
 if(f.endsWith('-cikisli-turlar.html')){
  const city={'mersin':'Mersin','adana':'Adana','nigde':'Niğde'}[f.split('-')[0]];
  const cityTours=activeTours.filter(t=>t.departure.includes(city));
  html=html.replace('</main>',block('seo-city-tours',`${city} kalkışlı güncel tur programları`,cityTours.map(t=>link(t.detailUrl,t.title)))+'</main>');
 }
 const related=tourFiles.has(f)?(tourGuides[f]||[]).map(g=>'gezi-rehberi/'+g+'.html'):f.startsWith('gezi-rehberi/')?Object.entries(tourGuides).filter(([,gs])=>gs.includes(path.basename(f,'.html'))).map(([tour])=>tour):[];
 if(['buyuk-bati-karadeniz.html','kayseri-doga-turu.html','hatay-turu.html'].includes(f))html=html.replace('</main>', '<section class="seo-links" id="seo-archive"><h2>Tur programı ve güncel tarihler</h2><p>Bu sayfada önceki programın tarih ve ücretleri yer almaktadır. Güncel hareket tarihi ve fiyatı için <a href="/iletisim.html">acentemizle iletişime geçin</a> veya <a href="/">güncel turları inceleyin</a>.</p></section></main>');
 if(related.length)html=html.replace('</main>',block('seo-related',tourFiles.has(f)?'Bu rota için gezi rehberleri':'İlgili tur programları',related.map(x=>link(x)))+'</main>');
 if(f!=='index.html'&&!privateFiles.has(f))html=html.replace('</body>',`<nav class="seo-site-nav" id="seo-site-nav" aria-label="Firma ve seyahat bilgileri">${['hakkimizda.html','iletisim.html','tursab-dogrulama.html','gezi-rehberi.html','sss.html','iptal-iade.html','kvkk.html','gizlilik-politikasi.html','mesafeli-satis-sozlesmesi.html','on-bilgilendirme.html','teslimat-iade.html'].map(x=>link(x)).join('')}</nav>\n</body>`);
 doc=parse(html);const main=one(doc,n=>n.tag==='main')||doc;
 if(tourFiles.has(f)){
  const badge=one(main,n=>cls(n,'detail-badges'));let departures=text(badge?.children.find(n=>n.tag==='span'&&/Mersin|Adana|Niğde/.test(text(n))))||text(one(main,n=>n.tag==='p'&&text(n).includes('Kalkışlı')));
  departures=departures.replace(/[📍]/gu,'').replace(/Kalkışlı/gi,'').trim().split(/\s*•\s*/).join(', ');
  const name=info.name.replace(/^HATAY TURU$/,'Hatay Turu').replace(/^MARDİN & MİDYAT TURU$/,'Mardin Midyat Turu').replace(/^NEMRUT • GAZİANTEP • RUMKALE • HALFETİ$/,'Nemrut Gaziantep Rumkale Halfeti Turu');
  title=`${name} | ${departures.replace(/, /g,' ')} Çıkışlı | Gezi Platformu`;
  const lead=text(one(main,n=>cls(n,'tour-detail-lead')))||allTours.find(t=>t.detailUrl===f)?.summary||'';
  desc=`${departures} çıkışlı ${name}. ${lead.replace(/[🍁🍂💧🥰😌🍄‍🟫]/gu,'').trim()} Tarih, fiyat, rota ve dahil olan hizmetler.`.replace(/\s+/g,' ').slice(0,280);
 }
 html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${esc(title)}</title>`);
 html=html.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'').replace('</head>',`<link rel="canonical" href="${url}">\n</head>`);
 for(const [key,value,property] of [['description',desc],['robots',privateFiles.has(f)?'noindex,follow':'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'],['og:title',title,true],['og:description',desc,true],['og:url',url,true],['og:site_name','Gezi Platformu',true],['og:locale','tr_TR',true],['og:type',f.startsWith('gezi-rehberi/')?'article':'website',true],['twitter:card','summary_large_image'],['twitter:title',title],['twitter:description',desc]])html=replaceMeta(html,key,value,property);
 const image=one(main,n=>n.tag==='img'&&(/cover|hero/.test(n.attrs.class||'')||n.attrs.src))?.attrs.src||meta(doc,'og:image')||'/assets/gezi-platformu-logo.webp';
 html=replaceMeta(html,'og:image',absolute(image),true);html=replaceMeta(html,'twitter:image',absolute(image));
 const oldGraphs=all(doc,n=>n.tag==='script'&&n.attrs.type==='application/ld+json').flatMap(s=>{const j=JSON.parse(s.children[0]?.value||'{}');return j['@graph']||[j]});
 const graph=[];
 const pageType=f==='hakkimizda.html'?'AboutPage':f==='iletisim.html'?'ContactPage':f==='gezi-rehberi.html'||f.endsWith('-cikisli-turlar.html')||f==='index.html'?'CollectionPage':'WebPage';
 const webpage={'@type':pageType,'@id':url+'#webpage',url,name:title,description:desc,inLanguage:'tr-TR',isPartOf:{'@id':website['@id']},publisher:{'@type':'TravelAgency','@id':business['@id'],name:business.name,url:business.url,logo:{'@type':'ImageObject',url:business.logo}}};
 graph.push(webpage);
 if(f==='index.html')graph.push(website,business);
 if(['hakkimizda.html','iletisim.html','tursab-dogrulama.html'].includes(f)){graph.push(business);webpage.about={'@id':business['@id']};if(f==='iletisim.html'){business.taxID='6180412339';business.identifier=[business.identifier,{'@type':'PropertyValue',name:'MERSİS No',value:'0859060299200011'}]}}
 const crumbs=[{'@type':'ListItem',position:1,name:'Ana Sayfa',item:origin+'/'}];
 if(f.startsWith('gezi-rehberi/'))crumbs.push({'@type':'ListItem',position:2,name:'Gezi Rehberi',item:origin+'/gezi-rehberi.html'});
 if(f!=='index.html'){crumbs.push({'@type':'ListItem',position:crumbs.length+1,name:info.name,item:url});graph.push({'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:crumbs});webpage.breadcrumb={'@id':url+'#breadcrumb'}}
 if(tourFiles.has(f)){
  const trip={'@type':'TouristTrip','@id':url+'#tour',name:info.name,url,description:desc,image:absolute(image),provider:{'@type':'TravelAgency','@id':business['@id'],name:business.name,url:business.url,telephone:business.telephone},touristType:text(one(main,n=>cls(n,'eyebrow')))||'Tur'};
  const fields=['Tur Tarihleri','Tarihler ve Fiyatlar','Ücrete Dahil Olanlar','Ücrete Dahil Olmayanlar','Dahil Olanlar','Dahil Olmayanlar','Hareket Saatleri','Çıkış Saatleri','Konaklama','Tur Rotası','Gezilecek Noktalar'];
  trip.description=[desc,...fields.map(label=>text(section(main,label))).filter(Boolean)].join(' ');
  const route=section(main,'Tur Rotası')||section(main,'Gezilecek Noktalar')||section(main,'Tur Programı');
  const stops=route?all(route,n=>n.tag==='li').map(text):[];
  if(stops.length)trip.itinerary={'@type':'ItemList',itemListElement:stops.map((name,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'Place',name}}))};
  // Prices are taken from visible detail content, never the older JS policy/catalog.
  const priceBlocks=all(main,n=>cls(n,'price-block'));
  const prices=priceBlocks.length?priceBlocks.map(n=>({value:text(one(n,x=>x.tag==='strong')),description:text(n)})):[{value:text(one(main,n=>cls(n,'detail-price'))),description:'Kişi başı tur ücreti; ayrıntılar ve ek ücretler tur programındadır.'}];
  const archive=['buyuk-bati-karadeniz.html','kayseri-doga-turu.html','hatay-turu.html'].includes(f);
  if(!archive)trip.offers=prices.flatMap(p=>{const m=p.value.match(/(\d[\d.]*)\s*(?:₺|TL)/);return m?[{'@type':'Offer',url,price:m[1].replaceAll('.',''),priceCurrency:'TRY',description:p.description,seller:{'@type':'TravelAgency','@id':business['@id'],name:business.name,url:business.url}}]:[]});
  webpage.mainEntity={'@id':trip['@id']};graph.push(trip);
 }
 if(f.startsWith('gezi-rehberi/')){
  const article=oldGraphs.find(g=>g['@type']==='BlogPosting');if(article){article['@id']=url+'#article';article.url=url;article.author={'@type':'Organization',name:'Gezi Platformu Gezi Rehberi Editörleri',url:origin+'/hakkimizda.html'};article.publisher={'@type':'Organization','@id':business['@id'],name:business.name,url:business.url,logo:{'@type':'ImageObject',url:business.logo}};article.mainEntityOfPage={'@id':webpage['@id']};graph.push(article);webpage.mainEntity={'@id':article['@id']}}
 }
 const questions=faq(main);if(questions.length)graph.push({'@type':'FAQPage','@id':url+'#faq',mainEntity:questions});
 if(pageType==='CollectionPage'){
  const urls=[...new Set(all(main,n=>n.tag==='a'&&n.attrs.href).map(n=>n.attrs.href).filter(h=>h.endsWith('.html')&&(tourFiles.has(h.replace(/^\//,''))||h.startsWith('/gezi-rehberi/'))))];
  if(urls.length){const list={'@type':'ItemList','@id':url+'#list',itemListElement:urls.map((u,i)=>({'@type':'ListItem',position:i+1,name:pageInfo.get(u.replace(/^\//,''))?.name||u,url:absolute(u)}))};graph.push(list);webpage.mainEntity={'@id':list['@id']}}
 }
 html=html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,'');
 if(!privateFiles.has(f))html=html.replace('</head>',`<script type="application/ld+json" id="gp-static-schema">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>\n</head>`);
 html=html.replace(/<head>([\s\S]*?)<\/head>/i,(_,head)=>'<head>'+head.replace(/\n[ \t]*\n(?:[ \t]*\n)*/g,'\n')+'</head>');
 write(f,html);
}
// Sitemap covers every public content page; transactional and administration pages stay out.
const previousDates=new Map([...read('sitemap.xml').matchAll(/<url><loc>(.*?)<\/loc>(?:<lastmod>(.*?)<\/lastmod>)?/g)].map(m=>[m[1],m[2]]));
const urls=files.filter(f=>!privateFiles.has(f)).map(f=>{const u=canonical(f);let date; // Preserve actual editorial dates; do not simulate daily freshness.
 const modified=all(parse(read(f)),n=>n.tag==='script'&&n.attrs.type==='application/ld+json').flatMap(s=>JSON.parse(s.children[0].value)['@graph']||[]).find(x=>x['@type']==='BlogPosting')?.dateModified;
 date=modified||previousDates.get(u);return `  <url><loc>${u}</loc>${date?`<lastmod>${date}</lastmod>`:''}</url>`;});
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
write('llms.txt',`# Gezi Platformu\n\nMersin merkezli Gezi Platformu, Mersin Özbek Turizm Sanayi ve Ticaret Limited Şirketi bünyesinde TÜRSAB A-8660 belgeli seyahat acentasıdır.\nTelefon / WhatsApp: +90 537 497 84 41\nAdres: Camiişerif Mah. İstiklal Cad. No:45/D Akdeniz / Mersin\n\nBilgi için resmi tur detay sayfaları esas alınmalıdır. Fiyat, tarih, kalkış noktası ve dahil olan hizmetler tur bazında değişir. Bu dizin indeksleme veya sıralama garantisi değildir.\n\n## Firma ve seyahat bilgileri\n${files.filter(f=>!tourFiles.has(f)&&!f.startsWith('gezi-rehberi/')&&!privateFiles.has(f)).map(f=>`- [${pageInfo.get(f).name}](${canonical(f)})`).join('\n')}\n\n## Tur programları\n${[...tourFiles].map(f=>`- [${pageInfo.get(f).name}](${canonical(f)})`).join('\n')}\n\n## Gezi rehberleri\n${files.filter(f=>f.startsWith('gezi-rehberi/')).map(f=>`- [${pageInfo.get(f).name}](${canonical(f)})`).join('\n')}\n`);
console.log(`${files.length} HTML sayfası, ${tourFiles.size} tur, ${files.filter(f=>f.startsWith('gezi-rehberi/')).length} rehber optimize edildi; ${urls.length} URL site haritasında.`);
