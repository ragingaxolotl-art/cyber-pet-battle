# Combat tools upgrade — November 5, 2026

## Location and scope
Active work is in `/Volumes/Cyber Pet Combat`. The 200 GiB APFS sparsebundle lives at `/Volumes/Extreme SSD/CCP-V3/Cyber Pet Combat Workspace.sparsebundle`. The original 300 GiB workspace and recovery copies are untouched. No real student data was copied or modified.

Run `Start Combat Tools.command` at the volume root, or `python3 serve_combat.py` from attack-studio-project. The shared local preview is http://127.0.0.1:8786/. Only the apps, example attack, and approved reference assets are served. Directory listings, source checkout roots and Git data are excluded. This release is local and has not been published.

## Implemented
- Contact resolution snapshots both fighters before applying damage/interruption, allowing ordinary same-frame trades and double knockouts.
- Cast frame zero resolves on the first tick after input. Zero-startup one-frame attacks now work.
- Blockable pushes honor guard, authored block percentage is respected, and shield refresh keeps the larger remaining shield.
- Version 2 projectile sequences use independent IDs, per-hit damage, contact-relative offsets/windows, target restrictions and reactions. Attached pulses follow the first unblocked target; contact-only mode requires geometry for every pulse. Block/dodge cancels first-contact attachment. Ten events maximum, 300-frame bound, 30-frame individual suspension limit, and forced release at the airborne-hit threshold.
- Shared sequence reactions and scheduling are used in Studio and Arena. Existing version 1 definitions remain readable and unchanged; unsupported versions fail validation.
- Studio provides a selected-hit inspector, timeline hit selectors, five-hit generator, Quick Edit preview/apply, undo/redo, local recovery, visible hit-by-hit results, built-in/saved scenarios, Basic/Advanced controls and library tabs.
- Adding VFX no longer changes the element. New linked reskin families are an explicit action; existing families still synchronize.
- Loadouts preserve unsaved drafts across set changes, closing and reload. Added search/filter, attack previews, test action, duplicate set, clear/swap keys, undo edits/deletion, and explicit auto-equip placement messages.
- Arena provides Play/Moves/My pet entry points, visible training state, direct set selection, fullscreen key cards, readiness messages, actual collision shapes, frame advance, slow playback, separate configurable defense keys, and clearer browser-only storage information.
- Animation assignments explicitly explain their persistence boundary.

## Five-hit walkthrough
1. Open Studio. Open `examples/electrical-barrage-v2.json`, or create a five-hit sequence in the Hit sequence panel.
2. Test it. The default sequence connects at contact + 0, 5, 10, 15, 20 and deals 6 + 3 + 3 + 4 + 12 = 28 damage, before guard/resistance/shields.
3. Select individual hit markers to edit damage, reaction, timing, or target eligibility. Quick Edit preserves retained hit values and the finisher; review its preview before applying.
4. Download backup. In Arena choose Open attack design, then Skill trees to learn it, then Attack loadouts to assign or test it. Practice has demonstration skill points. A real pet needs its reviewed release-power artwork.
5. Select Training. The Test this move action temporarily uses Q without altering a loadout draft; Restart restores normal sets.

## Behavior contract and compatibility
Version 2 currently supports damage projectiles, contact-relative timing, and a single target per cast. Event damage is explicitly authored, without stat damage scaling; training still affects cost and startup/recovery. Reactions are launch, suspend, relaunch, spike, knockback or damage-only. Follow-ups end when the cast is interrupted or the target is defeated. There is no persistent independent projectile entity yet.

Legacy authored flight-axis/duration choreography, special wall/floor settings and some status details still differ between the old preview and Arena. The editor reports this limitation. The new parity tests cover the version 2 milestone and identified reliability defects, not a claim of universal old-attack parity.

Version 2 project downloads are rejected by old version-1-only Studio clients. Classroom-bank and skill-tree publication of version 2 attacks is held until those deployed clients support the format; portable project import works in this workspace's Arena. Local account calls remain subject to the existing hosted-origin policy. Legacy bank access and data are preserved.

Deferred: draggable multitrack timeline, arbitrary multiple hitboxes, advanced clashing/priority, armor, cancels, reflection/absorption, general conditional branches, cloud progression sync, online multiplayer and deployment. The hit list/timeline selectors establish the first authoring milestone.

## Verification
Both existing suites were run before changes (40 Arena / 1,087 Studio). Added combat and DOM/Canvas test-double coverage includes the complete import/learn/equip/test flow, both facing directions and several contact distances, 28-damage five-hit parity, cancellation, draft recovery and undo.

Browser control is disabled in Work settings. DOM/Canvas harnesses are interaction logic tests, not browser screenshots, layout validation, keyboard-device usability, or classroom hardware performance measurements. Check those before publishing this local release.

Use `tools/node/bin/node --test tests/*.test.mjs` with the full runtime path from each app directory. Studio asset checks: `python3 tests/library_test.py`. The copied asset provenance files and workspace copy manifest retain original paths and hashes.

Final verification: **58 Arena tests and 1,089 Studio tests passed**, with zero failures. All 1,152 effect references exist. All 25,458 original source files match the pre-copy hashes. Shared sequence modules match byte-for-byte. Local delivery returned HTTP 200; path escape and Git-file requests returned HTTP 404.
