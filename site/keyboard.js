// Double-tap and hold a horizontal arrow to sprint. Times are milliseconds.
export const DOUBLE_TAP_MS = 260;
export class SprintInput {
 constructor(){this.clear();}
 clear(){this.lastKey=null;this.lastTime=-Infinity;this.held=new Set();this.direction=0;}
 press(key,now){
  if(!['ArrowLeft','ArrowRight'].includes(key)||this.held.has(key))return;
  const direction=key==='ArrowLeft'?-1:1;
  this.direction=this.lastKey===key&&now-this.lastTime<=DOUBLE_TAP_MS&&now>=this.lastTime?direction:0;
  this.lastKey=key;this.lastTime=now;this.held.add(key);
  if(this.held.size>1)this.direction=0;
 }
 release(key){this.held.delete(key);if((key==='ArrowLeft'&&this.direction===-1)||(key==='ArrowRight'&&this.direction===1))this.direction=0;}
}

export const GUARD_HOLD_MS=180;
export class DefenseInput {
 constructor(){this.clear();}
 clear(){this.started=null;this.held=new Set();}
 press(code,now){if(this.held.size===0)this.started=now;this.held.add(code);}
 blocking(now){return this.held.size>0&&now-this.started>=GUARD_HOLD_MS;}
 release(code,now){if(!this.held.has(code))return false;this.held.delete(code);if(this.held.size)return false;const tap=this.started!==null&&now-this.started<GUARD_HOLD_MS;this.started=null;return tap;}
}
