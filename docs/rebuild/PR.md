# Rebuild Kai with an original skeletal asset and connect three Vesper routes

RUNNERS previously used a procedural mannequin and a rooftop corridor. The rebuild loads an original weighted GLB with nine hand-authored animation clips, fitted hair/clothing/accessories and mesh-changing customization. The Steps now connects the original rooftop race to a slower lower market route and an exposed scaffold path with actual gaps, vaulting and pipe climbing.

The studio supports real mouse/touch orbit, pitch, pinch/wheel zoom and keyboard controls with fixed action/navigation regions. The game adds camera-relative movement, persisted camera settings, building collision, safe menu movement, character shadows, original wind ambience, adaptive rendering and skeletal replay ghosts. Existing progression/save keys remain intact.

Validation: full existing browser smoke suite; responsive studio/HUD and actual pinch checks at 1366×768, 1440×900, 844×390 and 390×844; functional traversal tests covering market ramps, scaffold gaps, vaults, climb, fall/reset, camera-wall retraction, safe preview and actual rig appearance persistence. JavaScript syntax, GLB container/skin/animation structure and whitespace checks passed. Actual hardware Safari performance is unverified.

Screenshots are committed in docs/rebuild/: menu-desktop.png, loadout-desktop.png, loadout-portrait.png, cinematic-desktop.png, gameplay-desktop.png, market-route.png, scaffold-route.png and hud-portrait.png.

Assets: original CC0 character GLB, compressed Blender source and deterministic build script. No third-party humanoid, mocap, paid assets or scraped reference source. Existing nature assets retain their original provenance. See assets/characters/SOURCES.md.

Limitations: simplified hands/facial detail, hand-authored motion instead of mocap, shared base garments, surface-based physics and hardware-dependent rendering. This is an indie slice, not a AAA release. Three.js still loads from jsDelivr. Vercel static configuration is included, but an authorized project connection and reachable deployment API are required; no deployment is claimed. Existing GitHub Pages and Vercel origins do not automatically share local saves.
