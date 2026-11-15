import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {business} from './discovery-content.mjs';
const root=path.resolve(import.meta.dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const origin='https://www.geziplatformuu.com';
const state=JSON.parse(read('scripts/seo-state.json'));
const schemas=html=>JSON.parse(html.match(/id="gp-static-schema">(.*?)<\/script>/s)[1])['@graph'];
const htmlByFile=new Map(Object.keys(state).map(f=>[f,read(f)]));
const decode=s=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const plain=s=>decode(s.replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
let questionCount=0;
for(const [f,html] of htmlByFile){
 assert.equal(createHash('sha256').update(html.replace(/\s+/g,' ').trim()).digest('hex'),state[f].hash,`${f}: stale published snapshot; regenerate SEO`);
 const graph=schemas(html);
 assert.deepEqual(graph.find(n=>n['@type']==='TravelAgency'),business,`${f}: inconsistent agency identity`);
 assert.equal((html.match(/src="\/?ga4\.js/g)||[]).length,1,`${f}: analytics loader duplicated or missing`);
 assert.ok(!html.includes('googletagmanager.com/gtag/js'),`${f}: duplicate analytics setup`);
 const faq=graph.find(n=>n['@type']==='FAQPage');
 for(const q of faq?.mainEntity||[]){
  assert.ok(plain(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'')).includes(q.name),`${f}: question missing from visible content`);
  assert.ok(plain(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'')).includes(q.acceptedAnswer.text),`${f}: schema answer differs from visible content`);
  questionCount++;
 }
 if(state[f].lastmod){
  assert.match(state[f].lastmod,/^\d{4}-\d{2}-\d{2}$/);
  assert.ok(state[f].lastmod<=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul'}).format(new Date()),`${f}: future freshness date`);
 }
}
const context=vm.createContext({window:{}});
for(const f of ['tours.js','tours-extra.js','tour-images.js'])vm.runInContext(read(f),context);
vm.runInContext(read('app.js').split('const core=')[0],context);
const calendar=vm.createContext({window:{},document:{getElementById:()=>null,querySelectorAll:()=>[]},Intl,Date});
vm.runInContext(read('app-core.js').split('function tourCard')[0],calendar);
const active=context.window.TOURS.filter(t=>{
 calendar.tour=t;
 return Boolean(t.scheduleYear||/20\d{2}/.test(t.dates||''))&&Boolean(vm.runInContext('nearestTourDate(tour)',calendar));
});
const routePage=read('tur-rotalari.html');
for(const t of active){
 const detail=read(t.detailUrl),trip=schemas(detail).find(n=>n['@type']==='TouristTrip');
 assert.ok(routePage.includes(`id="rota-${t.id}"`),`${t.id}: missing route`);
 assert.ok(trip.itinerary?.itemListElement.length,`${t.id}: missing route places`);
 assert.equal(schemas(detail).find(n=>n['@type']==='FAQPage').mainEntity.length,3);
 for(const offer of trip.offers){
  const formatted=new Intl.NumberFormat('tr-TR').format(Number(offer.price));
  assert.ok(routePage.includes(formatted),`${t.id}: route price missing`);
 }
}
for(const f of ['mersin-cikisli-turlar.html','adana-cikisli-turlar.html','nigde-cikisli-turlar.html']){
 assert.ok(!/GAP|Sivas|2026/.test(read(f).match(/<meta name="description" content="([^"]*)"/)[1]),`${f}: stale city description`);
 assert.ok(!read(f).includes('href="/mardin-midyat-turu.html"'),`${f}: unconfirmed year advertised`);
}
assert.ok(!schemas(read('mardin-midyat-turu.html')).find(n=>n['@type']==='TouristTrip').offers, 'Unconfirmed program must not publish current offers');
// Every indexable page must be discoverable from actual HTML links, without JS.
const visited=new Set(),queue=['index.html'];
while(queue.length){
 const f=queue.shift();if(visited.has(f))continue;visited.add(f);
 for(const [,href] of (htmlByFile.get(f)||'').matchAll(/<a\b[^>]*href="([^"]+)"/g)){
  const u=new URL(decode(href),origin+(f==='index.html'?'/':'/'+f));if(u.origin!==origin)continue;
  const target=u.pathname==='/'?'index.html':decodeURIComponent(u.pathname.slice(1));
  if(htmlByFile.has(target)&&!visited.has(target))queue.push(target);
 }
}
assert.equal(visited.size,htmlByFile.size,`Orphan indexable pages: ${[...htmlByFile.keys()].filter(f=>!visited.has(f)).join(', ')}`);
// Exercise measurement behavior, including a lookalike host and nested link click.
function tracking(referrer,href){
 const listeners={};const window={};const document={referrer,createElement:()=>({}),head:{appendChild(){}},addEventListener:(event,cb)=>listeners[event]=cb};
 vm.runInNewContext(read('ga4.js'),{window,document,URL});
 if(href)listeners.click({target:{closest:()=>({getAttribute:()=>href})}});
 return window.dataLayer.map(x=>Array.from(x));
}
assert.ok(tracking('https://chatgpt.com/').some(x=>x[1]==='ai_referral'));
assert.ok(!tracking('https://evilchatgpt.com/').some(x=>x[1]==='ai_referral'));
assert.equal(tracking('', 'https://wa.me/905374978441').find(x=>x[1]==='contact_click')[2].contact_method,'whatsapp');
assert.ok(!tracking('', 'https://wa.me.example.org/').some(x=>x[1]==='contact_click'));
console.log(`Discovery: ${visited.size} reachable public pages, ${active.length} current routes, ${questionCount} visible/schema-matched answers and referral/contact measurement verified.`);
