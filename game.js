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

// Short, source-based activities; no score penalties or countdown.
let vehicleStart=-999,waterRunning=false,waterRead=120,lightsOn=false,activityTimer=0,carStart=-999,fuelRunning=false,fuelTenths=0,fuelLocked=null;
const activityNames=['開燈讀表','公務車加油紀錄','核對到貨數量','開水龍頭讀表','整理清運資料'];
let arrivedStation=-1,walkRoute=[];
const stationStops=[[-5,0,-2.35],[3.2,0,-1.0],[ -4,0,3.2],[0,0,-4.7],[2.1,0,4.2]];
function routeToStation(i){
 const stop=stationStops[i];
 // Leave the current spur via the east-west road before entering another.
 const route=[];
 if(avatar[2]<1.8){route.push([avatar[0],0,1.9]);}
 else if(avatar[2]>2.0){route.push([avatar[0],0,1.9]);}
 if(i===2){
  // Truck occupies x=-5.8..-2.2 on z=1.9 after parking. Walk beside the road.
  route.length=0;
  if(avatar[2]<1.8)route.push([avatar[0],0,.65]);
  else if(avatar[2]>2.0)route.push([avatar[0],0,3.2]);
  if(avatar[2]<1.8){route.push([0,0,.65],[0,0,3.2]);}
  else if(avatar[2]<=2.0){route.push([avatar[0],0,3.2]);}
  route.push(stop.slice());
 }else route.push([stop[0],0,1.9],stop.slice());
 walkRoute=route.filter((v,j)=>j||Math.hypot(v[0]-avatar[0],v[2]-avatar[2])>.12);
 target=walkRoute.shift()||stop.slice();
}

function atStation(i){return !(i===1&&performance.now()/1000-carStart<4.3)&&active===i&&walkRoute.length===0&&Math.hypot(avatar[0]-stationStops[i][0],avatar[2]-stationStops[i][2])<.12;}
function enterStation(i){
 if(!atStation(i)){toast('小綠還在路上，抵達後再點這個地標。');return;}
 if(stationDone(i))showCards(i);else startActivity(i);
}
function visit(i){
 if(active>=0&&active!==i&&!atStation(active)){toast("請等小綠抵達目前目的地，再選下一個區域。");return;}
 if(active===i){if(atStation(i))enterStation(i);else toast('小綠正在走過去，抵達後再點這個地標。');return;}
 travelTo(i);
}
function travelTo(i){
 closeDialog();active=i;arrivedStation=-1;
 routeToStation(i);
 if(i===2)vehicleStart=performance.now()/1000;
 if(i===1)carStart=performance.now()/1000;
 if(i===0)lightsOn=true;
 update();$('#interact').hidden=false;$('#interact').disabled=true;
 $('#interact').textContent=`正在前往${tasks[i].name}…`;
 $('#interact').onclick=()=>enterStation(i);
 $('#guideText').textContent=`小綠正在前往${tasks[i].name}。抵達後，請再點該區地標開啟關卡。`;
 toast(i===2?'砂石車先沿道路進場；停妥後小綠再走到材料區定點。':`前往${tasks[i].name}，抵達後再點地標開始。`);
}
function checkArrival(){
 if(walkRoute.length&&Math.hypot(avatar[0]-target[0],avatar[2]-target[2])<.06){target=walkRoute.shift();return;}
 if(active<0||!atStation(active)||arrivedStation===active)return;
 arrivedStation=active;update();
 $('#interact').disabled=false;$('#interact').textContent=`已抵達${tasks[active].name}｜點此開始 →`;
 $('#guideText').textContent=`已抵達${tasks[active].name}！點場景上的${tasks[active].name}地標開始操作。`;
 toast(`已抵達${tasks[active].name}，請點地標開始。`);
}
function feedback(text,ok=false){$('#activityFeedback').textContent=text;$('#activityFeedback').className='feedback '+(ok?'good':'');}
function earn(i,text){if(stationDone(i))return;music.success();tasks[i].ids.forEach(id=>found.add(id));save();update();waterRunning=false;fuelRunning=false;feedback('✓ '+text,true);$('#exercise').querySelectorAll('button,input,select').forEach(e=>e.disabled=true);$('#reward').innerHTML='<button class="primary" id="seeCards">查看本區資料卡 →</button>';$('#seeCards').onclick=()=>showCards(i);$('#seeCards').focus();$('#interact').textContent=`${tasks[i].name}｜重看資料卡 →`;}
function startActivity(i){
 waterRunning=false;fuelRunning=false;const head=`<div class="eyebrow">現場小任務 / ${i+1} OF 5</div><h2 id="dialogTitle">${activityNames[i]}</h2><p class="sub">數字就在現場紀錄上。看一眼、動手試試，答錯也可以重來。</p>`;
 const body=[
 `<div class="field-art live-power">${art('power')}<output id="meterValue">燈具尚未開啟</output></div><button class="secondary" id="switchLight">打開工務所燈光</button><div id="powerQuestion" hidden><p>示範電表顯示 <b>248 度</b>。哪一筆是用電紀錄？</p><button class="option" data-power="money">電費金額：1,200 元</button><button class="option" data-power="usage">用電量：248 度</button></div>`,
 `<div class="fuel-bay" id="fuelBay"><svg viewBox="0 0 560 210" role="img" aria-label="公務車停在加油機右側，油管連接加油孔"><rect width="560" height="210" rx="18" fill="#e6edde"/><path d="M30 175h500" stroke="#b9c8ad" stroke-width="3"/><g fill="#faf3d8" stroke="#537361" stroke-width="3"><rect x="40" y="35" width="85" height="132" rx="10"/><rect x="50" y="50" width="65" height="38" rx="4" fill="#325746"/></g><text x="82" y="76" text-anchor="middle" fill="#eff4dc" font-size="17">L</text><path class="fuel-hose" d="M125 95 C177 95 139 154 186 153 L240 123" fill="none" stroke="#4d6254" stroke-width="9"/><path class="fuel-flow" d="M125 95 C177 95 139 154 186 153 L240 123" fill="none" stroke="#ecc34b" stroke-width="3" stroke-dasharray="5 10"/><g class="bay-car"><path d="M225 120l35-55h113l55 51 57 10v39H217v-35z" fill="#ecb951"/><path d="M274 77h39v40h-65zm52 0h39l43 40h-82z" fill="#65928c"/><circle cx="267" cy="163" r="24" fill="#314b40"/><circle cx="432" cy="163" r="24" fill="#314b40"/><circle cx="267" cy="163" r="11" fill="#c4d0bc"/><circle cx="432" cy="163" r="11" fill="#c4d0bc"/><rect x="320" y="128" width="62" height="21" rx="4" fill="#f9f3df"/><text x="351" y="143" text-anchor="middle" font-size="12" fill="#315442">公務車</text></g></svg><output id="fuelMeter">0.0 公升</output><p id="fuelStatus" role="status">車已停妥，開始加油後可自行停止。</p></div><div class="actions"><button class="primary" id="fuelStart">開始加油</button><button class="secondary" id="fuelStop" disabled>停止加油</button></div><p class="sub">按停止後，照著固定的公升數登錄。教學模擬最多 30.0 公升，會自動停止。</p><form id="fuelForm" hidden><label class="field">本次加油量（公升）<input id="fuelValue" type="number" min="0.1" max="30" step="0.1" inputmode="decimal" placeholder="輸入上方顯示的公升數" required></label><button class="primary">保存加油紀錄</button></form>`,
 `<div class="arrival-strip"><span>砂石車已到場 · 門禁留存車次紀錄</span></div><p>接著核對另一筆混凝土交貨。兩種材料要各自留下送貨紀錄。</p><div class="document"><small>混凝土送貨單 · 教學重建</small>已簽收數量：<b>9.0 m³</b></div><div class="ledger">登錄草稿：<strong>90.0 m³</strong></div><form id="materialForm"><label class="field">請依送貨單修正交貨數量（m³）<input id="materialValue" type="number" min="0" step="any" inputmode="decimal" placeholder="看送貨單，不用換算" required></label><button class="primary">核對並保存</button></form>`,
 `<div class="tap-scene"><div class="field-art">${art('water')}</div><div id="waterStream" class="water-stream" hidden></div><output id="waterMeter">120.000 m³</output></div><p>開啟水龍頭看看水流，再關閉讀取水錶。只抄目前讀數，不計算排放量。</p><div class="actions"><button class="secondary" id="tapOn">開水龍頭</button><button class="secondary" id="tapOff" disabled>關水並讀表</button></div><form id="waterForm" hidden><label class="field">照著水錶輸入目前讀數（m³）<input id="waterValue" type="number" min="0" step="0.001" inputmode="decimal" required></label><button class="primary">保存水錶紀錄</button></form>`,
 `<div class="field-art">${art('waste')}</div><div class="document"><small>清運車準備離場</small>請把兩張資料卡放進對應的資料夾。點卡片，再點資料夾即可。</div><div class="pair-cards"><button class="option" data-doc="waste">清運聯單<br><small>種類、重量、處理去向</small></button><button class="option" data-doc="transport">車輛進出表<br><small>日期、車號、車次</small></button></div><div class="pair-cards"><button class="secondary" data-folder="transport">運送紀錄資料夾</button><button class="secondary" data-folder="waste">廢棄物資料夾</button></div><p id="pairStatus" role="status">先選一張卡片</p>`
 ][i];
 openDialog(head+`<div id="exercise" class="exercise">${body}</div><div id="activityFeedback" class="feedback" role="status" aria-live="polite"></div><div class="actions" id="reward"></div><p class="note">本關數字為教學示意；混凝土 9.0 m³ 延續影片案例。無需上傳真實資料。</p>`);
 if(i===0){lightsOn=false;$('#switchLight').onclick=()=>{lightsOn=true;$('#meterValue').textContent='248 度';$('.live-power').classList.add('lit');$('#powerQuestion').hidden=false;$('#switchLight').disabled=true;};$$('[data-power]').forEach(b=>b.onclick=()=>b.dataset.power==='usage'?earn(i,'用電量要留下度數；冷氣維修時，也別忘了冷媒紀錄。'):feedback('金額是費用；這次要留下的是電表上的「248 度」。'));}
 if(i===1){fuelTenths=0;fuelLocked=null;
 $('#fuelStart').onclick=()=>{fuelRunning=true;fuelTenths=1;$('#fuelStart').disabled=true;$('#fuelStop').disabled=false;$('#fuelBay').classList.add('pumping');$('#fuelMeter').textContent='0.1 公升';$('#fuelStatus').textContent='加油中，按「停止加油」留下本次公升數。';};
 $('#fuelStop').onclick=stopFuel;
 $('#fuelForm').onsubmit=e=>{e.preventDefault();const raw=$('#fuelValue').value.trim();if(fuelLocked!==null&&raw!==''&&Number.isFinite(Number(raw))&&Math.abs(Number(raw)-fuelLocked/10)<.00001)earn(i,`本次 ${ (fuelLocked/10).toFixed(1) } 公升已記錄，請一併留下加油單。`);else feedback('看看上方停止後的公升數，照著輸入即可。');};
 }
 if(i===2)$('#materialForm').onsubmit=e=>{e.preventDefault();Number($('#materialValue').value)===9?earn(i,'已核對為 9.0 m³。材料各留各的單據，鋼筋也要留重量紀錄。'):feedback('送貨單是 9.0 m³，草稿多了一個 0。請依送貨單修正。');};
 if(i===3){let lockedRead=null;waterRead=120;$('#tapOn').onclick=()=>{waterRunning=true;$('#waterStream').hidden=false;$('#tapOn').disabled=true;$('#tapOff').disabled=false;$('#waterMeter').textContent='120.000 m³';};$('#tapOff').onclick=()=>{waterRunning=false;lockedRead=waterRead.toFixed(3);$('#waterStream').hidden=true;$('#waterMeter').textContent=lockedRead+' m³';$('#tapOff').disabled=true;$('#waterForm').hidden=false;$('#waterValue').focus();};$('#waterForm').onsubmit=e=>{e.preventDefault();lockedRead!==null&&$('#waterValue').value.trim()!==''&&Math.abs(Number($('#waterValue').value)-Number(lockedRead))<0.00001?earn(i,'水錶读數已保存。抄表日期與讀數一起留存。'.replace('读','讀')):feedback('把上方水錶目前的數字照著輸入即可，不必計算差值。');};}
 if(i===4){let selected=null;const matched=new Set();$$('[data-doc]').forEach(b=>b.onclick=()=>{selected=b.dataset.doc;$$('[data-doc]').forEach(x=>x.classList.toggle('selected',x===b));$('#pairStatus').textContent='已選資料卡，接著點對應的資料夾。';});$$('[data-folder]').forEach(b=>b.onclick=()=>{if(!selected){feedback('先點一張資料卡，再選資料夾。');return;}if(selected!==b.dataset.folder){feedback('看卡片上的提示：種類與重量對應廢棄物，車次對應運送。');return;}matched.add(selected);$(`[data-doc="${selected}"]`).disabled=true;b.disabled=true;b.textContent='✓ 已放入資料';selected=null;$('#pairStatus').textContent=`${matched.size} / 2 已歸檔`;if(matched.size===2)earn(i,'清運聯單與車次紀錄已各自歸檔。');});}
}
setInterval(()=>{if(waterRunning&&!$('#modal').hidden){waterRead+=0.001;const el=$('#waterMeter');if(el)el.textContent=waterRead.toFixed(3)+' m³';}},250);

setInterval(()=>{if(typeof gl!=='undefined'&&!gl){advanceWalker(.1);checkArrival();}},100);

function stopFuel(){
 if(!fuelRunning)return;
 fuelRunning=false;fuelLocked=fuelTenths;
 $('#fuelBay').classList.remove('pumping');$('#fuelStop').disabled=true;
 $('#fuelMeter').textContent=(fuelLocked/10).toFixed(1)+' 公升';
 $('#fuelStatus').textContent='已停止。把本次公升數輸入下方紀錄。';
 $('#fuelForm').hidden=false;$('#fuelValue').focus();
}
function tickFuel(){
 if(!fuelRunning||$('#modal').hidden)return;
 fuelTenths=Math.min(300,fuelTenths+1);
 $('#fuelMeter').textContent=(fuelTenths/10).toFixed(1)+' 公升';
 if(fuelTenths===300)stopFuel();
}
setInterval(tickFuel,100);

// Original procedural score: soft plucked melody and warm chords, no external audio assets.
const music=(()=>{
 let ctx=null,bus=null,timer=null,beat=0,next=0,started=false;
 let enabled=true;try{enabled=localStorage.getItem('carbon-music-v1')!=='off';}catch(e){}
 const melody=[72,null,76,79,76,null,74,null,69,null,72,76,72,null,69,null,65,null,69,72,76,null,72,null,67,null,71,74,71,null,67,null];
 const chords=[[48,55,60],[45,52,57],[41,48,53],[43,50,55]];
 function tone(note,when,duration,gain=.05){
  const osc=ctx.createOscillator(),amp=ctx.createGain();osc.type='sine';osc.frequency.value=440*Math.pow(2,(note-69)/12);
  amp.gain.setValueAtTime(0,when);amp.gain.linearRampToValueAtTime(gain,when+.012);amp.gain.exponentialRampToValueAtTime(.0001,when+duration);
  osc.connect(amp);amp.connect(bus);osc.start(when);osc.stop(when+duration+.02);osc.onended=()=>{osc.disconnect();amp.disconnect();};
 }
 function schedule(){if(!ctx||!enabled||document.hidden||ctx.state!=='running')return;
  if(next<ctx.currentTime)next=ctx.currentTime+.06;
  while(next<ctx.currentTime+.2){const n=beat%32;if(melody[n]!==null)tone(melody[n],next,.6,.09);
   if(n%8===0)chords[Math.floor(n/8)].forEach((v,i)=>tone(v,next+i*.045,2.3,.028));
   beat++;next+=60/92/2;
  }
 }
 function paint(){const b=document.querySelector('#musicToggle');if(b){b.textContent=enabled?'♫ 音樂：開':'♫ 音樂：關';b.setAttribute('aria-pressed',String(enabled));}}
 function start(){if(!enabled||document.hidden)return;try{
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  if(!ctx){ctx=new Audio();bus=ctx.createGain();bus.gain.value=.32;bus.connect(ctx.destination);}
  ctx.resume().then(()=>{next=ctx.currentTime+.08;if(!timer)timer=setInterval(schedule,80);schedule();}).catch(()=>{});
 }catch(e){}}
 function toggle(){enabled=!enabled;try{localStorage.setItem('carbon-music-v1',enabled?'on':'off');}catch(e){}paint();if(enabled){started=true;start();}else if(ctx){clearInterval(timer);timer=null;ctx.suspend().catch(()=>{});}}
 function unlock(e){if(e.target.closest&&e.target.closest('#musicToggle'))return;if(!started){started=true;start();}}
 document.addEventListener('pointerdown',unlock);document.addEventListener('keydown',unlock);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(ctx)ctx.suspend().catch(()=>{});}else if(started&&enabled)start();});
 document.querySelector('#musicToggle').onclick=toggle;paint();
 return {success(){if(!enabled||!ctx||ctx.state!=='running')return;[76,79,84].forEach((n,i)=>tone(n,ctx.currentTime+i*.1,.4,.12));}};
})();

// Minimal 3D engine. Geometry is lit in world space and rendered with a depth buffer.
const canvas=$('#world');const gl=canvas.getContext('webgl',{antialias:true,alpha:false});
let yaw=.68,pitch=.71,zoom=22, vp, width=0,height=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function setZoom(d){zoom=Math.max(16,Math.min(31,zoom+d));}
$('#left').onclick=()=>yaw-=.22;$('#right').onclick=()=>yaw+=.22;$('#zoomIn').onclick=()=>setZoom(-1.5);$('#zoomOut').onclick=()=>setZoom(1.5);$('#home').onclick=()=>{yaw=.68;pitch=.71;zoom=22;};
const sub=(a,b)=>a.map((x,i)=>x-b[i]), norm=a=>{let d=Math.hypot(...a);return a.map(x=>x/d);},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
function mul(a,b){let o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
function look(eye,at){let z=norm(sub(eye,at)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
function ortho(l,r,b,t,n,f){return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]);}
const rgb=h=>{let n=parseInt(h.replace('#',''),16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];};
let verts=[], dynamicStart=0;function triangle(a,b,c,color){const n=norm(cross(sub(b,a),sub(c,a)));[a,b,c].forEach(v=>verts.push(...v,...n,...color));}
function box(x,y,z,w,h,d,color,rot=0){let c=rgb(color),co=Math.cos(rot),si=Math.sin(rot);let pts=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(([a,b,k])=>[x+a*w/2*co+k*d/2*si,y+b*h/2,z-a*w/2*si+k*d/2*co]);[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]].forEach(q=>{triangle(pts[q[0]],pts[q[1]],pts[q[2]],c);triangle(pts[q[0]],pts[q[2]],pts[q[3]],c);});}
function cylinder(x,y,z,r,h,color,n=12,axis='y',r2=r){let c=rgb(color),point=(a,up,rr)=>axis==='x'?[x+up,y+Math.cos(a)*rr,z+Math.sin(a)*rr]:[x+Math.cos(a)*rr,y+up,z+Math.sin(a)*rr];for(let i=0;i<n;i++){let a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,p=point(a,-h/2,r),q=point(b,-h/2,r),s=point(a,h/2,r2),t=point(b,h/2,r2);triangle(p,s,t,c);triangle(p,t,q,c);triangle(point(0,h/2,0),t,s,c);triangle(point(0,-h/2,0),p,q,c);}}
function tree(x,z,size=1){cylinder(x,.6*size,z,.1*size,1.2*size,'#977a50',7);cylinder(x,1.5*size,z,.7*size,1.6*size,'#53805a',7,'y',.04);cylinder(x,2.15*size,z,.5*size,1.2*size,'#719a5f',7,'y',.02);}
function bush(x,z){cylinder(x,.4,z,.46,.8,'#769756',8,'y',.27);}
function building(x,z,w,d,h,color){box(x,h/2,z,w,h,d,color);box(x,h+.12,z,w+.25,.24,d+.25,'#f1ebd9');box(x,h+.31,z,w-.4,.14,d-.4,'#456657');for(let j=0;j<3;j++){let xx=x-w*.29+j*w*.29;box(xx,h*.55,z+d/2+.018,w*.22,h*.36,.06,'#548b8a');box(xx,h*.55,z+d/2+.056,.05,h*.38,.03,'#dbe3cf');}box(x+w/2+.02,h*.5,z,.04,h*.55,d*.65,'#4f8080');box(x,h*.14,z+d/2+.2,w+.4,.2,.5,'#e6e5cf');}
function model(){
 box(0,-.8,0,21,1.15,17,'#b0bf91');box(0,-.23,0,21.2,.16,17.2,'#d5dfb4');box(0,-.07,0,20.8,.18,16.8,'#a6bb83');
 box(0,.04,1.9,19.8,.1,2.3,'#7f9583');box(0,.045,-2.25,2.3,.11,10.5,'#7f9583');
 for(let x=-9;x<10;x+=1.65)box(x,.11,1.9,.75,.012,.08,'#e4e5bf');for(let z=-6;z<1;z+=1.6)box(0,.12,z,.08,.01,.7,'#e4e5bf');
 for(let x=-9;x<=9;x+=.68){box(x,.12,3.15,.42,.12,.18,x%1.36<.68?'#d7d7b7':'#f3ecb9');}
 box(-5,.08,-4.5,6.3,.2,4.8,'#d3d4b6');building(-5,-4.7,4.8,2.5,2.05,'#efe9d6');
 box(-5,1.72,-3.41,3.6,.48,.08,'#2d765d');box(-6.7,.54,-3.08,.35,1,.2,'#577f59');bush(-7.5,-3);
 box(4.7,.1,-4.7,6.5,.21,4.9,'#d0d3b5');building(4.8,-4.8,4.3,2.8,2.6,'#e6dcc1');
 // Solar modules on the verification office roof.
 for(let j=0;j<4;j++){box(3.5+j*.82,2.99,-4.8,.7,.13,1.7,'#294f59',0);for(let k=0;k<3;k++)box(3.5+j*.82,3.062,-5.3+k*.5,.68,.01,.025,'#7fadb0');}
 box(5.2,.1,5,6.2,.18,4,'#c8d4ab');for(let x of[3,7.2])for(let z of[3.9,6.1])cylinder(x,1.14,z,.055,2.2,'#788f63',7);box(5.1,2.3,5,4.8,.15,2.9,'#e7c75e');box(5.1,1.14,5.5,3,.15,.8,'#bda97b');for(let x of[4,6])box(x,.57,5.5,.13,1.1,.45,'#6b7d5b');
 for(let x of[4.2,5.1,6])box(x,1.26,5.5,.55,.065,.5,'#f9f3dd');
 // Concrete mixer, oriented along the road.
 box(-5.1,.67,4.7,3.6,.3,1.45,'#425b50');box(-3.7,1.23,4.7,1.05,1.05,1.5,'#e9bc47');box(-3.14,1.38,4.7,.04,.5,1.18,'#548a8c');box(-3.7,1.42,5.46,.62,.46,.03,'#538487');box(-3.7,1.42,3.94,.62,.46,.03,'#538487');box(-3.13,.8,4.7,.1,.2,1.6,'#e6e5cd');
 cylinder(-5.35,1.37,4.7,.75,1.7,'#eee9d4',14,'x',.48);cylinder(-5.15,1.37,4.7,.73,.25,'#dfad46',14,'x',.68);box(-6.65,.97,4.7,.7,.12,.4,'#a8afa0',-.18);
 for(let x of[-6,-4,-3.5])for(let z of[3.93,5.47]){cylinder(x,.55,z,.39,.18,'#364c43',12,'y');box(x,.5,z,.53,.59,.24,'#354941');cylinder(x,.54,z,.14,.63,'#b7bda3',10,'x');}
 // Small unfinished structure and tower crane.
 box(7.9,.2,-.25,2.4,.35,2.4,'#d1cbb0');for(let x of[7,8.8])for(let z of[-1.1,.7])box(x,1.35,z,.18,2.5,.18,'#c3be9e');box(7.9,2.55,-.2,2.5,.2,2.3,'#d6d0b5');
 const cx=8.9,cz=-1.8;box(cx,2.1,cz,.24,4.2,.25,'#d8a742');for(let y=.3;y<4;y+=.55){box(cx,y,cz,.7,.085,.5,'#d8a742');}box(7.2,4.35,cz,5.2,.18,.27,'#dfb34e');box(cx,4.65,cz,.7,.65,.7,'#e9c257');box(7.3,3.66,cz,.04,1.3,.04,'#546858');box(7.3,3,cz,.18,.17,.18,'#68765c');
 // Materials, planting, safety cones, fence and site lighting.
 for(let j=0;j<3;j++){box(-8.6,.16+j*.2,5.4,1.15,.16,1.2,'#b89c6b');for(let k=0;k<3;k++)box(-8.98+k*.36,.29+j*.2,5.4,.3,.11,1,'#d4c7a3');}
 for(let [x,z] of[[-2.3,3.6],[-2.3,5.8],[2,3.3],[7.8,3.1],[-7.1,3.4]]){box(x,.1,z,.4,.12,.4,'#536854');cylinder(x,.35,z,.16,.5,'#df9246',8,'y',.03);cylinder(x,.38,z,.108,.095,'#f0edcc',8,'y',.085);}
 for(let x=-9;x<=9;x+=1.4){box(x,.46,-7.5,.07,.9,.07,'#698967');}box(0,.78,-7.5,18.8,.07,.07,'#6c8a61');box(0,.35,-7.5,18.8,.07,.07,'#6c8a61');
 for(let [x,z,s] of[[-9,-6,1.1],[-9,-2,.9],[-8,7,1.1],[-4,7.1,.75],[.5,6.5,.85],[9,6.8,1.15],[9.5,-6.6,.8],[1.4,-6.7,.85],[-2.2,-6.9,.7]])tree(x,z,s);
 for(let [x,z] of[[-8.3,-6],[-8.6,-5.5],[-7.6,7],[-3,7.2],[8.7,6.8],[7.9,-6.4],[2.2,-6.8]])bush(x,z);
 for(let x of[-1.6,1.7]){cylinder(x,1.38,-1.4,.045,2.75,'#557762',7);box(x,2.77,-1.4,.45,.1,.22,'#f1dfa0');}

 // Meter, condenser fan, diesel tank, steel bundles and water / waste infrastructure.
 box(-7.3,1.3,-3.4,.65,1.05,.3,'#dae3d7');box(-7.3,1.5,-3.22,.42,.3,.035,'#355c58');
 box(-3.1,.55,-3.1,.95,.85,.55,'#ede8d9');cylinder(-3.1,.63,-2.8,.3,.08,'#6b8c83',16); 
 box(4.6,.5,-2.7,1.7,.8,.9,'#e4b54c');box(4.6,.97,-2.7,1.65,.13,.95,'#345b4b');
 for(let k=0;k<5;k++)cylinder(-7.5+k*.22,.35,3.7,.09,2,'#71847e',8,'x');
 cylinder(1.3,.65,-5.4,.65,1.2,'#78a9a2',16);box(1.3,1.28,-5.4,1.1,.08,1.1,'#d9e4d6');box(1.3,.65,-4.6,.12,1.1,.12,'#a9beb2');box(1.5,1.12,-4.6,.45,.12,.12,'#a9beb2');
 for(let j=0;j<3;j++){box(3.7+j*1.05,.55,6.8,.8,1,.75,['#557f60','#d4ab54','#6a99a1'][j]);box(3.7+j*1.05,1.1,6.8,.9,.12,.83,'#e7e4cc');}
 dynamicStart=verts.length;
}
// Smooth ellipsoid meshes: reusable topology with analytically correct normals.
const sphereCache=new Map();
function soft(x,y,z,rx,ry,rz,color,segments=16,rings=10){
 const key=segments+':'+rings;let mesh=sphereCache.get(key);
 if(!mesh){mesh=[];const point=(i,j)=>{let a=i/rings*Math.PI,b=j/segments*Math.PI*2;return [Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)];};
 for(let i=0;i<rings;i++)for(let j=0;j<segments;j++){let a=point(i,j),b=point(i+1,j),c=point(i+1,j+1),d=point(i,j+1);if(i>0)mesh.push(a,b,d);if(i<rings-1)mesh.push(b,c,d);}sphereCache.set(key,mesh);}
 const col=rgb(color);for(const v of mesh){const n=norm([v[0]/rx,v[1]/ry,v[2]/rz]);verts.push(x+v[0]*rx,y+v[1]*ry,z+v[2]*rz,...n,...col);}
}

let walkPhase=0,walkWeight=0,heading=0;
function advanceWalker(dt){
 const dx=target[0]-avatar[0],dz=target[2]-avatar[2],distance=Math.hypot(dx,dz);
 const waitingForTruck=(active===2&&performance.now()/1000-vehicleStart<4.3)||(active===1&&performance.now()/1000-carStart<4.3);
 const travel=waitingForTruck?0:Math.min(distance,2.4*dt);
 if(distance>.001&&!waitingForTruck){
  const wanted=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(wanted-heading),Math.cos(wanted-heading));
  heading+=delta*Math.min(1,dt*12);
  avatar[0]+=dx/distance*travel;avatar[2]+=dz/distance*travel;
  walkPhase+=travel/1.15*Math.PI*2;
 }
 const moving=distance>.001&&!waitingForTruck?1:0;
 walkWeight+=(moving-walkWeight)*Math.min(1,dt*14);
 if(!moving&&walkWeight<.001)walkWeight=0;
 return travel;
}
function character(worldX,worldZ,t){
 const first=verts.length,x=0,z=0;
 const swing=Math.sin(walkPhase)*walkWeight;
 const y=.02+(reduced?0:Math.abs(Math.sin(walkPhase))*walkWeight*.035);
 // Each foot swings forward while lifted, then returns along the ground.
 for(let side of[-1,1]){
  const phase=walkPhase+(side===1?Math.PI:0),stride=Math.cos(phase)*.23*walkWeight;
  const lift=Math.max(0,Math.sin(phase))*.14*walkWeight;
  const hip=[side*.15,y+.47,0],ankle=[side*.15,.13+lift,stride];
  const start=verts.length,cy=(hip[1]+ankle[1])/2,cz=(hip[2]+ankle[2])/2;
  const length=Math.hypot(hip[1]-ankle[1],hip[2]-ankle[2]);
  soft(side*.15,cy,cz,.135,length*.6,.14,'#4c5144',12,8);
  const angle=Math.atan2(hip[2]-ankle[2],hip[1]-ankle[1]),co=Math.cos(angle),si=Math.sin(angle);
  for(let k=start;k<verts.length;k+=9){let yy=verts[k+1]-cy,zz=verts[k+2]-cz;verts[k+1]=cy+co*yy-si*zz;verts[k+2]=cz+si*yy+co*zz;let ny=verts[k+4],nz=verts[k+5];verts[k+4]=co*ny-si*nz;verts[k+5]=si*ny+co*nz;}
  soft(side*.15,.09+lift,stride+.10,.16,.10,.24,'#755332',12,8);soft(side*.15,.035+lift,stride+.10,.165,.035,.245,'#303d35',12,6);
  // Arms counter-swing from shoulders.
  const armStart=verts.length,shoulderY=y+.9,angleArm=-side*swing*.48;
  soft(side*.39,y+.74,0,.135,.23,.15,'#385447',12,8);soft(side*.40,y+.54,.02,.105,.17,.11,'#edbd94',12,8);soft(side*.40,y+.40,.04,.12,.12,.11,'#efc49e',12,8);
  const ca=Math.cos(angleArm),sa=Math.sin(angleArm);
  for(let k=armStart;k<verts.length;k+=9){let yy=verts[k+1]-shoulderY,zz=verts[k+2];verts[k+1]=shoulderY+ca*yy-sa*zz;verts[k+2]=sa*yy+ca*zz;let ny=verts[k+4],nz=verts[k+5];verts[k+4]=ca*ny-sa*nz;verts[k+5]=sa*ny+ca*nz;}
 }
// Compact padded vest, big rounded head and safety helmet.
 soft(0,y+.70,0,.345,.34,.25,'#e69837');
 soft(0,y+.95,0,.22,.12,.19,'#375648');
 soft(0,y+1.29,.025,.34,.35,.30,'#efc49e',24,16);
 for(let side of[-1,1]){
  soft(side*.33,y+1.30,.02,.055,.075,.055,'#eab88f',12,8);
  soft(side*.12,y+1.36,.288,.040,.052,.017,'#453c2d',12,8);
  
  soft(side*.113,y+1.373,.304,.010,.012,.006,'#fff9ec',8,6);
  soft(side*.12,y+1.455,.27,.060,.018,.018,'#3b3027',12,6);
  soft(side*.19,y+1.25,.265,.055,.029,.012,'#efb294',12,6);
 }
 soft(0,y+1.30,.303,.047,.053,.040,'#efbd92',16,10);
 for(let j=0;j<7;j++){const u=(j-3)/3;soft(u*.065,y+1.18+u*u*.020,.285,.014,.009,.009,'#aa7459',8,6);}
 
 soft(0,y+1.59,-.01,.367,.20,.32,'#ef9d30',24,14);
 soft(0,y+1.49,.06,.408,.045,.355,'#ffb743',24,8);
 soft(0,y+1.66,.015,.028,.13,.28,'#ffc25c',12,10);
 // Reflective tape follows the vest front, with pockets and a leaf badge.
 for(let side of[-1,1]){
  soft(side*.22,y+.77,.191,.035,.22,.037,'#fff1bd',12,8);
  soft(side*.16,y+.55,.208,.112,.072,.053,'#d6842f',12,8);
 }
 soft(0,y+.66,.239,.30,.037,.027,'#f5edc9',16,8);
 box(0,y+.78,.256,.015,.31,.014,'#a76729');
 soft(.11,y+.86,.245,.047,.06,.018,'#f9f1d8',12,8);
 soft(.11,y+.865,.264,.022,.031,.009,'#4a8651',10,6);
 const co=Math.cos(heading),si=Math.sin(heading);
 for(let k=first;k<verts.length;k+=9){let xx=verts[k],zz=verts[k+2];verts[k]=worldX+co*xx+si*zz;verts[k+2]=worldZ-si*xx+co*zz;let nx=verts[k+3],nz=verts[k+5];verts[k+3]=co*nx+si*nz;verts[k+5]=-si*nx+co*nz;}
}
function marker(x,z,t,i){let c=stationDone(i)?'#659452':'#efc345';cylinder(x,.025,z,1,.035,c,32);cylinder(x,.045,z,.78,.04,'#c9d6aa',32);if(!stationDone(i)){let y=2.5+(reduced?0:Math.sin(t*2.5)*.12);cylinder(x,y,z,.18,.35,'#edbb44',4,'y',.02);}}

function siteAction(t){
 if(active===1){
 const elapsed=Math.max(0,t-carStart),q=reduced?1:Math.min(1,elapsed/4);
 // Smooth deceleration along a cubic turn, with heading from its tangent.
 const u=1-Math.pow(1-q,2),v=1-u;
 const x=v*v*v*9+3*v*v*u*5+3*v*u*u*5+u*u*u*5;
 const z=v*v*v*1.9+3*v*v*u*1.9+3*v*u*u*1.1+u*u*u*.1;
 const dx=3*v*v*(5-9),dz=6*v*u*(1.1-1.9)+3*u*u*(.1-1.1);
 const angle=Math.atan2(dz,dx)-Math.PI;
 const firstCar=verts.length;
 // Car faces local -X. The entire chassis turns as one rigid body.
 box(0,.64,0,2.2,.5,1.05,'#e7b94f');box(.1,1.06,0,1.15,.46,.94,'#e9c970');
 box(.1,1.12,.48,.93,.28,.018,'#64968f');box(.1,1.12,-.48,.93,.28,.018,'#64968f');
 for(let side of[-1,1])for(let axle of[-.72,.72]){
  const wheelStart=verts.length;
  box(axle,.34,side*.54,.45,.45,.16,'#344b40');
  box(axle,.34,side*.63,.19,.19,.015,'#b9c5af');
  const roll=u*24,cr=Math.cos(roll),sr=Math.sin(roll);
  for(let k=wheelStart;k<verts.length;k+=9){const xx=verts[k]-axle,yy=verts[k+1]-.34;verts[k]=axle+cr*xx-sr*yy;verts[k+1]=.34+sr*xx+cr*yy;const nx=verts[k+3],ny=verts[k+4];verts[k+3]=cr*nx-sr*ny;verts[k+4]=sr*nx+cr*ny;}
 }
 box(-.99,.72,0,.04,.13,.76,'#f7e3ad');
 box(1.11,.73,-.33,.015,.12,.18,q>.75?'#ef755a':'#a75b40');box(1.11,.73,.33,.015,.12,.18,q>.75?'#ef755a':'#a75b40');
 const ca=Math.cos(angle),sa=Math.sin(angle);
 for(let k=firstCar;k<verts.length;k+=9){let xx=verts[k],zz=verts[k+2];verts[k]=x+ca*xx-sa*zz;verts[k+2]=z+sa*xx+ca*zz;let nx=verts[k+3],nz=verts[k+5];verts[k+3]=ca*nx-sa*nz;verts[k+5]=sa*nx+ca*nz;}

 if(fuelRunning){for(let j=0;j<6;j++){const u=reduced?j/6:(t*.6+j/6)%1;box(4.6+u*.4,.73,-2.2+u*1.75,.04,.04,.09,'#eac956');}}
 }

 // A gravel truck enters on the road and stops; it remains distinct from the concrete case.
 if(active===2){const elapsed=Math.max(0,t-vehicleStart),progress=reduced?1:Math.min(elapsed/4,1),x=8-progress*12,z=1.9;
 box(x,.55,z,3.5,.23,1.35,'#385e4c');box(x-1.25,1.1,z,.9,.95,1.28,'#dfac44');box(x-1.71,1.25,z,.03,.42,.92,'#8db7b2');
 box(x+.5,1.03,z,2.25,.65,1.35,'#84917a');box(x+.5,1.4,z,2.1,.15,1.18,'#c5b997');
 for(let j=0;j<9;j++)box(x-.35+(j%3)*.65,1.58+Math.sin(j)*.08,z-.35+Math.floor(j/3)*.32,.38,.3,.27,'#b8b397',j*.3);
 for(let a of[-1.1,1])for(let b of[-.7,.7]){box(x+a,.42,z+b,.57,.57,.18,'#304c42');box(x+a,.42,z+b*1.03,.22,.22,.03,'#d2d5bd',reduced?0:progress*15);}
 }
 if(waterRunning){for(let j=0;j<9;j++){const fall=reduced?j/9:((t*1.5+j/9)%1);box(1.7,1.06-fall*.9,-4.6,.045,.085,.045,'#62b9cf');}}
 if(active===0&&lightsOn){for(let j=0;j<3;j++)box(-6.39+j*1.39,1.13,-3.405,.96,.62,.012,'#f2d67a');}
 if(active===1){const vibration=reduced?0:Math.sin(t*28)*.013;box(4.6,.97+vibration,-2.7,1.65,.13,.95,'#345b4b');cylinder(4.6,1.08,-2.7,.07,.05,'#e3c456',8);}
}

if(gl){
 const vertex=`attribute vec3 aPos;attribute vec3 aNormal;attribute vec3 aColor;uniform mat4 uVP;varying vec3 vColor;varying float vLight;void main(){gl_Position=uVP*vec4(aPos,1.0);vColor=aColor;vLight=.57+.43*max(dot(normalize(aNormal),normalize(vec3(-.6,1.0,.5))),0.0);}`;
 const fragment=`precision mediump float;varying vec3 vColor;varying float vLight;void main(){gl_FragColor=vec4(vColor*vLight,1.0);}`;
 function shader(type,src){let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);['aPos','aNormal','aColor'].forEach((n,i)=>{let a=gl.getAttribLocation(program,n);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,36,i*12);});let uVP=gl.getUniformLocation(program,'uVP');gl.enable(gl.DEPTH_TEST);gl.clearColor(.914,.941,.871,1);model();const base=new Float32Array(verts);
 let pointer=null, last=0;canvas.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(pointer){yaw+=(e.clientX-pointer.x)*.006;pitch=Math.max(.35,Math.min(1.15,pitch+(e.clientY-pointer.y)*.004));pointer={x:e.clientX,y:e.clientY};}});canvas.addEventListener('pointerup',()=>pointer=null);canvas.addEventListener('pointercancel',()=>pointer=null);canvas.addEventListener('wheel',e=>{e.preventDefault();setZoom(e.deltaY*.015);},{passive:false});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#fallback').hidden=false;});canvas.addEventListener('webglcontextrestored',()=>location.reload());
 function frame(ms){const t=ms/1000,dt=Math.min((ms-last)/1000,.06);last=ms;width=canvas.clientWidth;height=canvas.clientHeight;const ratio=Math.min(devicePixelRatio,2);if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(height*ratio)){canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);gl.viewport(0,0,canvas.width,canvas.height);}const aspect=width/height,mobile=width<620;const viewSize=mobile?zoom*2.4:zoom;const eye=[Math.sin(yaw)*24*Math.cos(pitch),24*Math.sin(pitch),Math.cos(yaw)*24*Math.cos(pitch)];let shift=mobile?0:width<1000?1:1.3;vp=mul(ortho(-viewSize*aspect/2+shift,viewSize*aspect/2+shift,-viewSize/2+(mobile?-1.8:1.3),viewSize/2+(mobile?-1.8:1.3),.1,90),look(eye,[0,0,0]));gl.uniformMatrix4fv(uVP,false,vp);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 verts=[];advanceWalker(dt);checkArrival();character(avatar[0],avatar[2],t);siteAction(t);tasks.forEach((s,i)=>marker(s.pos[0],s.pos[2]+1,t,i));const dyn=new Float32Array(verts);const all=new Float32Array(base.length+dyn.length);all.set(base);all.set(dyn,base.length);gl.bufferData(gl.ARRAY_BUFFER,all,gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,all.length/9);
 $$('.pin').forEach((el,i)=>{const p=tasks[i].pos;let v=[p[0],p[1]+.65,p[2],1],r=[0,0,0,0];for(let j=0;j<4;j++)for(let k=0;k<4;k++)r[j]+=vp[k*4+j]*v[k];el.style.left=(r[0]/r[3]+1)*width/2+'px';el.style.top=(1-r[1]/r[3])*height/2+'px';});requestAnimationFrame(frame);
 }requestAnimationFrame(frame);
}else{$('#fallback').hidden=false;$('#pins').style.display='none';}
