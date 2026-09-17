const form = document.querySelector('#briefing-form');
const steps = [...document.querySelectorAll('.step')];
const next = document.querySelector('#next');
const back = document.querySelector('#back');
const finish = document.querySelector('.finish');
const number = document.querySelector('#step-number');
const progress = document.querySelector('.progress i');
let current = Number(localStorage.getItem('pegoraro-briefing-step') || 1);
const fields = [...form.querySelectorAll('input, textarea')];
fields.forEach((field) => { const saved = localStorage.getItem(`pegoraro-${field.name}`); if (saved && field.type !== 'file') field.value = saved; field.addEventListener('input', () => localStorage.setItem(`pegoraro-${field.name}`, field.value)); });
function showStep(index){ current=Math.max(1,Math.min(steps.length,index)); steps.forEach((step,i)=>step.classList.toggle('is-active',i===current-1)); number.textContent=String(current).padStart(2,'0'); progress.style.width=`${current/steps.length*100}%`; back.style.visibility=current===1?'hidden':'visible'; next.style.display=current===steps.length?'none':'block'; finish.style.display=current===steps.length?'block':'none'; localStorage.setItem('pegoraro-briefing-step',current); }
function validate(){ const required=[...steps[current-1].querySelectorAll('[required]')]; let valid=true; required.forEach((field)=>{field.style.borderColor=field.value.trim()?'':'#a44';if(!field.value.trim())valid=false}); return valid; }
next.addEventListener('click',()=>{if(validate())showStep(current+1)});back.addEventListener('click',()=>showStep(current-1));form.addEventListener('submit',(event)=>{event.preventDefault();if(!validate())return;localStorage.clear();form.submit();});showStep(current);
