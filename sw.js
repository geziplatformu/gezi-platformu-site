const CACHE='gp-pwa-v3';
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['/','/favicon-192.png?v=20260821','/assets/gezi-platformu-logo.webp'])).catch(()=>{}));});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('gp-pwa-')&&key!==CACHE).map(key=>caches.delete(key))))]));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||event.request.mode!=='navigate')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||url.pathname.startsWith('/admin/')||url.pathname.startsWith('/api/'))return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok&&url.pathname==='/'){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('/',copy)).catch(()=>{}));}
    return response;
  }).catch(async()=>await caches.match('/')||new Response('İnternet bağlantınızı kontrol edip tekrar deneyin.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})));
});
