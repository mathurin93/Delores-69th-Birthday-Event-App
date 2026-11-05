/* Delores' 69th Birthday — mobile-first, dependency-free interactions. */
const TABLE_POSITIONS = {
  'head': {x:339,y:404,shape:'head'},
  '1': {x:243,y:493}, '2': {x:326,y:501},
  '3': {x:246,y:307}, '4': {x:248,y:211},
  '5': {x:126,y:128}, '6': {x:129,y:237},
  '7': {x:125,y:352}, '8': {x:98,y:465},
  '9': {x:96,y:566}, '10': {x:49,y:385,shape:'rect'},
  '11': {x:49,y:287,shape:'rect'}, '12': {x:49,y:195,shape:'rect'},
  '13': {x:244,y:575}, '14': {x:324,y:582}
};
const tableOrder = ['head', ...Array.from({length:14},(_,i)=>String(i+1))];
const state = {view:'home',selectedTable:null,selectedGuest:null,saved:readSaved(),search:''};
let toastTimer;

function readSaved(){
  try { const data=JSON.parse(localStorage.getItem('delores69-seat')); return data&&EVENT_GUESTS[data.table] ? data : null; }
  catch { return null; }
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function safeNorm(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');}
function labelFor(id){return id==='head'?'Head Table':`Table ${id}`;}
function showToast(message){const el=document.getElementById('toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true;},2600);}
function navigate(view,options={}){
  if(!['home','seating','program'].includes(view))view='home';
  state.view=view;
  document.querySelectorAll('.view').forEach(el=>{el.hidden=el.id!==`view-${view}`;});
  document.querySelectorAll('[data-go]').forEach(el=>{
    const active=el.dataset.go===view;
    if(el.classList.contains('nav-item')){
      el.classList.toggle('active',active);
      if(active) el.setAttribute('aria-current','page'); else el.removeAttribute('aria-current');
    }
  });
  if(location.hash.slice(1)!==view)history.replaceState(null,'',`#${view}`);
  if(options.top!==false)window.scrollTo({top:0,behavior:'instant'});
}
function createSVG(tag,attributes={}){let n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attributes))n.setAttribute(k,String(v));return n;}
function addMapTable(id){
  const data=TABLE_POSITIONS[id];const g=createSVG('g',{'class':'map-table', 'data-table':id, 'tabindex':'0', 'role':'button', 'aria-label':`${labelFor(id)}, ${EVENT_GUESTS[id].length} guests`, transform:`translate(${data.x} ${data.y})`});
  let shape;
  if(data.shape==='head'){
    shape=createSVG('rect',{x:-29,y:-52,width:58,height:104,rx:13,'class':'table-shape'});
  }else if(data.shape==='rect'){
    shape=createSVG('rect',{x:-22,y:-27,width:44,height:54,rx:11,'class':'table-shape'});
  }else{
    shape=createSVG('circle',{cx:0,cy:0,r:27,'class':'table-shape'});
  }
  g.appendChild(shape);
  if(id==='head'){
    const t=createSVG('text',{x:0,y:-6,'text-anchor':'middle','class':'table-subtext'});t.textContent='HEAD';g.appendChild(t);
    const t2=createSVG('text',{x:0,y:14,'text-anchor':'middle','class':'table-text'});t2.textContent='TABLE';t2.setAttribute('font-size','15');g.appendChild(t2);
  }else{
    const t=createSVG('text',{x:0,y:6,'text-anchor':'middle','class':'table-text'});t.textContent=id;g.appendChild(t);
  }
  g.addEventListener('click',()=>selectTable(id,true));
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectTable(id,true);}});
  document.getElementById('tables-layer').appendChild(g);
}
function refreshMap(){
  document.querySelectorAll('.map-table').forEach(el=>{
    const id=el.dataset.table;el.classList.toggle('is-selected',state.selectedTable===id);el.classList.toggle('is-saved',state.saved?.table===id);
    el.setAttribute('aria-pressed',state.selectedTable===id?'true':'false');
  });
  document.querySelectorAll('.table-pill').forEach(el=>{el.classList.toggle('is-current',el.dataset.table===state.selectedTable);el.setAttribute('aria-pressed',el.dataset.table===state.selectedTable?'true':'false');});
}
function refreshSeatFound(){
  const el=document.getElementById('seat-found');
  if(!state.selectedGuest){el.hidden=true;return;}
  el.hidden=false;
  el.innerHTML=`<div><div class="found-caption">WE FOUND YOUR SEAT ✦</div><div class="found-name">${escapeHtml(state.selectedGuest)}</div></div><span class="found-table">${escapeHtml(labelFor(state.selectedTable))}</span>`;
}
function selectTable(id,shouldScroll=false,guest=null){
  if(!EVENT_GUESTS[id])return;
  state.selectedTable=id;state.selectedGuest=guest || (EVENT_GUESTS[id].includes(state.selectedGuest)?state.selectedGuest:null);
  refreshMap();renderTableDetails();refreshSeatFound();
  if(shouldScroll){document.getElementById('table-details').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
}
function renderTableDetails(){
  const el=document.getElementById('table-details');
  if(!state.selectedTable){
    el.innerHTML=`<div class="empty-table"><div class="empty-icon">✧</div><h3>A seat is waiting for you</h3><p>Tap a table above or search a guest name to see the seating details.</p></div>`;return;
  }
  const people=EVENT_GUESTS[state.selectedTable];const isSaved=state.saved?.table===state.selectedTable;
  el.innerHTML=`<div class="table-details-top"><div><div class="table-details-label">YOUR SEATING GUIDE</div><h3>${escapeHtml(labelFor(state.selectedTable))}</h3><p class="table-details-sub">${state.selectedTable==='head'?'Celebrant & family':'Guests assigned to this table'}</p></div><span class="table-count">${people.length} GUESTS</span></div>
  <div class="guest-grid">${people.map(n=>`<div class="guest-entry ${state.selectedGuest===n?'is-person':''}">${escapeHtml(n)}</div>`).join('')}</div>
  <div class="table-actions"><button class="primary-button" id="save-seat" type="button">${isSaved?'✓ Seat saved':'♡ Save this table'}</button><button class="secondary-button" id="copy-seat" type="button">Copy details ↗</button></div>`;
  document.getElementById('save-seat').addEventListener('click',saveSeat);
  document.getElementById('copy-seat').addEventListener('click',copySeat);
}
function saveSeat(){
  if(!state.selectedTable)return;
  const data={table:state.selectedTable,name:state.selectedGuest};
  try{localStorage.setItem('delores69-seat',JSON.stringify(data));}
  catch{showToast('Seat selected. Saving is unavailable in this browser.');return;}
  state.saved=data;refreshMap();renderTableDetails();renderSavedSeat();showToast(`${labelFor(data.table)} saved on this device ♡`);
}
async function copySeat(){
  if(!state.selectedTable)return;
  const body=`Delores' 69th Birthday Celebration\nSunday, November 15, 2026 · 3:30 PM\n6 Westwyn Ct, Brampton, ON L6T 4T5\n${labelFor(state.selectedTable)}\n${EVENT_GUESTS[state.selectedTable].join(', ')}`;
  try{await navigator.clipboard.writeText(body);showToast('Table details copied!');}
  catch{ const el=document.createElement('textarea');el.value=body;el.style.position='fixed';el.style.opacity='0';document.body.appendChild(el);el.select();const ok=document.execCommand('copy');el.remove();showToast(ok?'Table details copied!':'Copy is unavailable in this browser.'); }
}
function renderSavedSeat(){
  const el=document.getElementById('saved-seat-home');
  if(!state.saved){el.hidden=true;return;}
  el.hidden=false;
  const name=state.saved.name?`${escapeHtml(state.saved.name)} · `:'';
  el.innerHTML=`<div class="saved-copy">YOUR SAVED SEAT<strong>${escapeHtml(labelFor(state.saved.table))}</strong><span>${name}Ready when you are ♡</span></div><button type="button" id="show-my-seat">View seat ↗</button>`;
  document.getElementById('show-my-seat').addEventListener('click',()=>{navigate('seating');selectTable(state.saved.table,true,state.saved.name||null);});
}
function renderPills(){const parent=document.getElementById('table-pills');tableOrder.forEach(id=>{
  const b=document.createElement('button');b.type='button';b.className=`table-pill ${id==='head'?'head-pill':''}`;b.dataset.table=id;b.textContent=labelFor(id);b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>selectTable(id,true));parent.appendChild(b);
});}
function showSearchResults(){
  const input=document.getElementById('guest-search');const res=document.getElementById('search-results');const q=safeNorm(input.value);state.search=input.value;
  document.getElementById('clear-search').hidden=!q;
  if(!q){res.hidden=true;res.innerHTML='';input.setAttribute('aria-expanded','false');return;}
  const list=[];for(const [id,names] of Object.entries(EVENT_GUESTS))for(const name of names)if(safeNorm(name).includes(q))list.push({id,name});
  res.hidden=false;input.setAttribute('aria-expanded','true');
  if(!list.length){res.innerHTML=`<p class="search-empty">No matching guest found. Try another spelling or ask the host for help.</p>`;return;}
  res.innerHTML=list.slice(0,20).map(({id,name})=>`<button type="button" class="search-result" data-guest="${escapeHtml(name)}" data-table="${id}"><span><strong>${escapeHtml(name)}</strong><small>Tap to view seat on the floor plan</small></span><span class="result-number">${escapeHtml(labelFor(id))}</span></button>`).join('')+(list.length>20?`<p class="search-empty">Showing the first 20 matches. Keep typing to narrow the list.</p>`:'');
  res.querySelectorAll('button[data-table]').forEach(b=>b.addEventListener('click',()=>{
    const {table,guest}=b.dataset;input.value=guest;state.search=guest;res.hidden=true;input.setAttribute('aria-expanded','false');document.getElementById('clear-search').hidden=false;
    selectTable(table,true,guest);saveSeat();
  }));
}
function renderProgram(){
 const timeline=document.getElementById('timeline');
 timeline.innerHTML=EVENT_PROGRAM.map((item,index)=>{
   const extra=item.details.map(d=>`<p>${escapeHtml(d)}</p>`).join('');
   return `<div class="moment"><div class="moment-clock">${escapeHtml(item.time.replace(' PM',''))}<small style="font-size:8px;display:block;letter-spacing:.09em;color:#ad9094">PM</small></div><button type="button" class="moment-card ${[3,7,10,12].includes(index)?'featured':''}" aria-expanded="false" aria-controls="moment-info-${index}" data-index="${index}"><div class="moment-card-top"><div><span class="moment-tag">${escapeHtml(item.category)}</span><h3>${escapeHtml(item.title)}</h3><p class="moment-short">${escapeHtml(item.subtitle)}</p></div><span class="moment-toggle" aria-hidden="true">+</span></div><div class="moment-expanded" id="moment-info-${index}">${extra}</div></button></div>`;
 }).join('');
 timeline.querySelectorAll('.moment-card').forEach(el=>el.addEventListener('click',()=>{
   const open=el.getAttribute('aria-expanded')==='true';el.setAttribute('aria-expanded',open?'false':'true');
 }));
}
function updateCountdown(){
 const el=document.getElementById('countdown-value');const diff=new Date('2026-11-15T15:30:00-05:00').getTime()-Date.now();
 if(diff<=0){el.textContent='Celebrating Delores ♡';return;}
 const days=Math.floor(diff/86400000),hours=Math.floor((diff%86400000)/3600000);
 el.textContent=days>0?`${days} day${days!==1?'s':''} to go!`:`${hours} hour${hours!==1?'s':''} to go!`;
}
function init(){
 document.getElementById('guest-count').textContent=Object.values(EVENT_GUESTS).reduce((count,n)=>count+n.length,0);
 tableOrder.forEach(addMapTable);renderPills();renderProgram();renderTableDetails();renderSavedSeat();refreshMap();
 document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
 document.getElementById('guest-search').addEventListener('input',showSearchResults);
 document.getElementById('guest-search').addEventListener('keydown',e=>{
   if(e.key==='Escape'){e.currentTarget.value='';showSearchResults();}
   if(e.key==='Enter'){const first=document.querySelector('.search-result');if(first){e.preventDefault();first.click();e.currentTarget.blur();}}
 });
 document.getElementById('clear-search').addEventListener('click',()=>{const i=document.getElementById('guest-search');i.value='';showSearchResults();i.focus();});
 if(state.saved){state.selectedTable=state.saved.table;state.selectedGuest=state.saved.name;refreshMap();renderTableDetails();refreshSeatFound();}
 const initial=location.hash.slice(1);navigate(['home','seating','program'].includes(initial)?initial:'home',{top:false});
 window.addEventListener('hashchange',()=>navigate(location.hash.slice(1)));
 updateCountdown();setInterval(updateCountdown,60000);
}
document.addEventListener('DOMContentLoaded',init);
