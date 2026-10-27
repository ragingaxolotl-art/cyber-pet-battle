import {HONOURS,HonourStore,freshHonours} from './achievements.js';
export function installHonours({getPet,getArena,pause,status}){
 const $=id=>document.getElementById(id);let store;
 const storage=()=>store||(store=new HonourStore(localStorage));
 function render(){const pet=getPet();let data=freshHonours(pet?.id||'preview');
  $('honoursStatus').textContent=pet?'Saved for this pet in this browser. Export a copy to keep. No XP, currency or combat bonuses.':'Connect a pet to earn honours. Sample fighters and dummy tests do not count.';
  if(pet)try{data=storage().read(pet.id);}catch(e){$('honoursStatus').textContent=e.message;}
  $('honoursGrid').replaceChildren();for(const [id,name,condition,art] of HONOURS){const card=document.createElement('article'),img=document.createElement('img'),title=document.createElement('h3'),text=document.createElement('p');img.src='assets/honours/'+art;img.alt='';img.width=64;img.height=64;img.style.imageRendering='pixelated';title.textContent=name;text.textContent=(data.earned.includes(id)?'Earned · ':'Locked · ')+condition;card.className='honour-card';card.append(img,title,text);$('honoursGrid').append(card);}
  $('exportHonours').disabled=!pet;
 }
 $('openHonours').onclick=()=>{pause();if(getArena())finished(getArena());render();$('honoursDialog').showModal();};$('closeHonours').onclick=()=>$('honoursDialog').close();
 $('exportHonours').onclick=()=>{try{const pet=getPet();if(!pet)return;const data=storage().read(pet.id),blob=new Blob([JSON.stringify({format:'cyber-pet-battle-honours',profile:data},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='cyber-pet-battle-honours.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){$('honoursStatus').textContent=e.message;}};
 const handled=new WeakSet();
 async function finished(arena){const pet=getPet();if(!pet||arena.training||arena.winnerIndex===null||handled.has(arena))return;handled.add(arena);
  const id=arena.honourId||(arena.honourId=crypto.randomUUID()),petId=pet.id;
  const match={id,petId,training:false,finished:true,result:arena.winnerIndex,guards:arena.honourMetrics.guards,dodges:arena.honourMetrics.dodges,variety:arena.honourMetrics.attacks.size};
  try{const commit=()=>{const prior=storage().read(petId),next=storage().commit(match);return next.earned.filter(id=>!prior.earned.includes(id));};const earned=navigator.locks?await navigator.locks.request('battle-honours:'+petId,commit):commit();
   if(getPet()?.id===petId&&$('honoursDialog').open)render();
   if(getPet()?.id===petId)status(earned.length?'New honours: '+earned.map(id=>HONOURS.find(row=>row[0]===id)[1]).join(', ')+'. Open Honours to see them.':'Sparring result saved to this pet’s local honours.');
  }catch(e){handled.delete(arena);if(getPet()?.id===petId)status('Honours did not save: '+e.message+' Open Honours to retry.');}
 }
 return {finished};
}
