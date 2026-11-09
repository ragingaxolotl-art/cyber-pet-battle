# Combat tools upgrade — November 5, 2026

## Current status — November 9, 2026 (reconciled through verified hurtboxes26 release)

This overview supersedes the historical entries below. The overall goal is **not complete**; historical deferrals do not remove requirements.

| Capability | Verified current implementation | Remaining work |
| --- | --- | --- |
| Arena controls | Nine slots including C beside X; mobile movement/block/dodge; input cleanup across focus loss, menus and restart | Physical multitouch and broader keyboard/accessibility playtesting |
| Independent hits | Contact-relative projectile sequences; cast-relative melee/area sequences; per-hit damage/reactions, attached/repeated contact and common juggle budget | Expanded event behaviors; neutral air recovery and bounded wall/floor bounces verified live |
| Geometry | Multiple grouped hitboxes, shared hit budgets, rotated shapes, authored animation anchors and per-frame hurtboxes with visual placement | Broader interaction and device checks |
| Defense/interactions | Same-frame trades, armor, invulnerability, parry, projectile durability/clashes, reflection, absorption and guard break/crush | Wider priority and throws |
| Follow-ups | Manual/automatic attack-to-attack windows; manual jump/dodge/dash windows with timing, conditions and costs; bounded automatic chains | Broader physical-device QA and additional conditional transitions |
| Projectiles | Verified live independent lifetime, durability, reflection, absorption energy, homing and return. Single-contact/repeated policy (format19) and stationary impact areas (format20) and expanding single-hit explosions (format21), and timed fan splitting (format22) verified live | Custom area artwork and expanded travel/target behavior |
| Impact timing | Authored hitstop/blockstop/blockstun; separate combat/playback clocks; shared preview and projectile scenarios | Broader interaction and device coverage |
| Saving | Version1–26 clients verified live. Server79/version26 live; revision protection, local recovery, unsupported-write refusal | Authenticated anonymous classroom-bank browser round trip and future migrations |
| Authoring | Quick Edit, selected hits, basic/advanced, undo/redo/recovery, timeline zoom and grouped edits, reusable reaction templates, direct animation/target/attacker placement, both docked sides scrolling, compact section help | Persistent property inheritance, movement/conditional sequence blocks, audio/camera, more presets and broader help rollout |
| Testing | Two-attack comparison, replay, saved scenarios, diagnostics and shared regression cases | Remaining scenario coverage, usability checks and classroom-device playtesting |

Latest verified release suites: **Arena783 / staged Studio1454 / server31** passed. Browser verified anchor creation, drag/Undo, help, bound format25 export and Arena import (19 damage at frame29 in both apps). Arena42544482402 / Studio42544494857 succeeded. **74 live files** match (19 Arena,55 Studio), and downloaded anchor tests pass. Server78 supports formats1–25 with revision protection. Evidence: `release-staging/20261109-anchors`. Authenticated classroom-bank browser save/load and physical-device workflows remain unverified. The full goal remains active.

### Latest delivered milestones and evidence

- Expanded compact help: Studio `b5a67af584627245f3235ef3e79c3912b81a0e04`, Pages42534912119 succeeded. Ten instruction blocks moved into heading-adjacent info dialogs; collapsed-summary keyboard behavior, Escape/focus return and Effects-tab layout verified. Full staged suite1333 passes,16 live files match and downloaded help/usability tests pass. Evidence: `release-staging/20261108-static-help`.

- Scheduled melee/area events: Arena `9eda269` and Studio `b202edd`; both Pages deployments succeeded. Live hashes matched 48 Arena /70 Studio files. Anonymous Arena import→learn→test connected three hits for21 damage; live Studio authoring and independent timing edits passed. Shared scenarios cover fixed startup-relative scheduling, misses, geometry, defense and interruption. Release evidence: `release-staging/20261108-scheduled-sequences`.
- Version10 transport: classroom server63 deployed;15 anonymous in-memory bank checks passed. Existing formats remain readable and older clients cannot overwrite unsupported definitions. **Authenticated classroom-bank browser save/load remains unverified.**
- Timeline: zoom and track visibility/locking passed live checks. Selection publication `23d228a` was superseded by successful deployment `0d9c19e` (Pages42512458967), which preserves the timeline modules. Four live files match that deployed commit;17 focused downloaded-code checks passed. Live browser moved three hits36/40/45→42/46/51 and one Undo restored36/40/45. Evidence: `release-staging/20261108-timeline-selection`.

### Recent authoring delivery

- Cross-attack clipboard `a495e351`: referenced geometry and self follow-ups remapped; live paste/Undo verified.
- Group dragging `5370d393`: live1× selected drag and Undo verified; resize controls occupy a separate lane so short hits remain draggable.
- Batch hit properties `7dfc6df6`: live selected-hit damage/Undo verified, preserving timing.
- Reaction builder `461fbcca`: live preview→replace→Undo verified; supported blocks generate ordinary hit events. Anonymous generated sequence has four60-frame Arena comparisons across melee/area and both facings, committed on `combat-cancel-development` as `7d3f508`.
- Reusable recipe templates `0a8901c`: Pages42515303565 succeeded; release-staging/20261108-reaction-templates/deployment-status.json records six matched live hashes and15 focused tests. Local save/rename/remove/reload/restore/download/import browser checks passed. This supersedes the stale pending note. Templates are browser-local; backups contain active recipes. They do not provide persistent inheritance or classroom-bank template sharing.

### Latest combat milestone: hitstun release verified

Shared cross-attack combo tracking, optional damage scaling and counter-hit rules are delivered. Format15 adds optional hitstun deterioration and explicit per-event hitstun, preserving separate motion/knockdown/status recovery locks. Full release tests Arena560/Studio1295 pass; browser authoring/export/import smoke passed. Arena commit1e009f4 and Studio0efc647 are pushed; both Pages deployments succeeded and51 live files match the release. Server68 already supports15. See the latest dated entries and `release-staging/20261108-hitstun`.

Next combat scope: broader defensive mechanics (guard break/crush and explicit attack interactions), custom area artwork and remaining authoring capabilities. Homing, return and stationary impact areas are delivered. The expanded compact-help pass is delivered; subsequent authoring work includes inheritance and conditional/movement blocks. Additional authoring, anchors/hurtboxes, conditional behavior, authenticated anonymous bank browser verification, and classroom-device/accessibility checks remain. Historical local-only notes below do not describe current release state. The original scope remains active.

---

## Location and scope
Active work is in `/Volumes/Cyber Pet Combat`. The 200 GiB APFS sparsebundle lives at `/Volumes/Extreme SSD/CCP-V3/Cyber Pet Combat Workspace.sparsebundle`. The original 300 GiB workspace and recovery copies are untouched. No real student data was copied or modified.

Run `Start Combat Tools.command` at the volume root, or `python3 serve_combat.py` from attack-studio-project. The shared local preview is http://127.0.0.1:8786/. Only the apps, example attack, and approved reference assets are served. Directory listings, source checkout roots and Git data are excluded. The initial combat-v2 release was published November 5: Studio commit e00c7603f7234a83c099276d1f8b17f006da640a; Arena commit 356bdce7a7adc70b423dfaef82310fc4211996ae. Live delivery verified 68 expected file hashes and 21 downloaded-code workflow checks. Subsequent local changes are recorded below.

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

## Overall goal — compatibility milestone in progress
The user authorized the complete combat-tool improvement program, including versioned classroom-bank round trips, UI/UX and authoring improvements, and prioritized advanced mechanics. Earlier deferrals describe the initial release, not completion of this overall goal.

Local follow-up: shared status duration rules now prevent haste from being shortened by resistance; Arena status refresh preserves the next scheduled tick and includes ticks exactly at expiry. Eight new tests include frame-by-frame Studio/Arena comparisons for burn, poison and regeneration with single and repeated hits. All 67 Arena and 1,089 Studio tests pass. These follow-up changes are not yet published.

Audit evidence: Studio currently interpolates legacy knockback over flightFrames and respects pushAxis, wallSlam and floorSlam. Arena currently applies exponential horizontal drag and gravity-derived launches, automatically enabling wall/landing knockdowns. This is a verified remaining mismatch. Next: shared authored reaction sampling and explicit recovery behavior, with tests for axes, durations, airborne re-hits and wall/floor cases. Per-attack diagnostics, versioned bank support, full timeline and advanced mechanics remain incomplete. Browser visual QA remains unavailable.

### Authored legacy movement follow-up (local)
Studio and Arena now share legacy trajectory sampling: knockback is total displacement over flightFrames, pushAxis controls horizontal/vertical movement, and a new hit starts from the current position. Arena respects wallSlam/floorSlam rather than imposing knockdown on every launch. Stage boundaries remain scene-specific. Sequence reactions replace old legacy flight state. Twenty added reaction tests cover 18 direction/axis/duration combinations, authored collision flags, and airborne follow-up origins. Training wall demonstration explicitly opts into wall/floor slam. Recovery timings and scene boundary parity still require further reconciliation; these movement checks do not prove complete reaction parity. This follow-up is not yet published.

### Per-attack compatibility diagnostics (local)
Studio test results now replace the blanket legacy warning with setting-specific findings and suggested actions. Checks cover version-2 bank transport restrictions, per-hit damage semantics, interruption lifetime, legacy recovery/boundary differences, unsupported authored slow/haste/weaken strength, insufficient energy, no contacts and missed sequence windows. No-warning text explicitly avoids claiming universal parity. The pure diagnostic module is also available in Arena shared code, but Arena UI integration remains pending. Three new diagnostic tests plus the existing editor workflow check verify contextual findings and visible version-2 guidance. Current full suites: 87 Arena + 1,092 Studio = 1,179 passing tests. No browser visual validation or new publication is claimed.

Next compatibility work: reconcile recovery lock/knockdown timing; implement authored status-strength semantics; show these diagnostics at Arena import/test; then publish the verified compatibility milestone before advancing versioned bank transport. Overall goal remains active with advanced authoring and combat requirements outstanding.

### Authored status percentages (local)
Slow now multiplies movement by (1 - power/100), haste by (1 + power/100), and weaken multiplies outgoing damage by (1 - power/100). Slow and haste combine multiplicatively; duplicate same-kind records use the strongest percentage. Weaken applies to both legacy and sequence damage, without reducing healing/support. Studio incoming-damage tests also honor an opponent's active weaken percentage. Existing authored percentage values now take effect, so attacks previously balanced against Arena's fixed multipliers need playtesting. Studio uses a stationary target; the diagnostic explicitly recommends Arena for speed testing rather than claiming movement-preview parity.

Twelve added tests cover actual movement, percentage extremes, combined effects, expiry, both damage models, healing preservation and Studio incoming hits. Full suites: 99 Arena + 1,092 Studio = 1,191 passed. No new deployment yet. Recovery timing, Arena diagnostic UI and broader milestones remain outstanding.

### Arena checks and common recovery timing (local)
Arena move cards now include collapsible compatibility checks. The move-test panel opens those checks for the selected attack and clears them on reset. Imported version-2 workflow tests verify the guidance survives learning and testing. Studio presentation and Arena recovery now share the 30-frame down / 32-frame get-up timing and 10-frame wall timing constants. A boundary regression verifies down at frame 29, getting up at 30–61, and standing at 62 after knockdown. This aligns those phase durations only: legacy hit-lock behavior, landing poses, near-wall timing and stage-boundary differences are not yet claimed equivalent. All changes remain local pending the compatibility release.

### Recovery control boundaries (local)
Arena walking, jumping, guard and dodge displacement now require a standing reaction state, matching its existing attack/dodge eligibility checks. This closes the landing-to-knockdown frame where the reaction changed before stun was extended. X-only pushes no longer retain an unrelated floor-slam fall flag that could trigger a delayed knockdown after hitstun. Three new regressions test landing input suppression, exact 62-frame knockdown/get-up release, X-only floor behavior, and attack/dodge eligibility. Arena: 103 tests passed; last Studio verification: 1,092 passed (Studio unchanged in this step). Full cross-app hit-lock and landing semantics remain unfinished; the compatibility warning stays in place. Not yet published.

### Versioned bank groundwork and server audit (local)
Local attack banks now support explicit version 2 envelopes, upgrade on a sequence save without mutating the previous bank, retain legacy entries, and reject sequence data falsely labeled version 1. Studio permits sequence saves with This browser selected; remote v2 writes remain explicitly gated. This is groundwork, not completion of classroom saving.

Read-only Sites audit located classroom service appgprj_6ac1778cd32081918ba530bb3c83b9d6, live version 43, source commit 70dfd95a9263f332487bb0c29a19bd8c5216e305. Source opened at /private/tmp/combat-classroom-source via the Sites workflow. lib/attack-bank.mjs accepts only version 1, uses teacher sessions, a 900 KB body bound and atomic revision compare-and-swap. No service source or real bank records changed. Next server work must add validated v2 support and client capability negotiation while retaining these protections, and prevent old clients overwriting v2 records. Skill-tree clients require their own format compatibility update. Current local bank tests cover mixed legacy/sequence round trips and pre-network remote gating.

### Classroom-bank server v2 published
Sites service version 44 deployed successfully at https://cyber-pet-classroom-settings.ragingaxolotl.chatgpt.site from commit 8cdb47ce05aa35df5e633797e64aaa6e5f6c9771. Deployment appgdep_6aed119036bc81918c1a27a81817dd03; source checkout /private/tmp/combat-classroom-source. Server accepts validated v1/v2 banks; v1 cannot contain hitEvents. Version-2 access requires X-Attack-Bank-Version: 2. Old clients cannot read v2 banks and cannot overwrite them even with the current revision: the version check is part of the atomic SQL update. Existing authentication, rate limits, origin checks, size limits and revision protection remain. The public capabilities route advertises supported versions without bank data. No real bank records were changed.

Validation: three bank API tests passed, including v2 round trip, malformed sequence rejection and concurrent writes. Full service suite: 86 passing with one unrelated test-file import failure because tests/foundling.test.mjs depends on an absent sibling Board checkout. Production build passed. Native Sites deployment succeeded. Client-side capability negotiation and rollout remain outstanding: current published Studio does not yet enable v2 classroom saves. Overall goal remains active.

## Compatibility release 20261105-combat-compat
Studio commit d6ffdfe7c745ac8c0af93bb488c91ada0204d4ca; Arena commit 4e0cb89accc894366cc8b00eb292d7d51b2ec2e8. Source suites: 1,098 Studio and 103 Arena passing. Studio now declares bank version 2, checks server capabilities and revision protection before v2 writes, and retains local recovery before remote saving. The real client and server handler passed an anonymous in-memory connect/save/read/conflict round trip. Server v44 is deployed. Skill-tree sequence publication remains unsupported. Earlier notes saying all v2 classroom saving is gated describe earlier snapshots, not this release.

### Remaining goal work (not complete)
- Combat parity: full recovery eligibility/landing semantics, stage boundary scenarios, v2 status/defense coverage and target motion in preview.
- Saving: classroom bank browser workflow with authenticated test data when suitable; sequence skill-tree envelope and consumers; preserve local migration, revision conflict and recovery rules.
- Authoring: draggable multitrack timeline, multiple hitboxes/groups, anchors, undo across all editing actions, batch editing and behavior sequence templates beyond the initial juggle preset.
- Combat extensions: two-attack test UI, armor/invulnerability windows, cancels, combo scaling/limits, conditional follow-ups and expanded projectile entities/interactions.
- UI/UX: continued mapper/Studio audit, accessible controls, responsive layout and real-browser classroom-device validation (browser access currently disabled).
- Delivery: publish and verify incremental milestones; complete the requirement-by-requirement audit before declaring the overall goal achieved.

### Skill-tree v2 transport (local, after compatibility release)
Both tree validators now accept explicit v1/v2 envelopes and reject hit sequences inside v1 trees. Save attack to tree upgrades the envelope when needed, preserves every hit field and other nodes, and retains the existing selected-node/cross-tab conflict checks. Arena bankTree chooses v2 when any bank attack contains hitEvents. Existing v1 trees remain readable. New tests cover mixed tree round trips, prerequisite preservation, malformed hit rejection, Arena bank conversion, and the save-back/conflict workflow. Suites before the added editor workflow: 1,100 Studio + 104 Arena passed; the added save-back test also passed. This tree change is not yet deployed; published diagnostics still describe the previous release. Next: complete direct tree-file import/learn/equip test and release the tree-format update with matching diagnostics/cache keys. This does not authorize or implement automatic publication to the teacher's reviewed catalog.

### Two-attack comparison (local)
Training now offers Compare two attacks. It uses isolated practice fighters in the actual Arena engine, with selectable definitions, 0–800 px distance and −180 to +180 frame offset, and a bounded 600-frame run. Results show HP loss, same-frame trades, interruption events, failed starts and a frame log. No AI, awards or saved loadout edits occur. Tests cover trades, startup interruption, out-of-range misses, negative offsets, validation, definition immutability and UI storage isolation. Not yet published. Remaining for the full testing milestone: editable stats/positions/defensive scenarios, saved comparison scenarios, visual replay and Studio entry point. Combat recovery parity and the broader editor/mechanics requirements remain unfinished.

### Comparison replay and scenarios (local)
Comparison results now retain independent per-frame fighter snapshots for a scrubbed schematic replay. Both fighters have editable six-stat training values and starting heights. One device-local scenario saves selected move IDs and configuration; loading validates before applying, and missing attacks produce an explicit message. New checks verify snapshot isolation, airborne starts, replay scrubbing and scenario restoration. Saved battle loadouts remain untouched. This is still local pending release; defense presets, wall positioning, Studio entry and remaining combat parity still need work.

### Two-attack comparison release
Compare two attacks now includes move selection, offset, distance, six training stats per fighter, airborne starts, left/right wall placement, and B guard/evade replacements. Guard uses a 120-frame full-block action; evade uses an 18-frame authored action, not the keyboard dodge's shorter invulnerability window. A bounded run produces a frame log and scrubbed schematic replay; one scenario can be saved locally. All 110 Arena tests pass, covering trades, interruptions, unblockable guard interaction, misses, wall contact, snapshot isolation and UI persistence. Browser visual QA is unavailable. Unsupported clash/armor mechanics are explicitly identified. Remaining overall work includes recovery parity, multitrack timeline, hitbox groups/anchors, defensive/cancel windows, conditional/projectile expansion and real-browser usability verification.

### Recovery parity milestone (local, verified)
Stationary hits no longer receive an unrelated flightFrames lock or minimum eight-frame stun. Suppressed-axis displacement does not create a flight lock. Studio and Arena share legacyRecoveryEnd, incorporating authored hitstun, actual displacement/airborne travel and floor/wall knockdown recovery. Studio snapshots expose canAct and incoming-hit checks use the same lock. Exact tests cover zero/short hitstun, ordinary and floor-slam launches, long hitstun, both wall directions with aligned stage bounds, and five repeated airborne contacts. All 28 legacy-motion cases pass. This proves the tested motion/recovery cases, not universal simulation parity: the scenes still have different stage widths, Studio stationary starting-height handling and sequence interruption/recovery combinations need broader coverage. The recovery changes remain unpublished pending the next release. Previously completed two-attack comparison is published as 20261106-matchup (commit 5f5c14482e9ba5a8646e4df51e6c1aca3d324930); 36 live files matched and downloaded workflow checks passed.

## Arena classroom bank compatibility — November 6

Arena now uses the same version-2 bank protocol as Studio. Anonymous UI coverage loads a classroom sequence, learns it, and runs five hits for 28 damage. Both suites pass (133 Arena, 1101 Studio). Browser visual QA remains unavailable. Multiple-hitbox groundwork is not integrated or part of this release.

## Multiple hitboxes — local integration in progress

Timed damage attacks now resolve hitboxGroups in both the Studio model and Arena engine. Group contacts are snapshotted before resolution; overlapping boxes in a group share hit limits and intervals. Separate groups have independent counts. Eleven targeted checks cover grouping, both facings, delayed windows, block and dodge. Full suites passed after runtime integration (138 Arena, 1101 Studio); three further defense/window tests then passed.

Not published or exposed in the editor yet. Required next: versioned format/capability negotiation, editor selection/geometry controls and drawing all active boxes, UI tests, sequence/contact integration, and live release validation. Current local validator explicitly rejects groups combined with contact-triggered attacks or hit sequences; this is an interim constraint, not completion of the report.

### Local group authoring and versioned transport

The Studio inspector now creates groups, duplicates boxes within a group or into an independent group, edits shape/geometry/windows/rehit rules, moves boxes between groups, deletes boxes, and returns to a selected ordinary box. Changes use existing undo/history and version-3 local saving. Both previews draw active group geometry. Workflow coverage exercises edit, save, reassignment, deletion and undo; it is DOM-harness coverage, not visual browser QA. Current suites: 1105 Studio and 145 Arena passing.

Version-3 project/bank roundtrips preserve geometry and reject groups mislabeled as v1/v2. Skill-tree version selection and validation are updated but still need a dedicated v3 roundtrip workflow check. Classroom reads negotiate capabilities; v2 servers remain usable, and v3 writes are blocked before PUT unless the server advertises support. Production server v3 support is still pending. No group release has been published. Next: backend support, tree/reload workflows, direct canvas editing, contact-sequence integration, diagnostics, and publication/live verification.

### Classroom v3 server published

Classroom service version 52 (fb3e2e57c71ccec7a7f7f58a5855e3268f037d4c) deployed successfully. Live capabilities advertise bank/attack versions 1, 2, 3 with revision protection. Four server tests and production build passed. Updated from current hosted source first to preserve unrelated changes. No real classroom bank writes or student-data changes were performed. Front-end group release remains unpublished.

### Group canvas and reload verification

Canvas selection/drag/resize now edits the selected active group box and shows its handles. The DOM workflow test reopens a saved v3 project and verifies drag and resize persistence. Both skill-tree models pass v3 geometry roundtrip and older-version rejection checks. Full suites pass: 1106 Studio, 146 Arena. Group diagnostics now explain shared limits versus independent damage and version-3 transport. Visual browser QA and frontend publication remain outstanding.

## Armor runtime groundwork — local, not released

Added a shared defense-window validator and per-cast hit budgets, plus Arena resolution for ordinary damage, push, and sequence hits. Windows use absolute cast frames with an exclusive end, 1–10 eligible hits, and all/melee/projectile/area filters. Armor takes damage and suppresses the ordinary movement reaction/cast interruption; statuses still apply and defeat still ends the cast. Active defense windows are captured in the simultaneous-hit snapshot. Guarded and dodged contacts do not consume armor. This is only the runtime groundwork, not a completed user-facing armor feature.

Twelve new Arena tests pass: both actor orders with ordinary/sequence hits, budget exhaustion, exact start/end boundaries, category mismatch, lethal damage, secondary status preservation, and invalid window validation. Full suites pass: 166 Arena and 1115 Studio. No browser visual QA was performed. Both applications now validate defense definitions, but Studio preview does not yet simulate them. There are no authoring controls yet. Defense transport is explicitly gated; attackVersion identifies these definitions as version 4, but imports/exports and server negotiation have not enabled version 4. Do not publish this partial implementation.

Next: complete Studio incoming-hit interruption/armor parity, version-4 project/tree/bank support and server capabilities, editor/timeline controls and diagnostics; extend interaction coverage (overlapping groups, guards, simultaneous trades, status stun) before release. Invulnerability, parry/counters, cancels/combo rules, conditional/projectile behavior and broader UI/accessibility work remain unfinished. Last verified live frontend remains 20261106-contact-groups.

### Armor preview and interruption parity — local

Both shared preview implementations now apply armor to the sandbox incoming melee hit. Legacy previews now cancel later contacts after an unprotected incoming hit; current-frame contacts remain eligible for simultaneous trades. Sequence previews also preserve current-frame contact before cancellation. Armor still takes incoming damage and lethal damage cancels the move. A defense window only applies while the cast exists, not throughout the preview's trailing observation frames.

Four added frame-by-frame Arena/preview scenarios cover ordinary and sequence moves, armored and unarmored, with incoming damage before startup. Full suites: 170 Arena and 1115 Studio passing. Existing damage messages remain stable; interruption is a separate diagnostic. The sandbox incoming hit remains a single melee probe, not a substitute for the full two-attack simulator. Broader same-frame and defense interaction cases remain to be tested. Armor authoring, version-4 transport/server support, diagnostics, and release verification are still outstanding; nothing from this armor milestone is published.

### Version-4 armor transport and timeline — local

Both clients now round-trip defenseWindows through version-4 projects, local banks and skill trees. Containers labeled 1–3 reject armor rather than silently dropping its semantics. Classroom reads negotiate v4 when advertised; writes require bank/attack v4 capability and revision protection. The current deployed v3 server is correctly refused before PUT. Six new cross-app transport tests cover preservation, immutable legacy bank upgrade, old-version rejection, v3 server gating, and v4 protocol/revision negotiation. Full suites after transport: 173 Arena and 1118 Studio passing.

Studio timeline now includes imported armor windows in absolute cast frames, with validated move/resize and unchanged damage timing/filter/hit-budget properties. Six targeted timeline tests pass, including the new armor case. Creation/deletion and hit-budget/filter inspector controls, user-workflow coverage, backend v4 deployment and live release verification remain outstanding. Armor is still local, not published. Earlier notes that defense transport is entirely gated describe the prior snapshot; remote saving remains gated by actual server capabilities.

### Armor authoring workflow — local

Studio now has an armor inspector: add up to eight windows, edit absolute start/duration, set 1–10 absorbed reactions, filter all/melee/projectile/area, and delete windows. Labels explain that damage/statuses still apply and overlapping budgets are consumed in list order. Changes validate before mutation and use existing history/recovery. Deleting the final window removes the optional field, allowing an otherwise legacy attack to use its original format version again.

The DOM workflow test passes creation, property edits, version-4 save, invalid-window rejection without data mutation, deletion/undo, and project reload. Full suites pass: 1120 Studio and 173 Arena. This is headless functional coverage, not browser visual or accessibility verification. Classroom backend v4, broader defense interaction tests, compatibility diagnostics, cache/release preparation and live verification remain outstanding. Armor is not published; overall scope remains unfinished.

### Classroom armor server published — version 55

Sites deployment appgdep_6aee89f603d48191ad75aae059d499b6 succeeded from bff9b4108c6b58f60364a3861e0d6370afcb701a. Server now validates defenseWindows in version-4 banks, rejects invalid windows and mislabeled older containers, and enforces client-version protection during reads and atomic revision updates. Six server tests and production build passed. Existing authentication, origin checks, body limits and revision protection remain. No real bank records or student data were changed. Publication evidence is in release-staging/classroom-armor-v4/publication.json.

Additional Arena armor interaction tests pass (23 armor cases total): grouped duplicate geometry consumes one charge, independent groups consume distinct hits, guard/dodge preserve charges, simultaneous trade works in both actor orders, and overlapping windows consume budgets in list order. Frontend diagnostics, release preparation and live frontend verification are still required before claiming armor is available to users. Browser visual QA remains outstanding.

### Invulnerability runtime — local groundwork

While Studio armor deployment 42329301514 remains active, Arena now locally resolves defenseWindows of kind invulnerability. Eligible damage/push contacts are rejected without consuming armor budgets; status on rejected damage does not apply. Sequence contact reports Invulnerable and cancels attachment, consistent with existing dodge/contact cancellation. Five new tests cover both actor orders, ordinary/sequence contact, expiry and delivery filters; existing 23 armor tests still pass. Full suites: 186 Arena, 1121 Studio passing.

This is not a complete invulnerability feature: Studio preview, inspector kind selection, timeline labels, diagnostics and server support remain unfinished. Classroom writes containing invulnerability require an advertised defenseKinds capability, so the current armor-only server is not sent unsupported data. Older v4 clients reject unknown defense kinds during validation. Nothing from this invulnerability work is published. The paired armor verifier now compares Arena hashes to release commit 31214407b8f3aad8e0d2bcdebe32ac4f59bb35eb rather than evolving local source; frozen release tests remain unchanged.

### Invulnerability preview/editor — local

Studio's shared legacy and sequence previews now prevent incoming melee damage and interruption during eligible invulnerability windows, without consuming armor budgets. Two frame-by-frame Arena comparison tests pass. The inspector creates/deletes either defense kind; invulnerability omits armor's hit-limit control. Timeline labels distinguish kinds. The DOM workflow covers invulnerability creation, v4 saving, deletion/undo. Full suites pass: 188 Arena, 1121 Studio. Server defenseKinds capability, compatibility diagnostics, additional boundary coverage and publication remain unfinished; invulnerability is not live.

Studio armor run 42329301514 reached terminal failure: GitHub Pages timed out syncing_files and explicitly canceled deployment. Its build/artifact upload passed. A failed-step-only retry was requested after confirming that terminal state. Continue observing this same run; do not create a duplicate release merely because it takes time. Arena armor and classroom v55 remain verified live.

### Invulnerability release preparation

Classroom version 56 deployed successfully from c6de856fcca22c8053ea6d7e7ae593a7438480a0 (deployment appgdep_6aef314fcc748191a874e31a0488f212). Seven bank API tests and production build passed; live capabilities advertise defenseKinds armor and invulnerability. No real classroom records were changed. Temporary npm was incomplete; a fresh official Node 22.14 runtime in /private/tmp/combat-build-runtime restored the build.

Frontend diagnostics now explain immunity versus armor and the melee-only preview probe. Six transport/diagnostic checks verify explicit server capability gating. Last full suites before release preparation: 1124 Studio and 191 Arena. Preparing 20261107-invulnerability with frozen tests; publication and live verification remain pending. Broader combat/editor goal and visual QA remain unfinished.

### Invulnerability Arena live verification

Arena c4220ed0647348e7cce317d6ae0454363457cb60 deployed successfully (run 42380468571). Independent public verification matched 39 files and passed downloaded-code workflows including invulnerability. Studio commit 84c8dba61c850c69659074e73155971994e5d12f, run 42380481229, remains building at last check. Paired verification is still pending.

Found stale release metadata listing bank/tree versions only through 3 despite verified v4 runtime support. Both local manifests now declare 1–4 consistently, with a regression comparing them to attackVersion. This metadata correction is not yet published; frozen release snapshots remain unchanged.

### Verified invulnerability release; parry local development

Paired live verification of 20261107-invulnerability succeeded: 91 files fetched, 89 expected hashes matched, both downloaded-code workflow suites passed, sample effect HTTP 200. Evidence: release-staging/20261107-invulnerability/live-verification.json. This supersedes pending Studio deployment notes. Browser visual QA remains unavailable.

Local parry runtime now uses a frame window, delivery filter, 1–10 per-cast charges and 1–60 frames of attacker interruption. It rejects eligible damage/push contacts, cancels incoming sequences, and does not trigger automatic counterattacks. Shared previews reproduce melee incoming-hit prevention and interruption; seven parry tests cover both actor orders, ordinary/sequence attacks, bounds and frame-by-frame preview parity. Full suites: 205 Arena and 1125 Studio passing. Classroom parry writes require explicit server defenseKinds support and remain blocked by the current server.

Parry inspector/timeline controls, diagnostics, server support, more interaction cases and publication remain outstanding. Automatic counterattack follow-ups still require conditional behavior work. The overall goal remains active: cancels/combos, conditional/projectile expansion, further editor workflows and visual/accessibility QA remain unfinished.

### Parry frontend release preparation

Parry inspector/timeline controls and save/reload/undo workflow pass. Runtime has 14 passing parry tests, including exact boundaries, attack filters, invulnerability precedence and simultaneous independent hit groups exhausting a one-hit budget. This explicitly permits another independent hit on that same frame after the budget is exhausted. Automatic counterattack follow-ups remain unimplemented.

Classroom v57 deployed successfully from 745a0af5c2e73b723de332a0181859d8f49a7fef (deployment appgdep_6aef5a835e788191969352753acad9fc). Eight bank tests and build passed; parry window validation and capability advertisement are enabled. No real classroom data was modified. Preparing frontend 20261107-parry; live frontend verification remains pending.

### Parry live and cancel runtime groundwork

Paired parry release verification succeeded: 91 files fetched, 89 expected hashes matched, both downloaded-code workflow suites passed, sample effect HTTP 200. Evidence: release-staging/20261107-parry/live-verification.json. This supersedes pending Studio parry notes. Browser visual QA remains unavailable.

Local cancelWindows permit explicit follow-up attack IDs within absolute cast-frame windows and conditions any/hit/block/parry/whiff. Arena preserves art availability, energy, cooldown, stun and recovery checks; failed requests retain the current cast. Actual hit/block results include push attacks. Whiff requires completed active timing without a successful outcome and is restricted to damage/push moves. Successful parry can permit a manual follow-up; this does not implement an automatic counterattack. Sixteen cancel tests pass, including timing boundaries, resource failure, guarded contacts, pushes and parry follow-ups. Full suites: 228 Arena and 1126 Studio passing.

This is runtime groundwork only. Cancel preview/authoring, version-5 project/tree/bank transport, server capability support, diagnostics, dodge/jump/dash cancels and automatic conditional follow-ups remain unfinished. Cancel transport currently rejects the optional field rather than exporting silently ignored behavior. Nothing from cancel work is published.

### Cancel authoring and version-5 local transport — local, unpublished

Version-5 projects, local banks and skill trees now preserve cancelWindows. Older envelopes reject the field; remote writes require advertised v5 support and revision protection. The deployed classroom backend remains v4 and correctly refuses these writes before PUT. This supersedes the earlier note that all cancel transport is gated.

Studio now offers follow-up windows with start/duration, any/hit/block/parry/whiff conditions and 1–16 named allowed attacks. Missing project references remain visible and preserved. Removing the last window removes the optional field. Timeline moves/resizes use absolute cast frames and validated edits. Workflow coverage verifies creation, save/reload, invalid timing, minimum selection, deletion/undo, missing references and immutable timeline changes. Full suites pass: 1130 Studio and 231 Arena.

Still required for this milestone: cancel-aware preview, classroom backend v5, reference/compatibility diagnostics, duplication/reference review, additional runtime edge cases, release preparation and live verification. Browser visual/accessibility QA remains outstanding. Nothing from cancel work is published. Broader conditional/projectile/combination and editor scope remains active.

### Cancel references and diagnostics — local, unpublished

Duplicating a move and synchronizing linked reskins now remap self-follow-up references to the destination move while preserving other named links. Duplicate targets collapse safely. The editor workflow test covers actual duplication; reskin tests cover both synchronization directions without mutating the source. Review-export eligibility no longer labels defense/cancel definitions legacy-compatible.

Diagnostics now describe v5 transfer, manual follow-up conditions and the single-attack preview limitation, identify missing project references without deleting them, and flag impossible whiff conditions on support/defensive payloads. Project context reaches the existing results diagnostics. Full suites pass: 1132 Studio and 231 Arena. This is headless coverage, not visual QA.

Still left before cancel publication: a useful follow-up preview/test workflow, classroom backend v5, runtime whiff/contact edge-case review, release preparation and live verification. Larger combat/editor scope remains active; no cancel changes are live yet.

### Follow-up comparison and replay — local, unpublished

Arena comparison accepts a selected A follow-up and an attempt frame relative to A’s start, after that frame’s contacts. It uses the real engine and reports successful cancellation, an ordinary start without cancelling, rejection reason or no attempt before the test ended. Original and follow-up contacts are reported separately; replay includes the replacement cast. Scenarios save follow-up IDs/timing, preserve old scenario defaults and reject missing saved follow-ups. Corrected outdated UI text claiming armor was unavailable.

Four engine scenarios and a DOM workflow cover real contact/damage, exclusive window end, normal starts, block conditions, negative initial offsets, resource rejection, truncated tests, save/load and missing references. Full suites pass: 236 Arena / 1132 Studio. Visual QA is still outstanding.

Remaining: Studio entry point for follow-up testing, contact-timeout whiff semantics (never-contact casts currently end without a whiff cancel opportunity), classroom backend v5, release preparation and live verification. Single-attack Studio preview still does not execute follow-ups. These changes are local only; broader goal remains active.

### Contact timeout recovery and whiff boundaries — local, unpublished

Contact-triggered moves now accept contact through startup + 600, then enter authored recovery on the following frame if no contact occurred. During that recovery, whiff follow-ups can activate; late overlap cannot trigger a new hit. Zero recovery ends the move immediately after the final contact opportunity. This changes previously missing Arena recovery after timeout and replaces Studio’s inconsistent extra active-duration estimate. Shared contact-timing helpers align ordinary and sequence cast ends and next-cast estimates. Defense snapshots no longer protect on the exclusive cast-end frame.

Eight exact-boundary scenarios cover ordinary and sequence misses, contact on the deadline, late overlap, whiff eligibility, zero recovery, preview next-cast timing and actual incoming damage at defense expiry. Full suites passed: 244 Arena / 1132 Studio. Comparison UI now extends selected follow-up tests past their attempt frame where possible, capped at 900 frames; an initial offset plus a very late attempt can still exceed that cap and is reported as not attempted.

Remaining before cancel release: Studio entry point for testing, classroom backend v5, release preparation and live verification. Single-attack Studio preview does not execute follow-ups; Arena comparison does. Visual/accessibility QA and the broader combat/editor scope remain unfinished. Nothing in this milestone is published.

### C ninth attack slot — published and file-verified

User requested C beside X as another attack slot. Independent Arena release 20261108-c-slot, commit 33f14bf6fc91dd5f3dc3acb7e3b2db3ccb211221, deployment run 42481003261 succeeded. All 36 fetched public HTML/CSS/JS/manifest files matched the tested release. Release suite: 215 tests. Current development suite including unfinished cancels: 247 Arena tests passing. Physical C is free Quick jab; mapper, fullscreen and custom sets expose nine slots. Legacy eight-slot profiles/drafts preserve assignments and append empty C. New profiles use version 2; older clients reject them. Separate defense defaults to F Block/V Dodge, and no longer offers C; Shift combined defense is preserved. No real profiles were accessed. Visual browser QA remains outstanding.

Release was built in /private/tmp/cyber-pet-c-slot-release from the parry commit, excluding cancel work. The primary Arena checkout still has its earlier HEAD plus all local changes; remote main is now 33f14bf. Before the next publication, reconcile the release commit with development without discarding unpublished cancel work. Evidence: release-staging/20261108-c-slot/live-verification.json. Studio handoff and classroom v5 remain unfinished; overall goal stays active.

### Studio-to-Arena follow-up testing — local, unpublished

Each Studio follow-up window now has a Test this follow-up in Arena link. It transfers only project attack definitions, first attack ID, the first allowed follow-up ID and the window start frame. A new Arena tab opens an isolated comparison with adjustable opponent and timing; it does not import into learned moves, saved sets or pet profiles. Reopening ordinary comparison restores the current game catalog. No automatic battle starts.

Same-origin, one-use browser storage transfer validates attack definitions/references, limits payloads to 2 MiB and 256 attacks, and expires after ten minutes. The URL contains only a random transfer ID. Missing or expired transfers show an actionable error. Studio click coverage verifies the real link and payload; Arena tests cover consumption, invalid origins/references, expiry and comparison storage isolation. Full suites pass: 249 Arena and 1132 Studio. Browser navigation/visual QA remains unverified; these are functional headless checks.

Remaining for cancel release: classroom backend v5, reconcile the independently published C-slot commit with local development, prepare paired cache/version metadata, publish and verify live. Studio single-attack playback still does not chain attacks; the new link uses Arena’s comparison instead. Overall conditional/projectile/combo/UI scope remains active. C-slot release is live; this handoff and other cancel changes are not published.

### Ninth attack slot C — release preparation
C sits beside X and is available in the mapper and fullscreen controls. Physical C is a free Quick jab using existing thrust artwork. Custom sets gain a ninth slot. Version-1 eight-slot profiles upgrade in memory to version 2 without changing the original stored value until a successful save; prior assignments and draft slots are preserved. Old clients reject the new profile version. Separate defense defaults to F for Block and V for Dodge; C is removed from defense choices. Combined Shift defense is unchanged. Release is isolated from unfinished cancel work. 215 tests pass; browser visual verification remains outstanding.

### Published C-slot integration — verified locally

Checkpointed unpublished Arena work as f8d3797 on combat-cancel-development, then merged published C-slot commit 33f14bf into merge commit be9c366. Reviewed conflicts against the published files with cache suffixes normalized: retained all C-slot behavior and all cancel/timeout/handoff work, and preserved both documentation histories. Published C-slot commit is now an ancestor of development HEAD. No merge conflicts or uncommitted source changes remain. This supersedes the prior instruction that integration was still needed. Do not push the development branch to main until remaining release work passes.

Post-merge suites: 249 Arena and 1132 Studio passing. Current live deployment remains the C-slot release; local cancel/handoff functionality is not published. Next: classroom v5 support, paired release metadata/cache preparation, publication and live verification. Browser visual QA and broader feature scope remain outstanding.

### Classroom version-5 saving — server published

Classroom Site version 58 deployed successfully from source 77badcdd28eb6cd5abd29694b79cbb5be4a854e9 (deployment appgdep_6af0a1ea600c8191831e3052b86a112f). Server now accepts and validates cancelWindows in v5 banks, rejects malformed windows and mislabeled older envelopes, and protects v5 contents from older-client reads/overwrites. Existing authentication, origin checks, body limits and atomic revision protection remain. Nine bank API tests and production build passed. Tests used in-memory anonymous fixtures; no real bank records or student data were modified. Evidence: release-staging/classroom-cancel-v5/publication.json.

Remaining for the cancel milestone: paired frontend cache/version preparation, publication and live verification. The classroom server is ready, but published Studio/Arena still precede cancel authoring/runtime. Browser navigation/visual/accessibility QA and broader feature scope remain outstanding.

### Cancel release published and live-verified

Paired release 20261108-cancels is live. Arena commit d5a20eb5a0f75e6a7ba4fd60d3863a84324ca5b4 deployed successfully in run 42499767816. Studio commit ed0e7275216a5499a525fbbb78b2982c84d2ff4e deployed successfully in run 42499782539, preserving unrelated website roots. Classroom v58 already supports v5 banks. Both frontend manifests advertise container versions 1–5, cancel windows and Studio comparison transfer. C-slot changes remain included.

Live verification fetched 98 files and matched all 96 expected hashes; both downloaded-code workflow test sets passed, including cancel authoring, transport, timeout boundaries, Studio transfer, comparison and C-slot migration. Sample effect returned HTTP 200. Evidence: release-staging/20261108-cancels/live-verification.json. Source suites before release: 249 Arena / 1132 Studio passing. Browser visual/navigation/accessibility QA remains unverified because browser control is unavailable.

This completes publication of manual attack-to-attack cancel windows and their authoring/test/save workflow. It does not implement movement cancels, automatic conditional counterattacks, combo scaling, projectile expansion or the remaining editor/visual QA scope. Next milestone should address conditional follow-ups and their explicit trigger/lifetime rules, preserving existing manual cancels and deterministic simultaneous resolution. Overall goal remains active.

### Automatic follow-up runtime — local groundwork

Automatic cancel windows now choose exactly one named follow-up, evaluate after both fighters’ collision resolutions, and start the replacement cast on the next frame. Manual input does not consume automatic-only windows. Energy, cooldown, reaction, artwork and available/equipped attack checks remain; interruption or defeat prevents a pending automatic transition. Automatic chains stop after eight transitions. The first eligible automatic rule in list order has priority; failed resource/readiness attempts can retry while its window remains open. A new manual cast starts a fresh chain.

Fixed the interrupted parry test by configuring defense before Arena copies the attack, rather than changing the original definition after cast start. Twelve runtime tests pass: hit/block/whiff/parry, next-frame timing, payment, missing/unequipped attacks, both actor orders during interruption, defeat, and chain limits. Full suites: 261 Arena and 1132 Studio passing.

Automatic definitions require version 6; current transport rejects them in older envelopes. This is deliberately unpublished runtime groundwork. Remaining: v6 project/bank/tree transport and server support, editor activation controls and diagnostics, automatic-chain comparison/replay tracking, wider interaction testing, publication and live verification. Existing manual cancel release remains live and unchanged. Broader movement cancels, combo rules, projectile expansion, clashing and UI/visual QA remain active.

### Automatic authoring and v6 local transport — unpublished

Projects, local banks and skill trees now round-trip automatic follow-ups as version 6. Envelopes 1–5 reject automatic behavior. Remote reads negotiate v6 only when advertised; writes to the current v5 classroom server are refused before PUT. Tests cover immutable upgrades, save/load, old-envelope rejection and revision negotiation.

Studio now offers Manual input / Automatic activation per window. Automatic requires one explicit target; enabling it with several selected targets reports a correction instead of deleting references. Save, switching back, and undo preserve behavior/version. Timeline labels and diagnostics distinguish automatic windows and explain priority/chain limits. Full suites pass: 264 Arena / 1135 Studio. Browser visual QA remains unverified.

Still left for this milestone: automatic-chain comparison/replay must include the complete available attack pool and distinguish automatic transitions from manually requested follow-ups; classroom backend v6, additional combined-interaction coverage, publication and live verification. The published v5 manual-cancel release is unchanged. Broader goal remains active.

### Automatic-chain comparison — local, unpublished

Comparison accepts the available attack pool (validated, capped at 256) so follow-up targets beyond the two starting moves can execute. It captures automatic cast transitions after each engine tick, reports queued/start frames, names, chain depth and eventual contacts, and keeps manual-attempt results separate. A transition queued at the test limit reports zero contacts and unfinished activity. Studio transfers now carry activation mode; automatic tests open without a scheduled manual input. Reopening normal comparison still restores the game catalog.

Tests exercise a three-attack chain with 30 total damage, immutable definitions, per-cast contact attribution, unavailable targets, truncated replay and the actual automatic Studio comparison controls. Full suites: 266 Arena / 1135 Studio passing. No automatic follow-up changes are published yet.

Remaining: detailed reasons for automatic follow-up failures/limits in comparison, broader interaction coverage, classroom backend v6, release preparation/publication/live verification. Browser visual/accessibility QA and the broader combat/editor goal remain active.

### Automatic attempt diagnostics — local, unpublished

Arena records each frame’s automatic attempt result, including missing/unequipped targets, resource/readiness failures and the eight-transition cap. Comparison retains structured failure records and logs a reason only when it changes for that cast/window, avoiding repeated messages each frame. Runtime priority and retries are unchanged. The engine only keeps current-frame attempts; the bounded comparison owns its result history.

Added tests for one-time missing-target messages, distinct energy/cooldown causes and chain-limit reporting with eight completed transitions. Full suites: 269 Arena / 1135 Studio passing. These diagnostics describe eligible attempts; they do not yet diagnose every unmet condition or interrupted branch. Updated Studio diagnostics point to the available comparison results.

Next: classroom v6 support, remaining combined-interaction checks, paired release preparation/publication/live verification. Automatic features remain local; v5 manual cancels and C slot remain live. Broader combat/UI scope and visual/accessibility QA remain active.

### Classroom automatic-follow-up support — server published

Classroom Site v59 deployed successfully from 0bf3b121ddd3403096d417870c804c1422cc24cc, deployment appgdep_6af0a671156c819185ed62852317df45. Version-6 banks preserve automatic rules, require one target, reject invalid activation types and reject automatic definitions in older envelopes. Older-client read/overwrite protections and revision compare-and-swap remain intact. Ten in-memory bank API tests and the production build passed; no actual bank records were changed. Evidence: release-staging/classroom-automatic-v6/publication.json.

Remaining: combined-interaction checks, paired frontend version/cache preparation, publication and live verification. The server supports v6; automatic authoring/runtime are still local until frontend release. Browser visual/accessibility QA and broader combat/editor scope remain unfinished.

### Automatic follow-ups — published and live verified

Release 20261108-automatic is deployed: Arena 1073c8e342cfc6f947ee5efea942e897fac7bc41 (Pages run 42501365177) and Studio d4ec43f4cb0f0e73f1ceca0dbb59d310c19fd402 (run 42501369906), both successful. Classroom v59 supports version-6 saving. This supersedes the unpublished status above.

Source suites passed: 275 Arena / 1135 Studio. Live verification fetched 98 files, matched all 96 expected hashes, passed both downloaded-code workflow test sets, and received HTTP 200 for the sample effect. Evidence: release-staging/20261108-automatic/live-verification.json. Visual/browser interaction QA has not been performed for this release; the verifier's browser-unavailable label reflects the earlier environment check, not a new browser availability test.

Finished: automatic hit/block/parry/whiff follow-ups, authoring controls, eight-transition chain limit, resource checks, comparison replay and eligible-attempt failure explanations, version-6 transport, armor/invulnerability/simultaneous interruption coverage, deployment and live-code verification. The ninth C attack slot remains included.

Next: improve comparison duration for late automatic whiff follow-ups, audit contextual explanations, and perform browser UI/accessibility verification when available. Still left: movement cancels, broader conditional rules, combo/juggle limits, advanced projectile interactions, clashing, animation anchors/hurtboxes, expanded timeline editing and remaining UI/UX audit items. Overall goal remains active.

### Duration and ninth-slot status — live verified

Arena commit 10e786d1514c71f8e9840242ed89e5db88ac8970 deployed successfully in Pages run 42502365709. The earlier eb2f088 deployment failed its test gate because a remounted SSD copy contained the obsolete invalid recovery=800 fixture; f1b4d45 corrects it to a valid contact-timeout projectile. All 276 Arena tests now pass. Studio source was unchanged (last full suite: 1135 passing).

Live verification matched 42 published source/data files and passed downloaded-code comparison/C-slot workflows. Browser interaction confirmed a 30-frame run and truncation warning. Browser inspection discovered index%8 in status rendering, which incorrectly labeled C as Q and misaligned fullscreen statuses. Changed to KEYS.length; browser now reports C: Quick jab, and both keyboard descriptions include C. DOM regression checks ninth-slot labels in both layouts after an engine step.

Evidence: /private/tmp/combat-duration-evidence/verification.json and tests.txt. Canonical SSD repeatedly unmounted during work; release was completed in /private/tmp/combat-duration-release, cloned from GitHub. Reconcile canonical checkout with main before further SSD development. Do not overwrite local work. No filesystem repair was attempted.

Next: widen and organize comparison dialog (live screenshot showed narrow desktop layout and tiny replay); continue Studio browser audit, responsive/accessibility checks and outstanding combat/editor scope. Overall goal remains active.

### Comparison layout — desktop preview checked

Widened comparison to 1180px maximum with setup and replay side by side, a sticky result panel, bounded event log, and stacked layout below 760px. All 276 Arena tests pass. Local browser screenshot confirms the desktop layout; small-screen and published verification remain pending. User confirmed SSD disconnections are due to a fragile cable. Continue in the temporary checkout and sync GitHub; do not write to/repeatedly remount the SSD until connection is stable. Reconcile canonical checkout later without discarding changes.

### SSD work resumed by user instruction

User explicitly directed continuing writes to the SSD despite the fragile cable. Remounted Combat image and fast-forwarded the clean canonical Arena checkout from eb2f088 to 2252f3d, preserving history with no discarded changes. This supersedes the temporary-checkout-only instruction above. Continue development under /Volumes/Cyber Pet Combat; temporary checkout remains a recovery copy.

### Comparison layout — deployed and targeted browser checks passed

Arena 2252f3dcc6d356db685d2dc513db07f7d496cb78 deployed successfully (Pages run 42502799039). Verified 42 published files against that commit and passed downloaded-code comparison/C-slot workflows. Desktop local screenshot shows setup beside replay. Published 390×844 browser check shows stacked, readable controls and a successful 900-frame run with results and scrubber. Restored browser viewport afterward. Initial ordinary URL retained old HTML in browser cache; release-qualified navigation loaded verified current markup.

Evidence: release-staging/20261108-comparison-layout/verification.json and tests.txt. Canonical SSD checkout is current. Next: Studio browser UI audit, remaining accessibility/responsive work and larger combat/editor scope. Overall goal remains active.

### Playback release live verified; parry guidance corrected locally

Studio 6957a143fa566141a677232c1c45bbbd4ac679cb deployed successfully in run 42503091306. Both live files match recorded hashes. Live browser Reset returns phase to 0f STARTUP and the Test attack control is positioned above canvas. Evidence: release-staging/20261108-playback/verification.json. Local narrow-screen check was 500px with no horizontal overflow. This completes this playback-placement milestone, not the entire UI audit.

Separately corrected stale parry guidance in both shared diagnostics copies: a counterattack requires a separate automatic After parrying follow-up, tested in Arena because single-attack preview does not execute follow-ups. This wording change is local/unpublished. Full suites pass: 1135 Studio / 276 Arena. Next: continue remaining UI workflow audit and combat scope, include diagnostics correction in next paired release.

### Temporary comparison handoff cleanup — tested locally

Creating a new Studio-to-Arena test now cleans expired/malformed entries only under cyber-pet-comparison-transfer:. It preserves current handoffs and does not inspect saved profiles or attack banks. Cleanup snapshots keys before removal so storage index shifts cannot skip entries. Storage adapters without enumeration remain supported. Regression confirms expiry, malformed-data removal, preservation of current transfers/unrelated data and successful consumption of the new test. Shared source copies match. Full suites: 277 Arena / 1135 Studio passing.

This cleanup and the parry guidance correction remain unpublished. Next: paired release of these shared changes and live handoff verification; broader combat and editor scope remains active.

### Shared handoff cleanup release pushed — pending deployment

Studio scoped commit 2b6f6ea9d3d125b75981a202f498cdfd4ae657db (five files; receipt release-staging/20261108-handoff-cleanup/publication.json), Pages run 42503510751 in progress. Arena commit 38e41af4d3b40b75e273dfcb08b41238da61e8a2 includes cleanup, parry explanation and transitive cache updates including workshop; latest Pages run 42503533567 queued behind initial run 42503499094. Source tests before cache-only follow-up: 277 Arena / 1135 Studio pass. Do not restart jobs merely because observation times out.

Remaining for milestone: poll these exact deployments, verify changed published hashes and live handoff behavior. Broader goal remains active. Prepared /private/tmp/verify_studio_handoff.py (hash verification; browser metadata inherited from playback must be replaced with handoff-specific observations before claiming live interaction coverage).

### Handoff release verification in progress

Arena run 42503533567 completed successfully. Verified all 42 published source/data files against 38e41af4d3b40b75e273dfcb08b41238da61e8a2 and ran downloaded-code comparison, transfer cleanup and C-slot tests successfully. Evidence: release-staging/20261108-handoff-cleanup/arena-live/verification.json. Studio run 42503510751 is still building; live browser handoff remains unverified. Corrected the Studio verifier to remove inherited playback-specific claims.

Next combat audit finding: shared hit-sequence.js counts reactions on the target across sequence casts, forces downward/away knockback at ten reactions and refuses further sequence contacts while locked airborne. This is already more than a per-cast cap. Ordinary legacy hits do not participate in this counter; inspect mixed legacy/sequence chains, landing reset and armor before extending global juggle rules. Do not describe general combo protection as complete from sequence-only coverage.

### Handoff release files verified; juggle diagnostics local

Studio run 42503510751 succeeded and all five published changed files match 2b6f6ea9d3d125b75981a202f498cdfd4ae657db. Arena was already verified at 38e41af. Evidence: release-staging/20261108-handoff-cleanup/verification.json and arena-live/verification.json. Actual cross-tab browser handoff remains pending; source/headless transfer coverage is not a substitute for it.

Local shared hit-sequence change records when airborne juggle lock blocks an active hit opportunity and reports that cause when the window expires. Landing within the window still permits contact, and ordinary misses retain their existing explanation. Three new regressions pass; full suites: 280 Arena / 1135 Studio. This does not change juggle balance or extend caps to legacy hits. Unpublished; next release should include this diagnostic after mixed-chain audit. Overall goal remains active.

### Live Studio-to-Arena transfer checked

Used a new unbanked draft on the published Studio, added a follow-up, and clicked Test this follow-up in Arena. The automation browser exposed no popup, so opened the exact generated URL in a controlled tab. Arena consumed the one-use transfer and opened comparison with the selected attacks, frame 0 and guard scenario. Hit-confirm at frame 0 correctly rejected before contact. Changed the test window to Any result / Automatic and transferred again: Arena explicitly scheduled no manual input, then reported one automatic follow-up, one contact and a frame-1 start during a 900-frame comparison.

This verifies real browser storage/definition transfer and comparison behavior. Native popup opening remains unverified in this browser integration. No classroom login or bank writes; the anonymous test draft remains unbanked. Evidence: release-staging/20261108-handoff-cleanup/verification.json. Pending local change: juggle-limit diagnostics (280 Arena / 1135 Studio tests passed). Broader mixed-chain juggling and remaining combat/editor scope remain active.

### Mixed-chain forced landing — local fix

Confirmed ordinary beginReaction replaced pulseMotion even after the target hit its sequence juggle cap. It now preserves forced landing while juggleLocked and airborne; damage remains resolved by the caller. Grounded reactions clear the expired juggle counter/lock and proceed normally. This closes relaunch escape from an already reached sequence cap, but does not introduce a global counter for ordinary-only combos. Studio single-attack preview does not execute mixed attack chains; sequence lock behavior remains shared.

Regression checks force landing at reaction ten, try an ordinary launch, preserve motion/stun, land and allow the next reaction. Additional real-Arena test confirms 10 damage still connects while forced motion is preserved. Full suites passed at 281 Arena / 1135 Studio; the subsequently added real-Arena regression passed individually (five juggle tests total). This and shared juggle-limit diagnostics remain unpublished. Next: finish broader mixed-chain rule review and publish verified changes; larger combat/editor goal remains active.

### Juggle landing fixes published — deployment pending

Added grounded reset in shared pulse motion, natural sequence-preview landing and Arena floor contact. A lock now expires on landing, allowing a fresh jump to be hit again. Preserved forced landing against ordinary relaunches after the cap; damage still connects. Seven juggle regressions cover diagnostics, active-window landing, forced motion, ordinary damage and reset. Full release suites: 284 Arena / 1135 Studio passing.

Arena commit 3888a1003577e443ba848798244f83909d95926f; Studio 8842a7695fe1e0057967dc9162b45329b8048a99. Studio publication preserved unrelated root entries. Frozen tests, hashes and receipt: release-staging/20261108-juggle-reset/. Prepared /private/tmp/verify_combat_juggle.py for paired live verification after deployment. Global ordinary-only juggle counting remains unfinished. Overall goal active.

### Landing release verified; common juggle budget local

Both juggle-reset deployments succeeded (Arena run 42504097043, Studio run 42504107427). Pinned live verification fetched 98 files, matched 96 hashes, passed both frozen downloaded-code workflow sets and fetched the sample artwork HTTP 200. Evidence: release-staging/20261108-juggle-reset/live-verification.json. This verifies published landing protection/reset and miss diagnostics, not later local common-budget changes.

New local juggle-rules.js shares a ten-reaction target budget between ordinary and sequence reactions. Grounded launch consumes one point; grounded flinches and parry interruptions do not. Exhaustion substitutes a 15-frame/30px grounded-directed release; further ordinary damage still resolves without restarting motion. Landing clears the counter. Legacy preview now stores each flight's resolved reaction instead of always sampling the original attack, preserving release parity.

Tests cover alternating reaction types in both orders, ordinary ten-hit launch preview/Arena frame parity, damage count, floor reset, grounded flinch and parry exclusion. Full suites: 288 Arena / 1135 Studio passing. Remaining before release: armor/guard/invulnerability and successive-cast integration, clear balance-change diagnostics, shared new-file publication and live verification. Existing old attacks are not rewritten, but long legacy launch chains will behave differently under this new runtime rule; document that change. Overall goal remains active.

### Shared juggle budget defensive coverage — local, unpublished

Added actual Arena collision tests for guard, armor and invulnerability against both ordinary and sequence attacks while the target already has four airborne reactions: none consumes another point. An automatic two-cast chain increments the same target counter from one to two and preserves damage. Shared compatibility diagnostics now explain ten reactions, counting the grounded launcher, floor reset, forced release, continuing ordinary damage and the need to retest older long launch combos.

Full suites: 295 Arena / 1135 Studio passing. New shared juggle-rules.js and integrations are still local; current live release remains juggle-reset (sequence lock/landing fixes only). Next: cache/version preparation, include the new shared module in both published dependency graphs, paired release and live downloaded-code tests covering global-juggle.test.mjs. Broader objective remains active.

### Common juggle budget release pushed

Arena 821e9391828cdd2f7f2c6d319715d7f04218fe36 and Studio bc7de02c35361d200cd2de02a1412002c03a98a9 published with cache updates and the new juggle-rules.js module. Source release tests pass: 295 Arena / 1140 Studio. Studio test count increased because separate skill-tree dataset tests appeared in the shared workspace. Those newer skill-tree implementation files are excluded from this scoped publication and preserved locally; do not overwrite them. Publication preserved unrelated root entries. Baseline hashes for excluded previously published Studio files are retained in verification manifest.

Evidence/frozen tests: release-staging/20261108-shared-juggle/. Prepared /private/tmp/verify_combat_shared_juggle.py, including global-juggle tests against downloaded code. Remaining: deployment and live verification, then broader combat/editor scope. The balance change applies to legacy launch chains without rewriting saved definitions. Overall goal active.

### Shared budget Arena live verification; projectile dependency audit

Arena run 42504566610 succeeded. All 43 published source/data files match 821e939 and downloaded-code workflows pass, including global-juggle, landing and handoff regressions. Evidence: release-staging/20261108-shared-juggle/arena-live/verification.json. Studio run 42504573532 is still in progress; paired verifier remains pending.

Projectile audit: Arena tick snapshots only fighters with f.cast. prepare reads f.cast directly; resolve and resolveSequence retire that cast at castEnd. Thus all projectiles currently depend on the fighter's active move even though their origins and hit trackers live on the cast object. A persistent projectile needs a separate entity registry, explicit spawn/lifetime and owner references, collision snapshots collected alongside fighter casts, independent retirement and drawing. Reflections must change owner/facing/target with explicit hit-history policy; splitting must have a spawn budget. This must be versioned and advertised in Studio/Arena/bank capabilities before authoring is enabled. Do not claim persistence by merely retaining a canceled fighter cast: that would retain defense/cancel windows and block the owner's next move.

Next: finish paired live verification, then implement independent projectile state with tests for attacker interruption, concurrent moves/projectiles, target defeat, expiry/reset and simultaneous impacts, before adding reflection/splitting. Existing cast-owned definitions must preserve their behavior. Overall scope remains active.

### Shared juggle release fully verified live

Studio Pages run 42504573532 completed successfully alongside Arena run 42504566610. Paired verification fetched 100 files, matched 98 expected hashes, passed both frozen downloaded-code workflow sets and returned HTTP 200 for sample artwork. Evidence: release-staging/20261108-shared-juggle/live-verification.json. No new browser visual QA is claimed for this release. Both applications now serve the common juggle budget. Next milestone is independent projectile lifetime; the overall goal remains active. Continue development directly on the SSD as explicitly requested despite the fragile cable.

### Explicit collision sources — local foundation

Arena prepareCast(owner, target, cast) now builds collision snapshots from an explicit source; prepare remains the existing active-cast wrapper. This avoids swapping fighter.cast, which controls action availability and defense/cancel windows. Three regressions verify detached-source damage without restoring the owner action, preserving a newer move through old-source expiry, and independent recipient guard evaluation. Full suites pass: 298 Arena / 1140 Studio. Logs: /private/tmp/projectile-source-arena.txt and /private/tmp/projectile-source-studio.txt.

This refactor is local, unpublished and does not yet enable persistent projectiles. Next: entity lifecycle/registry and collision collection, render integration, interruption/defeat/reset/expiry rules, then versioned Studio authoring and bank support with preview parity. Live release remains 20261108-shared-juggle.

### Independent projectile runtime — local, not authorable yet

Added ProjectileRegistry with explicit launch after startup, 1–600-frame lifetime, 16 concurrent entities per owner, duplicate-cast protection and expiry/defeat/reset cleanup. Arena includes independent sources in the same pre-resolution collision snapshot as fighter attacks, preserves owner recovery independently of contact travel, and allows another owner move while the projectile travels. Existing definitions retain cast-owned behavior. The internal launchProjectile boundary is not yet invoked by imported definitions or editor controls.

Rendering now draws independent effects/debug boxes from their own cast state and skips the duplicate owner-cast drawing. No browser visual verification of independent effects yet. Parrying an independent entity destroys it without remotely interrupting a newer owner action; old cast-owned parry behavior is preserved. Current damage uses owner stats/status at contact, as before; ownership/reflection policies remain unfinished.

Thirteen lifecycle regressions cover interruption, subsequent owner moves, expiry/pause, reset, either fighter defeat, bounds/duplicate launches, startup cancellation, simultaneous lethal trade, parry, spawn cap, legacy lifetime preservation and attached multi-hit completion. Full suites passed 311 Arena / 1140 Studio; the final Arena run is recorded in /private/tmp/projectile-lifecycle-arena.txt. Studio log: /private/tmp/projectile-lifecycle-studio.txt.

Next: versioned lifetime fields and automatic launch scheduling, shared Studio preview semantics, comparison replay/unfinished detection, bank capability migration, authoring controls and browser rendering QA. Do not publish or advertise persistence as usable before these are connected. Live release remains shared-juggle.

### Version 7 lifetime and automatic launch — local, unpublished

Independent lifetime is now represented by optional projectileLifetime (integer 1–600) on damage/push projectiles. Presence requires container version 7; older formats cannot silently carry it. Independent travel begins at startup; conflicting projectileStart is rejected. Projects, local banks, skill trees and Arena catalog validation support version 7. Classroom clients negotiate version 7 only when advertised and reject saving to the current version 6 server before PUT. Server migration remains outstanding.

Arena automatically registers eligible casts at startup before simultaneous collision snapshots. Startup interruption cancels launch; later interruption does not remove the entity. Owner defense/recovery uses fixed owner timing rather than contact-delayed projectile timing. Launch failures emit a reason and cannot fall back to ordinary cast-owned damage. Studio ordinary/sequence previews now distinguish launch from interruption, obey lifetime and owner death, and return independent owner next-cast timing. Diagnostics describe version/lifetime boundaries.

Full suites pass: 320 Arena / 1145 Studio (/private/tmp/projectile-v7-arena.txt and /private/tmp/projectile-v7-studio.txt). New tests cover v7 local round trips, malformed fields/older containers, safe classroom rejection, ordinary/sequence preview expiry and pre/post-launch interruption. Four Arena/preview parity scenarios verify actual automatic launch hit totals and damage. Rendering is integrated but not browser-verified for independent entities.

Remaining before release: editor lifetime controls and history/Quick Edit handling, comparison projectile replay/unfinished reporting, classroom server version 7 migration, expanded death/simultaneous/cap-limit integration tests, browser visual checks, cache changes, publication and live verification. Preserve concurrent skill-tree UI work. No new publication this turn; shared-juggle remains live. Overall goal active.

### Persistence authoring and comparison replay — local, unpublished

Studio now shows Projectile lifetime for damage/push projectiles. Designers choose End with the move or Keep traveling after launch, then set 1–600 frames (default 120). The help explains startup, linked travel start, defeat/parry removal, active-duration limits and version 7 saving. Changing delivery refreshes contextual controls. Turning persistence off is required before incompatible delivery changes. Enabling removes a separate projectileStart after explaining the link. The shared edit/history path preserves hit definitions. UI workflow verifies enable/edit/invalid value/save/reload/disable/undo.

Arena comparison now records detached projectile IDs, owner, name, remaining maximum lifetime and copied bounds in each replay frame. The canvas draws the bounds and labels them as bounds; they are not claimed to be artwork or exact nonrectangular shapes. A test remains unfinished while entities travel after owner recovery. Regression verifies advancing, independent snapshots and expiry removing unfinished status.

Full suites: 321 Arena / 1146 Studio passed. Logs: /private/tmp/projectile-ui-arena.txt and /private/tmp/projectile-ui-studio.txt. No publication or browser visual QA of these changes yet. Next: classroom server v7, explicit Quick Edit persistence coverage, preview VFX/pose lifetime review, browser QA and paired release verification. Broader goal remains active.

### Independent preview visual state — local, unpublished

Ordinary and sequence simulation frames now expose ownerActive and projectileAlive independently. Studio uses those states to stop independent projectile VFX on expiry/removal and return the owner to standing after action completion/interruption. Its phase distinguishes a traveling projectile from owner recovery. Synced pose timing for independent projectiles uses startup rather than delayed contact, shared with Arena. Existing cast-owned pose timing is preserved. Debug hitbox editing guides remain available after expiry; they are editor guides, not active collisions.

Added tests for owner recovery while travel continues, exact visual expiry boundary, independent-vs-legacy pose timing, and Quick Edit retaining lifetime while expanding five hits to six. Full suites pass: 323 Arena / 1148 Studio. Logs /private/tmp/projectile-visual-arena.txt and /private/tmp/projectile-visual-studio.txt. Browser-rendered verification is still outstanding; tests do not establish visual QA.

Next: classroom-server version 7 support and anonymous server tests, browser checks, expanded runtime edge cases, cache/deployment preparation and live verification. No persistence publication yet. Overall scope remains active.

### Classroom server version 7 support deployed

Opened the existing public Sites source at 0bf3b121ddd3403096d417870c804c1422cc24cc before editing. Added the mirrored projectile-lifetime validator and version 7 capability/header/container checks while retaining revision CAS and older-client protections. Eleven anonymous in-memory attack-bank tests passed, covering persistent roundtrip, malformed values, mismatched startup, stale writes and version 6 read/overwrite rejection. Production build passed. No live classroom bank contents were read or written.

Published source 65a82faf11f8adacbb355923b6ea594d3249783b; saved Site version 60: appgprj_6ac1778cd32081918ba530bb3c83b9d6~appgver_9eef6600b3048191b82a51d3db177176. Deployment appgdep_6af0b34c71e08191a0838070b089a092 succeeded at https://cyber-pet-classroom-settings.ragingaxolotl.chatgpt.site. Archive /private/tmp/combat-classroom-v7.tar.gz. Existing audience preserved. Backend code remains at /private/tmp/combat-classroom-source using the Sites source workflow; combat app edits remain directly on SSD.

The server now supports version 7. Client persistence authoring/runtime remains local, not published. Next: browser QA and edge-case checks, paired client release preparation/publication/live verification. Overall combat/editor goal remains active.

### Local browser persistence-control check and layout correction

Created one unbanked anonymous Stone strike draft through the local Studio UI, generated five hits, enabled persistence and keyboard-edited lifetime to 181. Compatibility text updated to 181 and the draft recovered in a fresh tab. No classroom login/save occurred; existing working attacks were preserved. Browser screenshot exposed a 177.75px half-column lifetime fieldset. Added scoped projectile-lifetime-editor styling spanning the inspector grid; fresh-page inspection confirms grid-column 1 / -1 and 373.5px width with readable labels/help. Updated local cache keys for design CSS/JS and new editor module. Reload/navigation in the dirty original tab did not load fresh assets; a new tab verified corrected files.

Current Studio also contains concurrent workspace/docking changes (studio-workspace.css and a restructured design.html) beyond this persistence task. Preserve them and reconcile against remote before scoped publication; do not bulk-publish or overwrite them blindly. Screenshots were viewed through browser tools but not saved as standalone artifacts. This proves desktop lifetime-control rendering and keyboard edit/recovery only, not mobile, independent VFX in Arena or full browser parity. Targeted persistence UI workflow passes after styling; latest full suites remain 323 Arena / 1148 Studio.

Next: complete remaining browser/runtime release checks, reconcile publication scope with concurrent workspace edits, publish paired clients and verify live files. Server v60 already supports version 7. Overall goal active.

### Persistence clients pushed — deployment in progress

Prepared a reviewed Studio release using published bc7de02 as baseline, overlaying persistence files only. The local workspace import/init and redesigned HTML were excluded from the release copy; canonical local files remain intact. Published CSS includes the full-width lifetime panel. Unrelated skill-tree UI/dataset edits remain local. Source staging: release-staging/20261108-persistence/studio/. Scope and baseline receipts are alongside it.

Arena full release suite: 323 passed. Exact staged Studio release suite: 1143 passed, excluding the five concurrent workspace/dataset tests not represented by this release. Initial staging failed due to omitted review fixtures; linked fixtures and reran successfully. No tests were weakened. Frozen tests in test-snapshot/.

Arena commit 9ffc42ea3c0fa5f65ad81cf70741dfd131d99916 pushed; Pages run 42506293349 in progress. Studio commit 176afb5f4032069ea55c30b42b35ff4bc7911d29 pushed, 56 scoped files, unrelated repository roots preserved; Pages run 42506304706 in progress. Release/cache key 20261108-persistence. Version 7 metadata now advertises independent lifetime. Server v60 already deployed.

Prepared /private/tmp/verify_combat_persistence.py with pinned Arena source hashes, scoped Studio manifest plus sample hash, frozen downloaded-code workflow tests including projectile-format/lifecycle/editor tests. Remaining: poll those exact deployment jobs, run paired verifier, inspect live UI as needed. Do not claim clients live-verified yet. Overall goal active.

### Persistence Arena verified; Studio still deploying

Arena Pages run 42506293349 succeeded. Standalone verification matched all 44 published JS/CSS/HTML/JSON files to 9ffc42ea3c0fa5f65ad81cf70741dfd131d99916, and downloaded-code tests including projectile lifecycle/format/source, comparison, juggle and C-slot workflows passed. Evidence release-staging/20261108-persistence/arena-live/verification.json.

Studio run 42506304706 has a completed build and an in-progress deploy job (overall API status queued). Do not restart. Next poll that handle, then run /private/tmp/verify_combat_persistence.py. Paired live verification and live browser persistence checks remain pending.

### Persistence release fully verified on both live clients

Studio run 42506304706 completed successfully. Paired verifier fetched 103 files, matched 101 expected hashes, passed frozen Arena and Studio workflows against downloaded code (including persistence format, lifecycle, authoring/history and comparison), and fetched sample artwork HTTP 200. Evidence: release-staging/20261108-persistence/live-verification.json with per-file hashes and separate live-test logs.

Published persistence now spans Arena 9ffc42ea3c0fa5f65ad81cf70741dfd131d99916, Studio 176afb5f4032069ea55c30b42b35ff4bc7911d29, classroom server v60. Browser desktop control layout/edit/recovery was checked locally; live browser behavior and narrow-layout checks are not yet verified. Next: live-browser confirmation and further planned projectile mechanics, with explicit ownership/collision rules before reflection/durability. Full editor/combat objective remains active.

### Live Studio persistence controls checked

Opened published design.html?release=20261108-persistence in the in-app browser. Created a new unbanked Stone strike draft and five-hit sequence, enabled independent persistence, and used ArrowUp to change lifetime 120→121. Live diagnostics displayed 121. Explicit UI Undo restored 120 and Redo restored 121. Read-only layout inspection confirmed grid-column 1 / -1 and 247px width in the published inspector; screenshot viewed. No bank sign-in/save or existing-draft modifications were performed. Screenshot was not exported as a standalone file.

This verifies live desktop authoring/history controls, not an authenticated bank roundtrip or all projectile visuals. Next combat extension remains durability/reflection, which requires explicit projectile-vs-projectile/attack collision rules, ownership transfer and bounded rehit policy; existing ordinary fighter trades must remain unchanged. Remaining full goal includes general sequences, expanded combos/defense, editor timeline/workspace improvements and broader accessibility/mobile checks.

### Projectile-interaction geometry — local foundation

Added shared shapesOverlap for every rectangle/ellipse/diamond/triangle pairing, including mirrored triangles. Polygon pairs use separating axes; ellipse/polygon uses unit-circle normalization and segment distance; ellipse pairs use a bounded closest-point solve instead of a polygon approximation. Touch-only boundaries do not connect (ellipse numerical tolerance 1e-12 in normalized squared distance). Existing shapeHitsRectangle remains unchanged, so ordinary fighter hit behavior is preserved.

Twenty regressions cover all pairings and symmetry, separate/touching bounds, corner false positives, containment, crossings, mirrored tips, unequal ellipse radii and diagonal circular tangency. Full suites passed 343 Arena / 1170 Studio; the Studio total includes two additional concurrent workspace tests beyond the previous count, not new persistence scope. Logs /private/tmp/projectile-geometry-arena.txt and /private/tmp/projectile-geometry-studio.txt. Shared source and tests copied to both apps.

This helper is local/unpublished and not yet connected to projectile clashes. Next: deterministic pair collection, per-pair contact tracking/durability resolution, ownership/reflection rules, versioned authoring and preview parity. Persistent-projectile release remains live. Overall objective active.

### Deterministic durability clashes — local runtime only

Added shared ProjectileClashes resolver using authored shape overlap. Both entities must opt into positive integer durability; same-owner/unconfigured sources pass through. Each pair spends one point on entering contact, not every overlapping frame; separation permits recontact. Multiple hitboxes do not multiply pair costs. Contacts are collected before losses/destruction, sorted by stable entity ID, preserving one-to-many simultaneous outcomes without input-order bias. Resolver returns remaining durability and destroyed IDs without mutating input snapshots.

Arena feeds projectile snapshots into the resolver before fighter-hit consequences, removes destroyed sources, emits CLASH and suppresses their fighter damage that frame. Surviving projectiles retain their existing hit behavior. Dummy reset/round end clear pair history. Durability is not yet populated from saved attacks or exposed in Studio; no new format is advertised.

Six shared resolver tests cover equal/unequal durability, sustained contact/separation, multi-contact order, grouped hitboxes, friendly/unconfigured/geometry exclusions and reset. Three actual Arena tests prove equal cancellation, survivor damage and unchanged unconfigured trades. Full suites pass: 352 Arena / 1176 Studio. Logs /private/tmp/clash-arena.txt and /private/tmp/clash-studio.txt. All changes local/unpublished. Next: versioned durability validation/authoring/server support, comparison reporting and preview explanation; reflection still requires owner/target/hit-ledger policy. Overall objective remains active.

### November 8 — local durability authoring milestone (not published)

Projectile clash geometry and simultaneous durability resolution are implemented locally. Opposing projectiles must both opt in; each new contact spends one durability, continuous overlap spends once, and zero removes the projectile before fighter damage. Comparison reports participants and remaining durability. Existing projectiles keep their behavior.

Attack format version 8 adds optional integer `projectileDurability` (1–10), requiring independent lifetime. Studio now exposes clash mode and durability, validates edits, removes clash settings when persistence is disabled, and restores them through undo. Single-attack preview explicitly explains that it cannot test opposing-projectile clashes.

Validation: 353 Arena and 1,177 Studio tests passed, including shared parity, comparison outcomes, versioned project/bank round trips, and editor save/undo/input validation. Browser verification for these new controls has not yet been performed.

Still required before publication: classroom server version-8 capability/validation and anonymous round-trip tests; browser QA; scoped release preparation preserving concurrent workspace UI work; publication and live hash verification. Current verified live release remains `20261108-persistence`. Further report scope (reflection, other projectile behaviors, movement cancels, advanced combat/editor/accessibility improvements) remains open.

### November 8 — classroom durability support published

Classroom server version 61 deployed successfully (source `0761149035cbe6e7caf63a222bb51ae94027ff68`). Live read-only capabilities advertise attack/bank versions 1–8. Twelve anonymous in-memory server tests pass, including version-8 durability round trips, invalid field rejection, revision conflicts and older-client overwrite protection. No real classroom bank was accessed. Evidence: `release-staging/20261108-durability/classroom-server.json`.

Arena/Studio durability changes remain local and tested, not yet published. Next: browser verification, scoped release preserving concurrent workspace edits, deployment and live verification.

### November 8 — durability release publication in progress

Browser QA on local Studio confirmed enabling persistence/clashes, changing durability 1→2 by keyboard, undo to 1 and redo to 2. A contradictory version-7 hint was corrected to show version 8 when clashes are enabled; editor regression passed afterward. Local preview displayed an artwork-load warning; visual artwork parity is not claimed. No classroom draft was saved.

Reconciled latest Studio main `20ed47e07456c57f78f82d62955521e1e893ef21`, preserving the newly published workspace panels and tree tools. Staged release passes 1,177 Studio tests; Arena passes 353. Published Arena `198a65063aa717b250779316dfe8959b188299a8` (Pages run 42507429562 succeeded) and Studio `3eda531563e0c42e50a2ed5e4d4aab69506c56b7` (Pages run 42507432987 still in progress at last check). Studio publication preserves unrelated repository roots.

Next: poll the existing Studio deployment, run `/private/tmp/verify_combat_durability.py` against live files, address any failures, and verify live browser behavior. Evidence and frozen tests are in `release-staging/20261108-durability`. Do not claim the paired release verified live yet.

### November 8 — durability release verified live

Both Pages deployments succeeded: Arena run 42507429562 at `198a65063aa717b250779316dfe8959b188299a8`, Studio run 42507432987 at `3eda531563e0c42e50a2ed5e4d4aab69506c56b7`. Live verification fetched 109 files, matched 106 expected hashes, passed both downloaded-code workflow suites, and loaded the sample effect (HTTP 200). Live browser QA confirmed persistence/clash controls, keyboard durability 1→2, undo→1 and redo→2, with desktop visual inspection. No classroom-bank writes. The local artwork warning was traced to a missing local `/reference-assets/movement/Walking.png` (HTTP 404); it is not evidence of a live release failure.

Evidence: `release-staging/20261108-durability/live-verification.json`, `arena-live-tests.txt`, `studio-live-tests.txt`, `studio-publication.json`, and `classroom-server.json`. Current paired release: `20261108-durability`.

Remaining: live Arena browser clash scenario and mobile/accessibility coverage; projectile reflection/absorption and ownership tracking; other advanced projectile behaviors; movement cancels; hitstop/blockstun/scaling; broader timeline/authoring work and authenticated anonymous classroom-bank browser round trip. Full overall goal remains open.

### November 8 — live Arena clash scenario and help correction

Live browser comparison verified anonymous imported projectiles at 100 px over 20 frames: A durability 2 vs B durability 1. Frame 0 log showed A with 1 durability left and B destroyed; frame 2 showed B taking 10 damage, A losing no HP. Live keyboard deck also exposes C: Quick jab. No real classroom data was used.

Corrected outdated loadout help to list Z X C and replaced “Clashing is not implemented yet” with the implemented opt-in durability rules. Twelve targeted Arena UI/C-slot/comparison tests passed. Copy correction pushed as `d96782e684e8cc1712aac2e6603f190f6fafb026`; deployment run 42507748834 was in progress at last check. Next: verify that deployment and live HTML.

Reflection design investigation: current collision positions use cast origin/facing and owner stats; ownership changes therefore need a preserved world position, new travel direction, explicit hit-ledger reset policy and tests for repeated reflections/attached sequences. Do not implement reflection merely by swapping owner/target, which would teleport projectiles or inherit incorrect timing. Reflection/absorption remain unimplemented.

### November 8 — verified help deployment and reflection geometry foundation

Arena help correction deployment 42507748834 succeeded. Downloaded live HTML exactly matches `d96782e684e8cc1712aac2e6603f190f6fafb026`, including C and projectile-clash help. Evidence: `release-staging/20261108-durability/arena-help-live.html`.

Locally added shared `projectile-reflection.js`: composable horizontal transforms preserve the primary collision bounds at reflection, mirror subsequent horizontal path motion, retain vertical motion, and mirror grouped shapes/direction. Five tests per app cover first/repeated reflection, grouped shapes, leftward travel and invalid geometry. Full suites pass: 358 Arena / 1,182 Studio.

This is geometry groundwork only, not a usable reflection mechanic and not published. Next integrate entity ownership/target changes, immutable launch stats, hit-ledger rules and reflected rendering; then defensive windows, absorption, Studio preview/authoring, versioned server transport and release validation. Do not advertise reflection as implemented until those paths work together.

### November 8 — local reflection runtime integration

Arena now has an internal `reflectProjectile(entity, defender)` operation. It preserves world position, entity ID, remaining lifetime and durability, switches owner/target, creates independent per-leg hit/sequence tracking and leaves the original owner action untouched. Launch stats and weakening multiplier are captured for independent projectiles, so reflection does not substitute the defender's stats. Eight reflections are allowed; a ninth removes the projectile. Attached sequences detach at the current target position before traveling back. Collision preview/replay uses the shared transform; effect and hitbox rendering now account for it.

Five Arena runtime tests cover returning damage, stat preservation, repeated-reflection limits, invalid/retired entities, isolated hit history and attached detachment; geometry tests remain shared. Full suites pass: 363 Arena / 1,182 Studio. This work remains local and uncommitted; reflection is not yet an authorable defense and is not published.

Next: wire reflection/absorption into frame-specific defensive windows and collision resolution with clear precedence, add versioned authoring/server support and Studio preview parity, test reflected grouped/attached trajectories and rendering in browser, then publish. Review the launch-stat capture change for Studio parity before release. Existing live release remains durability plus the verified Arena help correction.

### November 8 — local projectile-defense windows and authoring

Added `reflect` and `absorb` defensive windows with 1–10 charges, projectile-only filters and frame windows. They affect independently launched damage/push projectiles. Collision order is dodge/invulnerability, projectile defense, parry, guard, armor. Absorption removes the projectile without a resource reward. Reflection uses the tested ownership/position operation. Both ordinary and sequence contact paths invoke these defenses.

Version 9 container checks prevent older exports from silently losing these windows. Studio provides add/delete/edit controls, fixed projectile filters, save/reload and undo, and explicitly directs projectile tests to Arena comparison because its incoming-hit probe is melee-only. Local full suites: 367 Arena / 1,183 Studio pass.

Not published. Classroom server currently supports only versions 1–8; version-9 bank writes must remain rejected until server validation/capability support is deployed. Next: expand charge-exhaustion, grouped/sequence/reflection-limit and render tests; resolve launch-stat parity; add server version 9; browser QA and scoped release. Reflection/absorption are locally authorable but not yet release-ready.

### November 8 — projectile-defense edge cases and reports

Added per-frame projectile-defense results to Arena comparison, including defender, projectile, Reflected/Absorbed/Reflection limit, and remaining charges. Sequence hit reports no longer mislabel the reflection limit as absorption. Tests verify charge exhaustion, expired windows, legacy cast-owned exclusions, and reflected/absorbed three-hit sequences (21 returning damage on reflection).

Preserved pre-reflection weakening behavior: weakness remains dynamic while the projectile belongs to its original attacker; its current multiplier is captured when reflected, rather than substituting the reflector's status. Launch stats remain captured. This supersedes the earlier note that weakening was captured at launch.

Full suites passed at 372 Arena / 1,183 Studio; after the weakening adjustment, all 23 targeted defense/reflection/status-parity tests passed, including one newly added weakening regression (Arena suite now contains 373 tests). Local only. Next: classroom-bank version 9, grouped/reflected rendering browser QA, release staging and verification.

### November 8 — classroom projectile-defense support live

Classroom server version 62 deployed successfully at source `08079e4b9d5cfc5ecbd2915afa2494d9a997134d` (deployment `appgdep_6af0ba99dcac819190b8a5ffb12e8152`). Live capabilities advertise attack/bank versions 1–9 and reflect/absorb defense kinds. Fourteen anonymous in-memory server tests passed, including both new window kinds, invalid-field rejection, stale revisions and old-client overwrite protection. No real classroom bank was accessed. Evidence: `release-staging/20261108-projectile-defense/classroom-server.json`.

Arena/Studio reflection and absorption remain local. Next: browser-check editor controls, reflected/grouped hitboxes and artwork; reconcile latest remote Studio edits; stage and test release; publish and verify live code.

### November 8 — local browser defense check and grouped reflection fix

Fixed attached reflected groups: horizontal offsets and triangle facing now mirror around the current target, including after that target moves. Attached effect offsets also use reflected facing. Added a regression for the grouped triangle geometry.

Local Arena served on port 8768 from canonical `site/` (server session 43158). Browser imported anonymous `/private/tmp/cyber-pet-reflection-demo.json`. Comparison at 200 px / 60 frames: reflection at frame 12, original attacker receives 7 damage at frame 25; absorption at frame 12, neither fighter loses HP. Both reports show 0 remaining defense charges. Screenshot visually inspected schematic replay; artwork rendering remains unverified. An initial duplicate-ID fixture error was corrected before the successful runs.

Full Arena suite passes 374 tests. Studio: 1,182/1,183 pass; failure is concurrent tree-zoom work (`dist/tree-zoom.js` minimum now .01, `tests/tree-datasets.test.mjs` still expects .25). Do not overwrite or silently include that unrelated change. Remote Studio remains `3eda531563e0c42e50a2ed5e4d4aab69506c56b7` at last check. Stage the combat release from verified remote and overlay only combat files.

Next: browser check Studio defense controls and artwork; scoped stage/tests, publish both apps and verify. Version-9 server is already live. Local reflection/absorption game/editor code remains unpublished.

### November 8 — projectile-defense release staged and editor browser QA

Browser checked local Studio on port 8767 using an anonymous new draft: added reflect, changed hit limit 1→2 by keyboard, undo→1, redo→2, added absorb. Both attack-type selectors remained disabled at Projectiles. No classroom-bank writes.

Prepared scoped release `release-staging/20261108-projectile-defense/studio/dist` from remote baseline `3eda531563e0c42e50a2ed5e4d4aab69506c56b7`, overlaying only attack-bank, attack-format, combat-model, skill-tree-model, defense-windows, defense-editor and projectile-reflection. Unpublished concurrent tree-zoom work is preserved outside the release. All 1,183 staged Studio tests pass; all 374 Arena tests pass. Both manifests/cache keys are prepared for `20261108-projectile-defense`, versions 1–9.

Still not published. Remaining release checks: animated reflected artwork browser verification (schematic reflection/absorption and editor controls already checked), freeze final test snapshots, publish scoped Studio and Arena changes, verify deployments and downloaded live code. Scripts: `/private/tmp/stage_projectile_defense.py`; prior publication/verifier scripts can be adapted with new baseline/release/commit IDs. Do not re-stage over changes without reviewing concurrent remote state.

### November 8 — projectile-defense publication started

Extracted production effect renderer into `site/effect-renderer.js` and added tests for reflected and attached effect transforms. Browser QA fixture `/private/tmp/cyber-pet-reflection-qa` uses actual Arena simulation, the production renderer and an existing electric effect sprite: inspected animation frames 43 (before reflection, facing +1) and 44 (after, facing −1) with collision bounds. This verifies the immediate visual transition, not every animation frame or mobile layout. Fixture server port 8769/session 5653; Arena server port 8768/session 43158. No QA fixture is published.

Final Arena suite: 376 pass. Staged Studio suite: 1,183 pass. Published Arena commit `0999592366290e8dba5c30a568a374dc5490d687`, Pages run 42508957892 in progress; Studio commit `1447de0f34a2943d59cb88f31f5d591abb43396f`, Pages run 42508955407 in progress. Studio preserved unrelated roots and excluded concurrent local tree-zoom edits.

Next: poll those same deployments; run `/private/tmp/verify_combat_projectile_defense.py` after both succeed, address live verification failures, and live-check new controls. Frozen tests and publication evidence are in `release-staging/20261108-projectile-defense`. Do not claim live verification yet.

### November 8 — projectile-defense release verified live

Arena Pages run 42508957892 and Studio run 42508955407 both succeeded. Paired verification fetched 112 files, matched 109 expected hashes, passed both downloaded-code workflow suites (including reflection/absorption and editor tests), and loaded the sample effect (HTTP 200). Current paired release: `20261108-projectile-defense`; Arena `0999592366290e8dba5c30a568a374dc5490d687`, Studio `1447de0f34a2943d59cb88f31f5d591abb43396f`. Classroom server version 62 supports version 9.

Live browser tests: anonymous version-9 project import; reflect at frame 12 then original attacker takes 7 damage at frame 25; absorb at frame 12 with neither fighter damaged. Live Studio successfully adds reflection and absorption windows with fixed projectile-only filters. No real classroom-bank write. Evidence: `release-staging/20261108-projectile-defense/live-verification.json` and frozen live test logs.

Known limits: reflection/absorption affect independent projectiles only; absorption has no resource reward; reflection allows 8 ownership changes before removal. Single-hit Studio incoming probe remains melee-only; use Arena comparison for projectile defenses. Visual QA covered immediate production-renderer reflection frames, not every artwork or mobile layout.

Next scope remains broad: mobile/keyboard/accessibility checks, authenticated anonymous bank browser round trip, projectile homing/return/splitting/explosion and wider piercing/area behavior, general independent melee events, movement cancels, hitstop/blockstun/scaling, expanded timeline editing and reusable behavior tools. Concurrent local tree-zoom edits remain preserved and excluded from this release. Overall goal remains active.

### November 8 — phone-width Studio overflow fix

Browser viewport audit at 390×844: Arena fits (document width 375); published Studio overflowed to 509px due to intrinsic-width stacked workspace columns. Added a narrow mobile CSS rule constraining each column to 100% width. Local browser verification: all three columns 351px, document 375px at 390px viewport; no substantial nested overflow (one 4px path-panel discrepancy). Reset viewport afterward.

Published only remote-based `studio-workspace.css` and its cache-key reference in `design.html`, preserving concurrent local tree-zoom changes. Commit `a9dd53b9f25a17f2a59c077ed80fed3df65e9379`; Pages run 42509306774 was queued at last check. Evidence files in `release-staging/20261108-mobile-width`. CSS-only change verified in browser; no new behavioral tests added.

Next: verify this deployment/live phone layout; continue keyboard/focus/touch usability audit. Reflection/absorption release remains verified live.

### November 8 — keyboard focus check and fullscreen ninth slot

Live Arena keyboard audit: opening comparison focuses Fighter A; Escape closes the dialog and restores focus to Compare two attacks. Found fullscreen attack grid still declared 8 columns despite 9 slots. Updated to 9 columns, with 3-column narrow-screen layout; local browser computed nine equal columns and nine buttons. Browser fullscreen-state introspection was inconsistent, so this does not certify all native fullscreen behavior. Exited/closed test tab.

Published Arena layout correction commit `e58ac6c` (deployment to be verified). Studio mobile correction run 42509306774 remains in progress at last poll; keep polling that job, do not restart. Next: verify both layout deployments and live mobile width. Touch audit also found no dedicated movement/guard touch controls; that remains an open usability item, not a completed mobile play experience.

### November 8 — mobile layout live and touch controls local

Studio mobile deployment 42509306774 succeeded; both published files match their release copies. Live 390px browser viewport now reports document 375px and three 351px columns. Arena fullscreen-layout deployment 42509438482 also succeeded (native fullscreen behavior remains only partially inspected).

Added local `touch-controls.js` and movement/jump/crouch/guard/dodge buttons inside Arena shell, visible for coarse pointers or narrow widths. Input uses separate pointer ownership, merges with keyboard input, clears on pause/reset/start, releases on cancel/lost capture, and supports keyboard hold activation. Tests cover multi-finger ownership and cleanup.

Local browser at 390px exposes all six controls; a held Move right press released with aria-pressed=false; Dodge reported success. Paused practice and reset viewport. This is not a physical-device multi-touch certification. Full Arena suite 379 pass; frozen Studio release suite 1,183 pass (concurrent canonical tree-zoom mismatch still separate). Touch controls remain local/unpublished. Next: strengthen event-level cancellation/keyboard tests, verify movement visually and responsive button layout, then publish and live-check.


### November 8 — touch controls published and verified
- Arena commit `694b2287a76f76128c7d8f4d1a15eb6e34c98cf2`; Pages run42509728247 succeeded.
- Six mobile controls: left/right, jump, crouch, block and dodge. Independent pointer ownership; release/cancel/pause cleanup. C remains ninth attack beside X.
- 384 Arena tests passed. All48 downloaded live source files matched commit; downloaded-code regression tests passed.
- Live390px browser: controls rendered, hold/release and Dodge worked, pause worked, no horizontal overflow or stuck pressed controls. Physical-device multitouch remains unverified.
- Studio unchanged by this release; last scoped published Studio suite1183 passed. Canonical concurrent tree-zoom mismatch remains separately documented.
- Next: keyboard/focus and mobile error-recovery audit; anonymous authenticated classroom-bank round trip still outstanding. Advanced combat/editor roadmap remains incomplete.


### November 8 — input recovery audit
- Added application-level regression coverage for held movement+block cleanup on window blur, hidden tab, loadout entry and restart; late pointer releases remain harmless. Native text/select arrow handling is preserved.
- Current full suites: Arena385/385, canonical Studio1192/1192 passed. The previously observed Studio zoom-test mismatch is no longer present in the current worktree; no Studio files changed in this audit.
- This milestone adds regression evidence, not a new runtime feature. Published touch-controls release remains694b2287. Physical multitouch and authenticated classroom-bank browser testing remain outstanding.


### November 8 — attack import recovery
- Commit8310637e68f3f6f996f504e93b0ce76b9cb9ea0b pushed to main. Pages42510111104 queued at last check; live delivery and browser QA pending.
- Malformed JSON and browser quota errors now provide actionable recovery instructions.
- Application-level tests prove malformed, oversized, unsupported-version and quota-failed imports preserve storage and existing slots, clear the file input for retry, and allow a subsequent valid import.
- Full suites: Arena386/386; canonical Studio1192/1192. No Studio runtime changes.
- Next: verify this exact Pages job and live import messages; continue remaining accessibility, classroom-bank and combat/editor scope.

- Import-recovery release verification completed: Pages42510111104 succeeded; 48 live files matched8310637; downloaded-code regression tests passed. Live browser malformed-file selection displayed the actionable message with nine attack slots preserved. Quota failure remains harness-tested, not browser-induced.


### November 8 — classroom response recovery (local, not published)
- Both attack-bank clients now clear expired sessions on HTTP401 even if a proxy returns HTML instead of JSON; parsing errors retain status and explain keeping edits open/exporting a backup.
- Null/empty409 error responses now explain concurrent classroom edits. Writes are not automatically retried after an uncertain response.
- New matched regression scenarios: malformed401/502/200 and409 fallback; preserve caller bank and verify one request only. Full suites390 Arena /1196 Studio pass.
- Pending: paired scoped publication/cache keys and live verification. This does not replace the outstanding authenticated anonymous classroom-browser round trip.

- Bank-recovery publication submitted: Arena d31d097, run42510307819; Studio2f6b2c8, run42510301692. Both in progress at last check. Studio scoped to3 remote-based files;14 staged bank tests pass. Live verification pending.

- Paired bank recovery live delivery verified: Arena48 files and downloaded regression suite; Studio3 scoped files and14 downloaded-client bank tests. Both deployment jobs succeeded. No authenticated browser round trip claimed.


### November 8 — fixed sequence clock foundation (local only)
- Shared sequenceState optionally accepts an explicit start frame; opportunity scheduling then uses this fixed origin while contactFrame records actual first connection. Omitted origin preserves contact-relative projectile behavior.
- Four matched tests per app cover missed opening/later hits, no duplicate events, target eligibility, interruption, legacy contact timing and invalid origins.
- Full suites394 Arena /1200 Studio pass. No new melee/area definitions are accepted or exposed yet. Existing runtimes still construct default contact-relative state.
- Next required integration: version10 schema/timing validation, Arena+preview fixed-clock lifetimes/geometry, defensive outcomes, editor controls/presets, transport/server negotiation and live verification. Do not publish this foundation as completed melee/area support.


### November 8 — scheduled melee/area simulation integration (local only)
- Explicit sequenceTiming=cast supports timed melee/area damage sequences; offsets count from effective startup, independent of contact. First event may be delayed. No projectile attachment mode is accepted for these definitions.
- Arena and shared preview now use fixed sequence origin for group geometry and cast lifetime; block/dodge/invulnerability do not cancel the entire scheduled series. Parry/interruption still cancel.
- Version classifier requires10 and rejects these fields in older envelopes. Version10 container/import/editor/server enabling is still pending, so this is not yet a usable published feature.
- Eight cases per suite cover melee/area, both facings, opening hit/miss, delayed later hits and finite recovery; Arena compares each frame to preview. Full suites402 Arena /1208 Studio pass.
- Next: dedicated defensive/reaction/interruption tests, diagnostics and authoring controls, version10 transport/server capabilities, browser QA and paired publication.


### November 8 — scheduled defense and motion verification
- Added Arena coverage for all-hit guard, expiring invulnerability, one-charge armor and parry interruption. Shared preview verifies guarded continuation and incoming-damage cancellation.
- Four60-frame motion comparisons cover launch/suspend/knockback for melee/area in both directions, checking HP and both motion axes.
- Full suites411 Arena /1208 Studio pass. Existing Studio tests unchanged in this step. New feature remains local/unpublished.
- Next transport audit located version allowlists in catalog, matchup, combat-model, attack-bank and skill-tree-model; these must accept version10 together, while older envelopes reject scheduled fields and remote writes remain capability-gated. Then editor/diagnostics and server deployment.


### November 8 — version10 transport (local only)
- Project, local bank, catalog and skill-tree readers accept version10. Legacy envelopes reject scheduled fields. Mixed legacy/scheduled definitions round-trip unchanged through encoded banks, projects and trees.
- Classroom client negotiates version10 reads when advertised; writes require server bank/attack version10 and revision protection. An older server receives no PUT.
- Full suites414 Arena /1211 Studio pass; matched transport tests verify revision preservation and no caller mutation. Server remains v62/version9 and has not been changed in this step.
- Next: sequence-editor currently forces projectile creation and attachment UI; add melee/area presets and timing controls without converting delivery silently, update diagnostics/Quick Edit and then server validation/capabilities and scoped release.


### November 8 — scheduled sequence editor (local only)
- Sequence panel creates three-hit melee or delayed area presets without changing delivery. Projectile selection retains explicit five-hit juggling creation. Startup-relative labels/results and editable first offset replace contact language for scheduled attacks.
- Quick Edit preserves first-hit delay; returning to an ordinary attack removes sequenceTiming through the real design commit. Delivery changes refresh the sequence panel immediately.
- New editor tests cover both presets, first-offset edit, Quick Edit and ordinary conversion; existing projectile UI tests now explicitly select projectile delivery. Full suites414 Arena /1213 Studio pass.
- Diagnostics identify version10 timing and older-server limitations. Pending: timeline timing/keyboard audit, full Studio save/undo integration and browser visual QA, server version10 validation/capabilities, then paired publication.


### November 8 — scheduled timeline/save integration (local)
- First scheduled hit is no longer locked by the projectile-only timeline rule. Timeline guidance identifies startup origin.
- Full Studio workflow test creates delayed area sequence, saves version10, moves first hit, undo/redoes, removes/restores sequence and imports saved project without losing events.
- Local browser confirmed preset connects at frames35/40/45 for startup29+offsets6/11/16; ArrowRight moved first hit to36 and inspector offset7. No public release or authenticated bank test claimed.
- Full suites414 Arena /1214 Studio pass. Next: remaining UI timing consistency audit and version10 classroom-server validation/capabilities, then scoped paired publication and live QA.

- Classroom server version63 deployed successfully with version10 bank support; source254261272be4bad6fb18aae07aa7c366c3952dd6.15 anonymous in-memory bank tests and production build pass. Old-client overwrite protection preserved. No real bank contents read or changed. Client feature publication remains pending.

- Scheduled-sequence paired release submitted: Arena9eda269 (Pages42511427598), Studiob202edd (Pages42511430196). Both queued at last check. Exact staged suites414/1214 pass; Studio baseline2f6b2c8 preserved unrelated published changes. Server63 already live. Next: poll these jobs, hash-check live files, run downloaded scheduled workflows and browser authoring/import/comparison QA.

- Scheduled Arena live verified:48 hashes match9eda269; downloaded scheduled simulation/defense/transport tests pass; browser anonymous version10 import→learn→test yields3 Connected hits/21 damage. Studio42511430196 remains pending (last reported queued), not restarted. Repeatable live Studio verifier prepared at /private/tmp/verify_studio_scheduled_sequences.py.

- Scheduled sequence release fully delivered: Studio42511430196 succeeded;70 hashes matchb202edd and downloaded scheduled workflow tests pass. Live browser area creation/keyboard timeline edit verified at startup+7/frame36. Arena previously verified3 hits/21 damage. Classroom server63 supports transport. Authenticated real-browser bank round trip remains unverified; broader report scope remains active.


### November 8 — timeline zoom (local, not published)
- Shared timeline renderer now offers1×/2×/4×/8× zoom and Fit timeline. View state persists per editor root/title across rerenders and never changes attack data; horizontal scrolling is confined to timeline viewport.
- Regression verifies zoom/scroll restoration, fit reset and drag-to-frame mapping at4×. Current canonical Studio1219 tests pass (includes concurrent work; Arena runtime unchanged, last414).
- Local browser4× verified:521px viewport/2083px content; imports received fresh cache keys after initial browser still showed cached module.
- Next: scoped Studio publication and live verification; broader timeline locking/hiding/multiselection remains unfinished.

- Timeline zoom submitted as Studioadacf978, Pages42511816792 in progress. Four-file remote-based release preserves other Studio work; staged timeline tests pass. Next poll same job, run /private/tmp/verify_studio_timeline_zoom.py, and verify live4×/Fit controls.


### November 8 — timeline track controls (local only)
- Added per-track Show/Lock checkboxes in a collapsible options section; state survives rerenders without entering attack definitions. Locked controls reject keyboard/pointer edits; hidden rows retain timing/data.
- Regression covers lock, hide, rerender, show/unlock and subsequent edit; canonical Studio1223 tests pass including concurrent work. Browser QA and scoped publication remain pending.
- Earlier zoom-only release adacf978/Pages42511816792 is still in progress at last authoritative check; continue that job and verify its four frozen files before publishing track controls.

- Zoom adacf978 live verified:4 hashes, downloaded timeline tests and browser4×/Fit pass. Track controls local browser confirms locked hit disabled and hidden effect absent. Track controls submitted as263b42d, Pages42512050713 queued;4 scoped files, frozen verifier /private/tmp/verify_studio_track_controls.py. Live track controls verification pending.


### November 8 — atomic timeline selection groundwork (local)
- Added moveTimelineSelection with final-state validation so adjacent hits can move together without failing intermediate ordering. Invalid bounds, stale selections or fixed-start entries reject the transaction without changing the original attack. Duplicate entries move once.
- Three new regression scenarios plus existing timing checks pass; current canonical Studio1228 tests pass (includes concurrent work). Selection UI and single-step undo integration still pending; not published as multiselection.
- Track-control release42512050713 remains in progress at last check. Next verify this existing job; then connect selection UI to atomic operation and validate browser workflow.


### November 8 — timeline selection UI (local) and live track controls
- Added per-event selection, earlier/later buttons and1–300-frame movement; one atomic commit produces one undo step. Hidden/locked selected tracks reject group movement. Switching attacks clears selection to avoid moving unrelated events.
- Full editor regression proves three hits move together by6frames and one Undo/Redo restores/reapplies them. Current full Studio suite passed; output /private/tmp/studio-selection-ui-tests.txt. Browser QA/publication for selection remains pending.
- Track-control release263b42d/Pages42512050713 succeeded;4 live hashes and downloaded timing tests match. Live browser confirms locked hit disabled and hidden effect not visible.

- Timeline selection local browser verified: three hits36/40/45 moved to42/46/51, one Undo restored all. Four-file release23d228a submitted; Pages42512363141 queued.17 staged timing/selection/full-editor workflow tests pass. Verify same job then /private/tmp/verify_studio_timeline_selection.py and live group move/Undo.

- Timeline selection deployment update: original Pages42512363141 was superseded/cancelled. Newer publication0d9c19e4926fb636c7e4018c38ffadd637f1c156 / Pages42512458967 succeeded and preserves both timeline modules unchanged. Four live files match the newer commit; all17 downloaded focused timing/selection/editor tests pass. Local browser group move and one-step Undo previously passed; repeat live-browser selection check remains pending. Evidence: release-staging/20261108-timeline-selection/deployment-status.json.

- Live timeline selection browser verification completed:36/40/45→42/46/51; one Undo restored all three. Current overview reconciled with scheduled version10 delivery and timeline releases; group copy/paste selected as the next unfinished authoring milestone.

### November 8 — timeline clipboard groundwork (local, unpublished)
- Added timeline-clipboard.js: detached snapshots, preserved relative spacing/settings, new event IDs, complete-definition validation and rejection without partial edits. Supports existing hit, effect, defense, cancel and grouped-box entries; cross-attack transfers explicitly rejected pending reference remapping. Animation/path/main defensive window duplication remains unsupported.
- Connected Copy selected events / paste-at-frame controls to the existing commit transaction; track visibility/locks enforced. Copy/paste UI and single-step Undo still need explicit workflow/browser tests; mixed-event geometry/reference and limits coverage also pending. Do not treat the new controls as verified delivery.
- Two clipboard regression cases pass; full suites Studio1231 / Arena414 pass. Logs /private/tmp/studio-timeline-clipboard-tests.txt and /private/tmp/arena-timeline-clipboard-tests.txt. No publication yet; next finish mixed-event and Undo tests, browser QA, scoped release and live verification.

### November 8 — timeline clipboard release submitted
- Mixed-event regression covers hits, grouped boxes, defense and follow-up windows with relative clock/reference preservation. Fixed active duration extension for pasted geometry. Full-editor regression verifies locked destination rejection and one-step Undo/Redo.
- Local browser: three melee hits17/22/27 copied/pasted at37/42/47, then one Undo restored the original three. Current full Studio1233 tests pass; staged release21 focused tests pass. Arena unchanged, latest414 pass.
- Scoped five-file publication18568b510f9bb3bd6cfedd6fd90a94a2e947bdbc submitted; Pages42513153122 authoritatively in progress. No live-delivery claim yet. Evidence release-staging/20261108-timeline-clipboard. Next poll same job, run /private/tmp/verify_studio_timeline_clipboard.py and verify live copy/paste/Undo.
- Cross-attack timeline transfer remains unsupported pending reference mapping; animation/path/main defensive-window duplication and group dragging remain unfinished. Other broad combat/UX/bank milestones remain active.

### November 8 — clipboard authored-duration correction submitted
- Additional effect-only paste regression exposed an unwanted active-window shrink for sequences with deliberately longer active duration. Paste now preserves existing duration and only extends it when necessary. Regression also verifies layer-limit rejection leaves the attack untouched.
- Full Studio1234 tests and22 staged focused tests pass. Correction8c8d97229c3afd7c5cd983db0cd037e3e666211e / Pages42513270237 is in progress; prior42513153122 was superseded/cancelled. This is a new corrective release, not a retry of a slow job.
- Next poll42513270237; run /private/tmp/verify_studio_clipboard_duration.py and live browser copy/paste/Undo. Frozen evidence release-staging/20261108-clipboard-duration. No live delivery claim yet; overall remaining scope unchanged.

### November 8 — cross-attack clipboard groundwork (local only)
- Clipboard now snapshots source geometry/timing metadata. Cross-attack paste creates new hitbox-group and box IDs, carries geometry referenced by selected hits, remaps hit references, and redirects self follow-ups to the destination attack. External follow-up targets remain unchanged. Incompatible sequence timing is rejected without changing the destination. Copy feedback explains carried dependencies.
- New pure regression verifies reference remapping and copied hit budgets/geometry. Studio1235 tests pass before the subsequent copy-feedback wording change. Full editor switch/copy/paste/Undo tests, missing external target guidance and browser QA remain pending; not published as cross-attack transfer.
- Corrected same-attack clipboard release42513270237 remains live in GitHub Actions: build completed successfully, Deploy to GitHub Pages step in progress. Continue this job, do not restart. Frozen release verifier /private/tmp/verify_studio_clipboard_duration.py; source cross-attack changes must not be confused with that frozen release.

### November 8 — same-attack clipboard live verified; cross-attack workflow tested locally
- Pages42513270237 succeeded. All five deployed files match8c8d972;22 downloaded-code timeline/workflow tests pass. Live browser copied hits36/40/45 to56/60/65, then one Undo restored the original three. Used cache-busted entry page after ordinary URL initially returned cached UI. Evidence release-staging/20261108-clipboard-duration/deployment-status.json.
- New full-editor cross-attack test copies three hits, duplicates/switches attack, pastes, Undo/Redo and verifies the source definition remains unchanged. Nine focused tests pass. Cross-attack changes are still local, not included in8c8d972.
- Next: browser-test cross-attack workflow, improve guidance for incompatible grouped/ungrouped destination sequences and unresolved external follow-ups; scoped publication after verification. Broader report scope remains unfinished.

### November 8 — cross-attack clipboard submitted
- Added actionable grouped/ungrouped destination validation with no partial edits; existing cancel-missing diagnostics identify external follow-up targets. Local browser copy three hits→duplicate attack→paste at37/42/47→Undo passed.
- Full suite exposed delayed300ms recovery autosave leaking between replacement global test environments. Scheduled-editor tests now await editor readiness and let autosave finish before replacing the environment; full Studio1237 tests pass. Frozen focused release tests pass too.
- Five-file releasea495e3515e7c5487cdfe47d37fa5c317f9874f44 submitted. No matching Pages job appeared in the immediate list yet; next discover its job by exact commit, then verify /private/tmp/verify_studio_cross_clipboard.py and live browser transfer. Evidence release-staging/20261108-cross-clipboard. Previous same-attack8c8d972 remains live verified.

### November 8 — selected timeline group dragging (local)
- Dragging or arrow-moving a selected event now moves the selected group with one atomic callback. All members preview their positions together; cancellation restores every preview. Movement clamps to the tightest member bounds; hidden/locked selected tracks reject the final edit.
- New drag/cancel/one-commit regression and separate keyboard/bounds/hidden-selection regression pass. Full Studio suite passed before the second regression was added (log /private/tmp/studio-group-drag-tests.txt); source implementation unchanged afterward. Browser drag and full-editor Undo QA remain pending; not published.
- Cross-attack release job identified as42513739173, authoritatively in progress at latest poll. Next verify this same job with /private/tmp/verify_studio_cross_clipboard.py and live cross-attack workflow. Group-drag changes are newer local work and must not enter its frozen evidence.

### November 8 — cross-attack clipboard live; group drag QA
- Cross-attack Pages42513739173 succeeded; five live hashes matcha495e351 and downloaded focused tests pass. Live browser copy→different draft→paste at56/60/65→Undo passed. Release evidence updated.
- Local group drag full-editor regression confirms one Undo/Redo transaction. Browser4× drag moved17/22/27→20/25/30 and one Undo restored all. Full Studio1240 tests pass. Group drag remains unpublished.
- Browser found a real interaction issue: at1×, a one-frame event is about5px wide and the resize handle intercepts attempted dragging. Undo restored the accidental resize; zoom4× allows accurate dragging. Next resolve narrow-event hit targets before publishing group drag, then stage scoped release and verify live. This is an open UI issue, not a passing1× drag check.

### November 8 — group dragging and distinct resize lane submitted
- Resize handles now occupy a separate lane below event bars, so even one-frame bars are not covered by resize targets. Browser1× drag verified35/40/45→44/49/54 with durations unchanged at1frame; one Undo restored all. Previous4× browser and full-editor group Undo/Redo also pass.
- Full Studio1240 tests and28 frozen focused release tests pass. Five-file release5370d3933140e4ddf33ac8ba2ecff646374636c7 submitted; live deployment still unverified. Evidence release-staging/20261108-group-drag-lanes. Next find/poll exact commit's Pages job, run /private/tmp/verify_studio_group_drag.py and verify live1× drag/Undo.
- Cross-attack clipboarda495e351 remains live verified. Broader authoring/advanced combat/bank/accessibility scope remains active.

### November 8 — batch hit properties (local only)
- Added hit-batch.js transaction and collapsible Edit several hits controls: choose hits, choose one property, apply one validated commit. Supports damage, reaction, target eligibility, launch height, knockback, reaction travel and suspension. Timing and unselected properties are preserved; this is batch editing, not persistent inheritance.
- Pure regressions verify detached edits and atomic rejection of invalid values/stale selections/unsupported fields. Full-editor test verifies first/third hit damage and one-step Undo. Full Studio1243 tests pass; browser QA, cache keys and scoped publication remain pending.
- Group-drag release42514154267 remains in progress at latest authoritative poll. Continue existing job, then /private/tmp/verify_studio_group_drag.py and live normal-zoom drag. New batch code must not enter that frozen release.

### November 8 — batch edit browser check and release submitted
- Local browser expanded Edit several hits, selected1/3, applied damage9 and verified both inspector values; Undo restored hit3 to12. Four-file remote-based release7dfc6df6c9c10cc6c9ba5917a748950b9f7c3aa8 submitted with8 frozen batch/full-editor tests passing. Evidence release-staging/20261108-hit-batch; next discover/poll exact commit Pages job then /private/tmp/verify_studio_hit_batch.py and live batch-edit check.
- Group-drag42514154267 succeeded; five live hashes and downloaded focused tests match5370d393. Local1×/4× browser tests passed earlier, but live browser drag check remains pending. Do not conflate downloaded tests with browser verification.

- Group dragging fully live verified:1× browser36/40/45→49/53/58, all durations1frame; Undo restores all three. Release5370d393 evidence updated. Batch-edit job42514377620 identified and in progress; next poll same job and verify frozen files/browser using /private/tmp/verify_studio_hit_batch.py.

### November 8 — reaction block builder groundwork (local, not connected)
- Added behavior-sequence.js authoring helper for Hit/Launch/Suspend/Re-launch/Spike/Knockback blocks with repeats, damage and spacing. Generates ordinary hit events and validates the finished attack; preserves artwork, existing geometry, other definitions and longer active timing. No new runtime schema.
- Three regression scenarios pass: five-hit generated projectile simulation, rejected unsupported/overflow/invalid blocks without mutation, and scheduled delayed-origin/group-reference preservation. This is not yet a usable behavior builder: UI preview/apply, Undo, browser QA, shared Arena runtime checks and publication remain pending. Movement and conditional blocks remain outside this initial reaction subset, not silently implemented.
- Batch-edit deployment42514377620 remains in progress at latest authoritative poll. Continue same job, then /private/tmp/verify_studio_hit_batch.py and live selected-hit/Undo test. Group-drag5370d393 is already fully live verified.

### November 8 — reaction builder preview/apply UI (local)
- Added behavior-sequence-editor.js and connected it to existing sequences. Collapsible builder has add/remove/reorder blocks, repeats, damage and spacing. Preview explicitly describes replacement, count, authored damage and timing; changing inputs invalidates preview. Apply makes one commit. Grouped geometry/default-group behavior is explained.
- Full-editor regression verifies preview leaves the attack unchanged, changed spacing invalidates it, five generated events preserve delayed origin/artwork, and Undo restores prior hits. Full Studio1247 tests pass. Browser UI/cache keys, actual Arena parity scenario, frozen publication and live verification remain pending. This covers reaction blocks only, not movement/conditional blocks or saved reusable templates.
- Batch release42514377620 still in progress at latest authoritative poll; continue same job and /private/tmp/verify_studio_hit_batch.py when deployed. Builder files are local and must not be mistaken for that frozen batch release.

### November 8 — batch editing live; reaction builder browser and Arena parity
- Batch release42514377620 succeeded, four live hashes match7dfc6df6 and eight downloaded workflow tests pass. Live browser changed hits1/3 to9 damage and one Undo restored hit3 to12. Fully live verified.
- Reaction builder local browser preview→replace→Undo passed: launch×1/suspend×3/knockback×1,27 authored damage, five events35/40/45/50/55, Undo restored three. Cache keys updated locally. Still unpublished.
- Generated anonymous fixture tests/fixtures/generated-reaction-sequence.json in Arena records the input blocks and generated attack. Four Arena tests compare damage/x/y every frame for60frames, melee/area and both facings; all five hits connect. Full Arena418 tests pass. Studio latest1247 pass. Arena test/fixture are new local uncommitted files, no runtime change.
- Next stage scoped reaction-builder release (sequence-editor.js,behavior-sequence.js,behavior-sequence-editor.js,remote-based design.js/design.html), using hit-batch frozen test-snapshot as base; include behavior-sequence.test.mjs and updated scheduled-studio-ui.test.mjs. Preserve concurrent Studio work. Then publish and verify live. Movement/conditional blocks, saved templates and wider report scope remain unfinished.

### November 8 — reaction builder release submitted
- Scoped five-file Studio publication461fbccad36b057c8219a7eb75f17a93da412a66, Pages42514878189 in progress.12 frozen builder/batch/full-editor tests pass. Evidence release-staging/20261108-reaction-builder. Next poll same job, run /private/tmp/verify_studio_reaction_builder.py and live preview→apply→Undo verification.
- Anonymous generated Arena fixture and four frame-by-frame tests committed7d3f508 and pushed to combat-cancel-development. Arena runtime/main deployment unchanged. Full suites last1247Studio/418Arena pass.
- Next authoring scope after live verification: reusable custom reaction templates with validated save/load and readable storage/export boundaries. General movement/conditional behavior blocks and true inherited properties remain unfinished.

### November 8 — portable reaction-template storage foundation (local)
- Added reaction-templates.js: version1 portable recipe format, names/spacing/block/repeat/damage validation, maximum50 unique templates, browser storage save/read and validated backup merge. Imports validate all entries before one write and never silently overwrite duplicate names. Attack-specific geometry references are excluded from portable recipes.
- Three focused regression scenarios cover detached round trips/merge, malformed and duplicate import rollback, corrupt saved data preservation and surfaced storage failures. No UI connection yet: template save/load, export/import controls, deletion/rename UX, browser verification and publication remain pending. This does not establish persistent attack inheritance.
- Reaction-builder release42514878189 still in progress at latest authoritative check. Continue same deployment and frozen verifier /private/tmp/verify_studio_reaction_builder.py. New template module is not part of that release.

### November 8 — reaction builder live verified; template UI local
- Reaction builder42514878189 succeeded; five live hashes match461fbcca and12 downloaded tests pass. Live preview27 authored damage, replace to36/41/46/51/56, Undo restores36/40/45. Fully live verified for supported reaction blocks.
- Added reaction-template-editor.js with browser-only storage explanation, name/save/load selector, backup download and size-limited validated import. Loading changes builder controls only; preview/apply required for attack changes. Storage/import errors surface without replacing existing recipes. Connected under builder.
- UI regression verifies save/detached load, invalid JSON preservation and valid backup merge. Full Studio1251 tests pass. Templates remain unpublished; next rename/delete with recoverability, browser save/load and backup round trip, cache keys, scoped release/live QA. Movement/conditional blocks and true inheritance remain unfinished.

### November 8 — recoverable reaction-template management (local)
- Added rename, remove and restore-last-removed controls. Removed recipes persist in the same browser storage record across reopening and subsequent save/import operations; restores reject conflicting active names without losing recovery entries. Recovery is bounded at50 with explicit refusal rather than silently discarding older removals. Backups explicitly contain active recipes only.
- Store/UI tests verify rename, remove/restore, persistence through another save and duplicate-name restoration rejection without writes. Full Studio1252 tests pass. Templates remain unpublished; next refresh cache keys, browser save/load/rename/remove/reload/restore and download/import round trip, then scoped release/live checks. Builder461fbcca already live verified.

### November 8 — reusable reaction templates submitted
- Local browser save→rename→remove→reload→restore→load passed. Downloaded anonymous QA recipe to /Users/timetravellog/Downloads/cyber-pet-reaction-templates.json; removed active QA recipe then imported that exact downloaded file; recipe restored and success status verified. No classroom/student data used.
- Six-file publication0a8901c1a65d09d9a02577a0abe5431274fc6b2c submitted;15 frozen template/builder/full-editor checks pass. Evidence release-staging/20261108-reaction-templates. Next discover/poll Pages job for exact commit, run /private/tmp/verify_studio_reaction_templates.py and live save/load/backup verification. Last fullStudio1252/Arena418 passed.
- Reaction builder461fbcca remains fully live verified. Templates are browser-local recipes, not persistent property inheritance or classroom-bank templates. Wider combat and accessibility work remains active.

- Current overview reconciled with live clipboard/group drag/batch/reaction-builder deliveries and pending template deployment. Audited movement-cancel requirements against actual validator and Arena action gates; implementation has not started and no completion claim is made.

### November 8 — movement cancel rule foundation (local, not integrated)
- Added matching movement-cancels.js modules in Arena shared and Studio dist. Explicit manual jump/dodge/dash windows with unique IDs, frame/cost bounds, existing hit/block/parry/whiff conditions and dash direction. Shared proposed dash balance12frames/5px per frame/30frame cooldown is documented in the module, not yet active gameplay.
- Eligibility lookup is side-effect-free: it neither ends casts nor spends resources. Runtime must validate motion/state/cooldowns before committing. Three scenarios in each application cover window boundaries, outcome conditions, invalid definitions and absent casts.
- Full suites Arena421/Studio1255 pass. No UI, runtime activation, format migration or publication yet. Next integrate validators/version11 transport and action availability, then actual manual transitions and shared runtime scenarios. Existing definitions unchanged.
- Template deployment42515303565 remains in progress at latest check; continue that handle and /private/tmp/verify_studio_reaction_templates.py plus live template backup QA. New movement modules must not enter its frozen release.

### November 8 — templates live verified; local movement format11 foundation
- Template Pages42515303565 succeeded. Six live hashes match0a8901c1;15 downloaded tests pass. Live save/load/download/remove/import round trip passed with anonymous recipe; downloaded backup /Users/timetravellog/Downloads/cyber-pet-reaction-templates (1).json. Fully live verified.
- Both local combat validators now validate movementCancels. attackVersion classifies presence as11; requireGroupVersion rejects older envelopes. Project/bank/tree accepted-version lists extend to11. Legacy classification remains unchanged; invalid automatic movement rejected.
- Full Arena422/Studio1256 tests pass. This is only local schema groundwork: complete client negotiation/catalog/export paths, classroom server version11, runtime movement actions, editor and end-to-end transport remain pending. Do not publish the local shared modules piecemeal or claim movement cancels playable.

### November 8 — local dodge-cancel runtime milestone

Arena now accepts a manual dodge during an eligible movement-cancel window. Animation availability, recovery, stun, window outcome/timing, dodge cooldown and energy are checked before relinquishing the cast or charging energy. Existing attack cooldowns and launched independent projectiles remain intact. Nine runtime regressions cover success, failure preservation and projectile ownership. Full suites: Arena 431/431; Studio 1256/1256.

This is local only, not published or browser-verified. Movement cancels remain incomplete: jump/dash runtime and inputs, Studio controls and diagnostics, complete version-11 client/server transport, movement comparison tests, browser QA and paired publication are still required.

### November 8 — local jump-cancel runtime milestone

Existing upward input now invokes an eligible jump cancel. Grounded state, vertical motion, crouch/guard, animation availability, recovery/stun and energy are checked before ending the cast. Failure preserves cast, velocity and resources; successful launch retains original attack cooldown. Ten additional runtime tests pass, including input-driven simulation. Full suites: Arena441/441 and Studio1256/1256. Local only; no browser or publication claim. Next: finite dash action/input, Studio authoring/diagnostics, complete version11 client/server transport, movement comparison, browser QA and paired release.

### November 8 — local dash-cancel runtime milestone

Arena exposes a manual dash-cancel action: twelve simulation ticks at shared base speed5, with cooldown30 and authored energy cost. Direction is captured at activation (forward/backward relative to opponent, or explicit left/right). It checks grounded state, animation, window, recovery, cooldown and resources before ending a cast. Active dash prevents walking/jump/dodge/attack overlap, clamps arena edges, and stops on stun or hit recovery; independent launched projectiles retain their cast. Fifteen additional regressions cover both facings, all directions, exact travel duration, invalid attempts, interruption and bounds. Full suites: Arena456/456, Studio1256/1256.

Local runtime only: dash controls are not yet connected, and no movement-cancel browser verification/publication is claimed. Remaining: keyboard/touch dash input, Studio controls and diagnostics, complete version11 transport/server, comparison scenarios, browser QA and paired publication.

### November 8 — local dash control wiring

Keyboard N requests a dash cancel using held horizontal direction when the window requires input direction. Two touch buttons send explicit left/right input; forward/backward authored windows retain their own direction rule. Controls show success/failure feedback, preserve sprint on failed requests, ignore paused rounds and avoid held/repeating touch activation. Movement help explains the cancel-only behavior. Existing sprint and attack keys remain unchanged. Touch callback regression passes; full suites Arena457/457 and Studio1256/1256. Browser keyboard/mobile usability is still unverified; no publication yet. Next: Studio movement-window authoring, diagnostics, version11 client/server transport, comparison scenarios, browser QA and paired release.

### November 8 — local movement-window authoring

Studio follow-up settings now include manual movement windows: action, outcome condition, cast start/duration, energy cost and dash direction. Changes use existing undo/history commits and full attack validation; invalid timing restores the prior value. Deleting the final window removes the property. Help describes grounded restrictions, controls, version11 requirements and stationary-preview limitations. DOM workflow verifies create/edit/invalid timing/local save v11/import/delete/undo and direction cleanup when switching to dodge. Full suites Arena457/457 and Studio1257/1257. This is local only, not published or browser-verified. Remaining: timeline and compatibility diagnostics, complete version11 client/server paths, movement comparison scenarios, browser/mobile QA and paired release.

### November 8 — local movement timeline and diagnostics

Movement windows now appear on the combined timeline, supporting timing edits, atomic selection movement and same/cross-attack clipboard copies with fresh IDs. Shared Studio/Arena diagnostics explain version11 requirements, manual controls, grounded/resource restrictions, stationary-preview limitations and impossible support-move whiff conditions. Three added tests cover timing preservation/bounds, clipboard identity/behavior preservation and diagnostics. Full suites Arena457/457 and Studio1260/1260. Local only; browser visual/input QA and publication remain pending. Next: complete version11 client/server transport and movement comparison scenarios before paired release.

### November 8 — local version11 client transport

Arena catalog accepts version11 projects, and both classroom clients negotiate version11 reads when advertised. Shared tests verify mixed legacy/movement bank backup round trips, unchanged originals, exact revision-protected write payloads and refusal to PUT movement windows to version10 servers. Arena additionally tests catalog import and mislabeled-version rejection. Full suites Arena461/461 and Studio1263/1263. Tests use anonymous fixtures and mocked server responses; they do not prove live server or authenticated browser behavior. Server remains at the previously deployed version10 capability until upgraded and verified. Remaining: server migration, movement comparison, browser/mobile QA and paired publication.

### November 8 — classroom server version11 deployed

Sites version64 deployed successfully (appgdep_6af0d12493d08191b531679f4e703130), source d2b981452b1a14708e5a83adc213767bcd02bf20, saved version appgprj_6ac1778cd32081918ba530bb3c83b9d6~appgver_9c41e82de14881919e6b6817aeca085f. Server now advertises and validates bank/attack version11, rejects malformed movement windows and refuses older-client access/overwrite. Sixteen anonymous in-memory bank tests and production build pass. No real student bank was read or modified; authenticated browser round trip remains unverified. Client movement changes remain local pending comparison scenarios, browser/mobile QA and paired publication. Archive: /private/tmp/combat-classroom-v11.tar.gz.

### November 8 — local movement comparison runner and controls

Two-attack comparison accepts one scheduled jump/dodge/dash attempt for A, with frame and direction controls and saved-scenario fields. Results distinguish successful cancellation, rejection reason and a test ending before the attempt. Attempts require the original cast still active; simultaneous attack-follow-up scheduling is rejected as ambiguous. Replay records resulting motion and unfinished movement. Five new runner tests cover all actions, missed windows, pending attempts and invalid inputs. Arena466/466 passes; browser layout, saved-scenario UI exercise and live publication remain pending.

### November 8 — comparison browser QA and layout correction

Local Arena browser QA found movement controls hidden inside the collapsed training-stat section. Moved them to the main comparison settings and added N to the arena accessible control description. Browser verified visible controls, saved Dash/frame2 scenario, changed selection, restored scenario and ran comparison; a move without a dash window correctly reported “No dash cancel is available” in summary and frame2 log. Positive movement-window browser execution, Studio browser editing and mobile checks remain pending. No client publication yet.

### November 8 — Studio movement browser QA; export handoff gap

Browser verified adding a movement window, switching Jump to Dash, changing condition to Any result and start to frame2; timeline and editor reflected the changes. Current Studio Export for review produces cyber-pet-combat-review v1 with state draft-not-runtime and nested project; Arena accepts direct project/bank files and therefore rejects that package. Do not silently treat a review draft as an approved runtime package. Next: provide an explicit compatible practice-project download alongside the existing review export, test the direct artifact in Arena, then complete positive movement/mobile/browser QA and publish. Browser download: /Users/timetravellog/Downloads/cyber-pet-attacks-for-review.json (anonymous local QA). No client publication.

### November 8 — explicit Arena practice export

Studio now offers Download for Arena practice alongside review export. It validates the project, enforces Arena’s 2MiB import limit and explains the local practice purpose. Existing review and backup formats remain intact. Browser downloaded /Users/timetravellog/Downloads/cyber-pet-arena-practice.json and displayed success. Exact downloaded artifact passed Arena catalog validation as version11 and executed a successful dash cancel through the deterministic comparison runner. Studio1263/1263 passed. Arena browser import/positive comparison, mobile input QA and client publication remain pending; artifact runner proof is not browser gameplay proof.

### November 8 — positive browser import/comparison and narrow-screen controls

Local browser imported the exact Studio practice download; Arena reported attacks added to trees. Comparison selected Fault-line strike, dash at frame0, distance500 and reported “Movement: cancel succeeded” plus frame0 dash log. Narrow viewport check showed wrapped touch buttons, visible Dash left/right controls and correct no-window feedback when pressed outside an attack. Screenshot /private/tmp/cyber-pet-movement-mobile.jpg; viewport restored. This verifies browser comparison and touch-button dispatch, not physical multitouch or a manually timed successful keyboard/mobile combat cancel. Client release staging/publication and authenticated classroom bank roundtrip remain pending.

### November 8 — movement release deployment underway

Arena646b958 deployed successfully via Pages42517217515; live engine, matchup, movement rules and index match the exact commit. Studiofb6e46b (29 scoped files; other root entries preserved) is uploading through Pages42517220963, still in progress at last check. Staged Studio21 focused tests and Arena466 full tests passed. Full paired live verifier prepared at /private/tmp/verify_movement_release.py; run after Studio succeeds. Release evidence: release-staging/20261108-movement-cancels. Do not claim both clients live before verifying Studio’s same job.

### November 8 — paired movement release live verified

Arena646b958 / Pages42517217515 and Studiofb6e46b / Pages42517220963 both completed successfully. Live hashes matched29 Arena and29 Studio release files. Fifteen focused tests against downloaded Studio code passed. Server64 already supports version11. Evidence: release-staging/20261108-movement-cancels/deployment-status.json, live-file-verification.json and live-movement-tests.txt. Local browser previously verified Studio edit/export, exact-file Arena import, successful dash comparison and narrow-screen controls. Live browser smoke testing and authenticated classroom-bank roundtrip remain outstanding; overall roadmap remains active.

### November 8 — live movement browser smoke passed

Published Arena imported the anonymous practice artifact and comparison reported successful dash cancellation at frame0. Published Studio created a movement window, changed it to Dash/Any result, and updated the timeline label. Screenshot: /private/tmp/cyber-pet-live-movement.jpg. Teacher connection visibly shows signed out; authenticated bank roundtrip remains unverified and no teacher/student bank content was accessed. Paired release browser smoke is complete, with manual combat timing/physical multitouch still additional QA. Next combat work: establish clock semantics and bounded hitstop/blockstun behavior without breaking scheduled/contact timing or movement cancels.

### November 8 — contact feedback foundation (local, inactive)

Audited Arena global-frame timers and Studio preview loops. Added matching contact-feedback validation and order-independent contact aggregation modules: optional hitstop/blockstop0–20 frames, blockstun0–120, simultaneous stop=max, per-target blockstun=max; misses/evades/parries/invulnerability request no ordinary stop. Missing settings retain zero timing changes. This module is not yet imported by runtime/schema/editor and is not published.

Integration plan: keep combat frame frozen during global hitstop while a separate presentation tick consumes stop; do not age projectiles/statuses/cooldowns/windows or regenerate resources during that freeze. Resolve all same-frame contacts before requesting stop. Track blockstun separately from hit stun, retain guarding while locked, reject attacks/movement until expiry, and start its countdown only as combat resumes. Update Studio timelines/replay to distinguish presentation from combat frames; tests must cover scheduled/contact sequences, trades, projectiles, cancels, pause/reset, and zero-setting legacy parity. Version12 client/server transport and controls required before publication. Full Arena469 tests pass.

### November 8 — local Arena hitstop runtime

Arena now aggregates accepted damage/push/sequence contact feedback after full-frame resolution, then freezes combat ticks for the maximum requested hitstop/blockstop. Separate presentationFrame counts active ticks while combat frame stays fixed; physics, resource regeneration, recovery, statuses, projectiles and cancel windows therefore retain their simulation time. Attack/jump/dodge/dash requests during the freeze are rejected. Menu pause preserves remaining stop; dummy reset clears it. Four regressions cover exact duration/state freeze, pause/reset, zero-duration legacy timing and both sides of a trade resolving before maximum stop. Arena473/473 passes. Not published: schema validation/version12, Studio preview clock integration, blockstun runtime, comparison-clock updates and UI still required.

### November 8 — local Arena blockstun runtime

Blocked contacts now impose a separate timed guard lock after all contacts resolve and before automatic follow-ups. It retains guard reduction, blocks movement/action requests, and counts only advancing combat frames after hitstop. Releasing guard during the lock does not remove protection; expiry returns control. Hit recovery/stun supersedes the lock, and dummy reset clears it. Added exact three-frame lock/two-frame stop and resource/action/guard-reset tests. Runtime remains local and incomplete pending Studio preview parity, version12 validation/transport, comparison clock semantics, controls and browser QA.

### November 8 — local comparison combat/playback clocks

Comparison replay now reports separate playback/combat frames. Scheduled movement/follow-up attempts wait through impact pause and execute once at their authored combat frame; starting offsets also use combat time. Replay duration remains a bounded playback limit and unfinished hitstop is reported. Cleared stale projectile clash reports on frozen ticks. Tests cover contact-frame and later movement attempts, no duplicated starts and a test ending during pause; updated UI assertion checks both frame labels. Full suites Arena478/478 and Studio1266/1266 pass. Unpublished; Studio preview parity, version12 persistence, controls and broader timing scenarios remain.

### November 8 — local preview playback snapshots

Shared legacy and sequence previews now annotate accepted outgoing contacts with impact-stop duration and expose a separate presentationFrames array that repeats frozen snapshots. Original frames remain combat-time authoring data, avoiding timing shifts during edits. Matching helper tests cover exact pause expansion, unchanged source snapshots and legacy contact playback length. Arena480 tests pass. This is an intermediate integration: Studio player still needs to consume presentationFrames; incoming-contact stop, blockstun preview state, sequence/guard parity tests, schema/version12 and controls remain required before publishing.

### November 8 — local Studio playback integration, browser verification pending

Studio player now advances presentation snapshots and renders their combat frame; scrubbing remains combat-frame based. Pause/resume retains the playback cursor, reset/scrub/recompute invalidate it, and visual-tail extension explicitly clears impactStop so a final contact cannot repeat pauses across added artwork frames. Existing Studio1268 checks passed. An attempted animation-loop DOM test could not obtain the initialized requestAnimationFrame callback in the simplified harness; it was removed rather than asserted as passing. Browser playback verification is required. Preview blockstun/incoming contacts, parity scenarios, version12 and controls remain incomplete; nothing from this milestone is published.

### November 8 — local blockstun preview parity

Legacy and sequence previews now track blockstunUntil and expose canAct=false during guard lock. A frame-by-frame test compares Arena’s lock against preview presentation snapshots through two stop frames and three blockstun frames. A scheduled two-hit guarded sequence test verifies second-hit extension, exact unlock and unchanged authored offsets. This covers outgoing blocked contacts; incoming test attacks, broader defense interactions and actual player browser verification remain. No publication; version12 transport/editor integration still pending.

### November 8 — preview incoming attacks respect blockstun

Fixed both ordinary and sequence previews allowing a scheduled incoming attack while its source opponent was blockstunned. They now report recovery interruption and permit the attempt at expiry. Matching regressions verify unchanged attacker HP during lock and damage at exact expiry. This does not yet author independent hitstop settings for the synthetic incoming test attack; that existing test input still describes only damage/frame. Next: version12 schema and UI with explicit timing diagnostics, followed by remaining parity/browser verification. Changes remain local and unpublished.

### November 8 — local version12 contact-feedback persistence

Both client schemas now validate contactFeedback, classify it as version12, reject mislabeled older containers, and accept version12 project/bank/tree formats. Arena catalog accepts v12. Classroom clients negotiate v12 reads and refuse unsupported writes before PUT. Matching tests cover bank serialization, unchanged legacy definitions, invalid bounds and mocked capability negotiation. Server remains deployed with version11 support, so contact-feedback classroom saves must remain refused until its migration. This local milestone is not published; editor controls, server upgrade, remaining parity/browser checks and paired release are still required.

### November 8 — local impact timing editor

Studio Defense section now includes a distinct Impact timing section for outgoing attacks: optional hit pause, blocked-hit pause and guard recovery. Controls validate bounded whole frames, use existing undo/history, explain combat vs playback clocks and version12 saving, and allow restoring defaults by removing the property. DOM workflow verified values, v12 save, invalid-value restoration, reset and Undo. Local only; live server still v11. Server migration, browser playback/input checks, remaining timing parity and paired release remain pending.

### November 8 — local impact-timing browser verification

The anonymous version-12 test project loaded in Studio. At quarter-speed playback, combat frame 29 remained visible for approximately 1.399 seconds, matching one normal frame plus 20 hitstop frames (21 / 15 = 1.4 seconds). Playback then advanced to recovery. Reset returned to frame 0. Evidence: `attack-studio-project/impact-timing-browser-qa.json` on the mounted combat workspace. These changes remain local and unpublished. Pause/resume, additional contact parity, diagnostics, classroom server version-12 support, and release verification remain.

### November 8 — impact diagnostics and projectile playback parity (local)

Added shared version-12 impact timing diagnostics, combat-versus-playback clock guidance, guard recovery guidance, and inactive-setting notices for support/unblockable moves. Three diagnostic tests pass in each client. Added four frame-by-frame Arena/preview projectile scenarios covering ordinary and attached attacks on hit/block: combat frame, pause duration, HP, guarded recovery, and eventual projectile removal agree. A blocked first contact correctly cancels attachment, so that case produces one hit. Full suites: Arena 493 passed; Studio 1,276 passed. Diagnostics sources match byte-for-byte. This milestone remains local; browser pause/resume checks, server version-12 support, and publication remain outstanding.

### November 8 — classroom bank version-12 support published

Sites release 65 deployed successfully at https://cyber-pet-classroom-settings.ragingaxolotl.chatgpt.site from source a44379f2faf354a7f3edeedb54607d688c0c6587. Live public capabilities advertise attack/bank formats 1–12. All 17 anonymous in-memory bank tests pass, including impact setting round trips, malformed-input rejection and older-client protection without replacing saved data. No real classroom bank records were read or written. Evidence: release-staging/20261108-impact-timing/server-publication.json. Studio/Arena impact-timing clients remain local and unpublished; browser pause/resume and scoped client release remain.

### November 8 — impact timing client release verified live

Arena d8704b5e47002483615b594532c12900c84bc7c9 and Studio 81cc0c87fd0e6ee28a8f10015e91613c99e0f1a7 deployed successfully (Pages runs 42519232315 and 42519239613). Verified 17 Arena and 31 Studio live file hashes; downloaded impact-focused tests pass. Full release suites: Arena 493 and staged Studio 1,276 passed. Staging initially omitted review fixtures; adding the existing anonymous fixtures restored the full suite, with no application change needed. Studio publication preserved unrelated root entries and patched only reviewed impact player integration into the remote design file. Browser confirmed local contact pause/resume retains remaining hold, scrub resets to combat frame 0, and published controls accept hitstop 4 with version-12 guidance. Evidence: release-staging/20261108-impact-timing; screenshot /private/tmp/cyber-pet-live-impact.jpg. Server release 65 is already live. This completes the impact-timing release, not the overall goal. Authenticated anonymous classroom-bank browser roundtrip remains unverified; broader combo, projectile, hurtbox and authoring work remains. Next: audit the next combo capability and its timing dependencies against the report.

### November 8 — local combo telemetry foundation

Added ComboTracker and Arena integration using pre-contact recovery state. Damage contacts span casts until an actionable gap; guard/armor end the damage chain, support/push contacts and periodic status damage do not increment it. Frozen hitstop ticks preserve the chain. Training reset clears it; round end closes active chains. Actual HP damage excludes shield absorption and overkill. Comparison result/replay now carries detached pair telemetry and its summary reports peak contacts and maximum chain HP damage separately. Damage/reaction balance is unchanged. Five new unit/runtime tests cover continuous stun, exact expiry boundary, freeze, reset, guard/armor, snapshot isolation and overkill. Full suites: Arena498 and Studio1276 pass. This is local and unpublished. Remaining before combo delivery: mixed-defense/order cases, cross-cast/automatic chains, projectile ownership, reaction recovery variants, Studio preview integration and browser feedback verification. Scaling, deterioration and counter-hit rules remain unimplemented.

### November 8 — combo contact-order and integration checks (local)

Moved same-frame contact batching into ComboTracker: guard/armor breaks are processed before eligible hits with deterministic break priority. Added actual Arena scenarios for automatic cross-cast follow-up, trades in both fighter orders, guard/armor exclusion, shield-only contact and burn ticks. Corrected fixtures to configure active casts, with explicit assertions that hitstop/status really occur; earlier post-cast definition edits did not exercise those conditions. Ten focused tests pass. Full suites passed Arena503 and Studio1276; after the final deterministic break-priority adjustment, all ten focused checks passed again. No publication yet. Remaining: projectile ownership/reflection, reaction variants, Studio preview integration, replay/browser feedback, then scaling/counter-hit work.

### November 8 — projectile combo attribution and replay evidence (local)

Four actual Arena cases verify ordinary/attached projectile combo attribution after reflection and owner interruption. Forced authored flight retains a chain beyond nominal hitstun; ordinary airborne movement does not. Comparison tests prove serialized A/B identities, per-frame counts and detached snapshots. Replay labels now show active damage-chain contacts and HP loss. Seventeen focused combo tests and full suites Arena510/Studio1276 pass. Browser verification of the new replay label remains outstanding. Still local/unpublished; Studio preview integration, richer recovery/defense cases and scaling/counter-hit implementation remain.

### November 8 — shared preview combo telemetry (local)

Shared ComboTracker now records outgoing damage-chain snapshots and totals in ordinary and sequence previews, preserving combat-frame timing during presentation pauses. Studio results show peak outgoing contacts and maximum chain HP damage with an explicit single-attack limitation. Four frame-by-frame Arena/preview scenarios cover ordinary/scheduled hits and guards, including impact pauses. A zero-motion preview flight record initially retained the combo incorrectly; lock detection now checks actual authored motion. Shared tracker files match exactly. Full suites Arena514/Studio1279 pass. This is not published. Incoming probe remains a simplified damage/frame test and is not reported as a second authored combo. Remaining: wider recovery parity and browser QA, then telemetry release and scaling/counter-hit implementation.

### November 8 — combo recovery and Studio browser checks (local)

Added frame-by-frame launch and floor-knockdown recovery checks; Arena and preview combo state agree through regained control. Browser verified anonymous Studio fixture: standing target displays one outgoing damage contact /19 HP; Blocking displays one contact but zero damage-chain hits /0 HP. Screenshot /private/tmp/cyber-pet-combo-preview.jpg. Updated local importing entry points for combo cache keys. Full suites Arena516/Studio1279 pass. No publication yet. Next: Arena replay browser check and scoped combo telemetry release. Scaling, deterioration, counter-hit and the broader original report scope remain unfinished.

### November 8 — Arena combo browser verification

Anonymous local Quick jab comparison produced a simultaneous trade: each fighter lost15 HP and each pair reported a one-hit chain. Scrubbing the replay to combat/playback frame8 displayed both active chains and15 HP per fighter. Screenshot /private/tmp/cyber-pet-combo-arena.jpg. Scoped release staging is in progress; this entry does not claim publication.

### November 8 — combo telemetry release verified live

Arena e8241f89e6048bf1090955250b80f9fd3b462cc7 and Studio d8a2e5e37e51e3aad09f5b3cf88a849c66be5623 deployed successfully (Pages42520305448/42520310226). Live hashes verified33 files (10 Arena,23 Studio), and focused downloaded-code checks passed. Full release checks: Arena516, staged Studio1279 passed. Live Arena Quick jab trade displayed independent one-hit/15 HP chains; local Studio guard/non-guard feedback and replay frame8 were verified before release. Evidence: release-staging/20261108-combo-tracking and /private/tmp/cyber-pet-live-combos.jpg. This is telemetry only: damage scaling, hitstun deterioration and counter-hit bonuses remain unimplemented. Next: optional versioned combo balance settings and shared runtime/preview arithmetic, retaining legacy damage when absent. Overall goal remains active.

### November 8 — optional combo scaling runtime foundation (local)

Added validated per-attack comboScaling {step, minimum} percentages and shared direct-damage arithmetic. Missing settings preserve legacy damage. First hit is full power; prior uninterrupted hits reduce later damage to the authored floor, with whole-number rounding. Guard/armor and periodic status damage are excluded; shields apply after scaling. Tracker freezes prior-hit counts at frame start, giving simultaneous contacts equal scaling rather than iteration-order effects. Arena ordinary/sequence resolution and both previews use the helper. Version13 is required by attack-version negotiation and older-envelope validation; version13 containers/server/UI are not yet enabled. Five focused tests pass (arithmetic, validation, gap reset, runtime/preview HP parity, same-frame count stability). Full suites before the final added test: Arena520/Studio1279 passed; all five focused checks passed afterward. Unpublished. Next: cross-cast/group/sequence cases, version13 transport and classroom server, authoring controls/diagnostics, browser QA and release. Counter-hit and hitstun deterioration remain separate unfinished capabilities.

### November 8 — scaling version13 client transport (local)

Both clients accept version13 project/bank/tree envelopes and negotiate version13 bank reads. Arena catalog accepts the format. Three new tests per client cover legacy preservation, bank encode/decode, project/tree roundtrips, old-envelope rejection and no PUT to a server lacking capability. Shared diagnostics explain percentages, pre-frame counts, cross-attack reset semantics, shields and unsupported support payloads. Full suites Arena524/Studio1282 pass. Still unpublished; deployed server65 supports only through version12 and therefore correctly refuses scaling writes. Remaining: editor controls/history tests, cross-cast/group scaling scenarios, version13 server migration, browser QA and paired publication.

### November 8 — scaling authoring controls (local)

Studio now exposes optional reduction-per-prior-hit and minimum-damage percentage controls, first-four-hit percentage examples, neutral defaults, validation, removal and undo. Full DOM test verifies version13 saving and invalid/blank input restoration. Added runtime checks for an automatic follow-up using the earlier unscaled cast’s count, and scheduled sequence HP parity frame by frame. All seven focused scaling checks pass. Full suites before the two added runtime tests: Arena524/Studio1283 passed. Not published; server migration, browser QA, release cache keys/staging and live verification remain. Scaling does not alter reaction timing; deterioration/counter-hit work remains outstanding.

### November 8 — version13 classroom support published

Sites server66 deployed from6151edd1abd47f473522767f6647092e440ab806; deployment appgdep_6af0dd53f7748191869cb0c445d24184 succeeded. Public capabilities verify bank/attack formats1–13. All18 anonymous in-memory bank tests pass, including scaling roundtrip, malformed rules and old-client rejection preserving saved data/revision. No real classroom records were read or written. Evidence: release-staging/20261108-combo-scaling/server-publication.json. Scaling clients remain local; browser QA and paired publication/live verification are next.

### November 8 — combo scaling version13 verified live

Arena73e97e91c38ee6a482c7c83e6939c05abed90ba6 and Studio d81f718f99f92d93ef243d76aeef44e53cac2f5a deployed successfully (Pages42521215345/42521218906). Verified49 served files against release hashes (17 Arena,32 Studio); all8 focused downloaded-code tests passed. Full suites: Arena526 and staged Studio1283 passed. Local browser authored25% reduction/20% floor and exported version13 with exact settings. Live Studio browser independently committed those settings and displayed100%,75%,50%,25% examples. Screenshot: /private/tmp/cyber-pet-live-scaling.jpg. Classroom server66 already supports format13; authenticated bank browser roundtrip remains unverified. Evidence: release-staging/20261108-combo-scaling. Legacy attacks without scaling retain their damage. Next: shared hitstun deterioration and counter-hit rules. Air recovery/bounce limits, broader projectile/defense mechanics, authoring and accessibility work, and final requirements audit remain unfinished. Overall goal remains active.

### November 8 — counter-hit phase foundation (local, unpublished)

Added identical attack-phase modules in both clients and captured defenderPhase in Arena pre-contact snapshots. Exclusive startup/active/recovery boundaries follow actual contact-triggered timing; independent projectile ownership ends at the owner action boundary rather than projectile impact/lifetime. Tests cover delayed contact, timeout, pre-start/end boundaries and both simultaneous-trade processing orders after an interrupted cast is cleared. Full suites: Arena530, Studio1286 passed. This is timing infrastructure only: no counter-hit bonus, configuration, transport version or UI is delivered yet. No browser verification is claimed for this internal change.

Recovery audit: legacyRecoveryEnd takes the maximum of hitstun and motion/knockdown recovery; pulse reactions own position and lock for their hold/frames duration. Merely reducing hitstun cannot release these locks. Next implementation must explicitly separate hitstun deterioration from authored movement/knockdown and expose that limit, or implement an intentional air-recovery transition; do not claim a reduced integer guarantees combo escape. Remaining counter-hit work: offensive eligibility and armor/guard exclusions, pre-contact snapshot-based bonuses, shared preview/replay feedback, versioned client/server transport and controls, browser QA and publication. Broader goal remains active.

### November 8 — counter-hit damage rules (local, unpublished)

Added strict optional counterHit {phases, damagePercent}: unique startup/active/recovery phases, integer100–300 percent. Arena ordinary and sequence direct damage uses the defender's pre-contact phase and offensive payload, excludes guard/armor, applies the bonus before combo scaling/shields, and records a counterHit contact flag. Missing settings preserve damage. Both clients validate the rule and require format14; version14 containers/server are not enabled yet. Shared helper files match. Six focused tests pass, including both trade orders, exclusions/rounding, format downgrade rejection, shield/scaling order and scheduled sequence damage. Full suites before the final sequence test: Arena535/Studio1286 passed; all6 focused tests passed afterward. No browser or publication claim. Next: version14 transport/server support, Studio controls and explicit single-preview limitations, comparison/replay counter feedback, wider defensive and projectile cases, browser verification and scoped release. Hitstun deterioration and broader report work remain unfinished.

### November 8 — counter-hit version14 client transport and editor (local)

Both clients accept version14 project/bank/tree containers and negotiate version14 bank reads. Arena catalog accepts14. New roundtrip tests preserve legacy records, counter-hit data and tree/project definitions; format13 rejects advanced data and unsupported servers receive no PUT. Studio exposes optional phase checkboxes and100–300% damage with neutral100% defaults, clear direct-damage ordering and single-preview limitation, removal and undo. Full DOM test verifies save version14, invalid/blank percentage restoration, rejection of no selected phases, recovery selection and undo. Full suites Arena539/Studio1290 pass. These are source/headless checks, not browser QA. Unpublished; live server66 supports only through13 and correctly refuses new-rule writes. Remaining before release: server14 migration, counter-hit replay/diagnostic feedback, broader defensive/projectile checks, browser QA and scoped publication/live verification. Hitstun deterioration and the broader original scope remain active.

### November 8 — counter-hit comparison feedback (local)

Arena comparison now returns serializable counter-hit contacts with attacker/target, attack name, combat/presentation frame and actual HP damage. Results summarize their count; event log and replay label identify individual contacts. Impact-pause ticks do not duplicate contact records. Replay records are detached from aggregate results. Shared diagnostics state version14 support, offensive phases, guard/armor exclusions, bonus/scaling/shield order, support-payload no-op and single-preview limitation. Two focused tests verify trade logging, hitstop deduplication, guarded exclusion, replay isolation and diagnostics. Full suites Arena541/Studio1290 pass. Not published or browser-verified yet. Next: server14 migration, remaining defensive/projectile regression cases, browser controls/comparison QA and scoped release. Broader goal remains active.

### November 8 — counter-hit defense and ownership regressions (local)

Nine runtime scenarios pass: ordinary/sequence armor, invulnerability and parry exclusions; ordinary/sequence full-shield absorption retaining counter classification with zero HP damage; reflected projectile counter-hit credit to its new owner. The reflection fixture initially returned the projectile before the original owner could begin its windup; it now lets the projectile travel before reflection, so the target is demonstrably in startup at contact. No production correction was required. Full suites Arena550/Studio1290 pass. Counter-hit release remains unpublished. Next required gate: server14 support, then browser QA and scoped client publication/live verification. Broader mechanics/UI goal remains active.

### November 8 — counter-hit server format14 published

Sites server67 deployed successfully from588c2ac6d5e03414f6e581b853cbc4b6c63dd932 (deployment appgdep_6af0e11791d081919ae639bda6eb88fd). All19 anonymous in-memory bank tests pass, including counter-hit roundtrip, malformed rules and old-client rejection preserving saved data/revision. No real classroom records were read or written. Server publication evidence: release-staging/20261108-counter-hit/server-publication.json. Studio/Arena counter-hit clients remain local; browser controls/comparison QA, release cache keys/staging and paired publication/live verification remain. Overall goal active.

### November 8 — counter-hit Studio browser QA and release staging

Local browser edited the anonymous impact QA attack to150% counter damage with startup/active/recovery selected; diagnostics updated correctly. Download for Arena practice produced version14 with exact counterHit values, verified from /Users/timetravellog/Downloads/cyber-pet-arena-practice (2).json. Screenshot /private/tmp/cyber-pet-counter-editor.jpg. Scoped Studio staging uses remote baseline d81f718f99f92d93ef243d76aeef44e53cac2f5a and33 files, retaining unrelated remote authoring changes. Local release cache keys updated. Full release tests Arena550/staged Studio1290 pass. Stage script /private/tmp/stage_counter_release.py; publisher /private/tmp/publish_studio_counter.py. Remaining: Arena browser comparison/replay QA, paired client publication and live verification. Server67 already supports14. Overall goal remains active.

### November 8 — counter-hit version14 clients verified live

Arena f2f4f4336d0867a4ba66a0148276821908c5a003 and Studio f35aed3f9bb4794fb9cfd6b633e37bd9d3a60561 deployed successfully (Pages42522575146/42522589449). Verified50 served files against release hashes (17 Arena,33 Studio); downloaded phase/format/editor/scaling checks passed. Full release suites Arena550/staged Studio1290 passed. Local browser imported Studio version14 practice export, produced a simultaneous trade with two counter-hit contacts/29 HP each, and replay frame29 displayed both contacts during impact pause. Screenshot /private/tmp/cyber-pet-counter-arena.jpg. Evidence release-staging/20261108-counter-hit. Server67 supports14. Authenticated bank browser roundtrip remains separate/unverified. Next: hitstun deterioration with explicit motion/recovery semantics; broader requested mechanics, UI/accessibility and final requirements audit remain unfinished. Overall goal active.

### November 8 — ordinary hitstun deterioration foundation (local)

Added optional hitstunScaling {step, minimum} in whole frames0–120. Shared arithmetic subtracts step per prior uninterrupted hit, clamps to the floor without ever increasing a shorter authored hitstun, and preserves legacy settings when absent. Arena and ordinary preview apply it before legacy reaction/juggle resolution; prior-frame combo counts avoid same-frame order effects. Push/support reactions remain unchanged. Both clients validate the rule and require format15, but format15 transport/server/UI are not enabled. Four focused tests pass: bounds/rounding-free arithmetic, schema/old-envelope rejection, standing recovery/actionable gap/reset, and launch-motion recovery parity. Arena timestamps begin one frame after cast request; comparisons normalize that origin. Full suites Arena554/Studio1290 pass. Unpublished. Next: explicit per-event hitstun for sequences with motion/knockdown remaining separate locks, corresponding scaling/preview parity and editor diagnostics, version15 transport/server/UI, browser QA and release. No claim that shortening hitstun alone releases an airborne/knockdown lock. Overall goal remains active.

### November 8 — per-event hitstun and sequence deterioration (local)

Hit events accept optional whole-frame hitstun0–120, requiring format15 even without attack-level scaling. Missing values preserve legacy reaction hold/frames (none remains no stun). Shared scaledHitEvent applies per-attack deterioration using pre-frame combo counts; Arena and sequence preview use the same event transformation. Explicit hitstun on reaction none supports stationary stun without creating motion. Existing motion remains an independent lock and is not shortened; preview canAct now also checks pulseMotion. Frame-by-frame tests verify HP, stun and actual action availability for stationary and moving sequences, standing escape/reset and old-envelope/malformed-event rejection. All6 focused recovery tests pass; full suites Arena556/Studio1290 pass. Unpublished. Next: authoring controls for scaling and per-hit override, diagnostics that explain motion/status/knockdown limits, format15 transport/server, broader cross-cast/defense tests, browser QA and release. Overall goal active.

### November 8 — hitstun format15 client transport and diagnostics (local)

Both clients now accept format15 project/bank/tree envelopes and negotiate15 when supported; Arena catalog accepts15. Four new tests per client verify scaling roundtrip, legacy preservation, old-server no-PUT protection, project/tree compatibility, and event-only overrides preserving zero,12 and absent hitstun distinctly. Shared diagnostics explain version15 requirements, cross-cast deterioration/reset, no increase of shorter authored stun, support/push no-op, and independent launch/suspension/knockdown/status locks. Full suites Arena560/Studio1294 pass. Unpublished; live server67 supports14 and refuses15 saves as intended. Next: scaling and per-hit editor controls/history tests, server15 migration, browser QA and scoped publication. Overall goal remains active.

### November 8 — hitstun authoring controls (local)

Studio now exposes optional whole-frame deterioration step/floor, neutral defaults, first-four-hit duration examples and independent-recovery explanations. Selected-hit inspector accepts an optional0–120-frame override; blank removes it and zero remains explicit. Defense commit preserves/removes hitstunScaling. Full DOM test covers validation, save format15, removal/undo and per-hit blank-versus-zero persistence/undo. Full suites Arena560/Studio1295 pass. Not browser verified or published. Next: server15 migration, broader recovery/defense regression cases as needed, browser controls/export/recovery QA, scoped release and live verification. Overall goal remains active.

### November 8 — hitstun format15 server published

Sites server68 deployed from d21d7f862fde487348b60a71770a5ce3d131abaa, deployment appgdep_6af0e3d854d881918399493d8db7514d succeeded. All20 anonymous bank tests pass, including deterioration/per-event zero roundtrip, malformed values, event-only downgrade rejection and preservation of saved revision/data. No real classroom records accessed. Evidence release-staging/20261108-hitstun/server-publication.json. Clients remain local; browser authoring/export/recovery QA, scoped staging, publication and live verification remain next. Overall goal active.

### November 8 — hitstun browser QA and client publication started

Local Studio browser authored step3/floor1 and first-event8f, displayed8/5/2/1 examples, exported format15 with exact values. Arena imported the anonymous export and ran a simultaneous comparison (9 HP each); recovery parity itself remains verified by automated frame-by-frame tests. Screenshots /private/tmp/cyber-pet-hitstun-editor.jpg and /private/tmp/cyber-pet-hitstun-arena.jpg; evidence release-staging/20261108-hitstun/browser-qa.json. Scoped Studio34-file stage retained unrelated published work. Full release suites Arena560/Studio1295 pass. Arena1e009f4fca79ebaac96d97149472b7110e18ff3b and Studio0efc6472e8c7f7e751c52e15a6a5e1fde77c2b34 pushed. Pages42523541587 in progress and42523553004 queued at last check. Do not claim live yet. Next: poll these exact runs, then /private/tmp/verify_hitstun_release.py and record deployment evidence. Server68 is live. Overall goal active.

### November 8 — hitstun format15 release verified live

Arena1e009f4fca79ebaac96d97149472b7110e18ff3b and Studio0efc6472e8c7f7e751c52e15a6a5e1fde77c2b34 deployed successfully (Pages42523541587/42523553004). Verified51 served files (17 Arena,34 Studio) against release hashes; downloaded format/editor checks passed. Full release suites Arena560/Studio1295 pass. Server68 supports15. Local browser authoring/export/import smoke and automated frame-by-frame recovery parity are recorded separately in release-staging/20261108-hitstun. Authenticated bank browser roundtrip remains unverified. Next: explicit air recovery and bounce budgets, retaining the broader projectile/defense/authoring/UI requirements. Overall goal remains active.

### November 8 — air-recovery timing foundation (local)

Source audit confirms stun combines authored hitstun with movement/knockdown locks, so it cannot alone determine air-recovery eligibility. Added separate hitstunUntil state to ordinary Arena reactions, ordinary preview and shared pulse reactions, retaining earlier longer authored hitstun on rehit. Fighter initialization and dummy reset clear it. Three tests verify separation from launch/knockdown recovery, preservation across shorter hits and reset; full suites Arena563/Studio1295 pass. This adds no escape action yet and is unpublished. Existing wall/floor slam flags are impacts/knockdown, not a complete bounce system; do not relabel them as delivered bounce mechanics. Next: explicit recovery eligibility/action, controlled transition from authored motion to free airborne movement, input/preview/comparison coverage, then bounce events/budgets and corresponding authoring/versioning. Overall goal active.

### November 8 — air-recovery action and eligibility (local)

Shared airRecoveryReason/recoverInAir implement one neutral recovery per landing, at least12 combat frames after the last hit and after authored hitstun expiry. Defeat, grounded/free movement, active status stun, wall/down/get-up, forced floor knockdown and juggle-limit release reject without mutation. Recovery brakes motion at the exact position, switches to free falling control, clears motion ownership and preserves juggle count. It grants no invulnerability. Arena.airRecover rejects pause/winner/hitstop and emits feedback on success; floor contact resets allowance. Three tests cover atomic rejection, timer boundaries, no teleport/budget refill, pause/hitstop, falling and landing reset. Full suites Arena566/Studio1295 pass. Unpublished; input controls, comparison/preview action options, interrupted attachments/rehit scenarios and browser verification are not implemented yet. Bounce mechanics remain separate unfinished work. Overall goal active.

### November 8 — air-recovery keyboard and touch controls (local)

Arena binds M and a discrete Air recover touch button to the same airRecover action/status feedback. M does not overlap attack slots or configurable defense keys. Repeats are ignored and form/native control editing is preserved. Movement/footer instructions name the action and once-per-landing rule. App-handler DOM test verifies both dispatch paths, grounded rejection feedback, repeat suppression and native editing; existing pointer cleanup tests still pass. Full suites Arena567/Studio1295 pass. Unpublished and not browser/device verified. Next: comparison/preview recovery attempts and timing feedback, attached projectile/rehit cases, browser QA and paired release; bounce mechanics remain unfinished. Overall goal active.

### November 8 — scheduled comparison air recovery (local)

Arena comparison accepts optional recoveryBFrame0–899, blank/null disabled. It attempts once after contacts and any impact pause on the chosen combat frame; results/log distinguish success, rejection reason and unattempted test limit. Replay captures the restored control state. Configuration save/load includes the attempt, and Studio comparison transfer clears it. Three tests cover success/early hitstun, no-option/invalid input, hitstop combat-versus-playback timing, forced-knockdown rejection and short-test limit. Full suites Arena570/Studio1295 pass. Unpublished/not browser verified. Next: Studio preview recovery attempt with consistent free-fall transition, cross-application parity, attached/projectile rehit cases, UI/browser verification and release. Bounce mechanics and broader scope remain unfinished.

### November 8 — preview air-recovery simulation parity (local)

Ordinary and sequence simulations accept optional recoveryFrame, call the shared eligibility/action after contacts, report success/rejection/unattempted results, and resume free fall after recovery. Ordinary preview tracks last hit/reaction/forced landing and maps active status stun for eligibility; local authored flight is removed only on successful recovery. Four frame-by-frame tests compare Arena height/HP and rejection reasons for ordinary/sequence launches at early frame2 and eligible frame12. Full suites Arena574/Studio1295 pass. Unpublished; Studio visible attempt control, saved-scenario integration, attached projectile/rehit cases, browser checks and release remain. Overall goal active.

### Air recovery: Studio scenario control (local, unpublished)

Added a blank-to-disable recovery-attempt frame control, saved-scenario restoration (including clearing the setting for older scenarios), and validation at both preview entry points. Invalid saved frames are rejected before changing the current scenario. Automated verification: Arena 574/574; Studio 1296/1296, including the new control/save/restore test. Remaining for this milestone: rehit/projectile edge cases, browser verification, scoped publication and live verification.

### Air recovery: projectile rehit and Studio browser verification

Added frame-by-frame Arena/preview regression coverage for attached and stationary contact projectiles after recovery. Attached follow-ups remain able to hit, preserve the spent recovery and juggle count, and reject a second recovery until landing. Stationary geometry can miss after the target leaves it. All 16 air-recovery tests pass. Studio browser verification: entered frame 12, saved scenario, cleared the field, restored scenario and observed frame 12 restored. Screenshot: `/private/tmp/cyber-pet-air-recovery-editor.jpg`. This is local UI verification; Arena browser exercise, release staging, publication and live verification remain.

### Air recovery: Arena browser QA and release preparation

Anonymous two-attack import verified in Arena browser: recovery succeeds at combat frame 12 and reports “Hitstun has not ended” at frame 2. Evidence saved in `release-staging/20261108-air-recovery/browser-qa.json`. Refreshed Arena dependency cache keys; complete Arena suite passes 576/576. Studio release is being staged against remote main with only recovery-owned modules and narrow design.js changes; publication and live verification still pending.

### Air recovery release verified live

Arena `5330cdac172d589a96f849b8174f152aa32bfa07` and Studio `0e3e35f45d22d352b6b2911a5cc4a8129f8e8267` deployed successfully (Pages42524883804/42524895428). Verified44 served files against release hashes (16 Arena,28 Studio); downloaded editor tests pass. Full release suites:576 Arena,1296 Studio. Evidence: `release-staging/20261108-air-recovery`. M/touch air recovery is once per landing, requires expired authored/status stun and minimum hit age, and grants no invulnerability or renewed juggle budget. Studio and comparison support saved frame-specific attempts. Global runtime action adds no persisted attack format, so server68/format15 remains current. Physical touch testing and authenticated bank browser roundtrip remain unverified. Next: real wall/floor bounces with shared contact handling and bounded repeat counts; broader report scope remains active.

### Bounce foundation (local, not connected to combat yet)

Audited legacy motion, pulse motion, Arena floor settling and ordinary-preview landing: all currently clamp/end trajectories, while grounded juggle resets run on floor contact. Real bounces must intercept boundaries before those resets. Added identical shared bounce-rules modules with validated wall/floor height, distance and duration, crossing detection (including overshoot/resting/corner ties), and one wall plus one floor rebound per airborne chain. Bounce contact must not replenish recovery or juggle budgets; reset only after settling. Four focused tests pass, mirrored in Studio. No bounce property is accepted by attack transport or exposed in the editor yet. Next: integrate rebound trajectories into ordinary and pulse simulation with frame-by-frame parity, then format/server migration, authoring, diagnostics and release. Existing slams remain unchanged.

### Shared pulse bounce integration (local, unpublished)

Pulse motion now detects wall/floor crossings before clamping or settling, creates an inward/upward rebound, and carries the remaining bounce rules through its trajectory. Rebounds preserve last-hit time and authored hitstun, add no damage contact, and do not reset recovery/juggle limits at floor contact. Ground reset skips an active rebound and clears bounce counts on final landing. Three pulse regressions pass in each client; full suites Arena583/Studio1303 passed before adding two further passing Arena/preview frame-by-frame scenarios (floor-only and wall-then-floor). Remaining before release: ordinary reaction integration, long-duration preview termination, explicit schema/version negotiation and server support, editor settings, diagnostics and browser/live verification. The new fields are not a supported transport contract yet.

### Ordinary bounce integration and long preview completion (local)

Ordinary Arena reactions and Studio preview now hand boundary collisions to the same rebound transition used by pulse reactions. An accepted rebound clears forced-fall motion, preserves authored hit age/stun, and owns position until landing. Ordinary preview action availability and combo locks include rebound motion. Both preview loops extend through active rebound motion so two120-frame rebounds finish rather than truncating after the original sequence. Eight frame-by-frame Arena/preview scenarios pass for ordinary/sequence attacks, floor-only/wall-then-floor, and10/120-frame rebounds. Full suites before final transition deduplication: Arena591/Studio1303; all15 bounce-focused tests passed after deduplication. Still local/unpublished; schema/version/server support, conflict semantics for explicit slam+bounce settings, editor controls, diagnostics, browser and release checks remain.

### Bounce format16 and conflict validation (local)

Both client schemas now validate ordinary/per-event bounces and classify either as format16. Project, bank, tree and Arena catalog readers accept16, while older envelopes reject bounce settings. Classroom clients negotiate16 only when advertised and refuse unsupported writes before PUT. Same-boundary slam+bounce combinations are rejected; different boundaries remain independently configurable. Sequence bounces belong to individual moving hits, not the attack root or none/suspend reactions. Three new transport/schema tests pass in each client, including unchanged legacy bank content and mocked old-server write refusal. Full suites Arena594/Studio1306 pass. Not published; live server remains68/format15. Next: server migration, editor controls/diagnostics, further edge coverage and browser/release verification.

### Bounce authoring controls (local, unpublished)

Added ordinary and selected-hit bounce controls for height, distance and duration, with add/remove, bounded validation, version16 guidance, and once-per-boundary limits. Matching slam prevents adding a bounce until the slam is disabled. Sequence conversion transfers ordinary bounces to the final moving hit with visible explanation; fixed stale root bounces in sequence commit deletion handling. DOM workflow test verifies save16, edits, invalid restoration, removal, Undo and conversion preservation. Browser QA, selected-hit direct-edit coverage, server16 support and release remain pending.

### Bounce feedback and per-hit workflow checks (local)

Extended Studio workflow coverage to selected-hit duration editing, invalid restoration, removal and Undo. Reaction changes that conflict with bounces now restore the prior selection with visible error feedback. Added shared diagnostics for format16, boundary reach, per-chain limits and preserved recovery budgets; preview event lists identify wall/floor rebounds and Arena emits pulse rebound labels. Strengthened ordinary parity checks to assert airborne stance during rebound, catching and fixing floor collision logic that incorrectly applied knockdown immediately after an ordinary rebound began. Full suites Arena594/Studio1307 pass. Server16 migration, broader edge cases, browser QA and scoped release remain; no live bounce release claimed.

### Classroom server69 supports bounce format16 (live)

Sites server69 deployed successfully from d8fcd6c45607a15ea6bf7904485a128645d1330a. Public capabilities now advertise formats1–16; revision protection remains enabled. All21 anonymous in-memory server tests pass, including ordinary and per-hit bounce roundtrips, old-client refusal, malformed/conflicting settings and saved-data preservation. Evidence: `release-staging/20261108-bounces/server-publication.json` and server-tests.txt. No real classroom writes were performed. Studio/Arena bounce clients remain local; browser QA and paired client publication/live verification are next. Authenticated anonymous browser bank roundtrip remains unverified.

### Bounce Studio browser QA and scoped staging

Local browser selected hit3, added a floor bounce, changed height to45 and exported a version16 practice project. Download inspected: exact height45/distance30/frames24 preserved. Inspector screenshot `/private/tmp/cyber-pet-bounce-editor.jpg`; evidence `release-staging/20261108-bounces/browser-qa.json`. Staged36 Studio files against published0e3e35f using feature-owned modules and narrow design.js patches, preserving unrelated editor work. Arena cache imports refreshed; Arena594/594 passes. Arena browser verification and client publication/live checks remain pending.

### Bounce clients pushed; deployment verification pending

Arena browser imported anonymous16 fixture, reported floor bounce at12f with no extra damage, and showed airborne rebound at24f. Added comparison bounce log with impact-pause deduplication coverage. Full Arena595 and staged Studio1307 pass. Arena db15a2fe489b746eb30cdf8a28e4b5f5edba739b and Studio b68f73b1430f13ea554b334d057a5145d58b1214 pushed; Arena Pages42526523770 is in progress. Next: inspect matching Studio/Arena deployments and run `/private/tmp/verify_bounces_release.py`; do not claim live client delivery yet. Server69 is already live.

### Bounce clients verified live

Arena db15a2fe489b746eb30cdf8a28e4b5f5edba739b and Studio b68f73b1430f13ea554b334d057a5145d58b1214 deployed successfully (Pages42526523770/42526533884). Verified55 served files against release hashes (19 Arena,36 Studio); downloaded bounce editor/format/pulse/rule tests pass. Evidence: `release-staging/20261108-bounces`. This completes the bounded wall/floor bounce milestone, not the full report. Next dependency audit: projectile travel currently comes from worldBox fixed-speed or authored path plus reflection transforms; homing/return require shared per-projectile movement state in Arena and both previews. Authenticated anonymous browser bank roundtrip, physical-device/accessibility checks and remaining defense/authoring/geometry scope remain unfinished.

### Projectile steering foundation (local, not integrated)

Audited fixed-speed/path worldBox positioning, group offsets and horizontal reflection. Added identical shared steering modules with bounded homing turn rate, delayed return toward current owner position, constant speed, swept owner-catch radius, duplicate-frame idempotence and reflection preserving travel age. Four focused tests cover validation, bounded trajectory/speed, return/catch and reflection invariants. These are movement primitives only: no authored attack property, transport version or runtime integration yet. Next: drive independent projectile positions once per combat frame in Arena and both previews, translate grouped hitboxes consistently, and preserve attachment/reflection/lifetime semantics before authoring/versioning. Broader roadmap remains active.

### Arena steering runtime integration (local)

Independent projectile launches create center-coordinate steering state. Arena advances it once per combat tick before collision snapshots, keeps grouped hitbox offsets/reflection geometry, and removes caught return projectiles without owner damage. Attached sequences retain attachment ownership of position; reflection reverses heading while preserving travel age and expiry. Focused tests cover duplicate collision queries, impact-pause freeze, catch/removal, reflection and grouped offsets. Still unsupported authoring/transport: both Studio previews, schema/version/server, editor and browser/release checks remain. No live steering feature claimed.

### Steering preview integration (local)

Ordinary and sequence previews now advance shared steering state, translate grouped boxes, retain attachment priority over steering, and stop contacts after return catch. Snapshots retain independent steering data. Six Arena/preview scenarios cover ordinary/contact/attached delivery with homing/return and compare positions/HP throughout. Initial attachment impact geometry is pre-contact in preview versus post-contact in a fresh Arena query; that single geometry comparison is excluded, HP remains checked. Attached hits intentionally stop return pursuit. Full suites before expanding attachment scenarios: Arena607/Studio1311; all6 expanded parity tests pass. Schema/version, server, editor controls, broader edge coverage and publication remain.

### Steering format17 and diagnostics (local)

Client project/bank/tree/catalog formats now support17 for projectileSteering. Validation requires independent lifetime and rejects competing authored paths; old envelopes reject steering instead of silently losing it. Classroom negotiation requests17 only when advertised and refuses old-server writes before PUT. Diagnostics explain steering, reflected ownership, attachment precedence and return delays at/after expiry. Full suites before diagnostic additions: Arena612/Studio1314; focused format/diagnostic checks added. Live server remains69/format16, so this is not a live save capability. Next: authoring UI, server17 migration, remaining edge/browser tests and scoped release.

### Steering authoring controls (local)

Projectile inspector now provides straight/path, homing and return modes after independent lifetime is enabled; supports bounded turn rate and return delay. Existing paths disable steering selection with explanation. Turning persistence off removes dependent steering; Undo restores the lifetime and steering together. DOM workflow verifies mode changes, version17 save, numeric rejection, removal and Undo. Studio1316/1316 passes. Rendering audit found both Studio design.js and Arena effect-renderer.js still derive VFX travel from the old fixed-speed/path expression: align these to steering centers before browser/release verification. Server17 migration and broader edge checks also remain.

### Steering visual alignment (local)

Studio and Arena VFX now use the steered projectile center plus the authored effect-to-hitbox offset, instead of fixed-speed travel. Shared helper preserves left/right offsets and vertical placement; reflection mirrors horizontal offsets without applying the world reflection transform twice. Attachment still takes precedence. Arena renderer regression checks actual canvas translation, reflected placement and attached fallback; mirrored shared helper tests cover both facings. Full suites Arena615/Studio1317 pass. Visual browser QA is still pending, along with server17 support, remaining interaction coverage and scoped client release.

### Classroom server70 supports steering format17 (live)

Sites server70 deployed from1baba912b12070da44acfd6995fcb81a97929806. Public capabilities advertise formats1–17 with revision protection. All22 anonymous in-memory server tests pass, including homing/return roundtrips, invalid settings, lifetime/path conflicts, older client refusal and unchanged saved data on rejection. Evidence: `release-staging/20261108-steering/server-publication.json` and server-tests.txt. No real classroom writes performed. Client browser QA, scoped publication and live verification remain; authenticated anonymous bank browser roundtrip is still unverified.

### Steering release staging — November 8, 2026

Continued writing in the mounted combat SSD workspace as requested. Added a return-window diagnostic: an independent projectile lifetime does not extend the active damage window, so a return delay beyond that window is warned about separately from expiry. Focused format tests pass. Browser preview visibly reports “Projectile returned to owner” for the anonymous Traveling bolt fixture (active 120, turn 90, return delay 12). Scoped Studio release staged against b68f73b1430f13ea554b334d057a5145d58b1214, preserving unrelated authoring work. Staged Studio suite: 1,317 passing; Arena suite: 615 passing. Evidence: release-staging/20261108-steering/{studio-tests.txt,arena-tests.txt,baseline-files.json}.

Remaining for this milestone: browser export/Arena import verification, cache-key review, client publication and live-file verification. Steering clients are not yet published. Overall combat/UI goal remains active.

Steering release QA: browser-created version17 export imported into Arena; both Traveling bolt projectiles returned at playback frame53, neither owner lost HP. Added explicit return events to the comparison log and a regression proving each return is logged once. Arena full suite now616 passing; staged Studio1317 passing. Cache keys refreshed. Client publication pending.

### Steering clients verified live

Arena d2b69ceda75299469dace6c79376e41f3b2e9ccb and Studio 6b5b20119bd1e8c2185e8aa69ae9dbd2d73c0634 deployed successfully (Pages42528352342/42528365258). Verified53 live files against release hashes:18 Arena,35 Studio. Tests against downloaded steering/editor/format modules pass. Full prepublication suites: Arena616, staged Studio1317. Browser-created version17 export imports into Arena and both return events appear once, without catch damage. Server70 already advertises format17. Evidence: release-staging/20261108-steering.

This completes the homing/return release, not the overall report. VFX alignment has renderer regression coverage; the browser export fixture has no VFX artwork, so this is not visual artwork verification. Authenticated anonymous browser bank roundtrip and physical-device/accessibility checks remain unverified. Next projectile scope: contact outcomes (single contact/piercing/persistent area), explosion/splitting and absorption resource benefits. Remaining priority/guard/throw, hurtbox/anchor/rotation, authoring inheritance/behavior/audio/camera work and final scope audit remain active.

### Absorption energy rewards — local, unpublished

Audited existing projectile lifetime/contact and defense handling. Absorption currently removes independent projectiles with charged windows and no resource benefit. Added optional defense-window energyGain (integer0–100, absorb-only), applied once on successful absorption and capped at current maximum energy. No reward on invulnerability or exhausted charges; old omitted settings preserve zero reward. Arena comparison reports actual restored energy, separating this from configured reward. Studio has a blank-to-disable energy field, invalid-value restoration and Undo coverage. Both clients classify authored rewards as format18, accept18 project/bank/tree reads, negotiate18 only when advertised and reject reward writes to older servers before PUT. Diagnostics explain the version requirement and melee-only Studio probe limitation.

Validation: full suites Arena620 and Studio1317 passed before adding two transport tests per client; both new transport tests also pass in each client. Existing editor workflow test now checks save18, invalid values, clearing to legacy9 and Undo. Runtime tests cover partial/full energy, exact capacity clamp, once-only award, exhausted charge and invulnerability precedence. No publication yet: live server70 supports17 and safely refuses18 writes. Next: server18 migration and rejection/roundtrip tests, comparison starting-energy controls so authors can demonstrate nonzero rewards, browser QA, scoped client release and live verification. Other projectile contact/area/explosion/splitting work and the broader report remain unfinished.

### Absorption comparison energy controls — local

Added A/B starting-energy percentages (whole0–100, default100) to isolated comparison. Initial energy respects each fighter’s stat-derived maximum and normal attack costs; regeneration continues. Replay snapshots and labels expose current/max energy. Saved scenarios preserve both percentages; older scenarios and new Studio transfers reset them to full energy instead of retaining stale low values. Blank/invalid inputs are rejected. Runtime/UI tests demonstrate a25-point absorption reward, exact energy accounting, insufficient-energy attack rejection, save/load and legacy defaults. Full Arena624/624 passes; git diff --check clean.

Still unpublished. Next: classroom server18 support/tests, browser authoring/export/import/reward verification, scoped release staging and live verification. The broader combat/editor/accessibility goal remains active.

### Classroom server71 supports absorption format18 (live)

Server71 deployed successfully from90e324f1cabfb70d16689f9137af5976ac813f6e. Public capabilities advertise1–18 with revision protection. All23 anonymous in-memory server tests pass, including reward roundtrip, zero reward, old-client refusal, malformed values/wrong defense kind and saved-data preservation after rejected writes. Evidence: release-staging/20261108-absorption/server-publication.json and server-tests.txt. No real classroom bank writes performed. Client controls remain local/unpublished; next browser authoring/export/import/energy verification, scoped client staging and publication. Overall goal remains active.

### Absorption client release QA

Browser authored absorb window with25 energy,60-frame duration and90-frame startup, exported format18 and imported into Arena. At100px spacing and20% defender starting energy, comparison reported one absorption at frame21 restoring25 energy, no HP damage. Screenshot /private/tmp/cyber-pet-absorption-arena.jpg. Scoped Studio staging contains35 files against6b5b20119bd1e8c2185e8aa69ae9dbd2d73c0634; unrelated site files preserved. Full release tests Arena624 and staged Studio1319 pass. Evidence: release-staging/20261108-absorption. Client publication/live verification pending.

### Absorption clients verified live

Arena6a50d4ddd78d95b71591b609fae30edfa6459733 and Studio5a597e9b096d807d5c69b531996730fac0a925b4 deployed successfully (Pages42529208455/42529219820). Verified52 live files (17 Arena,35 Studio) and downloaded editor/format tests pass. Full release tests624/1319. Server71 supports18.

User priority additions: both left and right docked panels trap scrolling; reproduced left wheel leaving scrollTop0 despite overflowing parent. Original library/inspector overflow:auto with overscroll-behavior:contain prevents chaining to workspace columns. Local override moves scrolling ownership to columns/floating bodies. Browser verified left scroll944 and page2; right scroll1245 to its bottom. User also requested compact info buttons near headings; implemented reusable accessible help dialog for Attack timeline, Defense sections and Follow-up sections, retaining status/warnings. Broader contextual help rollout remains. Scoped UI release and live verification pending. Original combat goal remains active.

### Side scrolling and compact help verified live

Studio649bef5a51dea52c896295608300a27dd2d47fc7 deployed successfully (Pages42529665268). All7 served release files match hashes; staged1320 tests pass. Both library and inspector now pass wheel gestures to their workspace column; browser reached Effects page2 and right-panel bottom. Info dialogs added for timeline, defense and follow-up sections; warnings/status remain visible and closing returns focus. Remaining explanatory sections can use the same helper in subsequent UI work.

### Direct preview dragging (local release candidate)

User reports animation + cannot drag and target/attacker placement is difficult. Found animation hit testing recomputed old fixed-speed positions instead of using the positions actually drawn (including steering/attachment). Added draw-derived effect hit targets,16-display-pixel minimum grab radius and transformed artwork hit testing (rotation, facing, scaling/stretch). Selected visible + can be grabbed without switching tools; Move animation can grab the artwork. Added Move hitbox/animation/target/attacker buttons under preview. Target body grabs retain cursor offset, avoiding the old feet-snap. Attacker placement moves horizontally on the floor while target stays fixed and test distance updates; preview origin is session-local, while relative test distance persists. Browser changed effect X/Y to30/-22, moved target up15px, and moved attacker right while target remained in place. Full local1323 tests pass including drag geometry and UI workflow. Scoped staging/publication/live checks pending. Screenshot /private/tmp/cyber-pet-drag-controls.jpg.

### Direct preview dragging verified live

Studio e08f1672c2c10a9ba126eb81d866ca780190bb65 deployed successfully (Pages42530142782). All3 served files match release hashes; tests against downloaded drag helper/design pass. Staged full suite1323 passed. Previous scrolling/info release649bef5 remains included. User can now drag the selected + with a larger grab area, drag transformed animation artwork in Move animation mode, grab target body without snapping feet, and reposition the grounded attacker using preview controls. Target-relative test distance updates; absolute preview origin remains session-local. Broader combat roadmap remains active, with further contextual help and accessibility testing still to do.

### Preview placement recovery and steering drag regression (local)

Extended real editor-event regression to homing and returning projectile handles at combat frame20, using displayed steering centers; both drag correctly and persist authored offsets. Found session-only preview origin prevented complete attacker-position recovery. Added optional validated testBench.options.previewOrigin (45–915 canvas pixels, no combat-format upgrade) and tied rendering to that saved value. Attacker movement records origin alongside relative target distance; Undo/Redo and project reopen preserve/restore both. Older projects retain150 default. Malformed origins rejected by both client project readers. Full current local suites Studio1326/Arena624 pass (Studio local tree also includes concurrent work; scoped release still required).

This follow-up is not yet published; live direct-drag release remains e08f1672. Next: scoped staging/browser recovery check and release, then continue outstanding projectile contact/explosion/splitting, broader help rollout, remaining combat/editor/accessibility requirements.

### Placement recovery release checks

Scoped Studio release patches only preview-origin save/render and optional project validation atop published source; dependency cache keys refreshed. Browser exported previewOrigin221.4294 with target distance48 and confirmed Undo/Redo. Staged release suite1326 passes excluding tree-quota-recovery.test.mjs, which targets concurrent unpublished tree-storage work and fails against intentionally retained published tree storage. Exclusion and rationale recorded in release-staging/20261108-drag-recovery/test-scope.json; local full suite also passed. Arena624 passes. Client publication/live verification pending.


### Preview placement recovery verified live

Arena370bacc83a903e1a42a8e7a4ae46cbcf9a9832b6 and Studioa6413b735252dff265e01fce9f32fd7f66b03a02 deployed successfully (Pages42530632905/42530833751). Verified38 served files (11 Arena,27 Studio), then passed drag geometry, actual editor drag/recovery, and tree quota recovery tests against downloaded Studio files. Full release suites: Arena624/624, Studio1327/1327. The final Studio candidate was rebuilt atop concurrently published tree-storage fix6c833cdb42e949ac60b7644986088620bd6afbb0; the earlier test exclusion is superseded: final test-scope.json has no exclusions. Browser checked exported attacker origin and Undo/Redo. Preview attacker position now survives project save/load, alongside relative target placement; homing/returning artwork handles have regression coverage. Evidence: release-staging/20261108-drag-recovery.

Finished: both docked sides scroll; timeline/defense/follow-up instructions have compact info dialogs; animation artwork/handles and target/attacker have direct placement controls with recovery. Next: continue projectile contact behavior and broader compact-help rollout. Still left: explosion/splitting/persistent areas, remaining guard/priority/hurtbox/anchor mechanics, conditional authoring and inheritance, wider accessibility/mobile checks, authenticated anonymous classroom-bank browser roundtrip, and final report audit. Overall goal remains active.


### Projectile contact audit and compact help follow-up (local)

Inspected engine.resolve/resolveSequence and shared/projectile-lifetime.js. Ordinary successful contacts increment hit counters and apply damage/reactions but do not remove the projectile; registry pruning uses lifetime, active window, fighter defeat and sequence cancellation. Thus hitLimit=1 prevents repeated ordinary damage but does not mean disappear-on-contact. Attached sequences are a separate movement behavior; reflection/absorption/parry already remove or redirect registry entities. A new contact policy must be implemented consistently in ordinary hits, hitbox groups, sequences, both previews, and versioned transport. It must explicitly define block/armor consumption, dodge/invulnerability non-contact, and first successful contact stopping further same-frame hit groups. Do not expose an unimplemented single-contact dropdown or silently reinterpret old attacks. Persistent area, explosion and splitting remain missing.

Applied existing compact-help component to projectile lifetime/clash explanations and steering instructions. Authored-path-disabled steering warning remains visible with role=status. Existing projectile authoring and context-help focused tests pass. These two editor file changes are local only, awaiting browser QA and scoped publication; full suite logs at /private/tmp/projectile-help-studio-tests.txt and /private/tmp/projectile-help-arena-tests.txt. Original goal remains active. Next: verify/publish compact projectile help and implement shared explicit projectile contact policy with backward-compatible defaults and runtime/preview regression coverage.


### Projectile help release published; deployment pending

Scoped Studio commit494011226a1f59c7567c7de12d116fbab72f7ac3 contains4 files atop a6413b7, preserving other root entries. Full frozen Studio1327/1327 and Arena624/624 pass. Browser verified return-steering help content, modal close and focus restoration to its info button. Screenshot /private/tmp/cyber-pet-projectile-help.jpg; evidence release-staging/20261108-projectile-help. Pages42531347690 build succeeded, deployment still running; watch session40807 remains active. Do not claim live delivery yet. After it succeeds run /private/tmp/verify_projectile_help_release.py, save receipt, and update this record. Next combat milestone: explicit single-contact projectile policy shared across Arena and ordinary/sequence previews, preserving omitted legacy behavior, stopping same-frame extra hit groups on successful hit/block/armor and respecting dodge/invulnerability/reflection/absorption. New behavior needs versioned transport before authoring/publication. Broader report remains unfinished.


### Explicit projectile contact policy (local; not published)

Added optional projectileContact single/repeat for independent damage/push projectiles. Omitted setting retains existing behavior. Single ends after first successful hit/block/armor, stops extra same-frame groups/events, preserves owner recovery, and does not spend contact on dodge/invulnerability. Reflection/absorption retain precedence. Both ordinary and sequence previews remove projectile visuals and explain skipped later sequence hits. Shared helper copied identically to both apps. Version19 classification, project/bank/tree/catalog reads and capability negotiation protect the field; older servers refuse writes before PUT. Editor exposes contact mode and visible multi-hit warning, removes policy when independent lifetime is disabled, and preserves through Undo/Redo/import. Narrow design.js commit handler change required when staging; do not publish unrelated concurrent local edits.

Validation: full Arena635 and Studio1330 passed, followed by three additional passing focused dodge/reflect/absorb runtime tests. Full final Arena total should be638 on next release check. Source diff check clean. Tests cover hit/block/armor, preserved recovery, old repeated behavior, invulnerability-to-hit, overlapping groups, ordinary/sequence previews, invalid values, version19 bank roundtrip and old-server refusal, authoring/recovery. Server still live71/version18; next must migrate server safely to19, verify browser export/import and actual disappearing projectile, then scoped staging/full checks/publication. The help-only Studio deployment42531347690 is still running under watch session40807; poll same handle and verify /private/tmp/verify_projectile_help_release.py after success. Overall goal remains active.


### Classroom server72/contact19 verified live; browser QA underway

Sites server72 deployed successfully (source664c401f7a33ffc0ade27131677496b67938efa5, saved appgprj_6ac1778cd32081918ba530bb3c83b9d6~appgver_4c1b82e13b48819196846416e2101069, deployment appgdep_6af0fc51bc008191859756f0819f7e04). Public capability19 and revision protection verified;24 anonymous in-memory server tests pass. No real classroom writes. Evidence release-staging/20261108-projectile-contact/server-publication.json.

Browser created an anonymous Traveling bolt with single contact,5 permitted hits,60 active frames,0 knockback; exported version19 to /Users/timetravellog/Downloads/cyber-pet-arena-practice (8).json and imported in local Arena. Studio explains first-successful-contact removal. Guard comparison had0 damage but no explanation, so added per-tick projectile contact-end records and comparison rows (exactly once through hitstop);13 focused runtime tests now pass. Refresh browser/cache to verify new comparison row and capture screenshot before release. New source remains local, not published; server supports it already.

Help-only Pages42531347690 first attempt failed after10m28s syncing_files timeout and cancelled its deployment. Confirmed terminal failure from logs before retrying only failed jobs on the same run. New watch launched; do not restart unless this attempt terminates. Verify four live files with /private/tmp/verify_projectile_help_release.py after success. Next: finish contact browser checks, scoped Studio staging preserving concurrent local work, full final suites and client releases. Original combat/editor/report scope remains active.


### Contact19 clients published; deployment verification pending

Browser verified version19 import into Arena with5 configured hits: at200px distance projectile visible at frame20, removed on full guard at frame54, absent frame70; row explains later hits cancelled. Screenshot /private/tmp/cyber-pet-single-contact.jpg and browser-qa.json in release-staging/20261108-projectile-contact. Clarified summary's automatic-follow-up contact count. Final full suites Arena639/639 and staged Studio1330/1330 pass. Studio staging preserves existing dependency cache identities and narrowly patches published design commit handler, bank and tree formats. Source publication: Arena9d1025cdd227258bc99c801dc3a818993a71e41d (Pages42532631928), Studioc8e62a399f8f2661d18a57e14ac44e379b39d972 (Pages42532641794). Both deploying; do not claim live yet. Server72 already live19. After both succeed run /private/tmp/verify_projectile_contact_release.py and save deployment receipts. Older help-only retry42531347690 remained queued last checked; new contact release includes its changes. Keep all processes/artifacts, do not restart on observation timeout. Next after live verification: remaining projectile area/explosion/splitting and broader report requirements. Overall goal active.


### Contact19 verified live

Arena9d1025cdd227258bc99c801dc3a818993a71e41d and Studioc8e62a399f8f2661d18a57e14ac44e379b39d972 deployments succeeded.52 live files matched hashes, downloaded contact editor/format/context-help tests pass. Latest Pages build explicitly names c8e62a3. Evidence: release-staging/20261108-projectile-contact/deployment-receipts.json, live-file-verification.json, live-contact-tests.txt. Server72/version19 live. This also delivers the projectile compact-help changes. Old help-only run42531347690 has inconsistent GitHub status: read reports queued/no jobs, cancellation rejects as already completed. Cancellation was attempted only because superseded, not because of an observation timeout. No new deployment was created for it; latest built/served files confirmed current. Watch10494 may remain observational; do not restart old build.

Next: projectile-created persistent areas/explosion/splitting, remaining priority/guard/throws and geometry/anchors/hurtboxes, authoring inheritance/conditional blocks/audio/camera, wider accessibility/device testing, authenticated anonymous bank browser roundtrip, and final requirement audit. Original goal remains active; verified templates and steering are no longer incorrectly listed as pending.


### Projectile impact-area foundation (local, incomplete)

Added shared projectile-area.js validation, stationary contact-centered bounds, next-combat-frame start, exclusive expiry, per-target hit count/interval and collision-dependent claiming. New projectileArea {width,height,duration,interval,hitLimit,damage} requires a single-contact independent damage projectile; version20 envelopes protect it. Local project/bank/tree/catalog readers negotiate20; live server remains72/version19 and refuses area writes. Arena stores areas separately from projectiles, snapshots collision/defense before resolution, permits walking out/reentry, respects guard/invulnerability/dodge/parry, survives owner interruption and clears on reset/defeat.16 areas per owner cap reports rejection. Areas deal fixed authored damage without an extra launch/hitstun/status, starting after impact to prevent same-frame double hits. Ordinary and sequence previews have area ticks and expose area bounds in frame snapshots. No editor/UI rendering or publication yet.

Six focused tests pass: shared timing, ordinary runtime/preview HP parity, leaving/reentering, exact schema/version rejection, interruption/pause/guard, invulnerability/defeat. Full local suites Arena645/645, Studio1330/1330 pass; logs /private/tmp/area-foundation-{arena,studio}-tests.txt. Still needed before release: sequence/area-defense and reflected ownership coverage, grouped-contact anchor correctness (current spawn uses primary snapshot box), area hit reporting and replay lifetime/unfinished accounting, visible area rendering in both apps, editor controls and dependent-setting cleanup, fixed-damage/no-reaction help, server20 migration/roundtrip, browser QA, scoped staging and publication. Do not claim area feature complete or deploy this foundation as finished. Next continue those requirements. Overall goal active; splitting/explosion and other report work remain.


### Impact-area authoring/rendering and interaction checks (local)

Added projectile-area-editor.js with enable/disable, width/height, lifetime, interval, per-target hit limit and fixed damage; compact info dialog documents no added launch/hitstun/status, next-frame pulses, escape/reentry and16-area bound. Enabling chooses single contact; changing persistence/contact removes dependent area, Undo/import restores. Version20 editor save and invalid values pass actual-handler regression. Studio draw renders translucent area bounds even with debug boxes off; contact metrics include area pulses. Arena draws areas separately from projectile art; comparison snapshots/rendering expose active bounds and remaining time, area hit/block rows, and unfinished status while areas remain. No browser QA of these new visuals yet.

Fixed grouped contact anchor using the actual overlapping box, including the shared sequence preview path. Added tests for grouped primary-box displacement, sequence/runtime area damage parity, reflected current-owner damage, replay expiry and test-limit accounting. Ten focused area runtime tests pass. Full local suites Arena649/649 and Studio1331/1331 pass; git diff check clean. Logs /private/tmp/area-authoring-{arena,studio}-tests.txt.

Still local/unpublished. Next: finish area parry/shield/armor/cap coverage and transport roundtrip diagnostics, server20 support (live server72 remains19), browser QA/export/import, scoped Studio staging (narrow design.js commit/render/metrics patch; preserve concurrent work), final tests and releases. Explosion/splitting and broader report requirements remain. Goal active.


### Impact-area defenses/transport and server73 verified

Added shield absorption, armor continuation, area parry outcome/no owner stun, and16-area bound tests. Area parry now records its outcome for cancels and comparison logs; it removes the stationary area. Added format20 bank roundtrip/older-server refusal tests in both clients and area diagnostics/lifetime warning. Full local suites Arena653/653, Studio1332/1332 pass; server25/25 anonymous in-memory tests pass. Server73 deployed successfully from b3c0102a7abbd6a84bd2dcee67aaef8b7db9a1fb and public capabilities1–20/revision protection verified. Evidence release-staging/20261108-projectile-area/server-publication.json and server-live-capabilities.json. No real classroom data writes. Client impact-area changes still local/unpublished.

Next: browser author/edit/export/import/replay and visual QA, including clarity of area bounds/counts/expiry; scoped Studio staging preserving concurrent work and narrow design.js commit/render/metrics patches; final release checks, client publication and live hashes. Original broader goal active.

### November 8 — impact-area release validation

- Scoped Studio staging preserves the current published baseline c8e62a3 and unrelated local authoring changes. Fixed release cache rewriting to match complete module filenames (never JSON filename prefixes). Staged full suite: **1,332/1,332**; Arena full suite: **653/653**.
- Browser QA: authoring, help popup, version-20 export/import, and debug-independent area rendering verified. Result summary now distinguishes the initial contact from area hits. Arena comparison reproduces 19 HP initial impact at frame 17 plus five 3 HP pulses at 18/33/48/63/78; area absent at frame 108. Full guard prevents damage from all pulses.
- Evidence: release-staging/20261108-projectile-area/{browser-qa.json,studio-preview.jpg,arena-preview.jpg,studio-tests.txt,arena-tests.txt}. Server 73/version20 is live; client publication and live verification are next.
- Still outstanding: custom area artwork, explosion/splitting and remaining report scope. No real student/classroom bank records used.

### November 8 — impact-area20 delivered and live verified

- Arena `7c3e18e05f146952444fd2e08d2a7a3bbfee7022`, Studio `6f176249625abcd44f54f763f856de394f178fb0`; Pages42534391508 /42534388221 both succeeded. **63 live files matched** (17 Arena,46 Studio); downloaded area authoring/transport/contact/help checks passed. Both current release sources are live.
- Full release suites:653 Arena /1332 Studio; server73 format20 already live (25 tests). Browser screenshots and receipts are in `release-staging/20261108-projectile-area`. The result-count regression also passes against served code.
- Scope remains incomplete. Next: compact help for remaining dense editor sections; then explosion/splitting and other audited combat/authoring requirements. Custom area artwork, broader device/accessibility testing and authenticated anonymous bank browser round-trip remain outstanding.

### November 8 — expanded static section help (local, unpublished)

- Ten explicitly marked instruction paragraphs now move into info dialogs next to their headings: tuned attacks, reskin starters, effect atlas, paths, character frames, VFX layers, damage/targeting, timing, hitboxes and status effects. Live counts, warnings, bank status and training privacy notice remain visible.
- New `static-help.js` installs before library tabs/workspace reparenting. Context-help click cancels summary default activation and propagation; closing restores button focus. Idempotent setup avoids duplicate dialogs.
- Focused help tests pass, including preservation of all instruction text, visible status/counts, summary click handling and return focus. Full Studio suite rerun is `/private/tmp/static-help-full-tests.txt`.
- Still required before publication: scoped staging against published Studio6f176249, browser visual/keyboard QA (including closed summary and tabbed library), staged suite, publication and live-file verification. Do not bulk publish local design.js or HTML; preserve concurrent authoring/storage work.

### November 8 — compact-help release staged and published to source

- Scoped release baseline6f176249, commit `b5a67af584627245f3235ef3e79c3912b81a0e04`,16 files; unrelated root entries preserved. Staged full suite **1,333/1,333** passes.
- Browser verified open and collapsed hitbox summary help, keyboard Enter/Escape, focus restoration, preserving collapse state, and Effects-tab layout. Screenshot: release-staging/20261108-static-help/browser-help.jpg.
- Pages run42534912119 is in progress. Do not call the UI change live until terminal success plus live-file verification. Verifier: /private/tmp/verify_static_help_release.py.

### November 8 — compact-help live delivery confirmed

Pages42534912119 succeeded for Studio b5a67af584627245f3235ef3e79c3912b81a0e04. All16 served files match the scoped release; downloaded help/static-help/usability checks pass. Expanded compact help is delivered. Arena remains the verified impact-area20 release. Next combat milestone: explosions and projectile splitting; custom area artwork, additional combat and authoring mechanisms, authenticated bank browser verification and device/accessibility coverage remain outstanding.

### November 8 — expanding explosion foundation (local, unpublished)

- Added optional `projectileArea.blastFrames` for concentric elliptical expansion. It must be an integer1..duration and requires hitLimit1. Existing areas without it retain full-size rectangular repeated hits. The authored area bounds stay immutable; `impactAreaBox` samples expansion from the combat clock.
- Arena and both Studio preview paths collide against sampled geometry. Shared `impact-area-view.js` renders the same ellipse/rectangle in Studio, Arena and comparison replay. No authored editor controls yet; no browser QA yet.
- Format classifier marks blasts21 and rejects them in older containers; container acceptance, classroom capabilities/server and authoring controls are deliberately still pending. Do not publish this partial schema or describe explosions as delivered.
- Three new tests verify concentric growth, ellipse corner misses and boundary reach, per-target single-hit budget, Arena/preview HP parity, strict values, and old-area behavior. Full suites pass: **656 Arena /1333 Studio**. Logs: /private/tmp/explosion-foundation-{arena,studio}.txt.
- Next: finish format21 transport/server validation, explosion controls/preset/help, reaction/defense/sequence and pause tests, browser QA and scoped publication. Splitting remains a separate outstanding behavior. Broader original scope remains active.

### November 8 — explosion authoring and client transport (local, unpublished)

- Impact area selector adds “Expanding explosion · one hit” with120×120 bounds,20-frame lifetime,6-frame expansion,9 fixed damage. Interval/max-hit controls hide for explosions; expansion must fit lifetime. Switching behavior loads defaults; Undo restores previous settings. Compact help documents semantics and format21.
- Both clients accept version21 design/bank/tree containers; Arena catalog accepts21; capability negotiation requests21 only when advertised. Format20 envelopes reject blastFrames rather than silently dropping it. Legacy format20 areas remain readable and classified20.
- Added bank encode/decode, immutable old-bank preservation, capability negotiation and pre-PUT old-server refusal checks in both apps. Editor test covers save21/import, invalid expansion/lifetime rejection, hiding repeated-hit controls, behavior switch20 and Undo21.
- Full suites: **657 Arena /1335 Studio**, logs `/private/tmp/explosion-controls-{arena,studio}.txt`. Minor diagnostic wording then clarified version20 vs21. No publication yet. Classroom service remains live73/format20; production writes of explosions safely refuse until server upgrade.
- Next: server21 validation/capability upgrade through Sites workflow; expanded pause/defense/sequence checks, scoped staging/cache versions, browser visual QA and publication/live verification. Projectile splitting and broader original scope remain outstanding.

### November 8 — explosion defense/sequence checks and server74 delivered

- New tests prove pause/hitstop freeze expansion and budgets, invulnerability retains the single hit, shields absorb that hit once, area parry removes the blast without owner stun, and attached sequences cancel later projectile hits while preview/runtime HP stays equal through blast expiry. Full Arena suite **661/661** passes; Studio last full suite1335 passes.
- Classroom server **74** is live at https://cyber-pet-classroom-settings.ragingaxolotl.chatgpt.site . Source8c9a6b5bf32f4888ae0e53457df666368db6480d; saved appgprj_6ac1778cd32081918ba530bb3c83b9d6~appgver_655a9d10db24819194f0f06c6accda9e; deployment appgdep_6af1065290d88191bf57b564d27dbd45 succeeded. Public audience preserved. Live capabilities1–21 plus revision protection verified.
- **26/26** anonymous in-memory bank tests pass, including malformed blasts, format20 envelopes and old-client writes preserving stored data/revision. No real student/bank records accessed. Release evidence: release-staging/20261108-projectile-explosion/server-*.
- Explosion clients remain LOCAL/UNPUBLISHED. Next: scoped Studio staging from live b5a67af584627245f3235ef3e79c3912b81a0e04; preserve static-help changes and unrelated local work, propagate cache versions, browser visual/edit/export/import checks, full staged suite, publish/live verify. Projectile splitting and broader original scope remain outstanding.

### November 8 — explosion clients validated and source published

- Scoped Studio baselineb5a67af; release commit `e17c3540c7a27f1bb70a8b8fe21a4d49df56a31d` (47 files, unrelated root entries preserved). Arena `8a8ded0c11d77d5d30cdacc4f7a8809d5cbc4350`. Full release suites **662 Arena /1335 Studio**.
- Browser: selector and 120×120 expanding ellipse visible without debug, exported format21 imported into Arena, initial19 at frame17 plus one blast9 at18, expanded replay23 and expired38. Screenshot/test receipts in release-staging/20261108-projectile-explosion. Added replay growth/expiry regression.
- Arena Pages42535869955 succeeded; Studio Pages42535873153 still in progress at this entry. Watch sessions82327 (Studio),75475 (Arena, likely completed). Do not restart them just because observation expires. Live verifier ready: /private/tmp/verify_projectile_explosion_release.py.
- Required next: terminal Studio success, live-file verification and downloaded tests, update current overview. Then splitting and remaining original combat/authoring/device scope.

### November 8 — explosion21 live verification complete

Both client deployments succeeded. All65 changed live files match; downloaded editor/format/area/help checks pass. Explosions are delivered with editable expansion, bounds, lifetime and fixed single-hit damage. They do not add separate blast knockback/status or authored VFX; those are still potential extensions. Splitting remains next. Overall scope remains active.

### November 8 — projectile splitting geometry foundation (local, not integrated)

- New shared projectile-split.js validates a bounded timed split:2–5 children,1–300-frame delay before parent lifetime,0–180° spread,1–30px/frame speed,1–300-frame child lifetime. A fan samples explicit direction, with symmetric equal-speed rays. Children begin the frame after splitting.
- Child definition is a deep copy retaining combat/artwork settings; removes recursive splitting and parent steering/path, starts immediately with its own lifetime-sized active window. Runtime must create fresh casts/group/sequence tracking without charging another owner action.
- Four focused helper tests pass: fan symmetry/speed, launch-relative exact timing, independent definition/no recursive split, malformed/bounded inputs. This is **foundation only**: not imported by combat validation or runtime, not versioned, no editor controls, no publication.
- Next: integrate child registry spawning with owner16 cap and atomic no-partial split; preserve current ownership/reflection and no lifetime renewal; implement ray travel and collision in both previews/Arena; add actual split lifecycle/defense tests, format22 transport/server, editor controls, browser/release verification. Parent active window vs delay needs a visible diagnostic. Do not describe splitting as functional until integrated.

### November 8 — atomic split registry operation (local, unpublished)

- ProjectileRegistry.replaceWithChildren validates live parent,2–5 separate non-recursive child casts, owner16 capacity, next-frame startup and lifetime in a temporary registry before committing. A failed child/cap check leaves parent/siblings/ID counter and caller launch flags unchanged. Successful replacement keeps current owner/target and gives each child its own entity/expiry.
- Four added tests cover replacement/expiry/ownership, capacity rejection, invalid later child rollback, and dead/expired/recursive rejection. Full suites: **670 Arena /1335 Studio** (`/private/tmp/split-registry-{arena,studio}.txt`).
- Still no runtime split trigger, ray collision integration or Studio multi-source preview. Next integration must create fresh group/sequence/defense state per child, preserve reflected ownership and current travel direction, avoid same-frame contacts, and resolve reflection of child rays correctly. Then format22/client/server/editor, browser QA/publication. This registry method alone is not completed splitting.

### November 8 — Arena timed split runtime (local, unpublished)

- Arena now calls splitDue after projectile steering and before collision snapshots; replaces live parent with fresh child casts/rays using the atomic registry method. Children are excluded from collisions/clashes until their next-frame spawn. Owner recovery/cast remains independent. Direction follows steering or sampled authored travel (including reflection).
- prepareCast samples ray centers and translates grouped hitboxes consistently. Child reflection resets the ray origin at its current position and reverses vx without renewing registry expiry. Fresh per-child group/sequence/defense/outcome state avoids shared hit budgets.
- Three new runtime tests pass: next-frame children preserve owner action, child reflection preserves position/expiry and reverses travel, and three overlapping children each hit once for12 total damage. Full Arena suite **673/673** passes (/private/tmp/split-runtime-arena.txt).
- Still unfinished: Studio multi-source preview; child artwork/VFX trajectory (existing rendering handles steering but must explicitly handle rays); runtime split diagnostics/logs; capacity/reflect-parent/defense/sequence integration cases; format22 validation/transport/server and controls. New split data is not yet accepted by shared validateAttack; no published files changed. Resolve split speed bound30 versus existing projectile speed12 before exposing controls.

### November 8 — split child artwork follows collision travel (local)

- Arena effect renderer samples splitRayPosition and uses the same authored offset mapping as steered projectiles. Reflected child artwork mirrors offsets without applying the world reflection translation a second time; attached sequences still follow targets. Children render only from their activation frame.
- Renderer regression covers ray motion, reflected offsets, pre-spawn invisibility and attached fallback. Split speed bound is now1–12px/frame, matching validated projectileSpeed, with explicit13 rejection test. Focused8 tests pass; full Arena run `/private/tmp/split-artwork-arena.txt`.
- Preview integration audit: existing simulate/sequence-preview each assume one source. Independently simulating then summing children would be wrong because target reactions/status/combo/defense are shared. Next work must provide one shared target state for all sources (prefer reuse of Arena core with a preview adapter over duplicating another combat resolver). Arena engine depends on shared modules plus pure reactions/catalog; preserve legacy preview semantics/options or explicitly diagnose mismatches. No Studio split preview yet; no publication.

### Shared split-preview runtime extraction verified locally

Extracted Arena combat runtime, reaction resolver and artwork mapping into shared modules, with compatibility re-exports at existing Arena entry points and matching Studio copies. Full regression suites pass: Arena 674/674 and Studio 1335/1335 (logs /private/tmp/shared-runtime-arena.txt and /private/tmp/shared-runtime-studio.txt). This is local groundwork only: Studio multi-projectile preview integration, split authoring/validation/versioning, browser QA and publication remain unfinished. Splitting is not delivered. Previously published direct animation/target/attacker movement and both-side scrolling remain delivered; broader goal stays active.

### Split replay snapshots verified locally

Added matching combat-preview-frame.js modules for detached runtime replay snapshots: all active projectile children, IDs/current ownership, prepared collision boxes, authored artwork data, steering/rays, fighter state, areas and contacts. Future-start children are excluded until activation. Three regressions verify activation, isolation from live simulation during scrubbing, and reflection ownership/trajectory. Full suites pass: Arena 677/677 and Studio 1338/1338; logs /private/tmp/split-snapshot-arena.txt and /private/tmp/split-snapshot-studio.txt. Not wired into Studio preview yet and not published. Next integrate runtime preview options/rendering, then split authoring/schema/server support, parity/browser checks and scoped publication. Overall goal remains active.

### Runtime preview adapter verified locally

Added shared runtime-preview.js running all split children against one Arena target, with bounded combat/presentation frames, position/health/energy validation, failed-cast diagnostics and detached replay frames. New tests compare target HP and active children every frame against direct Arena execution, confirm energy rejection and authored-definition preservation. Contact parity exposed fighter objects in combo snapshots; replay now replaces those identities with fighter indices. Full Arena 680/680 and Studio 1341/1341 pass (logs /private/tmp/runtime-preview-arena.txt and /private/tmp/runtime-preview-studio.txt). Not yet wired into editor simulate/render: remaining adapter work includes existing test-bench guard, incoming-hit, resistance, facing and recovery options, coordinate conversion, output compatibility and child artwork. Split UI/schema/server/release/browser QA remain. No publication or completion claim.

### Runtime preview facing and recovery options

Shared adapter now preserves explicitly authored projectile facing independently of target placement and schedules one target recovery attempt using Studio attack-relative frame numbering. Validates recovery/facing input and reports pending/rejected/successful attempts. Regressions cover firing away, frame-zero rejection, out-of-range input and successful airborne recovery. Arena full suite 683/683 passes. Studio full run 1342/1344: two failures in usability-tree and workflow-build-path expect Add after selected attack but current tree UI says Add selected to tree (0); these files were not modified by this milestone and concurrent tree work remains preserved. Logs /private/tmp/runtime-options-{arena,studio}.txt. Preview modules still not editor-connected or published. Next retain guard/resistance/incoming-hit controls, integrate output/rendering, then schema/editor/server and browser release checks.

### Shared preview guard and resistance

Arena tick now accepts optional opponent input for guarding, retaining existing default behavior. Runtime preview supplies Shift when guard is selected. Target damageResistance defaults to zero and is applied consistently to ordinary, sequence and impact-area damage; preview validates -50..75 percent. New regressions exercise all three child contacts blocked, resistance/vulnerability, unblockable behavior and invalid input. Arena 685/685; Studio 1346/1348 with the same two tree-label failures (usability-tree/workflow-build-path), outside changed files. Logs /private/tmp/runtime-guard-{arena,studio}.txt. Still local/unpublished and not connected to editor simulate/render. Next incoming-hit support and editor output/coordinate/render integration, then split authoring/versioned persistence/server, browser QA and release.

### Scheduled incoming hit in shared preview

Runtime preview now schedules an ordinary one-frame melee test contact through Arena's action/defense resolver at the requested combat frame, once across hitstop. Reports attempted/start rejection, validates damage/frame limits, and retains launched independent children after interruption. Three new regressions verify startup cancellation, post-launch persistence, armor and invulnerability. Both full suites now pass: Arena 688/688, Studio 1352/1352 (logs /private/tmp/runtime-incoming-{arena,studio}.txt); prior tree-label failures no longer present in current concurrently updated tree. No changes to tree files by this milestone. Remaining: connect runtime results to Studio's coordinate/output/rendering contract, split schema/editor/server support, browser QA and scoped release. Splitting remains unpublished.

### Split simulation connected to public Studio model

Added split-preview.js adapter and routed simulate() for projectileSplit through it. Converts Arena ticks to zero-based Studio frames, centers relative coordinates, exposes all child collision boxes, target/owner state, contacts, impact pause, modifiers and drawable energy-failure state. Snapshot now includes detached feedback and reaction timing. Public simulate regressions verify child activation frame, relative positions, all three hits/12 damage, and failed-cast rendering. Full suites Arena 690/690, Studio 1354/1354 pass; logs /private/tmp/split-adapter-{arena,studio}.txt. Still unpublished. Remaining integration: child-specific artwork renderer and drag targets; richer per-child sequence hit-results/impact metadata (currently hitResults empty); ensure wall/preview coordinate semantics and stopped-frame rendering; format validation/editor/server, browser QA and release. Shared runtime uses real Arena stage boundaries; adapter origin480 means boundaries differ from legacy Studio simulated walls and need reconciliation or explicit UI representation before release.

### Split child artwork connected locally

Added shared projectile-preview-view.js and Studio draw branch consuming all child snapshots. Each child uses its own age/impact, collision-derived travel center, artwork offset, facing, optional path/ray orientation, opacity and frame selection. Attached child follows target. Visible instances supply the existing larger-grab hit targets; handles preserve authored layer index so editing shared child artwork remains possible. Snapshots now expose per-cast impact time. Two regressions check separate child draw positions/handles, attachment and hidden layer exclusion. Full suites Arena 692/692 and Studio 1356/1356 pass (logs /private/tmp/split-render-{arena,studio}.txt). Browser visual/drag verification pending; no release. Remaining per-child sequence results and impact telemetry, stage-boundary/ended-preview semantics, format22 validation/editor/server and browser/publication.

### Per-child sequence result telemetry

Runtime captures newly emitted sequence results during collision resolution, including consumed projectiles removed that frame. Detached records carry owner/projectile identity and global combat time. Split adapter preserves results with Studio zero-based times; sequence result table labels projectile IDs. Regression verifies three distinct connected results survive single-contact child removal. Full suites Arena 693/693 and Studio 1357/1357 pass; logs /private/tmp/split-reports-{arena,studio}.txt. Remaining diagnostic gap: hits never opened before lifetime expiry need explicit terminal reporting rather than only resolver-generated misses. Still unpublished; browser checks, stage boundaries/ended-preview state, split schema/editor/server and release remain.

### Split terminal diagnostics and central validation

Runtime tracks projectile removal through each combat tick and emits unresolved sequence-hit diagnostics once. Parent split replacement is explicitly Replaced; child expiry produces Missed with expiry reason and no invented contact frame. Captures children removed by contact in their first active frame. Central validateAttack now invokes validateProjectileSplit, rejecting invalid counts/lifetimes/delivery before preview/import use. Tests verify three unopened children expire with distinct single records and malformed split rejection. Full Arena 695/695, Studio 1359/1359 pass (logs /private/tmp/split-validation-{arena,studio}.txt). Still unpublished. Next version22 transport/editor/server, browser preview/drag verification, boundary and end-of-preview checks before release.

### Split format22 client protection

attackVersion now selects22 for projectileSplit, and older containers reject it explicitly. Updated client bank/project/tree and Arena catalog accepted versions, classroom-bank capability negotiation, and split compatibility diagnostic. New bank roundtrip test verifies immutable existing-bank handling, encoded roundtrip and rejection before PUT when server lacks22. Full Arena696/696 and Studio1360/1360 pass; logs /private/tmp/split-format-{arena,studio}.txt. Live server remains format21 and no client release has been published. Next split authoring controls, server22 support, browser/drag verification and stage-boundary/ended-preview checks before scoped release.

### Split inspector authoring wired locally

Added projectile-split-editor.js with on/off fan behavior and five validated fields (delay, count, spread, speed, lifetime), plus compact contextual help. Parent lifetime remains authoritative; enabling at an impossible one-frame lifetime rejects instead of silently changing it. Turning independent persistence off clears split settings. Studio commit callback persists/removes split definition through normal Undo workflow. Real editor-event regression passes save22, invalid counts, change/Undo, project import and persistence-off cleanup. Full Arena696/696 and Studio1361/1361 pass; logs /private/tmp/split-editor-{arena,studio}.txt. Browser visual and drag QA still pending. Live server still21; server22 and scoped client release remain, along with stage-boundary and ended-preview checks. No publication claim.

### Split browser artwork and drag QA

Fresh local asset-served origin http://127.0.0.1:8781/design.html, IAB tab95. Created anonymous Traveling bolt, enabled independent persistence and split fan, added Rotating Screen artwork. Frame60 visibly shows three separated child effects/hitboxes. Move animation drag on middle child handle changed layer offsets0/0 to20/-20; one Undo restored0/0, Redo restored20/-20. No browser error logs during playback. Artwork began later because Add layer authored start18, inherited by each child; at child age32 effects visibly render. Screenshot /private/tmp/cyber-pet-split-drag.jpg. Temporary QA root /private/tmp/cyber-pet-split-browser symlinks dist and compiler artwork; server8781 session45855, original asset-less8780 session99977 still running. Tab marked handoff. Browser not published. Next stage-boundary/end-frame review and server22/client scoped release.

### Split preview boundary/end-state review

Corrected preview horizon to include child impact-area duration; a600-frame area now finishes before the timeline ends. Replay excludes projectiles/areas whose owner or target is defeated, and carries guard state. Converted combo identity indices to Studio self/target names so outgoing combo summary displays. Split simulation exposes actual Arena boundaries (-445,+445 relative to centered attacker); wall-slam drawing uses these rather than legacy234 marker. Diagnostic explains close-up viewport may crop walls and Arena comparison supplies full-stage view. Tests cover boundary metadata, named combo telemetry and area expiry before end. Full Arena698/698, Studio1363/1363 pass (logs /private/tmp/split-end-{arena,studio}.txt). Browser split artwork/drag already verified last turn; latest marker/diagnostic changes not separately browser-checked. Next server22 support and scoped release preparation. No publication yet.

### Classroom server75 deployed: format22 splitting

Sites source opened fresh at74; public audience preserved. Added shared split validator and version22 capability/container/header gates. Anonymous in-memory server suite27/27 passes, including rejected malformed/older-client writes preserving saved bank/revision. Build/package succeeded. Source a1f5ce6848a550f9fa2c12f0bcf2bb6bfb363877; saved version75 appgprj_6ac1778cd32081918ba530bb3c83b9d6~appgver_bc5877ad9cf4819181ba8c68f9c00e04; deployment appgdep_6af10ead162c8191b63b59bc2efb3e84 succeeded. URL https://cyber-pet-classroom-settings.ragingaxolotl.chatgpt.site. Archive /private/tmp/combat-classroom-v22.tar.gz; server test log /private/tmp/split-server-tests.txt. No real classroom bank data accessed. Client split changes remain local: next scoped Studio/Arena staging, cache closure, frozen tests/browser export comparison, client publication and live verification.

### Split client candidates staged and tested

Scoped Studio candidate built atop published f16e7684fb776771a6ec2e4c2fa25471028dfceb using /private/tmp/stage_projectile_split_release.py.56 changed/new files including transitive import-cache closure; published bank/tree/design/sequence/projectile-editor entry points narrowly patched, preserving unrelated concurrent work. Snapshot full suite1363/1363 passes; Arena cache closure28 files and full698/698 pass. Evidence release-staging/20261109-projectile-split includes both logs, server75 evidence and prior local browser drag screenshot. Publisher /private/tmp/publish_studio_projectile_split.py prepared but NOT run. Next frozen-candidate browser export/Arena comparison and release diff review, then guarded client publication and live hashes/Pages verification. Overall goal active.

### Frozen split export verified in Arena browser

Staged Studio8782 tab96 authored split3/30deg/speed4/life60/delay3, startup0,active100,base4,coefficient0,knockback0,hitstun0,single contact. Export file cyber-pet-arena-practice (12).json is format22; attack attack_377c9de64baa4931a3febf6569edceef. Imported to local Arena8768 tab97, comparison distance120 Boffset180 duration60: three child contacts at frame10,12 damage, matching Studio. Screenshot /private/tmp/cyber-pet-split-arena.jpg and evidence browser-qa.json/export saved in release-staging/20261109-projectile-split. Corrected empty ordinary-hit results table (omit hitResults when no hitEvents);8 focused frozen tests pass. Diff whitespace check and56-file publisher dry-run pass. Clients not yet published. Next final diff inspection, guarded Studio publication + Arena commit/push and exact Pages/live-hash verification.

### Split client publication submitted

Reviewed scoped changes and published Arena911f432691268bccee692027be18bcbc646bed5b via non-force HEAD:main; Pages42538874806 completed success. Studio guarded56-file publication3c2e428c421ff44926ed7037aa50ba69d82d891c succeeded atop f16e7684, unrelated root entries preserved. Studio Pages42538890801 confirmed in progress (artifact upload) via live watch session57859. Continue that session/job; do not restart publication. /private/tmp/verify_projectile_split_release.py prepared for both exact commits and downloaded split/editor/runtime tests. Live hashes still pending; do not claim full live release until verifier succeeds. Evidence deployment-status.json in release-staging/20261109-projectile-split.

### Split22 release fully verified

Studio Pages42538890801 completed success at commit3c2e428c421ff44926ed7037aa50ba69d82d891c; Arena42538874806 succeeded at911f432691268bccee692027be18bcbc646bed5b. /private/tmp/verify_projectile_split_release.py verified84 live hashes (56Studio/28Arena) and focused downloaded-code tests. Evidence release-staging/20261109-projectile-split/live-file-verification.json and live-split-tests.txt. Server75 already live. Splitting milestone delivered; overall goal not complete. Remaining full-report items include guard break/crush/priority/throws, geometry rotation/anchors/hurtboxes, conditional/movement authoring and inheritance audit, area artwork, broader usability/device coverage, authenticated anonymous bank browser roundtrip and final requirements audit.

### Guard break/crush rules started locally

Added matching guard-interaction.js helpers: optional attack.guardInteraction {mode:break|crush,recoveryFrames:1..120}; requires blockable offensive melee/projectile/area. Break removes guard reduction, crush preserves it; both only select against a guarding snapshot. Accepted hit/block can force recovery without shortening existing stun or moving target. Armor/parry/evasion/invulnerability/dead targets do not trigger helper. Four regressions pass; full Arena702/702, Studio1367/1367 (logs /private/tmp/guard-rules-{arena,studio}.txt). Helpers are NOT wired into combat, preview, validation, editor or transport yet; no feature delivery claim. Next integrate shared runtime resolution (including simultaneous defense and feedback ordering), both legacy previews, format23/editor/server, browser parity and release. Prior split22 remains verified live.

### Guard interactions integrated into shared runtime locally

prepareCast selects guard rule from pre-contact defensive snapshot; ordinary/sequence/push damage uses effective guard. Accepted contact feedback carries rule; forced recovery applies after all contact/blockstun processing, before automatic follow-ups. Protected contacts cannot trigger guard recovery. Corrected push armor feedback to armor instead of hit. Four new runtime tests verify break20 vs crush12 damage, recovery lock despite80-frame ordinary blockstun settings, unchanged unguarded contacts, invulnerability and armored push. Full Arena706/706, Studio1371/1371 pass (logs /private/tmp/guard-runtime-{arena,studio}.txt). No release; legacy Studio previews and UI/transport still need integration. Next same-frame multi-hit/sequence tests, legacy preview parity, format23 validation/editor/server and browser verification.

### Guard preview parity verified locally

Ordinary and scheduled-sequence Studio previews now use frame-local guard snapshots and the shared forced-recovery helper. Guard is unavailable during forced recovery; subsequent hits use unguarded damage. Hitstop/blockstop selects the resolved guard outcome. Existing attacks without guardInteraction retain prior behavior. Same-frame independent hit-group regressions pass for break and crush; four preview/runtime parity cases cover ordinary and scheduled follow-up contacts including presentation hitstop. Full Arena712/712 and Studio1377/1377 pass (/private/tmp/guard-preview-{arena,studio}.txt). This remains unpublished. Next: format23/central validation, compact editor controls, classroom server compatibility, browser verification, scoped release. Full overall goal remains active.

### Guard format23 supported locally

Central attack validation now rejects invalid guard rules. Attack/project, skill-tree, bank and Arena catalog containers accept23, while guardInteraction requires23 and older attacks retain their minimum versions. Classroom client negotiates23 when advertised; unsupported-server writes are refused before PUT. Anonymous bank roundtrip and malformed-rule regressions pass. Full Arena714/714 and Studio1379/1379 pass (/private/tmp/guard-format-{arena,studio}.txt). Server remains live22, so guard23 classroom saves correctly remain unavailable until server update. No publication yet. Next compact guard editor + Undo, server23 support, browser parity/export/import QA, scoped publication and live verification. Overall goal active.

### Guard editor complete locally; publication pending

Added guard-editor.js within defense settings: Normal guard / Break / Crush, validated recovery1–120, contextual info popup. design.js copies/removes guardInteraction through existing history commits. UI regression proves save23, invalid recovery rejection, Undo, reopen/import, and removal. Updated prior projectile-defense UI regression to select attack-type filters by accessible label instead of assuming every defense select is a projectile filter. Full Arena714/714, Studio1380/1380 pass (/private/tmp/guard-editor-{arena,studio}.txt). No guard browser QA/publication yet. Next fresh server source + format23 validation/capabilities, anonymous tests/deployment, frozen scoped Studio staging, browser checks/export/Arena comparison, publish/live hashes. Preserve concurrent Studio work through narrow release patches. Overall goal active.

### Classroom server76 deployed: guard format23

Opened fresh source75 through Sites helper, added shared guard validator, format23 capabilities/container/client support and malformed/old-client preservation regression. All28 anonymous in-memory server tests pass (/private/tmp/guard-server-tests.txt). Build/package/source push succeeded at882f48e840fdbdf43e3454518f8c1dc25195befb. Saved appgprj_6ac1778cd32081918ba530bb3c83b9d6~appgver_d9a8074af434819186ce0b57d4f9a209 (76), deployment appgdep_6af1131994e08191a476157bb395471a succeeded. URL https://cyber-pet-classroom-settings.ragingaxolotl.chatgpt.site . Archive /private/tmp/combat-classroom-v23.tar.gz. Session stores guardSite/guardCred(secret)/guardSource/guardPackage/guardSaved/guardDeployment. Guard editor/Arena release still LOCAL: next frozen scoped release staging, browser export/import/guard comparison and info popup QA, publish and live-hash verification. No real student data accessed. Overall goal active.

### Guard release snapshot prepared

/private/tmp/stage_guard_release.py fetched fresh Studio main3c2e428c421ff44926ed7037aa50ba69d82d891c and staged50 files under release-staging/20261109-guard/studio/dist. Narrow patches for design/defense editor/bank/tree; owned guard/shared modules and transitive cache closure. Frozen snapshot tests1380/1380 pass (release-staging/20261109-guard/studio-tests.txt). Corrected version-range error text1–23 in Arena/local/staged/snapshot combat-model after review (text-only). Publisher /private/tmp/publish_studio_guard.py exists, NOT run. Browser documentation restored; IAB2 remains selected, no guard browser tab yet. Next serve frozen snapshot on fresh localhost port with artwork symlinks, browser guard/edit/Undo/help/export and Arena comparison; then cache-bust Arena import closure, full tests, scoped publishes and live hashes. Server76/format23 already live; app updates not published. Overall goal active.

### Guard browser QA found and fixed nested help bug

Frozen Studio server8783 session13706, tab98: crush + target guarding showed Guard crush; recovery20→35 thenUndo20 verified. Help popup was empty because compactSectionHelp processed h2 inside existing dialogs and hid its text again. context-help.js now skips headings inside dialog; regression calls compaction twice and checks single dialog + visible paragraph. Added context-help to owned staging list; restaged52 files. Fresh origin8784 server83924/tab99 (guardFresh) visibly shows full help text; screenshot /private/tmp/guard-help.jpg. Tab99 marked handoff. Oldtab98 cached prior graph; use99 freshorigin. Browser info/recovery checks done; export/import/Arena guard comparison still pending. Need rerun frozen fullsuite after help fix, then Arena cache closure and scoped publication/live verification. No app publication yet; server76 live. Overall goal active.

### Guard export/import browser verified; comparison feedback improved

Final frozen suite1380/1380 and Arena714/714 passed before last matchup feedback edit (/private/tmp/guard-final-{studio,arena}.txt). Retained tab99 handles failed browser.user; fresh tab100 guardRetry on8784 works. Selected crush+guard target: Studio reports Guard crush. Export /Users/timetravellog/Downloads/cyber-pet-arena-practice (13).json verified format23, one anonymous Fault-line strike attack_0f490a38eab34304b067c6499ebb6810 with crush20. Imported successfully in Arena8768 tab101 guardArena; comparison uses full120-frame guard,100frames, distance50. Zero damage expected for crush versus100% guard; UI log omitted explanation. Added explicit Guard break/crush rows in site/matchup.js, test guard-matchup.test.mjs passes. Browser no console errors; screenshot /private/tmp/guard-arena-import.jpg. Tabs100/101 marked handoff. Need refresh Arena with import cache closure, verify new row in browser, fullArena suite (now715), final scoped publication and live delivery. App guard release remains unpublished; server76 live. StagedStudio52files unchanged from help fix, all1380 pass. Overall goal active.

### Guard release published to main; Studio Pages still running

Browser fresh tab102 guardFinalArena on8768/?guard-release=23 visibly reports Frame29 Guard crush: Fault-line strike interrupts guard; recovery at least20frames. Screenshot /private/tmp/guard-arena-final.jpg copied to release evidence. Arena transitive cache closure updated18 modules; full715/715 pass. Arena commit8fd88341db154d5478a1ed57fd673bf2a26f582b pushed main; Pages42540802893 SUCCESS. Studio scoped52file commitabcb98cd30cedc567fc7b4b7c9b89a5b1b9a0aef pushed, unrelated rootentries preserved. Studio Pages42540816094 currently in_progress uploading artifact; ghwatch session68272 confirmed live (do not restart deployment). /private/tmp/verify_guard_release.py ready to verify both exact commits and downloaded guard/editor/help tests AFTER Studio job succeeds. Evidence release-staging/20261109-guard now contains test logs715/1380/28, browserQA JSON, screenshots, anonymous export, Studio publication+hashes. Server76/format23 already live. Need finish exactPagesjob, runliveverifier, reconcile overview/docs and then next full-goal milestone. Overall goal remains active.

### Guard23 release fully verified

Studio Pages42540816094 succeeded atabcb98cd30cedc567fc7b4b7c9b89a5b1b9a0aef; Arena42540802893 succeeded at8fd88341db154d5478a1ed57fd673bf2a26f582b. /private/tmp/verify_guard_release.py verified70 live hashes and downloaded guard/editor/help tests. Release evidence includes deployment-status.json, live-file-verification.json and live-guard-tests.txt. Overall goal remains active. Next geometry milestone: audit rotation across hit detection, projectile clashes, mirrored world transforms, drawing, dragging and versioned transport; then animation anchors and authored hurtboxes. Existing geometry source confirms axis-aligned broad-phase and ellipse math, so adding only a rotation control would be incorrect. Remaining full-report work also includes broader priority/throws, conditional/movement blocks, inheritance audit, audio/camera, area artwork, broader accessibility/device checks and final scope audit.

### Rotation geometry foundation implemented locally

Shared hitbox-shapes.js now exposes rotatePoint/shapeBounds, rotates polygon points and ellipse picking, uses rotated broad-phase bounds, and tests rotated ellipse/polygon contacts in ellipse-local coordinates. Ellipse/ellipse overlap uses affine transform into unit-circle space and covariance diagonalization before the established closest-point solve (no polygon approximation). Clockwise screen degrees about shape center; facing mirror still pending in worldBox. Four regressions cover90degree extents/picking, exact45degree ellipse bounds and empty corner, common-rotation invariance/symmetry, ellipse tangency versus tiny overlap. Full Arena719/719, Studio1384/1384 pass (/private/tmp/rotation-foundation-{arena,studio}.txt). NOT published or exposed in editor yet. Need optional rotation validation + world-facing mirroring, outline renderers and local-axis resize handles, grouped/ordinary/projectile parity, format24/client/server transport, compact authoring/Undo, browser QA and scoped release. Existing guard23 is verified live. Overall goal active.

### Rotation world transform and runtime parity integrated locally

validateHitboxRotation accepts optional finite numeric[-180,180] degrees on primary/grouped boxes; worldBox preserves rotation and negates it when facing left. Arena app drawCollision and Studio drawBox ellipse outlines use the angle (polygon outlines already use shared shapePoints).18 new regressions cover reflected polygon vertices, four shapes×two facings×primary/group contacts and invalid primary/grouped values. Full Arena737/737, Studio1402/1402 pass (/private/tmp/rotation-runtime-{arena,studio}.txt). Not published. Next rotated drag/resize handles and renderer/replay coverage; projectile reflection/splitting/clash/area-anchor audit; format24 guards/editor/server; browser QA and scoped release. No new rotation UI yet. Full overall goal active; guard23 remains latest live release.

### Rotated resize handles integrated locally

Shared hitboxResizeHandles rotates width/height/corner handles about the shape center. Studio uses it for drawing and pointer hit testing. resizeHitbox projects drag displacement into the rotated world axes, preserves the opposite local corner for either facing, and proportionally limits changes at authored position/size bounds. Zero-angle path retains old behavior.19 focused tests cover three angles×two facings×three handle types, cursor/handle displacement, fixed corner and limits. Full Arena756/756 and Studio1421/1421 pass (/private/tmp/rotation-resize-{arena,studio}.txt). No rotation release/UI yet. Next projectile reflection/clash/split and impact-area anchor/replay audit, optional rotation controls+format24/server, browser drag/save/export parity and scoped release. Guard23 remains live; overall goal active.

### Projectile rotation reflection and replay fixes locally

transformProjectileBox now mirrors rotation as well as facing; attached primary box also mirrors its angle consistently with grouped boxes. Shared hitbox-view.js traces polygon/ellipse outlines, and Arena comparison uses it instead of strokeRect for every projectile. Regression verifies three split children inherit37degrees; reflection changes angle to-37 without moving center or renewing expiry. Renderer regression checks polygon vertices and ellipse angle. Full Arena758/758, Studio1423/1423 pass (/private/tmp/rotation-projectile-{arena,studio}.txt). Impact areas intentionally remain centered axis-aligned regions, with shared rotated contact deciding the group anchor; further rotated clash/grouped attached coverage remains before release. Next format24+rotation UI/server, remaining interaction cases, browser drag/replay QA, scoped publication. No rotation publication yet; overall goal active.

### Rotation format24 and compact editor locally complete

hasHitboxRotation detects explicit primary/group angles (including0); attackVersion/requireGroupVersion use24, project/tree/bank/catalog accept24, client negotiates24 and refuses unsupported writes. Unchanged attacks keep prior minimumversions. hitbox-rotation-editor.js provides optional finite[-180,180] angle, blank removal and compactinfo; hitbox-editor mounts primary or selectedgroup control through existing commit/history. UI tests cover validation/save24/Undo/group conversion/change/clear. Format tests cover roundtrip, older-server refusal and grouped minimumversion. Full Arena760/760 Studio1426/1426 pass (/private/tmp/rotation-editor-{arena,studio}.txt). NOT published. Next fresh server76 source -> format24 shared validator/capabilities/tests/deploy, remaining rotated clash/grouped-attached cases, frozen scoped browser drag/help/export/replay QA and publication. Guard23 still live. Overallgoal active.

### Rotation interactions verified; server24 local source prepared

Added three rotation-projectile regressions for clash outside unrotated bounds/empty-region miss, reflected attached primary+group angle/target following, and impact-area contactgroup center. All5 focused rotation-projectile tests pass; last fullsuites760/1426 precede these3 tests. Opened Sites server76 fresh via helper at882f48e840fdbdf43e3454518f8c1dc25195befb; stores rotationSite/rotationCred(secret)/rotationSource. Local /private/tmp/combat-classroom-source adds shared hitbox-shapes validation, container24/capabilities/clientVersion24 and primary/group angle gate before standard bank validation. Added anonymous version24 roundtrip/malformed-angle/old-client preservation test; all29 server tests pass (/private/tmp/rotation-server-tests.txt). Server changes NOT packaged/published yet. Next add explicit grouped-rotation servercase, package/deploy using existing rotationSource+credential (refresh credential only if expired), then frozen scoped release/browser drag/export/replay and publication. Rotation apps still local, guard23 latestlive. Overallgoal active.

### Server77/format24 live; rotation release staged

Grouped-angle server test verifies valid nested save, invalid nested values and oldcontainer refusal preserve bank+revision. All30 anonymous tests pass. Sites helper packaged/pushed eacefd648740519b89968220510704f3867f477e, archive/private/tmp/combat-classroom-v24.tar.gz. Saved appgprj_6ac1778cd32081918ba530bb3c83b9d6~appgver_3b4c3a754f34819184d5e8385cd399a2 (77), deployment appgdep_6af117973b808191bc44d5fddeb5a01a succeeded. Public URL https://cyber-pet-classroom-settings.ragingaxolotl.chatgpt.site ; livecapabilities1–24 verified. Stores rotationPackage/rotationSaved/rotationDeployment retain receipts.

/private/tmp/stage_rotation_release.py fetched freshStudio abcb98cd30cedc567fc7b4b7c9b89a5b1b9a0aef; staged57files in release-staging/20261109-rotation/studio/dist, frozen snapshot1429/1429 passes (studio-tests.txt). FullArena763/763 pass (/private/tmp/rotation-release-arena.txt). Publisher /private/tmp/publish_studio_rotation.py ready NOT run. Need inspect meaningful stageddiffs, artworksymlinks/freshlocalhost browser rotation shape/drag resize/Undo/help/export→Arena/replay, Arena cacheclosure, finalpublish/livehash. Apps rotation remains LOCAL; guard23 remains latest published apps. Overallgoal active.

### Rotation browser QA passed; ready for scoped publication

Frozen snapshot served8785 session31387; rotationTab103.45degree primary rectangle visible with angled handles. Native drag widthhandle[760,395]→[780,415] changedwidth70→86.97056274847714; Undo restored70. Info popup text readable. Export(14).json format24 retains45degree box; anonymousattack attack_ab11867b193044769d5d789942d15ec7. Arena tab104 rotationArena at8768/?rotation=24 imports, comparesA versusBoffset180,duration100:19damage atframe29, matchingStudio19. NoJSerrors. Bothtabsmarkedhandoff. Evidence release-staging/20261109-rotation/browser-qa.json, browser-editor.jpg, browser-arena.jpg, anonymous-browser-export.json. Arena24module cacheclosure updated; final763tests pass(/private/tmp/rotation-final-arena.txt). Staged1429passed before browser, no staged changes since. Server77/format24 live. Next gitdiffcheck/review, scopedArena commitpush + /private/tmp/publish_studio_rotation.py --publish; exactPagesjobs, livehash verifier adapted fromguard, reconcileoverview. Apps rotation stillNOTpublished. Overallgoal active.

### Rotation publication in progress

Arena commit7c81ff973a3b5d7fd5fa92e76a9ebab22190f709 pushedmain; Pages42542192807 SUCCESS. Studio scoped57file commit e31806148c6c0c35f4d72de7214f3c1d42aa815d pushed, unrelatedrootentriespreserved; Pages42542206880 in_progress. /private/tmp/verify_rotation_release.py ready for exactlive81file verification (expected24Arena+57Studio) and downloaded rotation editor/format/projectile/resize/runtime/geometry tests after Studio succeeds. Do not restart deployment. Server77/format24 live. Need finaljob/livehash/overviewreconcile before claiming rotation delivered.

Anchor dependency audit: posePlayback derives synced/custom index from a frame count supplied by renderer. Arena uses actual pet animation length or reference count; Studio uses reference-library count. worldBox currently receives no animation count. Therefore per-animation-frame anchors need an explicit portable timing/frame-count contract shared by runtime and preview; merely indexing against renderer assets would drift on pet-specific artwork. Frame reorder/duplicate/delete must preserve anchor mapping, facing must mirror anchor offsets, and independent projectiles must capture spawn anchor rather than follow later owner animation. Next milestone design/implementation must cover these dependencies rather than just adding anchor labels.

Studio42542206880 watcher session89173 confirmed running, uploadartifact phase. Resume polling this handle or exactjob; no restart.


### Rotation24 release fully verified

Studio Pages42542206880 succeeded at e31806148c6c0c35f4d72de7214f3c1d42aa815d. Arena42542192807 succeeded at7c81ff973a3b5d7fd5fa92e76a9ebab22190f709. Live verifier matched81 files and all focused downloaded rotation tests passed. No deployment restart was needed. Next: explicit portable animation timing contract, per-frame anchors and authored hurtboxes. Earlier direct animation/attacker/target placement, both docked-column scrolling and compact help remain delivered. Overall goal remains active.


### Animation anchor foundation implemented locally

Added identical animation-anchors.js modules in Arena shared and Studio dist. Optional animationAnchors.frames explicitly defines authored sequence positions, stable unique frame IDs and named fighter-origin points (up to32/frame, coordinates±500,1–300frames). Validator requires count agreement with authored poseFrames/poseDurations. Sampling uses existing posePlayback with authored anchor count, mirrors x by facing and returns null for missing points rather than silently snapping to origin. Four regressions cover custom boundaries, mirrored positions/no mutation, reorder with stable IDs, synced impact holds and invalid/count-mismatched definitions. Full Arena767/767 and local Studio1433/1433 pass (/private/tmp/anchor-foundation-{arena,studio}.txt). This is foundation only, NOT integrated into runtime, renderers, editor or transport and NOT published. Next wire the explicit count contract into both renderers, anchor offsets into world geometry with independent projectile spawn capture, then editor frame reorder/duplicate/delete and visual authoring, format25/server transport, browser parity and scoped release. Authored hurtboxes and remaining overall requirements still outstanding. Overall goal remains active.


### Anchor timing connected to animation renderers locally

poseFrameCount now gives explicit animationAnchors.frames count precedence over renderer asset count; poseDurations/posePlayback use that shared count. poseSourceFrames preserves explicit poseFrames or proportionally samples the available sprite sheet for authored anchor positions. Arena pose selection and Studio draw use this mapping only for anchor-enabled attacks, preserving legacy renderer behavior. New regression varies source artwork counts1/2/5/12 and verifies identical anchor timing, valid inferred source indexes and explicit frame-order preservation. Full Arena768/768 and Studio1434/1434 pass (/private/tmp/anchor-timing-{arena,studio}.txt). Not published; browser verification pending. Next: anchor binding validation and worldBox/runtime offsets, projectile spawn capture, missing-source-frame diagnostics, visual anchor editor and frame mutation synchronization, format25/server support, browser parity/scoped publication. Renderer pixel placement still differs between pet and reference artwork; anchors use fighter-origin combat pixels, not inferred anatomical points. Hurtboxes and remaining full-report scope remain outstanding. Overall goal active.


### Anchor bindings integrated into shared geometry locally

Primary/grouped boxes can name box.anchor; validateAnchorBindings validates the complete anchor sequence and requires the named point on every frame. Both combat-model copies call it. worldBox adds mirrored anchor offsets to existing geometry; projectile anchors sample the authored launch frame (scaled projectileStart/startup) rather than later animation poses, while existing path/travel stays intact. Three tests cover animated/mirrored world positions, fixed launch anchor with ongoing projectile travel, and missing primary/grouped points. Full Arena771/771 Studio1437/1437 pass (/private/tmp/anchor-bindings-{arena,studio}.txt). NOT published. Still need actual hit/replay parity tests across ordinary/grouped/sequence/attached/reflected/split projectiles, reconcile contact-held synced renderer timing against anchor clock, visual authoring and frame mutations, format25/server transport, browser QA and scoped publication. Existing version24 does not yet gate anchor properties: release must add format gate before exposure. No claim of completed anchor feature. Overall goal active.


### Anchor contact parity and synced clock verified locally

Four frame-by-frame scenarios compare ordinary/grouped anchor-driven melee contacts in Studio simulation and Arena, both facings. Target remains undamaged through frame5, then hand reaches it for10 damage; every tested frame agrees. Anchor-enabled synced playback now uses cast-relative startup timing regardless of contactFrame (including Infinity), preventing visual pose/geometry divergence and collision-dependent animation deadlock. Existing attacks without anchors retain prior timing. Full Arena776/776 Studio1442/1442 pass (/private/tmp/anchor-parity-{arena,studio}.txt). Not published. Frame-editor audit confirms reorder/delete/duplicate/reset currently manipulates only poseFrames and poseDurations: must extend these operations to preserve/mutate anchor records before UI exposure. Also still pending projectile interaction/replay parity, source-frame diagnostics, anchor visual controls, version25/server transport, browser verification and scoped release. Full goal active; authored hurtboxes and remaining report requirements incomplete.


### Anchor frame editing synchronized locally

Studio anchor-frame-edit.js remaps authored positions with deep copies, preserving stable IDs for retained frames and collision-free new IDs for duplicates. design.js frameEditor now passes position mappings on reorder/delete/duplicate; source replacement preserves the same position's anchors. Reset matches existing source positions where possible and copies nearest available position otherwise. Implicit frame sequence now uses poseSourceFrames, preserving explicit anchor count. Three pure regression tests cover reorder/deletion, repeated duplication/independent point edits, invalid mappings/no mutation. Full Arena776/776 Studio1445/1445 pass (/private/tmp/anchor-frame-{arena,studio}.txt). Browser/DOM anchor-specific Undo and frame-edit interaction tests still pending; do not claim visual QA. Need motion-change/frame-source diagnostics, visual anchor editor, projectile interaction coverage, format25/server, browser QA and scoped publication. Feature remains LOCAL and not exposed as complete. Full goal active.


### Anchor frame UI/Undo and short-artwork fallback verified locally

New DOM-harness test imports anonymous two-frame anchors, operates real frame editor controls, and verifies reordered anchors/durations, Undo, independent duplicate IDs, delete and Undo restoration. This is interaction logic coverage, not browser visual QA. Shared poseSourceFrames now clamps unavailable authored source frames to the last available sprite for anchor-enabled attacks; both renderers use the same fallback, authored source order remains unchanged, anchor timing stays independent. Regression covers2-frame and1-frame artwork with authored source4. Full Arena777/777 Studio1447/1447 pass (/private/tmp/anchor-frame-ui-{arena,studio}.txt). Still local/unpublished. Next visual anchor controls and frame selection/drag authoring, motion-change/source diagnostic UX, projectile interaction coverage, format25/server transport, browser parity and scoped publication. Overall goal active; hurtboxes and remaining combat/UX requirements incomplete.


### Anchor authoring controls implemented locally

Studio anchor-editor.js mounted in poseFrames offers opt-in anchors, authored frame selection, named point creation, numeric X/Y, copy point across frames, and primary/grouped hitbox binding. Compact info explains fighter-origin coordinates and launch-frame projectile behavior. Creation materializes pose order/durations and unique frame IDs. Mutations clone+validate then use existing history; UI regression verifies create/edit/Undo/addweapon/bind/copy. Pose frame mutations now refresh the whole pose editor to avoid stale anchor controls after count/order changes. Full Arena777/777 Studio1448/1448 pass (/private/tmp/anchor-editor-{arena,studio}.txt). Local only; direct preview dragging, browser visual QA and publication NOT done. Next synchronize selected frame to preview and implement draggable anchor markers, handle sparse imported point names and motion changes, projectile interaction parity, format25/server gating, frozen scoped release/browser QA. Current local exports still need anchor version gating before release. Full goal active; hurtboxes and remaining combat/UX scope incomplete.


### Draggable anchor preview implemented locally

Anchor editor Place point in preview sets explicit authored pose selection; draw overrides displayed attacker pose only in anchor mode and draws labeled high-contrast crosshair/ring at fighter-origin point. Pointer hit radius scales for canvas display size. Drag changes selected frame point with facing-aware deltas and±500 bounds; only pointerup records history/recomputes; pointercancel restores original point. Existing move tools leave anchor mode. Expanded UI interaction test verifies actual pointer drag coordinate changes, Undo and cancellation. Full Arena777/777 Studio1448/1448 pass (/private/tmp/anchor-drag-{arena,studio}.txt). No browser visual QA/publication yet. Next improve anchor mode exit/selection synchronization, sparse imported points/motion changes, projectile parity, version25/client/server transport, frozen browser QA/scoped publication. Overall goal remains active; anchors not yet delivered and hurtboxes/full-report requirements outstanding.


### Anchor workflow selection and sparse imports repaired locally

Anchor frame/name changes now update active placement preview; Return to combat preview explicitly exits. Play/reset/timeline scrub also exit authored-pose override so playback cannot appear frozen on a selected anchor pose. Editor lists union of imported frame point names; missing point gets explicit Add point on this frame action instead of failing coordinate mutation. Hitbox binding choices include only points present on every frame. Extended DOM interaction test proves dragging after frame selection changes only the selected frame and sparse imported points can be restored. Focused test passes; Arena777/777 full suite passes. Studio1448/1448 full suite passes (/private/tmp/anchor-workflow-studio.txt). Local only. Pending anchor version25 transport/server, projectile interactions, browser QA, scoped publish; remove/rename point UX and motion/source diagnostics also need review. Overall goal active with hurtboxes and remaining full-report scope outstanding.


### Anchor format25 clients integrated locally

hasAnimationAnchors detects authored sequence or primary/grouped anchor binding; minimum format25 and requireGroupVersion rejects older containers. Both app combat-design/tree/bank clients and Arena catalog accept25; bank read negotiates25 only when advertised and write refuses older servers. Anonymous bank roundtrip regression verifies preserved originals, exact anchor data, older-container rejection and no PUT to server24. Anchor frame UI fixture now declares25. Full Arena778/778 Studio1449/1449 pass (/private/tmp/anchor-format-{arena,studio}.txt). Server remains live77/format24, so anchor classroom writes correctly refuse until server update. Apps changes remain local. Next fresh Sites server source + shared anchor validation/capabilities/tests/deploy; projectile anchor interaction coverage, browser QA and scoped app release. Remove/rename anchor UX and source diagnostics still need review; full goal/hurtboxes/remaining report requirements active.


### Anchor projectile parity verified; server25 source prepared

Five new regressions cover frame-by-frame Studio/Arena anchored projectile contacts, both facings and ordinary/grouped boxes; split children and reflection preserve launch position/lifetime despite later anchor movement. Full Arena783/783 Studio1454/1454 pass (/private/tmp/anchor-projectile-{arena,studio}.txt). Sites fresh get_site confirms public server77; opened source at eacefd648740519b89968220510704f3867f477e via helper. Session stores anchorSite/anchorCred(secret)/anchorSource. /private/tmp/combat-classroom-source adds shared animation-anchors.js + pose-timing.js, format25 capability/client/container support and binding validation. Anonymous test verifies roundtrip, old-client refusal, bad/missing points and older-container refusal preserve bank/revision. Updated exact capability expectation; all31 server tests pass (/private/tmp/anchor-server-tests.txt). Server changes NOT packaged/deployed yet; next use retained source+credential with Sites helper build/package then save/deploy, preserving public audience. No real student data accessed. Apps anchor release remains local; browser/scoped publication still pending, full goal active.


### Classroom server78/format25 deployed and verified

Sites helper built/packaged/pushed c148f718e8622ba83e0d348783ec2fdfc7d9b94c; archive /private/tmp/combat-classroom-v25.tar.gz. Saved version78 appgprj_6ac1778cd32081918ba530bb3c83b9d6~appgver_c4107eaf3aec8191bdcd94431c5d2409; deployment appgdep_6af11cfcdc648191828b24bcca72c5cc succeeded. Public audience unchanged. URL https://cyber-pet-classroom-settings.ragingaxolotl.chatgpt.site . Live /attack-bank/capabilities returns formats1–25 and revisionProtection:true. Session stores anchorPackage/anchorSaved/anchorDeployment retain receipts; no further server deploy needed. Last31 anonymous server tests passed. Apps remain LOCAL (783Arena/1454Studio tests pass). Next scoped staging using fresh published Studio baseline, narrow anchor changes to design.js (do not bulk publish concurrent local authoring work), owned anchor/pose/sharedmodules, transitive cache closure, frozen suite, browser drag/help/Undo/export25→Arena QA, publish/live verify. Review point removal/rename and source diagnostics before freezing. Full goal active; hurtboxes and remaining report scope not complete.


### Anchor rename/delete controls verified locally; release diff audited

Added rename using New anchor name field: updates existing points across frames and primary/grouped bindings together. Delete refuses still-bound points, otherwise removes across frames; Undo restores. Extended UI regression covers refusal, rename binding transfer, Undo, detach/delete/Undo. Full Arena783/783 Studio1454/1454 pass (/private/tmp/anchor-manage-{arena,studio}.txt). Server78/format25 already live.

Release audit: normalize cache query suffixes and compare local design.js with rotation release test-snapshot baseline. Changes are anchor imports, poseSourceFrames import, anchorSelection, refresh mount, selected-pose drawing/marker, playback exit, pointer handlers, frameEditor mappings. One unrelated recompute line differs only in existing defense-property assignment order; preserve published recompute. Scoped staging can apply normalized line hunks to freshly fetched published baseline, splitting refresh/recompute hunk and excluding recompute, then retain/cache-bust dependency identities appropriately. No stage or app publish yet. Character-level SequenceMatcher diagnostic was deliberately interrupted (session56230 terminal130); line-based audit succeeded. Next frozen scoped stage+suite, browser drag/help/Undo/export→Arena, publication/live hashes. Full goal active; hurtboxes and broader scope incomplete.


### Anchor release frozen and full snapshot verified

/private/tmp/stage_anchor_release.py fetched fresh Studio main e31806148c6c0c35f4d72de7214f3c1d42aa815d;55 files staged under release-staging/20261109-anchors/studio/dist. Applies reviewed normalized line hunks from rotation baseline to fresh published design, preserves published recompute and unchanged import cache identities; owned anchor/pose/model/format modules plus narrow bank/tree25 patches and transitive cache closure. Frozen test-snapshot1454/1454 passes (studio-tests.txt). Publisher /private/tmp/publish_studio_anchors.py generated NOT run. Artwork symlinks added to snapshot only. Isolated server localhost8787 session83512 running. CUA documentation restored, selected IAB2 retained; no new anchor tab yet. Next browser create/drag/Undo/frame/rename/help/export25→Arena parity, screenshots, Arena cache closure/fullsuite, scoped publishes/live verify. Server78/format25 already live. Apps anchors remain unpublished; full goal active.


### Anchor browser authoring checks passed; Arena import pending

IAB2 tab105 anchorTab on frozen8787. Created12 anchor frames, native drag marker[626,447]→[651,430] changed(0,-35)→(15,-45); Undo restoredX0. Screenshot /private/tmp/anchor-preview.jpg copied browser-editor.jpg. Compact help popup readable. Primary hitbox bound to hand; preview reports19damage at29f. Export(16).json validated format25 and binding, copied anonymous-browser-export.json. browser-qa.json records evidence and Arena import pending. Tab105 markedhandoff; CUA bindings anchorTab/anchorFS/anchorExportPath. Need next browser Arena import/comparison, then Arena cacheclosure/fulltests, scoped publish andliveverify. No app publication yet; server78/25live. Full goal active.


### Anchor apps published to main; Pages jobs in progress

Browser Arena tab106 anchorArena imported anonymous format25 export; comparison distance72, Boffset180, duration100 reports19damage atframe29, matching Studio. NoJSerrors. Screenshot /private/tmp/anchor-arena.jpg copied browser-arena.jpg; browser-qa.json updated. Tab106 markedhandoff. Arena cacheclosure updated; full783/783 passes in release arena-tests.txt. Arena commit78ea509c2de188d657d2c72e97903893008bc1df pushedmain; Pages42544482402 confirmed in_progress. Studio scoped55file commit1f803300dd96787e29b2ac9ca67357b80b91cf80 pushedmain preserving unrelated rootentries; Pages42544494857 confirmed in_progress. DO NOT restart publication. /private/tmp/verify_anchor_release.py ready: after both exactjobs succeed, verifies live changed Arena files+55Studiofiles and downloaded anchor UI/frame/format/projectile/binding/timing tests. Need liveverify and overview reconciliation before claiming delivered. Server78/format25 already verified live. Full goal active; next authored hurtboxes after anchor release finishes.


### Anchor deployment wait verified; hurtbox integration audit

Arena Pages42544482402 completed SUCCESS at78ea509c2de188d657d2c72e97903893008bc1df. Studio42544494857 remains in_progress at1f803300dd96787e29b2ac9ca67357b80b91cf80; exact ghwatch session94363 confirmed build/uploadartifact live. Resume this handle or exactjob; do not restart deployment. Live verifier ready /private/tmp/verify_anchor_release.py aftersuccess.

Hurtbox audit: combat-runtime prepareCast builds crouch34/standing60 rectangle at247; another sequence path272; persistent impact-area overlap333 has its own rectangle. Legacy Studio combat-model151 and sequence-preview46 use standing rectangle; auto-contact helper combat-model242 another. Matchup replay draws fixed28x60 rectangles independently. Authored hurtboxes must feed all contact paths, preserve ordinary/crouched legacy defaults, use shared authored pose timing and facing, avoid multiplying damage for overlapping vulnerable shapes, and record actual regions in replay. Defending action's hurtboxes must stop on interruption/recovery according to explicit action timeline; independent projectiles must not keep an old owner hurtbox active. No hurtbox implementation yet. Full goal active.


### Anchors25 live verified; hurtbox foundation local

Studio42544494857 completed SUCCESS. /private/tmp/verify_anchor_release.py verified74livefiles and downloaded anchor tests. No further anchor deployment needed. Added shared hurtboxes.js (not wired/published): validates1–300frames/1–8regions, shape/rotation/bounds/count consistency; samples authored pose, mirrors regions, retains standing/crouch defaults. Boolean touchesHurtboxes avoids duplicate damage from overlapping regions. Three regressions; full local Arena786/786 Studio1457/1457 pass (/private/tmp/hurtbox-foundation-{arena,studio}.txt). Next integrate defender action lifetime and all runtime/preview/area collision paths plus replay, then visual authoring/transport/browserQA. Hurtbox module is foundation only, not user-visible feature. Full overall goal active.


### Hurtbox runtime contact integration local

Both shared combat-model validators now call validateHurtboxes. Arena.hurtboxesFor resolves defender cast age/lifetime and supplies authored regions only while action remains active; normal/crouched default otherwise. prepareCast ordinary/grouped/sequence contact uses boolean touchesHurtboxes; persistent area overlap also uses actual regions. Snapshot retains targetRegions plus first region targetBox for existing area anchor API. Three runtime regressions verify actual authored miss, overlapping-region damage once, expiry/interruption fallback. Full Arena789/789 Studio1460/1460 pass (/private/tmp/hurtbox-runtime-{arena,studio}.txt). NOT published. Remaining: impactAreaAnchor must inspect all targetRegions (currently firstregion fallback); source/render poseFrameCount must honor hurtbox-only sequences; legacy/singleattack previews and replay/display; simultaneous interruption/snapshot and projectile/area regressions; frame editing/visual authoring; version26/server; browser/scoped publication. Full goal active.


### Hurtbox-only timing and impact-area origin corrected locally

poseFrameCount/poseSourceFrames/posePlayback now honor hurtbox-only authored frame count and cast-relative synced clock; Arena/Studio source-frame mapping enabled for hurtboxes as well as anchors. Existing attacks retain prior timing. impactAreaAnchor accepts a region list and chooses the group's hitbox that overlaps any actual vulnerable shape; runtime passes snapshot.targetRegions. Added timing-varying-artwork and second-region contact-origin regressions. Full Arena791/791 Studio1462/1462 pass (/private/tmp/hurtbox-timing-{arena,studio}.txt). NOT published. Next replay/display actual regions, previews, all contact-type/simultaneous tests, visual editor/frame synchronization, version26/server/browser publication. Full goal active.


### Hurtbox Arena display/replay integrated locally

Arena debug collision display traces actual hurtboxes from hurtboxesFor using shared shape renderer. Comparison snapshots clone each fighter's current hurtbox list and replay draws these shapes instead of fixed body rectangles (legacy fallback retained). Shared combatPreviewFrame now includes detached hurtbox lists for Studio runtime previews. New Arena regression verifies authored ellipse/rotation snapshot, immutability after attack edit, and legacy body after action end. Full Arena792/792 passes; Studio suite /private/tmp/hurtbox-replay-studio.txt checked separately. NOT published or browser verified. Replay snapshots describe post-tick fighter state, not a claim to visualize pre-contact geometry after interruption; contact-specific overlay remains to consider. Next Studio preview draw/editor, interaction coverage, frame mutation preservation and format26/server/browser release. Full goal active.


### Hurtbox frame mutations synchronized locally

Studio remapHurtboxFrames deep-copies geometry using authored position mappings. frameEditor applies it on reorder/delete/duplicate/reset alongside anchors and durations. Extended actual-control DOM regression verifies reordered shape, duplicate counts, delete/Undo restoration with anchors+hurtboxes together. Pure regression verifies duplicate geometry can be edited without affecting original/other copy. Full Arena792/792 Studio1463/1463 pass (/private/tmp/hurtbox-frames-{arena,studio}.txt). Local only, no browserQA/publication. Current test imports hurtboxes in25 because version26 transport is still pending; update fixture when gating lands. Next hurtbox visual editor+Studio draw/lifetime integration, interaction coverage, version26/server/browser release. Full goal active.


### Hurtbox numeric authoring implemented locally

Studio hurtbox-editor.js adds opt-in per-frame regions, frame/region selectors, shape/X/Y/width/height/rotation, duplicate/delete (minimum1 maximum8), copy allframes and return default body. Cloned validated commits use existing history; removal explicitly deletes live hurtboxes before Object.assign. Compact info clarifies vulnerability versus defense windows. UI regression verifies creation/frame count, width/Undo, independent duplicate edit, invalidwidth0 rejection, copyall, default reset/Undo. Arena792/792 passes; Studio full result in /private/tmp/hurtbox-editor-studio.txt. This is numeric controls only: direct preview/drawing/dragging still pending, no browserQA or publication. Next Studio visual integration and attack lifetime parity, complete runtime cases, format26/server transport, scoped browser release. Full goal active.


### Hurtbox pose preview and dragging local

Place hurtbox in preview selects explicit authored pose and draws all regions, highlighting selected blue region. Frame/region selection updates active placement preview. Pointer picking uses actual rotated shape; facing-aware dragging clamps offsets±500, commits once on release, cancellation restores original. Play/reset/scrub and Return to combat playback exit override. Extended UI test verifies drag(55,-60)→(65,-55), Undo and cancel restoration. Full Arena792/792 Studio1464/1464 pass (/private/tmp/hurtbox-drag-{arena,studio}.txt). No browserQA/publication. Still need normal Studio playback vulnerable-region overlay/lifetime and incoming-test semantics, resizing handles, more interaction tests, format26/server, frozen scoped release/browser/liveverify. Full goal active.


### Hurtbox resize handles local

Selected authored hurtbox now draws width/height/corner handles through existing hitboxResizeHandles. Pointer picking prioritizes handles; resizing uses shared resizeHitbox with local-axis rotation/facing/bounds behavior; ordinary region drag unchanged. UI regression verifies width28→38 through pointer gesture thenUndo28. Existing shared rotated-resize tests cover geometry. Full Arena792/792 and Studio1464/1464 pass (/private/tmp/hurtbox-resize-{arena,studio}.txt). Still no hurtbox browserQA/publication. Next normal playback overlay/lifetime, incoming-test semantics and interaction coverage, format26/server transport, frozen release/browser verification. Full goal active.

### Local hurtbox playback verification

Studio playback now supplies authored attacker vulnerable regions while the owner action is active and restores the default body after completion or interruption. The normal preview draws these regions when collision boxes are enabled; split-projectile playback converts runtime regions into Studio coordinates. Focused completion/interruption coverage passes. Full suites: Arena793 / Studio1465, zero failures (`/private/tmp/hurtbox-playback-arena.txt`, `/private/tmp/hurtbox-playback-studio.txt`). These hurtbox changes remain local and unpublished. Still required: format26 client/server compatibility, broader combat interaction coverage, browser verification, scoped release and live verification. The overall goal remains active.

### Local hurtbox format26 client protection

Authored hurtboxes now select format26. Studio/Arena projects, banks, catalog imports and learning trees accept26 and reject hurtbox definitions mislabeled as older formats. Classroom-bank reads negotiate26 when offered; writes to a server lacking26 fail before PUT. Anonymous roundtrip and older-server refusal tests cover bank preservation, project imports and learning trees. Updated the combined frame-editor fixture to26. Full suites: Arena795 / Studio1467, zero failures (`/private/tmp/hurtbox-format-arena.txt`, `/private/tmp/hurtbox-format-studio.txt`). This milestone remains local: server26 support, browser QA, additional runtime interaction checks and scoped publication/live verification are still required.

### Classroom server79 / format26 published

Published server source `6d00a9eda30db7d6d7e8f4539744d10e1da8203d`, saved version79 `appgprj_6ac1778cd32081918ba530bb3c83b9d6~appgver_ecccfad04644819192cd5ce9db1fe516`; deployment `appgdep_6af122990fe8819192a56ffa25f0e29e` succeeded. Shared hurtbox validation now protects bank writes; capabilities and client negotiation support26. All32 anonymous bank tests pass, including geometry/frame-count rejection, old-client refusal, roundtrip and revision preservation. Build succeeded. No real student data was accessed. Client hurtbox editing is still local; remaining work is browser QA, wider interaction checks, scoped client publication and live verification. Authenticated anonymous browser bank roundtrip remains unverified.

### Hurtbox browser authoring check and placement fix

Local browser QA on port8790 verified12-frame region creation, selected-pose placement, drag (-14,-60)→(6,-70), one Undo restoring(-14,-60), width resize28→38.119 and one Undo restoring28. No browser JavaScript errors. Found and fixed explicit placement leaving the preview offscreen: both hurtbox and anchor placement now scroll the canvas into view; selection-only updates retain the current view. Browser verified canvas y296 after placement. Updated local design.js cache key in design.html; a fresh query/tab was required because the previous tab retained old HTML across reload. Three focused editor tests pass; previous full suites795/1467 remain the latest full-suite evidence. Screenshot `/private/tmp/hurtbox-preview-qa.png`. Preview server session62669 at8790, browser tab108 retained. Still required: broader hurtbox combat interactions, export/import browser roundtrip, frozen scoped release suites and client publication/live verification.

### Hurtbox interaction regression checks

Added four shared runtime cases: same-frame trades retain both collision snapshots despite interruption; ordinary and grouped projectiles hit a second vulnerable region even when the first misses; overlapping regions do not duplicate damage; a pose transition changes a projectile miss into a hit at the authored time. Full suites Arena799 / Studio1471 pass (`/private/tmp/hurtbox-interactions-{arena,studio}.txt`). Subsequently added a hurtbox diagnostic explaining format26, action-lifetime fallback, and the limitation of Studio's abstract incoming-damage probe; Arena comparison is needed for incoming geometry. That final diagnostic text still needs the staged release check. Pending: browser export/import and Arena behavior verification, scoped client staging/publication/live checks. Server79/format26 is already live.

### Hurtbox release staged and browser roundtrip checked

Scoped staging built against published Studio `1f803300dd96787e29b2ac9ca67357b80b91cf80`:60 files including transitive cache refresh; published recompute ordering preserved. Frozen Studio suite1471 passes. Evidence `release-staging/20261109-hurtboxes`. Browser exported authored12-frame regions as format26, imported into local Arena, ran at distance72/offset180/duration100:19 damage at frame29, matching Studio. No Arena JavaScript errors. Anonymous export and editor/Arena screenshots retained in release evidence. Browser tabs109/110 retained; server8790 session62669. Still pending: review staged diffs/cache closure, Arena release tests/commit, client publication and live file verification. Server79 is already published.

### Hurtboxes26 release verified live

Arena `a089510e1f50abbe5d7a4b8b92b85d4f81875738`, Pages42546756090 succeeded. Studio `91192006aa745d77ece4fe29ae6cf8bde1642ab3`, Pages42546768326 succeeded. All84 live file hashes match (24 Arena,60 Studio); downloaded hurtbox/editor/frame tests pass. Initial CDN503 on one file resolved on verification retry. Release suites Arena799 / staged Studio1471; server79 supports26 with32 bank tests. Evidence: `release-staging/20261109-hurtboxes`. Authored per-frame vulnerable regions, preview drag/resize/Undo, default-body fallback, runtime collisions, replay and version26 transport are delivered. Remaining overall scope includes wider priority/throws, custom area artwork and travel/target rules, property inheritance, movement/conditional blocks, audio/camera, expanded presets, broader accessibility/physical-device QA and authenticated anonymous classroom-bank browser roundtrip. Full goal remains active.

### Persistent hit-property inheritance started locally

Audit confirms batch editing and linked elemental reskins exist, but per-hit persistent property inheritance does not. Added isolated `hit-property-links.js` authoring model with source/target links, per-field overrides, chained propagation, deep-copy isolation, optional-value deletion and cycle/competing-source rejection. Timing/IDs are excluded from inherited fields. Four focused tests pass. Not integrated into editing, saving or runtime and not published. Next: editor controls and mutation handling (deletion/duplication/Quick Edit/clipboard), validation and format protection, bank roundtrip, UI and runtime parity checks. Existing concrete hit values remain required; resolve before save rather than relying on runtime to infer authoring links. Audio/VFX event-level inheritance needs the corresponding event model, still outstanding.

### Shared hit settings editor wired locally

Added a selected-hit Shared hit settings disclosure with source-hit selection, property checkboxes, link and unlink controls. Sequence editor commits reconcile source edits, individual overrides, deleted sources and ordinary-attack conversion; resolved values are validated before saving. Six focused model tests and full Studio1477 pass. Unpublished and incomplete: need actual-control UI tests/browser QA, global mutation-path integration (timeline/clipboard and Quick Edit identity behavior), shared validation/version27/server transport protection, runtime materialized-value consistency checks and scoped release. Source deletion retains last materialized values; independent duplicate behavior must be explicitly verified.

### Shared-hit actual-control and Quick Edit checks

Added DOM-harness integration test running actual Studio controls and saved drafts: create sequence, link second-hit damage, edit source, Undo, target override, unlink, Undo and ordinary conversion. Fixed design commit deletion list so removed hitPropertyLinks metadata is actually removed. Added Quick Edit grow/shrink check: retained links survive; added hits are independent; deleting the source keeps retained concrete damage. Seven model tests plus one actual-control test pass. This is headless UI evidence, not browser QA. Last full suite1477 predates these two extra tests. Remaining: timeline/clipboard mutation paths, shared format validation/version27 server protection, browser QA, staged release.

### Shared-hit timeline clipboard integration

Timeline copies resolve concrete values and retain only links whose source and target are both selected. Paste assigns new hit IDs and remaps those internal links, including across attacks. Copying only a dependent bakes its value without an external reference. Timeline commits reconcile link overrides/removals and validate resolved values. Nine focused UI/clipboard checks and full Studio1481 pass (`/private/tmp/hit-links-clipboard-tests.txt`). Not published. Next: shared validator and format27 clients/server, consistency checks for materialized values and browser authoring/export/import verification, then scoped publication.

### Shared-hit format27 clients and consistency validation

Shared module now validates source links and concrete resolved values without mutation; malformed links or stale values are rejected. Projects/banks/learning trees/catalog accept27, older-format containers reject link metadata, and bank reads negotiate27 when offered. Added shared bank/project roundtrip and stale-value checks. Sequence mutations resolve before validation; batch and bounce commits avoid double reconciliation (which could mistake propagated values for overrides). Full Arena801 passes; Studio1481 passed before two additional format tests/final bounce handling, then21 focused link/format/bounce checks pass. Need full final suite and explicit linked batch/bounce UI coverage. Server still79/format26: update required before release. Feature remains unpublished.

### Linked batch/bounce controls and recipe replacement verified

Expanded actual-control UI test: batch-edit source damage propagates and preserves links; Undo restores values; linking bounces, adding/changing source bounce, Undo, and overriding/removing target bounce work through saved drafts. Found recipe replacement retained obsolete links to removed hits; fixed recipe builder to drop old links when generating independent hit identities, with source-immutability regression coverage. Full Studio1484 passes (`/private/tmp/hit-links-final-editor.txt`). Still local/unpublished. Next required release work: classroom server format27, browser link/export/import verification, scoped staging/full parity and publication/live verification.

### Classroom server80 / format27 published

Server source `3fce337a5047a8dfa585cdad7f6d02b67123e1dc`, saved80 `appgprj_6ac1778cd32081918ba530bb3c83b9d6~appgver_55f07c1e858481919f49854536aafedc`; deployment `appgdep_6af12726c0248191a0b3bb5af4ac4abd` succeeded. Added shared hit-link validator and format27 capabilities/client negotiation.33 anonymous bank tests pass, including roundtrip, stale materialized values, missing sources, cycles, older-client refusal and unchanged saved revisions after rejected writes. Build succeeded. No real student data accessed. Client feature remains unpublished pending browser verification and staged release.

### Shared-hit release staged

Prepared scoped54-file Studio release against published `91192006aa745d77ece4fe29ae6cf8bde1642ab3`, preserving unrelated published recompute ordering and applying only the reviewed timeline callback update. Frozen staged Studio1484 tests pass (`release-staging/20261109-hit-links/studio-tests.txt`). Staging script `/private/tmp/stage_hit_links_release.py`, publisher `/private/tmp/publish_studio_hit_links.py` (not executed). Client feature remains unpublished. Next: browser QA of staged build including link/source-edit/Undo and format27 export→Arena import, then final Arena cache closure/tests, publication and live hash verification. Server80/format27 is already live.

### Shared-hit browser QA passed

Staged Studio on8791: created3-hit area sequence, linked Hit2 damage to Hit1, changed source6→17 and observed dependent17; Undo restored6 and retained link. Exported format27 with concrete damage[6,6,12]. Imported in local Arena8790, compared distance72/Boffset180/duration100: damage6/6/12 at frames35/40/45, matching Studio. Both browsers report no JS errors. Evidence/screenshots/anonymous export in `release-staging/20261109-hit-links`. Staged server session43981, browser tabs111/112 retained. Client publication still pending; next final Arena cache refresh/tests, scoped Studio publication, Pages job and live file verification. Server80 already live.
