const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el};
const normalize=s=>s.trim().toLowerCase().replace(/[.!?]+$/,'').replace(/\s+/g,' ');
const choose=(id,options)=>{const s=make('select');s.id=id;const empty=make('option','','Choose an answer');empty.value='';s.append(empty);options.forEach(([v,t])=>{const o=make('option','',t);o.value=v;s.append(o)});return s};
const trueFalse=(id)=>{const group=make('fieldset','tf-options');group.id=id;const legend=make('legend','sr-only','Choose True or False');group.append(legend);['True','False'].forEach(text=>{const label=make('label','tf-choice');const radio=make('input');radio.type='radio';radio.name=id;radio.value=text.toLowerCase();const face=make('span','',text);label.append(radio,face);group.append(label)});Object.defineProperty(group,'value',{get(){return group.querySelector('input:checked')?.value||''},set(value){group.querySelectorAll('input').forEach(r=>{r.checked=r.value===value})}});return group};
document.querySelectorAll('.practice').forEach(box=>{
 const i=Number(box.dataset.lesson), checks=[];
 const add=(holder,prompt,control,answer,explain)=>{const row=make('div','item');const label=make('label','',prompt);label.id=control.id+'-label';if(control.tagName==='FIELDSET')control.setAttribute('aria-labelledby',label.id);else label.htmlFor=control.id;const f=make('p','feedback');f.id=control.id+'-feedback';control.setAttribute('aria-describedby',f.id);row.append(label,control,f);box.querySelector(holder).append(row);checks.push({control,answer,explain,f})};
 lessonData.tf[i].forEach(([q,a,e],j)=>add('.tf',`${j+1}. ${q}`,trueFalse(`tf-${i}-${j}`),String(a),e));
 const terms=lessonData.vocab[i];const sorted=[...terms].sort((a,b)=>a[0].localeCompare(b[0]));
 terms.forEach(([word,zh,def],j)=>add('.matching',`${j+1}. ${def}`,choose(`match-${i}-${j}`,sorted.map(([w])=>[w,w])),word,`${word} (${zh})`));
 const matchingChecks=checks.filter(c=>c.control.id.startsWith(`match-${i}-`));
 const matchingButton=make('button','matching-check','Check answers');matchingButton.type='button';
 const matchingScore=make('p','matching-score');matchingScore.setAttribute('role','status');matchingScore.setAttribute('aria-live','polite');
 box.querySelector('.matching').append(matchingButton,matchingScore);
 matchingButton.addEventListener('click',()=>{
  let score=0;
  matchingChecks.forEach(c=>{
   const ok=normalize(c.control.value)===normalize(c.answer);if(ok)score++;
   c.f.className='feedback '+(ok?'correct':'incorrect');
   c.f.textContent=(ok?'✓ Correct. ':c.control.value?'Try again. ':'Choose an answer. ')+c.explain;
   c.control.setAttribute('aria-invalid',String(!ok));
  });
  matchingScore.textContent=`Vocabulary matching: ${score} of ${matchingChecks.length} correct.`;
 });
 box.querySelector('.reset').addEventListener('click',()=>{matchingScore.textContent=''});
 const matchingClear=make('button','matching-clear secondary','Clear answers');matchingClear.type='button';
 matchingButton.after(document.createTextNode(' '),matchingClear);
 matchingClear.addEventListener('click',()=>{
  matchingChecks.forEach(c=>{c.control.value='';c.f.textContent='';c.f.className='feedback';c.control.removeAttribute('aria-invalid')});
  matchingScore.textContent='';
  box.querySelector('.score').textContent='';
 });
 const originalBank=box.querySelector('.wordbank'), blankArea=box.querySelector('.blanks');
 const exercise=make('section','blank-exercise');blankArea.before(exercise);exercise.append(originalBank.previousElementSibling,originalBank,blankArea);
 const bank=make('div','wordbank sticky-wordbank');originalBank.replaceWith(bank);bank.setAttribute('aria-label','Word bank');bank.append(make('strong','','Word bank'));
 bank.append(make('p','bank-help','Drag a word into a blank, or tap a word and then tap a blank.'));
 const tiles=make('div','word-tiles'),announcement=make('p','bank-status','Choose a word to begin.');announcement.setAttribute('role','status');announcement.setAttribute('aria-live','polite');bank.append(tiles,announcement);
 let selected='';const words=[...new Set(lessonData.blanks[i].map(([,a])=>a))].sort();
 const selectWord=word=>{selected=word;tiles.querySelectorAll('button').forEach(t=>t.setAttribute('aria-pressed',String(t.textContent===word)));announcement.textContent=word?`Selected: ${word}. Tap a blank to place it.`:'Choose a word to begin.'};
 words.forEach(word=>{const tile=make('button','word-tile',word);tile.type='button';tile.draggable=false;tile.setAttribute('aria-pressed','false');let start=null,moved=false,suppressClick=false;
 tile.addEventListener('pointerdown',e=>{if(e.button!==0)return;start={x:e.clientX,y:e.clientY};moved=false;tile.setPointerCapture(e.pointerId)});
 tile.addEventListener('pointermove',e=>{if(!start)return;if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>6){moved=true;tile.classList.add('dragging');e.preventDefault()}});
 tile.addEventListener('pointerup',e=>{if(!start)return;if(moved){selectWord(word);const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.drop-blank');if(target&&target.closest('.practice')===box)target.placeWord(word);suppressClick=true;setTimeout(()=>{suppressClick=false},0)}start=null;tile.classList.remove('dragging')});
 tile.addEventListener('pointercancel',()=>{start=null;tile.classList.remove('dragging')});
 tile.addEventListener('click',()=>{if(suppressClick)return;selectWord(selected===word?'':word)});tile.addEventListener('dragstart',e=>{selectWord(word);e.dataTransfer.setData('text/plain',JSON.stringify({lesson:i,word}));e.dataTransfer.effectAllowed='copy'});tiles.append(tile)});
 lessonData.blanks[i].forEach(([q,a],j)=>{
  const row=make('div','item blank-row'),sentence=make('div','blank-sentence');sentence.id=`blank-${i}-${j}-label`;const parts=q.split('___');
  const target=make('button','drop-blank','Drop word here');target.type='button';target.id=`blank-${i}-${j}`;target.setAttribute('aria-label',`Question ${j+1}: ${q.replace('___','blank')}`);
  let value='';Object.defineProperty(target,'value',{get(){return value},set(v){value=v;target.textContent=v||'Drop word here';target.classList.toggle('filled',Boolean(v))}});
  const feedback=make('p','feedback');feedback.id=target.id+'-feedback';target.setAttribute('aria-describedby',feedback.id);
  const place=word=>{if(!words.includes(word))return;target.value=word;feedback.textContent='';target.removeAttribute('aria-invalid');announcement.textContent=`Placed ${word} in question ${j+1}.`;};
  target.placeWord=place;target.addEventListener('click',()=>{if(selected)place(selected);else announcement.textContent='Choose a word from the bank first.'});
  target.addEventListener('dragover',e=>{e.preventDefault();target.classList.add('drag-over');e.dataTransfer.dropEffect='copy'});target.addEventListener('dragleave',()=>target.classList.remove('drag-over'));
  target.addEventListener('drop',e=>{e.preventDefault();target.classList.remove('drag-over');try{const payload=JSON.parse(e.dataTransfer.getData('text/plain'));if(payload.lesson===i)place(payload.word)}catch{}});
  sentence.append(document.createTextNode(`${j+1}. ${parts[0]}`),target,document.createTextNode(parts[1]||''));const clear=make('button','clear-blank secondary','Clear');clear.type='button';clear.setAttribute('aria-label',`Clear answer for question ${j+1}`);clear.addEventListener('click',()=>{target.value='';feedback.textContent='';target.removeAttribute('aria-invalid');announcement.textContent=`Cleared question ${j+1}.`});row.append(sentence,clear,feedback);blankArea.append(row);checks.push({control:target,answer:a,explain:`Answer: ${a}`,f:feedback});
 });
 box.querySelector('.reset').addEventListener('click',()=>{selectWord('');blankArea.querySelectorAll('.drag-over').forEach(t=>t.classList.remove('drag-over'))});
 box.querySelector('.check').addEventListener('click',()=>{let score=0;checks.forEach(c=>{const ok=normalize(c.control.value)===normalize(c.answer);if(ok)score++;c.f.className='feedback '+(ok?'correct':'incorrect');c.f.textContent=(ok?'✓ Correct. ':'Try again. ')+c.explain;c.control.setAttribute('aria-invalid',String(!ok))});box.querySelector('.score').textContent=`You got ${score} of ${checks.length} correct. Review the feedback, then try again.`});
 box.querySelector('.reset').addEventListener('click',()=>{checks.forEach(c=>{c.control.value='';c.f.textContent='';c.control.removeAttribute('aria-invalid')});box.querySelector('.score').textContent='Practice reset. You can start again.'});
});
document.querySelectorAll('textarea').forEach(el=>{const key='u3-response-'+el.id;try{el.value=localStorage.getItem(key)||''}catch{}el.addEventListener('input',()=>{try{localStorage.setItem(key,el.value)}catch{}})});
const updateHeaderHeight=()=>document.documentElement.style.setProperty('--header-height',`${document.querySelector('header').getBoundingClientRect().height}px`);updateHeaderHeight();new ResizeObserver(updateHeaderHeight).observe(document.querySelector('header'));

