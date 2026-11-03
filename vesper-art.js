// RUNNERS visual pass / Vesper art direction.
// Authored route landmarks, batched for low draw-call cost on mobile.
export function buildVesperLandmarks({THREE,world,route,chapter=0}) {
  const groups=new Map(), cube=new THREE.BoxGeometry(1,1,1), cyl=new THREE.CylinderGeometry(1,1,1,10);
  const materials=new Map(), artworks=[], particles=[];
  const c=(value)=>{if(!materials.has(value))materials.set(value,new THREE.MeshStandardMaterial({color:value,roughness:.91,metalness:.02}));return materials.get(value)};
  const point=(x,y,z,sx=1,sy=1,sz=1,rot=0)=>{
    const o=new THREE.Object3D();o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.z=rot;o.updateMatrix();return o.matrix.clone();
  };
  function add(x,y,z,w,h,d,color,rot=0,geo=cube) {
    const key=geo.uuid+'/'+color; if(!groups.has(key))groups.set(key,{geo,mat:c(color),items:[]});
    groups.get(key).items.push(point(x,y,z,w,h,d,rot));
  }
  function pole(x,y,z,r,h,color){add(x,y,z,r,h,r,color,0,cyl)}
  const p=i=>route[Math.min(Math.max(i,0),route.length-1)]||{x:0,z:0,w:11,l:18};
  const cream=0xe5c6a3,sand=0xb98f76,brick=0x82564f,iron=0x383f42,dark=0x393c3a,gold=0xe5ba7d;
  const copper=0xbd765d,olive=0x56755d,green=0x47624d,blue=0x587c88;
  function sign(text,x,y,z,width=4,height=.75,face=0,bg='#324847'){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
    const ctx=canvas.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);
    ctx.strokeStyle='#edc69a';ctx.lineWidth=8;ctx.strokeRect(8,8,496,112);
    ctx.fillStyle='#f6dfbc';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='bold 64px Georgia,serif';ctx.fillText(text.toUpperCase(),256,67);
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
    const obj=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
    obj.position.set(x,y,z);obj.rotation.y=face===0?Math.PI:face;world.add(obj);artworks.push(obj);
  }
  function addArch(centerX,centerZ,width,stoneColor=cream){
    const rx=width*.5,baseY=3.15;
    for(const dir of [-1,1]) {
      const x=centerX+dir*rx;
      add(x,1.7,centerZ,.7,3.35,.8,stoneColor);
      add(x,.08,centerZ,.95,.32,1.05,brick);
      add(x,3.35,centerZ,1.06,.3,1.1,sand);
    }
    for(let i=0;i<=10;i++){
      const a=Math.PI*i/10,x=centerX+Math.cos(a)*(rx-.17),y=baseY+1.2*Math.sin(a);
      add(x,y,centerZ,.73,.38,.85,i%2?stoneColor:sand,a-Math.PI/2);
    }
    add(centerX,4.64,centerZ,width+.7,.29,1.15,brick);
    add(centerX,4.93,centerZ,width+.9,.18,1.3,cream);
  }
  function lantern(x,y,z){
    pole(x,y-.33,z,.05,.64,iron);
    add(x,y,z,.29,.45,.29,gold);add(x,y+.3,z,.42,.08,.42,iron);
    add(x,y-.3,z,.38,.065,.38,iron);
  }
  function planter(x,z,long=1.2){
    add(x,.34,z,.66,.6,long,0x9e694f);
    add(x,.64,z,.7,.17,long+.08,cream);
    for(let k=0;k<4;k++){
      const zz=z+(k-1.5)*long/4;
      add(x,.85,zz,.36,.48,.28,k%2?green:olive);
      add(x,.97,zz,.15,.34,.17,0x718e64,(k-1.5)*.17);
    }
  }
  function cloth(x,y,z,w,depth,colors){
    add(x,y,z,w,.10,depth,iron);
    const stripe=w/8;
    for(let i=0;i<8;i++){
      add(x-w/2+stripe*(i+.5),y+.10,z,stripe-.015,.065,depth,colors[i%colors.length]);
      add(x-w/2+stripe*(i+.5),y-.25,z+depth/2,stripe-.015,.62,.10,colors[i%colors.length]);
    }
  }
  function stairway(x,y,z,length=4) {
    for(let i=0;i<6;i++)add(x,y+i*.19,z+i*.54,2.0,.27,.6,i%2?cream:sand);
  }
  function sectionPlate(i,color){
    const q=p(i);
    for(const side of [-1,1]){
      add(q.x+side*(q.w/2-.75),.065,q.z-.2,.16,.06,q.l*.56,color);
      for(let j=0;j<5;j++)add(q.x+side*(q.w/2-.75),.09,q.z-3+j*1.5,.4,.035,.17,gold);
    }
  }
  // ACT I - The market gate: a memorable silhouette on the first roof.
  {
    const q=p(1);
    addArch(q.x,q.z-4,q.w-2.1,cream);
    sign('MERCATO',q.x,4.34,q.z-4,3.15,.64,0,'#563d36');
    for(const side of [-1,1]){
      lantern(q.x+side*(q.w/2-.6),2.9,q.z-3.4);
      planter(q.x+side*(q.w/2-1.1),q.z+5);
      cloth(q.x+side*(q.w/2+3),2.5,q.z+1,3.5,3.9,[0xb7644b,0xefc792]);
      stairway(q.x+side*(q.w/2+2.6),-2,q.z+7);
    }
    sectionPlate(1,copper);
  }
  // ACT II - Apartment bridges, blue shutters, market stalls and overhead banners.
  {
    const q=p(2);
    for(let k=0;k<6;k++){
      const z=q.z-7+k*2.4;
      for(const side of [-1,1]){
        add(q.x+side*(q.w/2+4),3.0,z,4.8,.16,1.45,k%2?cream:0xbfa287);
        add(q.x+side*(q.w/2+4),2.3,z,3.7,1.15,.1,k%2?blue:0x8f715b);
        add(q.x+side*(q.w/2+2.9),3.1,z,.32,.25,1.8,iron);
      }
    }
    sign('VESPER',q.x-q.w/2-2.1,4,q.z+4,3.3,.70,Math.PI/2);
    sectionPlate(2,blue);
  }
  // ACT III - Suspended walkway above a working construction section.
  {
    const q=p(4);
    for(const side of [-1,1]){
      const x=q.x+side*(q.w/2+.4);
      for(let k=0;k<5;k++){
        const z=q.z-6+k*3;
        add(x,1.9,z,.11,6.7,.11,iron);
        add(x+side*.75,2.8,z,.10,2.8,.1,iron);
        add(x+side*.38,.7,z,1.15,.1,.26,gold);
      }
      add(x,4.25,q.z, .13,.14,16,iron);
      add(x+side*.84,3.6,q.z,.13,.14,16,iron);
    }
    add(q.x,5,q.z+2,q.w+2,.32,.5,iron);
    for(let k=0;k<9;k++)add(q.x-q.w/2+k*(q.w/8),4.72,q.z+2,.12,.4,.63,k%2?gold:copper);
    sign('WORKS / 04',q.x,5.55,q.z+2,2.9,.65,0,'#33454e');
    sectionPlate(4,0xd6ae64);
  }
  // ACT IV - Rooftop garden. A vine-lined trellis distinguishes this roof from the construction zone.
  {
    const q=p(6);
    for(const side of [-1,1]){
      const x=q.x+side*(q.w/2-.9);
      for(let k=0;k<7;k++){
        const z=q.z-6+k*2;
        planter(x,z,.96);
        add(x,2.1,z,.11,3.2,.13,0x6c5947);
        add(x-side*.30,2.8,z,.42,.17,.65,green);
      }
      add(x,3.35,q.z,.13,.22,14,0x6c5947);
      for(let k=0;k<14;k++){
        const z=q.z-7+k;
        add(x+side*.12,3.05+Math.sin(k)*.13,z,.23,.5,.3,k%2?green:olive);
      }
    }
    sectionPlate(6,olive);
  }
  // The destination needs to stand out in long shots.
  {
    const q=p(route.length-1),z=q.z+6.9;
    for(const side of [-1,1]){
      const x=q.x+side*3.4;
      add(x,2.4,z,.8,4.8,.83,cream);
      for(let k=0;k<4;k++)add(x,1.1+k*.9,z+.47,.9,.11,.11,brick);
      lantern(x,4.25,z-.1);
    }
    add(q.x,4.9,z,7.5,.55,.94,brick);
    add(q.x,5.5,z,8.0,.36,1.2,cream);
    sign('BELLE TORRE',q.x,5.45,z+0.68,4.2,.6,0,'#3a4a4b');
  }
  // Street scenes and architectural rhythm that aren't on the racing line.
  route.forEach((q,i)=>{
    for(const side of [-1,1]){
      if(i%3!==0){
        const x=q.x+side*(q.w/2+5.4);
        cloth(x,-.8,q.z+2,3.4,2.8,[0xb65746,0xe4bb88,0x6b8882]);
        add(x,-3.1,q.z+2,2.8,2.1,.8,0xa58b78);
      }
      if(i%2===0){
        lantern(q.x+side*(q.w/2+.4),3.6,q.z-3);
        for(let n=0;n<3;n++) planter(q.x+side*(q.w/2+2.1),q.z-3+n*2.4,.85);
      }
    }
  });
  // Decorative dust in the warm air; one draw call.
  for(let i=0;i<160;i++){
    const q=p(i%route.length);
    particles.push(q.x+(Math.random()-.5)*26,1+Math.random()*15,q.z+(Math.random()-.5)*17);
  }
  const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(particles,3));
  const glow=new THREE.Points(geom,new THREE.PointsMaterial({color:0xfce0ae,size:.075,transparent:true,opacity:.47,sizeAttenuation:true,depthWrite:false}));
  world.add(glow);
  let nBatches=0;
  for(const item of groups.values()){
    const mesh=new THREE.InstancedMesh(item.geo,item.mat,item.items.length);
    item.items.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));
    mesh.instanceMatrix.needsUpdate=true;
    mesh.frustumCulled=false;
    mesh.name='vesper-art-batch';
    world.add(mesh);nBatches++;
  }
  return {tick:(elapsed)=>{glow.rotation.y=Math.sin(elapsed*.03)*.002},batches:nBatches};
}