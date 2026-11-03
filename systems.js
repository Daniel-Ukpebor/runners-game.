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
  {time:'TEN YEARS EARLIER · 6:14 PM',where:'THE STEPS / MARKET STREET',who:'KAI, AGE NINE',text:'“That’s cheating. You took the stairs.”',desc:'Riven was already on the next roof. The loser carried two bags of tomatoes back uphill.'},
  {time:'THE SUMMER RIVEN LEFT',where:'THE OLD BELL TOWER',who:'RIVEN',text:'“Keep our map. I’m not done with you.”',desc:'They drew rooftop shortcuts on the back of a grocery receipt. When Riven moved away, Kai folded it and stopped adding routes.'},
  {time:'PRESENT DAY · 6:14 PM',where:'ABOVE THE MARKET',who:'RIVEN',text:'“You still remember the way up?”',desc:'Riven is back for the Midnight Circuit qualifiers, wearing a race bib and that same ridiculous grin. Kai still has the map.'},
  {time:'CHAPTER ONE · THE STEPS',where:'THE OLD START LINE',who:'KAI',text:'“No stairs this time.”',desc:'Same rooftops. Same bell tower. Riven takes off first, and Kai is already running before the words are out.'}
 ],
 [
  {time:'AFTER THE BELL TOWER',where:'VESPER / MARKETLINE',who:'SABLE',text:'“Riven told me you run fast. Didn’t say you could turn.”',desc:'Sable delivers parcels across these awnings before the market opens. She calls every crate and rail by name.'},
  {time:'CHAPTER TWO · MARKETLINE',where:'ROOF ABOVE THE OLD BAKERY',who:'KAI',text:'“Then pick the route. I’ll keep up.”',desc:'The turns are sharper, the obstacles closer, and Sable has already disappeared around the first corner.'}
 ],
 [
  {time:'THE FINAL QUALIFIER',where:'NORTH LOOKOUT / NIGHTLINE',who:'VALE',text:'“You beat two runners. You haven’t beaten this roof.”',desc:'Vale holds the lookout record. The Nightline is narrow in daylight; tonight the lights are going on one by one.'},
  {time:'CHAPTER THREE · NIGHTLINE',where:'THE LAST START LINE',who:'KAI',text:'“I’ve been running this city since I was nine.”',desc:'One last qualifier. The bell tower is a long way behind them now. The old grocery receipt is still in Kai’s pocket.'}
 ]
];
const SAVE_KEY='runners.save.v3';
const fresh=()=>({wallet:0,unlocked:[true,false,false],wins:[0,0,0],bests:[null,null,null],ghosts:[null,null,null],ghostTimes:[null,null,null],storySeen:[false,false,false],upgrades:{pace:0,spring:0,grip:0},muted:false});
function loadSave(){
 let x=fresh();try{const a=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(a&&typeof a==='object')x={...x,...a,upgrades:{...x.upgrades,...(a.upgrades||{})}}}catch(e){}
 for(const k of ['bests','ghosts','ghostTimes','wins','unlocked','storySeen'])if(!Array.isArray(x[k]))x[k]=fresh()[k];
 // Preserve the user's Version 2 record even though older builds did not record a replay.
 try{
  if(!localStorage.getItem(SAVE_KEY)){
   const previous=Number(localStorage.getItem('runners.best'));
   if(Number.isFinite(previous)&&previous>0)x.bests[0]=previous;
  }
 }catch(e){}
 return x;
}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function createSystems({THREE,getScene,getRunner,onLaunch,onMenu,onStyle}){
 let save=loadSave(),level=0,tab='story',scene=null,ghost=null,ghostFrame=[],ghostIndex=0,record=[],lastRecord=-1,cutsceneIndex=0,cutsceneTimer=null,audio=null,master=null,audioStep=0,nextBeat=0,active=false,audioEnabled=false,previewRenderer=null,previewScene=null,previewAvatar=null,previewCamera=null,previewClock=0;
 const $=id=>document.getElementById(id);
 const persist=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(e){console.warn('RUNNERS save could not be stored',e)}};
 const getLevel=()=>LEVELS[level];
 function updateHud(){
  const l=getLevel();
  $('chapter-label').textContent='VESPER / CH.'+l.chapter+' — '+l.name;
  $('race-label').textContent=l.name+' → FINISH';
  $('best').textContent=save.bests[level]===null?'—':Number(save.bests[level]).toFixed(1)+'s';
  $('coin-count').textContent=String(save.wallet);
  $('ghost-indicator').textContent=save.ghosts[level]?'YOUR SHADOW '+Number(save.ghostTimes[level]||save.bests[level]||0).toFixed(1)+'s':'NO SHADOW RECORDED';
  $('ghost-indicator').classList.toggle('ghost-ready',!!save.ghosts[level]);
  const credits=$('menu-credits');if(credits)credits.textContent=String(save.wallet);
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
  // Put START at the top of the menu; it must be visible without scrolling in landscape.
  menu.insertBefore($('start'),title);
  const content=document.createElement('div');content.id='menu-content';menu.insertBefore(content,menu.querySelector('.featureline'));
  menu.querySelector('.meta').textContent='BUILD 0.4 · Your chapters, looks, upgrades and shadow times stay saved on this device. Landscape Safari recommended.';
  const aside=$('splash').querySelector('.customize');
  aside.id='customize-panel';
  const build=document.createElement('div');
  build.innerHTML='<div class="custom-label">BODY / GENDER PRESENTATION</div><div class="swatches build-options"><button class="hair-choice" data-build="0">MASCULINE</button><button class="hair-choice" data-build="1">FEMININE</button><button class="hair-choice" data-build="2">ANDROGYNOUS</button></div><div class="custom-subnote">All styles, outfits and abilities are available to every runner.</div>';
  const first=aside.querySelector('.custom-title');
  const preview=document.createElement('div');preview.id='avatar-preview';preview.hidden=true;
  first.insertAdjacentElement('afterend',build);
  first.insertAdjacentElement('afterend',preview);
  const hairs=aside.querySelector('[data-hair="2"]');
  hairs.insertAdjacentHTML('afterend','<button class="hair-choice" data-hair="3">AFRO</button><button class="hair-choice" data-hair="4">BRAIDS</button><button class="hair-choice" data-hair="5">LOCS</button>');
  const hairSwatches=document.createElement('div');hairSwatches.innerHTML='<div class="custom-label">HAIR COLOR</div><div class="swatches"><button class="swatch hair-swatch" data-haircolor="0" aria-label="Black hair" style="background:#222428"></button><button class="swatch hair-swatch" data-haircolor="1" aria-label="Brown hair" style="background:#443128"></button><button class="swatch hair-swatch" data-haircolor="2" aria-label="Auburn hair" style="background:#744329"></button><button class="swatch hair-swatch" data-haircolor="3" aria-label="Blonde hair" style="background:#be9063"></button><button class="swatch hair-swatch" data-haircolor="4" aria-label="Burgundy hair" style="background:#8b3142"></button></div>';
  hairs.closest('.swatches').insertAdjacentElement('afterend',hairSwatches);
  const gearOptions=document.createElement('div');gearOptions.id='gear-options';
  gearOptions.innerHTML='<div class="custom-label">GEAR</div><div class="swatches"><button class="hair-choice" data-gear="0">DAYPACK</button><button class="hair-choice" data-gear="1">NO PACK</button></div>';
  hairSwatches.insertAdjacentElement('afterend',gearOptions);

  const oldSkin=['#e0ad87','#c18b66','#9c674c','#633e32','#efc7a6','#8e5b46'];
  const newSkin=['#edc7a5','#d8a47b','#b77c58','#89583e','#573728','#c99169'];
  aside.querySelectorAll('[data-skin]').forEach((b,i)=>b.style.background=newSkin[i]);
  $('sound').textContent=save.muted?'SOUND OFF':'TAP FOR AUDIO';
  $('sound').classList.add('menu-audio');first.insertAdjacentElement('beforebegin',$('sound'));
  $('sound-hud').textContent=save.muted?'♪̸':'♫';
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
  // Dedicated character studio: preview and controls never compete for a narrow sidebar.
  const stage=document.createElement('section');stage.id='studio-stage';
  const stageHead=document.createElement('div');stageHead.className='studio-head';
  stageHead.innerHTML='<span class="eyebrow">VESPER CITY / RUNNERS</span><h2>KAI<span>.</span></h2><p>YOUR RUNNER. YOUR ROUTE.</p>';
  stage.appendChild(stageHead);stage.appendChild(preview);
  const controls=document.createElement('section');controls.id='studio-controls';
  const oldControls=[...aside.children].filter(el=>el!==stage);
  for(const child of oldControls)controls.appendChild(child);
  const actions=document.createElement('div');actions.id='studio-actions';
  actions.innerHTML='<button id="studio-back" class="secondary">← BACK TO MENU</button><button id="studio-race" class="primary">RACE WITH THIS LOOK ↗</button>';
  controls.appendChild(actions);
  aside.append(stage,controls);
  $('studio-back').addEventListener('click',()=>setTab('story'));
  $('studio-race').addEventListener('click',()=>startStory());
  updateHud();setTab('story');
 }
 function setTab(t){
  tab=t;
  document.querySelectorAll('#menu-nav [data-tab]').forEach(b=>b.classList.toggle('nav-active',b.dataset.tab===t));
  $('customize-panel').classList.toggle('customize-focused',t==='customize');
  $('avatar-preview').hidden=t!=='customize';
  if(t==='customize')ensurePreview();
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
  if(cutsceneTimer)clearTimeout(cutsceneTimer);
  const seen=save.storySeen[level];
  // Every launch includes an in-world intro. Replays show a short two-shot recap.
  cutsceneIndex=force||!seen?0:Math.max(0,STORIES[level].length-2);
  $('splash').hidden=true;$('story-overlay').hidden=false;
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
  if(cutsceneTimer)clearTimeout(cutsceneTimer);
  // The scene runs hands-free; NEXT and SKIP remain available for accessibility.
  cutsceneTimer=setTimeout(()=>{if(!$('story-overlay').hidden)advanceStory();},cutsceneIndex===STORIES[level].length-1?4000:4700);
  chime(260+cutsceneIndex*45,.26,.018);
 }
 function advanceStory(){if($('story-overlay').hidden)return;cutsceneIndex++;if(cutsceneIndex>=STORIES[level].length)endStory();else showPage();}
 function endStory(){
  if(cutsceneTimer)clearTimeout(cutsceneTimer);cutsceneTimer=null;
  $('story-overlay').hidden=true;
  save.storySeen[level]=true;persist();onLaunch();
 }
 function showMenu(){
  if(cutsceneTimer)clearTimeout(cutsceneTimer);cutsceneTimer=null;
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
   if(ghost.visible&&elapsed>.3){const distance=state.z-ghost.position.z;
    $('ghost-indicator').textContent=(Math.abs(distance)/9).toFixed(1)+'s '+(distance>=0?'AHEAD OF':'BEHIND')+' YOUR SHADOW';
   }
  }
  musicTick();
 }
 function getUpgrade(k){return Number(save.upgrades[k]||0);}
 function afterFinish({elapsed,collected,falls,stuntScore=0}){
  active=false;
  const prev=save.bests[level],personalBest=prev===null||elapsed<prev;
  const stuntCredits=Math.min(80,Math.floor(stuntScore/40));
  const reward=getLevel().reward+collected*12+(personalBest?30:0)+stuntCredits;
  save.wallet+=reward;save.wins[level]=(save.wins[level]||0)+1;
  if(personalBest)save.bests[level]=+elapsed.toFixed(2);
  // A first replay is recorded even if an older (pre-ghost) best already exists.
  if(record.length&&(personalBest||!save.ghosts[level])){
   save.ghosts[level]=record.slice(-850);
   save.ghostTimes[level]=+elapsed.toFixed(2);
  }
  const newlyUnlocked=level<LEVELS.length-1&&!save.unlocked[level+1];
  if(newlyUnlocked)save.unlocked[level+1]=true;
  persist();updateHud();
  return {personalBest,reward,stuntCredits,newlyUnlocked,doneAll:level===LEVELS.length-1};
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
   $('sound').textContent='SOUND ON';
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
  // First tap explicitly unlocks audio on iOS; it is not a mute operation.
  if(!audio&&!save.muted){unlockSound();return true;}
  save.muted=!save.muted;persist();
  if(!save.muted)unlockSound();
  if(master)master.gain.value=save.muted?0:.35;
  $('sound').textContent=save.muted?'SOUND OFF':'SOUND ON';
  $('sound-hud').textContent=save.muted?'♪̸':'♫';
  return !save.muted;
 }
 function sfx(name){
  if(save.muted)return;
  const note={jump:480,slide:185,hit:118,coin:820,finish:660,footstep:120,unlock:570,vault:370,trick:780,land:280}[name]||300;
  if(name==='finish'){chime(660,.21,.055);chime(990,.3,.03,'sine',audio?audio.currentTime+.17:undefined);}
  else chime(note,name==='hit'?.21:name==='trick'?.23:.12,name==='hit'?.054:name==='trick'?.045:.027,name==='hit'?'sawtooth':'sine');
 }

 function ensurePreview(){
  if(previewRenderer)return;
  try{
   previewScene=new THREE.Scene();
   previewScene.add(new THREE.HemisphereLight(0xffe9db,0x354756,2.35));
   const lamp=new THREE.DirectionalLight(0xffc18d,2.3);lamp.position.set(3,5,5);previewScene.add(lamp);
   const w=Math.max(275,Math.min(530,Math.round(innerWidth*.46)));
   const h=Math.max(210,Math.min(440,Math.round(innerHeight*.80)));
   previewCamera=new THREE.PerspectiveCamera(35,w/h,.1,100);
   previewCamera.position.set(2.85,2.0,4.2);previewCamera.lookAt(0,.77,0);
   previewRenderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});
   previewRenderer.setPixelRatio(1);
   previewRenderer.setPixelRatio(Math.min(devicePixelRatio,1.25));
   previewRenderer.setSize(w,h,false);
   previewRenderer.setClearColor(0x000000,0);
   $('avatar-preview').appendChild(previewRenderer.domElement);
   refreshAvatar();
  }catch(e){console.warn('3D preview unavailable',e);$('avatar-preview').textContent='Outfit preview unavailable on this browser.';}
 }
 function refreshAvatar(){
  if(!previewScene||!previewRenderer)return;
  if(previewAvatar)previewScene.remove(previewAvatar);
  previewAvatar=getRunner().clone(true);
  previewAvatar.rotation.y=.4;
  previewScene.add(previewAvatar);
  previewRenderer.render(previewScene,previewCamera);
 }
 function drawPreview(dt){
  if(!previewRenderer||!previewAvatar||tab!=='customize'||$('splash').hidden)return;
  previewClock+=dt;
  if(previewClock<1/25)return;
  previewAvatar.rotation.y+=previewClock*.3;
  previewClock=0;
  previewRenderer.render(previewScene,previewCamera);
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
  setRace:selectRace,refresh:()=>{setTab(tab);updateHud()},refreshAvatar,drawPreview,
  audioState:()=>audio?.state||'not-created'
 };
}
