
/* TOEFL 2026 — Local-first offline cache / first-visit warmer */

const CACHE_VERSION='toefl26-cache-20260908-mobile-pwa1';
const MINIMUM_SHELL=[
  './',
  'index.html',
  'task-explorer.html',
  'practice-packs.html',
  'writing-practice.html',
  'speaking-practice.html',
  'styles.css',
  'branding.css',
  'visuals.css',
  'site-tree-nav.css',
  'task-explorer.css',
  'practice-pack.css',
  'retromax.js',
  'app.js',
  'task-explorer.js',
  'practice-pack.js',
  'practice-data.js',
  'boot.css',
  'mobile-pwa.css',
  'mobile-pwa.js',
  'manifest.webmanifest',
  'pets.css',
  'pets.js',
  'toefl-2026-logo-header.webp',
  'toefl-2026-master-guide-logo.webp',
  'toefl-2026-favicon.webp',
  'toefl-2026-favicon-192.png',
  'toefl-2026-favicon-512.png',
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'assets/visuals/toefl-2026-hero.webp',
  'assets/visuals/task-explorer-hero.webp',
  'assets/visuals/practice-hub-hero.webp',
  'assets/visuals/writing-lab-hero.webp',
  'assets/visuals/speaking-lab-hero.webp',
  'assets/speaking-page-4-visual.png',
  'assets/speaking-page-5-visual.png',
  'assets/speaking-page-6-visual.png',
  'assets/speaking-page-7-visual.png',
  'assets/speaking-page-8-visual.png',
  'assets/speaking-page-9-visual.png',
  'assets/speaking-page-10-visual.png',
  'assets/speaking-page-11-visual.png',
  'assets/speaking-page-12-visual.png',
  'assets/speaking-page-13-visual.png'
];

function scopedUrl(path){
  try{return new URL(path,self.registration.scope).toString()}
  catch{return path}
}

async function cacheOne(cache,path){
  const url=scopedUrl(path);
  try{
    const request=new Request(url,{cache:'reload',credentials:'same-origin'});
    const response=await fetch(request);
    if(response && (response.ok || response.type==='opaque')){
      await cache.put(request,response.clone());
      return true;
    }
  }catch{}
  return false;
}

async function warmAssets(assets,port,quiet=false){
  const list=[...new Set((assets||[]).filter(Boolean))];
  const cache=await caches.open(CACHE_VERSION);
  let done=0;
  let cached=0;
  let failed=0;

  for(const asset of list){
    const ok=await cacheOne(cache,asset);
    done+=1;
    if(ok) cached+=1;
    else failed+=1;

    if(port && !quiet){
      port.postMessage({
        type:'CACHE_PROGRESS',
        asset,
        done,
        total:list.length,
        cached,
        failed
      });
    }
  }

  port?.postMessage({
    type:'CACHE_DONE',
    done,
    total:list.length,
    cached,
    failed
  });
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_VERSION);
    for(const asset of MINIMUM_SHELL){
      await cacheOne(cache,asset);
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(
      keys
        .filter(key=>key.startsWith('toefl26-cache-') && key!==CACHE_VERSION)
        .map(key=>caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  const data=event.data||{};

  if(data.type==='WARM_CACHE'){
    const port=event.ports?.[0];
    event.waitUntil(warmAssets(data.assets,port,Boolean(data.quiet)));
    return;
  }

  if(data.type==='SKIP_WAITING'){
    self.skipWaiting();
  }
});

async function networkFirst(request){
  const cache=await caches.open(CACHE_VERSION);

  try{
    const response=await fetch(request);
    if(response && response.ok){
      cache.put(request,response.clone()).catch(()=>{});
    }
    return response;
  }catch{
    const cached=
      await cache.match(request) ||
      await cache.match(request,{ignoreSearch:true});

    if(cached) return cached;

    const url=new URL(request.url);
    if(url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')){
      const fallback=
        await cache.match(scopedUrl('index.html'),{ignoreSearch:true}) ||
        await cache.match(scopedUrl('./'),{ignoreSearch:true});
      if(fallback) return fallback;
    }

    throw new Error('Offline and resource not cached');
  }
}

async function staleWhileRevalidate(request){
  const cache=await caches.open(CACHE_VERSION);
  const cached=
    await cache.match(request) ||
    await cache.match(request,{ignoreSearch:true});

  const network=fetch(request)
    .then(response=>{
      if(response && response.ok){
        cache.put(request,response.clone()).catch(()=>{});
      }
      return response;
    })
    .catch(()=>null);

  return cached || network || Response.error();
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;

  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;

  if(request.mode==='navigate'){
    event.respondWith(networkFirst(request));
    return;
  }

  const cacheableDestinations=new Set([
    'style','script','image','font','audio','video'
  ]);

  if(cacheableDestinations.has(request.destination) ||
     /\.(?:css|js|json|png|jpe?g|webp|ico|svg|woff2?|mp3|m4a|wav)$/i.test(url.pathname)){
    event.respondWith(staleWhileRevalidate(request));
  }
});
