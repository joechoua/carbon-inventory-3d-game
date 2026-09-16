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
