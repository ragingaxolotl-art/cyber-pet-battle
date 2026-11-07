import test from 'node:test';import assert from 'node:assert/strict';
import {attackDiagnostics} from '../site/shared/attack-diagnostics.js';
import {freshAttack} from '../site/shared/combat-model.js';
test('armor diagnostics explain version, damage and filtered preview limits',()=>{
 const a={...freshAttack(),defenseWindows:[{id:'defense_one',kind:'armor',start:0,duration:8,hits:1,against:'projectile'}]},findings=attackDiagnostics(a);
 assert.match(findings.find(f=>f.code==='armor-transfer').message,/version 4/);assert.match(findings.find(f=>f.code==='armor-behavior').message,/takes damage/);assert.ok(findings.some(f=>f.code==='armor-probe'));
 a.defenseWindows[0].against='all';assert.ok(!attackDiagnostics(a).some(f=>f.code==='armor-probe'));
});
