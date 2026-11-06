import {RECOVERY_TIMING} from './shared/recovery-timing.js?v=20261106-matchup';
import {sampleLegacyMotion} from './shared/legacy-motion.js?v=20261106-matchup';
export const REACTION={wallHold:RECOVERY_TIMING.wall,downHold:RECOVERY_TIMING.down,getUp:RECOVERY_TIMING.getUp,drag:.84};
export function beginReaction(f,attack,direction,frame){
 f.pulseMotion=null;f.cast=null;f.guarding=false;f.moving=false;f.sprinting=false;f.vx=0;f.vy=0;
 f.legacyMotion={x:f.x,y:f.y,start:frame,attack:{...attack},direction,wall:false};
 f.needsFall=!!attack.floorSlam&&attack.pushAxis!=='x'&&attack.launchHeight>0;f.reaction=(attack.pushAxis!=='x'&&attack.launchHeight>0)||f.y<0?'airborne':'hurt';
 f.reactionStart=frame;f.reactionUntil=frame+Math.max(8,attack.hitstun);
 f.lastHit=frame;f.stun=Math.max(f.stun,frame+attack.hitstun);

}
export function advanceReaction(f,frame,emit){
 if(f.legacyMotion){
  const motion=f.legacyMotion,a=motion.attack,sample=sampleLegacyMotion(motion,a,motion.direction,frame-motion.start,35,925);
  f.x=sample.x;f.y=sample.y;f.vx=0;f.vy=0;
  if(sample.wall&&a.wallSlam&&!motion.wall){motion.wall=true;f.reaction='wall';f.reactionStart=frame;emit('WALL HIT',f);}
  if(sample.done){f.legacyMotion=null;if((a.floorSlam&&a.pushAxis!=='x'&&a.launchHeight>0)||motion.wall)knockDown(f,frame,emit);else f.reaction=frame>=f.reactionUntil?'standing':'hurt';}
  else f.stun=Math.max(f.stun,frame+1);
  return true;
 }
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
