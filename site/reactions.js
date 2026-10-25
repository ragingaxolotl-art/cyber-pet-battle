export const REACTION={wallHold:15,downHold:35,getUp:26,drag:.84};
export function beginReaction(f,attack,direction,frame){
 f.cast=null;f.guarding=false;f.moving=false;f.sprinting=false;f.vx=direction*attack.knockback*(1-REACTION.drag);
 f.needsFall=attack.launchHeight>0||['sweep_hit_side','ground_slam_side'].includes(attack.motion);
 f.reaction=attack.launchHeight>0?'airborne':'hurt';f.reactionStart=frame;f.reactionUntil=frame+Math.max(8,attack.hitstun);
 if(attack.launchHeight>0)f.vy=-Math.sqrt(2*.48*attack.launchHeight);
 f.lastHit=frame;f.stun=Math.max(f.stun,frame+attack.hitstun);
}
export function advanceReaction(f,frame,emit){
 if(f.reaction==='standing')return;
 if(f.reaction==='wall'&&frame>=f.reactionUntil){f.reaction='airborne';f.vy=1;f.needsFall=true;}
 if(f.reaction==='down'&&frame>=f.reactionUntil){f.reaction='getting_up';f.reactionStart=frame;f.reactionUntil=frame+REACTION.getUp;}
 if(f.reaction==='getting_up'&&frame>=f.reactionUntil){f.reaction='standing';f.vx=0;f.needsFall=false;}
 if(f.reaction==='hurt'&&frame>=f.reactionUntil){if(f.needsFall)knockDown(f,frame,emit);else f.reaction='standing';}
 if(['hurt','airborne'].includes(f.reaction)){const next=f.x+f.vx;if(Math.abs(f.vx)>.4&&(next<=35||next>=925)){f.x=Math.max(35,Math.min(925,next));f.vx=0;f.vy=0;f.y=Math.min(-18,f.y);f.reaction='wall';f.reactionStart=frame;f.reactionUntil=frame+REACTION.wallHold;f.needsFall=true;emit('WALL HIT',f);return;}f.x=next;f.vx*=REACTION.drag;}
 if(f.reaction!=='standing')f.stun=Math.max(f.stun,frame+1);
}
export function knockDown(f,frame,emit){if(f.reaction==='down'||f.reaction==='getting_up')return;f.reaction='down';f.reactionStart=frame;f.reactionUntil=frame+REACTION.downHold;f.vx=0;f.vy=0;f.y=0;emit('KNOCKDOWN',f);}
export function reactionMotion(f){return ({wall:'hurt_side',airborne:'knocked_down_side',hurt:'hurt_side',down:'knocked_down_side',getting_up:'get_up_side'})[f.reaction]||null;}
