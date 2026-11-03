# Original RUNNERS character assets

`kai.glb`, `kai.blend`, and `../../tools/build_kai.py` were created for RUNNERS in this rebuild. Geometry, facial shape keys, skeleton weights, clothing, accessories, six hairstyle meshes and nine skeletal clips are original. No game models, Mixamo files, stock textures or third-party motion capture were used.

The new character assets and their generation script are dedicated to the public domain under CC0 1.0: https://creativecommons.org/publicdomain/zero/1.0/. This dedication applies only to these newly created assets and generation script, not the rest of the repository or its existing assets. Commercial use is permitted; attribution is appreciated but not required.

Rebuild with Blender 4.3+: `blender -b --python tools/build_kai.py` from the repository root. Blender exports the weighted rig, morph targets and separate NLA animation tracks to glTF 2.0 with Y up. The compressed `.blend` is editable source. The runtime uses GLTFLoader, SkeletonUtils.clone and AnimationMixer with cross-fades. The clips are hand-authored, not mocap.

Runtime materials named Skin, Jacket, Hair, Iris and Trousers are recolored from the existing saved appearance. Face morphs implement Round and Defined presets. Hair0–Hair5 and Accessory1–Accessory3 are independent weighted attachments; PackSet hides together with its straps and pocket. Sleeves can be hidden for a sleeveless layer. Physique and body choices scale skeleton/asset proportions and are unrestricted by hairstyle or outfit.

Limitations: stylized authored geometry with simple facial detail, no facial expression rig or cloth simulation, and simplified hand anatomy. This is an original indie asset, not a scan or production AAA model. GLB is approximately 5 MB, with no external textures, decoders, or animation services.
