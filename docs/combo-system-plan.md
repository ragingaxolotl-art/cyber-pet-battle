# Combo system — source audit and implementation acceptance

Audited November 8, 2026 after the version-12 impact release. This is planned work, not a delivered feature or a reduction of the overall report scope.

## Verified starting point

- `site/engine.js`: `cast.hits` and sequence results count contacts within a cast. Guard and armor can increment them. `metrics.hits` is a training total, not an uninterrupted-combo measure.
- `site/shared/hit-sequence.js` and `juggle-rules.js`: airborne reaction budget spans casts, but landing resets it. It is not a damage combo counter.
- `site/reactions.js`: loss of control can persist through authored motion, wall impact, knockdown and getting up. Testing only the attack's hitstun number would misclassify gaps.
- `site/engine.js`: status stun and blockstun also restrict action. Hitstop freezes combat time. Ordinary damage currently applies stat/status scaling, guard reduction and shields; sequence damage applies authored per-event damage, status scaling, guard and shields. No combo damage scaling or counter-hit modifier exists.
- `site/shared/combat-model.js` and `sequence-preview.js`: preview snapshots expose `canAct` based on stun/blockstun, but do not run multiple player-selected attacks. Arena comparison is the authority for actual follow-up chains.

## Implementation order

1. Add shared combo tracking with explicit contact outcomes and pre-contact recovery state. Expose combo count, actual HP damage and reset reason in comparison/replay before changing damage balance. Give each attacker/defender pair its own chain; reflection follows current projectile ownership.
2. Distinguish damage combos from block strings. Guard, parry, dodge and invulnerability must not increase a damage-combo count. Armor contact cannot prove an inescapable combo; report it separately. A pure push does not increase the damage hit count. Shield absorption needs explicit reporting of contact versus HP damage.
3. Reset at the first actionable combat-frame gap, defeat, training reset or new round. Airborne position alone is not proof of lost control. Status-only damage ticks do not increase or extend a combo. Simultaneous contacts must use a stable frame snapshot, so processing order cannot change reset/scaling results.
4. Add opt-in, documented scaling with bounded minimum damage percentage and hitstun floor. Legacy attacks retain existing damage unless the new rule is enabled. Model combo rules consistently across attacks rather than resetting the scale for each new cast. Do not infer a combo merely because a follow-up window opened.
5. Add counter-hit eligibility using the defender's pre-contact attack phase. Define startup/active/recovery eligibility explicitly, including armor, simultaneous trades and independent projectiles. Version any persisted rules and enforce server/client support before saving.
6. Add Studio controls and diagnostics, Arena comparison feedback, shared scenarios, then publish a scoped verified release.

## Required regression scenarios

- One-frame actionable gap versus continuous stun; expiry boundary; exact contact frame during hitstop; pause/reset.
- Two casts and automatic follow-ups; overlapping independent hit groups; scheduled and attached sequences; both facings.
- Ground launch, suspension, forced landing, knockdown/get-up and wall boundaries.
- Guard-to-hit transition, block string, armor, full/partial shield, parry, invulnerability, dodge and support/push-only effects.
- Status stun versus poison/burn damage ticks; defeat; reflected/persistent projectile ownership.
- Simultaneous trades and contacts in both processing orders; scaling clamping and deterministic integer rounding.
- Versioned project/bank/tree round trips, malformed settings, old-client overwrite protection; anonymous fixtures only.

## Explicit limits to retain in UI

A single-attack preview cannot prove a multi-attack combo. Training totals are not combo totals. Recipe templates do not supply persistent property inheritance. Authenticated bank browser roundtrip and physical-device testing remain separate verification gates. No requested mechanics are deferred by this plan.
