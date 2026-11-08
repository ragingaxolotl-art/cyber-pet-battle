import test from 'node:test';
import assert from 'node:assert/strict';
import {attackDiagnostics} from '../site/shared/attack-diagnostics.js';
import {freshAttack} from '../site/shared/combat-model.js';
const codes=attack=>attackDiagnostics(attack).map(item=>item.code);
test('legacy attacks do not receive impact version warnings',()=>{
 assert.ok(!codes(freshAttack()).some(code=>code.startsWith('impact-')));
});
test('impact settings explain version and independent clocks, including explicit zeros',()=>{
 const attack={...freshAttack(),contactFeedback:{hitstop:0}};
 assert.ok(codes(attack).includes('impact-transfer'));
 assert.ok(codes(attack).includes('impact-clock'));
 assert.ok(!codes(attack).includes('impact-blockstun'));
});
test('guard timing diagnostics distinguish usable and inactive settings',()=>{
 const attack={...freshAttack(),blockable:true,contactFeedback:{blockstop:2,blockstun:12}};
 assert.ok(codes(attack).includes('impact-blockstun'));
 assert.ok(!codes(attack).includes('impact-unblockable'));
 assert.ok(codes({...attack,blockable:false}).includes('impact-unblockable'));
 assert.ok(codes({...attack,payload:'heal'}).includes('impact-payload'));
});
