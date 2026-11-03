"""Original RUNNERS character. Run: blender -b --python tools/build_kai.py
All geometry, weights, shape keys and clips are authored here; no external assets.
"""
import bpy, math, os
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def v(p): return (p[0],-p[2],p[1])
def material(name,c,rough=.8):
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True
 n=m.node_tree.nodes.get('Principled BSDF');n.inputs['Base Color'].default_value=(*c,1);n.inputs['Roughness'].default_value=rough;return m
skin=material('Skin',(.43,.23,.13));jacket=material('Jacket',(.40,.095,.065));pants=material('Trousers',(.055,.082,.095));shirt=material('Shirt',(.65,.59,.45));rubber=material('Sole',(.72,.66,.54));hairmat=material('Hair',(.025,.021,.019));eye=material('EyeWhite',(.74,.70,.61));iris=material('Iris',(.13,.09,.055));black=material('Pupil',(.009,.012,.014));lip=material('Lips',(.25,.115,.09));packmat=material('Pack',(.055,.09,.09));metal=material('Hardware',(.53,.38,.19),.4)
# Game coordinates: feet=-1, head top=1.65. Forward=+Z.
bones={
 'Hips':((0,.03,0),(0,.40,0),None),
 'Spine':((0,.40,0),(0,.76,0),'Hips'),
 'Chest':((0,.76,0),(0,1.04,0),'Spine'),
 'Neck':((0,1.04,0),(0,1.20,0),'Chest'),
 'Head':((0,1.20,0),(0,1.62,0),'Neck')}
for side,sign in [('L',-1),('R',1)]:
 bones.update({f'UpperArm_{side}':((sign*.34,.96,0),(sign*.43,.51,0),'Chest'),f'Forearm_{side}':((sign*.43,.51,0),(sign*.45,.11,.025),f'UpperArm_{side}'),f'Hand_{side}':((sign*.45,.11,.025),(sign*.45,-.06,.04),f'Forearm_{side}'),f'Thigh_{side}':((sign*.15,.05,0),(sign*.15,-.46,0),'Hips'),f'Shin_{side}':((sign*.15,-.46,0),(sign*.15,-.91,0),f'Thigh_{side}'),f'Foot_{side}':((sign*.15,-.91,0),(sign*.15,-.94,.23),f'Shin_{side}')})
arm=bpy.data.armatures.new('KaiSkeleton');rig=bpy.data.objects.new('KaiRig',arm);bpy.context.collection.objects.link(rig);bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
for name,(a,b,parent) in bones.items():
 bone=arm.edit_bones.new(name);bone.head=v(a);bone.tail=v(b)
 if parent:bone.parent=arm.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT');rig.select_set(False)
def bind(obj,bone):
 group=obj.vertex_groups.new(name=bone);group.add(list(range(len(obj.data.vertices))),1,'REPLACE');mod=obj.modifiers.new('Skeleton','ARMATURE');mod.object=rig;obj.parent=rig
 for f in obj.data.polygons:f.use_smooth=True
 return obj
def surface(name,rings,mat,bone,segments=24):
 # Ring: center XYZ, horizontal radius, depth radius. Authored anatomical cross-sections.
 verts=[];faces=[]
 for x,y,z,rx,rz in rings:
  for i in range(segments):
   a=i*2*math.pi/segments;verts.append(v((x+math.cos(a)*rx,y,z+math.sin(a)*rz)))
 for k in range(len(rings)-1):
  for i in range(segments):a=k*segments+i;b=k*segments+(i+1)%segments;faces.append((a,a+segments,b+segments,b))
 faces.append(tuple(range(segments)));faces.append(tuple((len(rings)-1)*segments+i for i in reversed(range(segments))))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);o.data.materials.append(mat);bind(o,bone)
 return o
def ell(name,pos,scale,mat,bone):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=v(pos));o=bpy.context.object;o.name=name;o.scale=(scale[0],scale[2],scale[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat);return bind(o,bone)
def box(name,pos,scale,mat,bone,bevel=.04):
 bpy.ops.mesh.primitive_cube_add(size=1,location=v(pos));o=bpy.context.object;o.name=name;o.scale=(scale[0],scale[2],scale[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
 mod=o.modifiers.new('Tailored edges','BEVEL');mod.width=bevel;mod.segments=3;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name);return bind(o,bone)
torso=surface('JacketBody',[(0,.12,0,.22,.15),(0,.26,0,.235,.16),(0,.50,0,.22,.155),(0,.75,0,.29,.17),(0,.91,0,.335,.16),(0,1.01,0,.27,.14),(0,1.05,0,.15,.105)],jacket,'Spine')
# Distributed skinning along the spine avoids a rigid tube when twisting.
for vert in torso.data.vertices:
 z=vert.co.z;t=max(0,min(1,(z-.55)/.4));torso.vertex_groups['Spine'].add([vert.index],1-t,'REPLACE')
 if 'Chest' not in torso.vertex_groups:torso.vertex_groups.new(name='Chest')
 torso.vertex_groups['Chest'].add([vert.index],t,'REPLACE')
box('ShirtInset',(0,.72,.168),(.22,.48,.025),shirt,'Chest',.014)
for x in [-.123,.123]:box('Zipper',(x,.72,.19),(.012,.47,.012),metal,'Chest',.005)
box('Waistband',(0,.16,.0),(.45,.105,.30),pants,'Hips')
surface('NeckSkin',[(0,1.01,0,.105,.09),(0,1.18,.01,.09,.085),(0,1.23,.02,.105,.09)],skin,'Neck')
head=surface('Face',[(0,1.16,.045,.055,.065),(0,1.20,.065,.10,.10),(0,1.27,.045,.15,.135),(0,1.36,.022,.166,.15),(0,1.45,.01,.168,.145),(0,1.55,.0,.15,.13),(0,1.62,-.01,.10,.10),(0,1.65,-.01,.025,.025)],skin,'Head',32)
head.shape_key_add(name='Basis')
for name,wide,jaw in [('Round',1.1,1.05),('Defined',.94,.91)]:
 key=head.shape_key_add(name=name)
 for p in key.data:
  p.co.x*=wide if p.co.z>1.29 else jaw
  if name=='Defined' and p.co.z<1.3:p.co.y-=.012
for sign in [-1,1]:
 ell('Ear', (sign*.163,1.365,.005),(.029,.052,.027),skin,'Head')
 ell('EyeWhite',(sign*.071,1.415,.139),(.043,.019,.012),eye,'Head')
 ell('Iris',(sign*.071,1.416,.150),(.013,.014,.008),iris,'Head')
 ell('Pupil',(sign*.071,1.416,.156),(.006,.009,.004),black,'Head')
 ell('Brow',(sign*.071,1.457,.14),(.047,.009,.01),hairmat,'Head')
ell('NoseBridge',(0,1.387,.149),(.021,.047,.022),skin,'Head')
ell('NoseTip',(0,1.352,.174),(.029,.018,.024),skin,'Head')
ell('Mouth',(0,1.286,.156),(.047,.009,.007),lip,'Head')
for side,sign in [('L',-1),('R',1)]:
 surface('UpperArmSkin_'+side,[(sign*.32,.98,0,.10,.105),(sign*.36,.90,0,.119,.115),(sign*.40,.73,0,.105,.10),(sign*.43,.49,0,.09,.09)],skin,'UpperArm_'+side)
 surface('Sleeve_'+side,[(sign*.30,.99,0,.09,.115),(sign*.36,.94,0,.135,.13),(sign*.39,.79,0,.12,.115),(sign*.425,.55,0,.10,.10),(sign*.43,.49,0,.095,.095)],jacket,'UpperArm_'+side)
 surface('Forearm_'+side,[(sign*.43,.55,0,.10,.10),(sign*.44,.44,.005,.105,.095),(sign*.45,.25,.015,.083,.075),(sign*.45,.12,.025,.062,.06)],skin,'Forearm_'+side)
 ell('Elbow_'+side,(sign*.43,.51,0),(.096,.095,.095),skin,'Forearm_'+side)
 ell('Hand_'+side,(sign*.45,.055,.04),(.071,.105,.045),skin,'Hand_'+side)
 ell('Thumb_'+side,(sign*.405,.065,.07),(.025,.055,.025),skin,'Hand_'+side)
 surface('Thigh_'+side,[(sign*.145,.13,0,.143,.15),(sign*.15,-.02,0,.15,.16),(sign*.15,-.20,0,.133,.14),(sign*.15,-.42,0,.103,.105),(sign*.15,-.49,0,.099,.10)],pants,'Thigh_'+side)
 surface('Shin_'+side,[(sign*.15,-.42,0,.10,.105),(sign*.15,-.53,0,.109,.105),(sign*.15,-.69,-.012,.104,.105),(sign*.15,-.88,-.005,.068,.077),(sign*.15,-.94,0,.065,.075)],pants,'Shin_'+side)
 box('Sneaker_'+side,(sign*.15,-.93,.09),(.185,.15,.37),packmat,'Foot_'+side,.055)
 box('Sole_'+side,(sign*.15,-.985,.09),(.19,.045,.38),rubber,'Foot_'+side,.017)
 for j in range(3):box('Lace_'+side,(sign*.15,-.85,.06+j*.035),(.10,.008,.012),rubber,'Foot_'+side,.003)
box('Pack',(0,.64,-.225),(.40,.53,.20),packmat,'Chest',.085)
box('PackPocket',(0,.55,-.34),(.29,.23,.06),jacket,'Chest',.045)
for sign in [-1,1]:box('PackStrap',(sign*.22,.75,.152),(.035,.49,.024),packmat,'Chest',.012)
# Each hairstyle is independent, attached to the actual head bone.
for style in range(6):
 ell('Hair%d_Cap'%style,(0,1.555,-.018),(.177,.105,.151),hairmat,'Head')
 if style in [0,1,3]:
  count=90 if style==3 else 48
  for i in range(count):
   y=1-2*(i+.5)/count;a=i*2.399963;r=math.sqrt(1-y*y)
   if y<-.2:continue
   rad=.23 if style==3 else .17;ry=.22 if style==3 else .10
   ell('Hair%d_Curl'%style,(math.cos(a)*r*rad,1.55+y*ry,-.025+math.sin(a)*r*rad*.9),(.052,.05,.05) if style==3 else (.031,.03,.03),hairmat,'Head')
 else:
  for j in range(10 if style!=2 else 14):
   a=j*2*math.pi/(10 if style!=2 else 14);x=math.cos(a)*.16;z=math.sin(a)*.14-.03
   if z>.07:continue
   for k in range(6):
    y=1.54-k*(.062 if style==4 else .075)
    ell('Hair%d_Strand'%style,(x+.008*math.sin(k+j),y,z-.014*k),(.026 if style==4 else .042,.049,.029 if style==4 else .04),hairmat,'Head')
# Accessories follow the head skeleton and share the same fitting coordinates.
for sign in [-1,1]:
 bpy.ops.mesh.primitive_torus_add(major_radius=.052,minor_radius=.006,major_segments=24,minor_segments=6,location=v((sign*.065,1.415,.165)),rotation=(math.pi/2,0,0))
 o=bpy.context.object;o.name='Accessory1_Frame';o.data.materials.append(packmat);bind(o,'Head')
 box('Accessory1_Arm',(sign*.15,1.415,.09),(.012,.012,.16),packmat,'Head',.004)
 box('Accessory3_Lens',(sign*.066,1.425,.169),(.109,.058,.025),metal,'Head',.017)
box('Accessory1_Bridge',(0,1.415,.165),(.035,.009,.009),packmat,'Head',.003)
box('Accessory3_Bridge',(0,1.425,.17),(.035,.014,.02),packmat,'Head',.005)
surface('Accessory2_Band',[(0,1.515,-.005,.178,.15),(0,1.553,-.005,.174,.15)],jacket,'Head')
# Consolidate compatible pieces to keep mobile skinning and draw calls bounded.
merge_sets={}
for o in list(bpy.context.scene.objects):
 if o.type!='MESH' or o==head:continue
 if o.name.startswith('Hair'):key=o.name[:5]
 elif o.name.startswith('Accessory'):key=o.name[:10]
 elif o.name.startswith('Pack'):key='PackSet'
 elif o.name.startswith('Sleeve'):key='Sleeves'
 else:key=o.data.materials[0].name
 merge_sets.setdefault(key,[]).append(o)
for key,objects in merge_sets.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0]
 bpy.ops.object.join();objects[0].name=key
# Frames are real exported skeletal clips, authored relative to the bind pose.
rig.animation_data_create()
def clip(name,duration,poses):
 action=bpy.data.actions.new(name);rig.animation_data.action=action
 for b in rig.pose.bones:b.rotation_mode='XYZ';b.rotation_euler=(0,0,0);b.location=(0,0,0)
 for t,values in poses:
  for b in rig.pose.bones:
   b.rotation_euler=values.get(b.name,(0,0,0));b.keyframe_insert('rotation_euler',frame=1+t*30,group=b.name)
  hip=rig.pose.bones['Hips'];hip.location=(0,0,.012*math.sin(t/duration*math.pi*2)) if name=='Idle' else (0,0,0);hip.keyframe_insert('location',frame=1+t*30)
 track=rig.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,1,action);rig.animation_data.action=None
clip('Idle',3,[(0,{}),(1.5,{'Chest':(.014,0,.014),'Head':(0,.065,.025),'Forearm_L':(-.10,0,0),'Forearm_R':(-.08,0,0)}),(3,{})])
for name,duration,stride in [('Walk',1,.48),('Run',.62,.86)]:
 frames=[]
 for i in range(5):
  a=i*math.pi/2;values={}
  for side,phase in [('L',a),('R',a+math.pi)]:
   values['Thigh_'+side]=(math.sin(phase)*stride,0,0);values['Shin_'+side]=(-max(0,-math.sin(phase))*1.15,0,0);values['UpperArm_'+side]=(-math.sin(phase)*stride*.75,0,0);values['Forearm_'+side]=(-.45 if name=='Run' else -.18,0,0)
  values['Chest']=(.06,0,math.sin(a)*.045);frames.append((duration*i/4,values))
 clip(name,duration,frames)
for name,pose in {
 'Jump':{'Thigh_L':(-.55,0,0),'Thigh_R':(.4,0,0),'Shin_L':(-.55,0,0),'Shin_R':(-.8,0,0),'UpperArm_L':(-.8,0,-.15),'UpperArm_R':(-.8,0,.15)},
 'Slide':{'Hips':(.65,0,0),'Thigh_L':(1.1,0,0),'Thigh_R':(.8,0,0),'Shin_L':(-1.35,0,0),'Shin_R':(-1.1,0,0),'UpperArm_L':(-.6,0,0),'UpperArm_R':(-.6,0,0)},
 'Vault':{'Thigh_L':(-1.15,0,-.2),'Thigh_R':(.7,0,.2),'Shin_L':(-1.35,0,0),'Shin_R':(-1.0,0,0),'Chest':(.35,0,0),'UpperArm_L':(-1.3,0,0),'UpperArm_R':(-1.0,0,0)},
 'Land':{'Thigh_L':(.55,0,0),'Thigh_R':(.55,0,0),'Shin_L':(-1.0,0,0),'Shin_R':(-1.0,0,0),'Chest':(.25,0,0)},
 'Climb':{'UpperArm_L':(-2.7,0,0),'UpperArm_R':(-2.2,0,0),'Thigh_L':(-1.2,0,0),'Shin_L':(-1.3,0,0),'Thigh_R':(.2,0,0)},
 'Roll':{'Chest':(.7,0,0),'Thigh_L':(-1.2,0,0),'Thigh_R':(-1.2,0,0),'Shin_L':(-1.7,0,0),'Shin_R':(-1.7,0,0),'UpperArm_L':(-1.1,0,0),'UpperArm_R':(-1.1,0,0)}
}.items():clip(name,1,[(0,pose),(1,pose)])
# Reset pose for bind export. NLA strips remain separate exported animations.
for track in rig.animation_data.nla_tracks:track.mute=True
for bone in rig.pose.bones:bone.rotation_euler=(0,0,0);bone.location=(0,0,0)
bpy.context.scene.frame_set(0)
for track in rig.animation_data.nla_tracks:track.mute=False
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'assets/characters/kai.blend'),compress=True)
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'assets/characters/kai.glb'),export_format='GLB',export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_frame_range=False,export_yup=True)
print('KAI EXPORT COMPLETE')
