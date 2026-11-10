import {activeEnd} from './shared/contact-timing.js?v=20261108-movement-cancels';

// Explain a rejection already made by the combat engine. This never grants a
// cancel, changes the cast, or replaces resource/defense rejection reasons.
export function explainFollowupRejection(reason,cast,next,age){
 if(reason!=='Finish the current move'||!cast||!next)return reason;
 const allowed=(cast.a.cancelWindows||[]).filter(window=>window.attacks.includes(next.id));
 if(!allowed.length)return 'This attack is not allowed by the current move’s follow-up windows';
 const manual=allowed.filter(window=>!window.automatic);
 if(!manual.length)return 'This attack is automatic-only; remove the manual follow-up attempt';
 const open=manual.filter(window=>age>=window.start&&age<window.start+window.duration);
 if(!open.length){
  const ranges=manual.map(window=>`${window.start}–${window.start+window.duration-1}`).join(', ');
  return `No manual follow-up window is open at cast frame ${age}. Allowed frames: ${ranges}`;
 }
 const missing=open.map(window=>{
  if(window.condition==='hit'&&!cast.outcomes.has('hit'))return cast.outcomes.has('block')?'The opener was blocked; this window requires an unblocked hit':'No hit has connected yet';
  if(window.condition==='block'&&!cast.outcomes.has('block'))return 'No blocked contact has occurred yet';
  if(window.condition==='parry'&&!cast.outcomes.has('parry'))return 'No successful parry has occurred yet';
  if(window.condition==='whiff'){
   if(!['damage','push'].includes(cast.a.payload))return 'Only damage or push attacks can qualify as a miss';
   if(cast.outcomes.size)return 'The opener made contact, so it is not a miss';
   if(age<activeEnd(cast.impact,cast.tm))return 'Active time has not finished; a miss cannot be confirmed yet';
  }
  return null;
 }).filter(Boolean);
 return [...new Set(missing)].join(' Or: ')||reason;
}
