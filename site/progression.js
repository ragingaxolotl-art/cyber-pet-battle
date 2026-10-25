import {STATS,validateAttack} from './shared/combat-model.js';
// Match the main game's saved training curve. Lifetime totals take precedence.
export const PROGRESSION={firstLevelXP:35,lastLevelXP:650,curvePower:2.15,firstPointXP:100,pointStepXP:25};
const finite=(n,fallback=0)=>Number.isFinite(n)&&n>=0?n:fallback;
export function estimateSkillXP(data,skill){
 const minimum=Math.min(99,finite(data.minimums?.[skill],2));
 const maximum=Math.max(minimum,Math.min(99,finite(data.maximums?.[skill],2*minimum+30)));
 const memory=data.memory?.[skill];let level=Math.min(maximum,Math.max(minimum,finite(data.levels?.[skill],minimum))),remainder=finite(data.experience?.[skill]);
 if(memory&&finite(memory.target_level)>level){level=Math.min(maximum,memory.target_level);remainder=finite(memory.target_progress);}else if(memory?.target_level===level)remainder=Math.max(remainder,finite(memory.target_progress));
 let sum=0;const required=l=>PROGRESSION.firstLevelXP+(PROGRESSION.lastLevelXP-PROGRESSION.firstLevelXP)*Math.pow(Math.max(0,Math.min(1,(l-minimum)/Math.max(1,maximum-minimum-1))),PROGRESSION.curvePower);
 for(let l=minimum;l<level;l++)sum+=required(l);
 if(level<maximum)sum+=Math.min(remainder,required(level));return sum;
}
export function trainingCredit(data={}){const recorded=data.lifetime_xp&&STATS.every(k=>typeof data.lifetime_xp[k]==='number'&&Number.isFinite(data.lifetime_xp[k])&&data.lifetime_xp[k]>=0&&data.lifetime_xp[k]<=1e12);const bySkill=Object.fromEntries(STATS.map(k=>[k,recorded?data.lifetime_xp[k]:estimateSkillXP(data,k)]));return {total:Object.values(bySkill).reduce((a,b)=>a+b,0),bySkill,estimated:!recorded};}
export function xpForPoints(points){return PROGRESSION.firstPointXP*points+PROGRESSION.pointStepXP*points*(points-1)/2;}
export function pointsForXP(xp){xp=Math.min(6e12,finite(xp));const b=PROGRESSION.firstPointXP-PROGRESSION.pointStepXP/2;return Math.floor((-b+Math.sqrt(b*b+2*PROGRESSION.pointStepXP*xp))/PROGRESSION.pointStepXP+1e-9);}
export function freshProfile(petId){return {version:1,petId,maxTrainingXP:0,purchases:[],sets:[{id:'custom_1',name:'My set',slots:Array(8).fill(null)}]};}
export function validateProfile(p){
 if(!p||p.version!==1||typeof p.petId!=='string'||p.petId.length>160||!Number.isFinite(p.maxTrainingXP)||p.maxTrainingXP<0||p.maxTrainingXP>6e12||!Array.isArray(p.purchases)||p.purchases.length>512||!Array.isArray(p.sets)||p.sets.length>12)throw Error('Invalid battle profile.');
 const ids=new Set();for(const item of p.purchases){if(!item||typeof item.nodeId!=='string'||item.nodeId.length>250||typeof item.attackId!=='string'||item.attackId.length>100||ids.has(item.nodeId)||!Number.isInteger(item.cost)||item.cost<0||item.cost>100)throw Error('Invalid purchase record.');if(item.attack){validateAttack(item.attack);if(item.attack.id!==item.attackId)throw Error("Mismatched learned attack.");}ids.add(item.nodeId);}
 const names=new Set(),setIds=new Set();for(const set of p.sets){if(!set||typeof set.id!=='string'||set.id.length>100||setIds.has(set.id)||typeof set.name!=='string'||!set.name.trim()||set.name.length>32||names.has(set.name.trim().toLowerCase())||!Array.isArray(set.slots)||set.slots.length!==8||set.slots.some(v=>v!==null&&(typeof v!=='string'||v.length>100)))throw Error('Each set needs a unique name and eight attack slots.');names.add(set.name.trim().toLowerCase());setIds.add(set.id);}
 if(spentPoints(p)>pointsForXP(p.maxTrainingXP))throw Error('Purchases exceed earned skill points.');return p;
}
export function syncCredit(p,data){const next=structuredClone(p),credit=trainingCredit(data);next.maxTrainingXP=Math.max(next.maxTrainingXP,credit.total);return {profile:next,credit};}
export const spentPoints=p=>p.purchases.reduce((sum,item)=>sum+item.cost,0);
export const balance=p=>pointsForXP(p.maxTrainingXP)-spentPoints(p);
export function purchaseReason(profile,node,tree){
 if(profile.purchases.some(p=>p.nodeId===node.id))return 'Already learned';
 if(node.state!=='ready'||!node.attack)return 'Teacher setup is not ready';
 const learned=new Set(profile.purchases.map(p=>p.nodeId));const passes=node.requirement==='any'?node.requires.some(id=>learned.has(id)):node.requires.every(id=>learned.has(id));
 if(node.requires.length&&!passes)return 'Learn '+(node.requirement==='any'?'one':'all')+' of the prerequisite skills first';
 if(balance(profile)<node.cost)return 'Need '+(node.cost-balance(profile))+' more skill point(s)';return '';
}
export function buySkill(profile,node,tree){const reason=purchaseReason(profile,node,tree);if(reason)throw Error(reason);const next=structuredClone(profile);next.purchases.push({nodeId:node.id,attackId:node.attack.id,cost:node.cost,attack:structuredClone(node.attack)});return validateProfile(next);}
export function allowedAttackIds(profile,physical){return new Set([...physical.map(a=>a.id),...profile.purchases.map(p=>p.attackId)]);}
export function saveSet(profile,set,allowed){const next=structuredClone(profile),copy=structuredClone(set);copy.name=copy.name.trim();if(copy.slots.some(id=>id!==null&&!allowed.has(id)))throw Error('Only learned attacks can be assigned.');const i=next.sets.findIndex(s=>s.id===copy.id);if(i<0)next.sets.push(copy);else next.sets[i]=copy;return validateProfile(next);}
// A compare-and-write under an origin-wide lock prevents two tabs spending the same points.
export class ProfileStore{
 constructor(storage){this.storage=storage;this.key=null;this.raw=null;}
 open(petId){this.key='cyber-pet-battle-profile-v1:'+encodeURIComponent(petId);this.raw=this.storage.getItem(this.key);const p=this.raw?validateProfile(JSON.parse(this.raw)):freshProfile(petId);if(p.petId!==petId)throw Error('This profile belongs to another pet.');return p;}
 save(profile){validateProfile(profile);if(this.storage.getItem(this.key)!==this.raw)throw Error('This pet changed in another tab. Reopen its profile before saving.');const raw=JSON.stringify(profile);this.storage.setItem(this.key,raw);this.raw=raw;return profile;}
}
