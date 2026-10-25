import {freshAttack,validateAttack,STATS} from './shared/combat-model.js';
export const KEYS=['Q','W','E','A','S','D','Z','X'];
const definitions=[
 ['upper','Upper hit','upper_hit_side',14,18,46],['lower','Low kick','lower_hit_side',12,13,50],['thrust','Straight hit','thrust_hit_side',12,10,55],['sweep','Sweep','sweep_hit_side',15,20,64],['bash','Body bash','body_bash_side',20,25,42],['spin','Spin hit','spin_hit_side',18,22,58],['slam','Ground slam','ground_slam_side',26,34,82],['push','Push strike','side_push_side',10,14,58],
 ['up','Sky summon','up_summon_side',20,30,120],['down','Summon below','down_summon_side',22,32,100],['gather','Gather energy','gather_power_side',0,0,1],['release','Release power','release_power_side',18,22,50],['channel','Channel power','channel_power_side',16,20,70]
];
export function defaultCatalog(){return definitions.map(([id,name,motion,base,cost,range],i)=>{
 const a=freshAttack(i===11?'projectile':i===6?'area':'melee');Object.assign(a,{id:'attack_'+id,name,motion,base,cost:i<8?0:cost,startup:i===6?30:14,recovery:22,cooldown:60,scaling:i<8?'strength':'intelligence',box:{x:16,y:-55,w:range,h:48}});
 if(i===11)a.impactTrigger='contact';
 if(i===8||i===9) a.delivery='area';
 if(i===10)Object.assign(a,{delivery:'self',payload:'energy',base:18,cooldown:180});return a;
}).concat(['shield','block','dodge'].map((kind,i)=>{const a=freshAttack('shield');return {...a,id:'attack_'+kind,name:['Protective shield','Guard','Dodge'][i],motion:['channel_power_side','block_side','dodge_side'][i],payload:kind,base:30,cost:kind==='shield'?18:6,startup:3,active:kind==='shield'?12:24,recovery:12,cooldown:90};}));}
export function validateCatalog(data){const list=data?.attacks;if(!Array.isArray(list)||!list.length||list.length>256)throw Error('Choose an Attack Studio project or attack-bank JSON with 1–256 attacks.');const ids=new Set();const result=structuredClone(list);for(const a of result){validateAttack(a);if(ids.has(a.id))throw Error('Duplicate attack ID.');ids.add(a.id);}return result;}
export function petStats(pet){return Object.fromEntries(STATS.map(k=>{const n=Number(pet?.skills?.[k]);return [k,Number.isFinite(n)?Math.round(Math.min(99,Math.max(0,n))):0];}));}
export function availability(pet,attack){if(!pet)return '';const frames=pet.config.animations?.[attack.motion];if(!Array.isArray(frames)||!frames.length)return 'Missing '+attack.motion.replaceAll('_',' ')+' artwork';if(pet.config.animation_reviewed?.[attack.motion]!==true)return 'Save this animation in the compiler first';if(frames.some(name=>!pet.images.has(name)))return 'Required frames could not be loaded';return '';}
export function mappedAttack(pet,attack){const result=structuredClone(attack);if(!pet)return result;
 // Only an exact source slot may provide the pet-specific impact marker.
 const plan=pet.config.battle_plans?.attacks?.find(p=>p.definition_id===attack.id&&p.animation===attack.motion);
 const count=pet.config.animations?.[attack.motion]?.length||0;
 if(plan&&Number.isInteger(plan.impact_frame)&&plan.impact_frame>=1&&plan.impact_frame<=count){result.poseImpact=plan.impact_frame;}
 return result;
}

// Physical attacks occupy a permanent first deck, independent of teacher banks.
export function withPhysicalDeck(authored){const physical=defaultCatalog().slice(0,8),reserved=new Set(physical.map(a=>a.id));return [...physical,...authored.filter(a=>!reserved.has(a.id))];}
