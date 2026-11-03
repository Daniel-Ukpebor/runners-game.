// RUNNERS 3 / chapter progression, save data, story, replay ghost and original procedural audio.
export const LEVELS=[
 {id:'steps',chapter:'01',name:'THE STEPS',subtitle:'ROOFLINE TRIAL',rival:'Riven',speed:8.25,color:'#e9b280',reward:65,
  positions:[[0,0,11,18],[0,21,11.5,18],[-2.3,42,12,18],[-1,63,11,18],[2,84,11.5,18],[3.1,105,11.5,18],[1.4,126,11.5,18],[-.5,147,11.5,18],[-1.4,168,12,18]],
  hazards:[{roof:1,kind:'crate',dx:-1.4,dz:1.5},{roof:2,kind:'beam',dx:0,dz:2},{roof:3,kind:'crate',dx:1.1,dz:0},{roof:4,kind:'barrier',dx:0,dz:2},{roof:5,kind:'crate',dx:-1.7,dz:1.5},{roof:6,kind:'beam',dx:0,dz:1},{roof:7,kind:'crate',dx:1.4,dz:2}]},
 {id:'market',chapter:'02',name:'THE MARKETLINE',subtitle:'ABOVE THE MARKET',rival:'Sable',speed:8.8,color:'#8dd9c6',reward:85,
  positions:[[0,0,11,18],[1.6,21,11,18],[4.3,42,11,18],[2.8,63,10.7,18],[-1.2,84,10.7,18],[-4.2,105,11.2,18],[-3.6,126,11.4,18],[.1,147,10.8,18],[3.6,168,11,18],[1.7,189,11.2,18],[-1.5,210,12,18]],
  hazards:[{roof:1,kind:'beam',dx:0,dz:1},{roof:2,kind:'crate',dx:-1.1,dz:2},{roof:3,kind:'barrier',dx:0,dz:0},{roof:4,kind:'beam',dx:0,dz:2},{roof:5,kind:'crate',dx:1.1,dz:2},{roof:6,kind:'barrier',dx:0,dz:-1},{roof:7,kind:'crate',dx:-1.2,dz:1},{roof:8,kind:'beam',dx:0,dz:2},{roof:9,kind:'barrier',dx:0,dz:0}]},
 {id:'nightline',chapter:'03',name:'THE NIGHTLINE',subtitle:'THE LAST LOOKOUT',rival:'Vale',speed:9.35,color:'#e0a4c0',reward:110,
  positions:[[0,0,11,18],[-2,21,11,18],[-4.4,42,10.8,18],[-1.2,63,10.8,18],[2.6,84,11,18],[5.2,105,10.8,18],[2.1,126,10.8,18],[-2,147,11,18],[-4.9,168,11.2,18],[-1.7,189,10.5,18],[2.3,210,10.8,18],[0,231,12,18]],
  hazards:[{roof:1,kind:'barrier',dx:0,dz:0},{roof:2,kind:'beam',dx:0,dz:2},{roof:3,kind:'crate',dx:1,dz:0},{roof:4,kind:'beam',dx:0,dz:1},{roof:5,kind:'barrier',dx:0,dz:2},{roof:6,kind:'crate',dx:-1.1,dz:1},{roof:7,kind:'barrier',dx:0,dz:0},{roof:8,kind:'beam',dx:0,dz:2},{roof:9,kind:'crate',dx:1,dz:0},{roof:10,kind:'barrier',dx:0,dz:2}]}
];
export const STORIES=[
 [
  {time:'TEN YEARS EARLIER',where:'THE STEPS / MARKET STREET',who:'RIVEN, AGE 9',text:'“Last one to the bell tower carries the groceries.”',desc:'Two kids. One shortcut across the old neighborhood. The first race wasn’t supposed to count.'},
  {time:'THAT SUMMER',where:'VESPER / EVERY ROOFTOP',who:'KAI',text:'“We can race the whole city one day.”',desc:'Kai and Riven mapped shortcuts on scraps of paper, argued about finish lines, and kept racing until the streetlights came on.'},
  {time:'PRESENT DAY',where:'THE STEPS / ROOFLINE',who:'RIVEN',text:'“The city’s running the Midnight Circuit. Three districts. Three qualifiers. You coming?”',desc:'Riven has already entered. Kai has one afternoon to prove that those childhood races still mean something.'},
  {time:'CHAPTER ONE',where:'THE STEPS / START LINE',who:'RIVEN',text:'“Same bell tower. This time, no shortcuts through the street.”',desc:'Reach the finish first. Jump rooftop gaps, slide beneath low beams, and collect signals for upgrade credits.'}
 ],
 [
  {time:'AFTER THE BELL TOWER',where:'OLD MARKET / DISTRICT TWO',who:'SABLE',text:'“Riven ran a straight line. That won’t work up here.”',desc:'Sable grew up threading narrow market rooftops as a courier. She knows every rooftop obstacle and every crowded shortcut.'},
  {time:'CHAPTER TWO',where:'THE MARKETLINE / SUNSET',who:'KAI',text:'“Then show me the real route.”',desc:'Two circuits remain before the Midnight Run. The Marketline turns harder, and Sable won’t slow down for anyone.'}
 ],
 [
  {time:'THE LAST QUALIFIER',where:'NORTH LOOKOUT / DISTRICT THREE',who:'VALE',text:'“The first two were warm-ups. This one decides who runs after dark.”',desc:'Vale has been the fastest runner on the Nightline for three years. Even Riven hasn’t beaten their time.'},
  {time:'CHAPTER THREE',where:'THE NIGHTLINE / FINAL RACE',who:'KAI',text:'“I didn’t come this far to watch someone else finish.”',desc:'A longer route. Narrower landings. One final rival before the Midnight Circuit.'}
 ]
];
const SAVE_KEY='runners.save.v3';
const fresh=()=>({wallet:0,unlocked:[true,false,false],wins:[0,0,0],bests:[null,null,null],ghosts:[null,null,null],storySeen:[false,false,false],upgrades:{pace:0,spring:0,grip:0},muted:false});
function loadSave(){
 let x=fresh();try{const a=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(a&&typeof a==='object')x={...x,...a,upgrades:{...x.upgrades,...(a.upgrades||{})}}}catch(e){}
 for(const k of ['bests','ghosts','wins','unlocked','storySeen'])if(!Array.isArray(x[k]))x[k]=fresh()[k];
 return x;
}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function createSystems({THREE,getScene,onLaunch,onMenu,onStyle}){
 let save=loadSave(),level=0,tab='story',scene=null,ghost=null,ghostFrame=[],ghostIndex=0,record=[],lastRecord=-1,cutsceneIndex=0,audio=null,master=null,audioStep=0,nextBeat=0,active=false,audioEnabled=false;
 const $=id=>document.getElementById(id);
 const persist=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(e){console.warn('RUNNERS save could not be stored',e)}};
 const getLevel=()=>LEVELS[level];
 function updateHud(){
  const l=getLevel();
  $('chapter-label').textContent='VESPER / CH.'+l.chapter+' — '+l.name;
  $('race-label').textContent=l.name+' → FINISH';
  $('best').textContent=save.bests[level]===null?'—':Number(save.bests[level]).toFixed(1)+'s';
  $('coin-count').textContent=String(save.wallet);
  $('ghost-indicator').textContent=save.ghosts[level]?'GHOST ON':'NO GHOST YET';
  $('ghost-indicator').classList.toggle('ghost-ready',!!save.ghosts[level]);
  $('menu-credits').textContent=String(save.wallet);
 }
 function createUI(){
  const menu=$('splash').querySelector('.menu');
  const title=menu.querySelector('.hero-label');
  title.innerHTML='THE STEPS <span style="color:#dba87f">/</span> A CITY TO OUTRUN';
  const story=menu.querySelector('.story');
  story.innerHTML='Kai and Riven started racing through Vesper when they were kids. Now the <strong>Midnight Circuit</strong> is open, and old promises have turned into real rivalries. <strong>Three districts. Three rivals. Your best times.</strong>';
  menu.querySelector('.featureline').innerHTML='<span>STORY RACES</span><span>TIME GHOSTS</span><span>UPGRADES</span>';
  $('start').textContent='CONTINUE STORY  ↗';
  const select=document.createElement('nav');select.id='menu-nav';select.setAttribute('aria-label','Game menu');
  select.innerHTML='<button data-tab="story" class="nav-active">STORY</button><button data-tab="races">RACES</button><button data-tab="upgrades">UPGRADES</button><button data-tab="customize">CUSTOMIZE</button>';
  menu.insertBefore(select,title);
  const content=document.createElement('div');content.id='menu-content';menu.insertBefore(content,menu.querySelector('.featureline'));
  menu.querySelector('.meta').textContent='BUILD 0.3 · Your progress, upgrades and best-run ghosts are saved on this device. Open in Safari for landscape and audio.';
  const aside=$('splash').querySelector('.customize');
  aside.id='customize-panel';
  const build=document.createElement('div');
  build.innerHTML='<div class="custom-label">BODY / GENDER PRESENTATION</div><div class="swatches build-options"><button class="hair-choice" data-build="0">MASCULINE</button><button class="hair-choice" data-build="1">FEMININE</button><button class="hair-choice" data-build="2">ANDROGYNOUS</button></div><div class="custom-subnote">All styles, outfits and abilities are available to every runner.</div>';
  const first=aside.querySelector('.custom-title');
  first.insertAdjacentElement('afterend',build);
  const hairs=aside.querySelector('[data-hair="2"]');
  hairs.insertAdjacentHTML('afterend','<button class="hair-choice" data-hair="3">AFRO</button><button class="hair-choice" data-hair="4">BRAIDS</button><button class="hair-choice" data-hair="5">LOCS</button>');
  const oldSkin=['#e0ad87','#c18b66','#9c674c','#633e32','#efc7a6','#8e5b46'];
  const newSkin=['#edc7a5','#d8a47b','#b77c58','#89583e','#573728','#c99169'];
  aside.querySelectorAll('[data-skin]').forEach((b,i)=>b.style.background=newSkin[i]);
  $('sound').textContent=save.muted?'SOUND OFF':'SOUND ON';
  const hudMeta=$('hud').querySelector('.bottom-meta');
  hudMeta.firstElementChild.id='race-label';
  const readout=hudMeta.lastElementChild;
  readout.classList.add('hud-readout');
  readout.insertAdjacentHTML('afterbegin','<span class="hud-credits">◈ <span id="coin-count">0</span></span>');
  const ghostTag=document.createElement('div');ghostTag.id='ghost-indicator';ghostTag.textContent='NO GHOST YET';$('hud').appendChild(ghostTag);
  const modal=$('modal').querySelector('.modal-buttons');
  const third=document.createElement('button');third.id='modal-tertiary';third.className='secondary';third.textContent='MAIN MENU';modal.appendChild(third);
  third.addEventListener('click',()=>{const mode=$('modal').dataset.action;if(mode==='next'){selectRace(level+1);startStory();}else if(mode==='restart'){onLaunch();}else onMenu();});
  const overlay=document.createElement('section');overlay.id='story-overlay';overlay.hidden=true;overlay.className='story-screen';overlay.setAttribute('aria-label','Story cutscene');
  overlay.innerHTML='<div class="story-stage"><div class="story-dawn" aria-hidden="true"><div class="sun-disc"></div><div class="story-houses"></div><div class="story-figures"><div class="mini-runner kai-kid"><i></i><b></b></div><div class="mini-runner riven-kid"><i></i><b></b></div></div></div><div class="story-copy"><div id="story-time" class="eyebrow"></div><div id="story-location" class="story-location"></div><h2 id="story-who"></h2><p id="story-dialogue"></p><div id="story-context"></div><div class="story-actions"><button id="story-next" class="primary">NEXT →</button><button id="story-skip" class="secondary">SKIP STORY</button></div><div id="story-step">1 / 4</div></div></div>';
  document.body.appendChild(overlay);
  $('story-next').addEventListener('click',()=>advanceStory());
  $('story-skip').addEventListener('click',()=>endStory());
  $('menu-nav').addEventListener('click',e=>{const b=e.target.closest('button[data-tab]');if(b)setTab(b.dataset.tab)});
  content.addEventListener('click',e=>{
   const race=e.target.closest('[data-race]');
   if(race){selectRace(Number(race.dataset.race));return;}
   const buy=e.target.closest('[data-buy]');
   if(buy){buyUpgrade(buy.dataset.buy);return;}
   const replay=e.target.closest('[data-replay]');
   if(replay){startStory(true);return;}
  });
  updateHud();setTab('story');
 }
 function setTab(t){
  tab=t;
  document.querySelectorAll('#menu-nav [data-tab]').forEach(b=>b.classList.toggle('nav-active',b.dataset.tab===t));
  $('customize-panel').classList.toggle('customize-focused',t==='customize');
  $('menu-content').hidden=t==='customize';
  const box=$('menu-content');
  if(t==='story'){
   const l=getLevel();
   box.innerHTML='<div class="content-eyebrow">CURRENT CHAPTER · '+l.chapter+'</div><div class="current-chapter">'+l.name+'</div><p>Rival: <strong>'+l.rival+'</strong> · '+l.subtitle+'</p><div class="menu-wallet">◈ '+save.wallet+' ROUTE CREDITS <span class="menu-hint">Finish races to earn more</span></div><button data-replay="1" class="text-button">↻ WATCH CHAPTER INTRO</button>';
   $('start').hidden=false;$('start').textContent=save.storySeen[level]?'RACE '+l.rival.toUpperCase()+'  ↗':'PLAY CHAPTER '+l.chapter+'  ↗';
  } else if(t==='races'){
   box.innerHTML='<div class="content-eyebrow">ROOFTOP CIRCUIT · LEVEL SELECT</div><div class="race-list">'+LEVELS.map((l,i)=>'<button class="race-row '+(i===level?'chosen':'')+'" data-race="'+i+'" '+(!save.unlocked[i]?'disabled':'')+'><span class="race-number">'+l.chapter+'</span><span class="race-copy"><b>'+l.name+'</b><small>'+l.subtitle+' · '+l.rival+'</small></span><span class="race-record">'+(save.unlocked[i]?(save.bests[i]===null?'NEW':Number(save.bests[i]).toFixed(1)+'s'):'LOCKED')+'</span></button>').join('')+'</div><div class="menu-hint">Beat each chapter to unlock the next. Replays earn credits and build your time ghost.</div>';
   $('start').hidden=false;$('start').textContent='RACE '+getLevel().rival.toUpperCase()+'  ↗';
  } else if(t==='upgrades'){
   const upgrades=[{key:'pace',title:'PACE',description:'Higher sprint speed',max:3,cost:55},{key:'spring',title:'SPRING',description:'Stronger takeoff for longer gaps',max:3,cost:55},{key:'grip',title:'GRIP',description:'Sharper air steering',max:3,cost:55}];
   box.innerHTML='<div class="content-eyebrow">RUNNER WORKSHOP / PERMANENT UPGRADES</div><div class="menu-wallet">◈ '+save.wallet+' ROUTE CREDITS</div>'+upgrades.map(u=>{const lvl=save.upgrades[u.key]||0,cost=u.cost*(lvl+1);return '<div class="upgrade-row"><div><b>'+u.title+' <span class="level-pips">'+('●'.repeat(lvl)+'○'.repeat(u.max-lvl))+'</span></b><small>'+u.description+'</small></div><button data-buy="'+u.key+'" '+(lvl===u.max||save.wallet<cost?'disabled':'')+'>'+(lvl===u.max?'MAX':'◈ '+cost)+'</button></div>'}).join('')+'<div class="menu-hint">Earn credits by finishing races and collecting signals. Upgrades change your own best-time records, not your rivals.</div>';
   $('start').hidden=false;$('start').textContent='BACK TO THE ROOFS  ↗';
  } else {
   box.innerHTML='';
   $('start').hidden=false;$('start').textContent='RACE WITH THIS LOOK  ↗';
  }
 }
 function selectRace(i){
  if(i<0||i>=LEVELS.length||!save.unlocked[i])return;
  level=i;setTab('races');updateHud();onStyle?.();
 }
 function buyUpgrade(k){
  const current=save.upgrades[k]||0,cost=55*(current+1);
  if(current>=3||save.wallet<cost)return;
  save.wallet-=cost;save.upgrades[k]=current+1;persist();setTab('upgrades');updateHud();
  chime(460+current*80,.16,.035);
 }
 function startStory(force=false){
  unlockSound();
  const pages=STORIES[level];
  if(!force&&save.storySeen[level]){onLaunch();return;}
  cutsceneIndex=0;$('splash').hidden=true;$('story-overlay').hidden=false;
  showPage();
 }
 function showPage(){
  const page=STORIES[level][cutsceneIndex];if(!page)return;
  $('story-time').textContent=page.time;
  $('story-location').textContent=page.where;
  $('story-who').textContent=page.who;
  $('story-dialogue').textContent=page.text;
  $('story-context').textContent=page.desc;
  $('story-step').textContent=(cutsceneIndex+1)+' / '+STORIES[level].length;
  $('story-next').textContent=cutsceneIndex===STORIES[level].length-1?'START THE RACE  ↗':'CONTINUE  →';
  $('story-overlay').dataset.scene=String(cutsceneIndex);
  chime(260+cutsceneIndex*45,.26,.018);
 }
 function advanceStory(){cutsceneIndex++;if(cutsceneIndex>=STORIES[level].length)endStory();else showPage();}
 function endStory(){
  $('story-overlay').hidden=true;
  save.storySeen[level]=true;persist();onLaunch();
 }
 function showMenu(){
  active=false;
  if(ghost)ghost.visible=false;
  $('story-overlay').hidden=true;
  $('splash').hidden=false;$('modal').hidden=true;
  $('hud').hidden=true;$('controls').hidden=true;$('pause').hidden=true;
  setTab('story');updateHud();
 }
 function makeGhost(){
  if(ghost&&ghost.parent)ghost.parent.remove(ghost);ghost=null;ghostFrame=save.ghosts[level]||[];
  if(!ghostFrame.length)return;
  const group=new THREE.Group();group.name='Best-run shadow';
  const glow=new THREE.MeshStandardMaterial({color:0x78e4ef,transparent:true,opacity:.36,emissive:0x1cccdc,emissiveIntensity:.56,depthWrite:false,flatShading:true});
  const geo=new THREE.SphereGeometry(1,9,7),cyl=new THREE.CylinderGeometry(1,1,1,8);
  function add(g,mat,x,y,z,sx,sy,sz){const p=new THREE.Mesh(g,mat);p.position.set(x,y,z);p.scale.set(sx,sy,sz);group.add(p);return p;}
  add(cyl,glow,0,.65,0,.29,.84,.25);
  add(geo,glow,0,1.5,0,.24,.31,.24);
  for(const side of [-1,1]){
   add(cyl,glow,side*.38,.68,0,.12,.69,.12);
   add(cyl,glow,side*.17,-.25,0,.14,.78,.13);
  }
  scene=getScene();scene.add(group);ghost=group;ghostIndex=0;ghost.position.set(ghostFrame[0].x,ghostFrame[0].y,ghostFrame[0].z);
 }
 function beforeRun(){
  updateHud();record=[];lastRecord=-1;active=true;audioStep=0;nextBeat=0;
  makeGhost(); if(ghost)ghost.visible=true;
  unlockSound();
 }
 function track(dt,state,elapsed,playing){
  if(!playing){active=false;return;}
  active=true;
  if(lastRecord<0||elapsed-lastRecord>=.09){
   record.push({t:Math.round(elapsed*100)/100,x:+state.x.toFixed(2),y:+state.y.toFixed(2),z:+state.z.toFixed(2),r:+state.angle.toFixed(2)});
   lastRecord=elapsed;
  }
  if(ghost&&ghostFrame.length>1){
   while(ghostIndex<ghostFrame.length-2&&ghostFrame[ghostIndex+1].t<elapsed)ghostIndex++;
   const a=ghostFrame[ghostIndex],b=ghostFrame[Math.min(ghostIndex+1,ghostFrame.length-1)];
   const f=clamp((elapsed-a.t)/Math.max(.001,b.t-a.t),0,1);
   ghost.visible=elapsed<=ghostFrame.at(-1).t+.1;
   ghost.position.set(a.x+(b.x-a.x)*f,a.y+(b.y-a.y)*f,a.z+(b.z-a.z)*f);
   ghost.rotation.y=a.r+(b.r-a.r)*f;
  }
  musicTick();
 }
 function getUpgrade(k){return Number(save.upgrades[k]||0);}
 function afterFinish({elapsed,collected,falls}){
  active=false;
  const prev=save.bests[level],personalBest=prev===null||elapsed<prev;
  const reward=getLevel().reward+collected*12+(personalBest?30:0);
  save.wallet+=reward;save.wins[level]=(save.wins[level]||0)+1;
  if(personalBest){
   save.bests[level]=+elapsed.toFixed(2);
   save.ghosts[level]=record.length?record.slice(-850):null;
  }
  const newlyUnlocked=level<LEVELS.length-1&&!save.unlocked[level+1];
  if(newlyUnlocked)save.unlocked[level+1]=true;
  persist();updateHud();
  return {personalBest,reward,newlyUnlocked,doneAll:level===LEVELS.length-1};
 }
 // All original game audio is synthesized at runtime—no samples, network music or ads.
 function unlockSound(){
  if(save.muted)return;
  try{
   const A=window.AudioContext||window.webkitAudioContext;
   if(!A)return;
   if(!audio){audio=new A();master=audio.createGain();master.gain.value=.35;master.connect(audio.destination);}
   if(audio.state==='suspended')audio.resume();
   audioEnabled=true;
   chime(510,.095,.034);
  }catch(e){audioEnabled=false;}
 }
 function chime(f=440,d=.12,v=.024,type='sine',when=null){
  if(save.muted||!audio||audio.state!=='running')return;
  const t=when??audio.currentTime;
  const o=audio.createOscillator(),g=audio.createGain();
  o.type=type;o.frequency.setValueAtTime(Math.max(40,f),t);
  if(type==='sine')o.frequency.exponentialRampToValueAtTime(Math.max(40,f*.8),t+d);
  g.gain.setValueAtTime(Math.max(.0001,v),t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.01);
 }
 function musicTick(){
  if(!active||save.muted||!audio||audio.state!=='running')return;
  const now=audio.currentTime;
  if(nextBeat<now-.4)nextBeat=now+.02;
  const bass=[110,110,146.8,98,110,123.5,146.8,98],notes=[220,261.6,329.6,293.7,220,261.6,392,293.7];
  let cycles=0;
  while(nextBeat<now+.11&&cycles++<3){
   const i=audioStep%8;
   if(i%2===0)chime(bass[i],.2,.055,'triangle',nextBeat);
   chime(3600,.026,.008,'square',nextBeat);
   if(i%2===1)chime(notes[i],.21,.018,'sine',nextBeat);
   if(i===0||i===4)chime(72,.14,.03,'sine',nextBeat);
   audioStep++;nextBeat+=.215;
  }
 }
 function toggleAudio(){
  save.muted=!save.muted;persist();
  if(!save.muted)unlockSound();
  if(master)master.gain.value=save.muted?0:.35;
  $('sound').textContent=save.muted?'SOUND OFF':'SOUND ON';
  $('sound-hud').textContent=save.muted?'♪̸':'♫';
  return !save.muted;
 }
 function sfx(name){
  if(save.muted)return;
  const note={jump:480,slide:185,hit:118,coin:820,finish:660,footstep:120,unlock:570}[name]||300;
  if(name==='finish'){chime(660,.21,.055);chime(990,.3,.03,'sine',audio?audio.currentTime+.17:undefined);}
  else chime(note,name==='hit'?.21:.12,name==='hit'?.054:.027,name==='hit'?'sawtooth':'sine');
 }
 function cycleSoundButton(){
  $('sound-hud')?.addEventListener('click',toggleAudio);
  document.addEventListener('keydown',e=>{if(e.code==='KeyM'&&!e.repeat)toggleAudio()});
 }
 function init(){
  scene=getScene();createUI();cycleSoundButton();
 }
 return {
  init,getLevel,levelIndex:()=>level,coursePositions:()=>getLevel().positions,courseHazards:()=>getLevel().hazards,
  startStory,showMenu,beforeRun,track,afterFinish,getUpgrade,unlockSound,toggleAudio,sfx,
  getBest:()=>save.bests[level],getWallet:()=>save.wallet,isMuted:()=>save.muted,
  setRace:selectRace,refresh:()=>{setTab(tab);updateHud()}
 };
}
