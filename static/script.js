(function(){
const body=document.body, themeButtons=document.querySelectorAll('[data-theme-toggle]');
function applyTheme(theme){body.classList.toggle('light-mode',theme==='light');themeButtons.forEach(b=>b.textContent=theme==='light'?'🌙':'☀️');}
applyTheme(localStorage.getItem('secureupi-theme')||'dark');
themeButtons.forEach(btn=>btn.addEventListener('click',()=>{const next=body.classList.contains('light-mode')?'dark':'light';localStorage.setItem('secureupi-theme',next);applyTheme(next);}));
const form=document.getElementById('fraudForm'),loading=document.getElementById('loading'),button=form&&form.querySelector('.analyze-btn');
if(form&&loading)form.addEventListener('submit',()=>{loading.classList.add('show');if(button){button.disabled=true;button.classList.add('is-loading');const label=button.querySelector('span');if(label)label.textContent='Analyzing...';}});
const counter=document.getElementById('counter'),fill=document.getElementById('progressFill');
if(counter&&fill){const target=Math.max(0,Math.min(100,Number(counter.dataset.target||0))),start=performance.now(),duration=1200;function animate(now){const p=Math.min((now-start)/duration,1),e=1-Math.pow(1-p,3),current=target*e;counter.textContent=current.toFixed(1);fill.style.width=current+'%';if(p<1)requestAnimationFrame(animate)}requestAnimationFrame(animate)}
const dropZone=document.getElementById('dropZone'),fileInput=document.getElementById('fileInput'),fileName=document.getElementById('fileName'),bulkForm=document.getElementById('bulkForm');
if(dropZone&&fileInput){dropZone.addEventListener('click',()=>fileInput.click());['dragenter','dragover'].forEach(e=>dropZone.addEventListener(e,x=>{x.preventDefault();dropZone.classList.add('dragover')}));['dragleave','drop'].forEach(e=>dropZone.addEventListener(e,x=>{x.preventDefault();dropZone.classList.remove('dragover')}));dropZone.addEventListener('drop',e=>{if(e.dataTransfer.files.length){fileInput.files=e.dataTransfer.files;updateFileName()}});fileInput.addEventListener('change',updateFileName);function updateFileName(){if(fileInput.files.length&&fileName){fileName.textContent='Selected: '+fileInput.files[0].name;dropZone.classList.add('has-file')}}}
if(bulkForm)bulkForm.addEventListener('submit',()=>{const btn=bulkForm.querySelector('.analyze-btn');if(btn){btn.disabled=true;btn.classList.add('is-loading');const s=btn.querySelector('span');if(s)s.textContent='Scanning dataset...';}});
window.addEventListener('load',()=>{document.querySelectorAll('.tile').forEach((el,i)=>{el.style.setProperty('--delay',Math.min(i*45,300)+'ms')})});
})();
