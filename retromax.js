(function(){
  'use strict';

  const STORAGE_KEY='toefl-retromax-reader-v3';
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

  function loadPrefs(){
    try{
      const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
      return value && typeof value==='object' ? value : {};
    }catch{return {}}
  }

  function savePrefs(next){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next))}catch{}
  }

  function applyReadableText(root=document){
    const selectors=[
      'p','li','blockquote',
      '.task-description','.profile-overview','.source-note','.answer-box','.feedback',
      '.transcript-box','.sample-panel p','.hub-card p','.pack-footer p','.faq-list article>p'
    ];
    qsa(selectors.join(','),root).forEach(el=>{
      if(el.closest('button,a,nav,.annotation-toolbar,.retro-reader-tools')) return;
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
    const figure=make('figure','retro-pack-art');
    const img=new Image();
    img.loading='eager';
    img.decoding='async';
    img.alt='Decorative retro study illustration';
    const pack=document.body.dataset.pack;
    img.src=pack==='writing' ? 'assets/retro-hero-writing.png' : pack==='speaking' ? 'assets/retro-hero-speaking.png' : 'assets/retro-hero-main.png';
    figure.appendChild(img);
    hero.appendChild(figure);
  }

  function addReadingProgress(){
    if(qs('.retro-reading-progress')) return;
    const bar=make('div','retro-reading-progress');
    bar.setAttribute('aria-hidden','true');
    document.body.appendChild(bar);
    const update=()=>{
      const doc=document.documentElement;
      const max=Math.max(1,doc.scrollHeight-window.innerHeight);
      bar.style.width=(Math.min(1,Math.max(0,window.scrollY/max))*100).toFixed(2)+'%';
    };
    update();
    window.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',update,{passive:true});
  }

  function addReaderTools(){
    if(qs('.retro-reader-tools')) return;
    const tools=make('div','retro-reader-tools');
    tools.setAttribute('role','group');
    tools.setAttribute('aria-label','Reading display controls');

    const definitions=[
      {key:'small',label:'A−',title:'Smaller text'},
      {key:'normal',label:'A',title:'Normal text'},
      {key:'large',label:'A+',title:'Larger text'}
    ];
    const sizeButtons={};
    definitions.forEach(item=>{
      const b=make('button','reader-size-btn',item.label);
      b.type='button';
      b.title=item.title;
      b.setAttribute('aria-label',item.title);
      b.dataset.readerSize=item.key;
      sizeButtons[item.key]=b;
      tools.appendChild(b);
    });

    const focus=make('button','reader-focus-btn','◉');
    focus.type='button';
    focus.title='Toggle distraction-free focus mode';
    focus.setAttribute('aria-label','Toggle distraction-free focus mode');
    tools.appendChild(focus);

    const apply=(prefs=loadPrefs())=>{
      const size=['small','normal','large'].includes(prefs.size) ? prefs.size : 'normal';
      const focusOn=!!prefs.focus;
      document.body.dataset.readingSize=size;
      document.body.classList.toggle('focus-reading',focusOn);
      Object.entries(sizeButtons).forEach(([key,button])=>{
        const active=key===size;
        button.classList.toggle('is-active',active);
        button.setAttribute('aria-pressed',active?'true':'false');
      });
      focus.classList.toggle('is-active',focusOn);
      focus.setAttribute('aria-pressed',focusOn?'true':'false');
      focus.textContent=focusOn?'◎':'◉';
      focus.title=focusOn?'Exit distraction-free focus mode':'Enter distraction-free focus mode';
    };

    Object.entries(sizeButtons).forEach(([key,button])=>{
      button.addEventListener('click',()=>{
        const prefs=loadPrefs();
        prefs.size=key;
        savePrefs(prefs);
        apply(prefs);
      });
    });
    focus.addEventListener('click',()=>{
      const prefs=loadPrefs();
      prefs.focus=!prefs.focus;
      savePrefs(prefs);
      apply(prefs);
    });

    document.body.appendChild(tools);
    apply();
  }

  function enhanceGuide(){
    const root=qs('#root');
    if(!root || !qs('.hero',root)) return false;
    applyReadableText(root);
    const heroCopy=qs('.hero > div:first-child',root)||qs('.hero',root);
    addStickerRail(heroCopy,['2026 format','Adaptive Reading + Listening','Practice-first guide']);
    const headingLabels=[
      ['Blueprint','Timing','Task map'],['Adaptive logic','Module 1','Module 2'],
      ['Deep explorer','Workflows','Traps'],['Band scale','CEFR','Score lab'],
      ['Practice lab','Audio','Writing'],['Test day','Checklist','Order']
    ];
    qsa('.section-heading > div:first-child',root).forEach((box,i)=>addStickerRail(box,headingLabels[i]||['TOEFL','Guide','2026']));
    qsa('.task-card',root).forEach((card,i)=>card.dataset.retroIndex=String((i%4)+1));
    setupSectionNav(root);
    setupReveal(root);
    return true;
  }

  function enhancePack(){
    applyReadableText(document);
    injectPackArt();
    const intro=qs('.pack-hero > div:first-child');
    const pack=document.body.dataset.pack;
    const labels=pack==='writing' ? ['30 sentence items','5 email tasks','5 discussions'] : pack==='speaking' ? ['35 repeat items','20 interview answers','Local recording'] : ['Writing pack','Speaking pack','Study notes'];
    addStickerRail(intro,labels);
    setupReveal(document);
  }

  function setupReveal(root=document){
    const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const targets=qsa('.change-grid article,.task-card,.scale-card,.phase-grid article,.faq-list article,.hub-card,.practice-card',root);
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
    addReadingProgress();
    addReaderTools();
    if(document.body.dataset.pack) enhancePack();
    else watchDynamicGuide();
    keepDynamicTextReadable();
  });
})();
