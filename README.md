# RUNNERS — The Steps

Playable **RUNNERS 2.0** web prototype of Chapter One, set in a fictional coastal city called Vesper.

**Play:** https://daniel-ukpebor.github.io/runners-game./

## What's here
- Handcrafted rooftop parkour route with changing roof layouts and visible skyline
- Stylized animated Kai with selectable skin tones, jacket colors and hairstyles
- Jump, slide, sprint, obstacles, forgiving checkpoints, a timer, best times, and five collectibles
- Portrait-friendly controls; **landscape recommended** on iPhone
- Touch controls and WASD / Space / C for keyboard
- Static-geometry GPU batching to reduce draw calls; no ads, analytics or account needed

## How to play
Open the published Pages URL directly in Safari. Rotate to landscape for a wider view. Hold the left stick up to run, right and left to strafe, **JUMP** to cross the gaps, and **SLIDE** to duck beams. Finish at the bell-tower gateway. To add to the Home Screen, use Safari → Share → Add to Home Screen (requires some available iPhone storage).

## Technical
- Static HTML/CSS/JavaScript plus [Three.js](https://threejs.org/) loaded from jsDelivr at runtime (internet required).
- GitHub Pages serves files from the root of `main`.
- Designed as an **early vertical slice**, not an App Store/native iOS build or a production game.
- No external texture assets. Environment, character and animation are procedural in `game.js`.
- Real-world iPhone performance, responsive controls, and collisions still need device testing.

## Next milestone
Real character rigs and animations, refined level art and traversal physics, camera smoothing, music/audio, story sequences and expanded customization.