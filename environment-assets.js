// Third-party environment models: Kenney Nature Kit (CC0 1.0).
// Self-hosted in ./assets/nature so RUNNERS works under GitHub Pages or Vercel.
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/GLTFLoader.js';
const loader=new GLTFLoader(),cache=new Map();
let generation=0,loaded=0,failures=0;
const specs={
  'tree-detailed.glb':{height:3.4},
  'tree-palm.glb':{height:4.0},
  'plant-bushdetailed.glb':{height:1.1},
  'pot-large.glb':{height:.67},
  'flower-reda.glb':{height:.54}
};
function getModel(file) {
 if(!cache.has(file)){
  cache.set(file,new Promise((resolve,reject)=>{
   loader.load('./assets/nature/'+file,gltf=>{
    const original=gltf.scene;
    original.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;
      o.material=o.material.clone();
      if(o.material.roughness!==undefined)o.material.roughness=.93;
    }});
    resolve(original);
   },undefined,reject);
  }));
 }
 return cache.get(file);
}
export function dressVesperWithModels({THREE,world,route}){
 const token=++generation;
 loaded=0;failures=0;
 const requests=[];
 function add(file,x,y,z,height,rotation=0){
  requests.push(getModel(file).then(original=>{
   if(token!==generation)return;
   const group=original.clone(true),bounds=new THREE.Box3().setFromObject(group);
   const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
   const ratio=height/Math.max(.08,size.y);
   // Center the imported mesh and align its lowest vertex to roof height.
   group.scale.setScalar(ratio);
   group.position.set(x-center.x*ratio,y-bounds.min.y*ratio,z-center.z*ratio);
   group.rotation.y=rotation;
   world.add(group);loaded++;
  }).catch(err=>{
   failures++;if(failures<2)console.warn('RUNNERS optional decorative model unavailable',file,err);
  }));
 }
 for(let i=0;i<route.length;i++){
  const q=route[i],side=i%2?1:-1;
  if(i%3===0&&i>0){
   add('tree-detailed.glb',q.x+side*(q.w/2-.65),0,q.z+1.5,3.1,i*.72);
   add('tree-detailed.glb',q.x-side*(q.w/2-.75),0,q.z-4,2.5,i*.5);
  }
  if(i%2===0){
   add('plant-bushdetailed.glb',q.x+side*(q.w/2-.65),0,q.z+4,1.15,i*.4);
   add('pot-large.glb',q.x-side*(q.w/2-.75),0,q.z-4,.78,i*.8);
   add('flower-reda.glb',q.x-side*(q.w/2-.75),.6,q.z-4,.48,i*.8);
  }
 }
 const last=route.at(-1);
 if(last){
  add('tree-palm.glb',last.x-last.w/2+1.2,0,last.z-3,3.4,.4);
  add('tree-palm.glb',last.x+last.w/2-1.2,0,last.z-3,3.7,-.3);
 }
 return {ready:Promise.allSettled(requests),stats:()=>({loaded,failures,total:requests.length})};
}