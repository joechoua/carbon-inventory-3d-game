'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const items=[
 ['用電','照明、電腦和設備運轉，都會留下用電資料。','電費單、電表抄表紀錄','power'],
 ['冷氣與冷媒','冷氣除了用電，維修與冷媒補充紀錄也值得保留。','冷氣維修單、冷媒紀錄','ac'],
 ['公務車燃料','公務車使用的燃料，要留下每次加油公升數與單據。','加油單、油料領用紀錄','fuel'],
 ['混凝土','一車混凝土抵達，記得留下實際交貨的數量與單位。','送貨單、簽收紀錄；案例：9.0 m³','truck'],
 ['鋼筋','材料的重量與進場數量，可以從交貨紀錄找到。','鋼筋送貨單、磅單','steel'],
 ['用水','沒有冒煙的活動也有資料線索。先把用水量留下來。','水費單、水錶紀錄','water'],
 ['廢棄物','清運時留下種類、重量與去向，日後就有資料可查。','廢棄物清運聯單','waste'],
 ['運送紀錄','材料進場與廢棄物清運，可能需要車次或運送資料。','車輛進出登記、運送紀錄','record']
];
const tasks=[
 {name:'工務所',place:'用電與冷氣',pos:[-5,2.7,-4.4],ids:[0,1],guide:'工務所裡藏著兩種線索：用電，以及冷氣維修紀錄。'},
 {name:'機具區',place:'公務車與加油',pos:[4.7,2,-3.3],ids:[2],guide:'公務車停妥後，自己開始及停止加油，再登錄公升數。'},
 {name:'材料區',place:'混凝土與鋼筋',pos:[-5,2.1,4.1],ids:[3,4],guide:'送貨單不只是簽收用，它也記下進場的數量。'},
 {name:'用水站',place:'水錶與用量',pos:[1.2,2,-5.4],ids:[5],guide:'用水看不到煙，仍然有值得留下的用量資料。'},
 {name:'清運區',place:'廢棄物與運送',pos:[5.2,2.3,5.5],ids:[6,7],guide:'收工後，離開工地的廢棄物與運送也有紀錄。'}
];
let found=new Set(),active=-1,lastFocus=null,toastTimer,target=[-1,0,4.7],avatar=[-1,0,4.7];
try{const a=JSON.parse(localStorage.getItem('carbon-treasure-3d-v2'));if(Array.isArray(a))found=new Set(a.filter(i=>Number.isInteger(i)&&i>=0&&i<8));}catch(e){}
const stationDone=i=>tasks[i].ids.every(id=>found.has(id));
function save(){try{localStorage.setItem('carbon-treasure-3d-v2',JSON.stringify([...found]));}catch(e){}}
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000);}
function art(type){const g={
 power:'<rect x="65" y="25" width="110" height="115" rx="12" fill="#f6f3df"/><rect x="82" y="43" width="76" height="32" rx="5" fill="#476e63"/><path d="M128 85l-25 27h18l-8 24 28-31h-19z" fill="#dab44e"/>',
 ac:'<rect x="35" y="42" width="170" height="95" rx="12" fill="#f4f0df"/><circle cx="98" cy="90" r="33" fill="#9ab4a2"/><path d="M98 61v58M69 90h58M77 69l42 42M77 111l42-42" stroke="#476e63" stroke-width="5"/><path d="M150 66h33m-33 13h33m-33 13h33m-33 13h33" stroke="#9ab4a2" stroke-width="4"/>',
 fuel:'<rect x="65" y="42" width="100" height="100" rx="15" fill="#dcb651"/><path d="M88 44V29h42v15" fill="none" stroke="#476e63" stroke-width="8"/><path d="M116 64c-38 40-25 54 0 54s38-14 0-54" fill="#f9f1d4"/>',
 truck:'<rect x="32" y="103" width="181" height="17" rx="5" fill="#476e63"/><path d="M161 60h29l23 30v25h-52z" fill="#dbb34d"/><path d="M170 68h15l15 22h-30z" fill="#6c9994"/><ellipse cx="96" cy="80" rx="50" ry="35" fill="#f5f0db"/><path d="M84 48l27 63" stroke="#d9b350" stroke-width="16"/><circle cx="65" cy="123" r="16" fill="#35564b"/><circle cx="182" cy="123" r="16" fill="#35564b"/>',
 steel:'<path d="M45 112l131-64M45 95l131-64M60 132l131-64M80 135l131-64" stroke="#65857a" stroke-width="13"/><path d="M94 63l37 64M141 40l38 64" stroke="#d6b653" stroke-width="8"/>',
 water:'<path d="M66 137V75h98" fill="none" stroke="#8bad9f" stroke-width="22"/><path d="M163 69v26" stroke="#8bad9f" stroke-width="18"/><path d="M113 75V47m-21 0h44" stroke="#446d60" stroke-width="10"/><path d="M163 106c-28 30-17 44 0 44s28-14 0-44" fill="#74a9ae"/>',
 waste:'<path d="M67 55h108l-12 90H79z" fill="#759779"/><path d="M56 52h130M100 35h40" stroke="#486d59" stroke-width="10"/><path d="M101 78v48m23-48v48m23-48v48" stroke="#d9e5cb" stroke-width="6"/>',
 record:'<rect x="65" y="30" width="115" height="122" rx="8" fill="#f8f4e5"/><rect x="91" y="22" width="62" height="20" rx="5" fill="#d9b353"/><path d="M108 66h48m-48 24h48m-48 24h48" stroke="#a0b4a0" stroke-width="5"/><path d="M80 65l6 6 12-13m-18 31l6 6 12-13m-18 31l6 6 12-13" fill="none" stroke="#54866a" stroke-width="4"/>'};return `<svg viewBox="0 0 240 170" role="img" aria-label="${items.find(i=>i[3]===type)?.[0]||''}插圖"><ellipse cx="120" cy="149" rx="90" ry="11" fill="#ccdac5"/>${g[type]}</svg>`;}
function update(){
 $('#counter').textContent=`${found.size} / 8 線索`;$('#bar').style.width=found.size/8*100+'%';
 $('#missions').innerHTML=tasks.map((t,i)=>`<button class="mission ${stationDone(i)?'done':i===active?'current':''}" data-task="${i}"><span class="num">${stationDone(i)?'✓':String(i+1).padStart(2,'0')}</span><span><b>${t.name}</b><small>${t.ids.filter(id=>found.has(id)).length} / ${t.ids.length} 線索</small></span><span class="arrow">↗</span></button>`).join('');
 $$('[data-task]').forEach(b=>b.onclick=()=>visit(+b.dataset.task));
 $$('.pin').forEach((b,i)=>{b.className='pin '+(stationDone(i)?'done':'active');b.innerHTML=`<em>${stationDone(i)?'✓':i+1}</em>${tasks[i].name}`;});
 $('#guideText').textContent=found.size===8?'八種線索收集完成！打開圖鑑，帶走日常留存提醒。':active>=0?tasks[active].guide:'選一個工地地標，小綠帶你認識值得留下的資料。';
 $('#album').textContent=found.size===8?'查看完整線索圖鑑 ✓':`打開線索圖鑑 · ${found.size}/8`;
}
function openDialog(html){if($('#modal').hidden)lastFocus=document.activeElement;$('#dialogContent').innerHTML=html;$('#modal').hidden=false;$('header').inert=true;$('main').inert=true;$('.dialog').scrollTop=0;$('.dialog').focus();}
function closeDialog(){waterRunning=false;fuelRunning=false;$('#modal').hidden=true;$('header').inert=false;$('main').inert=false;if(lastFocus&&document.contains(lastFocus))lastFocus.focus();}
function showCards(i){active=i;target=stationStops[i].slice();update();const t=tasks[i];openDialog(`<div class="eyebrow">FIELD NOTES / ${String(i+1).padStart(2,'0')}</div><h2 id="dialogTitle">${t.place}</h2><p class="sub">${t.guide} 點一下，把線索收進圖鑑。</p><div class="collect-grid">${t.ids.map(id=>{const a=items[id];return `<article class="discovery"><div class="field-art">${art(a[3])}</div><h3>${a[0]}</h3><p>${a[1]}</p><div class="document"><small>平常記得留下</small>${a[2]}</div><button class="primary ${found.has(id)?'collected-label':''}" data-collect="${id}" ${found.has(id)?'disabled':''}>${found.has(id)?'✓ 已收進圖鑑':'收集這個線索 ＋'}</button></article>`}).join('')}</div><div class="actions"><button class="secondary" id="back">回到工地</button><button class="primary" id="next">繼續探索 →</button></div>`);
 $$('[data-collect]').forEach(b=>b.onclick=()=>{const id=+b.dataset.collect;found.add(id);save();b.disabled=true;b.classList.add('collected-label');b.textContent='✓ 已收進圖鑑';update();toast(`已收集：${items[id][0]}`);});
 $('#back').onclick=closeDialog;$('#next').onclick=()=>{closeDialog();toast('回到工地，點選你想探索的下一個區域。');};
}
function showAlbum(){openDialog(`<div class="eyebrow">MY FIELD GUIDE / ${found.size} OF 8</div><h2 id="dialogTitle">${found.size===8?'你已看見日常裡的盤查線索。':'我的資料線索圖鑑'}</h2><p class="sub">看見相關活動，先把紀錄留下。實際納入與分類由盤查人員依公司方法確認。</p><div class="album-grid">${items.map((a,id)=>`<button class="album-tile ${found.has(id)?'':'missing'}" data-review="${id}">${art(a[3])}<b>${found.has(id)?'✓ ':''}${a[0]}</b><small>${found.has(id)?a[2]:'前往現場探索'}</small></button>`).join('')}</div><div class="actions"><button class="secondary" id="replay">重新尋寶</button><button class="primary" id="return">回到工地</button></div>`);$$('[data-review]').forEach(b=>b.onclick=()=>visit(tasks.findIndex(t=>t.ids.includes(+b.dataset.review))));$('#return').onclick=closeDialog;$('#replay').onclick=()=>{found.clear();active=-1;arrivedStation=-1;walkRoute=[];target=avatar.slice();waterRunning=false;waterRead=120;vehicleStart=-999;$('#interact').hidden=true;save();update();closeDialog();toast('新的尋寶開始了，五個場景都可以自由探索。');};}
$('#album').onclick=showAlbum;$('#close').onclick=closeDialog;$('#modal').onclick=e=>{if(e.target===$('#modal'))closeDialog();};
$('#help').onclick=()=>{openDialog('<div class="eyebrow">HOW TO PLAY</div><h2 id="dialogTitle">走到現場，動手留下紀錄。</h2><p class="sub">五個場景自由探索：開燈讀表、操作加油、核對送貨單、開水讀表及配對清運文件。先點地標讓小綠走到目的地，抵達後再點一次地標開始操作。答案都在畫面中，不用背公式。<br><br>拖曳工地可以旋轉，使用 ＋／− 調整遠近。手機也可以直接點任務卡。<br>鍵盤 1–5 選站、左右鍵旋轉、Esc 關閉圖卡。<br><br>不計時、不扣分；進度只存在這個瀏覽器。圖鑑可隨時打開回看。</p><button class="primary" id="go">回到工地 →</button>');$('#go').onclick=closeDialog;};
document.addEventListener('keydown',e=>{if(!$('#modal').hidden){if(e.key==='Escape')closeDialog();if(e.key==='Tab'){const f=$$('.dialog button,.dialog input,.dialog select').filter(x=>!x.disabled&&!x.closest('[hidden]')),a=f[0],b=f[f.length-1];if(e.shiftKey&&(document.activeElement===a||document.activeElement===$('.dialog'))){e.preventDefault();b.focus();}else if(!e.shiftKey&&(document.activeElement===b||document.activeElement===$('.dialog'))){e.preventDefault();a.focus();}}return;}if(/^[1-5]$/.test(e.key))visit(+e.key-1);if(e.key==='ArrowLeft'){e.preventDefault();yaw-=.15;}if(e.key==='ArrowRight'){e.preventDefault();yaw+=.15;}if(e.key==='+')setZoom(-1);if(e.key==='-')setZoom(1);});
tasks.forEach((t,i)=>{const b=document.createElement('button');b.className='pin';b.onclick=()=>visit(i);b.setAttribute('aria-label',t.place);$('#pins').append(b);});update();
