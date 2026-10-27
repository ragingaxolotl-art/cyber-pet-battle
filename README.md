# Cyber Pet Battle Arena

Separate GitHub Pages site: https://ragingaxolotl-art.github.io/cyber-pet-battle/

Canonical checkout: `/Volumes/Cyber Pet Workspace/cyber-pet-battle`.

A real-time, keyboard-controlled **training and computer-sparring release**, using the existing Cyber Pet dojo artwork. This does not replace the main Godot care game or Attack Studio.

## Controls

- Left/right arrows move; up jumps; down crouches. Double-tap a horizontal arrow within 260 ms and hold the second press to sprint at 1.8× normal movement speed. Release to stop sprinting. Speed training still affects both speeds. Guard, crouch, jumping, attacks, hitstun, pause and focus loss cancel or prevent sprinting.
- Both fighters always face their opponent, including after crossing sides. Retreat plays movement backward. Already-fired projectiles keep their launch direction.
- Q W E A S D Z X trigger eight slots in the current attack set. The eight default normal physical attacks cost no energy, including at zero energy. Power moves retain their costs. Teacher-authored designs retain their explicitly authored costs.
- Controls appear in staggered QWE / ASD / ZX rows on the left, Space below, and the arrow cluster on the right.
- Space cycles sets. Cooldowns belong to attacks and persist across set changes.
- Tap either Shift key (release within 180 ms) to dodge; hold longer to block in any set. Both are free. Dodge is a short backward step, has a 0.75-second cooldown and an invulnerable window from simulation frames 2–13. Blocking slows movement and prevents jumping/attacking while held. Imported pets need their exact saved Dodge or Block artwork for the corresponding action.
- The first Physical set is permanent; teacher-bank and design imports add purchasable skills without replacing it.
- Escape pauses/resumes. Leaving the tab pauses and clears held keys.
- On-screen attack buttons are also usable. Click Start/Resume to focus the arena.

## Connections

**Connect pet** uses the existing classroom account and student-backups HTTPS API. Choose a pet's latest saved website backup. Credentials are memory-only, expire after 15 minutes, and are never placed in URLs or browser storage. This client only issues GET requests to student backups. Sign out clears the loaded pet and decoded images. Save an updated backup from the main game and reload here to refresh artwork/training.

**Open pet backup** reads the existing checksum-verified PetSnapshot ZIP locally. Limits and SHA-256 checks are inherited from Attack Studio. No student media, accounts, saves, or credentials belong in this repository. The one ZIP under tests is a generated anonymous square with synthetic levels.

**Teacher attack bank** reads the existing teacher-authorized classroom bank, then revokes its temporary scoped session. It never writes attacks. **Open attack design** accepts the existing Combat Design or bank JSON. Their exact motion requirements gate imported pet attacks; unknown/draft/missing artwork cannot unlock them. No preview reference artwork substitutes for a student's attack. Teacher bank updates are loaded explicitly between rounds.

Links connect back to the current pet website and Attack Studio. No changes to those production sites or their account service were required: this separate Pages site shares the already allowed GitHub origin. GitHub Pages paths are not separate browser security origins.

## Training affects the fight

Saved `progress.skills.levels` are loaded independently for all six skills, bounded 0–99. The UI shows the actual values. Computer opponents match those levels for practice; they do not overwrite them.

- Strength: physical damage scaling.
- Intelligence: default power attack scaling.
- Stamina: HP = 100 + 2 × level; energy capacity = 50 + level.
- Speed: movement speed and up to 15% shorter startup/recovery.
- Focus: up to 20% reduced cost, improved guard, shorter harmful statuses.
- Charisma: up to 20% stronger shields; authored attacks can also scale directly from it.

Attack Studio's `shared/combat-model.js` contains the imported tuning. These real-time playtest rules replace the old turn-order proposal for this arena. They are not finalized competitive balance. Temporary nutrition, care-condition, growth and viseme modifiers are not exported as a current effective-skill snapshot and are **not included** in this first release. This is stated beside the visible stats. Battle HP/energy are temporary; there are no care-health writes, persistent rewards, ranking, or online PvP.

## Runtime scope

Fixed 60 Hz simulation: facing-dependent geometry, energy paid at commitment, one cast at a time, per-attack cooldowns, shaped hitboxes, jumping/crouching, block/dodge windows, hitstun, shields, damage/healing/energy, status ticks, knockback and KO. Basic CPU pursues and chooses affordable moves. Training starts with a stationary dummy and the free Physical set. A separate mode enables computer sparring.

The authored-attack adapter is a practice implementation, not full Attack Studio parity. It uses shared validation, timing, power, hitbox geometry, paths and VFX frame helpers. Advanced reaction choreography, authored push flight duration/axis, ally/team targeting and custom visual rotation are not yet fully reproduced. Unknown/unpublished VFX are visibly reported; approved effect URLs come only from the shipped effect index. VFX are loaded on demand from the existing public Attack Studio, while dojo and reference character strips are copied into this site with provenance. Imported designs never provide arbitrary executable code or URLs.

## Run and verify

Requires Node 22 for tests and Python 3 for local preview. No npm dependencies.

```
npm test
npm run dev
```

Open http://127.0.0.1:8771. Account calls require the hosted GitHub origin; the service intentionally rejects localhost. Use anonymous ZIP fixtures for local UI checks.

GitHub Actions runs tests and publishes only `site/`. Tests and source notes are not in the web artifact. See `site/assets/PROVENANCE.md` and `site/assets/ATTRIBUTION.txt` for asset origins.

## Battle lab — October 25

Training dummy mode is the default: no AI attacks or movement, automatic facing after crossovers, hit reactions, wall impact, knockdown and recovery. Energy refills and dummy health resets without ending the session. Reset dummy, Test knockdown and Test wall hit controls expose repeatable checks. Training does not award XP.

Skill trees contain 30 starter skills across ten elements. Flip between trees, learn prerequisites, spend skill points, and map owned attacks to up to twelve uniquely named sets. Exact compiler artwork is still required for imported pets. Physical remains permanently available and free. Imported teacher banks and Studio trees enter the same learning flow; draft nodes cannot be bought. Learned attack definitions are retained in the battle profile even if a different tree is opened.

`site/progression.js` owns documented balance: point n costs 100 + 25 × (n−1) cumulative-training XP beyond the previous threshold. Lifetime XP from all six saved stats is combined. Older saves receive an estimate from the recorded level curve, inherited floors and remembered progress; previously discarded post-cap XP cannot be recovered. A high-water mark prevents repeated imports from awarding duplicate credit. Spending points never reduces pet XP or stats.

Purchases and mappings persist per pet **in this browser**, with portable battle-profile export/import. They do not sync to classroom cloud backups, and this client-side practice economy is not a trusted competitive ledger. Back up a profile before clearing browser data. On another browser, load the matching current pet backup before importing its battle profile. Anonymous demo credit is separate from connected-pet profiles.

Verification: 29 Node tests cover existing controls plus tree validation, dummy facing/recovery, caps, progression thresholds, prerequisite/spending rules, mapping ownership and stale-tab saves. Browser checks cover purchase→mapping→reload→set-cycle→attack and dummy wall recovery.


## Achievement expansion — October 27, 2026

The Honours cabinet has seven ribbons and three trophies for completed computer
sparring with a loaded pet. Awards are cosmetic and stored per pet in this browser;
the export button creates an archival JSON copy. No cloud sync/import or combat,
XP, Silver or skill-point rewards. Training dummies and samples do not qualify.
See site/achievements.js for thresholds and tests/achievements.test.mjs for checks.
Artwork is copied unchanged from the user’s reserved PixelLab library; see
site/assets/honours/ATTRIBUTION.txt. Published through the normal Battle Arena deployment workflow.
