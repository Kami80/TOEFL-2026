(function(){
  'use strict';

  const qs=(s,r=document)=>r.querySelector(s);
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
  function injectPackArt(){
    const hero=qs('.pack-hero');
    if(!hero || qs('.retro-pack-art',hero)) return;
    const pack=document.body.dataset.pack;
    if(pack!=='writing' && pack!=='speaking') return;
    const heroCard=qs('.hero-card',hero);
    if(!heroCard) return;
    const figure=make('figure','retro-pack-art');
    const img=new Image();
    img.loading='eager';
    img.decoding='async';
    img.alt=pack==='writing' ? 'Retro writing desk illustration' : 'Retro speaking studio illustration';
    img.src=pack==='writing' ? 'assets/retro-hero-writing.png' : pack==='speaking' ? 'assets/retro-hero-speaking.png' : 'assets/retro-hero-main.png';
    figure.appendChild(img);
    heroCard.insertBefore(figure,qs('.metric-grid',heroCard));
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
     TOEFL://NAV + LIVING PIXEL SITE TREE
     A shared, dependency-free navigation layer for every page.
     ========================================================= */
  const SITE_ROUTES={
    guide:{label:'Guide',short:'GUIDE',href:'index.html',desc:'Format, scoring & test day',group:'learn'},
    atlas:{label:'Task Atlas',short:'TASKS',href:'task-explorer.html',desc:'Explore all 12 task types',group:'learn'},
    hub:{label:'Practice Hub',short:'HUB',href:'practice-packs.html',desc:'Choose what to train',group:'practice'},
    writing:{label:'Writing Lab',short:'WRITE',href:'writing-practice.html',desc:'Timed writing & drafts',group:'practice'},
    speaking:{label:'Speaking Lab',short:'SPEAK',href:'speaking-practice.html',desc:'Record, replay & practice',group:'practice'}
  };

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
    link.href='site-tree-nav.css?v=20260818-tree1';
    link.dataset.siteTreeStyle='true';
    document.head.appendChild(link);
  }

  function makePixelTree(extraClass=''){
    const art=make('div','site-pixel-tree '+extraClass);
    art.setAttribute('aria-hidden','true');
    const pattern=[
      '.......ll........',
      '....llllllll.....',
      '...llllllllll....',
      '.llllllllllllll..',
      'llllllllllllllll.',
      '..llllllllllll...',
      '...llllbbllll....',
      '.....bbbb........',
      '.....bbbb........',
      '....bbbbbb.......',
      '....bb..bb.......',
      '...bb....bb......'
    ];
    pattern.forEach((row,y)=>Array.from(row).forEach((cell,x)=>{
      if(cell==='.') return;
      const px=make('i','site-tree-pixel '+(cell==='b'?'is-bark':'is-leaf'));
      if(cell==='l') px.dataset.tone=String(((x*3+y*5)%4)+1);
      px.style.gridColumn=String(x+1);
      px.style.gridRow=String(y+1);
      art.appendChild(px);
    }));
    return art;
  }

  function routeLink(id,className=''){
    const route=SITE_ROUTES[id];
    const a=make('a',className);
    a.href=route.href;
    a.dataset.siteRoute=id;
    a.innerHTML='<b>'+route.label+'</b><small>'+route.desc+'</small>';
    if(id===currentSiteRoute()){
      a.classList.add('is-current');
      a.setAttribute('aria-current','page');
    }
    return a;
  }

  function closePracticeBranch(){
    const wrap=qs('.site-fastnav-practice');
    const btn=qs('.site-fastnav-practice-toggle');
    if(!wrap||!btn) return;
    wrap.classList.remove('is-open');
    btn.setAttribute('aria-expanded','false');
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
    guide.dataset.siteRoute='guide';
    const atlas=make('a','site-fastnav-link','TASKS');
    atlas.href=SITE_ROUTES.atlas.href;
    atlas.dataset.siteRoute='atlas';
    if(current==='guide') guide.classList.add('is-current');
    if(current==='atlas') atlas.classList.add('is-current');

    const practice=make('div','site-fastnav-practice');
    const practiceToggle=make('button','site-fastnav-link site-fastnav-practice-toggle');
    practiceToggle.type='button';
    practiceToggle.setAttribute('aria-expanded','false');
    practiceToggle.setAttribute('aria-controls','site-fastnav-practice-panel');
    practiceToggle.innerHTML='PRACTICE <i aria-hidden="true">+</i>';
    if(route.group==='practice') practiceToggle.classList.add('is-current');
    const practicePanel=make('div','site-fastnav-branch-panel');
    practicePanel.id='site-fastnav-practice-panel';
    practicePanel.append(routeLink('hub'),routeLink('writing'),routeLink('speaking'));
    practice.append(practiceToggle,practicePanel);

    nav.append(guide,atlas,practice);

    const routeChip=make('div','site-fastnav-route');
    routeChip.innerHTML='<span>YOU:</span><b>'+route.short+'</b><i aria-hidden="true">_</i>';

    const mapButton=make('button','site-map-open');
    mapButton.type='button';
    mapButton.innerHTML='<span class="site-map-open-icon" aria-hidden="true">⌘</span><b>MAP</b>';
    mapButton.setAttribute('aria-label','Open interactive TOEFL site map');

    bar.append(brand,nav,routeChip,mapButton);
    document.body.prepend(bar);
    const spacer=make('div','site-fastnav-spacer');
    spacer.setAttribute('aria-hidden','true');
    bar.after(spacer);
    document.body.classList.add('site-fastnav-enabled');

    practiceToggle.addEventListener('click',e=>{
      e.stopPropagation();
      const open=practice.classList.toggle('is-open');
      practiceToggle.setAttribute('aria-expanded',String(open));
    });
    practice.addEventListener('mouseenter',()=>{
      if(matchMedia('(hover:hover)').matches){practice.classList.add('is-open');practiceToggle.setAttribute('aria-expanded','true')}
    });
    practice.addEventListener('mouseleave',()=>{
      if(matchMedia('(hover:hover)').matches) closePracticeBranch();
    });
    document.addEventListener('click',e=>{if(!practice.contains(e.target)) closePracticeBranch()});
  }

  function setMapBranch(branch,open){
    const section=qs('.site-map-branch[data-branch="'+branch+'"]');
    if(!section) return;
    const button=qs('.site-map-branch-toggle',section);
    section.classList.toggle('is-grown',open);
    button?.setAttribute('aria-expanded',String(open));
    const status=qs('.site-map-status-text');
    if(status) status.textContent=open ? branch.toUpperCase()+' BRANCH GROWN · CHOOSE A DESTINATION' : 'SELECT A BRANCH TO GROW';
  }

  function openSiteMap(preferredBranch){
    const overlay=qs('.site-map-overlay');
    if(!overlay) return;
    overlay.hidden=false;
    requestAnimationFrame(()=>overlay.classList.add('is-open'));
    document.body.classList.add('site-map-opened');
    const route=SITE_ROUTES[currentSiteRoute()];
    const branch=preferredBranch||route.group;
    if(branch) setMapBranch(branch,true);
    qs('.site-map-close',overlay)?.focus({preventScroll:true});
  }

  function closeSiteMap(){
    const overlay=qs('.site-map-overlay');
    if(!overlay||overlay.hidden) return;
    overlay.classList.remove('is-open');
    document.body.classList.remove('site-map-opened');
    window.setTimeout(()=>{if(!overlay.classList.contains('is-open')) overlay.hidden=true},180);
  }

  function createSiteMap(){
    if(qs('.site-map-overlay')) return;
    const current=currentSiteRoute();
    const route=SITE_ROUTES[current];
    const overlay=make('div','site-map-overlay');
    overlay.hidden=true;
    const dialog=make('section','site-map-window');
    dialog.setAttribute('role','dialog');
    dialog.setAttribute('aria-modal','true');
    dialog.setAttribute('aria-labelledby','site-map-title');

    const head=make('header','site-map-head');
    const titleBox=make('div','site-map-titlebox');
    titleBox.innerHTML='<span>TOEFL://WORLD</span><h2 id="site-map-title">Living Site Map</h2><small>Click a branch. Watch it grow. Pick a page.</small>';
    const close=make('button','site-map-close','×');
    close.type='button';
    close.setAttribute('aria-label','Close site map');
    head.append(titleBox,close);

    const status=make('div','site-map-status');
    status.innerHTML='<span class="site-map-led"></span><b class="site-map-status-text">SELECT A BRANCH TO GROW</b><small>YOU ARE HERE → '+route.label.toUpperCase()+'</small>';

    const canvas=make('div','site-map-canvas');
    const root=make('div','site-map-root');
    root.appendChild(makePixelTree('site-map-big-tree'));
    const rootLabel=make('div','site-map-root-label');
    rootLabel.innerHTML='<span>ROOT</span><b>TOEFL 2026</b><small>Choose your route</small>';
    root.appendChild(rootLabel);

    const branches=make('div','site-map-branches');
    const makeBranch=(id,label,caption,routeIds)=>{
      const section=make('section','site-map-branch');
      section.dataset.branch=id;
      const toggle=make('button','site-map-branch-toggle');
      toggle.type='button';
      toggle.setAttribute('aria-expanded','false');
      toggle.innerHTML='<span class="site-map-node-icon" aria-hidden="true">'+(id==='learn'?'◆':'★')+'</span><span><b>'+label+'</b><small>'+caption+'</small></span><i aria-hidden="true">+</i>';
      const children=make('div','site-map-children');
      routeIds.forEach(routeId=>children.appendChild(routeLink(routeId,'site-map-leaf')));
      section.append(toggle,children);
      toggle.addEventListener('click',()=>setMapBranch(id,!section.classList.contains('is-grown')));
      return section;
    };
    branches.append(
      makeBranch('learn','LEARN','Understand the test',['guide','atlas']),
      makeBranch('practice','PRACTICE','Train with interactive labs',['hub','writing','speaking'])
    );

    canvas.append(root,branches);
    const foot=make('footer','site-map-foot');
    foot.innerHTML='<span><i class="legend-current"></i> YOU ARE HERE</span><span><i class="legend-branch"></i> BRANCH</span><span><i class="legend-page"></i> PAGE</span><b>ESC TO CLOSE</b>';
    dialog.append(head,status,canvas,foot);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    close.addEventListener('click',closeSiteMap);
    overlay.addEventListener('mousedown',e=>{if(e.target===overlay) closeSiteMap()});
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&!overlay.hidden) closeSiteMap();
    });
    qsa('.site-map-open').forEach(button=>button.addEventListener('click',()=>openSiteMap()));
  }

  function injectMiniSiteTree(root=document){
    if(qs('.site-tree-mini') || document.body.dataset.pack) return;
    const hero=qs('.hero',root)||qs('.hero');
    if(!hero || !hero.parentNode) return;
    const widget=make('aside','site-tree-mini');
    widget.setAttribute('aria-label','Interactive TOEFL website map');
    const artWrap=make('button','site-tree-mini-art');
    artWrap.type='button';
    artWrap.setAttribute('aria-label','Open living site map');
    artWrap.appendChild(makePixelTree('site-tree-mini-pixels'));
    const treeTag=make('span','site-tree-mini-tag','TOEFL://MAP');
    artWrap.appendChild(treeTag);
    const copy=make('div','site-tree-mini-copy');
    copy.innerHTML='<span>PIXEL SITE TREE</span><h3>See where everything lives.</h3><p>Open the map, grow a branch, and jump straight to the page you need.</p>';
    const action=make('button','site-tree-mini-open');
    action.type='button';
    action.innerHTML='EXPLORE MAP <span aria-hidden="true">→</span>';
    copy.appendChild(action);
    widget.append(artWrap,copy);
    hero.parentNode.insertBefore(widget,hero.nextSibling);
    const open=()=>openSiteMap();
    artWrap.addEventListener('click',open);
    action.addEventListener('click',open);
  }

  function setupGlobalSiteNav(){
    ensureSiteNavStyles();
    createFastNav();
    createSiteMap();
  }

  function enhanceGuide(){
    const root=qs('#root');
    if(!root || !qs('.hero',root)) return false;
    applyReadableText(root);
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
    injectMiniSiteTree(root);
    injectCommunityStrip();
    setupSectionNav(root);
    setupReveal(root);
    return true;
  }
  function enhancePack(){
    applyReadableText(document);
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
    setupGlobalSiteNav();
    if(document.body.dataset.pack) enhancePack();
    else watchDynamicGuide();
    keepDynamicTextReadable();
  });
})();
