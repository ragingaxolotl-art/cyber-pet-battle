import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {attackVersion} from '../site/shared/attack-format.js';
const release=JSON.parse(fs.readFileSync(new URL('../site/combat-release.json',import.meta.url)));
const fixtures=[{}, {hitEvents:[]},{hitboxGroups:[]},{defenseWindows:[]},{cancelWindows:[]},{cancelWindows:[{automatic:true}]},{projectileLifetime:1},{projectileDurability:1},{defenseWindows:[{kind:'reflect'}]},{sequenceTiming:'cast'},{movementCancels:[]},{contactFeedback:{}},{comboScaling:{}},{counterHit:{}},{hitstunScaling:{}},{bounces:{}},{projectileSteering:{}},{defenseWindows:[{energyGain:1}]},{projectileContact:{}},{projectileArea:{}},{projectileArea:{blastFrames:1}},{projectileSplit:{}},{guardInteraction:{}},{box:{rotation:0}},{animationAnchors:{}},{hurtboxes:{}},{hitPropertyLinks:[]},{projectileArea:{visual:{}}},{meleeClash:{}},{projectileFlight:{}},{throw:{}},{attackerMotion:[]},{hitEvents:[{reactionAlternatives:[]}]},{presentationEvents:[]},{hitEvents:[{impulse:{}}]},{presentationEvents:[{kind:'slow'}]}];
test('release metadata advertises every authored format through slow motion',()=>{
 const versions=fixtures.map(attackVersion);assert.deepEqual(versions,Array.from({length:36},(_,i)=>i+1));
 for(const key of ['attackDefinitionVersions','attackContainerVersions','classroomBankVersions','skillTreeVersions'])assert.deepEqual(release[key],versions,key+' must match supported authoring versions');
});
