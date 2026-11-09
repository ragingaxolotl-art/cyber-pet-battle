import {attacksVersion} from './shared/attack-format.js?v=20261109-conditional-release';
import {freshAttack,validateAttack} from './shared/combat-model.js?v=20261109-conditional-release';
import {validateTree} from './shared/skill-tree-model.js?v=20261109-conditional-release';
export const STUDIO_TREE_KEY='cyber-pet-attack-skill-tree-v1';
export function checkPlayableTree(tree,effectIds){
 validateTree(tree,new Set([...effectIds,'']),validateAttack);
 const ids=new Set();for(const node of tree.nodes){node.cost??=node.requires.length?2:1;if(!Number.isInteger(node.cost)||node.cost<0||node.cost>100)throw Error('Skill costs must be whole numbers from 0–100.');if(node.attack){if(ids.has(node.attack.id))throw Error('Each skill needs a unique attack definition ID.');ids.add(node.attack.id);}}
 return tree;
}
export function bankTree(attacks){return {format:'cyber-pet-attack-skill-tree',version:attacksVersion(attacks),nodes:attacks.map((a,i)=>({id:'bank:'+a.id,name:a.name,description:'Teacher-authored attack from the classroom bank.',branch:a.element||'Teacher bank',effectId:a.visuals[0]?.effectId||'',state:'ready',requirement:'all',requires:[],cost:2,x:0,y:i*200,attack:structuredClone(a)}))};}
