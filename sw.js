/* Service worker · Fenice Roma Pallavolo
   - la pagina si scarica sempre aggiornata dalla rete (se c'è), altrimenti si apre dalla copia salvata
   - l'ultimo calendario scaricato resta disponibile anche senza rete
   - librerie salvate per aprire l'app più in fretta */
const V='fenice-v1',SHELL=['./','icon-192.png','icon-512.png'];
const LIBS=['www.gstatic.com','fonts.googleapis.com','fonts.gstatic.com','cdn.jsdelivr.net'];
const SHEET=['script.google.com','script.googleusercontent.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(k=>k.put('./',c));return x}).catch(()=>caches.match('./')));
    return;
  }
  if(SHEET.includes(u.hostname)){
    const key=u.origin+u.pathname;
    e.respondWith(fetch(r).then(x=>{if(x&&x.ok){const c=x.clone();caches.open(V).then(k=>k.put(key,c))}return x}).catch(()=>caches.match(key).then(h=>h||Response.error())));
    return;
  }
  if(u.origin===location.origin||LIBS.includes(u.hostname)){
    e.respondWith(caches.match(r).then(hit=>{
      const net=fetch(r).then(x=>{if(x&&(x.ok||x.type==='opaque')){const c=x.clone();caches.open(V).then(k=>k.put(r,c))}return x}).catch(()=>hit);
      return hit||net;
    }));
  }
});
