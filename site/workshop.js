import {attackChecks} from './attack-checks.js?v=20261108-projectile-defense';
import {KEYS,physicalCatalog,defaultCatalog,availability} from './catalog.js?v=20261108-projectile-defense';
import {validateAttack} from './shared/combat-model.js?v=20261108-projectile-defense';
import {checkPlayableTree,bankTree,STUDIO_TREE_KEY} from './skill-trees.js?v=20261108-projectile-defense';
import {ProfileStore,freshProfile,syncCredit,trainingCredit,pointsForXP,xpForPoints,balance,spentPoints,purchaseReason,buySkill,allowedAttackIds,saveSet,validateProfile} from './progression.js?v=20261108-projectile-defense';
import {LoadoutDrafts} from './loadout-drafts.js?v=20261108-projectile-defense';
const $=id=>document.getElementById(id),el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const TREE_STORAGE='cyber-pet-battle-tree-v1';
export async function installWorkshop({getPet,pause,changed,status,testAttack}){
 const store=new ProfileStore(localStorage),physical=physicalCatalog();
 const effectIndex=await (await fetch('effects.json')).json(),effectIds=new Set(Object.keys(effectIndex));
 let tree=checkPlayableTree(await (await fetch('starter-trees.json')).json(),effectIds),effectImages=new Map();
 try{const saved=localStorage.getItem(TREE_STORAGE);if(saved)tree=checkPlayableTree(JSON.parse(saved),effectIds);}catch(e){status('Saved tree could not load: '+e.message);}
 let profile,credit,branch=0,selectedSet=null,blocked=false,selectedKey=0,deletedSet=null,deletedDraft=null;const drafts=new LoadoutDrafts();
 const draftKey=()=> 'cyber-pet-loadout-drafts:'+profile.petId;
 function registry(){const lookup=new Map(tree.nodes.filter(n=>n.attack).map(n=>[n.attack.id,n.attack]));for(const purchase of profile?.purchases||[])if(purchase.attack)lookup.set(purchase.attack.id,purchase.attack);for(const attack of physical)lookup.set(attack.id,attack);return [...lookup.values()];}
 function decks(){const lookup=new Map(registry().map(a=>[a.id,a])),owned=allowedAttackIds(profile,physical);return [{id:'physical',name:'Physical',slots:physical},...profile.sets.map(s=>({id:s.id,name:s.name,slots:s.slots.map(id=>owned.has(id)?lookup.get(id)||null:null)}))];}
 function notify(){changed({attacks:registry(),decks:decks()});$('skillBalance').textContent=balance(profile)+' skill points';}
 async function transact(update){if(blocked)throw Error('Profile storage is unavailable. Your saved data has not been replaced.');const commit=()=>{const next=update(structuredClone(profile));store.save(next);profile=next;notify();};if(navigator.locks)await navigator.locks.request('battle-profile:'+profile.petId,commit);else commit();}
 function training(){const pet=getPet();if(pet)return pet.training||{levels:pet.skills};return {levels:Object.fromEntries(['strength','speed','stamina','intelligence','charisma','focus'].map(k=>[k,20]))};}
 function openProfile(){blocked=false;try{profile=store.open(getPet()?.id||'practice-demo');const result=syncCredit(profile,training());credit=result.credit;profile=result.profile;store.save(profile);}catch(e){blocked=true;profile=freshProfile(getPet()?.id||'practice-demo');credit=trainingCredit(training());status('Cannot save this battle profile: '+e.message);}selectedSet=profile.sets[0]?.id;drafts.load(localStorage,draftKey(),profile.sets);deletedSet=null;notify();}
 function paintEffect(canvas,node){const effect=effectIndex[node.effectId];if(!effect)return;let image=effectImages.get(effect.id);if(!image){image=new Image();effectImages.set(effect.id,image);image.src=effect.sheet;}const draw=()=>{if(!image.naturalWidth)return;const [w,h]=effect.canvas,frame=Math.max(0,(effect.impact||1)-1),scale=Math.min(canvas.width/w,canvas.height/h);const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,(frame%effect.columns)*w,Math.floor(frame/effect.columns)*h,w,h,(canvas.width-w*scale)/2,(canvas.height-h*scale)/2,w*scale,h*scale);};if(image.complete)draw();else image.addEventListener('load',draw,{once:true});}
 function renderTree(){
  const branches=[...new Set(tree.nodes.map(n=>n.branch))];branch=Math.max(0,Math.min(branch,branches.length-1));const current=branches[branch]||'No skills';$('treeTitle').textContent=current[0]?.toUpperCase()+current.slice(1)+' tree';$('treePosition').textContent=(branch+1)+' / '+branches.length;
  const earned=pointsForXP(profile.maxTrainingXP),next=xpForPoints(earned+1);$('xpSummary').textContent=`${Math.floor(profile.maxTrainingXP).toLocaleString()} combined training XP · ${earned} points earned · ${spentPoints(profile)} spent · ${balance(profile)} available`;
  $('xpNext').textContent=`${Math.ceil(next-profile.maxTrainingXP).toLocaleString()} XP to the next point. ${credit.estimated?'Older save: credit estimated from recorded training; future lifetime XP will include post-cap awards.':'Lifetime XP includes training earned after stat caps.'} ${getPet()?'':'Demo profile only.'}`;
  $('treeSkills').replaceChildren();for(const node of tree.nodes.filter(n=>n.branch===current)){
   const card=el('article'),canvas=el('canvas'),name=el('h3',node.name),description=el('p',node.description),prerequisites=el('p'),button=el('button');card.className='skill-card';canvas.width=100;canvas.height=88;canvas.setAttribute('aria-label',node.name+' effect');paintEffect(canvas,node);
   prerequisites.className='prerequisites';prerequisites.textContent=node.requires.length?'Requires '+(node.requirement==='any'?'any: ':'all: ')+node.requires.map(id=>tree.nodes.find(n=>n.id===id)?.name||'Missing skill').join(', '):'Start of this path';
   const reason=purchaseReason(profile,node,tree);button.textContent=reason==='Already learned'?'Learned ✓':`Learn · ${node.cost} point${node.cost===1?'':'s'}`;button.disabled=!!reason||blocked;button.title=reason;const note=el('small',reason||'Ready to learn');if(node.attack){const art=availability(getPet(),node.attack);if(art)note.textContent+=(note.textContent?' · ':'')+art;}
   button.onclick=async()=>{button.disabled=true;let placement='';try{await transact(p=>{let next=buySkill(p,node,tree);const first=next.sets.find(s=>s.slots.includes(null));if(first&&!availability(getPet(),node.attack)){const index=first.slots.indexOf(null);first.slots[index]=node.attack.id;placement=' Equipped to '+KEYS[index]+' in '+first.name+'.';}return next;});renderTree();const message='Learned '+node.name+'.'+(placement||' Open Attack loadouts to choose its key.');$('treeStatus').textContent=message;status(message);}catch(e){$('treeStatus').textContent=e.message;renderTree();}};
   card.append(canvas,name,description,prerequisites,button,note);$('treeSkills').append(card);
  }
 }
 function openTree(){pause();renderTree();$('treeStatus').textContent='Progress and named sets are saved for this pet in this browser. Export a battle profile to keep a portable copy.';$('skillsDialog').showModal();}

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
   const saved=set?.slots[i];if(saved&&!attacks.some(a=>a.id===saved)){const option=new Option('Unavailable attack (kept)',saved);option.disabled=true;select.add(option);}select.value=saved||'';select.disabled=!set;select.onchange=()=>{captureDraft();selectedKey=i;renderMapping();};label.append(key,select);$('mappingKeys').append(label);
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
   const test=el('button','Test this move');test.disabled=!!problem;test.onclick=()=>{$('mappingDialog').close();testAttack?.(a);status('Move test: press Q. Your loadout draft is preserved. Restart restores normal sets.');};card.append(canvas,name,detail,requirement,assign,test,attackChecks(a));root.append(card);
  }
  if(!root.children.length)root.append(el('p','No learned attacks match. Change the filter or learn a move in Skill trees.'));
 }
 $('moveSearch').oninput=renderPicker;$('moveFilter').onchange=renderPicker;$('setNameInput').oninput=captureDraft;
 $('mapAttacks').onclick=()=>{pause();renderSetList();$('mappingStatus').textContent='Select a key, choose a move, then Save set. Drafts survive closing and switching sets.';$('mappingDialog').showModal();};
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
 async function useTree(candidate){checkPlayableTree(candidate,effectIds);localStorage.setItem(TREE_STORAGE,JSON.stringify(candidate));tree=candidate;branch=0;notify();renderTree();status('Skill trees loaded. Existing learned skills and set assignments are retained.');}
 $('studioTree').onclick=async()=>{try{const raw=localStorage.getItem(STUDIO_TREE_KEY);if(!raw)throw Error('No Attack Studio tree is saved in this browser. Download one there, then Open tree here.');await useTree(JSON.parse(raw));}catch(e){$('treeStatus').textContent=e.message;}};
 $('openTree').onclick=()=>$('treeFile').click();$('treeFile').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{if(file.size>2*1024*1024)throw Error('Choose a tree under 2 MiB.');await useTree(JSON.parse(await file.text()));}catch(err){$('treeStatus').textContent=err.message;}};
 $('exportBattleProfile').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({format:'cyber-pet-battle-profile',profile},null,2)],{type:'application/json'})),a=el('a');a.href=url;a.download='cyber-pet-battle-profile.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 $('importBattleProfile').onclick=()=>$('battleProfileFile').click();$('battleProfileFile').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{if(file.size>2*1024*1024)throw Error('Battle profile is too large.');const data=JSON.parse(await file.text());if(data.format!=='cyber-pet-battle-profile')throw Error('Choose a battle profile.');validateProfile(data.profile);if(data.profile.petId!==profile.petId)throw Error('Load the matching pet before opening its battle profile.');if(data.profile.maxTrainingXP>profile.maxTrainingXP)throw Error('Load the pet’s latest training backup before importing this profile.');await transact(p=>({...data.profile,maxTrainingXP:p.maxTrainingXP}));renderTree();$('treeStatus').textContent='Battle profile restored.';}catch(err){$('treeStatus').textContent=err.message;}};
 openProfile();
 return {openProfile,registry,decks,async useBank(attacks){const candidate=checkPlayableTree(bankTree(attacks),effectIds);localStorage.setItem(TREE_STORAGE,JSON.stringify(candidate));tree=candidate;branch=0;notify();status('Teacher attacks added to skill trees. Learn them, then map them to a set.');},profile:()=>profile};
}
