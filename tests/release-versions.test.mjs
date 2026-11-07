import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {attackVersion} from '../site/shared/attack-format.js';
const release=JSON.parse(fs.readFileSync(new URL('../site/combat-release.json',import.meta.url)));
test('release metadata advertises every authored container version',()=>{
 for(const attack of [{},{hitEvents:[]},{hitboxGroups:[]},{defenseWindows:[]}])for(const key of ['attackDefinitionVersions','classroomBankVersions','skillTreeVersions'])assert.ok(release[key].includes(attackVersion(attack)),`${key} omits version ${attackVersion(attack)}`);
});
