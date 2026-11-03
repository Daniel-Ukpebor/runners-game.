# RUNNERS — The Midnight Circuit (Build 0.5)

A **playable mobile-friendly 3D parkour story game** in the fictional coastal city of **Vesper**, with three linked rooftop races and permanent local progress. This is an evolving vertical slice—not an App Store/native iOS release or a finished commercial game.

**Play:** https://daniel-ukpebor.github.io/runners-game./


## Build 0.5: the polish-and-movement pass

This release prioritizes the **first 30 seconds** of play over adding more repetitive levels.

- **Moving 3D story intro every time you tap Race.** The first play runs the full childhood-to-present prologue; repeat races show a short recap. Intro shots auto-advance and can be skipped. The cutscenes use actual game actors and the selected district, not a separate illustrated slideshow.
- **New TRICK action** during a jump: perform an aerial roll. Style points are banked only when you land cleanly. A fall or collision loses pending trick points.
- **Speed vaults**: press JUMP while approaching a crate or low wall at running speed to vault it and earn style points.
- **Clean slide bonuses** for ducking under beams, plus a limited flow combo multiplier. Style points convert to extra local in-game route credits at the finish.
- **Smoother low-poly character**: capsule-shaped limbs, finer mesh tessellation, rounded pack, adjusted lighting and soft projected ground shadow.
- **Customization**: keep the existing build/skin/hair/jacket options, add a backpack/no-backpack gear toggle, and reflect your customized Kai in cinematic shots.
- The existing three district tracks, time-trial shadows, upgrade purchases and locally saved chapter unlocks remain intact.

These are **original procedural assets** and short stylized real-time cutscenes. They do not yet match the detailed concept illustration, offer professional motion-captured animations, or create video files. Screen recording a run is available using your device's recording controls.

## Build 0.5 / player-facing improvements

- **Full-screen character studio** with an enlarged rotating 3D preview, masculine and feminine proportions (removed the androgynous option), six hair shapes, five hair colors, six skin tones, five jackets, bag/no-bag, and eyewear/headband choices. These are procedural models, not imported professional character rigs.
- **Swipeable menu**: Home, Districts, Workshop, Loadout. Horizontal touch swipes and keyboard arrow keys switch menu pages; Back returns from the character studio.
- **Three rival leagues**: Street, Pro and Elite. Higher league speeds reward higher race-credit payouts. You must beat a rival to unlock the next district; finishing still earns credits.
- **Future map previews**: Harbor Run, Old Rail, Northlight are visible but locked and marked **in development**. No unbuilt level is represented as playable.
- **Keyboard R instantly restarts** a race on desktop, while Space jumps/vaults, C slides, K performs an aerial stunt, and M toggles sound.
- **More tactile city**: glowing optional speed strips and birds that react to runners, plus procedural plaster texture and rooftop tile detail.
- **More animated characters**: faces on Kai and all three rivals, smoother limbs, softer contact shadows, vault knee-tucks, landing compression and several mid-air trick motions.
- **In-engine cutscene** still starts each race with the first childhood intro or a shortened replay.
- No ads or trackers. Current progress remains stored locally in the browser; changing to a different domain (such as Vercel) does not automatically transfer localStorage saves.

### What it still is not

The semi-realistic, high-fidelity character and environment shown in the concept board require a licensed rigged 3D character model, professional animation set, authored architectural assets, animation blending and performance tuning. This is an improved mobile-web vertical slice, **not** a AAA or high-end commercial visual release.

### Publishing on Vercel

RUNNERS already runs on GitHub Pages. To use Vercel, import the existing GitHub repo, select Framework Preset **Other**, leave Build Command blank, and deploy from the repository root. The project does not have a build step, and its static files live at root. The Vercel project/account must be connected separately; no deployment is implied by this repository alone.

## Chapters and story

Kai and Riven spent their childhood racing across Vesper's rooftops. When the city opens its Midnight Circuit qualifiers, the old rivalry pulls Kai back onto the roofs. A short illustrated flashback plays when you first start Chapter 1; story sequences introduce the later rivals.

| Chapter | District | Rival | Route |
| --- | --- | --- | --- |
| 01 | The Steps | Riven | Original Rooftop Trial |
| 02 | The Marketline | Sable | A longer market district with tighter bends |
| 03 | The Nightline | Vale | Longest route, with nighttime lighting and harder obstacles |

Finishing a chapter unlocks the next. You can replay the illustrated story from the main menu.

## Gameplay

- Left virtual joystick to move. Hold forward to run; swipe it left/right to strafe (**not reversed**). Also supports WASD/arrows.
- **JUMP** (or Space) for rooftop gaps, crates and low walls.
- **SLIDE** (or C) to duck full-width low beams.
- Missing a landing returns you to the latest checkpoint with a 2.5-second penalty. Bumping an obstacle adds 0.65 seconds.
- Five optional signal pickups per race earn extra **route credits**.
- A local best-time record per chapter, plus an asynchronous translucent **personal replay shadow** recorded from your completed runs; the HUD shows ahead/behind.
- Spend credits on **Pace** (speed), **Spring** (jump height), and **Grip** (air control) upgrades.
- Customize Kai's body/gender presentation, skin tone, hairstyle, hair color and jacket. Clothing and skills are not restricted by gender selection.
- Riven, Sable and Vale have different outfits and gameplay speeds.

## Audio

Original music is generated with Web Audio oscillators at runtime (no third-party tracks). Interactions include a sound unlock control on the title screen, a music toggle in the race HUD, footsteps, jumps, slides, collectibles, impacts, and race-completion tones. iOS requires a user tap before audio can start. Silent mode or in-app browser behavior may affect playback. Open directly in Safari for the best chance of audio and landscape controls.

## Data and privacy

No ads, login, telemetry or third-party tracking. Your cosmetics, unlocked chapters, upgrades, wallet, replay samples and best times are stored **locally in the same browser installation** via `localStorage`—clearing Safari website data can erase progress. An older RUNNERS best time is imported if present, though old builds did not save movement samples, so your first new race creates the first available shadow.

## Development / limitations

- Static site with native JavaScript modules, Three.js, CSS and Web Audio; internet is required to load Three.js from a public CDN.
- No native iOS runtime, App Store binary or online multiplayer.
- Procedural low-poly characters and short animated illustrated cutscenes, not full professional character rigs or voice-acted cinematics.
- Performance optimizations include InstancedMesh batching and fixed-step 60 Hz simulation. Actual iPhone frame rate is hardware dependent and not guaranteed.
- Browser tests in `.github/workflows/smoke.yml` verify rendering, start/menu flow, story, movement direction, first rooftop jump, customization, rewards, shadow recording, upgrade purchase and chapter unlocking.

To install as a web app, open the site **directly in Safari** and choose Share → Add to Home Screen, if your phone has sufficient storage.

## Next improvements

Better character modeling and animation, authored cutscenes, refined music/SFX, more parkour mechanics (vaults, wall-runs), richer district art, and device performance profiling.
