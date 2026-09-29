// Offline support: the page and its files are cached on first visit, then served from the cache.
// Bump VERSION whenever you publish an update so phones pick up the new files.
const VERSION='room-v2';
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const FONT_HOSTS=['fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET')return;
  // web fonts: cache them the first time so the dot font also shows offline
  if(FONT_HOSTS.includes(u.host)){e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const c=res.clone();caches.open(VERSION).then(x=>x.put(e.request,c));return res})));return}
  if(u.origin!==location.origin)return;
  // the page itself: try the network first so updates show up, fall back to the cache when offline
  if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));return}
  // everything else (fonts, icons, sounds): cache first, fill the cache as files are used
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const c=res.clone();caches.open(VERSION).then(x=>x.put(e.request,c))}return res})))});
