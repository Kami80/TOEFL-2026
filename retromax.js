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
    if(document.body.dataset.pack) enhancePack();
    else watchDynamicGuide();
    keepDynamicTextReadable();
  });
})();
