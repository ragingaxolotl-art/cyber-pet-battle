import test from 'node:test';
import assert from 'node:assert/strict';
import {createTreeStore} from '../site/tree-storage.js';
function memory(){const data=new Map([['profile','original profile'],['tree','original tree']]);return {data,getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};}
test('callback failure never commits any part of a tree/profile transaction',async()=>{
 const legacy=memory(),store=await createTreeStore({legacy,database:null}),before=[...legacy.data];
 await assert.rejects(store.transaction(s=>{s.setItem('profile','changed');throw Error('invalid tree');}),/invalid tree/);
 assert.deepEqual([...legacy.data],before);
});
test('later quota failure restores all original records and a retry succeeds',async()=>{
 const legacy=memory(),store=await createTreeStore({legacy,database:null}),before=[...legacy.data],write=legacy.setItem;
 legacy.setItem=(key,value)=>{if(key==='tree'&&value==='new tree')throw new DOMException('full','QuotaExceededError');write(key,value);};
 await assert.rejects(store.transaction(s=>{s.setItem('profile','new profile');s.setItem('library','new library');s.setItem('tree','new tree');}),e=>e.name==='QuotaExceededError');
 assert.deepEqual(new Map(legacy.data),new Map(before));assert.equal(store.getItem('profile'),'original profile');
 legacy.setItem=write;await store.transaction(s=>{s.setItem('profile','new profile');s.setItem('tree','new tree');});
 assert.equal(store.getItem('profile'),'new profile');assert.equal(store.getItem('tree'),'new tree');assert.equal(legacy.data.size,2);
});
test('asynchronous callbacks are rejected without persisting staged writes',async()=>{
 const legacy=memory(),store=await createTreeStore({legacy,database:null}),before=[...legacy.data];
 await assert.rejects(store.transaction(async s=>{s.setItem('profile','changed');}),/synchronous/);
 assert.deepEqual([...legacy.data],before);
});

test('unfinished saves restore original and absent records when the store reopens',async()=>{
 const {TREE_RECOVERY_KEY}=await import('../site/tree-storage-legacy.js');const legacy=memory();
 legacy.setItem(TREE_RECOVERY_KEY,JSON.stringify({version:1,entries:[['profile','original profile'],['tree','original tree'],['new','never existed']]}));
 legacy.setItem('profile','partial');legacy.removeItem('tree');legacy.setItem('new','partial new');
 const store=await createTreeStore({legacy,database:null});assert.equal(store.getItem('profile'),'original profile');assert.equal(store.getItem('tree'),'original tree');assert.equal(store.getItem('new'),'never existed');assert.equal(legacy.getItem(TREE_RECOVERY_KEY),null);
 legacy.setItem(TREE_RECOVERY_KEY,JSON.stringify({version:1,entries:[['new',null]]}));await store.refresh();assert.equal(store.getItem('new'),null);
});
test('interrupted rollback keeps a durable original copy and recovers on a later reopen',async()=>{
 const {TREE_RECOVERY_KEY}=await import('../site/tree-storage-legacy.js');const legacy=memory(),store=await createTreeStore({legacy,database:null});const write=legacy.setItem,remove=legacy.removeItem;
 legacy.setItem=(key,value)=>{if(key==='tree'&&value==='new tree')throw new DOMException('full','QuotaExceededError');write(key,value);};
 legacy.removeItem=()=>{throw new DOMException('denied','SecurityError');};
 await assert.rejects(store.transaction(s=>{s.setItem('profile','partial');s.setItem('tree','new tree');}),/could not be restored yet/);
 assert.ok(legacy.getItem(TREE_RECOVERY_KEY));assert.equal(store.getItem('profile'),'original profile','readers see the recoverable original, not a partial save');
 legacy.setItem=write;legacy.removeItem=remove;const reopened=await createTreeStore({legacy,database:null});assert.equal(reopened.getItem('profile'),'original profile');assert.equal(legacy.getItem(TREE_RECOVERY_KEY),null);
});
test('malformed or future recovery journals are retained without replacing application data',async()=>{
 const {TREE_RECOVERY_KEY}=await import('../site/tree-storage-legacy.js');
 for(const raw of ['{broken','null',JSON.stringify({version:2,entries:[]}),JSON.stringify({version:1,entries:[['profile','one'],['profile','two']]}),JSON.stringify({version:1,entries:[[TREE_RECOVERY_KEY,'bad']]})]){
  const legacy=memory();legacy.setItem(TREE_RECOVERY_KEY,raw);const before=[...legacy.data];
  await assert.rejects(createTreeStore({legacy,database:null}),/recovery record could not be read/);assert.deepEqual([...legacy.data],before);
 }
});
test('staged reads, return values and unchanged transactions need no recovery write',async()=>{
 const legacy=memory(),store=await createTreeStore({legacy,database:null});let writes=0;const write=legacy.setItem;legacy.setItem=(key,value)=>{writes++;write(key,value);};
 assert.equal(await store.transaction(s=>{s.setItem('profile','original profile');assert.equal(s.getItem('profile'),'original profile');return 17;}),17);assert.equal(writes,0);
 await store.transaction(s=>{s.setItem('new',42);assert.equal(s.getItem('new'),'42');});assert.equal(store.getItem('new'),'42');
});
test('a journal quota failure leaves all original records untouched',async()=>{
 const legacy=memory(),store=await createTreeStore({legacy,database:null}),before=[...legacy.data];legacy.setItem=()=>{throw new DOMException('full','QuotaExceededError');};
 await assert.rejects(store.transaction(s=>{s.setItem('profile','changed');s.setItem('tree','changed');}),e=>e.name==='QuotaExceededError');assert.deepEqual([...legacy.data],before);
});
test('independent fallback controllers observe the last commit before the next transaction',async()=>{
 const legacy=memory(),one=await createTreeStore({legacy,database:null}),two=await createTreeStore({legacy,database:null});
 await one.transaction(s=>s.setItem('profile','first'));await two.transaction(s=>{assert.equal(s.getItem('profile'),'first');s.setItem('tree','second');});assert.equal(one.getItem('tree'),'second');
});
