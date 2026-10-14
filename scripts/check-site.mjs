import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const files=[...fs.readdirSync(root).filter(x=>x.endsWith('.html')).map(x=>path.join(root,x)),...fs.readdirSync(path.join(root,'gezi-rehberi')).filter(x=>x.endsWith('.html')).map(x=>path.join(root,'gezi-rehberi',x))];
const errors=[];
for(const file of files){
  const html=fs.readFileSync(file,'utf8');
  const rel=path.relative(root,file);
  if(rel==='gezi-rehberi.html'||rel.startsWith('gezi-rehberi/')) for(const needle of ['<title>','meta name="description"','rel="canonical"']) if(!html.includes(needle)) errors.push(`${rel}: ${needle} eksik`);
  const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
  const dup=ids.filter((x,i)=>ids.indexOf(x)!==i); if(dup.length) errors.push(`${rel}: yinelenen id ${[...new Set(dup)].join(',')}`);
  if(rel.startsWith('gezi-rehberi/')&&!html.includes('application/ld+json')) errors.push(`${rel}: yapılandırılmış veri eksik`);
  if(rel==='gezi-rehberi.html'||rel.startsWith('gezi-rehberi/')){
    if(!html.includes('Gezi Rehberi</a>')) errors.push(`${rel}: menü bağlantısı eksik`);
    for(const m of html.matchAll(/(?:href|src)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)){
      const target=m[1]==='/'?path.join(root,'index.html'):path.join(root,m[1].slice(1));
      if(!fs.existsSync(target)) errors.push(`${rel}: kırık yerel bağlantı ${m[1]}`);
    }
  }
}
const guides=files.filter(x=>x.includes('/gezi-rehberi/')).length;
if(guides<20) errors.push(`En az 20 rehber bekleniyordu, bulunan: ${guides}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`${files.length} HTML dosyası ve ${guides} rehber kontrol edildi.`);

// Crawlability is checked against raw HTML, without running client-side scripts.
const origin='https://www.geziplatformuu.com';
const nonIndexable=new Set(['404.html','sepet.html','rezervasyon.html']);
const seoErrors=[];
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const sitemapUrls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const titles=new Set();let trips=0;
for(const file of files){
 const rel=path.relative(root,file),html=fs.readFileSync(file,'utf8'),url=origin+(rel==='index.html'?'/':'/'+rel);
 const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
 if(!title||titles.has(title))seoErrors.push(`${rel}: missing or duplicate title`);titles.add(title);
 for(const key of ['description','robots','og:title','og:description','og:url','og:image','twitter:card']){
  if(!new RegExp(`<meta\\b[^>]*(?:name|property)="${key}"[^>]*content="[^"]+"`).test(html))seoErrors.push(`${rel}: ${key} missing`);
 }
 if(!html.includes(`rel="canonical" href="${url}"`))seoErrors.push(`${rel}: incorrect canonical`);
 if(!nonIndexable.has(rel)&&!/(?:googletagmanager\.com|src=["']\/?ga4\.js)/.test(html))seoErrors.push(`${rel}: analytics missing`);
 if(nonIndexable.has(rel)){
  if(!html.includes('content="noindex,follow"')||sitemapUrls.includes(url))seoErrors.push(`${rel}: private page indexing policy`);
  continue;
 }
 if(!sitemapUrls.includes(url))seoErrors.push(`${rel}: absent from sitemap`);
 const schemas=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)];
 if(schemas.length!==1)seoErrors.push(`${rel}: expected one consolidated schema`);
 for(const [,raw] of schemas){
  let graph;try{graph=JSON.parse(raw)['@graph']}catch{seoErrors.push(`${rel}: invalid JSON-LD`);continue}
  const ids=graph.map(x=>x['@id']);if(new Set(ids).size!==ids.length)seoErrors.push(`${rel}: duplicate schema IDs`);
  const trip=graph.find(x=>x['@type']==='TouristTrip');
  if(trip){trips++;if(!trip.provider?.name)seoErrors.push(`${rel}: missing tour provider`);for(const offer of trip.offers||[])if(!/^\d+(\.\d+)?$/.test(offer.price)||offer.priceCurrency!=='TRY')seoErrors.push(`${rel}: invalid price`)}
  const article=graph.find(x=>x['@type']==='BlogPosting');if(rel.startsWith('gezi-rehberi/')&&(!article?.author?.url||!article.publisher?.name||!article.mainEntityOfPage?.['@id']))seoErrors.push(`${rel}: incomplete article identity`);
 }
 for(const m of html.matchAll(/(?:href|src)="([^"?#]+)(?:[?#][^"]*)?"/g)){
  const h=m[1];if(/^(?:[a-z]+:|#|\/\/)/i.test(h)||h.startsWith('/api/'))continue;
  const target=h==='/'?path.join(root,'index.html'):h.startsWith('/')?path.join(root,h.slice(1)):path.resolve(path.dirname(file),h);
  if(!fs.existsSync(target))seoErrors.push(`${rel}: broken internal link ${h}`);
 }
}
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
if((home.match(/<article class="tour-card"/g)||[]).length<10)seoErrors.push('Home tour cards are not in raw HTML');
if(trips!==14)seoErrors.push(`Expected 14 structured tours, found ${trips}`);
if(new Set(sitemapUrls).size!==sitemapUrls.length)seoErrors.push('Duplicate sitemap URLs');
for(const url of sitemapUrls){const rel=url.replace(origin+'/','')||'index.html';if(!files.includes(path.join(root,rel)))seoErrors.push(`Sitemap target missing: ${url}`)}
if(fs.readFileSync(path.join(root,'site-controls.js'),'utf8').includes('loadTourSeo'))seoErrors.push('Obsolete runtime SEO override remains');
if(seoErrors.length){console.error(seoErrors.join('\n'));process.exit(1)}
console.log(`SEO: ${sitemapUrls.length} public URLs, ${trips} tours, metadata, schemas and internal links verified.`);

// Regression checks for the October 2026 SEO release.
const releaseErrors=[];
const cityFiles=['mersin-cikisli-turlar.html','adana-cikisli-turlar.html','nigde-cikisli-turlar.html'];
const archives=new Set(['buyuk-bati-karadeniz.html','kayseri-doga-turu.html','hatay-turu.html']);
for(const file of files){
 const rel=path.relative(root,file),html=fs.readFileSync(file,'utf8');
 const raw=html.match(/id="gp-static-schema">(.*?)<\/script>/s)?.[1];if(!raw)continue;
 const graph=JSON.parse(raw)['@graph'];const trip=graph.find(n=>n['@type']==='TouristTrip');if(!trip)continue;
 const headings=[...html.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gs)];
 if(headings.length!==1||headings[0][1]!==trip.name)releaseErrors.push(`${rel}: tour/H1 identity mismatch`);
 if(!trip.tripOrigin?.length)releaseErrors.push(`${rel}: missing departure places`);
 if(!html.includes('id="seo-tour-cities"')||!html.includes('id="seo-tour-peers"'))releaseErrors.push(`${rel}: missing tour navigation`);
 if(archives.has(rel)&&(!html.includes('Geçmiş tur programı')||trip.offers?.length))releaseErrors.push(`${rel}: past tour advertised as current offer`);
 if(rel==='dogu-ekspresi.html'){
  if(!html.includes('Hareket tarihinin yılını teyit edin'))releaseErrors.push('Winter: year ambiguity undisclosed');
  if(JSON.stringify(trip.offers.map(o=>o.price))!==JSON.stringify(['13499','13999','16500','13499','14999']))releaseErrors.push('Winter: published prices changed');
 }
}
for(const city of cityFiles){const html=fs.readFileSync(path.join(root,city),'utf8');for(const archive of archives)if(html.includes(`href="/${archive}"`)||html.includes(`href="${archive}"`))releaseErrors.push(`${city}: archived tour in current listing`)}
const config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
const redirects=new Set();
for(const rule of config.redirects){
 if(redirects.has(rule.source))releaseErrors.push(`Duplicate redirect ${rule.source}`);redirects.add(rule.source);
 if(['/post/:path*','/product-page/:path*'].includes(rule.source))releaseErrors.push('Unknown Wix URL redirects to unrelated content');
 if(rule.destination.startsWith('/')&&!fs.existsSync(path.join(root,rule.destination.split('#')[0].slice(1)||'index.html')))releaseErrors.push(`Broken redirect ${rule.source}`);
 if(rule.source===rule.destination)releaseErrors.push(`Redirect loop ${rule.source}`);
}
if(!fs.readFileSync(path.join(root,'robots.txt'),'utf8').includes(`Sitemap: ${origin}/sitemap.xml`))releaseErrors.push('robots sitemap mismatch');
if(releaseErrors.length){console.error(releaseErrors.join('\n'));process.exit(1)}
console.log('Release checks: tour H1/schema, preserved winter prices, archives and legacy redirects passed.');
