# RUNNERS 0.7 — playable character and district rebuild

## Delivered

- Original weighted humanoid GLB with editable Blender source and deterministic generator. The runtime loads it through GLTFLoader, clones skeletons correctly for the studio, rivals, cinematic doubles and replay ghosts, and cross-fades nine AnimationMixer clips. This replaces the visible legacy mannequin after loading; the old geometry remains as a load-failure fallback.
- Authored tapered anatomy, a shaped face with two facial morphs, eyes/iris controls, six separately fitted hairstyles, fitted daypack with straps/pocket, glasses, headband and goggles. Body/physique choices affect the mesh/skeleton. All hairstyles and clothing work with either body choice. Existing appearance storage is extended with outfit selection.
- The loadout has five category links, a full-body viewport that resizes to its actual container, mouse/touch pitch and orbit, wheel/pinch zoom, keyboard camera input, and a separate persistent Back/Play footer. The closest zoom is bounded to preserve full-body framing.
- The main menu frames the actual runner. Empty-space drag/wheel controls orbit and zoom, while a toggle permits a short safe walk/jog preview using desktop or touch movement. Character loading displays actual transferred-byte progress without an artificial delay.
- Camera-relative movement, mouse sensitivity, optional follow/recenter and optional speed FOV are saved separately. Touch look stays on the canvas, away from action buttons/joystick. Camera segments are checked against building bounds to retract before walls.
- The Steps has three connected traversal options: original fast rooftop gaps; a slower lower market arcade with descending/ascending ramps, a square and stalls; and an exposed scaffold lane with narrow platforms, real gaps, a vault obstacle and a contextual pipe climb. They rejoin the original race. Lower/upper surface heights participate in physics rather than decorating an unreachable city.
- Original filtered coastal wind audio, character shadows, route signage, street datum, additional facades and market props. Rendering reduces resolution under sustained low FPS and drops shadows when necessary. No FPS claim is made for physical phones.
- Existing chapters, rival difficulty/rewards, best times, saved trajectories, upgrade keys, stunt scoring and consumable Signal Pulse remain. Ghosts follow their recorded positions with the same skeletal character appearance.
- Static Vercel settings and deployment exclusions; no paid services, accounts or runtime secrets are needed to play.

## Validation

- `tests/smoke.cjs`: existing game render/start/story/movement/jump/trick/vault/progression/upgrade/ghost/camera/Pulse suite.
- `tests/studio.cjs`: 1366×768, 1440×900, 844×390 and 390×844; reachable footer, option/action separation, orbit/keyboard isolation, actual touch pinch, persistence isolation, and pairwise HUD rectangle checks with all six readouts visible.
- `tests/rebuild.cjs`: GLB skeleton and all nine clips; actual hair, pack, sleeve and morph state; appearance persistence; safe menu movement; lower path traversal and both ramps; camera-wall retraction; scaffold gap traversal, vault, contextual climb, elevated ground and missed-gap fall/reset.
- All JavaScript is syntax-checked; `git diff --check` checks whitespace. Blender generation/export completed successfully. Screenshots are actual Chromium captures. Browser software WebGL is not evidence of physical-device FPS.

## Assets and limits

The new character geometry and animation are original CC0 assets; see [provenance](../../assets/characters/SOURCES.md). No external humanoid, commercial game asset, Mixamo animation, scraped reference code or copyrighted soundtrack is included. Existing nature assets retain their provenance.

This remains a stylized indie character with simple hands and facial detail, hand-authored animation instead of motion capture, and no cloth/facial-expression simulation. The first district is a contained route slice; it is not a large open world. Clothing sets share a base mesh. Physics uses rectangular/ramped traversal surfaces and building bounds rather than a general triangle-mesh controller. Actual iPhone/Safari hardware profiling is still required. The screenshot attachments described in the brief were not supplied. The website reference was denied by network policy and was not inspected.

## Hosting status

The static game is runnable locally and the rebuild is committed on its working branch. No production Vercel deployment is claimed. API requests to `api.github.com` and `api.vercel.com` currently receive proxy CONNECT denials; the required destinations have been saved in the environment configuration draft. There is no linked Vercel project/account binding in this workspace. Git HTTPS access works independently of those API restrictions. Preserve `main` until review; do not describe a branch push as a deployment.
