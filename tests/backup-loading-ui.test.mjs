import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {fileURLToPath} from 'node:url';
import {environment} from './dom-harness.mjs';import {readBackup} from '../site/shared/backups.js';
const root=fileURLToPath(new URL('../site/',import.meta.url)),zip=fs.readFileSync(new URL('./anonymous-pet.zip',import.meta.url));const bytes=()=>zip.buffer.slice(zip.byteOffset,zip.byteOffset+zip.byteLength);
let instance=0;
async function setup(){
 const env=environment(root+'index.html',root),images=[];globalThis.createImageBitmap=async(_blob,options)=>{const image={width:options.resizeWidth,height:options.resizeHeight,closed:false,close(){this.closed=true;}};images.push(image);return image;};
 await import('../site/app.js?backup-audit='+ ++instance);for(let i=0;i<50&&env.ids.get('skillTrees').disabled;i++)await new Promise(resolve=>setImmediate(resolve));assert.equal(env.ids.get('skillTrees').disabled,false);
 const load=async(file={size:zip.length,arrayBuffer:async()=>bytes()})=>{const input=env.ids.get('petFile');input.value='selected';input.files=[file];await input.onchange({target:input});assert.equal(input.value,'');};
 return {env,images,load};
}
test('loaded artwork does not hide profile storage failure',async()=>{
 const {env,load}=await setup(),write=localStorage.setItem;localStorage.setItem=(key,value)=>{if(key==='cyber-pet-battle-profile-v1:anonymous-dojo-test')throw new DOMException('full','QuotaExceededError');write(key,value);};
 try{await load();assert.match(env.ids.get('mode').textContent,/Anonymous dojo test/);assert.match(env.ids.get('status').textContent,/profile.*(cannot|could not|unavailable|not saved)/i);}finally{localStorage.setItem=write;}
});
test('invalid and oversized replacement backups preserve the loaded pet and decoded artwork',async()=>{
 const {env,images,load}=await setup();await load();const mode=env.ids.get('mode').textContent;assert.match(mode,/Anonymous dojo test/);assert.equal(images.length,2);
 await load({size:30,arrayBuffer:async()=>new ArrayBuffer(30)});assert.match(env.ids.get('status').textContent,/ZIP directory/);assert.equal(env.ids.get('mode').textContent,mode);assert.ok(images.every(image=>!image.closed));
 await load({size:33*1024*1024,arrayBuffer:async()=>{throw Error('must not read');}});assert.match(env.ids.get('status').textContent,/under 32 MiB/);assert.equal(env.ids.get('mode').textContent,mode);assert.ok(images.every(image=>!image.closed));
});
test('a late decoded backup is discarded and its bitmaps closed after a newer selection',async()=>{
 const {env,images,load}=await setup();const decode=createImageBitmap;let release,started;const begun=new Promise(resolve=>started=resolve);let first=true;
 globalThis.createImageBitmap=async(blob,options)=>{if(first){first=false;started();await new Promise(resolve=>release=resolve);}return decode(blob,options);};
 const old=load();await begun;await load();const current=images.slice();release();await old;assert.equal(images.length,4);assert.ok(current.every(image=>!image.closed));assert.ok(images.filter(image=>!current.includes(image)).every(image=>image.closed));assert.match(env.ids.get('mode').textContent,/Anonymous dojo test/);
});
test('backup checksum failure occurs before decoding artwork',async()=>{
 let decoded=0;globalThis.createImageBitmap=async()=>{decoded++;};await assert.rejects(readBackup(bytes(),'0'.repeat(64)),/checksum did not match/);assert.equal(decoded,0);
});
test('failed bitmap decoding closes artwork already created for that candidate',async()=>{
 let count=0,closed=0;globalThis.createImageBitmap=async()=>{if(++count===2)throw Error('decode failed');return {width:1,height:1,close(){closed++;}};};await assert.rejects(readBackup(bytes()),/decode failed/);assert.equal(closed,1);
});
