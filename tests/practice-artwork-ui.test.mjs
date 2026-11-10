import test from 'node:test';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {environment} from './dom-harness.mjs';
const root=fileURLToPath(new URL('../site/',import.meta.url));
test('slow optional artwork cannot hold comparison or input controls behind initialization',async()=>{
 const env=environment(root+'index.html',root),$=id=>env.ids.get(id),originalFetch=globalThis.fetch;
 let finishArtwork,artRequested=false;
 const artwork=new Promise(resolve=>{finishArtwork=resolve;});
 globalThis.fetch=async url=>{if(String(url)==='references.json'){artRequested=true;return artwork;}return originalFetch(url);};
 let timer;
 const loading=import('../site/app.js');
 try {
  await Promise.race([loading,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Optional artwork blocked interface initialization')),2000);})]);
  assert.equal(artRequested,true);assert.equal($('start').disabled,false);
  await $('openMatchup').click();assert.equal($('matchupDialog').open,true);
  const help=$('matchupDurationTitle').querySelector('button');await help.click();assert.ok(document.querySelectorAll('dialog').some(d=>d.open&&d.getAttribute('aria-label')==='Test duration (frames) help'));
 } finally {clearTimeout(timer);finishArtwork(new Response('{}',{status:200}));globalThis.fetch=originalFetch;await loading;}
});
