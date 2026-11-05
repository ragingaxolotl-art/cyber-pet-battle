// Drafts are separate from purchased skills and committed sets.
export class LoadoutDrafts {
  constructor(){this.drafts=new Map();this.undo=[];}
  read(set){return structuredClone(this.drafts.get(set.id)||set);}
  change(set){const previous=this.drafts.get(set.id);if(previous){this.undo.push(structuredClone(previous));if(this.undo.length>60)this.undo.shift();}this.drafts.set(set.id,structuredClone(set));}
  dirty(set){return this.drafts.has(set.id)&&JSON.stringify(this.drafts.get(set.id))!==JSON.stringify(set);}
  discard(id){this.drafts.delete(id);this.undo=this.undo.filter(s=>s.id!==id);}
  clear(){this.drafts.clear();this.undo=[];}
  restore(){const previous=this.undo.pop();if(previous)this.drafts.set(previous.id,previous);return previous;}
  save(storage,key){storage.setItem(key,JSON.stringify([...this.drafts.values()]));}
  load(storage,key,sets){this.clear();try{const list=JSON.parse(storage.getItem(key)||'[]');if(!Array.isArray(list))return;for(const s of list){if(sets.some(v=>v.id===s.id)&&typeof s.name==='string'&&s.name.length<=32&&Array.isArray(s.slots)&&s.slots.length===8&&s.slots.every(v=>v===null||typeof v==='string'))this.drafts.set(s.id,s);}}catch{}}
}
