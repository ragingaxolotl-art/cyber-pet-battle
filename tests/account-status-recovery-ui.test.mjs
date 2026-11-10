import test from 'node:test';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';import {environment} from './dom-harness.mjs';
test('sign-out status and controls survive an older sign-in response',async()=>{
 const root=fileURLToPath(new URL('../site/',import.meta.url)),env=environment(root+'index.html',root),originalFetch=fetch;let complete;
 globalThis.fetch=(url,options)=>String(url).includes('/student-backups')?new Promise(resolve=>complete=resolve):originalFetch(url,options);
 await import('../site/app.js');await new Promise(resolve=>setImmediate(resolve));
 env.ids.get('username').value='audit_user';env.ids.get('pin').value='12345';const loading=env.ids.get('accountForm').onsubmit({preventDefault(){}});assert.equal(typeof complete,'function');await env.ids.get('signOut').onclick();complete(new Response(JSON.stringify({backups:[]})));await loading;
 assert.equal(env.ids.get('accountStatus').textContent,'Signed out. Loaded pet cleared.');assert.equal(env.ids.get('signIn').disabled,false);assert.equal(env.ids.get('backupList').children.length,0);
});
