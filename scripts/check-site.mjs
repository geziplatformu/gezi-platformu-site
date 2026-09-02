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
