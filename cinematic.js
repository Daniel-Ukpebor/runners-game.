// RUNNERS / in-engine cinematic direction.
// Runs over the exact same 3D district as gameplay. There are no static story slides.
export function createCinematic({THREE,scene,camera,actor,rival,runner,route,ensureCourse,levelIndex}){
 const overlay=document.getElementById('story-overlay');
 const target=new THREE.Vector3(),look=new THREE.Vector3(),aim=new THREE.Vector3();
 let youthKai=runner.clone(true),youthRiven=rival.clone(true);
 youthKai.name='Kai, summer in Vesper';youthRiven.name='Riven, summer in Vesper';
 youthKai.scale.setScalar(.73);youthRiven.scale.setScalar(.73);
 scene.add(youthKai,youthRiven);youthKai.visible=youthRiven.visible=false;
 let active=false,shot=-1,shotStarted=0;
 const roof=(i)=>route[Math.min(i,route.length-1)]||{x:0,z:0};
 function tick(now,dt){
  const playing=overlay&&!overlay.hidden;
  if(!playing){
   if(active){
    youthKai.visible=youthRiven.visible=false;
    actor.visible=true;
    active=false;shot=-1;
   }
   return false;
  }
  if(!active){
   active=true;ensureCourse();shot=-1;
   // Rebuild the cinematic doubles from the currently customized runner.
   scene.remove(youthKai,youthRiven);
   youthKai=runner.clone(true);youthRiven=rival.clone(true);
   youthKai.scale.setScalar(.73);youthRiven.scale.setScalar(.73);
   scene.add(youthKai,youthRiven);
  }
  const sceneNum=Number(overlay.dataset.scene||0);
  if(shot!==sceneNum){shot=sceneNum;shotStarted=now;}
  const t=(now-shotStarted)/1000;
  const base=roof(0);
  const past=levelIndex()===0&&(sceneNum===0||sceneNum===1);
  youthKai.visible=past;youthRiven.visible=past;
  actor.visible=!past;rival.visible=!past;
  if(past){
   const travel=(sceneNum===0?Math.min(8,t*1.75):Math.min(11,t*2.05));
   youthKai.position.set(base.x-.82,1,base.z-6+travel);
   youthRiven.position.set(base.x+.88,1,base.z-5.1+travel*1.06);
   const bob=Math.sin(t*13)*.04;
   youthKai.position.y+=bob;youthRiven.position.y-=bob;
   youthKai.rotation.y=youthRiven.rotation.y=0;
   // The camera runs alongside the children before rising to reveal Vesper.
   if(sceneNum===0){
    target.set(base.x-6.6,3.35,base.z-7+travel*.8);
    look.set(base.x,1.6,base.z-2+travel);
   }else{
    target.set(base.x-8+Math.min(3,t)*1.6,6.6,base.z-1+travel*.52);
    look.set(base.x+.5,1.2,base.z+9+travel*.54);
   }
  }else{
   const near=roof(0); 
   actor.position.set(near.x-1,1,near.z-5.5);
   rival.position.set(near.x+1.3,1,near.z-3.1);
   actor.rotation.y=rival.rotation.y=0;
   if(sceneNum===2){
    target.set(near.x+4.8,2.65,near.z-8.7+Math.min(t,3)*.25);
    look.set(near.x,1.5,near.z-4+Math.min(t,3)*.4);
   }else{
    target.set(near.x+Math.sin(t*.33)*.6,3.6,near.z-11+Math.min(t,4)*.15);
    look.set(near.x+.1,1.5,near.z+10);
   }
  }
  camera.position.lerp(target,Math.min(1,1-Math.exp(-3.25*dt)));
  aim.lerp(look,Math.min(1,1-Math.exp(-3.7*dt)));
  camera.lookAt(aim);
  const desired=shot===0?47:shot===1?53:shot===2?40:59;
  camera.fov=THREE.MathUtils.lerp(camera.fov,desired,1-Math.exp(-2.8*dt));
  camera.updateProjectionMatrix();
  return true;
 }
 return {tick,isActive:()=>active};
}
