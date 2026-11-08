import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {environment} from './dom-harness.mjs';

// Exercise the installed application handlers, not a second input implementation.
test('Arena releases held touch controls on window loss, hidden tab and menu entry',async()=>{
 const root=fileURLToPath(new URL('../site/',import.meta.url));
 const env=environment(root+'index.html',root),$=id=>env.ids.get(id);
 await import('../site/app.js');await new Promise(resolve=>setImmediate(resolve));
 const controls=$('touchControls').querySelectorAll('[data-hold]');
 const send=(node,type,event={})=>{for(const listener of node.listeners[type]||[])listener({target:node,preventDefault(){},...event});};
 const hold=async()=>{
  await $('start').click();
  send(controls[0],'pointerdown',{pointerId:1,button:0});
  send(controls[4],'pointerdown',{pointerId:2,button:0});
  assert.equal(controls[0].getAttribute('aria-pressed'),'true');
  assert.equal(controls[4].getAttribute('aria-pressed'),'true');
 };
 const released=()=>{
  assert.ok(controls.every(button=>button.getAttribute('aria-pressed')==='false'));
  assert.equal($('pause').textContent,'Resume');
 };
 await hold();send(window,'blur');released();
 await hold();document.hidden=true;send(document,'visibilitychange');released();document.hidden=false;
 await hold();await $('mapAttacks').click();released();await $('closeMapping').click();
 await hold();await $('restart').click();assert.ok(controls.every(button=>button.getAttribute('aria-pressed')==='false'));
 // Late pointer releases after reset must not recreate an input or change the round.
 send(controls[0],'pointerup',{pointerId:1});send(controls[4],'pointercancel',{pointerId:2});
 assert.ok(controls.every(button=>button.getAttribute('aria-pressed')==='false'));
 await $('pause').click();
 // Text entry and native selects keep their arrow/attack keys.
 for(const id of ['setNameInput','directSet']){
  let prevented=false;
  send(window,'keydown',{target:$(id),key:'ArrowRight',code:'ArrowRight',preventDefault(){prevented=true;}});
  assert.equal(prevented,false,id+' retains native keyboard input');
 }
});
