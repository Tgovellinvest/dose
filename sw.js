const C='dose-v4.4';
const F=['./','./index.html','./styles.css','./app.js','./views.js','./views2.js','./generator.js','./coach.js','./features.js','./cloud.js','./share.js','./grupos.js','./v3.js','./v4.js','./data/v3data.js','./ads.js','./icons.js','./onboard.js','./data/sports2.js','./data/exercises.js','./data/programs.js','./data/foods.js','./data/foods2.js','./data/foods3.js','./data/foods_marcas.js','./manifest.json','./icon.svg','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./termos.html','./privacidade.html','./legal.css'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F).catch(()=>{})).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// Network-first para o próprio site (sempre a versão nova quando há rede); cache como fallback offline.
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET') return; const own=e.request.url.startsWith(self.location.origin);
  if(own){ e.respondWith(fetch(e.request).then(res=>{ if(res.ok){ const cl=res.clone(); caches.open(C).then(c=>c.put(e.request,cl)); } return res; }).catch(()=>caches.match(e.request))); }
  else if(/cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com|youtube\.com\/iframe_api/.test(e.request.url)){ e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{ if(res.ok){ const cl=res.clone(); caches.open(C).then(c=>c.put(e.request,cl)); } return res; }).catch(()=>r))); }
  // Qualquer outra origem (Supabase, YouTube embed etc.): rede direta, nunca cache.
});
