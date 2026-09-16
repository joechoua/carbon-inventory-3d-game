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
