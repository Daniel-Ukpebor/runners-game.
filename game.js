import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
import {createSystems,LEVELS} from './systems.js?v=4';
import {createCinematic} from './cinematic.js?v=4';

const $ = id => document.getElementById(id);
const ui = {
  splash:$('splash'), hud:$('hud'), controls:$('controls'), scene:$('scene'),
  start:$('start'), pause:$('pause'), modal:$('modal'), modalTitle:$('modal-title'),
  modalText:$('modal-text'), modalPrimary:$('modal-primary'), modalSecondary:$('modal-secondary'),
  time:$('time'), best:$('best'), progress:$('progress-fill'), meter:$('meter-fill'),
  speed:$('speed'), pickup:$('pickup'), toast:$('toast'), chapter:$('chapter-label'),
  jump:$('jump'), slide:$('slide'), stick:$('stick'), thumb:$('thumb'),
  skin:document.querySelectorAll('[data-skin]'), jacket:document.querySelectorAll('[data-jacket]'),
  hair:document.querySelectorAll('[data-hair]')
};
const isTouch = matchMedia('(pointer:coarse)').matches;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const THREE_COLOR = 0x232323;
let renderer, camera, scene, world, actor, runner, rival, rivalArms=[], rivalLegs=[], cinematic=null, skyDomeMaterial, keySun, skyHem, runClock=0, started=false, paused=false;
let startAt=0, elapsed=0, finished=false, collected=0, falls=0, feedbackUntil=0, flashUntil=0;
let checkpointIndex=0, best=0, volume=true, audioContext=null, builtLevel=0;
const route=[], obstacles=[], pickups=[], animated=[], groundShadows=[];
const radius=0.38, temp=new THREE.Vector3(), targetCamera=new THREE.Vector3(), cameraAim=new THREE.Vector3();
const state={x:0,y:1,z:-5.5,vx:0,vz:0,vy:0,grounded:true,coyote:0,buffer:0,slide:0,boost:0,runPhase:0,stepTimer:0,angle:0,airTime:0,stuntScore:0,combo:0,comboWindow:0,pendingStunt:0,trick:0,trickUsed:false,vault:0};
const input={x:0,z:0,pointer:null,keys:new Set()};
// Read-only diagnostics for automated mobile control tests.
window.__runnersDiagnostics=()=>({x:state.x,z:state.z,y:state.y,time:elapsed,grounded:state.grounded,paused,finished,level:systems.getLevel().id,wallet:systems.getWallet(),audio:systems.audioState(),stunts:state.stuntScore,pending:state.pendingStunt,trick:state.trick,vault:state.vault,cinema:!!(cinematic&&cinematic.isActive())});
if(location.hostname==='127.0.0.1'||location.hostname==='localhost'){
  window.__runnersTestApi={
    complete:()=>{if(!started)throw Error('No active race');state.z=route.at(-1).z+7.2;state.y=1;state.grounded=true;},
    obstacle:(index)=>{if(!started)throw Error('No active race');const o=obstacles[index];state.x=o.x;state.y=1;state.z=o.z-2.2;state.vx=state.vy=state.vz=0;state.grounded=true;return {kind:o.kind,z:o.z};}
  };
}
const palettes={
  stone:[0xb58d78,0xcaa68d,0xbfa58f,0xa97966,0xcfaf95,0x967b78],
  roof:[0xb16b55,0xc1815f,0x9d6052,0xc68b68],
  shutters:[0x607e78,0x526675,0x8b695e,0x658077],
  skin:['#edc7a5','#d8a47b','#b77c58','#89583e','#573728','#c99169'],
  jacket:['#ad493b','#486b67','#cf945c','#454c62','#c5b6a5'],
  hair:['#222428','#443128','#744329','#be9063','#8b3142']
};
let style={skin:2,jacket:0,hair:0,haircolor:0,build:2,gear:0};
try {
  const stored=JSON.parse(localStorage.getItem('runners.style')||'null');
  if(stored) style={...style,...stored};
  best=Number(localStorage.getItem('runners.best')||0);
} catch(e) {}
const systems=createSystems({THREE,getScene:()=>scene,getRunner:()=>runner,onLaunch:()=>newRun(),onMenu:()=>goMain(),onStyle:()=>applyStyle()});
function mat(hex, emissive=0) {const m=new THREE.MeshStandardMaterial({color:hex,roughness:.92,metalness:0,flatShading:false});if(emissive){m.emissive=new THREE.Color(hex);m.emissiveIntensity=emissive}return m;}
const materials=new Map();
function m(hex){const k=String(hex);if(!materials.has(k))materials.set(k,mat(hex));return materials.get(k)}
const boxGeo=new THREE.BoxGeometry(1,1,1), sphereGeo=new THREE.SphereGeometry(1,20,14), cylinderGeo=new THREE.CylinderGeometry(1,1,1,14), planeGeo=new THREE.PlaneGeometry(1,1);
function mesh(parent,geo,material,x=0,y=0,z=0,sx=1,sy=1,sz=1) {
  const o=new THREE.Mesh(geo,typeof material==='number'?m(material):material);
  o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;
}
function block(parent,x,y,z,w,h,d,color){return mesh(parent,boxGeo,color,x,y,z,w,h,d)}
function ball(parent,x,y,z,sx,sy,sz,color){return mesh(parent,sphereGeo,color,x,y,z,sx,sy,sz)}
function tube(parent,x,y,z,sx,sy,sz,color){return mesh(parent,cylinderGeo,color,x,y,z,sx,sy,sz)}
function line(parent,a,b,color,r=.025){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);const diff=end.clone().sub(start),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,diff.length(),5),m(color));o.position.copy(start.add(end).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.normalize());parent.add(o);return o}
let seed=93519;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function pick(a){return a[Math.floor(rnd()*a.length)]}
function clamp(n,a,b){return Math.min(Math.max(n,a),b)}
function smooth(current,target,k,dt){return THREE.MathUtils.lerp(current,target,1-Math.exp(-k*dt))}
function boot() {
  scene=new THREE.Scene();scene.background=new THREE.Color(0x8095a2);scene.fog=new THREE.FogExp2(0xbbaea6,.0108);

  // Painted-sky dome: evening amber at the horizon, deep slate overhead.
  const skydome=new THREE.Mesh(new THREE.SphereGeometry(185,24,14),new THREE.ShaderMaterial({
    side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{uNight:{value:0}},
    vertexShader:'varying vec3 vSky;void main(){vSky=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform float uNight;varying vec3 vSky;void main(){float h=normalize(vSky).y;float t=smoothstep(-0.46,0.22,h);vec3 horizon=mix(vec3(0.96,0.68,0.53),vec3(0.28,0.33,0.45),uNight);vec3 high=mix(vec3(0.37,0.55,0.68),vec3(0.08,0.17,0.31),uNight);gl_FragColor=vec4(mix(horizon,high,t),1.0);}'
  }));skyDomeMaterial=skydome.material;scene.add(skydome);
  world=new THREE.Group();scene.add(world);
  camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.08,215);
  renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance',alpha:false});
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.17;
  renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch?1.45:1.8));
  renderer.setSize(innerWidth,innerHeight);
  renderer.domElement.setAttribute('aria-label','RUNNERS 3D rooftop course');
  ui.scene.appendChild(renderer.domElement);
  skyHem=new THREE.HemisphereLight(0xf6e5d5,0x51596b,1.75);scene.add(skyHem);
  keySun=new THREE.DirectionalLight(0xffbd84,2.55);keySun.position.set(-34,45,70);scene.add(keySun);
  const ambient=new THREE.DirectionalLight(0xd5dfea,.55);ambient.position.set(20,20,-20);scene.add(ambient);
  ball(scene,-65,33,148,9,9,1,mat(0xffd3a0,.65));
  buildDistrict();optimizeDistrict();makeCharacter();makeRival();makeContactShadow();tuneDistrict();applyStyle();systems.init();createStuntHud();cinematic=createCinematic({THREE,scene,camera,actor,rival,runner,route,ensureCourse:()=>{if(builtLevel!==systems.levelIndex())rebuildCourse()},levelIndex:()=>systems.levelIndex()});bindControls();resize();
  ui.best.textContent=systems.getBest()===null?'—':Number(systems.getBest()).toFixed(1)+'s';
  camera.position.set(0,5,-15);
  cameraAim.set(0,1,6);
  requestAnimationFrame(frame);
}
function roof(index,x,z,w,length){
  const clay=pick(palettes.roof),stone=pick(palettes.stone),g=new THREE.Group();world.add(g);
  const top=0, depth=13+rnd()*5;
  block(g,x,-depth/2,z,w,depth,length,stone);
  block(g,x,-.12,z,w+.35,.29,length+.35,clay);
  block(g,x,-.21,z,w+.55,.15,length+.55,0x754f49);
  const border=0x815448;
  for(const dir of [-1,1]){
    block(g,x+dir*(w/2-.11),.38,z,.28,.78,length,border);
    for(let j=0;j<Math.ceil(length/3);j++){
      const zz=z-length/2+1.5+j*3;
      block(g,x+dir*(w/2-.1),.78,zz,.47,.13,.75,0xc69c82);
    }
  }
  // Leave open ends so jumps feel intentional.
  for(let j=0;j<length/1.75;j++){
    const zz=z-length/2+j*1.75;
    block(g,x+(rnd()-.5)*(w-2),.033,zz,.08,.008,.62,0x955f4e);
    if(rnd()>.55)block(g,x+(rnd()-.5)*(w-3),.04,zz,.7,.008,.08,0xcf9372);
  }
  // Exterior windows and balconies, visible from the camera.
  for(const side of [-1,1])for(let f=0;f<3;f++)for(let n=0;n<4;n++){
    const zz=z-length/2+2+n*(length-4)/3, yy=-2.5-f*3.1;
    const xx=x+side*(w/2+.016);
    block(g,xx,yy,zz,.045,1.7,1.04,0x463e42);
    block(g,xx+side*.055,yy,zz,.045,1.3,.7,pick(palettes.shutters));
    block(g,xx+side*.13,yy-.85,zz,.35,.13,1.35,0x77736d);
  }
  if(index>0&&index%2===0){
    // A rooftop doorway and chimney to break up the skyline.
    const side=index%4===0?1:-1, xx=x+side*(w/2-1.5),zz=z-length/2+3.5;
    block(g,xx,.75,zz,2.1,1.5,2.2,stone);
    block(g,xx,1.15,zz+.98,1.2,1.5,.09,0x534c48);
    block(g,xx,1.65,zz,2.4,.25,2.5,clay);
  }
  route.push({x,z,w,l:length,index});
}
function surrounding(){
  for(let n=0;n<86;n++){
    const z=-26+n*3.35+(rnd()-.5)*2;
    const side=n%2?-1:1,xx=side*(12+rnd()*12),w=5+rnd()*7,d=5+rnd()*7,h=12+rnd()*14;
    const g=new THREE.Group();world.add(g);
    const sandstone=pick(palettes.stone),upper=2+rnd()*8;
    block(g,xx,upper-h/2,z,w,h,d,sandstone);
    block(g,xx,upper+.08,z,w+.4,.25,d+.4,pick(palettes.roof));
    if(rnd()>.35){
      const sideX=xx-side*(w/2+.03);
      for(let level=0;level<3;level++){
        const yy=upper-2.3-level*3;
        for(let s=-1;s<=1;s+=2){
          const zz=z+s*d*.24;
          block(g,sideX,yy,zz,.07,1.55,1.08,0x453f40);
          block(g,sideX-side*.05,yy,zz,.045,1.2,.83,pick(palettes.shutters));
          if(rnd()>.67){
            block(g,sideX-side*.25,yy-.9,zz,.6,.11,1.5,0x786b5f);
            for(let k=-1;k<=1;k++)line(g,[sideX-side*.51,yy-.78,zz+k*.54],[sideX-side*.51,yy-.05,zz+k*.54],0x494e4a,.035);
          }
        }
      }
    }
    if(rnd()>.75){
      block(g,xx,upper+1,z,.4,1.9,.4,0x8f6553);
      ball(g,xx,upper+2.1,z,.7,.35,.7,0x6d766b);
    }
  }
  // Distant layered skyline; purposeful silhouette rather than endless identical blocks.
  for(let i=0;i<48;i++){
    const x=(rnd()-.5)*150,z=30+rnd()*160,h=16+rnd()*36,w=5+rnd()*12;
    block(world,x,-h/2-4,z,w,h,w,0x99918f);
    if(i%8===0)tube(world,x,h*.4-4,z,.9,7,.9,0x918986);
  }
}
function decorations(){
  for(const p of route){
    const x=p.x,z=p.z;
    // Planters and ceramic pots line routes but do not block the playable center.
    for(const s of [-1,1]){
      const xx=x+s*(p.w/2-.78);
      if(rnd()>.2){
        const zz=z+(rnd()-.5)*p.l*.65;
        tube(world,xx,.38,zz,.38,.65,.38,0xa86c50);
        ball(world,xx,.93,zz,.64,.7,.59,0x496b54);
        ball(world,xx+.15,1.35,zz-.1,.34,.44,.3,0x638068);
      }
      const zz=z+(rnd()-.5)*p.l*.6;
      block(world,xx,.57,zz,1,.15,.8,0x806253);
      tube(world,xx,1.3,zz,.08,1.3,.08,0x5f554a);
    }
    // Sparse vents, AC units and coiled pipe details.
    if(p.index%2===1){
      const xx=x+p.w/2-2,zz=z+2;
      block(world,xx,.47,zz,1.1,.9,.95,0x777d78);
      block(world,xx,1.02,zz,.9,.07,.8,0xb4b3a8);
      for(let j=-1;j<=1;j++)block(world,xx+.56,.45,zz+j*.22,.025,.13,.14,0x3f4c4d);
    }
  }
  for(let i=0;i<30;i++){
    const z=12+i*7.4,x=(rnd()-.5)*4;
    if(i%3===0){
      line(world,[-13,7.4,z],[13,7.7,z+1.9],0x473e43,.026);
      for(let j=0;j<9;j++){
        const xx=-11.5+j*2.8,yy=7.45+j*.03,zz=z+1.9*(xx+13)/26;
        if(rnd()>.25){const flag=block(world,xx,yy-.27,zz,.83,.5,.045,pick([0xa94e42,0xdfa45e,0x688079,0xc37a64]));flag.rotation.z=(rnd()-.5)*.15}
      }
    }
    if(i%4===1){
      line(world,[-12,9,z],[12,8.8,z+1],0x514741,.02);
      for(let j=0;j<5;j++){
        const xx=-9+j*4.5;
        if(rnd()>.2){const item=block(world,xx,8.25,z+.45,1.2,1,.045,pick([0xd4aa87,0x7f9692,0x9f6355]));item.rotation.y=.12}
      }
    }
  }
  // Signage for Vesper; plain, restrained and placed within the environment.
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=150;
  const cx=canvas.getContext('2d');cx.fillStyle='#3b514e';cx.fillRect(0,0,512,150);cx.fillStyle='#eee1c4';cx.font='bold 70px sans-serif';cx.textAlign='center';cx.fillText('VESPER',256,101);
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(5.5,1.6),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
  sign.position.set(-10,4,73);sign.rotation.y=Math.PI/2;world.add(sign);
}
function buildDistrict(){
  const positions=systems.coursePositions();
  positions.forEach((p,i)=>roof(i,...p));
  surrounding();decorations();
  // Obstacles now demand actual parkour: full-width beams require SLIDE,
  // full-width low barriers require JUMP; crates offer slower detour lanes.
  systems.courseHazards().forEach(spec=>{
    const p=route[spec.roof];if(!p)return;
    const x=p.x+spec.dx,z=p.z+spec.dz,kind=spec.kind;
    const node=new THREE.Group();world.add(node);
    if(kind==='crate'){
      const w=2.6;
      block(node,x,.66,z,w,1.32,1.35,0x715949);
      block(node,x,.72,z+.68,w-.16,.12,.06,0xc99a6f);
      block(node,x,.72,z-.68,w-.16,.12,.06,0xc99a6f);
      for(const side of [-1,1]){
        block(node,x+side*(w/2-.14),.65,z+.69,.14,1.04,.065,0xae8063);
      }
      obstacles.push({kind,x,z,w,d:1.45,hit:0});
    } else if(kind==='beam'){
      const w=p.w-1.04,half=w/2;
      for(const side of [-1,1])tube(node,x+side*half,.76,z,.11,1.55,.11,0x555e59);
      block(node,x,1.55,z,w,.41,.5,0x596865);
      block(node,x,1.32,z+.26,w-.16,.13,.05,0xd6a767);
      obstacles.push({kind,x,z,w,d:.55,hit:0});
    } else if(kind==='barrier'){
      const w=p.w-1.04;
      block(node,x,.42,z,w,.84,.64,0x966350);
      block(node,x,.86,z,w+.08,.13,.8,0xe3ad72);
      for(let j=0;j<Math.floor(w/1.25);j++)block(node,x-w/2+.6+j*1.25,.49,z+.35,.12,.51,.08,0x6c5147);
      obstacles.push({kind,x,z,w,d:.75,hit:0});
    }
  });
  for(const i of [0,2,4,6,8]){
    const p=route[i],x=p.x+(i%2?1.6:-1.6),z=p.z+3;
    const g=new THREE.Group();world.add(g);g.position.set(x,1.95,z);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.52,.105,7,16),mat(0xf3c880,.25));g.add(ring);
    ball(g,0,0,0,.17,.17,.17,0xfbf2be);
    pickups.push({x,z,taken:false,group:g});
  }
  const last=route.at(-1);
  for(const s of [-1,1]){
    block(world,last.x+s*3,2.2,last.z+6.5,.43,4.3,.55,0xd3ae85);
    ball(world,last.x+s*3,4.45,last.z+6.5,.38,.38,.38,0xf9d383);
  }
  block(world,last.x,4.25,last.z+6.5,6.1,.38,.6,0xd3ae85);
  block(world,last.x,4.72,last.z+6.5,5.1,.55,.3,0x7b4c41);
  // Make landmark bell tower visible early in the run.
  const bx=-25,bz=158;
  block(world,bx,3,bz,9,29,8,0xc4a58e);
  for(let i=0;i<4;i++)block(world,bx,14.5+i*.8,bz,10-i*.5,.55,9-i*.5,0x9b6457);
  tube(world,bx,19,bz,1.55,5,1.55,0x805c55);
  ball(world,bx,21.5,bz,2.6,.95,2.6,0xd0a887);
}

function optimizeDistrict(){
  // Static city geometry is batched into GPU instancing. Hundreds of window
  // frames, tiles and stone details cost a handful of draw calls on phones.
  world.updateMatrixWorld(true);
  const dynamic=new Set();
  for(const p of pickups)p.group.traverse(o=>dynamic.add(o));
  const groups=new Map(), removals=[];
  world.traverse(o=>{
    if(!o.isMesh||dynamic.has(o))return;
    if(o.geometry!==boxGeo&&o.geometry!==sphereGeo&&o.geometry!==cylinderGeo)return;
    const key=o.geometry.uuid+'|'+o.material.uuid;
    if(!groups.has(key))groups.set(key,{geometry:o.geometry,material:o.material,items:[]});
    groups.get(key).items.push(o.matrixWorld.clone());
    removals.push(o);
  });
  for(const o of removals)o.parent.remove(o);
  for(const group of groups.values()){
    if(!group.items.length)continue;
    const instanced=new THREE.InstancedMesh(group.geometry,group.material,group.items.length);
    group.items.forEach((matrix,i)=>instanced.setMatrixAt(i,matrix));
    instanced.instanceMatrix.needsUpdate=true;
    instanced.frustumCulled=false;
    instanced.name='city-static-batch';
    world.add(instanced);
  }
}

let contactShadow=null;
function makeContactShadow(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=96;
 const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(48,48,3,48,48,46);
 gradient.addColorStop(0,'rgba(24,22,23,0.47)');gradient.addColorStop(.5,'rgba(24,22,23,0.25)');gradient.addColorStop(1,'rgba(24,22,23,0)');
 ctx.fillStyle=gradient;ctx.fillRect(0,0,96,96);
 const tex=new THREE.CanvasTexture(canvas),material=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
 contactShadow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);
 contactShadow.rotation.x=-Math.PI/2;contactShadow.renderOrder=2;scene.add(contactShadow);
}
function moveContactShadow(){
 if(!contactShadow)return;
 const onRoof=route.some(p=>Math.abs(state.x-p.x)<p.w*.5&&Math.abs(state.z-p.z)<p.l*.5);
 contactShadow.visible=onRoof&&state.y<4&&!cinematic?.isActive();
 contactShadow.position.set(state.x,.075,state.z);
 const lift=Math.max(0,state.y-1);
 contactShadow.scale.set(1.25+lift*.25,1.7+lift*.38,1);
 contactShadow.material.opacity=Math.max(.12,1-lift*.35);
}

function makeCharacter(){
  actor=new THREE.Group();scene.add(actor);
  runner=new THREE.Group();actor.add(runner);
  const sh=ball(runner,0,-.99,0,.32,.02,.26,mat(0x182026,.2));sh.material.transparent=true;sh.material.opacity=.25;groundShadows.push(sh);
  const body=new THREE.Group();runner.add(body);runner.userData.body=body;
  // Lean athletic silhouette: tapered jacket, hood, straps, slim trousers.
  const torso=mesh(body,new THREE.CylinderGeometry(.32,.27,.86,18),m(palettes.jacket[style.jacket]),0,.69,0,1,1,1);
  torso.rotation.z=.035;runner.userData.torso=torso;
  const waist=tube(body,0,.24,0,.29,.22,.24,0x343f49);
  const hood=ball(body,0,1.02,-.21,.36,.3,.23,0x7b3b33);runner.userData.hood=hood;
  const chest=block(body,0,.64,.283,.36,.49,.035,0x303942);chest.rotation.z=.37;
  block(body,0,.33,.02,.39,.12,.34,0x30363b);
  const bag=ball(body,0,.59,-.38,.32,.43,.18,0x343a3b);runner.userData.bag=bag;
  block(body,0,.60,-.54,.31,.29,.04,0x866657);
  for(const side of [-1,1]){const strap=mesh(body,new THREE.CapsuleGeometry(.037,.55,3,7),0x374147,side*.25,.66,-.14);strap.rotation.z=side*.16;}
  const neck=tube(body,0,1.19,0,.16,.16,.16,0xa26f50);runner.userData.neck=neck;
  const face=ball(body,0,1.52,.08,.255,.32,.25,0xa26f50);runner.userData.face=face;
  const earL=ball(body,-.255,1.52,.08,.055,.085,.08,0xa26f50);
  const earR=ball(body,.255,1.52,.08,.055,.085,.08,0xa26f50);
  runner.userData.ears=[earL,earR];
  // Nose and eyes are intentionally understated at game camera distance.
  const nose=ball(body,0,1.51,.31,.055,.063,.075,0xa26f50);runner.userData.nose=nose;
  const eyeL=ball(body,-.12,1.6,.295,.028,.026,.025,0x292e31);const eyeR=ball(body,.12,1.6,.295,.028,.026,.025,0x292e31);runner.userData.eyes=[eyeL,eyeR];
  block(body,0,.84,.27,.17,.07,.06,0xe4b07a);
  const zipper=block(body,0,.64,.322,.035,.48,.016,0xe8b988);runner.userData.zipper=zipper;
  const hair=new THREE.Group();body.add(hair);runner.userData.hair=hair;
  const arms=[];
  for(const side of [-1,1]){
    const shoulder=new THREE.Group();shoulder.position.set(side*.37,1.02,0);body.add(shoulder);
    const upper=mesh(shoulder,new THREE.CapsuleGeometry(.145,.29,5,11),palettes.jacket[style.jacket],side*.025,-.26,0);
    const elbow=new THREE.Group();elbow.position.set(side*.04,-.52,0);shoulder.add(elbow);
    mesh(elbow,new THREE.CapsuleGeometry(.12,.21,5,11),0x323941,0,-.19,.01);
    ball(elbow,0,-.44,.01,.12,.14,.12,0xa26f50);
    arms.push({shoulder,elbow,upper});
  }
  runner.userData.arms=arms;
  const legs=[];
  for(const side of [-1,1]){
    const hip=new THREE.Group();hip.position.set(side*.17,.16,0);body.add(hip);
    mesh(hip,new THREE.CapsuleGeometry(.165,.35,5,11),0x323e47,0,-.29,0);
    const knee=new THREE.Group();knee.position.y=-.59;hip.add(knee);
    mesh(knee,new THREE.CapsuleGeometry(.14,.24,5,11),0x2c343b,0,-.19,0);
    const shoe=ball(knee,0,-.42,.12,.175,.10,.28,0x232c32);
    block(knee,0,-.47,.18,.33,.045,.55,0xddd0b6);
    legs.push({hip,knee,shoe});
  }
  runner.userData.legs=legs;
  for(const side of [-1,1]){ball(body,side*.28,.98,.08,.13,.09,.17,0x393f45);block(body,side*.16,.29,.27,.06,.04,.07,0xc6a47f);}
  paintHair();
}

function makeRival(){
  rival=new THREE.Group();scene.add(rival);
  const trunk=new THREE.Group();rival.add(trunk);
  const rivalTorso=tube(trunk,0,.68,0,.29,.9,.27,0x4f5d62);
  tube(trunk,0,.16,0,.29,.22,.25,0x2d353d);
  const rivalFace=ball(trunk,0,1.47,.035,.26,.32,.26,0xa27359);
  const rivalHair=ball(trunk,0,1.78,-.01,.27,.16,.27,0x202629);
  for(const side of [-1,1]){
    const a=new THREE.Group();a.position.set(side*.34,1.03,0);trunk.add(a);
    tube(a,0,-.29,0,.14,.63,.14,0x52616b);
    tube(a,0,-.64,.07,.12,.24,.12,0x9e715e);
    rivalArms.push(a);
    const l=new THREE.Group();l.position.set(side*.17,.13,0);trunk.add(l);
    tube(l,0,-.39,0,.16,.8,.17,0x303d47);
    block(l,0,-.82,.12,.33,.17,.47,0x232d34);
    rivalLegs.push(l);
  }
  // Riven's mustard scarf makes their silhouette identifiable in motion.
  const scarf=block(trunk,0,1.18,-.05,.65,.13,.34,0xd8a567);
  const tail=block(trunk,.23,1.1,-.31,.15,.5,.08,0xd8a567);tail.rotation.z=.2;
  const bun=ball(trunk,0,1.76,-.21,.22,.22,.22,0x25252b);
  const visor=block(trunk,0,1.67,.26,.44,.075,.15,0xa9dbdf);
  rival.userData.trunk=trunk;rival.userData.look={torso:rivalTorso,face:rivalFace,hair:rivalHair,scarf,tail,bun,visor};
  rival.visible=false;dressRival();
}
function dressRival(){
  if(!rival)return;
  const kind=systems.levelIndex(),looks=[
   {jacket:0x4f5d62,skin:0xa27359,hair:0x202629,accent:0xd8a567},
   {jacket:0x5d4b68,skin:0xc58a66,hair:0x26232c,accent:0xacc3a0},
   {jacket:0x33424b,skin:0x976d57,hair:0x19252a,accent:0xe38d71}
  ],l=looks[kind],v=rival.userData.look;
  v.torso.material=mat(l.jacket);v.face.material=mat(l.skin);
  v.hair.material=mat(l.hair);v.scarf.material=mat(l.accent);v.tail.material=mat(l.accent);
  v.bun.material=mat(l.hair);v.bun.visible=kind===1;
  v.visor.visible=kind===2;
  rivalArms.forEach(arm=>{arm.children[0].material=mat(l.jacket);arm.children[1].material=mat(l.skin);});
  rival.scale.set(kind===1?.92:kind===2?1.06:1,kind===1?.97:kind===2?1.06:1,1);
}
function tuneDistrict(){
  const kind=systems.levelIndex(),night=kind===2?.88:kind===1?.36:0;
  skyDomeMaterial.uniforms.uNight.value=night;
  scene.fog.color.setHex(kind===2?0x4d5365:kind===1?0xb19d92:0xbbaea6);
  keySun.intensity=kind===2?1.15:kind===1?2.1:2.55;
  skyHem.intensity=kind===2?1.35:kind===1?1.65:1.75;
  renderer.toneMappingExposure=kind===2?1.03:kind===1?1.15:1.17;
}

function updateRival(dt){
  if(!rival)return;
  rival.visible=started||finished;
  if(!rival.visible)return;
  const z=Math.min(route.at(-1).z+6,-5.5+elapsed*systems.getLevel().speed);
  let near=route[0],next=route[1];
  for(let i=0;i<route.length;i++){
    if(z>=route[i].z-10)near=route[i];
    if(route[i].z>=z){next=route[i];break;}next=route.at(-1);
  }
  const p0=near,p1=next;
  const t=p0===p1?0:clamp((z-p0.z)/(p1.z-p0.z),0,1);
  const xx=p0.x+(p1.x-p0.x)*t+1.25;
  // Jump automatically across the three-metre gaps between buildings.
  let lift=0;
  for(let i=0;i<route.length-1;i++){
    const from=route[i],start=from.z+7.1;
    if(z>=start&&z<=start+8.4){lift=Math.sin((z-start)/8.4*Math.PI)*1.65;break;}
  }
  rival.position.set(xx,1+lift,z);
  rival.rotation.y=0;
  const cyc=elapsed*12.5;
  rivalArms.forEach((arm,i)=>arm.rotation.x=Math.sin(cyc+i*Math.PI)*.68);
  rivalLegs.forEach((leg,i)=>leg.rotation.x=-Math.sin(cyc+i*Math.PI)*.75);
  rival.userData.trunk.position.y=Math.abs(Math.sin(cyc))*.04;
}

function paintHair(){
  const hair=runner.userData.hair;if(!hair)return;hair.clear();
  const id=style.hair,base=new THREE.Color(palettes.hair[clamp(style.haircolor,0,palettes.hair.length-1)]),ink=mat(base),deep=mat(base.clone().multiplyScalar(.75));
  // All six styles have a clear silhouette from the third-person camera.
  if(id===0){ // short tight curls
    for(let i=0;i<30;i++){
      const a=i*2.39996,r=.055+.205*Math.sqrt((i+.5)/30);
      ball(hair,Math.cos(a)*r,1.79+.045*rnd(),.02+Math.sin(a)*r,.094,.082,.095,deep);
    }
  }else if(id===1){ // textured crop
    ball(hair,0,1.775,.025,.265,.14,.275,ink);
    for(let i=0;i<15;i++)ball(hair,(i%5-2)*.104,1.855+(Math.floor(i/5))*.028,-.13+Math.floor(i/5)*.13,.062,.064,.064,deep);
  }else if(id===2){ // long / loose curls
    ball(hair,0,1.8,0,.29,.16,.285,ink);
    for(const side of [-1,1])for(let i=0;i<5;i++){
      ball(hair,side*(.24+.015*Math.sin(i)),1.69-i*.14,.005+(i%2)*.04,.13,.17,.135,deep);
    }
    ball(hair,0,1.66,-.245,.23,.33,.18,deep);
  }else if(id===3){ // full round afro
    ball(hair,0,1.93,-.03,.38,.33,.37,deep);
    for(let i=0;i<28;i++){
      const a=i*2.39996,r=.13+.26*Math.sqrt((i+.5)/28);
      ball(hair,Math.cos(a)*r,1.92+.12*Math.sin(i*2),-.02+Math.sin(a)*r,.12,.12,.12,ink);
    }
  }else if(id===4){ // long braids: distinct strands
    ball(hair,0,1.79,-.07,.28,.13,.26,deep);
    for(let j=0;j<8;j++){
      const x=(j-3.5)*.075;
      for(let k=0;k<6;k++){
        const y=1.78-k*.125,zz=-.1-(k*.022);
        ball(hair,x+.045*Math.sin(k*.62+j),y,zz,.041,.081,.051,ink);
      }
    }
    for(const side of [-1,1])for(let k=0;k<5;k++)ball(hair,side*.26,1.72-k*.145,-.05,.075,.085,.075,deep);
  }else{ // locs
    ball(hair,0,1.8,0,.29,.15,.27,deep);
    for(let j=0;j<12;j++){
      const theta=j*Math.PI*2/12,x=Math.cos(theta)*.24,z=Math.sin(theta)*.18;
      for(let k=0;k<4;k++)ball(hair,x+.023*Math.sin(k+j),1.74-k*.17,z-.03*k,.07,.102,.074,ink);
    }
  }
}
function applyStyle(){
  if(!runner)return;
  const skin=new THREE.Color(palettes.skin[clamp(style.skin,0,palettes.skin.length-1)]);
  const jacket=new THREE.Color(palettes.jacket[clamp(style.jacket,0,palettes.jacket.length-1)]);
  const skinMat=mat(skin),jacketMat=mat(jacket);
  runner.userData.face.material=skinMat;
  runner.userData.neck.material=skinMat;
  runner.userData.nose.material=skinMat;
  runner.userData.ears.forEach(e=>e.material=skinMat);
  runner.userData.arms.forEach(a=>{a.upper.material=jacketMat;a.elbow.children.at(-1).material=skinMat;});
  runner.userData.torso.material=jacketMat;
  runner.userData.hood.material=jacketMat;
  const build=Number(style.build||0);
  runner.userData.torso.scale.set(build===0?1.1:build===1?.88:1,1,build===0?1.05:1);
  runner.userData.face.scale.set(build===0?.272:build===1?.235:.255,.32,build===0?.255:.24);
  runner.userData.arms.forEach((a,i)=>a.shoulder.position.x=(i===0?-1:1)*(build===0?.41:build===1?.33:.37));
  runner.userData.legs.forEach((leg,i)=>leg.hip.position.x=(i===0?-1:1)*(build===1?.19:.17));
  if(runner.userData.bag)runner.userData.bag.visible=style.gear!==1;
  paintHair();
  systems.refreshAvatar();
  try{localStorage.setItem('runners.style',JSON.stringify(style))}catch(e){}
}

function bindStyles(){
  for(const kind of ['skin','jacket','hair','haircolor','build','gear']){
    document.querySelectorAll('[data-'+kind+']').forEach(btn=>{
      btn.addEventListener('click',()=>{
        style[kind]=Number(btn.dataset[kind]);updateSwatches();applyStyle();
      });
    });
  }
  updateSwatches();
}
function updateSwatches(){
  for(const kind of ['skin','jacket','hair','haircolor','build','gear'])document.querySelectorAll('[data-'+kind+']').forEach(el=>el.classList.toggle('selected',Number(el.dataset[kind])===style[kind]));
}
function notify(message,time=2){ui.toast.textContent=message;ui.toast.classList.add('visible');feedbackUntil=runClock+time}
function sound(freq=300,span=.08,kind='sine',gain=.045){
  if(!volume||systems.isMuted())return;
  try{
    audioContext=audioContext||new (window.AudioContext||window.webkitAudioContext)();
    if(audioContext.state==='suspended')audioContext.resume();
    const osc=audioContext.createOscillator(),amp=audioContext.createGain(),t=audioContext.currentTime;
    osc.type=kind;osc.frequency.setValueAtTime(freq,t);osc.frequency.exponentialRampToValueAtTime(Math.max(30,freq*.67),t+span);
    amp.gain.setValueAtTime(gain,t);amp.gain.exponentialRampToValueAtTime(.0001,t+span);
    osc.connect(amp);amp.connect(audioContext.destination);osc.start(t);osc.stop(t+span);
  }catch(e){}
}
function resetPosition(point=0){
  const p=route[point];state.x=p.x;state.y=1;state.z=p.z-5;state.vx=0;state.vz=0;state.vy=0;
  state.grounded=true;state.coyote=0;state.buffer=0;state.slide=0;state.boost=0;state.vault=0;state.trick=0;state.trickUsed=false;state.pendingStunt=0;
}
function rebuildCourse(){
  world.clear();route.length=0;obstacles.length=0;pickups.length=0;animated.length=0;
  seed=93519+systems.levelIndex()*612;
  buildDistrict();optimizeDistrict();builtLevel=systems.levelIndex();tuneDistrict();dressRival();
}
function goMain(){
  started=false;finished=false;paused=false;
  state.vx=state.vz=state.vy=0;
  ui.toast.classList.remove('visible');
  if(rival)rival.visible=false;
  $('sound-hud').hidden=true;
  systems.showMenu();
}
function newRun(){
  if(builtLevel!==systems.levelIndex())rebuildCourse();
  elapsed=0;collected=0;falls=0;finished=false;paused=false;checkpointIndex=0;
  state.stuntScore=0;state.combo=0;state.comboWindow=0;state.pendingStunt=0;state.trick=0;state.trickUsed=false;state.vault=0;updateStuntHud();
  obstacles.forEach(o=>{o.hit=0;o.vaulted=false;o.cleared=false;});pickups.forEach(p=>{p.taken=false;p.group.visible=true});
  resetPosition(0);started=true;ui.splash.hidden=true;ui.modal.hidden=true;if(rival)rival.visible=true;
  ui.hud.hidden=false;ui.controls.hidden=false;ui.pause.hidden=false;$('sound-hud').hidden=false;
  ui.pause.setAttribute('aria-label','Pause game');
  systems.beforeRun();
  ui.modal.dataset.action='restart';
  notify(systems.getLevel().rival.toUpperCase()+': CATCH ME IF YOU CAN',2.1);
  sound(410,.11);
}

function createStuntHud(){
  const hud=document.createElement('div');hud.id='stunt-hud';
  hud.innerHTML='<strong id="stunt-total">0000</strong><span id="stunt-combo">STYLE POINTS</span>';
  ui.hud.appendChild(hud);
}
function updateStuntHud(){
  const score=$('stunt-total');if(!score)return;
  score.textContent=String(state.stuntScore).padStart(4,'0');
  $('stunt-combo').textContent=state.combo>1?'x'+state.combo+' FLOW COMBO':'STYLE POINTS';
}
function bankStunt(points,label){
  if(!started||finished)return;
  if(state.comboWindow<=0)state.combo=0;
  state.combo=Math.min(5,state.combo+1);state.comboWindow=6.5;
  const gained=Math.round(points*(1+.25*(state.combo-1)));
  state.stuntScore+=gained;
  updateStuntHud();
  notify(label+'  +'+gained+(state.combo>1?'  x'+state.combo+' FLOW':''),1.5);
  systems.sfx('trick');
}
function tryVault(){
  if(!state.grounded||state.vz<2.1)return false;
  const target=obstacles.find(o=>o.kind!=='beam'&&!o.vaulted&&
    o.z-state.z>.18&&o.z-state.z<2.35&&
    Math.abs(state.x-o.x)<o.w*.5+.15);
  if(!target)return false;
  target.vaulted=true;state.vault=.52;state.vy=8.4+systems.getUpgrade('spring')*.25;
  state.vz=Math.max(state.vz,9.8);state.grounded=false;state.coyote=0;
  state.buffer=0;state.airTime=0;state.slide=0;state.trickUsed=false;
  bankStunt(95,'SPEED VAULT');systems.sfx('vault');
  return true;
}
function trick(){
  if(!started||paused||finished||state.grounded||state.trickUsed||state.vault>.18)return;
  // Points only bank on a clean landing. No infinite mid-air farming.
  state.trickUsed=true;state.trick=.68;state.pendingStunt=125;
  notify('AIR ROLL · STICK THE LANDING',1.15);
  systems.sfx('trick');
}

function jump(){
  if(!started||paused||finished)return;
  if(tryVault())return;
  state.buffer=.17;
  if(state.grounded||state.coyote>0)performJump();
}
function performJump(){
  state.vy=9.8+systems.getUpgrade('spring')*.65;state.grounded=false;state.coyote=0;state.buffer=0;
  state.slide=0;state.airTime=0;state.trickUsed=false;state.pendingStunt=0;
  sound(420,.13,'triangle',.06);systems.sfx('jump');
}
function slide(){
  if(!started||paused||finished)return;
  if(state.grounded){state.slide=.78;state.boost=.22;sound(155,.18,'sawtooth',.023);systems.sfx('slide');}
}
function actionPointer(id,fn){
  const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);fn();el.classList.add('pressed')});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,()=>el.classList.remove('pressed'));
}
function bindControls(){
  const stick=ui.stick,thumb=ui.thumb;
  const move=e=>{
    if(input.pointer!==e.pointerId)return;
    const r=stick.getBoundingClientRect();
    const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
    const cap=Math.min(r.width/2-14,57),len=Math.hypot(dx,dy)||1;
    input.x=clamp(dx/cap,-1,1);input.z=clamp(-dy/cap,-1,1);
    const magnitude=Math.min(1,cap/len);
    input.x=dx/len*Math.min(len/cap,1);input.z=-dy/len*Math.min(len/cap,1);
    thumb.style.transform='translate('+input.x*cap+'px,'+(-input.z*cap)+'px)';
  };
  stick.addEventListener('pointerdown',e=>{e.preventDefault();if(input.pointer!==null)return;input.pointer=e.pointerId;stick.setPointerCapture(e.pointerId);move(e)});
  stick.addEventListener('pointermove',move);
  const release=e=>{if(input.pointer!==e.pointerId)return;input.pointer=null;input.x=0;input.z=0;thumb.style.transform='translate(0,0)'};
  stick.addEventListener('pointerup',release);stick.addEventListener('pointercancel',release);
  actionPointer('jump',jump);actionPointer('slide',slide);actionPointer('trick',trick);
  addEventListener('keydown',e=>{
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
    input.keys.add(e.code);
    if(!e.repeat&&(e.code==='Space'||e.code==='KeyJ'))jump();
    if(!e.repeat&&(e.code==='KeyC'||e.code==='ShiftLeft'))slide();
    if(!e.repeat&&(e.code==='KeyK'||e.code==='KeyF'))trick();
    if(!e.repeat&&e.code==='Escape'&&started&&!finished)togglePause();
  },{passive:false});
  addEventListener('keyup',e=>input.keys.delete(e.code));
  ui.start.addEventListener('click',()=>systems.startStory());
  ui.pause.addEventListener('click',togglePause);
  $('retry').addEventListener('click',newRun);
  $('sound').addEventListener('click',()=>systems.toggleAudio());
  ui.modalPrimary.addEventListener('click',()=>{if(finished)newRun();else togglePause()});
  ui.modalSecondary.addEventListener('click',()=>{ui.modal.hidden=true;if(finished)goMain();else newRun();});
  addEventListener('blur',()=>{if(started&&!paused&&!finished)togglePause()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&started&&!paused&&!finished)togglePause()});
  // Prevent browser page swipe/scroll inside game; the iOS share/browser chrome remains OS-controlled.
  document.addEventListener('touchmove',e=>{if(started&&!paused)e.preventDefault()},{passive:false});
  bindStyles();
}
function togglePause(){
  if(!started||finished)return;
  paused=!paused;
  ui.modal.hidden=!paused;
  if(paused){
    ui.modalTitle.textContent='PAUSED';
    ui.modalText.textContent='THE STEPS · '+elapsed.toFixed(1)+' SECONDS';
    ui.modalPrimary.textContent='RESUME';
    ui.modalSecondary.textContent='RESTART RACE';
    $('modal-tertiary').textContent='MAIN MENU';ui.modal.dataset.action='menu';
  }
}
function kill(){
  falls++;resetPosition(checkpointIndex);state.combo=0;state.comboWindow=0;state.pendingStunt=0;updateStuntHud();
  elapsed+=2.5;notify('MISSED THE LANDING  +2.5s',2.2);sound(118,.22,'triangle',.05);
}
function collide(t){
  for(const o of obstacles){
    if(Math.abs(state.x-o.x)>(o.w*.5+radius)||Math.abs(state.z-o.z)>(o.d*.5+radius))continue;
    let safe=false;
    if(o.kind==='crate')safe=state.y>2.15||state.vault>0;
    if(o.kind==='beam'){
      safe=state.slide>.12||state.y>2.95;
      if(safe&&state.slide>.12&&!o.cleared){o.cleared=true;bankStunt(75,'CLEAN SLIDE');}
    }
    if(o.kind==='barrier')safe=state.y>2.05||state.vault>0;
    if(safe)continue;
    if(o.hit>runClock-.65)continue;
    o.hit=runClock;state.combo=0;state.comboWindow=0;state.pendingStunt=0;updateStuntHud();elapsed+=.65;state.vz=-1.5;state.z=Math.min(state.z,o.z-o.d*.5-radius-.06);
    flashUntil=runClock+.15;notify(o.kind==='beam'?'SLIDE UNDER THE BEAM · +0.7s':o.kind==='barrier'?'JUMP THE WALL · +0.7s':'JUMP OR DETOUR · +0.7s',1.2);
    sound(130,.12,'square',.025);systems.sfx('hit');
  }
}
function checkpoint(){
  const mid=Math.round((route.length-1)*.62),first=Math.round((route.length-1)*.26);
  const desired=state.z>route[mid].z?mid:state.z>route[first].z?first:0;
  if(desired>checkpointIndex){checkpointIndex=desired;notify('CHECKPOINT / '+systems.getLevel().name,2);sound(600,.18);}
}
function finish(){
  finished=true;started=false;ui.controls.hidden=true;ui.pause.hidden=true;
  $('sound-hud').hidden=true;
  const info=systems.afterFinish({elapsed,collected,falls,stuntScore:state.stuntScore});
  const benchmark=(route.at(-1).z+11.5)/systems.getLevel().speed;
  const beat=elapsed<benchmark;
  ui.best.textContent=Number(systems.getBest()).toFixed(1)+'s';
  ui.modal.hidden=false;ui.modalTitle.textContent=beat?'RIVAL BEATEN':'ROOFTOP CLEARED';
  ui.modalText.textContent=elapsed.toFixed(1)+'s  ·  '+collected+'/5 SIGNALS  ·  '+falls+' FALLS\n'+state.stuntScore+' STYLE POINTS  ·  +'+info.stuntCredits+' TRICK CREDITS\n\n'+
    (info.personalBest?'NEW PERSONAL BEST · YOUR SHADOW IS SAVED\n':'')+
    '◈ +'+info.reward+' ROUTE CREDITS\n\n'+
    (beat?systems.getLevel().rival.toUpperCase()+': “You got me this time. Not bad.”':
    systems.getLevel().rival.toUpperCase()+': “That was close. Race me again.”')+
    (info.newlyUnlocked?'\n\nNEXT DISTRICT UNLOCKED':'');
  ui.modalPrimary.textContent='RACE AGAIN';ui.modalSecondary.textContent='MAIN MENU';
  const third=$('modal-tertiary');
  third.textContent=info.doneAll?'VIEW CHAPTERS':'NEXT CHAPTER';
  ui.modal.dataset.action=info.doneAll?'menu':'next';
  systems.sfx('finish');sound(660,.28,'triangle',.05);
}

function simulation(dt){
  runClock+=dt;
  if(ui.toast.classList.contains('visible')&&runClock>feedbackUntil)ui.toast.classList.remove('visible');
  if(!started||paused||finished)return;
  elapsed+=dt;state.coyote=Math.max(0,state.coyote-dt);state.buffer=Math.max(0,state.buffer-dt);state.slide=Math.max(0,state.slide-dt);state.boost=Math.max(0,state.boost-dt);
  state.vault=Math.max(0,state.vault-dt);state.trick=Math.max(0,state.trick-dt);state.comboWindow=Math.max(0,state.comboWindow-dt);
  const left=input.keys.has('KeyA')||input.keys.has('ArrowLeft');
  const right=input.keys.has('KeyD')||input.keys.has('ArrowRight');
  const up=input.keys.has('KeyW')||input.keys.has('ArrowUp');
  const down=input.keys.has('KeyS')||input.keys.has('ArrowDown');
  let dx=clamp(-input.x+Number(left)-Number(right),-1,1),dz=clamp(input.z+Number(up)-Number(down),-1,1);
  const length=Math.hypot(dx,dz);if(length>1){dx/=length;dz/=length;}
  const running=dz>.68&&Math.abs(dx)<.8,topSpeed=(running?10.4:8.2)+systems.getUpgrade('pace')*.42;
  const speed=state.slide>0?Math.max(9.3,topSpeed+1.1):topSpeed;
  const airGrip=7.5+systems.getUpgrade('grip')*1.7;
  state.vx=smooth(state.vx,dx*speed,state.grounded?13:airGrip,dt);
  state.vz=smooth(state.vz,dz*speed+(state.boost>0?1.2:0),state.grounded?13:airGrip,dt);
  // The camera looks toward +Z, so screen-right corresponds to world -X.
  state.x+=state.vx*dt;state.z+=state.vz*dt;
  const roof=route.find(p=>Math.abs(state.x-p.x)<p.w/2-.25&&Math.abs(state.z-p.z)<p.l/2-.15);
  const wasGrounded=state.grounded;
  if(!roof&&wasGrounded){state.grounded=false;state.coyote=.12;}
  if(!state.grounded){
    state.airTime+=dt;
    state.vy-=23.8*dt;state.y+=state.vy*dt;
    if(roof&&state.y<=1&&state.vy<=0){
      state.y=1;state.vy=0;state.grounded=true;state.airTime=0;state.vault=0;
      if(state.pendingStunt>0){bankStunt(state.pendingStunt,'CLEAN LANDING');state.pendingStunt=0;}
      if(state.buffer>0)performJump();else if(!wasGrounded)sound(190,.06,'triangle',.026);
    }
  } else {state.y=1;state.vy=0;}
  if(state.buffer>0&&(state.grounded||state.coyote>0))performJump();
  if(state.y<-12)kill();
  collide(dt);checkpoint();
  for(const p of pickups){
    if(!p.taken&&Math.abs(state.x-p.x)<1.25&&Math.abs(state.z-p.z)<1.5&&Math.abs(state.y-1)<1.8){
      p.taken=true;p.group.visible=false;collected++;notify('SIGNAL FOUND  '+collected+'/5',1.5);sound(910,.19,'sine',.045);systems.sfx('coin');
    }
  }
  systems.track(dt,state,elapsed,started&&!paused&&!finished);
  if(state.z>route.at(-1).z+6.5)finish();
  ui.time.textContent=Math.floor(elapsed/60).toString().padStart(2,'0')+':'+(elapsed%60).toFixed(1).padStart(4,'0');
  ui.progress.style.width=clamp((state.z+6)/(route.at(-1).z+12)*100,0,100)+'%';
  const velocity=Math.hypot(state.vx,state.vz);ui.speed.textContent=Math.round(velocity*3.6).toString();
  ui.meter.style.width=Math.round(clamp(velocity/(10.4+systems.getUpgrade('pace')*.42),0,1)*100)+'%';
  ui.pickup.textContent=collected+'/5';
  if(state.grounded&&velocity>3&&state.slide<=0){
    state.stepTimer+=dt;
    if(state.stepTimer>.28){state.stepTimer=0;systems.sfx('footstep');}
  }else state.stepTimer=0;
  if(runClock<flashUntil)renderer.domElement.classList.add('impact');else renderer.domElement.classList.remove('impact');
}
function animateCharacter(dt){
  if(!runner)return;
  actor.position.set(state.x,state.y,state.z);
  const speed=Math.hypot(state.vx,state.vz),moving=speed>1;
  const tilt=state.slide>0?.9:0;
  const target= moving?Math.atan2(state.vx,state.vz):state.angle;
  state.angle=smooth(state.angle,target,10,dt);
  runner.rotation.y=state.angle;
  const phaseRate=state.grounded?Math.min(16,speed*1.45):2.3;
  state.runPhase+=phaseRate*dt;
  const phase=state.runPhase,stride=moving&&state.grounded&&!state.slide?Math.min(.9,speed*.078):0;
  const body=runner.userData.body;
  body.position.y=smooth(body.position.y,(state.grounded&&moving&&!state.slide?Math.abs(Math.sin(phase))*0.065:0)-(state.slide>0?.3:0),12,dt);
  const spin=state.trick>0?(-Math.PI*2)*(1-state.trick/.68):0;
  body.rotation.x=smooth(body.rotation.x,state.trick>0?spin:(state.vault>0?-.5:state.slide>0?.72:(moving?.12:0)),state.trick>0?23:9,dt);
  body.rotation.z=smooth(body.rotation.z,-state.vx*.012,7,dt);
  runner.userData.legs.forEach((leg,i)=>{
    leg.hip.rotation.x=smooth(leg.hip.rotation.x,state.slide>0?1.15:(state.grounded?Math.sin(phase+i*Math.PI)*stride:(i===0?-.34:.44)),12,dt);
    leg.knee.rotation.x=smooth(leg.knee.rotation.x,state.slide>0?-1.45:(state.grounded?Math.max(0,-Math.sin(phase+i*Math.PI))*.75:-.4),12,dt);
  });
  runner.userData.arms.forEach((arm,i)=>{
    arm.shoulder.rotation.x=smooth(arm.shoulder.rotation.x,state.slide>0?-.9:(state.grounded?-Math.sin(phase+i*Math.PI)*stride*.8:(i===0?-.7:-.3)),11,dt);
    arm.elbow.rotation.x=smooth(arm.elbow.rotation.x,-.35,8,dt);
  });
  runner.userData.torso.rotation.z=smooth(runner.userData.torso.rotation.z,state.vx*.015,7,dt);
  // Fake contact shadow that shrinks as Kai jumps.
  const sh=groundShadows[0];if(sh){sh.visible=state.y<3.4;sh.position.y=-state.y+.018;sh.scale.x=.32+Math.max(0,state.y-1)*.04;sh.scale.z=.28+Math.max(0,state.y-1)*.04;}
}
let lastFrame=0,simCarry=0;
function frame(now){
  requestAnimationFrame(frame);
  const dt=lastFrame?Math.min(.18,(now-lastFrame)/1000):1/60;lastFrame=now;
  // Fixed 60 Hz physics with catch-up steps: dropping frames never causes slow-motion.
  simCarry=Math.min(.18,simCarry+dt);
  let steps=0;
  while(simCarry>=1/60&&steps<11){
    simulation(1/60);simCarry-=1/60;steps++;
  }
  animateCharacter(dt);updateRival(dt);moveContactShadow();
  const filmPlaying=cinematic&&cinematic.tick(now,dt);
  const narrow=innerHeight>innerWidth;
  const back=narrow?8.5:6.1,up=narrow?4.8:3.45,ahead=narrow?6.3:6.8;
  const followX=state.x*.82;
  if(!filmPlaying){
   targetCamera.set(followX, state.y+up, state.z-back);
   camera.position.lerp(targetCamera,1-Math.exp(-3.6*dt));
   cameraAim.set(state.x*.95,state.y+(narrow?1.3:1.2),state.z+ahead);
   camera.lookAt(cameraAim);
   const goalFov=(narrow?65:67)+Math.max(0,Math.hypot(state.vx,state.vz)-7)*.48;camera.fov=smooth(camera.fov,goalFov,2,dt);camera.updateProjectionMatrix();
  }
  for(const [i,p] of pickups.entries())if(!p.taken){
    p.group.rotation.y+=dt*1.1;
    p.group.position.y=1.97+Math.sin(now*.002+i)*.16;
  }
  renderer.render(scene,camera);
  systems.drawPreview(dt);
}
function resize(){if(!renderer)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,isTouch?1.45:1.8));}
addEventListener('resize',resize);
addEventListener('orientationchange',()=>setTimeout(resize,200));
try{boot()}catch(error){
  console.error(error);
  $('error').hidden=false;$('error-message').textContent='Could not start the 3D engine. Open RUNNERS in Safari with an internet connection. '+error.message;
}
