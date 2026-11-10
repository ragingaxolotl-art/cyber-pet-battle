import {ProfileDatabase} from './profile-storage.js?v=20261110-defense-report-arena';
import {createTreeStore} from './tree-storage.js?v=20261110-storage-transaction-recovery';
import {savedTreeChoices,treeChoices,TREE_LIBRARY_KEY} from './tree-library.js?v=20261109-tree-workspace';
import {grantStarters,refreshLearnedAttacks} from './progression.js?v=20261110-defense-report-arena';
import {attackChecks} from './attack-checks.js?v=20261110-arena-shared-preview';
import {KEYS,physicalCatalog,defaultCatalog,availability} from './catalog.js?v=20261110-defense-report-arena';
import {validateAttack} from './shared/combat-model.js?v=20261110-defense-report-arena';
import {checkPlayableTree,bankTree,STUDIO_TREE_KEY} from './skill-trees.js?v=20261110-defense-report-arena';
import {ProfileStore,freshProfile,syncCredit,trainingCredit,pointsForXP,xpForPoints,balance,spentPoints,purchaseReason,buySkill,allowedAttackIds,saveSet,validateProfile} from './progression.js?v=20261110-defense-report-arena';
import {LoadoutDrafts} from './loadout-drafts.js?v=20261108-movement-cancels';
const $=id=>document.getElementById(id),el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const TREE_STORAGE='cyber-pet-battle-tree-v1';
async function readImportJson(file,kind){
 let text;try{text=await file.text();}catch{throw Error('Could not read this '+kind+' file. Choose the file again or download a new copy.');}
 try{return JSON.parse(text);}catch{throw Error('This '+kind+' file is not valid JSON. Export a new copy and try again. Your saved data has not changed.');}
}
export async function installWorkshop({getPet,pause,changed,status,testAttack,cloud}){
 const treeStore=await createTreeStore(),physical=physicalCatalog();let store=new ProfileDatabase(treeStore);
 const effectIndex=await (await fetch('effects.json')).json(),effectIds=new Set(Object.keys(effectIndex));
 let tree=checkPlayableTree(await (await fetch('starter-trees.json')).json(),effectIds),effectImages=new Map();
 try{const saved=treeStore.getItem(TREE_STORAGE);if(saved)tree=checkPlayableTree(JSON.parse(saved),effectIds);}catch(e){status('Saved tree could not load: '+e.message);}
 let profile,credit,branch=0,selectedSet=null,blocked=false,selectedKey=0,deletedSet=null,deletedDraft=null,profileIssue='';const retryProfileButtons=[];const drafts=new LoadoutDrafts();
 const draftKey=()=> 'cyber-pet-loadout-drafts:'+profile.petId;
 function registry(){const lookup=new Map(tree.nodes.filter(n=>n.attack).map(n=>[n.attack.id,n.attack]));for(const purchase of profile?.purchases||[])if(purchase.attack)lookup.set(purchase.attack.id,purchase.attack);for(const attack of physical)lookup.set(attack.id,attack);return [...lookup.values()];}
 function decks(){const lookup=new Map(registry().map(a=>[a.id,a])),owned=allowedAttackIds(profile,physical);return [{id:'physical',name:'Physical',slots:physical},...profile.sets.map(s=>({id:s.id,name:s.name,slots:s.slots.map(id=>owned.has(id)?lookup.get(id)||null:null)}))];}
 function notify(){changed({attacks:registry(),decks:decks()});$('skillBalance').textContent=balance(profile)+' skill points';}
 async function transact(update,extra){if(blocked)throw Error('Profile storage is unavailable. Your saved data has not been replaced.');const generation=profileGeneration,repository=store;const commit=async()=>{if(generation!==profileGeneration)throw Error('The selected pet changed. Try again.');const next=update(structuredClone(profile));await repository.save(next,extra);if(generation!==profileGeneration)throw Error('Saved the previous pet’s progress. Reopen the current pet to continue.');profile=next;notify();};if(navigator.locks)await navigator.locks.request('battle-profile:'+profile.petId,commit);else await commit();}
 function training(){const pet=getPet();if(pet)return pet.training||{levels:pet.skills};return {levels:Object.fromEntries(['strength','speed','stamina','intelligence','charisma','focus'].map(k=>[k,20]))};}
 let profileGeneration=0;
 async function openProfile(){
  const generation=++profileGeneration,petId=getPet()?.id||'practice-demo',trainingData=training();blocked=true;profileIssue='';invalidateCloud();for(const button of retryProfileButtons)button.disabled=true;
  let available=profile?.petId===petId?structuredClone(profile):null;
  try{
   await treeStore.refresh();if(generation!==profileGeneration)return;
   const repository=new ProfileDatabase(treeStore);available=repository.open(petId);
   const result=syncCredit(available,trainingData),next=grantStarters(result.profile,tree);
   await repository.save(next);if(generation!==profileGeneration)return;
   store=repository;profile=next;credit=result.credit;blocked=false;
  }catch(error){
   if(generation!==profileGeneration)return;profile=available||freshProfile(petId);credit=trainingCredit(trainingData);
   const reason=error?.name==='QuotaExceededError'?'Browser storage is full.':error?.name==='SecurityError'?'The browser is blocking storage.':error.message;
   profileIssue='Battle profile changes cannot be saved. '+reason+' Existing saved data is preserved. Use Retry profile storage after fixing storage.';
   status('Cannot save this battle profile: '+profileIssue);
  }
  selectedSet=profile.sets[0]?.id;drafts.load(localStorage,draftKey(),profile.sets);deletedSet=null;notify();cloudButtons(false);
  $('exportBattleProfile').disabled=blocked&&!available;
  for(const button of retryProfileButtons){button.hidden=!blocked;button.disabled=false;}
  return {saved:!blocked,message:profileIssue};
 }

 function paintEffect(canvas,node){const effect=effectIndex[node.effectId];if(!effect)return;let image=effectImages.get(effect.id);if(!image){image=new Image();effectImages.set(effect.id,image);image.src=effect.sheet;}const draw=()=>{if(!image.naturalWidth)return;const [w,h]=effect.canvas,frame=Math.max(0,(effect.impact||1)-1),scale=Math.min(canvas.width/w,canvas.height/h);const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,(frame%effect.columns)*w,Math.floor(frame/effect.columns)*h,w,h,(canvas.width-w*scale)/2,(canvas.height-h*scale)/2,w*scale,h*scale);};if(image.complete)draw();else image.addEventListener('load',draw,{once:true});}
 function renderTree(){
  const branches=[...new Set(tree.nodes.map(n=>n.branch))];branch=Math.max(0,Math.min(branch,branches.length-1));const current=branches[branch]||'No skills';$('treeTitle').textContent=current[0]?.toUpperCase()+current.slice(1)+' branch';$('treePosition').textContent=(branch+1)+' / '+branches.length;
  const earned=pointsForXP(profile.maxTrainingXP),next=xpForPoints(earned+1);$('xpSummary').textContent=`${Math.floor(profile.maxTrainingXP).toLocaleString()} combined training XP · ${earned} points earned · ${spentPoints(profile)} spent · ${balance(profile)} available`;
  $('xpNext').textContent=`${Math.ceil(next-profile.maxTrainingXP).toLocaleString()} XP to the next point. ${credit.estimated?'Older save: credit estimated from recorded training; future lifetime XP will include post-cap awards.':'Lifetime XP includes training earned after stat caps.'} ${getPet()?'':'Demo profile only.'}`;
  $('treeSkills').replaceChildren();for(const node of tree.nodes.filter(n=>n.branch===current)){
   const card=el('article'),canvas=el('canvas'),name=el('h3',node.name),description=el('p',node.description),prerequisites=el('p'),button=el('button');card.className='skill-card';canvas.width=100;canvas.height=88;canvas.setAttribute('aria-label',node.name+' effect');paintEffect(canvas,node);
   prerequisites.className='prerequisites';prerequisites.textContent=tree.starterSkills?.includes(node.id)?'Starter · given at start':node.requires.length?'Requires '+(node.requirement==='any'?'any: ':'all: ')+node.requires.map(id=>tree.nodes.find(n=>n.id===id)?.name||'Missing skill').join(', '):'Start of this path';
   const reason=purchaseReason(profile,node,tree);button.textContent=tree.starterSkills?.includes(node.id)&&reason==='Already learned'?'Starter ✓':reason==='Already learned'?'Learned ✓':`Learn · ${node.cost} point${node.cost===1?'':'s'}`;button.disabled=!!reason||blocked;button.title=reason;const note=el('small',reason||'Ready to learn');if(node.attack){const art=availability(getPet(),node.attack);if(art)note.textContent+=(note.textContent?' · ':'')+art;}
   button.onclick=async()=>{button.disabled=true;let placement='';try{await transact(p=>{let next=buySkill(p,node,tree);const first=next.sets.find(s=>s.slots.includes(null));if(first&&!availability(getPet(),node.attack)){const index=first.slots.indexOf(null);first.slots[index]=node.attack.id;placement=' Equipped to '+KEYS[index]+' in '+first.name+'.';}return next;});renderTree();const message='Learned '+node.name+'.'+(placement||' Open Attack loadouts to choose its key.');$('treeStatus').textContent=message;status(message);}catch(e){$('treeStatus').textContent=e.message;renderTree();}};
   card.append(canvas,name,description,prerequisites,button,note);$('treeSkills').append(card);
  }
 }
 function openTree(){pause();renderTree();$('treeStatus').textContent=blocked?profileIssue:'Progress and named sets are saved for this pet in this browser. Export a battle profile to keep a portable copy.';$('skillsDialog').showModal();}

 function committed(){return profile.sets.find(s=>s.id===selectedSet);}
 function persistDraft(){try{drafts.save(localStorage,draftKey());}catch{ $('mappingStatus').textContent='Draft recovery unavailable. Save the set before leaving.';}}
 function captureDraft(){const set=committed();if(!set)return;const next={id:set.id,name:$('setNameInput').value,slots:[...document.querySelectorAll('#mappingKeys select')].map(s=>s.value||null)};if(!drafts.drafts.has(set.id))drafts.change(set);drafts.change(next);persistDraft();$('mappingDirty').textContent=drafts.dirty(set)?'Unsaved set changes · draft kept on this device':'Set saved';}
 function renderSetList(){const select=$('setList');select.replaceChildren();for(const set of profile.sets)select.add(new Option(set.name,set.id));if(!profile.sets.some(s=>s.id===selectedSet))selectedSet=profile.sets[0]?.id;select.value=selectedSet||'';renderMapping();}
 function renderMapping(){
  const source=committed(),set=source?drafts.read(source):null;$('setNameInput').value=set?.name||'';$('mappingKeys').replaceChildren();
  const owned=allowedAttackIds(profile,physical),attacks=registry();
  for(let i=0;i<KEYS.length;i++){
   const label=el('label'),key=el('button',KEYS[i]),select=el('select');key.type='button';key.setAttribute('aria-pressed',String(i===selectedKey));key.onclick=()=>{selectedKey=i;renderMapping();};
   select.setAttribute('aria-label','Attack for '+KEYS[i]);select.add(new Option('Empty',''));
   for(const a of attacks.filter(a=>owned.has(a.id))){const problem=availability(getPet(),a),option=new Option(a.name+(problem?' · artwork needed':''),a.id);option.disabled=!!problem;select.add(option);}
   const saved=set?.slots[i],assigned=attacks.find(a=>a.id===saved);key.setAttribute('aria-label',KEYS[i]+': '+(assigned?.name||(saved?'Unavailable attack':'Empty slot')));if(saved&&!attacks.some(a=>a.id===saved)){const option=new Option('Unavailable attack (kept)',saved);option.disabled=true;select.add(option);}select.value=saved||'';select.disabled=!set;select.onchange=()=>{captureDraft();selectedKey=i;renderMapping();};label.append(key,select);$('mappingKeys').append(label);
  }
  for(const id of ['saveMapping','deleteSet','duplicateSet','discardMapping','clearSlot','swapSlots'])$(id).disabled=!set||blocked;
  $('undoSetDelete').disabled=!deletedSet||blocked;$('undoMapping').disabled=!drafts.undo.length;
  $('mappingDirty').textContent=source&&drafts.dirty(source)?'Unsaved set changes · draft kept on this device':'Set saved';renderPicker();
 }
 function renderPicker(){
  $('selectedMappingKey').textContent='Choose an attack for '+KEYS[selectedKey];const root=$('movePicker');root.replaceChildren();
  const query=$('moveSearch').value.trim().toLowerCase(),filter=$('moveFilter').value,owned=allowedAttackIds(profile,physical);
  for(const a of registry().filter(a=>owned.has(a.id))){const problem=availability(getPet(),a);if(filter==='ready'&&problem||filter==='missing'&&!problem||query&&!`${a.name} ${a.element} ${a.motion}`.toLowerCase().includes(query))continue;
   const card=el('article'),canvas=el('canvas'),name=el('h3',a.name);card.className='move-choice';canvas.width=100;canvas.height=88;canvas.setAttribute('aria-label',a.name+' effect');paintEffect(canvas,{effectId:a.visuals[0]?.effectId});
   const detail=el('p',`${a.element} · ${a.cost} base energy · ${a.hitEvents?.length||a.hitLimit} hit(s)`),requirement=el('p',problem||'Ready · '+a.motion.replaceAll('_',' '));
   const assign=el('button','Assign to '+KEYS[selectedKey]);assign.disabled=!!problem||!committed()||blocked;assign.onclick=()=>{const set=drafts.read(committed());if(!drafts.drafts.has(set.id))drafts.change(committed());set.slots[selectedKey]=a.id;drafts.change(set);persistDraft();renderMapping();};
   const test=el('button','Test this move');test.disabled=!!problem;test.onclick=()=>{$('mappingDialog').close();testAttack?.(a);status('Move test: press Q. Target starts 100 px away. Your loadout draft is preserved. Restart restores normal sets.');};card.append(canvas,name,detail,requirement,assign,test,attackChecks(a));root.append(card);
  }
  if(!root.children.length)root.append(el('p','No learned attacks match. Change the filter or learn a move in Skill trees.'));
 }
 $('moveSearch').oninput=renderPicker;$('moveFilter').onchange=renderPicker;$('setNameInput').oninput=captureDraft;
 $('mapAttacks').onclick=()=>{pause();renderSetList();$('mappingStatus').textContent=blocked?profileIssue:'Select a key, choose a move, then Save set. Drafts survive closing and switching sets.';$('mappingDialog').showModal();};
 $('closeMapping').onclick=()=>$('mappingDialog').close();$('closeSkills').onclick=()=>$('skillsDialog').close();$('skillTrees').onclick=openTree;
 $('setList').onchange=()=>{selectedSet=$('setList').value;renderMapping();};
 async function addSet(copy=false){try{if(profile.sets.length>=12)throw Error('You can keep up to 12 custom sets.');let n=1;while(profile.sets.some(s=>s.name==='Set '+n))n++;const original=copy&&committed()?drafts.read(committed()):null;const set={id:'set_'+crypto.randomUUID(),name:'Set '+n,slots:original?.slots||Array(KEYS.length).fill(null)};await transact(p=>saveSet(p,set,allowedAttackIds(p,physical)));selectedSet=set.id;renderSetList();}catch(e){$('mappingStatus').textContent=e.message;}}
 $('newSet').onclick=()=>addSet();$('duplicateSet').onclick=()=>addSet(true);
 $('saveMapping').onclick=async()=>{try{const set=drafts.read(committed());await transact(p=>saveSet(p,set,allowedAttackIds(p,physical)));drafts.discard(set.id);persistDraft();renderSetList();$('mappingStatus').textContent='Saved '+set.name+'. Choose it in the arena or press Space.';}catch(e){$('mappingStatus').textContent=e.message;}};
 $('discardMapping').onclick=()=>{drafts.discard(selectedSet);persistDraft();renderMapping();};
 $('undoMapping').onclick=()=>{const restored=drafts.restore();if(restored)selectedSet=restored.id;persistDraft();renderSetList();};
 $('clearSlot').onclick=()=>{const set=drafts.read(committed());if(!drafts.drafts.has(set.id))drafts.change(committed());set.slots[selectedKey]=null;drafts.change(set);persistDraft();renderMapping();};
 $('swapSlots').onclick=()=>{const set=drafts.read(committed()),other=Number($('swapTarget').value);if(!drafts.drafts.has(set.id))drafts.change(committed());[set.slots[selectedKey],set.slots[other]]=[set.slots[other],set.slots[selectedKey]];drafts.change(set);persistDraft();renderMapping();};
 for(const [i,key] of KEYS.entries())$('swapTarget').add(new Option(key,i));
 $('deleteSet').onclick=async()=>{try{const removed=structuredClone(committed()),draft=drafts.read(committed());await transact(p=>{p.sets=p.sets.filter(s=>s.id!==selectedSet);return p;});deletedSet=removed;deletedDraft=draft;drafts.discard(removed.id);persistDraft();selectedSet=profile.sets[0]?.id;renderSetList();$('mappingStatus').textContent='Set removed. Undo deletion is available.';}catch(e){$('mappingStatus').textContent=e.message;}};
 $('undoSetDelete').onclick=async()=>{try{if(!deletedSet)return;await transact(p=>saveSet(p,deletedSet,allowedAttackIds(p,physical)));selectedSet=deletedSet.id;if(JSON.stringify(deletedDraft)!==JSON.stringify(deletedSet)){drafts.change(deletedSet);drafts.change(deletedDraft);persistDraft();}deletedSet=null;deletedDraft=null;renderSetList();$('mappingStatus').textContent='Deleted set restored.';}catch(e){$('mappingStatus').textContent=e.message;}};
 $('previousTree').onclick=()=>{const n=new Set(tree.nodes.map(n=>n.branch)).size;branch=(branch-1+n)%n;renderTree();};$('nextTree').onclick=()=>{branch=(branch+1)%new Set(tree.nodes.map(n=>n.branch)).size;renderTree();};
 let collection=[];try{collection=JSON.parse(treeStore.getItem(TREE_LIBRARY_KEY)||'[]');}catch{}
 const libraryLabel=el('label','Data set / Tree'),libraryPicker=el('select');libraryPicker.setAttribute('aria-label','Data set / Tree');libraryLabel.append(libraryPicker);$('skillsDialog').prepend(libraryLabel);
 function fillLibrary(){
  const current=JSON.stringify(tree),index=collection.findIndex(item=>JSON.stringify(item.tree)===current);
  libraryPicker.replaceChildren(...(index<0?[new Option(tree.name||'Current tree','current')]:[]),...collection.map((item,i)=>new Option(item.name,String(i))));
  libraryPicker.value=index<0?'current':String(index);
 }
 async function useTree(candidate,items){
  candidate=checkPlayableTree(structuredClone(candidate),effectIds);
  // Derive grants inside the profile lock; earlier queued edits must survive.
  // Commit the library, active tree and profile together before repainting.
  await transact(p=>grantStarters(p,candidate),storage=>{
   storage.setItem(TREE_STORAGE,JSON.stringify(candidate));
   if(items)storage.setItem(TREE_LIBRARY_KEY,JSON.stringify(items));
  });
  tree=candidate;if(items)collection=items;branch=0;fillLibrary();notify();renderTree();
  const message='Tree loaded. Ready starter skills are available; existing purchases and loadouts are retained.';$('treeStatus').textContent=message;status(message);
 }
 libraryPicker.onchange=async()=>{try{if(libraryPicker.value!=='current')await useTree(collection[Number(libraryPicker.value)].tree);}catch(e){fillLibrary();$('treeStatus').textContent=e.message;}};fillLibrary();
 async function useCollection(items){if(!items.length)throw Error('No saved trees found. Save a Studio tree or import a downloaded data set.');items=structuredClone(items);for(const item of items)checkPlayableTree(item.tree,effectIds);await useTree(items[0].tree,items);libraryPicker.value='0';}
 $('studioTree').onclick=async()=>{try{await treeStore.refresh();await useCollection(savedTreeChoices(treeStore));$('treeStatus').textContent='Studio trees loaded. Choose Data set / Tree above.';}catch(e){$('treeStatus').textContent=e.message;}};
 $('openTree').textContent='Open tree or data set';$('openTree').onclick=()=>$('treeFile').click();$('treeFile').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{if(file.size>32*1024*1024)throw Error('Choose a tree or data set under 32 MiB.');await useCollection(treeChoices(await readImportJson(file,'tree or data set'),t=>checkPlayableTree(t,effectIds)));}catch(err){$('treeStatus').textContent=err.message;}};
 const update=el('button','Review learned attack updates');$('skillsDialog').querySelector('.profile-actions').append(update);update.onclick=()=>{const dialog=el('dialog'),title=el('h2','Update learned attacks'),note=el('p','This applies Ready definitions from the current tree to matching learned skills. Points paid and other learned skills remain unchanged. Loadout assignments follow updated identities.'),list=el('ul'),apply=el('button','Apply reviewed updates'),cancel=el('button','Cancel');let count=0;for(const purchase of profile.purchases){const node=tree.nodes.find(n=>n.id===purchase.nodeId);if(node?.state==='ready'&&node.attack&&JSON.stringify(node.attack)!==JSON.stringify(purchase.attack)){list.append(el('li',node.name));count++;}}apply.disabled=!count;dialog.append(title,note,list,apply,cancel);document.body.append(dialog);cancel.onclick=()=>{dialog.close();dialog.remove();};apply.onclick=async()=>{try{await transact(p=>refreshLearnedAttacks(p,tree));dialog.close();dialog.remove();renderTree();status('Learned attacks updated; points and loadouts preserved.');}catch(e){note.textContent=e.message;}};dialog.showModal();};
 for(const [dialogId,closeId] of [['skillsDialog','closeSkills'],['mappingDialog','closeMapping']]){
  const retry=el('button','Retry profile storage');retry.hidden=true;retryProfileButtons.push(retry);$(dialogId).querySelector('.profile-actions').append(retry);
  retry.onclick=async()=>{
   const result=await openProfile();if(!result)return;
   const message=result.saved?'Battle profile storage restored. Saved skills and loadouts are available.':result.message;
   if($('skillsDialog').open){renderTree();$('treeStatus').textContent=message;}
   if($('mappingDialog').open){renderSetList();$('mappingStatus').textContent=message;}
   status(message);if(result.saved)$(closeId).focus();
  };
 }
 const cloudStatus=el('p');cloudStatus.setAttribute('role','status');$('skillsDialog').append(cloudStatus);
 let cloudRevision=null,cloudPet=null,cloudOperation=0,cloudBusy=false,cloudReview=null;
 const loadCloud=el('button','Load website battle progress'),saveCloud=el('button','Save battle progress to website'),loadLessons=el('button','Load classroom trees');
 $('skillsDialog').querySelector('.profile-actions').append(loadCloud,saveCloud,loadLessons);
 function cloudButtons(busy){cloudBusy=busy;for(const button of [loadCloud,saveCloud,loadLessons])button.disabled=busy||blocked;}
 function invalidateCloud(){
  cloudOperation++;cloudRevision=null;cloudPet=null;cloudStatus.textContent='';
  if(cloudReview){cloudReview.close();cloudReview.remove();cloudReview=null;}cloudButtons(false);
 }
 $('skillsDialog').addEventListener('close',invalidateCloud);
 function cloudContext(){return {operation:cloudOperation,profile:profileGeneration,petId:profile.petId};}
 function cloudCurrent(context){return context.operation===cloudOperation&&context.profile===profileGeneration&&context.petId===profile.petId&&!blocked;}
 function requireCloud(context){if(!cloudCurrent(context))throw Error('The selected pet or window changed. Reopen Skill trees and try again.');}
 async function cloudRead(context){
  requireCloud(context);if(!cloud)throw Error('Account connection is unavailable.');
  if(context.petId==='practice-demo')throw Error('Connect your own pet before syncing progress.');
  const value=await cloud.readBattleProfile(context.petId);requireCloud(context);return value;
 }
 async function cloudAction(label,action){
  if(cloudBusy||blocked)return;const context=cloudContext();cloudButtons(true);cloudStatus.textContent=label;
  try{await action(context);}catch(error){if(cloudCurrent(context)){cloudRevision=null;cloudStatus.textContent=error.message;}}
  finally{if(cloudCurrent(context))cloudButtons(false);}
 }
 loadCloud.onclick=()=>cloudAction('Loading website battle progress…',async context=>{
  cloudRevision=null;const value=await cloudRead(context);
  if(!value.profile){cloudRevision=value.revision;cloudPet=context.petId;cloudStatus.textContent='No website battle progress yet. Your local progress is ready to save.';return;}
  const incoming=validateProfile(value.profile);
  if(incoming.petId!==context.petId||incoming.maxTrainingXP>profile.maxTrainingXP)throw Error('Load this pet’s latest website backup first to verify its training XP.');
  const dialog=el('dialog'),note=el('p','Load website battle progress? This replaces this browser’s learned skills and loadouts for this pet. Download the local battle profile first if you want to keep both.'),apply=el('button','Load website version'),cancel=el('button','Keep local version');
  dialog.append(note,apply,cancel);document.body.append(dialog);cloudReview=dialog;
  function dismiss(){const active=cloudCurrent(context);if(active)invalidateCloud();else{dialog.close();dialog.remove();}if(active)loadCloud.focus();}
  dialog.addEventListener('cancel',dismiss);cancel.onclick=dismiss;
  apply.onclick=async()=>{
   apply.disabled=true;cancel.disabled=true;
   try{requireCloud(context);await transact(p=>grantStarters({...incoming,maxTrainingXP:p.maxTrainingXP},tree));requireCloud(context);cloudReview=null;dialog.close();dialog.remove();cloudRevision=value.revision;cloudPet=context.petId;renderTree();cloudStatus.textContent='Website battle progress loaded.';loadCloud.focus();}
   catch(error){if(cloudCurrent(context))note.textContent=error.message;}
   finally{apply.disabled=false;cancel.disabled=false;}
  };
  dialog.showModal();
 });
 saveCloud.onclick=()=>cloudAction('Saving battle progress…',async context=>{
  if(cloudPet!==context.petId||cloudRevision===null){
   const value=await cloudRead(context);
   if(value.profile&&JSON.stringify(value.profile)!==JSON.stringify(profile))throw Error('Website progress already exists. Load and review it before saving your local version.');
   cloudRevision=value.revision;cloudPet=context.petId;
  }
  requireCloud(context);const result=await cloud.saveBattleProfile(structuredClone(profile),cloudRevision);requireCloud(context);
  cloudRevision=result.revision;cloudStatus.textContent='Saved battle progress to your website account · revision '+cloudRevision;
 });
 loadLessons.onclick=()=>cloudAction('Loading classroom trees…',async context=>{
  if(!cloud)throw Error('Account connection is unavailable.');
  const result=await cloud.readTrees();requireCloud(context);
  const items=result.items.flatMap(item=>treeChoices(item.release,t=>checkPlayableTree(t,effectIds)));await useCollection(items);requireCloud(context);
  cloudStatus.textContent='Classroom trees loaded. Choose a data set and tree above.';
 });
 $('exportBattleProfile').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({format:'cyber-pet-battle-profile',profile},null,2)],{type:'application/json'})),a=el('a');a.href=url;a.download='cyber-pet-battle-profile.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 $('importBattleProfile').onclick=()=>$('battleProfileFile').click();$('battleProfileFile').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{if(file.size>2*1024*1024)throw Error('Battle profile is too large.');const data=await readImportJson(file,'battle profile');if(data?.format!=='cyber-pet-battle-profile')throw Error('Choose a battle profile.');validateProfile(data.profile);if(data.profile.petId!==profile.petId)throw Error('Load the matching pet before opening its battle profile.');if(data.profile.maxTrainingXP>profile.maxTrainingXP)throw Error('Load the pet’s latest training backup before importing this profile.');await transact(p=>({...data.profile,maxTrainingXP:p.maxTrainingXP}));renderTree();$('treeStatus').textContent='Battle profile restored.';}catch(err){$('treeStatus').textContent=err.message;}};
 await openProfile();
 const params=new URLSearchParams(location.search);if(params.has('studioTree')){try{await treeStore.refresh();const choice=savedTreeChoices(treeStore).find(c=>c.id===params.get('studioTree'));if(!choice)throw Error('Save this tree in Studio before testing.');await useCollection([choice]);openTree();}catch(e){status(e.message);}}
 return {openProfile,registry,decks,async useBank(attacks){const candidate=checkPlayableTree(bankTree(attacks),effectIds);await treeStore.transaction(storage=>storage.setItem(TREE_STORAGE,JSON.stringify(candidate)));tree=candidate;branch=0;fillLibrary();notify();status('Teacher attacks added to skill trees. Learn them, then map them to a set.');},profile:()=>profile};
}
