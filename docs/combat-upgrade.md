# Combat tools upgrade — November 5, 2026

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

### Ninth attack slot C — release preparation
C sits beside X and is available in the mapper and fullscreen controls. Physical C is a free Quick jab using existing thrust artwork. Custom sets gain a ninth slot. Version-1 eight-slot profiles upgrade in memory to version 2 without changing the original stored value until a successful save; prior assignments and draft slots are preserved. Old clients reject the new profile version. Separate defense defaults to F for Block and V for Dodge; C is removed from defense choices. Combined Shift defense is unchanged. Release is isolated from unfinished cancel work. 215 tests pass; browser visual verification remains outstanding.
