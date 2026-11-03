# RUNNERS — visual reboot brief for Codex

## Product / direction

RUNNERS is a third-person 3D parkour action game, Chapter One set in **Vesper / The Steps**, starring customizable Kai and rival Riven. It currently ships as a Three.js static browser game on GitHub Pages, with chapters, race timing, saved best-run ghosts, upgrades, story cutscenes and controls. The intent is a playable iPhone and laptop build, offline account-free where practical. Keep the published demo working. Do **not** overwrite player saves or remove existing chapters.

**Visual target:** expressive and athletic stylized-realism, warm coastal stone architecture, distinctive rooftops, high-quality cinematic lighting. Do not use procedural box-based characters as the final model. If needed, introduce a documented commercially usable rigged GLB, tested animation clips and a Blender source workflow. Aim for an art-directed indie vertical slice, not an unsubstantiated “AAA” claim.

## Immediate visible defects from actual player testing

1. Desktop builds previously displayed virtual joysticks and giant Jump/Slide/Trick buttons. Fine-pointer + hover desktops must use keyboard + mouse and a compact controls legend; coarse-pointer touch devices use touch controls only.
2. HUD timer/best/signals overlapped the sound and pause buttons, while style points floated awkwardly. Validate collision-free rectangles at 390×844, 844×390, 1366×768, and 1440×900. Keep counters legible, especially mid-race.
3. Loadout preview rotated automatically but could not be grabbed and rotated; implement drag/zoom and let players select visible face shape, eyes, physique, hairstyles, clothing and skin appearance. Save locally. The procedural face is still simple and needs an imported high-quality rigged replacement.
4. City feels like a linear roof corridor. Build one **dense, connected neighborhood** as a contained, believable level with at least three connected routes (fast risky rooftops, safe market stairs, hidden climbing / interior path). Include a distinctive market, construction skywalk, garden, bell tower and meaningful environmental storytelling. Do not add a giant empty open world.
5. Collected Signals previously only displayed a count. Current patch converts each signal into a consumable speed Pulse (Q desktop, pulse button touch) as well as finish rewards. Keep this ability useful and balance it against rival difficulty.
6. Camera should orbit with mouse drag and respond smoothly; desktop mouse movements should not turn WASD directions into unintuitive movement. Future revision can adopt camera-relative traversal with optional pointer lock and adjustable sensitivity.
7. Menu text was heavy and page-like. Show one hero scene, chapter title, rival, best, ghost, and Play. Relegate detailed stats and upgrades to tabs. Avoid bland glassmorphism, floating rounded cards, excess icons and AI-style filler prose.

## Recommended staged implementation

**A — Stability + control QA:** Keep current GitHub Pages build functioning; run headless Playwright across mobile and desktop; assert no overlapping HUD, mouse look, touch button isolation, loadout persistence and signal pulse. Detect slow devices and lower resolution.

**B — Character-quality milestone:** Create/import 1 commercially clear humanoid GLB with expressive topology, weighted skeleton, face shapes, 2–3 hairstyles, distinct body presets and layered clothing. Add animation blends for idle, jog, sprint, jump takeoff/landing, slide, vault, wall touch/climb, stumble and aerial tricks. Favor a coherent rig and smooth transitions over many mediocre motions. Verify model file provenance; do not scrape copyrighted game assets.

**C — Neighborhood slice:** Rework The Steps into a visually memorable 3-route 150–350m slice with branching paths, obstacles that force route choice, interactive signage, ambient life and varied elevations. Test camera collision, fall reset, checkpoints, performance and whether goals are readable without text.

**D — UI + flow:** Responsive layouts by input mode; short skip-able opening cutscene; Play, Loadout, Race, Pause and Results with seamless state transitions. Track personal best shadow reliably. Create a standalone video capture / replay viewpoint if recording highlights is desirable.

**E — Browser launch:** After QA, publish static asset build to Vercel only when the account or GitHub import is authorized. Maintain GitHub Pages until verified. Document local save transfer limitations.

## Hard acceptance criteria

- Desktop 1366×768 screenshot: no joystick or touch action buttons; music, pause, timer, style points never overlap. WASD, mouse orbit and R restart functional.
- iPhone landscape and portrait: touch buttons stay within safe areas and do not overlap HUD; mobile camera touch input does not scroll the browser; 30 FPS target fallback on an actual device.
- Dragging the loadout model rotates it; cosmetics visibly change both menu preview and in-game Kai. All settings persist across refresh.
- A signal pickup increases Pulse charge, using it consumes one charge and increases speed. Unused signals retain finish-value.
- Three distinct traversable paths through a coherent district, not just three swappable linear levels.
- WebGL load errors, asset loading failures, regressions, and absence of saved data are handled gracefully.
- Every change reviewed using *actual screenshots* and playable test, not merely a successful CI build.
- Do not describe the game as AAA or 7/10 until the person playing it independently agrees.

## Code orientation

- `game.js`: Three.js world, character geometry, physics, HUD events, controls and frame loop
- `systems.js`: saves, chapters, ghost recordings, cutscene/story state, menus, loadout preview, rewards
- `cinematic.js`: in-world story camera
- `vesper-art.js`: authored architectural landmarks
- `environment-assets.js`: commercially usable nature GLBs
- `visual-reset.css`, `input-hud.css`: most recent UI layouts
- `tests/smoke.cjs`: GitHub Actions browser regression suite
- `assets/nature/SOURCES.txt`: attribution/provenance

Keep changes in focused commits / PRs. Preserve the `main` deploy unless the new branch has passing tests and peer-reviewed screenshots.