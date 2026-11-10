import test from 'node:test';import assert from 'node:assert/strict';
import {accountClient} from '../site/account.js';
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
const ok=value=>new Response(JSON.stringify(value));
test('an older failed sign-in cannot sign out a newer authenticated session',async()=>{
 const first=deferred(),calls=[];let count=0;const client=accountClient(async(url,options)=>{calls.push(options.headers['X-Student-Id']);return ++count===1?first.promise:ok({backups:[],items:[]});});
 const obsolete=client.signIn('audit_first','12345');const rejection=assert.rejects(obsolete);await client.signIn('audit_second','67890');first.resolve(new Response('{}',{status:401}));await rejection;
 await client.readTrees();assert.equal(calls.at(-1),'audit_second');client.signOut();
});
for(const method of ['readTrees','readBattleProfile'])test(method+' rejects a response arriving after sign-out',async()=>{
 const pending=deferred();let count=0;const client=accountClient(async()=>++count===1?ok({backups:[]}):pending.promise);await client.signIn('audit_user','12345');
 const loading=client[method]('audit_pet'),rejection=assert.rejects(loading,/session|sign in/i);client.signOut();pending.resolve(ok({profile:{petId:'audit_pet'},items:[]}));await rejection;
});
test('signing out while a JSON response body is pending prevents returned profile data',async()=>{
 const body=deferred(),started=deferred();let count=0;const client=accountClient(async()=>++count===1?ok({backups:[]}):{ok:true,json(){started.resolve();return body.promise;}});await client.signIn('audit_user','12345');
 const loading=client.readBattleProfile('audit_pet'),rejection=assert.rejects(loading,/session|sign in/i);await started.promise;client.signOut();body.resolve({profile:{petId:'audit_pet'}});await rejection;
});
test('late save success cannot become the current session revision',async()=>{
 const pending=deferred();let count=0;const client=accountClient(async()=>++count===1?ok({backups:[]}):pending.promise);await client.signIn('audit_user','12345');
 const saving=client.saveBattleProfile({petId:'audit_pet'},0),rejection=assert.rejects(saving,/session|sign in/i);client.signOut();pending.resolve(ok({revision:1}));await rejection;
});
test('download checks the session again after receiving binary contents',async()=>{
 const body=deferred(),started=deferred();let count=0;const client=accountClient(async()=>++count===1?ok({backups:[]}):{ok:true,headers:new Headers({'X-Backup-SHA256':'a'.repeat(64)}),arrayBuffer(){started.resolve();return body.promise;}});await client.signIn('audit_user','12345');
 const loading=client.download(1),rejection=assert.rejects(loading,/session|sign in/i);await started.promise;client.signOut();body.resolve(new ArrayBuffer(8));await rejection;
});
test('expiration during a pending request is enforced before returning data',async()=>{
 let time=0,count=0;const pending=deferred(),client=accountClient(async()=>++count===1?ok({backups:[]}):pending.promise,()=>time);await client.signIn('audit_user','12345');
 const reading=client.readTrees(),rejection=assert.rejects(reading,/Sign in/);time=900001;pending.resolve(ok({items:[]}));await rejection;
});
test('current profile saves retain revision and errors do not hide recovery guidance',async()=>{
 let count=0;const client=accountClient(async()=>++count===1?ok({backups:[]}):count===2?ok({revision:7}):new Response('not JSON',{status:500}));await client.signIn('audit_user','12345');assert.equal((await client.saveBattleProfile({petId:'audit_pet'},6)).revision,7);await assert.rejects(client.saveBattleProfile({petId:'audit_pet'},7),/unreadable response.*local backup/);client.signOut();
});
