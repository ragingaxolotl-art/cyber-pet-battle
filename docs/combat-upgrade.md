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
