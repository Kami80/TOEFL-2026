(function(){
  'use strict';

  const qs=(s,r=document)=>r.querySelector(s);

  /* =========================================================
     TOEFL 2026 FAVICON FIX
     Registers explicit browser-tab icons on every page.
     ========================================================= */
  function ensureRetroFavicon(){
    if(!document.head) return;

    const version='20260818-favicon3';
    const managed='data-toefl-favicon';

    // Remove only favicon links managed by this layer, then rebuild them.
    document.head.querySelectorAll(`link[${managed}]`).forEach(el=>el.remove());

    const add=(rel,href,type,sizes)=>{
      const link=document.createElement('link');
      link.rel=rel;
      link.href=`${href}?v=${version}`;
      if(type) link.type=type;
      if(sizes) link.sizes=sizes;
      link.setAttribute(managed,'true');
      document.head.appendChild(link);
    };

    // Explicit small PNGs are intentionally listed first for reliable tab rendering.
    add('icon','favicon-32x32.png','image/png','32x32');
    add('icon','favicon-16x16.png','image/png','16x16');
    add('shortcut icon','favicon.ico','image/x-icon');
    add('icon','toefl-2026-favicon-512.png','image/png','512x512');
    add('apple-touch-icon','apple-touch-icon.png','image/png','180x180');
  }

  ensureRetroFavicon();


  /* =========================================================
     TOEFL 2026 FIRST-VISIT RETRO BOOT + SMART CACHE
     - Full boot only on first visit for this boot version.
     - Real cache progress through service-worker messages.
     - Returning visits warm the cache silently.
     - ?boot=1 previews the boot screen again.
     ========================================================= */
  const TOEFL_BOOT_VERSION='20260818-boot1';
  const TOEFL_BOOT_KEY='toefl26:first-boot:'+TOEFL_BOOT_VERSION;
  const TOEFL_CACHE_ASSETS=[
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
    'pets.css',

    'app.js',
    'retromax.js',
    'task-explorer.js',
    'practice-pack.js',
    'practice-data.js',
    'pets.js',

    'toefl-2026-logo-header.webp',
    'toefl-2026-master-guide-logo.webp',
    'toefl-2026-favicon.webp',
    'toefl-2026-favicon-512.png',
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png',

    'assets/visuals/toefl-2026-hero.webp',
    'assets/visuals/task-explorer-hero.webp',
    'assets/visuals/practice-hub-hero.webp',
    'assets/visuals/writing-lab-hero.webp',
    'assets/visuals/speaking-lab-hero.webp'
  ];

  function bootSafeGet(key){
    try{return localStorage.getItem(key)}catch{return null}
  }

  function bootSafeSet(key,value){
    try{localStorage.setItem(key,value)}catch{}
  }

  function ensureBootStyles(){
    if(!document.head||document.querySelector('link[data-toefl-boot-style]')) return;
    const critical=document.createElement('style');
    critical.dataset.toeflBootCritical='true';
    critical.textContent='#toefl-first-boot{position:fixed;inset:0;z-index:2147483600;display:grid;place-items:center;background:#080b28;color:#fff;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}';
    document.head.appendChild(critical);

    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='boot.css?v='+TOEFL_BOOT_VERSION;
    link.dataset.toeflBootStyle='true';
    document.head.appendChild(link);
  }

  function registerToeflServiceWorker(){
    if(!('serviceWorker' in navigator)) return Promise.resolve(null);
    if(location.protocol==='file:') return Promise.resolve(null);
    return navigator.serviceWorker
      .register('./service-worker.js?v='+TOEFL_BOOT_VERSION,{scope:'./'})
      .then(()=>navigator.serviceWorker.ready)
      .catch(()=>null);
  }

  function warmCacheThroughWorker(registration,assets,onProgress,timeoutMs=6500){
    if(!registration?.active||typeof MessageChannel==='undefined'){
      return Promise.resolve({cached:0,total:assets.length,available:false});
    }

    return new Promise(resolve=>{
      const channel=new MessageChannel();
      let settled=false;
      const finish=value=>{
        if(settled) return;
        settled=true;
        clearTimeout(timer);
        try{channel.port1.close()}catch{}
        resolve(value);
      };

      const timer=setTimeout(
        ()=>finish({cached:0,total:assets.length,available:true,timedOut:true}),
        timeoutMs
      );

      channel.port1.onmessage=event=>{
        const data=event.data||{};
        if(data.type==='CACHE_PROGRESS'){
          onProgress?.(data);
        }else if(data.type==='CACHE_DONE'){
          onProgress?.(data);
          finish({
            cached:data.cached||0,
            total:data.total||assets.length,
            failed:data.failed||0,
            available:true
          });
        }
      };

      try{
        registration.active.postMessage(
          {type:'WARM_CACHE',assets},
          [channel.port2]
        );
      }catch{
        finish({cached:0,total:assets.length,available:false});
      }
    });
  }

  function backgroundWarmCache(){
    registerToeflServiceWorker().then(reg=>{
      if(!reg?.active) return;
      const saveData=navigator.connection?.saveData;
      const connection=String(navigator.connection?.effectiveType||'');
      if(saveData||connection.includes('2g')) return;

      try{
        const channel=new MessageChannel();
        channel.port1.onmessage=event=>{
          if(event.data?.type==='CACHE_DONE'){
            try{channel.port1.close()}catch{}
          }
        };
        reg.active.postMessage(
          {type:'WARM_CACHE',assets:TOEFL_CACHE_ASSETS,quiet:true},
          [channel.port2]
        );
      }catch{}
    });
  }

  function createRetroBoot(){
    if(!document.body||document.getElementById('toefl-first-boot')) return null;

    const overlay=document.createElement('div');
    overlay.id='toefl-first-boot';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Preparing TOEFL 2026');
    overlay.innerHTML=`
      <div class="toefl-boot-noise" aria-hidden="true"></div>
      <section class="toefl-boot-window">
        <header class="toefl-boot-titlebar">
          <div class="toefl-boot-brand">
            <img src="toefl-2026-logo-header.webp" alt="" width="54" height="54">
            <span>
              <b>TOEFL OS // 2026</b>
              <small>RETRO STUDY SYSTEM v2.6</small>
            </span>
          </div>
          <div class="toefl-boot-window-buttons" aria-hidden="true">
            <i></i><i></i><i></i>
          </div>
        </header>

        <div class="toefl-boot-body">
          <div class="toefl-boot-display">
            <span class="toefl-boot-kicker">FIRST RUN INITIALIZATION</span>
            <h1>Preparing your<br><em>study station.</em></h1>
            <p class="toefl-boot-message" aria-live="polite">Checking local study space…</p>

            <div class="toefl-boot-progress-shell" aria-label="Loading progress">
              <div class="toefl-boot-progress" style="--boot-progress:2%"></div>
              <span class="toefl-boot-percent">02%</span>
            </div>

            <div class="toefl-boot-pixels" aria-hidden="true">
              <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
            </div>
          </div>

          <div class="toefl-boot-console">
            <div class="toefl-boot-console-head">
              <span>SYSTEM CHECK</span>
              <b>LOCAL-FIRST MODE</b>
            </div>

            <ul class="toefl-boot-steps">
              <li data-boot-step="save"><i></i><span>LOCAL SAVE</span><b>WAIT</b></li>
              <li data-boot-step="ui"><i></i><span>CORE INTERFACE</span><b>WAIT</b></li>
              <li data-boot-step="worker"><i></i><span>OFFLINE ENGINE</span><b>WAIT</b></li>
              <li data-boot-step="cache"><i></i><span>APP + PRACTICE CACHE</span><b>WAIT</b></li>
              <li data-boot-step="ready"><i></i><span>STUDY SYSTEM</span><b>WAIT</b></li>
            </ul>

            <div class="toefl-boot-cache-note">
              <span class="toefl-boot-led"></span>
              <p>No tracking cookies are required. Progress, notes and preferences stay in browser storage.</p>
            </div>
          </div>
        </div>

        <footer class="toefl-boot-footer">
          <span class="toefl-boot-tip">TIP // returning visits use the local cache</span>
          <button type="button" class="toefl-boot-skip">SKIP INTRO →</button>
        </footer>
      </section>
    `;

    document.body.prepend(overlay);
    document.documentElement.classList.add('toefl-boot-active');
    return overlay;
  }

  function runFirstVisitBoot(){
    ensureBootStyles();

    const params=new URLSearchParams(location.search);
    const force=params.get('boot')==='1';
    const firstVisit=bootSafeGet(TOEFL_BOOT_KEY)!=='done';

    if(!force&&!firstVisit){
      backgroundWarmCache();
      return;
    }

    const overlay=createRetroBoot();
    if(!overlay){
      backgroundWarmCache();
      return;
    }

    const started=performance.now();
    const percent=overlay.querySelector('.toefl-boot-percent');
    const meter=overlay.querySelector('.toefl-boot-progress');
    const message=overlay.querySelector('.toefl-boot-message');
    const skip=overlay.querySelector('.toefl-boot-skip');
    let finished=false;
    let currentProgress=2;

    const setProgress=(value,text)=>{
      currentProgress=Math.max(currentProgress,Math.min(100,Math.round(value)));
      meter?.style.setProperty('--boot-progress',currentProgress+'%');
      if(percent) percent.textContent=String(currentProgress).padStart(2,'0')+'%';
      if(text&&message) message.textContent=text;
    };

    const setStep=(name,state,label)=>{
      const row=overlay.querySelector('[data-boot-step="'+name+'"]');
      if(!row) return;
      row.dataset.state=state;
      const value=row.querySelector('b');
      if(value) value.textContent=label||(state==='done'?'OK':state==='warn'?'SKIP':'WAIT');
    };

    const closeBoot=async(markSeen=true)=>{
      if(finished) return;
      finished=true;
      if(markSeen&&!force) bootSafeSet(TOEFL_BOOT_KEY,'done');
      else if(markSeen&&force&&firstVisit) bootSafeSet(TOEFL_BOOT_KEY,'done');

      setProgress(100,'SYSTEM READY // Welcome to TOEFL 2026');

      const elapsed=performance.now()-started;
      const minimum=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:520;
      if(elapsed<minimum){
        await new Promise(resolve=>setTimeout(resolve,minimum-elapsed));
      }

      overlay.classList.add('is-complete');
      document.documentElement.classList.remove('toefl-boot-active');
      setTimeout(()=>overlay.remove(),window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:260);
    };

    skip?.addEventListener('click',()=>{
      setStep('cache','warn','BG');
      setStep('ready','done','GO');
      closeBoot(true);
      backgroundWarmCache();
    });

    (async()=>{
      setStep('save','done','OK');
      setProgress(10,'Local study storage ready.');

      setStep('ui','done','OK');
      setProgress(20,'Core interface loaded.');

      const registration=await registerToeflServiceWorker();

      if(registration?.active){
        setStep('worker','done','ON');
        setProgress(28,'Offline engine connected.');

        const result=await warmCacheThroughWorker(
          registration,
          TOEFL_CACHE_ASSETS,
          data=>{
            if(data.type!=='CACHE_PROGRESS') return;
            const ratio=data.total?data.done/data.total:0;
            const mapped=30+(ratio*62);
            setProgress(
              mapped,
              'Caching '+String(data.done).padStart(2,'0')+
              ' / '+String(data.total).padStart(2,'0')+
              ' · '+(data.asset||'study files')
            );
          }
        );

        if(result.timedOut){
          setStep('cache','warn','BG');
          setProgress(92,'Main interface ready. Remaining files will cache quietly.');
          backgroundWarmCache();
        }else{
          setStep('cache','done',String(result.cached||0).padStart(2,'0'));
          setProgress(94,'Practice pages and pixel assets cached.');
        }
      }else{
        setStep('worker','warn',location.protocol==='file:'?'FILE':'N/A');
        setStep('cache','warn','LIVE');
        setProgress(92,location.protocol==='file:'
          ? 'Local file mode detected. Use a local web server for offline caching.'
          : 'Browser cache will handle this session.');
      }

      setStep('ready','done','GO');
      setProgress(100,'SYSTEM READY // You got this!');
      await closeBoot(true);
    })().catch(()=>{
      setStep('worker','warn','N/A');
      setStep('cache','warn','LIVE');
      setStep('ready','done','GO');
      setProgress(100,'SYSTEM READY // Continuing with available content.');
      closeBoot(true);
    });
  }

  runFirstVisitBoot();


  const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));

  function ready(fn){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }

  function make(tag,className,text){
    const el=document.createElement(tag);
    if(className) el.className=className;
    if(text!=null) el.textContent=text;
    return el;
  }
  function applyReadableText(root=document){
    const selectors=[
      'p','li','blockquote',
      '.task-description','.profile-overview','.source-note','.answer-box','.feedback',
      '.transcript-box','.sample-panel p','.hub-card p','.pack-footer p','.faq-list article>p',
      '.atlas-heading>p','.detail-description','.example-desk>p','.template-source p',
      '.move-notes p','.strategy-grid p','.strategy-grid li','.model-grid p',
      '.speaking-prompt p','.speech-coaching p','.repeat-copy p','.source-ledger b'
    ];
    qsa(selectors.join(','),root).forEach(el=>{
      if(el.closest('button,a,nav,.annotation-toolbar')) return;
      el.classList.add('justify-copy');
    });
  }
  function addStickerRail(target,labels){
    if(!target || target.querySelector(':scope > .retro-sticker-rail')) return;
    const rail=make('div','retro-sticker-rail');
    labels.forEach((label,i)=>rail.appendChild(make('span','retro-chip chip-'+((i%4)+1),label)));
    target.appendChild(rail);
  }
  /* =========================================================
     TOEFL 2026 PAGE VISUALS
     Shared WebP art integration. Keeps HTML files untouched.
     ========================================================= */
  function ensureVisualStyles(){
    if(qs('link[data-toefl-visuals]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='visuals.css?v=20260818-visuals1';
    link.dataset.toeflVisuals='true';
    document.head.appendChild(link);
  }

  function visualImage(src,alt){
    const img=new Image();
    img.loading='eager';
    img.decoding='async';
    img.alt=alt;
    img.src=src;
    return img;
  }

  function visualFigure(className,src,alt){
    const figure=make('figure','site-page-visual '+className);
    figure.appendChild(visualImage(src,alt));
    return figure;
  }

  function injectGuideVisual(){
    const host=qs('.hero-visual');
    if(!host || qs('.site-page-visual',host)) return false;
    host.classList.add('has-site-visual');
    host.appendChild(
      visualFigure(
        'site-page-visual--guide',
        'assets/visuals/toefl-2026-hero.webp',
        'Retro pixel TOEFL 2026 study dashboard'
      )
    );
    return true;
  }

  function injectAtlasVisual(){
    const host=qs('.retro-pack-art.atlas-console');
    if(!host || host.dataset.visualEnhanced==='true') return;
    host.dataset.visualEnhanced='true';
    host.classList.add('site-page-visual','site-page-visual--atlas');
    host.replaceChildren(
      visualImage(
        'assets/visuals/task-explorer-hero.webp',
        'Pixel-art overview of the twelve TOEFL task types'
      )
    );

    const shortcuts=make('div','site-visual-shortcuts');
    [
      ['READING','#task-map','reading'],
      ['LISTENING','#task-map','listening'],
      ['WRITING','#writing-studio',''],
      ['SPEAKING','#speaking-studio','']
    ].forEach(([label,href,section])=>{
      const a=make('a','site-visual-shortcut',label);
      a.href=href;
      if(section) a.dataset.jumpSection=section;
      shortcuts.appendChild(a);
    });
    host.appendChild(shortcuts);
  }

  function injectPackArt(){
    const hero=qs('.pack-hero');
    if(!hero) return;
    const pack=document.body.dataset.pack;

    if(pack==='explorer'){
      injectAtlasVisual();
      return;
    }

    if(pack==='hub'){
      if(!qs('.site-page-visual--hub',hero)){
        hero.appendChild(
          visualFigure(
            'site-page-visual--hub',
            'assets/visuals/practice-hub-hero.webp',
            'Retro pixel Practice Hub with Writing and Speaking practice stations'
          )
        );
      }
      return;
    }

    if(pack!=='writing' && pack!=='speaking') return;
    const heroCard=qs('.hero-card',hero);
    if(!heroCard || qs('.site-page-visual',heroCard)) return;

    const figure=visualFigure(
      'site-page-visual--'+pack,
      pack==='writing'
        ? 'assets/visuals/writing-lab-hero.webp'
        : 'assets/visuals/speaking-lab-hero.webp',
      pack==='writing'
        ? 'Retro pixel Writing Lab workstation'
        : 'Retro pixel Speaking Lab recording studio'
    );
    const metrics=qs('.metric-grid',heroCard);
    if(metrics) heroCard.insertBefore(figure,metrics);
    else heroCard.appendChild(figure);
  }
  function injectCommunityStrip(){
    if(qs('.community-support')) return;
    const footer=qs('.sources-footer')||qs('.atlas-footer')||qs('.pack-footer');
    if(!footer || !footer.parentNode) return;
    const section=make('section','community-support');
    section.setAttribute('aria-label','Support this open learning project');
    const intro=make('div','community-support-copy');
    intro.appendChild(make('span','community-kicker','OPEN LEARNING, BUILT TOGETHER'));
    intro.appendChild(make('h2','', 'Help the guide keep growing.'));
    intro.appendChild(make('p','', 'If this free project helps your TOEFL preparation, kindly give it a star on GitHub and join Kamiunity—our community for open-source learning.'));
    const actions=make('div','community-support-actions');
    const github=make('a','community-link community-github');
    github.href='https://github.com/Kami80/TOEFL-2026';
    github.target='_blank';
    github.rel='noreferrer';
    github.innerHTML='<span aria-hidden="true">★</span><b>Star on GitHub</b><small>Kami80/TOEFL-2026</small>';
    const telegram=make('a','community-link community-telegram');
    telegram.href='https://t.me/kamiunity_opensource';
    telegram.target='_blank';
    telegram.rel='noreferrer';
    telegram.innerHTML='<span aria-hidden="true">↗</span><b>Join Kamiunity</b><small>Open-source learning community</small>';
    actions.append(github,telegram);
    section.append(intro,actions);
    footer.parentNode.insertBefore(section,footer);
  }

  /* =========================================================
     TOEFL://NAV + PIXEL ROUTE MAP v2
     Fast persistent navigation + full searchable sitemap.
     No decorative tree: the map is a retro route console.
     ========================================================= */
  const SITE_ROUTES={
    guide:{label:'Field Guide',short:'GUIDE',href:'index.html',desc:'Format, scoring, study plan & test day',group:'learn'},
    atlas:{label:'Task Atlas',short:'TASKS',href:'task-explorer.html',desc:'All 12 task types, templates & scripts',group:'learn'},
    hub:{label:'Practice Hub',short:'HUB',href:'practice-packs.html',desc:'Choose a complete practice pack',group:'practice'},
    writing:{label:'Writing Lab',short:'WRITE',href:'writing-practice.html',desc:'Sentence, email & discussion practice',group:'practice'},
    speaking:{label:'Speaking Lab',short:'SPEAK',href:'speaking-practice.html',desc:'Listen & Repeat + Interview practice',group:'practice'}
  };

  const SITE_MAP={
    guide:{
      code:'01',glyph:'G',label:'FIELD GUIDE',title:'TOEFL 2026 Field Guide',href:'index.html',desc:'The complete overview: format, adaptation, scoring, practice, planning, test day and sources.',
      sections:[
        {label:'Start / Overview',href:'index.html#top',desc:'Guide introduction and quick launch.'},
        {label:'Format at a Glance',href:'index.html#format',desc:'Four sections, timing, delivery and blueprint details.'},
        {label:'Adaptive Reading + Listening',href:'index.html#adaptive',desc:'How the routing module and second-stage route work.'},
        {label:'Task-by-Task Explorer',href:'index.html#sections',desc:'Compact guide to every task family.'},
        {label:'Score Lab',href:'index.html#scoring',desc:'Section bands, overall score and target scenarios.'},
        {label:'Practice Lab',href:'index.html#practice',desc:'Five small interactive format drills.',children:[
          {label:'Complete Words drill',href:'index.html?drill=words#practice'},
          {label:'Build Sentence drill',href:'index.html?drill=sentence#practice'},
          {label:'Choose Response drill',href:'index.html?drill=listen#practice'},
          {label:'Timed Writing drill',href:'index.html?drill=write#practice'},
          {label:'Voice Lab drill',href:'index.html?drill=speak#practice'}
        ]},
        {label:'Study Blueprint',href:'index.html#plan',desc:'4, 8 or 12-week planning system.'},
        {label:'Test Day',href:'index.html#test-day',desc:'Section order, rules and checklist.'},
        {label:'Questions / FAQ',href:'index.html#faq',desc:'Important format and policy answers.'},
        {label:'Official Source Desk',href:'index.html#sources',desc:'Primary ETS references used by the guide.'}
      ]
    },
    atlas:{
      code:'02',glyph:'T',label:'TASK ATLAS',title:'Complete Task Atlas',href:'task-explorer.html',desc:'Deep task mechanics, module routes, examples, writing frameworks and speaking response engines.',
      sections:[
        {label:'Atlas Start',href:'task-explorer.html#explorer-main',desc:'Task Atlas overview and section console.'},
        {label:'Expanded Format',href:'task-explorer.html#format',desc:'Comprehensive format matrix and module lanes.'},
        {label:'All 12 Task Types',href:'task-explorer.html#task-map',desc:'Interactive task workbench.',children:[
          {label:'01 · Complete the Words',href:'task-explorer.html?task=complete-words#task-map'},
          {label:'02 · Read in Daily Life',href:'task-explorer.html?task=daily-life#task-map'},
          {label:'03 · Academic Passage',href:'task-explorer.html?task=academic-passage#task-map'},
          {label:'04 · Choose a Response',href:'task-explorer.html?task=choose-response#task-map'},
          {label:'05 · Conversation',href:'task-explorer.html?task=conversation#task-map'},
          {label:'06 · Announcement',href:'task-explorer.html?task=announcement#task-map'},
          {label:'07 · Academic Talk',href:'task-explorer.html?task=academic-talk#task-map'},
          {label:'08 · Build a Sentence',href:'task-explorer.html?task=build-sentence#task-map'},
          {label:'09 · Write an Email',href:'task-explorer.html?task=write-email#task-map'},
          {label:'10 · Academic Discussion',href:'task-explorer.html?task=academic-discussion#task-map'},
          {label:'11 · Listen & Repeat',href:'task-explorer.html?task=listen-repeat#task-map'},
          {label:'12 · Take an Interview',href:'task-explorer.html?task=take-interview#task-map'}
        ]},
        {label:'Writing Response Studio',href:'task-explorer.html#writing-studio',desc:'Highlighted structures, models and timing strategies.',children:[
          {label:'Email · problem + request',href:'task-explorer.html?template=email-problem#writing-studio'},
          {label:'Email · status + clarification',href:'task-explorer.html?template=email-status#writing-studio'},
          {label:'Email · peer coordination',href:'task-explorer.html?template=email-peer#writing-studio'},
          {label:'Discussion · agree + extend',href:'task-explorer.html?template=discussion-extend#writing-studio'},
          {label:'Discussion · qualify + counter',href:'task-explorer.html?template=discussion-qualify#writing-studio'},
          {label:'Writing model library',href:'task-explorer.html#writing-library-title'}
        ]},
        {label:'Speaking Response Studio',href:'task-explorer.html#speaking-studio',desc:'Interview engines, highlighted scripts and delivery coaching.',children:[
          {label:'Opinion / preference engine',href:'task-explorer.html?engine=opinion#speaking-studio'},
          {label:'Experience / memory engine',href:'task-explorer.html?engine=experience#speaking-studio'},
          {label:'Routine / lifestyle engine',href:'task-explorer.html?engine=routine#speaking-studio'},
          {label:'Solution / prediction engine',href:'task-explorer.html?engine=solution#speaking-studio'},
          {label:'Listen & Repeat chunk map',href:'task-explorer.html#repeat-title'}
        ]},
        {label:'Research Desk',href:'task-explorer.html#sources',desc:'ETS and supporting preparation sources.'}
      ]
    },
    hub:{
      code:'03',glyph:'P',label:'PRACTICE HUB',title:'Practice Hub',href:'practice-packs.html',desc:'The launch point for complete Writing and Speaking practice environments.',
      sections:[
        {label:'Practice Hub Start',href:'practice-packs.html#page-top',desc:'Overview of available practice packs.'},
        {label:'Writing Practice Pack',href:'practice-packs.html#writing-pack',desc:'40 Writing questions and saved progress.'},
        {label:'Speaking Practice Pack',href:'practice-packs.html#speaking-pack',desc:'55 Speaking items with recording tools.'},
        {label:'Study Notes',href:'practice-packs.html#notes',desc:'Highlights and comments saved in the browser.'},
        {label:'Offline-friendly Notes',href:'practice-packs.html#page-footer',desc:'Local usage and browser capability information.'}
      ]
    },
    writing:{
      code:'04',glyph:'W',label:'WRITING LAB',title:'Writing Practice Lab',href:'writing-practice.html',desc:'Complete interactive Writing practice with timers, drafts, progress and answer review.',
      sections:[
        {label:'Writing Lab Start',href:'writing-practice.html#page-top',desc:'Pack overview and source inventory.'},
        {label:'Build a Sentence',href:'writing-practice.html?mode=sentence#practice-root',desc:'30 questions across three timed sets.'},
        {label:'Write an Email',href:'writing-practice.html?mode=email#practice-root',desc:'Five 7-minute email prompts.'},
        {label:'Academic Discussion',href:'writing-practice.html?mode=discussion#practice-root',desc:'Five 10-minute discussion prompts.'},
        {label:'Study Notes',href:'writing-practice.html#notes',desc:'Open saved highlights and comments.'},
        {label:'Source Fidelity',href:'writing-practice.html#page-footer',desc:'Practice-source and adaptation notes.'}
      ]
    },
    speaking:{
      code:'05',glyph:'S',label:'SPEAKING LAB',title:'Speaking Practice Lab',href:'speaking-practice.html',desc:'Complete Speaking practice with prompt audio, microphone recording and optional speech recognition.',
      sections:[
        {label:'Speaking Lab Start',href:'speaking-practice.html#page-top',desc:'Pack overview and speaking inventory.'},
        {label:'Listen & Repeat',href:'speaking-practice.html?mode=repeat#practice-root',desc:'35 sentences across five scenarios.'},
        {label:'Take an Interview',href:'speaking-practice.html?mode=interview#practice-root',desc:'20 questions across five interview sets.'},
        {label:'Study Notes',href:'speaking-practice.html#notes',desc:'Open saved pronunciation and strategy notes.'},
        {label:'Microphone & Privacy',href:'speaking-practice.html#page-footer',desc:'Recording privacy and browser requirements.'}
      ]
    }
  };

  let mapLastFocus=null;

  function currentSiteRoute(){
    const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    if(file.includes('task-explorer')) return 'atlas';
    if(file.includes('practice-packs')) return 'hub';
    if(file.includes('writing-practice')) return 'writing';
    if(file.includes('speaking-practice')) return 'speaking';
    return 'guide';
  }

  function ensureSiteNavStyles(){
    if(qs('link[data-site-tree-style]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='site-tree-nav.css?v=20260818-map2';
    link.dataset.siteTreeStyle='true';
    document.head.appendChild(link);
  }

  function openPracticeBranch(practice,button){
    if(!practice||!button) return;
    practice.classList.add('is-open');
    button.setAttribute('aria-expanded','true');
  }

  function closePracticeBranch(){
    const wrap=qs('.site-fastnav-practice');
    const btn=qs('.site-fastnav-practice-toggle');
    if(!wrap||!btn) return;
    wrap.classList.remove('is-open');
    btn.setAttribute('aria-expanded','false');
  }

  function fastPracticeItem(label,href,desc,current=false){
    const a=make('a','site-fastnav-branch-link');
    a.href=href;
    if(current) a.classList.add('is-current');
    a.innerHTML='<b>'+label+'</b><small>'+desc+'</small><i aria-hidden="true">→</i>';
    return a;
  }

  function createFastNav(){
    if(qs('.site-fastnav')) return;
    const current=currentSiteRoute();
    const route=SITE_ROUTES[current];
    const bar=make('header','site-fastnav');
    bar.setAttribute('aria-label','Fast site navigation');

    const brand=make('a','site-fastnav-brand');
    brand.href='index.html';
    brand.setAttribute('aria-label','TOEFL 2026 guide home');
    const logo=new Image();
    logo.src='toefl-2026-logo-header.webp';
    logo.alt='';
    logo.decoding='async';
    brand.appendChild(logo);
    const brandCopy=make('span','site-fastnav-brand-copy');
    brandCopy.innerHTML='<b>TOEFL</b><small>//2026</small>';
    brand.appendChild(brandCopy);

    const nav=make('nav','site-fastnav-links');
    nav.setAttribute('aria-label','Primary pages');
    const guide=make('a','site-fastnav-link','GUIDE');
    guide.href=SITE_ROUTES.guide.href;
    if(current==='guide') guide.classList.add('is-current');
    const atlas=make('a','site-fastnav-link','TASKS');
    atlas.href=SITE_ROUTES.atlas.href;
    if(current==='atlas') atlas.classList.add('is-current');

    const practice=make('div','site-fastnav-practice');
    const practiceToggle=make('button','site-fastnav-link site-fastnav-practice-toggle');
    practiceToggle.type='button';
    practiceToggle.setAttribute('aria-expanded','false');
    practiceToggle.setAttribute('aria-controls','site-fastnav-practice-panel');
    practiceToggle.innerHTML='<span>PRACTICE</span><i aria-hidden="true">+</i>';
    if(route.group==='practice') practiceToggle.classList.add('is-current');

    const practicePanel=make('div','site-fastnav-branch-panel');
    practicePanel.id='site-fastnav-practice-panel';
    practicePanel.setAttribute('aria-label','Practice destinations');
    const panelHead=make('div','site-fastnav-branch-head');
    panelHead.innerHTML='<span>TOEFL://PRACTICE</span><b>Choose a lab</b><small>This panel stays open until you leave it intentionally.</small>';
    const hub=fastPracticeItem('Practice Hub','practice-packs.html','Choose a complete pack',current==='hub');
    hub.classList.add('is-featured');
    const columns=make('div','site-fastnav-branch-columns');
    const wcol=make('section','site-fastnav-mini-group');
    wcol.innerHTML='<header><span>W</span><b>WRITING LAB</b></header>';
    wcol.append(
      fastPracticeItem('Open Writing Lab','writing-practice.html','All writing practice',current==='writing'),
      fastPracticeItem('Build a Sentence','writing-practice.html?mode=sentence#practice-root','30 questions'),
      fastPracticeItem('Write an Email','writing-practice.html?mode=email#practice-root','5 timed prompts'),
      fastPracticeItem('Academic Discussion','writing-practice.html?mode=discussion#practice-root','5 timed prompts')
    );
    const scol=make('section','site-fastnav-mini-group');
    scol.innerHTML='<header><span>S</span><b>SPEAKING LAB</b></header>';
    scol.append(
      fastPracticeItem('Open Speaking Lab','speaking-practice.html','All speaking practice',current==='speaking'),
      fastPracticeItem('Listen & Repeat','speaking-practice.html?mode=repeat#practice-root','35 sentences'),
      fastPracticeItem('Take an Interview','speaking-practice.html?mode=interview#practice-root','20 questions')
    );
    columns.append(wcol,scol);
    practicePanel.append(panelHead,hub,columns);
    practice.append(practiceToggle,practicePanel);
    nav.append(guide,atlas,practice);

    const routeChip=make('div','site-fastnav-route');
    routeChip.innerHTML='<span>YOU:</span><b>'+route.short+'</b><i aria-hidden="true">_</i>';

    const mapButton=make('button','site-map-open');
    mapButton.type='button';
    mapButton.innerHTML='<span class="site-map-open-pixels" aria-hidden="true"><i></i><i></i><i></i><i></i></span><b>MAP</b>';
    mapButton.setAttribute('aria-label','Open complete TOEFL site map');

    bar.append(brand,nav,routeChip,mapButton);
    document.body.prepend(bar);
    const spacer=make('div','site-fastnav-spacer');
    spacer.setAttribute('aria-hidden','true');
    bar.after(spacer);
    document.body.classList.add('site-fastnav-enabled');

    practiceToggle.addEventListener('click',e=>{
      e.stopPropagation();
      if(practice.classList.contains('is-open')) closePracticeBranch();
      else openPracticeBranch(practice,practiceToggle);
    });
    practice.addEventListener('pointerenter',()=>{
      if(matchMedia('(hover:hover)').matches) openPracticeBranch(practice,practiceToggle);
    });
    practice.addEventListener('focusin',()=>openPracticeBranch(practice,practiceToggle));
    practicePanel.addEventListener('click',e=>e.stopPropagation());
    document.addEventListener('click',e=>{if(!practice.contains(e.target)) closePracticeBranch()});
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape' && practice.classList.contains('is-open')){
        closePracticeBranch();
        practiceToggle.focus({preventScroll:true});
      }
    });
  }

  function targetHash(href){
    try{return new URL(href,location.href).hash||''}catch{return ''}
  }

  function isCurrentMapLink(pageId,href){
    if(pageId!==currentSiteRoute()) return false;
    try{
      const u=new URL(href,location.href);
      const here=new URL(location.href);
      if(u.pathname!==here.pathname) return false;
      const sameMode=(u.searchParams.get('mode')||'')===(here.searchParams.get('mode')||'');
      const sameTask=(u.searchParams.get('task')||'')===(here.searchParams.get('task')||'');
      const sameTemplate=(u.searchParams.get('template')||'')===(here.searchParams.get('template')||'');
      const sameEngine=(u.searchParams.get('engine')||'')===(here.searchParams.get('engine')||'');
      if((u.searchParams.has('mode')&&!sameMode)||(u.searchParams.has('task')&&!sameTask)||(u.searchParams.has('template')&&!sameTemplate)||(u.searchParams.has('engine')&&!sameEngine)) return false;
      if(!u.hash) return !here.hash;
      return u.hash===here.hash;
    }catch{return false}
  }

  function routeCard(pageId,item,depth=0){
    const a=make('a','site-map-route-card'+(depth?' is-child':''));
    a.href=item.href;
    a.dataset.mapPage=pageId;
    if(isCurrentMapLink(pageId,item.href)) a.classList.add('is-current');
    const n=make('span','site-map-route-index',depth?'·':'→');
    const copy=make('span','site-map-route-copy');
    copy.innerHTML='<b>'+item.label+'</b>'+(item.desc?'<small>'+item.desc+'</small>':'');
    const end=make('i','site-map-route-go',depth?'↳':'ENTER');
    a.append(n,copy,end);
    return a;
  }

  function flattenMap(){
    const out=[];
    Object.entries(SITE_MAP).forEach(([pageId,page])=>{
      out.push({pageId,page,item:{label:page.title,href:page.href,desc:page.desc},kind:'page'});
      page.sections.forEach(section=>{
        out.push({pageId,page,item:section,kind:'section'});
        (section.children||[]).forEach(child=>out.push({pageId,page,item:child,kind:'child',parent:section.label}));
      });
    });
    return out;
  }

  function createPixelRouteChip(text,tone='a'){
    const chip=make('span','site-map-pixel-chip tone-'+tone);
    chip.innerHTML='<i></i><i></i><i></i><i></i><b>'+text+'</b>';
    return chip;
  }

  function renderMapPage(pageId){
    const stage=qs('.site-map-stage');
    if(!stage) return;
    const page=SITE_MAP[pageId]||SITE_MAP[currentSiteRoute()]||SITE_MAP.guide;
    qsa('.site-map-page-button').forEach(btn=>{
      const active=btn.dataset.page===pageId;
      btn.classList.toggle('is-active',active);
      btn.setAttribute('aria-selected',String(active));
    });
    stage.dataset.page=pageId;
    stage.innerHTML='';

    const hero=make('header','site-map-page-hero');
    const identity=make('div','site-map-page-identity');
    const badge=make('span','site-map-page-glyph',page.glyph);
    const copy=make('div','site-map-page-copy');
    copy.innerHTML='<span>ROUTE '+page.code+' / '+page.label+'</span><h3>'+page.title+'</h3><p>'+page.desc+'</p>';
    identity.append(badge,copy);
    const open=make('a','site-map-page-open','OPEN PAGE →');
    open.href=page.href;
    hero.append(identity,open);

    const meter=make('div','site-map-route-meter');
    meter.append(
      createPixelRouteChip(String(page.sections.length).padStart(2,'0')+' SECTIONS','a'),
      createPixelRouteChip(pageId===currentSiteRoute()?'CURRENT PAGE':'LOCAL ROUTES','b'),
      createPixelRouteChip('CLICK TO JUMP','c')
    );

    const list=make('div','site-map-route-list');
    page.sections.forEach((section,index)=>{
      const group=make('section','site-map-route-group');
      const header=make('div','site-map-route-group-head');
      header.innerHTML='<span>'+String(index+1).padStart(2,'0')+'</span><b>'+section.label+'</b>'+(section.children?.length?'<small>'+section.children.length+' sub-routes</small>':'');
      group.append(header,routeCard(pageId,section,0));
      if(section.children?.length){
        const children=make('div','site-map-route-children');
        section.children.forEach(child=>children.appendChild(routeCard(pageId,child,1)));
        group.appendChild(children);
      }
      list.appendChild(group);
    });
    stage.append(hero,meter,list);
    const status=qs('.site-map-status-text');
    if(status) status.textContent='ROUTE LOADED · '+page.label+' · '+page.sections.length+' SECTIONS';
  }

  function renderMapSearch(query){
    const stage=qs('.site-map-stage');
    if(!stage) return;
    const q=query.trim().toLowerCase();
    if(!q){renderMapPage(qs('.site-map-page-button.is-active')?.dataset.page||currentSiteRoute());return}
    const matches=flattenMap().filter(row=>[row.page.label,row.page.title,row.item.label,row.item.desc||'',row.parent||''].join(' ').toLowerCase().includes(q));
    stage.dataset.page='search';
    stage.innerHTML='';
    const head=make('header','site-map-search-head');
    head.innerHTML='<span>SEARCH://ROUTES</span><h3>'+matches.length+' match'+(matches.length===1?'':'es')+'</h3><p>Search spans every local page, subsection, task, template and practice mode.</p>';
    stage.appendChild(head);
    const results=make('div','site-map-search-results');
    matches.forEach(({pageId,page,item,kind,parent})=>{
      const card=routeCard(pageId,item,kind==='child'?1:0);
      const tag=make('span','site-map-search-tag',page.label+(parent?' / '+parent:''));
      card.prepend(tag);
      results.appendChild(card);
    });
    if(!matches.length){
      const empty=make('div','site-map-empty');
      empty.innerHTML='<span>404</span><b>NO LOCAL ROUTE FOUND</b><p>Try “writing”, “score”, “interview”, “email”, “adaptive” or “sources”.</p>';
      results.appendChild(empty);
    }
    stage.appendChild(results);
    const status=qs('.site-map-status-text');
    if(status) status.textContent='SEARCH ACTIVE · '+matches.length+' ROUTES FOUND';
  }

  function openSiteMap(pageId){
    const overlay=qs('.site-map-overlay');
    if(!overlay) return;
    mapLastFocus=document.activeElement;
    overlay.hidden=false;
    requestAnimationFrame(()=>overlay.classList.add('is-open'));
    document.body.classList.add('site-map-opened');
    const selected=pageId||currentSiteRoute();
    const pageButton=qs('.site-map-page-button[data-page="'+selected+'"]');
    if(pageButton) pageButton.click(); else renderMapPage(selected);
    const search=qs('.site-map-search');
    if(search){search.value='';window.setTimeout(()=>search.focus({preventScroll:true}),80)}
  }

  function closeSiteMap(){
    const overlay=qs('.site-map-overlay');
    if(!overlay||overlay.hidden) return;
    overlay.classList.remove('is-open');
    document.body.classList.remove('site-map-opened');
    window.setTimeout(()=>{if(!overlay.classList.contains('is-open')) overlay.hidden=true},170);
    if(mapLastFocus?.focus) window.setTimeout(()=>mapLastFocus.focus({preventScroll:true}),30);
  }

  function createSiteMap(){
    if(qs('.site-map-overlay')) return;
    const current=currentSiteRoute();
    const overlay=make('div','site-map-overlay');
    overlay.hidden=true;
    const dialog=make('section','site-map-window');
    dialog.setAttribute('role','dialog');
    dialog.setAttribute('aria-modal','true');
    dialog.setAttribute('aria-labelledby','site-map-title');

    const head=make('header','site-map-head');
    const brand=make('div','site-map-titlebox');
    brand.innerHTML='<span>TOEFL://MAP</span><h2 id="site-map-title">Route Console</h2><small>Every page. Every subsection. One searchable map.</small>';
    const headPixels=make('div','site-map-head-pixels');
    for(let i=0;i<12;i++) headPixels.appendChild(make('i',''));
    const close=make('button','site-map-close','×');
    close.type='button';
    close.setAttribute('aria-label','Close site map');
    head.append(brand,headPixels,close);

    const toolbar=make('div','site-map-toolbar');
    const searchWrap=make('label','site-map-search-wrap');
    searchWrap.innerHTML='<span>FIND ROUTE</span>';
    const search=make('input','site-map-search');
    search.type='search';
    search.placeholder='Search tasks, labs, scoring, sources…';
    search.setAttribute('aria-label','Search all site routes');
    searchWrap.appendChild(search);
    const status=make('div','site-map-status');
    status.innerHTML='<span class="site-map-led"></span><b class="site-map-status-text">READY</b><small>YOU → '+SITE_ROUTES[current].label.toUpperCase()+'</small>';
    toolbar.append(searchWrap,status);

    const shell=make('div','site-map-shell');
    const rail=make('nav','site-map-page-rail');
    rail.setAttribute('aria-label','Site pages');
    rail.setAttribute('role','tablist');
    Object.entries(SITE_MAP).forEach(([pageId,page])=>{
      const btn=make('button','site-map-page-button');
      btn.type='button';
      btn.dataset.page=pageId;
      btn.setAttribute('role','tab');
      btn.setAttribute('aria-selected','false');
      btn.innerHTML='<span class="site-map-page-num">'+page.code+'</span><i>'+page.glyph+'</i><span><b>'+page.label+'</b><small>'+page.sections.length+' sections</small></span><em>›</em>';
      if(pageId===current) btn.classList.add('is-current-page');
      btn.addEventListener('click',()=>{
        search.value='';
        renderMapPage(pageId);
      });
      rail.appendChild(btn);
    });
    const stage=make('main','site-map-stage');
    stage.setAttribute('aria-live','polite');
    shell.append(rail,stage);

    const foot=make('footer','site-map-foot');
    foot.innerHTML='<span><i class="legend-current"></i> CURRENT</span><span><kbd>/</kbd> SEARCH</span><span><kbd>ESC</kbd> CLOSE</span><span><kbd>↑</kbd><kbd>↓</kbd> PAGES</span><b>LOCAL-FIRST NAVIGATION</b>';

    dialog.append(head,toolbar,shell,foot);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    close.addEventListener('click',closeSiteMap);
    overlay.addEventListener('mousedown',e=>{if(e.target===overlay) closeSiteMap()});
    search.addEventListener('input',()=>renderMapSearch(search.value));
    dialog.addEventListener('keydown',e=>{
      if(e.key==='/' && e.target!==search){e.preventDefault();search.focus();return}
      if((e.key==='ArrowDown'||e.key==='ArrowUp') && document.activeElement?.classList.contains('site-map-page-button')){
        e.preventDefault();
        const buttons=qsa('.site-map-page-button');
        const index=buttons.indexOf(document.activeElement);
        const next=e.key==='ArrowDown'?(index+1)%buttons.length:(index-1+buttons.length)%buttons.length;
        buttons[next].focus();buttons[next].click();
      }
      if(e.key==='Tab'){
        const focusables=qsa('a[href],button:not([disabled]),input:not([disabled])',dialog).filter(el=>el.offsetParent!==null);
        if(!focusables.length) return;
        const first=focusables[0],last=focusables[focusables.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      }
    });
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&!overlay.hidden) closeSiteMap();
    });
    qsa('.site-map-open').forEach(button=>button.addEventListener('click',()=>openSiteMap()));
    renderMapPage(current);
  }

  function ensureSyntheticAnchors(){
    const pack=document.body.dataset.pack;
    const hero=qs('.pack-hero');
    if(hero&&!hero.id) hero.id='page-top';
    const footer=qs('.pack-footer');
    if(footer&&!footer.id) footer.id='page-footer';
    if(pack==='hub'){
      const grid=qs('.hub-grid');if(grid&&!grid.id) grid.id='packs';
      const writing=qs('.hub-card.writing');if(writing&&!writing.id) writing.id='writing-pack';
      const speaking=qs('.hub-card.speaking');if(speaking&&!speaking.id) speaking.id='speaking-pack';
    }
    if((pack==='writing'||pack==='speaking')){
      const tabs=qs('.mode-tabs');if(tabs&&!tabs.id) tabs.id='task-modes';
    }
  }

  function clickBySelector(selector){
    const el=qs(selector);
    if(el){el.click();return true}
    return false;
  }

  function applyRouteIntent(attempt=0){
    ensureSyntheticAnchors();
    const page=currentSiteRoute();
    const params=new URLSearchParams(location.search);
    let actionDone=false;
    if(page==='guide'&&params.get('drill')){
      const labels={words:'Complete words',sentence:'Build sentence',listen:'Choose response',write:'Timed writing',speak:'Voice lab'};
      const wanted=labels[params.get('drill')];
      const btn=qsa('#practice .practice-tabs button').find(b=>b.textContent.trim().toLowerCase()===String(wanted||'').toLowerCase());
      if(btn){btn.click();actionDone=true}
    }
    if(page==='atlas'){
      const template=params.get('template');
      const engine=params.get('engine');
      if(template) actionDone=clickBySelector('[data-writing-template="'+CSS.escape(template)+'"]')||actionDone;
      if(engine) actionDone=clickBySelector('[data-speaking-template="'+CSS.escape(engine)+'"]')||actionDone;
    }
    if(page==='writing'||page==='speaking'){
      const mode=params.get('mode');
      if(mode) actionDone=clickBySelector('.mode-tabs [data-mode="'+CSS.escape(mode)+'"]')||actionDone;
    }
    if(location.hash==='#notes'){
      const notes=qs('#notesButton,.notes-button');
      if(notes){notes.click();actionDone=true}
      return;
    }
    if(location.hash){
      const id=decodeURIComponent(location.hash.slice(1));
      const target=document.getElementById(id);
      if(target){
        window.setTimeout(()=>target.scrollIntoView({behavior:attempt?'auto':'smooth',block:'start'}),actionDone?90:20);
        return;
      }
    }
    if(attempt<8) window.setTimeout(()=>applyRouteIntent(attempt+1),90+attempt*45);
  }

  function setupGlobalSiteNav(){
    ensureSiteNavStyles();
    createFastNav();
    createSiteMap();
    ensureSyntheticAnchors();
    applyRouteIntent();
  }

  function enhanceGuide(){
    const root=qs('#root');
    if(!root || !qs('.hero',root)) return false;
    applyReadableText(root);
    ensureVisualStyles();
    injectGuideVisual();
    const heroCopy=qs('.hero > div:first-child',root)||qs('.hero',root);
    addStickerRail(heroCopy,['2026 format','Adaptive Reading + Listening','Practice-first guide']);
    const headingLabels={
      'format-section':['Blueprint','Timing','Task atlas'],
      'score-section':['Band scale','CEFR','Score lab'],
      'testday-section':['Test day','Checklist','Order'],
      'faq-section':['Answers','Policies','2026 format']
    };
    qsa('.section-heading > div:first-child',root).forEach(box=>{
      const section=box.closest('section');
      const key=section ? Object.keys(headingLabels).find(name=>section.classList.contains(name)) : '';
      addStickerRail(box,headingLabels[key]||['TOEFL','Guide','2026']);
    });
    qsa('.task-card',root).forEach((card,i)=>card.dataset.retroIndex=String((i%4)+1));
    injectCommunityStrip();
    setupSectionNav(root);
    setupReveal(root);
    return true;
  }
  function enhancePack(){
    applyReadableText(document);
    ensureVisualStyles();
    injectPackArt();
    const intro=qs('.pack-hero > div:first-child');
    const pack=document.body.dataset.pack;
    const labels=pack==='writing' ? ['30 sentence items','5 email tasks','5 discussions'] : pack==='speaking' ? ['35 repeat items','20 interview answers','Local recording'] : pack==='explorer' ? ['12 task types','Official examples','Highlighted templates'] : ['Writing pack','Speaking pack','Study notes'];
    addStickerRail(intro,labels);
    injectCommunityStrip();
    setupReveal(document);
  }
  function setupReveal(root=document){
    const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const targets=qsa('.change-grid article,.task-card,.scale-card,.phase-grid article,.faq-list article,.hub-card,.practice-card,.module-lane,.model-grid article,.source-ledger a',root);
    if(reduce || !('IntersectionObserver' in window)){
      targets.forEach(el=>el.classList.add('is-visible'));
      return;
    }
    targets.forEach(el=>el.classList.add('retro-reveal'));
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('is-visible');obs.unobserve(entry.target)}
      });
    },{threshold:.05,rootMargin:'0px 0px -3%'});
    targets.forEach(el=>obs.observe(el));
  }
  function setupSectionNav(root){
    const navLinks=qsa('.nav-links a');
    if(!navLinks.length || !('IntersectionObserver' in window)) return;
    const map=new Map();
    navLinks.forEach(link=>{
      const href=link.getAttribute('href')||'';
      if(href.startsWith('#')){
        const el=qs(href,root)||qs(href);
        if(el) map.set(el,link);
      }
    });
    if(!map.size) return;
    const obs=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible) return;
      navLinks.forEach(a=>a.classList.remove('is-active'));
      map.get(visible.target)?.classList.add('is-active');
    },{threshold:[.15,.35,.6],rootMargin:'-18% 0px -58%'});
    map.forEach((_,section)=>obs.observe(section));
  }
  function watchDynamicGuide(){
    const root=qs('#root');
    if(!root) return;
    if(enhanceGuide()) return;
    const obs=new MutationObserver(()=>{if(enhanceGuide()) obs.disconnect()});
    obs.observe(root,{childList:true,subtree:true});
  }
  function keepDynamicTextReadable(){
    const target=qs('#practice-root')||qs('#root');
    if(!target) return;
    let raf=0;
    const obs=new MutationObserver(()=>{
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>applyReadableText(target));
    });
    obs.observe(target,{childList:true,subtree:true});
  }
  ready(function(){
    document.body.classList.add('retromax-ready');
    ensureVisualStyles();
    setupGlobalSiteNav();
    if(document.body.dataset.pack) enhancePack();
    else watchDynamicGuide();
    keepDynamicTextReadable();
  });
})();
