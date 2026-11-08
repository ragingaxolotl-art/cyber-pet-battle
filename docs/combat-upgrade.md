# Combat tools upgrade — November 5, 2026

## Current status — November 8, 2026

This overview supersedes the historical status notes below. The overall goal is **not complete**. Historical “deferred” entries are not scope reductions.

| Capability | Current evidence and limits | Remaining work |
| --- | --- | --- |
| Ninth C attack slot | Published in Arena; normal/fullscreen status labels corrected; profile and draft migration tests | Continue keyboard and touch usability checks |
| Independent hits and juggling | Contact-relative projectile sequences, per-hit reactions, attached/repeated contact, 10-reaction target cap | General melee/area event sequences; resistance, recovery, deterioration and bounce budgets |
| Shared juggle budget and landing protection | Arena 821e939 / Studio bc7de02 deployed and live verified; 295 Arena / 1140 Studio source tests; 98 live hashes matched | Browser playtesting of long legacy combos; configurable balance and richer recovery rules |
| Multiple hitboxes | Grouped geometry with shared hit budgets, editor controls and timeline | Rotation, frame anchors and authored hurtboxes |
| Defense and simultaneous hits | Trades, armor, invulnerability, parry and frame windows tested | Clashing/priority, guard break/crush, throws and richer defensive interactions |
| Follow-ups | Manual and automatic attack-to-attack windows; hit/block/parry/whiff rules; eight-transition automatic cap | Movement cancels, broader conditional behavior, hitstop/blockstun and combo scaling |
| Projectile behavior | Cast-owned traveling, contact/attached sequences and movement paths | Independent persistent entities, durability, reflection, absorption, homing, return, splitting, explosion and general piercing rules |
| Save/load compatibility | Version 1–6 project/bank/tree support; classroom server v59 revision protection; anonymous API tests | Authenticated end-to-end browser save/load with anonymous fixtures; future schema migrations |
| Studio authoring | Quick Edit, selected-hit controls, basic/advanced mode, undo/redo, recovery, editable timing tracks | Timeline zoom/locking/hiding/multiselect, property inheritance, reusable behavior blocks, audio/camera tracks and expanded presets |
| Arena comparison | Two-attack tests, manual/automatic follow-ups, replay, saved scenarios, explicit duration, responsive layout | More scenario diagnostics, arbitrary chain configuration and remaining accessibility audit |
| Studio-to-Arena handoff | Live browser transfer and successful automatic follow-up checked; cleanup published | Native popup opening not verified by this browser integration |
| Browser UI checks | C label, comparison desktop/narrow layout, Studio playback/reset placement checked | Full keyboard-only, focus, mobile, error/recovery and authenticated workflows; no blanket accessibility claim |

### Next gameplay milestone: independent projectile lifetime

Common juggle accounting is published and verified. Ordinary and sequence reaction-producing contacts share ten points, including the grounded launcher; landing resets the budget. Guard, armor, invulnerability, damage-only events and parry interruptions do not consume it. Forced landing preserves motion while ordinary damage can still connect. Legacy long launch chains need balance playtesting.

Next, separate projectile lifetime from the owner's active cast before exposing persistence, reflection or splitting. Preserve existing cast-owned behavior by default. Acceptance must cover interruption, concurrent owner moves and projectiles, target defeat, expiry/reset, rendering and simultaneous impacts. Versioned authoring and bank capabilities must agree before enabling new definitions.

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
