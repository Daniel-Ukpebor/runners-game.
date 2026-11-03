# Character and studio foundation

This branch is a focused first pass, not completion of the major rebuild brief.

Implemented: rounded ellipsoid-distributed Afro curls, smaller cohesive head assembly, tapered torso and slimmer sleeves, fitted capsule daypack with a single visibility group including straps/pocket, breathing idle, closer main-menu character camera with drag/pitch/wheel controls, touch gameplay camera drag, responsive studio navigation and persistent actions, real viewport aspect resizing, preview pitch/pinch/wheel/keyboard control and saved appearance isolation.

Original procedural geometry only; no new external model, texture, animation or audio was imported. Existing nature asset provenance remains in assets/nature/SOURCES.txt. There is no new GLB humanoid or mocap animation set. The character remains visibly procedural. Existing save keys and physics/progression systems are retained.

Validation: existing browser smoke suite plus tests/studio.cjs. Chromium uses software WebGL here; this does not establish actual iPhone frame rates. Screenshots are browser captures, not concept renders. No supplied screenshot attachments were available. The website reference returned a proxy policy denial and was not inspected.

Still required for the full brief: authored weighted character asset and animation clips; richer facial controls and garment sets; menu movement preview; camera collision and sensitivity settings; authored three-route district; cinematic art and animation improvements; actual mobile hardware performance validation. Do not merge as completion of those requirements.

Local run: python3 -m http.server 8765 from the checkout. No build step. Three.js is loaded from cdn.jsdelivr.net. Tests require playwright-core and Chromium; tests/studio.cjs accepts CHROME_PATH. Existing tests/smoke.cjs assumes /usr/bin/google-chrome; substitute /usr/bin/chromium in a temporary copy on this cloud image.
