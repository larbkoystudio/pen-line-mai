const CACHE='penline-v3';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const put=res=>{if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c))}return res};
  // The app page itself: network first so new versions show up on the next open; cache when offline.
  if(req.mode==='navigate'||req.destination==='document'){
    e.respondWith(fetch(req).then(put).catch(()=>caches.match(req).then(h=>h||caches.match('./index.html'))));
    return;
  }
  // Everything else (icons, fonts): cache first, refresh in the background.
  e.respondWith(caches.match(req).then(hit=>{const net=fetch(req).then(put).catch(()=>hit);return hit||net}));
});
