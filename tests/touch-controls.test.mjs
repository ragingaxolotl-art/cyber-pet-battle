import test from 'node:test';import assert from 'node:assert/strict';import {TouchInput} from '../site/touch-controls.js';
test('simultaneous fingers retain independent movement and guard',()=>{const input=new TouchInput();input.press(1,'ArrowRight');input.press(2,'Guard');input.release(1);assert.deepEqual([...input.keys()],['Guard']);input.release(2);assert.equal(input.keys().size,0);});
test('two fingers holding one direction require both releases',()=>{const input=new TouchInput();input.press(1,'ArrowLeft');input.press(2,'ArrowLeft');input.release(1);assert.ok(input.keys().has('ArrowLeft'));input.release(2);assert.equal(input.keys().size,0);});
test('pause cleanup releases all touch and keyboard-held buttons',()=>{const input=new TouchInput();input.press(1,'Guard');input.press('keyboard:ArrowUp','ArrowUp');input.clear();assert.equal(input.keys().size,0);input.release(1);assert.equal(input.keys().size,0);});
import {installTouchControls} from '../site/touch-controls.js';
function fixture(){
 const button=key=>({dataset:{hold:key},listeners:{},attributes:{},addEventListener(type,fn){this.listeners[type]=fn;},setAttribute(name,value){this.attributes[name]=value;},setPointerCapture(id){this.captured=id;},send(type,patch={}){const event={pointerId:1,button:0,preventDefault(){this.prevented=true;},...patch};this.listeners[type](event);return event;}});
 const left=button('ArrowLeft'),guard=button('Guard'),dodge=button(),root={querySelectorAll:()=>[left,guard],querySelector:()=>dodge};let running=true,dodges=0;
 const input=installTouchControls(root,{active:()=>running,dodge:()=>dodges++});return {left,guard,dodge,input,pause:()=>{running=false;input.clear();},dodges:()=>dodges};
}
for(const ending of ['pointerup','pointercancel','lostpointercapture'])test(ending+' releases only its pointer and updates pressed state',()=>{
 const f=fixture();f.left.send('pointerdown',{pointerId:1});f.guard.send('pointerdown',{pointerId:2});assert.equal(f.left.captured,1);
 f.left.send(ending,{pointerId:1});assert.deepEqual([...f.input.keys()],['Guard']);assert.equal(f.left.attributes['aria-pressed'],'false');assert.equal(f.guard.attributes['aria-pressed'],'true');
});
test('keyboard hold releases on blur and paused buttons cannot re-arm',()=>{
 const f=fixture();assert.equal(f.guard.send('keydown',{key:' '}).prevented,true);assert.ok(f.input.keys().has('Guard'));f.guard.send('blur');assert.equal(f.input.keys().size,0);
 f.left.send('pointerdown');f.pause();assert.equal(f.left.attributes['aria-pressed'],'false');f.left.send('pointerdown');f.guard.send('keydown',{key:'Enter'});f.dodge.send('click');assert.equal(f.input.keys().size,0);assert.equal(f.dodges(),0);
});
test('dodge activation is discrete and does not latch movement',()=>{const f=fixture();f.dodge.send('click');assert.equal(f.dodges(),1);assert.equal(f.input.keys().size,0);});
