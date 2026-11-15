import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {host,key}=JSON.parse(read('scripts/indexnow.json'));
if(host!=='www.geziplatformuu.com'||!/^[a-f0-9]{32}$/.test(key))throw new Error('Unexpected IndexNow configuration');
const origin=`https://${host}`;
const state=JSON.parse(read('scripts/seo-state.json'));
const baseline=process.argv.find(a=>a.startsWith('--since='))?.slice(8)||'HEAD^';
if(!/^[a-zA-Z0-9^~/.\-]+$/.test(baseline)||baseline.startsWith('-'))throw new Error('Invalid base revision');
let previous={};
try{previous=JSON.parse(execFileSync('git',['show',`${baseline}:scripts/seo-state.json`],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}));}catch{
 console.log('No previous discovery snapshot; preparing initial public URL notification.');
}
const changed=Object.keys(state).filter(f=>state[f].hash!==previous[f]?.hash);
const removed=Object.keys(previous).filter(f=>!state[f]);
const urlList=[...new Set([...changed,...removed].map(f=>origin+(f==='index.html'?'/':'/'+f)))];
const payload={host,key,keyLocation:`${origin}/${key}.txt`,urlList};
if(process.argv.includes('--dry-run')){
 console.log(JSON.stringify({endpoint:'https://api.indexnow.org/indexnow',count:urlList.length,urls:urlList},null,2));
 process.exit(0);
}
if(!urlList.length){console.log('No changed public URLs to notify.');process.exit(0);}
// Do not notify search engines about an unpublished or superseded checkout.
const published=await fetch(`${origin}/scripts/seo-state.json`,{cache:'no-store',signal:AbortSignal.timeout(20000)});
if(!published.ok)throw new Error(`Live discovery snapshot returned HTTP ${published.status}`);
const live=await published.json();
if(JSON.stringify(live)!==JSON.stringify(state))throw new Error('Live site does not match this checkout; no URLs submitted');
const ownership=await fetch(payload.keyLocation,{cache:'no-store',signal:AbortSignal.timeout(20000)});
if(!ownership.ok||(await ownership.text()).trim()!==key)throw new Error('Live ownership file could not be verified');
const response=await fetch('https://api.indexnow.org/indexnow',{
 method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},
 body:JSON.stringify(payload),signal:AbortSignal.timeout(30000)
});
if(![200,202].includes(response.status))throw new Error(`IndexNow returned HTTP ${response.status}: ${(await response.text()).slice(0,300)}`);
console.log(`IndexNow HTTP ${response.status}: ${urlList.length} changed/removed URLs received${response.status===202?' (ownership validation pending)':''}. This is not an indexing or ranking confirmation.`);
