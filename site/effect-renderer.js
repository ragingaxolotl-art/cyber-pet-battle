import {visualFrame,visualOpacity,pathSample} from './shared/attack-motion.js?v=20261108-scheduled-sequences';
// The same renderer handles cast-owned and independently reflected effects.
export function drawAttackEffect(ctx,{cast:c,visual:v,effect,image,frame,target,ground=0}){
 const age=frame-c.start,impact=c.impact??Infinity,i=visualFrame(effect,v,age,impact);if(i<0)return false;
 const source=v.frames?.[i]??i,[w,h]=effect.canvas;
 const motionAge=c.a.impactTrigger==='contact'?Math.min(age,impact):age,path=pathSample(c.a,motionAge);
 const travel=c.a.motionPath?.length?0:c.a.delivery==='projectile'?Math.max(0,motionAge-c.tm.startup)*c.a.projectileSpeed:0;
 const attached=c.sequence?.attached&&c.a.projectileMode==='attached',transform=c.projectileTransform,direction=c.facing*(transform?.direction||1);
 const rawX=attached?target.x+direction*v.x:c.x+c.facing*(v.x+path.x+travel);
 ctx.save();ctx.translate(transform&&!attached?transform.direction*rawX+transform.offset:rawX,ground+(attached?target.y:c.y)+v.y+(attached?0:path.y));
 ctx.scale(direction*v.scale*(v.stretchX||1),v.scale*(v.stretchY||1));ctx.globalAlpha=visualOpacity(effect,v,age,impact);
 ctx.drawImage(image,(source%effect.columns)*w,Math.floor(source/effect.columns)*h,w,h,-effect.anchor[0],-effect.anchor[1],w,h);ctx.restore();return true;
}
