// Cosmetic, device-local honours. Never grants training XP, skill points or damage.
export const HONOURS=[
 ['arena_first','First Bell','Complete one computer sparring round.','contest_ribbon_08.png','rounds',1],
 ['arena_win','First Victory','Win one computer sparring round.','contest_ribbon_09.png','wins',1],
 ['arena_three','Finding Form','Win three sparring rounds in total.','contest_ribbon_10.png','wins',3],
 ['arena_ten','Good Sport','Complete ten sparring rounds, win or lose.','contest_ribbon_11.png','rounds',10],
 ['arena_guard','Steady Guard','Block five incoming hits across completed sparring rounds.','contest_ribbon_12.png','guards',5],
 ['arena_dodge','Light Footed','Evade three incoming hits across completed sparring rounds.','contest_ribbon_13.png','dodges',3],
 ['arena_variety','Mixed Technique','Land three different damaging attacks in one completed sparring round.','contest_ribbon_14.png','variety',3],
 ['arena_cup','Sparring Cup','Win five sparring rounds in total.','trophy_08.png','wins',5],
 ['arena_regular','Dojo Cup','Complete twenty sparring rounds, win or lose.','trophy_09.png','rounds',20],
 ['arena_complete','Balanced Fighter','Earn First Victory, Steady Guard and Light Footed.','trophy_10.png','balanced',1]
];
const COUNTS=['rounds','wins','guards','dodges','variety'];
const integer=n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000;
export function freshHonours(petId){return {version:1,petId,rounds:0,wins:0,guards:0,dodges:0,variety:0,earned:[],matches:[]};}
export function validateHonours(p,petId){
 if(!p||p.version!==1||p.petId!==petId||typeof petId!=='string'||!petId||petId.length>160||!COUNTS.every(k=>integer(p[k]))||p.wins>p.rounds||p.variety>512||!Array.isArray(p.earned)||p.earned.length>HONOURS.length||new Set(p.earned).size!==p.earned.length||p.earned.some(id=>!HONOURS.some(row=>row[0]===id))||!Array.isArray(p.matches)||p.matches.length>10000||new Set(p.matches).size!==p.matches.length||p.matches.some(id=>typeof id!=='string'||id.length>100))throw Error('Saved honours are invalid; they have not been replaced.');
 return p;
}
export function applyMatch(p,match){
 validateHonours(p,p.petId);
 if(!match||match.training||!match.finished||match.petId!==p.petId)return p;
 if(typeof match.id!=='string'||!match.id||match.id.length>100||!Number.isInteger(match.result)||![-1,0,1].includes(match.result)||!['guards','dodges','variety'].every(k=>integer(match[k]))||match.variety>512)throw Error('Invalid sparring result.');
 if(p.matches.includes(match.id))return p;
 if(p.matches.length>=10000)throw Error('Honours history is full. Export it before continuing.');
 const next=structuredClone(p);next.matches.push(match.id);next.rounds=Math.min(1000000,next.rounds+1);if(match.result===0)next.wins=Math.min(1000000,next.wins+1);
 for(const key of ['guards','dodges'])next[key]=Math.min(1000000,next[key]+match[key]);
 next.variety=Math.max(next.variety,match.variety);
 for(const [id,,,art,key,threshold] of HONOURS){const value=key==='balanced'?Number(['arena_win','arena_guard','arena_dodge'].every(k=>next.earned.includes(k))):next[key];if(value>=threshold&&!next.earned.includes(id))next.earned.push(id);}
 return next;
}
export class HonourStore{
 constructor(storage){this.storage=storage;}
 key(petId){return 'cyber-pet-battle-honours-v1:'+encodeURIComponent(petId);}
 read(petId){const raw=this.storage.getItem(this.key(petId));return raw?validateHonours(JSON.parse(raw),petId):freshHonours(petId);}
 commit(match){const old=this.read(match.petId),next=applyMatch(old,match);if(next!==old)this.storage.setItem(this.key(match.petId),JSON.stringify(next));return next;}
}
