// Authored traversable additions to The Steps. Coordinates share the physics surface model.
export function buildRoutes({THREE,world,block,line,ball,texturedMaterial,chapter,cameraSolids=[]}){
 const surfaces=[],barriers=[],climbs=[];if(chapter!==0)return {surfaces,barriers,climbs};
 function floor(id,x,z,w,l,h=0,end=h,speed=1){
  const p={id,x,z,w,l,h,end,speed};surfaces.push(p);
  const material=texturedMaterial(id==='market'?0xc5ac8a:id==='skywalk'?0x7f8c82:0xb78264,'roof');
  const geo=new THREE.BufferGeometry();
  const x0=x-w/2,x1=x+w/2,z0=z-l/2,z1=z+l/2;
  geo.setAttribute('position',new THREE.Float32BufferAttribute([x0,h,z0,x1,end,z1,x1,h,z0,x0,h,z0,x0,end,z1,x1,end,z1],3));geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,1,1,0,0,0,0,1,1,1],2));geo.computeVertexNormals();
  const slab=new THREE.Mesh(geo,material);slab.material.side=THREE.DoubleSide;slab.receiveShadow=true;slab.name='RouteSurface_'+id;world.add(slab);
  // Thin beams give ramps a visible underside without obstructing traversal.
  for(const side of [-1,1])line(world,[x+side*w*.48,h-.12,z0],[x+side*w*.48,end-.12,z1],0x5b655d,.07);
  return p;
 }
 function rail(x,z,length,y){
  for(let zz=z-length/2;zz<=z+length/2;zz+=3){block(world,x,y+.45,zz,.07,.9,.07,0x4e5b57);}
  block(world,x,y+.9,z,.07,.06,length,0x4e5b57);
 }
 function sign(text,x,y,z){
  const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#263f3d';ctx.fillRect(0,0,512,96);ctx.fillStyle='#f4d3a2';ctx.font='bold 32px Arial';ctx.textAlign='center';ctx.fillText(text,256,60);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const o=new THREE.Mesh(new THREE.PlaneGeometry(4.4,.83),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));o.position.set(x,y,z);o.rotation.y=Math.PI;world.add(o);
 }
 // A grounded street datum and neighborhood facades make the routes read as one place.
 block(world,0,-7.2,85,90,.45,220,texturedMaterial(0x8a8272,'facade'));
 for(let i=0;i<12;i++){
   const z=8+i*12,h=6+(i%3)*1.2,x=-23;
   cameraSolids.push({x,y:-2+h/2-4,z,w:7,h:h+8,d:9});
   block(world,x,-2+h/2-4,z,7,h+8,9,texturedMaterial([0xcbb298,0xb58b70,0xd2b08a][i%3],'facade'));
   block(world,x,h-2,z,7.5,.22,9.5,texturedMaterial(i%2?0x986349:0xb87754,'roof'));
   for(const yy of [-.5,2])for(const zz of [-2,2]){
     block(world,-19.45,yy,z+zz,.06,1.45,.85,0x34554f);
     block(world,-19.2,yy-.75,z+zz,.55,.12,1.3,0xd6c4a5);
   }
   block(world,-19.2,-1.9,z,1.1,.18,3.5,0xbca887);
 }
 // Lower market arcade: continuous forgiving ground, longer and deliberately slower.
 floor('market-entry',-7,0,14,12,0,-2,.83);
 floor('market',-12,31,5.5,50,-2,-2,.83);
 floor('market',-15,72,11.5,32,-2,-2,.83);
 floor('market',-12,114,5.5,52,-2,-2,.83);
 floor('market-exit',-7,148,14,16,-2,0,.83);
 floor('market-landing',-5,161,12,10,0,0,.83);
 rail(-15,31,48,-2);rail(-15,114,50,-2);
 // Market square: connected courtyard with open stalls, linen awnings and a fountain.
 for(const z of [62,72,82])for(const x of [-19,-10]){
  for(const side of [-1,1])block(world,x+side*1.25,-.3,z,.075,3.3,.075,0x605141);
  for(let i=0;i<6;i++)block(world,x-1.25+i*.5,1.3,z,.49,.07,2.7,i%2?0xe6c48e:0xa74b39);
  block(world,x,-1.1,z,2.5,.8,.8,0x8b6548);
  for(let j=0;j<5;j++)ball(world,x-.9+j*.45,-.62,z,.17,.16,.17,j%2?0xb5a34e:0xa85938);
 }
 const fountain=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.7,.4,24),new THREE.MeshStandardMaterial({color:0xc1ac8c,roughness:.9}));fountain.position.set(-15,-1.8,72);world.add(fountain);
 const water=new THREE.Mesh(new THREE.CircleGeometry(1.4,24),new THREE.MeshStandardMaterial({color:0x527f81,roughness:.2,metalness:.2}));water.rotation.x=-Math.PI/2;water.position.set(-15,-1.58,72);world.add(water);
 // Advanced narrow scaffold: three intentional gaps, a vault barrier and a climb.
 floor('skywalk-entry',7,26,12,8,0,0,1);
 floor('skywalk',11,45,2,30,0,0,1.12);
 floor('skywalk',11,74,1.65,20,0,0,1.12);
 floor('skywalk',11,95,1.65,16,0,0,1.12);
 floor('skywalk',11,124,2.0,32,1.4,1.4,1.12);
 floor('skywalk-exit',7,148,12,16,1.4,0,1.05);
 // Ledge can only be mounted with a deliberate contextual jump at its pipe ladder.
 climbs.push({x:11,z:108,w:2.3,from:0,to:1.4});
 for(let z=32;z<141;z+=5){
  block(world,12.1,-2.1,z,.10,7,.10,0x59645e);
  line(world,[10,-3.8,z],[12.1,1.3,z+4],0x59645e,.035);
 }
 for(let i=0;i<7;i++)block(world,11,i*.22,107.9,1.65,.06,.12,0xb99763);
 block(world,11,.43,75,1.65,.86,.55,0xb28d63);barriers.push({kind:'barrier',x:11,z:75,w:1.65,d:.55,base:0,hit:0});
 sign('MARKET ↓  /  SAFE PASSAGE',-7,2,-3);
 sign('SKYWALK ↑  /  EXPERT',7,2.1,23);
 sign('BELL TOWER →',-15,.2,82);
 sign('CLIMB ↑',11,2.5,109);
 return {surfaces,barriers,climbs};
}
export function surfaceHeight(surface,z){return (surface.h||0)+((surface.end??surface.h??0)-(surface.h||0))*Math.max(0,Math.min(1,(z-(surface.z-surface.l/2))/surface.l));}
export function findSurface(surfaces,x,z,feet=Infinity){
 let found=null,height=-Infinity;
 for(const p of surfaces){if(Math.abs(x-p.x)>=p.w/2-.15||Math.abs(z-p.z)>=p.l/2-.12)continue;
  const y=surfaceHeight(p,z);if(y<=feet+.38&&y>height){found=p;height=y;}
 }
 return found?{surface:found,height}:null;
}
