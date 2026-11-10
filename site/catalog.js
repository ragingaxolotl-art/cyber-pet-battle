import {requireGroupVersion} from './shared/attack-format.js?v=20261109-slow-motion-release';
import {freshAttack,validateAttack,STATS} from './shared/combat-model.js?v=20261110-status-preview-arena';
export {KEYS,availability,mappedAttack} from './shared/combat-artwork.js?v=20261109-split';
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
export function validateCatalog(data){if(data?.format==='cyber-pet-combat-design'&&![1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36].includes(data.version))throw Error('Unsupported Combat Design version.');const list=data?.attacks;if(!Array.isArray(list)||!list.length||list.length>256)throw Error('Choose an Attack Studio project or attack-bank JSON with 1–256 attacks.');requireGroupVersion(data.version??1,list);const ids=new Set();const result=structuredClone(list);for(const a of result){validateAttack(a);if(ids.has(a.id))throw Error('Duplicate attack ID.');ids.add(a.id);}return result;}
export function petStats(pet){return Object.fromEntries(STATS.map(k=>{const n=Number(pet?.skills?.[k]);return [k,Number.isFinite(n)?Math.round(Math.min(99,Math.max(0,n))):0];}));}

// Physical attacks occupy a permanent first deck, independent of teacher banks.
export function withPhysicalDeck(authored){const physical=physicalCatalog(),reserved=new Set(physical.map(a=>a.id));return [...physical,...authored.filter(a=>!reserved.has(a.id))];}

export function physicalCatalog(){const attacks=defaultCatalog().slice(0,8);const jab={...freshAttack(),id:'attack_quick_jab',name:'Quick jab',cost:0,startup:8,active:6,recovery:18,cooldown:36,base:8};return [...attacks,jab];}
