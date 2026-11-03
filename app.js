const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el};
const normalize=s=>s.trim().toLowerCase().replace(/[.!?]+$/,'').replace(/\s+/g,' ');
const choose=(id,options)=>{const s=make('select');s.id=id;const empty=make('option','','Choose an answer');empty.value='';s.append(empty);options.forEach(([v,t])=>{const o=make('option','',t);o.value=v;s.append(o)});return s};
document.querySelectorAll('.practice').forEach(box=>{
 const i=Number(box.dataset.lesson), checks=[];
 const add=(holder,prompt,control,answer,explain)=>{const row=make('div','item');const label=make('label','',prompt);label.htmlFor=control.id;const f=make('p','feedback');f.id=control.id+'-feedback';control.setAttribute('aria-describedby',f.id);row.append(label,control,f);box.querySelector(holder).append(row);checks.push({control,answer,explain,f})};
 lessonData.tf[i].forEach(([q,a,e],j)=>add('.tf',`${j+1}. ${q}`,choose(`tf-${i}-${j}`,[['true','True'],['false','False']]),String(a),e));
 const terms=lessonData.vocab[i];const sorted=[...terms].sort((a,b)=>a[0].localeCompare(b[0]));
 terms.forEach(([word,zh,def],j)=>add('.matching',`${j+1}. ${def}`,choose(`match-${i}-${j}`,sorted.map(([w])=>[w,w])),word,`${word} (${zh})`));
 lessonData.blanks[i].forEach(([q,a],j)=>{const input=make('input');input.type='text';input.id=`blank-${i}-${j}`;input.autocomplete='off';input.spellcheck=false;add('.blanks',`${j+1}. ${q}`,input,a,`Answer: ${a}`)});
 box.querySelector('.check').addEventListener('click',()=>{let score=0;checks.forEach(c=>{const ok=normalize(c.control.value)===normalize(c.answer);if(ok)score++;c.f.className='feedback '+(ok?'correct':'incorrect');c.f.textContent=(ok?'✓ Correct. ':'Try again. ')+c.explain;c.control.setAttribute('aria-invalid',String(!ok))});box.querySelector('.score').textContent=`You got ${score} of ${checks.length} correct. Review the feedback, then try again.`});
 box.querySelector('.reset').addEventListener('click',()=>{checks.forEach(c=>{c.control.value='';c.f.textContent='';c.control.removeAttribute('aria-invalid')});box.querySelector('.score').textContent='Practice reset. You can start again.'});
});
document.querySelectorAll('textarea').forEach(el=>{const key='u3-response-'+el.id;try{el.value=localStorage.getItem(key)||''}catch{}el.addEventListener('input',()=>{try{localStorage.setItem(key,el.value)}catch{}})});
document.querySelector('#save-draft').addEventListener('click',()=>{const blob=new Blob([document.querySelector('#draft').value],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=make('a');a.href=url;a.download='my-inquiry-reply.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
