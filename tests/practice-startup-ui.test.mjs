import test from 'node:test';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {environment} from './dom-harness.mjs';
const root=fileURLToPath(new URL('../site/',import.meta.url));
test('practice cannot start before skills initialize and remains playable after a loading failure',async()=>{
 const env=environment(root+'index.html',root),$=id=>env.ids.get(id),originalFetch=globalThis.fetch;
 let rejectLoading,requested=false,reached;
 const requestedPromise=new Promise(resolve=>{reached=resolve;});
 const deferred=new Promise((resolve,reject)=>{rejectLoading=reject;});
 globalThis.fetch=async url=>{if(String(url)==='starter-trees.json'){requested=true;reached();return deferred;}return originalFetch(url);};
 const loading=import('../site/app.js');
 try {
  await requestedPromise;
  assert.equal(requested,true);assert.equal($('start').disabled,true);assert.equal($('pause').disabled,true);assert.match($('start').textContent,/Loading/);
  await $('start').click();assert.equal($('overlay').hidden,false);
  rejectLoading(Error('Anonymous test: failed skill request'));await loading;
  assert.equal($('start').disabled,false);assert.equal($('pause').disabled,false);assert.match($('status').textContent,/Skill trees could not load/);
  await $('start').click();assert.equal($('overlay').hidden,true);await $('attackSlots').children[8].click();assert.equal($('status').textContent,'Quick jab');
 } finally {rejectLoading(Error('Test cleanup'));globalThis.fetch=originalFetch;await loading;}
});
