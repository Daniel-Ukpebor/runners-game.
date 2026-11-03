// Original weighted humanoid: source and license in assets/characters/.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/utils/SkeletonUtils.js';
export {cloneSkeleton};
let clips=[];
const drivers=new WeakMap();
export const characterStatus={state:'loading',bytes:0,total:0,clips:[],skinnedMeshes:0};
export async function loadKai(){
 const gltf=await new GLTFLoader().loadAsync('./assets/characters/kai.glb',e=>{characterStatus.bytes=e.loaded;characterStatus.total=e.total||0;});
 // Exported constant scale channels must not overwrite the player's body proportions.
 clips=gltf.animations;for(const clip of clips)clip.tracks=clip.tracks.filter(track=>!track.name.endsWith('.scale'));
 gltf.scene.name='KaiAsset';
 gltf.scene.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.castShadow=true;o.receiveShadow=true;if(o.isSkinnedMesh)characterStatus.skinnedMeshes++;}});
 characterStatus.clips=clips.map(c=>c.name);characterStatus.state='ready';return gltf.scene;
}
export function configureKai(root,style,palettes){
 const asset=root.getObjectByName('KaiAsset');if(!asset)return;
 const materials=new Set();
 asset.traverse(o=>{
  if(/^Hair\d/.test(o.name))o.visible=Number(o.name[4])===Number(style.hair);
  if(o.name.startsWith('Accessory'))o.visible=Number(o.name[9])===Number(style.accessory);
  if(o.name==='PackSet')o.visible=Number(style.gear)!==1;
  if(o.name==='Sleeves')o.visible=Number(style.outfit||0)!==1;
  if(!o.isMesh)return;
  if(o.morphTargetDictionary){
   for(const [name,index] of Object.entries(o.morphTargetDictionary))o.morphTargetInfluences[index]=name==='Round'&&Number(style.face)===0?1:name==='Defined'&&Number(style.face)===2?1:0;
  }
  for(const m of (Array.isArray(o.material)?o.material:[o.material]))materials.add(m);
 });
 for(const m of materials){
  if(m.name==='Skin')m.color.set(palettes.skin[style.skin]||palettes.skin[2]);
  if(m.name==='Jacket')m.color.set(Number(style.outfit)===2?0x303b4a:palettes.jacket[style.jacket]||palettes.jacket[0]);
  if(m.name==='Shirt')m.color.set(Number(style.outfit)===2?0x7b898b:0xc9b891);
  if(m.name==='Hair')m.color.set(palettes.hair[style.haircolor]||palettes.hair[0]);
  if(m.name==='Iris')m.color.set([0x322922,0x80633f,0x678695][style.eyecolor]||0x322922);
  if(m.name==='Trousers')m.color.set([0x27343e,0x414c48,0x252631][style.outfit||0]||0x27343e);
 }
 // Bone scaling changes the actual skinned body, including its attachments.
 const width=[.91,1,1.12][style.physique]||1;
 asset.scale.set(width*(Number(style.build)===1?.93:1),1,Number(style.physique)===2?1.07:1);
 const chest=asset.getObjectByName('Chest');if(chest)chest.scale.x=Number(style.build)===1?.88:1;
 const hips=asset.getObjectByName('Hips');if(hips)hips.scale.x=Number(style.build)===1?1.09:1;
}
export function animateKai(root,dt,state={}){
 const asset=root?.getObjectByName('KaiAsset');if(!asset||!clips.length)return;
 let driver=drivers.get(asset);
 if(!driver){const mixer=new THREE.AnimationMixer(asset),actions={};for(const clip of clips)actions[clip.name]=mixer.clipAction(clip);driver={mixer,actions,current:null};drivers.set(asset,driver);}
 const speed=Math.hypot(state.vx||0,state.vz||0);
 let name=state.climb>0?'Climb':state.trick>0?'Roll':state.vault>0?'Vault':state.slide>0?'Slide':state.grounded===false?'Jump':state.landing>0?'Land':speed>7?'Run':speed>1?'Walk':'Idle';
 const action=driver.actions[name]||driver.actions.Idle||Object.values(driver.actions)[0];
 if(driver.current!==action){const old=driver.current;action.reset().setEffectiveWeight(1).play();if(old)action.crossFadeFrom(old,.16,true);driver.current=action;}
 action.timeScale=name==='Run'?Math.max(.7,Math.min(1.4,speed/10)):name==='Walk'?Math.max(.5,speed/4):1;
 driver.mixer.update(Math.min(dt,.1));
 asset.position.y=state.slide>0?-.2:state.landing>0?-.08:0;
 if(state.trick>0)asset.rotation.x=(1-state.trick/.68)*Math.PI*2;else asset.rotation.x=THREE.MathUtils.damp(asset.rotation.x,0,18,dt);
}

export function inspectKai(root){
 const asset=root?.getObjectByName('KaiAsset');if(!asset)return null;
 const face=asset.getObjectByName('Face'),driver=drivers.get(asset);
 return {chestWidth:asset.getObjectByName('Chest')?.scale.x,hipsWidth:asset.getObjectByName('Hips')?.scale.x,animation:driver?.current?.getClip().name||null,faceWeights:face?.morphTargetInfluences||[],hair:[0,1,2,3,4,5].map(i=>asset.getObjectByName('Hair'+i)?.visible),pack:asset.getObjectByName('PackSet')?.visible,sleeves:asset.getObjectByName('Sleeves')?.visible};
}
