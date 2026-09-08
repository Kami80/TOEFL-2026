/* TOEFL 2026 uploaded practice packs - local interactive runtime */
(() => {
  'use strict';
  const DATA = window.TOEFL_PACK_DATA || {};
  const pack = document.body.dataset.pack;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const words = v => (String(v).trim().match(/\b[\w’'-]+\b/g) || []).length;
  const norm = v => String(v).toLowerCase().replace(/[’‘]/g,"'").replace(/\s+([?.!,;:])/g,'$1').replace(/\s+/g,' ').trim();
  const getJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const setJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const formatClock = sec => `${String(Math.max(0,Math.floor(sec/60))).padStart(2,'0')}:${String(Math.max(0,sec%60)).padStart(2,'0')}`;

  function makeTimer(el, initial, onDone){
    let remaining=initial, id=null;
    const paint=()=>{ if(!el) return; el.textContent=formatClock(remaining); el.classList.toggle('urgent', remaining<=30); };
    const stop=()=>{ if(id){clearInterval(id);id=null;} };
    const start=(seconds=initial)=>{ stop(); remaining=seconds; paint(); id=setInterval(()=>{remaining--;paint();if(remaining<=0){stop();onDone?.();}},1000); };
    const reset=(seconds=initial)=>{stop();remaining=seconds;paint();};
    paint();
    return {start,stop,reset,get remaining(){return remaining},get running(){return !!id}};
  }

  function speak(text){
    return new Promise(resolve => {
      if(!('speechSynthesis' in window)){ alert('Speech synthesis is not available in this browser.'); resolve(false); return; }
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text); u.rate=.92; u.pitch=1; u.lang='en-US';
      u.onend=()=>resolve(true); u.onerror=()=>resolve(false); speechSynthesis.speak(u);
    });
  }

  function lcsAccuracy(target, actual){
    const a=norm(target).replace(/[^a-z0-9' ]/g,'').split(' ').filter(Boolean);
    const b=norm(actual).replace(/[^a-z0-9' ]/g,'').split(' ').filter(Boolean);
    const dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
    for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++) dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
    return a.length ? Math.round(dp[a.length][b.length]/a.length*100) : 0;
  }

  function renderWriting(){
    const root=$('#practice-root');
    if(!root) return;
    const tabs=$$('.mode-tabs button');
    let mode='sentence';
    const activate=(m)=>{mode=m;tabs.forEach(b=>b.classList.toggle('active',b.dataset.mode===m)); if(m==='sentence') renderSentence(); if(m==='email') renderEmail(); if(m==='discussion') renderDiscussion();};
    tabs.forEach(b=>b.addEventListener('click',()=>activate(b.dataset.mode)));

    const sentenceStatus=getJSON('toefl26-writing-sentence-status',{});
    let sentenceIndex=0, selected=[];
    let setNo=1;
    let sentenceTimer=null;
    function renderSentence(){
      const q=DATA.writing.sentences[sentenceIndex];
      const slots=(q.template.match(/_____/g)||[]).length;
      if(selected.length>slots) selected=selected.slice(0,slots);
      const setStart=(setNo-1)*10, setEnd=setStart+10;
      root.innerHTML=`
        <section class="practice-card" data-note-scope="writing-sentence-${q.id}">
          <div class="practice-toolbar">
            <div class="select-wrap"><label>Set</label><select id="setSelect">${[1,2,3].map(n=>`<option value="${n}" ${n===setNo?'selected':''}>Set ${n} · Q${(n-1)*10+1}-${n*10}</option>`).join('')}</select></div>
            <div class="select-wrap"><label>Question</label><select id="questionSelect">${DATA.writing.sentences.map((x,i)=>`<option value="${i}" ${i===sentenceIndex?'selected':''}>#${x.id}</option>`).join('')}</select></div>
            <div class="spacer"></div><div class="clock" id="sentenceClock">06:00</div>
            <button class="tool-btn" id="startSet">Start 6-min set</button>
          </div>
          <div class="sentence-layout">
            <aside class="source-pane source-text"><span class="number">BUILD A SENTENCE · #${q.id}</span><h2>${esc(q.context)}</h2><p class="context">Move the words or phrases into the blanks to create a grammatical sentence.</p><div class="source-note">On test day, the source states that you have <b>6 minutes to complete 10 questions</b>. This page groups all 30 source questions into three timed sets.</div></aside>
            <div class="work-pane"><div class="sentence-template" id="sentenceTemplate">${renderTemplate(q,selected)}</div><span class="token-label">Word / phrase bank</span><div class="token-bank">${q.bank.map((t,i)=>`<button data-token="${i}" class="${selected.includes(i)?'used':''}" ${selected.includes(i)?'disabled':''}>${esc(t)}</button>`).join('')}</div><div class="sentence-actions"><button class="primary-btn" id="checkSentence">Check answer</button><button class="ghost-btn" id="undoToken" ${!selected.length?'disabled':''}>Undo</button><button class="ghost-btn" id="clearTokens">Clear</button><button class="ghost-btn" id="revealSentence">Reveal answer</button></div><div id="sentenceFeedback"></div></div>
          </div>
          <div class="progress-strip">${DATA.writing.sentences.slice(setStart,setEnd).map((x,i)=>{const st=sentenceStatus[x.id];return `<button data-jump="${setStart+i}" class="${x.id===q.id?'current':''} ${st==='correct'?'done':st==='wrong'?'wrong':''}">${x.id}</button>`}).join('')}</div>
        </section>`;
      const clock=$('#sentenceClock'); sentenceTimer=makeTimer(clock,360,()=>{$('#sentenceFeedback').innerHTML='<div class="feedback bad">Time is up for this 10-question practice set. You can still review your work.</div>';});
      $('#setSelect').onchange=e=>{setNo=+e.target.value; sentenceIndex=(setNo-1)*10;selected=[];renderSentence();};
      $('#questionSelect').onchange=e=>{sentenceIndex=+e.target.value;setNo=Math.floor(sentenceIndex/10)+1;selected=[];renderSentence();};
      $('#startSet').onclick=()=>sentenceTimer.start(360);
      $$('.token-bank button').forEach(b=>b.onclick=()=>{if(selected.length<slots){selected.push(+b.dataset.token);renderSentenceKeepTimer(q.id);}});
      $$('.slot[data-slot]').forEach(s=>s.onclick=()=>{const pos=+s.dataset.slot;if(selected[pos]!==undefined){selected.splice(pos,1);renderSentenceKeepTimer(q.id);}});
      $('#undoToken').onclick=()=>{selected.pop();renderSentenceKeepTimer(q.id)};
      $('#clearTokens').onclick=()=>{selected=[];renderSentenceKeepTimer(q.id)};
      $('#checkSentence').onclick=()=>{const built=buildSentence(q,selected);const ok=selected.length===slots && norm(built)===norm(q.answer); sentenceStatus[q.id]=ok?'correct':'wrong'; setJSON('toefl26-writing-sentence-status',sentenceStatus); $('#sentenceFeedback').innerHTML=ok?`<div class="feedback good"><b>Correct.</b> ${esc(q.answer)}</div>`:`<div class="feedback bad"><b>Not quite.</b> Review the word order or use “Reveal answer” after another attempt.</div>`; paintProgressOnly();};
      $('#revealSentence').onclick=()=>{$('#sentenceFeedback').innerHTML=`<div class="answer-box"><b>Answer key:</b> ${esc(q.answer)}</div>`;};
      $$('[data-jump]').forEach(b=>b.onclick=()=>{sentenceIndex=+b.dataset.jump;setNo=Math.floor(sentenceIndex/10)+1;selected=[];renderSentence();});
    }
    function renderSentenceKeepTimer(){ const remaining=sentenceTimer?.remaining ?? 360, running=sentenceTimer?.running; sentenceTimer?.stop(); renderSentence(); if(running) sentenceTimer.start(remaining); else sentenceTimer.reset(remaining); }
    function renderTemplate(q,sel){let i=0;return q.template.split(/(_____)/g).map(part=>part==='_____'?`<button class="slot ${sel[i]===undefined?'empty':''}" data-slot="${i}">${sel[i]===undefined?'_____':esc(q.bank[sel[i]])}</button>${i++?'':''}`:esc(part)).join('');}
    function buildSentence(q,sel){let i=0;return q.template.replace(/_____/g,()=>sel[i]===undefined?'_____':q.bank[sel[i++]]).replace(/\s+([?.!,;:])/g,'$1').replace(/\s+/g,' ').trim();}
    function paintProgressOnly(){ const setStart=(setNo-1)*10; $$('.progress-strip button').forEach((b,i)=>{const id=setStart+i+1;const st=sentenceStatus[id];b.classList.toggle('done',st==='correct');b.classList.toggle('wrong',st==='wrong');}); }

    let editorTimer=null;
    function renderEmail(){
      let idx=+(sessionStorage.getItem('emailPromptIndex')||0); const q=DATA.writing.emails[idx]; const key=`toefl26-email-${q.id}`; const draft=localStorage.getItem(key)||'';
      root.innerHTML=`<section class="practice-card" data-note-scope="writing-email-${q.id}"><div class="practice-toolbar"><div class="select-wrap"><label>Email prompt</label><select id="emailSelect">${DATA.writing.emails.map((x,i)=>`<option value="${i}" ${i===idx?'selected':''}>#${x.id} · ${esc(x.subject)}</option>`).join('')}</select></div><div class="spacer"></div><div class="clock" id="emailClock">07:00</div><button class="tool-btn" id="emailTimerBtn">Start 7:00</button></div><div class="writing-layout"><aside class="prompt-pane source-text"><span class="pack-kicker">WRITE AN EMAIL · #${q.id}</span><h2>${esc(q.subject)}</h2><p>${esc(q.scenario)}</p><div class="mail-meta"><b>To:</b> ${esc(q.to)}<br><b>Subject:</b> ${esc(q.subject)}</div><p><b>In your email, do the following:</b></p><ul>${q.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul><p>Write as much as you can and in complete sentences.</p></aside><div class="editor-pane"><div class="editor-meta"><span>Your response · spell-check disabled</span><strong id="emailWords">${words(draft)} words</strong></div><textarea id="emailDraft" spellcheck="false" placeholder="Type your email here…">${esc(draft)}</textarea><div class="editor-actions"><button class="ghost-btn" id="clearEmail">Clear draft</button><span class="spacer"></span><span style="font-size:9px;color:#858995">Saved locally as you type.</span></div><details class="sample-panel"><summary>Reveal source sample answer</summary><p>${esc(q.sample)}</p></details></div></div></section>`;
      $('.writing-layout')?.classList.add('email-layout');
      editorTimer=makeTimer($('#emailClock'),420,()=>alert('7 minutes are up.'));
      $('#emailTimerBtn').onclick=()=>editorTimer.start(420);
      $('#emailSelect').onchange=e=>{sessionStorage.setItem('emailPromptIndex',e.target.value);renderEmail();};
      $('#emailDraft').oninput=e=>{localStorage.setItem(key,e.target.value);$('#emailWords').textContent=`${words(e.target.value)} words`;};
      $('#clearEmail').onclick=()=>{if(confirm('Clear this saved response?')){localStorage.removeItem(key);renderEmail();}};
    }

    function renderDiscussion(){
      let idx=+(sessionStorage.getItem('discussionPromptIndex')||0); const q=DATA.writing.discussions[idx]; const key=`toefl26-discussion-${q.id}`; const draft=localStorage.getItem(key)||''; const wc=words(draft);
      root.innerHTML=`<section class="practice-card" data-note-scope="writing-discussion-${q.id}"><div class="practice-toolbar"><div class="select-wrap"><label>Discussion</label><select id="discussionSelect">${DATA.writing.discussions.map((x,i)=>`<option value="${i}" ${i===idx?'selected':''}>#${x.id} · ${esc(x.field)}</option>`).join('')}</select></div><div class="spacer"></div><div class="clock" id="discussionClock">10:00</div><button class="tool-btn" id="discussionTimerBtn">Start 10:00</button></div><div class="writing-layout"><aside class="prompt-pane source-text"><span class="pack-kicker">ACADEMIC DISCUSSION · #${q.id}</span><h2>${esc(q.field[0].toUpperCase()+q.field.slice(1))}</h2><p>Express and support your opinion and make a contribution to the discussion in your own words. An effective response will contain at least 100 words.</p><div class="discussion-grid"><div class="professor-card"><b>${esc(q.professor)}</b><p>${esc(q.professorText)}</p></div><div class="student-stack">${q.students.map(s=>`<div class="student-card"><b>${esc(s.name)}</b><p>${esc(s.text)}</p></div>`).join('')}</div></div></aside><div class="editor-pane"><div class="editor-meta"><span>Your post · spell-check disabled</span><strong id="discussionWords">${wc} words</strong></div><textarea id="discussionDraft" spellcheck="false" placeholder="Write at least 100 words…">${esc(draft)}</textarea><div class="editor-actions"><div class="word-goal"><i id="wordGoalBar" style="width:${Math.min(100,wc)}%"></i></div><span id="goalText" style="font-size:9px;color:${wc>=100?'#198754':'#858995'}">${wc>=100?'100-word target reached':`${100-wc} words to 100`}</span><span class="spacer"></span><button class="ghost-btn" id="clearDiscussion">Clear</button></div><details class="sample-panel"><summary>Reveal source sample answer</summary><p>${esc(q.sample)}</p></details></div></div></section>`;
      $('.writing-layout')?.classList.add('discussion-layout');
      $('.prompt-pane')?.classList.add('discussion-prompt-pane');
      editorTimer=makeTimer($('#discussionClock'),600,()=>alert('10 minutes are up.'));
      $('#discussionTimerBtn').onclick=()=>editorTimer.start(600);
      $('#discussionSelect').onchange=e=>{sessionStorage.setItem('discussionPromptIndex',e.target.value);renderDiscussion();};
      $('#discussionDraft').oninput=e=>{localStorage.setItem(key,e.target.value);const n=words(e.target.value);$('#discussionWords').textContent=`${n} words`;$('#wordGoalBar').style.width=`${Math.min(100,n)}%`;$('#goalText').textContent=n>=100?'100-word target reached':`${100-n} words to 100`;$('#goalText').style.color=n>=100?'#198754':'#858995';};
      $('#clearDiscussion').onclick=()=>{if(confirm('Clear this saved response?')){localStorage.removeItem(key);renderDiscussion();}};
    }
    activate('sentence');
  }

  function renderSpeaking(){
    const root=$('#practice-root'); if(!root) return;
    const tabs=$$('.mode-tabs button');
    const activate=m=>{tabs.forEach(b=>b.classList.toggle('active',b.dataset.mode===m));m==='repeat'?renderRepeat():renderInterview();};
    tabs.forEach(b=>b.onclick=()=>activate(b.dataset.mode));
    let repeatScenario=0, repeatSentence=0, repeatPlayed=false, repeatCountdown=null;
    let mediaRecorder=null, mediaStream=null, chunks=[], audioUrl=null;

    function cleanupRecorder(){ if(mediaRecorder && mediaRecorder.state!=='inactive'){try{mediaRecorder.stop();}catch{}} if(mediaStream){mediaStream.getTracks().forEach(t=>t.stop());mediaStream=null;} mediaRecorder=null; chunks=[]; if(audioUrl){URL.revokeObjectURL(audioUrl);audioUrl=null;} }
    async function startRecording(duration, statusEl, audioEl, onStop){
      try{
        mediaStream=await navigator.mediaDevices.getUserMedia({audio:true}); chunks=[]; mediaRecorder=new MediaRecorder(mediaStream); mediaRecorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)}; mediaRecorder.onstop=()=>{const blob=new Blob(chunks,{type:mediaRecorder.mimeType||'audio/webm'});if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(blob);audioEl.src=audioUrl;audioEl.classList.remove('hidden');mediaStream?.getTracks().forEach(t=>t.stop());mediaStream=null;statusEl.textContent='Recording saved on this device for this session.';onStop?.();}; mediaRecorder.start(); statusEl.textContent='Recording…'; if(duration) setTimeout(()=>{if(mediaRecorder?.state==='recording')mediaRecorder.stop();},duration*1000); return true;
      }catch(err){statusEl.textContent='Microphone access failed. If you opened this as a local file, try serving the folder on localhost or HTTPS.';return false;}
    }

    function renderRepeat(){
      cleanupRecorder(); const sc=DATA.speaking.listenRepeat[repeatScenario], sentence=sc.sentences[repeatSentence]; repeatPlayed=false;
      const saved=getJSON('toefl26-repeat-scores',{}); const itemKey=`${sc.id}-${repeatSentence+1}`; const best=saved[itemKey];
      root.innerHTML=`<section class="practice-card" data-note-scope="speaking-repeat-${sc.id}-${repeatSentence+1}"><div class="practice-toolbar"><div class="select-wrap"><label>Scenario</label><select id="repeatScenario">${DATA.speaking.listenRepeat.map((x,i)=>`<option value="${i}" ${i===repeatScenario?'selected':''}>#${x.id} · ${esc(x.title)}</option>`).join('')}</select></div><div class="select-wrap"><label>Sentence</label><select id="repeatSentence">${sc.sentences.map((_,i)=>`<option value="${i}" ${i===repeatSentence?'selected':''}>${i+1} of 7</option>`).join('')}</select></div><div class="spacer"></div>${best!==undefined?`<span style="font-size:10px;font-weight:800;color:#168352">Best STT accuracy: ${best}%</span>`:''}</div><div class="speaking-layout"><aside class="visual-pane source-text"><img src="${esc(sc.image)}" alt="Source visual for ${esc(sc.title)}"><div><span class="pack-kicker">LISTEN & REPEAT · #${sc.id}</span><h2>${esc(sc.title)}</h2><p>${esc(sc.description)}</p><span class="source-page">Source PDF page ${sc.sourcePage}</span></div></aside><div class="speak-work"><div class="sentence-row"><span class="q-index">${repeatSentence+1}</span><h3>Listen once, then repeat.</h3></div><div class="repeat-stage"><div class="listen-placeholder" id="repeatPrompt">The sentence is hidden until you reveal the transcript. Use “Listen once” to hear it.</div><div class="speak-controls"><button class="primary-btn" id="listenOnce">▶ Listen once</button><button class="ghost-btn" id="resetRepeat">Reset attempt</button><button class="ghost-btn" id="revealRepeat">Reveal transcript</button><button class="ghost-btn" id="speechCheck">Speech-to-text check</button></div><div class="countdown-big" id="repeatCountdown">—</div><div id="sttOutput"></div><div class="record-box"><div class="record-status" id="recordStatus">Optional: record your repetition and play it back.</div><div class="speak-controls"><button class="ghost-btn" id="recordRepeat">● Record</button><button class="danger-btn" id="stopRepeat" disabled>Stop</button></div><audio id="repeatAudio" class="hidden" controls></audio></div></div></div></div></section>`;
      $('#repeatScenario').onchange=e=>{repeatScenario=+e.target.value;repeatSentence=0;renderRepeat();}; $('#repeatSentence').onchange=e=>{repeatSentence=+e.target.value;renderRepeat();};
      const seconds=sentence.split(/\s+/).length<=8?8:sentence.split(/\s+/).length<=13?10:12;
      const cdEl=$('#repeatCountdown'); repeatCountdown=makeTimer(cdEl,seconds,()=>{cdEl.textContent='Done';}); cdEl.textContent='—';
      $('#listenOnce').onclick=async e=>{if(repeatPlayed)return;repeatPlayed=true;e.currentTarget.disabled=true;await speak(sentence);repeatCountdown.start(seconds);};
      $('#resetRepeat').onclick=()=>{repeatPlayed=false;$('#listenOnce').disabled=false;repeatCountdown.stop();cdEl.textContent='—';$('#sttOutput').innerHTML='';$('#repeatPrompt').textContent='The sentence is hidden until you reveal the transcript. Use “Listen once” to hear it.';};
      $('#revealRepeat').onclick=()=>{$('#repeatPrompt').textContent=sentence;};
      $('#speechCheck').onclick=()=>runRecognition(sentence,itemKey,saved);
      $('#recordRepeat').onclick=async()=>{const ok=await startRecording(seconds,$('#recordStatus'),$('#repeatAudio'));if(ok){$('#recordRepeat').disabled=true;$('#stopRepeat').disabled=false;}};
      $('#stopRepeat').onclick=()=>{if(mediaRecorder?.state==='recording')mediaRecorder.stop();$('#stopRepeat').disabled=true;$('#recordRepeat').disabled=false;};
    }
    function runRecognition(target,itemKey,saved){
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){$('#sttOutput').innerHTML='<div class="feedback bad">Browser speech recognition is not available here. Chrome/Edge usually provide it when the page is served over HTTPS or localhost.</div>';return;}
      const r=new SR();r.lang='en-US';r.interimResults=false;r.maxAlternatives=1;$('#sttOutput').innerHTML='<div class="feedback">Listening for your repetition…</div>';r.onresult=e=>{const text=e.results[0][0].transcript;const score=lcsAccuracy(target,text);saved[itemKey]=Math.max(saved[itemKey]||0,score);setJSON('toefl26-repeat-scores',saved);$('#sttOutput').innerHTML=`<div class="transcript-box"><b>Browser transcript:</b> ${esc(text)}</div><div class="accuracy"><div class="accuracy-bar"><i style="width:${score}%"></i></div><b>${score}%</b></div>`;};r.onerror=e=>{$('#sttOutput').innerHTML=`<div class="feedback bad">Speech recognition error: ${esc(e.error||'unknown')}</div>`};try{r.start();}catch{}
    }

    let interviewScenario=0, interviewQuestion=0, interviewPlayed=false, interviewTimer=null;
    function renderInterview(){
      cleanupRecorder(); const sc=DATA.speaking.interviews[interviewScenario], q=sc.questions[interviewQuestion], completed=getJSON('toefl26-interview-completed',{}); interviewPlayed=false;
      root.innerHTML=`<section class="practice-card" data-note-scope="speaking-interview-${sc.id}-${q.id}"><div class="practice-toolbar"><div class="select-wrap"><label>Interview</label><select id="interviewScenario">${DATA.speaking.interviews.map((x,i)=>`<option value="${i}" ${i===interviewScenario?'selected':''}>#${x.id} · ${esc(x.title)}</option>`).join('')}</select></div><div class="spacer"></div><span style="font-size:10px;color:#777b88">4 questions · up to 45 seconds each · no preparation</span></div><div class="speaking-layout"><aside class="visual-pane source-text"><img src="${esc(sc.image)}" alt="Interviewer visual for ${esc(sc.title)}"><div><span class="pack-kicker">TAKE AN INTERVIEW · #${sc.id}</span><h2>${esc(sc.title)}</h2><p>${esc(sc.description)}</p><span class="source-page">Source PDF page ${sc.sourcePage}</span></div></aside><div class="speak-work"><div class="sentence-row"><span class="q-index">${q.id}</span><h3>Question ${q.id} of 4</h3></div><div class="question-text source-text">${esc(q.question)}</div><div class="interview-actions"><button class="primary-btn" id="hearQuestion">▶ Hear question once</button><button class="ghost-btn" id="recordInterview">● Record 45s</button><button class="danger-btn" id="stopInterview" disabled>Stop</button><button class="ghost-btn" id="resetInterview">Reset question</button></div><div class="answer-timer" id="interviewTimer">45</div><div class="record-box"><div class="record-status" id="interviewStatus">Your recording stays on this device and is not uploaded.</div><audio id="interviewAudio" class="hidden" controls></audio></div><details class="sample-panel"><summary>Reveal source sample answer</summary><p>${esc(q.sample)}</p></details><div class="question-nav">${sc.questions.map((x,i)=>`<button data-iq="${i}" class="${i===interviewQuestion?'current':''} ${completed[`${sc.id}-${x.id}`]?'completed':''}">Q${x.id}</button>`).join('')}</div></div></div></section>`;
      $('#interviewScenario').onchange=e=>{interviewScenario=+e.target.value;interviewQuestion=0;renderInterview();};
      $('#hearQuestion').onclick=async e=>{if(interviewPlayed)return;interviewPlayed=true;e.currentTarget.disabled=true;await speak(q.question);};
      interviewTimer=makeTimer($('#interviewTimer'),45,()=>{if(mediaRecorder?.state==='recording')mediaRecorder.stop();}); $('#interviewTimer').textContent='45';
      $('#recordInterview').onclick=async()=>{const ok=await startRecording(45,$('#interviewStatus'),$('#interviewAudio'),()=>{completed[`${sc.id}-${q.id}`]=true;setJSON('toefl26-interview-completed',completed);$$('[data-iq]')[interviewQuestion]?.classList.add('completed');});if(ok){$('#recordInterview').disabled=true;$('#stopInterview').disabled=false;interviewTimer.start(45);}};
      $('#stopInterview').onclick=()=>{if(mediaRecorder?.state==='recording')mediaRecorder.stop();interviewTimer.stop();$('#stopInterview').disabled=true;$('#recordInterview').disabled=false;};
      $('#resetInterview').onclick=()=>{interviewPlayed=false;$('#hearQuestion').disabled=false;interviewTimer.stop();$('#interviewTimer').textContent='45';};
      $$('[data-iq]').forEach(b=>b.onclick=()=>{interviewQuestion=+b.dataset.iq;renderInterview();});
    }
    activate('repeat');
  }

  function renderHubProgress(){
    const s=getJSON('toefl26-writing-sentence-status',{}); const correct=Object.values(s).filter(x=>x==='correct').length;
    const repeat=getJSON('toefl26-repeat-scores',{}); const interviews=getJSON('toefl26-interview-completed',{});
    const a=$('#hubSentenceProgress'),b=$('#hubRepeatProgress'),c=$('#hubInterviewProgress'); if(a)a.textContent=`${correct}/30 sentence questions correct`; if(b)b.textContent=`${Object.keys(repeat).length}/35 repeat items speech-checked`; if(c)c.textContent=`${Object.keys(interviews).length}/20 interview questions recorded`;
  }

  function initNotes(){
    if(!$('#notesButton')){
      document.body.insertAdjacentHTML('beforeend',`<button class="notes-button" id="notesButton" type="button" aria-label="Open highlights and comments">✦ Highlights</button><button class="selection-note" id="selectionNote" type="button">Highlight + comment</button><aside class="notes-drawer" id="notesDrawer" aria-label="Highlights and comments"><div class="notes-head"><div><small>YOUR STUDY LAYER</small><h3>Highlights & comments</h3></div><button id="notesClose" type="button" aria-label="Close notes">×</button></div><div class="note-form hidden" id="noteForm"><blockquote id="noteQuote"></blockquote><small>Highlight color</small><div class="color-row"><button class="color-yellow active" data-color="yellow" aria-label="Yellow"></button><button class="color-mint" data-color="mint" aria-label="Mint"></button><button class="color-blue" data-color="blue" aria-label="Blue"></button><button class="color-pink" data-color="pink" aria-label="Pink"></button></div><textarea id="noteComment" placeholder="Add a memory cue, vocabulary note, strategy, or question…"></textarea><div class="note-save"><button class="primary-btn" id="noteSave" type="button">Save note</button><button class="ghost-btn" id="noteCancel" type="button">Cancel</button></div></div><div class="notes-list" id="notesList"></div></aside>`);
    }
    if(!$('#highlightPopover')){
      document.body.insertAdjacentHTML('beforeend','<aside class="retro-highlight-popover" id="highlightPopover" role="dialog" aria-label="Saved highlight comment" hidden></aside>');
    }
    const noteBtn=$('#notesButton'),drawer=$('#notesDrawer'),close=$('#notesClose'),selectionBtn=$('#selectionNote'),form=$('#noteForm'),quoteEl=$('#noteQuote'),comment=$('#noteComment'),save=$('#noteSave'),cancel=$('#noteCancel'),list=$('#notesList'),popover=$('#highlightPopover');
    if(!noteBtn||!drawer||!close||!selectionBtn||!form||!quoteEl||!comment||!save||!cancel||!list||!popover)return;
    const palette=$('.color-row',form);
    if(palette&&!$('.color-choice',form))palette.insertAdjacentHTML('afterend','<output class="color-choice" aria-live="polite" data-color="yellow">Yellow selected</output>');
    const colorChoice=$('.color-choice',form);
    noteBtn.textContent='✦ Highlight & comment';
    noteBtn.setAttribute('aria-label','Open highlights and comments');
    const key=`toefl26-notes:${location.pathname}`; let notes=getJSON(key,[]), draft=null, color='yellow', editingId=null, popoverNoteId=null;
    const colors=['yellow','mint','blue','pink'];
    function syncColor(next){color=next||'yellow';$$('.color-row button',drawer).forEach(x=>{const chosen=x.dataset.color===color;x.classList.toggle('active',chosen);x.setAttribute('aria-pressed',String(chosen));});if(colorChoice){const label=color.charAt(0).toUpperCase()+color.slice(1);colorChoice.dataset.color=color;colorChoice.textContent=`${label} selected`;}}
    function open(){drawer.classList.add('open');renderList();}
    function resetForm(){form.classList.add('hidden');draft=null;editingId=null;comment.value='';}
    function hidePopover(){popover.hidden=true;popoverNoteId=null;}
    function shut(){drawer.classList.remove('open');resetForm();}
    function openExistingNote(note){if(!note)return;hidePopover();editingId=note.id;draft={scopeId:note.scopeId,start:note.start,end:note.end,quote:note.quote};quoteEl.textContent=`“${note.quote}”`;comment.value=note.comment||'';syncColor(note.color);form.classList.remove('hidden');open();requestAnimationFrame(()=>comment.focus());}
    noteBtn.onclick=()=>{hidePopover();open();};close.onclick=shut;cancel.onclick=resetForm;
    $$('.color-row button',drawer).forEach(b=>b.onclick=()=>syncColor(b.dataset.color));syncColor(color);
    document.addEventListener('mouseup',()=>{setTimeout(()=>{const sel=getSelection();if(!sel||sel.isCollapsed){selectionBtn.style.display='none';return;}hidePopover();const range=sel.getRangeAt(0);const node=range.commonAncestorContainer.nodeType===1?range.commonAncestorContainer:range.commonAncestorContainer.parentElement;if(node?.closest?.('.notes-drawer,.retro-highlight-popover,button,a,input,textarea,select,audio,[contenteditable="true"]')){selectionBtn.style.display='none';return;}const scope=node.closest?.('[data-note-scope]');if(!scope){selectionBtn.style.display='none';return;}const quote=sel.toString().trim();if(!quote||quote.length<2){selectionBtn.style.display='none';return;}const offsets=rangeOffsets(scope,range);if(!offsets)return;const rect=range.getBoundingClientRect();draft={scopeId:scope.dataset.noteScope,start:offsets.start,end:offsets.end,quote};selectionBtn.style.left=`${Math.min(innerWidth-172,Math.max(10,rect.left))}px`;selectionBtn.style.top=`${Math.min(innerHeight-48,Math.max(10,rect.bottom+8))}px`;selectionBtn.style.display='block';},0)});
    selectionBtn.onclick=()=>{selectionBtn.style.display='none';if(!draft)return;editingId=null;quoteEl.textContent=`“${draft.quote}”`;comment.value='';syncColor('yellow');form.classList.remove('hidden');open();getSelection()?.removeAllRanges();};
    save.onclick=()=>{if(!draft)return;const now=new Date().toISOString();if(editingId!==null){notes=notes.map(n=>String(n.id)===String(editingId)?{...n,comment:comment.value.trim(),color,updatedAt:now}:n);}else{notes.push({...draft,id:Date.now(),comment:comment.value.trim(),color,createdAt:now,updatedAt:now});}setJSON(key,notes);hidePopover();resetForm();renderList();applyHighlights();};
    function renderList(){list.innerHTML=notes.length?notes.map(n=>`<article class="saved-note ${String(editingId)===String(n.id)?'is-active':''}" data-open-note="${n.id}" title="Open this comment"><blockquote>${esc(n.quote)}</blockquote>${n.comment?`<p>${esc(n.comment)}</p>`:'<p>No comment yet — click to add one.</p>'}<footer><button data-edit-note="${n.id}" type="button">Edit</button><button data-del-note="${n.id}" type="button">Delete</button></footer></article>`).join(''):'<div class="notes-empty"><b>Highlight what matters.</b><p>Select any useful phrase on this page, choose “Highlight + comment,” then click the saved highlight anytime to see its note in place.</p></div>';$$('[data-open-note]',list).forEach(card=>card.onclick=e=>{if(e.target.closest('[data-del-note]'))return;openExistingNote(notes.find(n=>String(n.id)===card.dataset.openNote));});$$('[data-edit-note]',list).forEach(b=>b.onclick=e=>{e.stopPropagation();openExistingNote(notes.find(n=>String(n.id)===b.dataset.editNote));});$$('[data-del-note]',list).forEach(b=>b.onclick=e=>{e.stopPropagation();notes=notes.filter(n=>String(n.id)!==b.dataset.delNote);if(String(editingId)===b.dataset.delNote)resetForm();if(String(popoverNoteId)===b.dataset.delNote)hidePopover();setJSON(key,notes);renderList();applyHighlights();});}
    function rangeOffsets(scope,range){let start=null,end=null,count=0;const w=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(n===range.startContainer)start=count+range.startOffset;if(n===range.endContainer)end=count+range.endOffset;count+=n.nodeValue.length;}return start!==null&&end!==null?{start,end}:null;}
    function rangeFromOffsets(scope,start,end){const r=document.createRange();let count=0,sn=null,en=null,so=0,eo=0;const w=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const next=count+n.nodeValue.length;if(sn===null&&start>=count&&start<=next){sn=n;so=start-count;}if(end>=count&&end<=next){en=n;eo=end-count;break;}count=next;}if(!sn||!en)return null;try{r.setStart(sn,Math.min(so,sn.nodeValue.length));r.setEnd(en,Math.min(eo,en.nodeValue.length));return r}catch{return null}}
    function locateNote(scope,note){const text=scope.textContent||'';if(text.slice(note.start,note.end)===note.quote)return{start:note.start,end:note.end};const start=text.indexOf(note.quote);return start<0?null:{start,end:start+note.quote.length};}
    function findScope(scopeId){return $$('[data-note-scope]').find(scope=>scope.dataset.noteScope===scopeId)||null;}
    function caretAtPoint(x,y){if(document.caretRangeFromPoint)return document.caretRangeFromPoint(x,y);if(document.caretPositionFromPoint){const pos=document.caretPositionFromPoint(x,y);if(!pos)return null;const r=document.createRange();r.setStart(pos.offsetNode,pos.offset);r.collapse(true);return r;}return null;}
    function offsetAtPoint(scope,x,y){const r=caretAtPoint(x,y);if(!r)return null;const node=r.startContainer.nodeType===1?r.startContainer:r.startContainer.parentElement;if(!node||!scope.contains(node))return null;const before=document.createRange();before.selectNodeContents(scope);try{before.setEnd(r.startContainer,r.startOffset);return before.toString().length}catch{return null}}
    function showPopover(note,scope){const location=locateNote(scope,note);const range=location&&rangeFromOffsets(scope,location.start,location.end);if(!range)return;const rect=range.getBoundingClientRect();const below=rect.top<205;const popoverWidth=Math.min(340,innerWidth-24),half=popoverWidth/2;const center=Math.min(innerWidth-half-12,Math.max(half+12,rect.left+rect.width/2));popover.className=`retro-highlight-popover color-${note.color||'yellow'}${below?' is-below':''}`;popover.style.left=`${center}px`;popover.style.top=`${below?rect.bottom+12:rect.top-12}px`;popover.innerHTML=`<header><span>✦ SAVED HIGHLIGHT</span><button type="button" data-pop-close aria-label="Close comment">×</button></header><blockquote>“${esc(note.quote)}”</blockquote><p class="popover-comment">${note.comment?esc(note.comment):'<em>No comment yet — add a memory cue or strategy.</em>'}</p><footer><button type="button" data-pop-edit>Edit comment</button><button type="button" data-pop-all>All highlights</button></footer>`;popover.hidden=false;popoverNoteId=note.id;$('[data-pop-close]',popover).onclick=hidePopover;$('[data-pop-edit]',popover).onclick=()=>openExistingNote(note);$('[data-pop-all]',popover).onclick=()=>{hidePopover();open();};}
    document.addEventListener('click',e=>{if(e.target.closest?.('.retro-highlight-popover'))return;if(e.target.closest?.('.notes-drawer,.notes-button,.selection-note,button,input,textarea,select,a,audio')){hidePopover();return;}const scope=e.target.closest?.('[data-note-scope]');if(!scope){hidePopover();return;}const offset=offsetAtPoint(scope,e.clientX,e.clientY);if(offset===null){hidePopover();return;}const hits=notes.map(note=>({note,location:note.scopeId===scope.dataset.noteScope?locateNote(scope,note):null})).filter(item=>item.location&&offset>=item.location.start&&offset<=item.location.end).sort((a,b)=>(a.location.end-a.location.start)-(b.location.end-b.location.start));if(hits.length)showPopover(hits[0].note,scope);else hidePopover();});
    function applyHighlights(){if(!window.CSS?.highlights||typeof Highlight==='undefined')return;for(const c of colors){const ranges=notes.filter(n=>n.color===c).map(n=>{const scope=findScope(n.scopeId),location=scope&&locateNote(scope,n);return scope&&location?rangeFromOffsets(scope,location.start,location.end):null;}).filter(Boolean);CSS.highlights.set(`pack-${c}`,new Highlight(...ranges));}}
    renderList();setTimeout(applyHighlights,250);
    const observer=new MutationObserver(()=>applyHighlights()); const pr=$('#practice-root'); if(pr)observer.observe(pr,{childList:true,subtree:true});
  }

  if(pack==='writing') renderWriting();
  if(pack==='speaking') renderSpeaking();
  if(pack==='hub') renderHubProgress();
  initNotes();
})();
