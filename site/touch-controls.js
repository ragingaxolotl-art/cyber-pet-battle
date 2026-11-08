// Pointer ownership prevents one finger from releasing another finger's input.
export class TouchInput {
 constructor(){this.held=new Map();}
 press(pointer,key){this.held.set(pointer,key);}
 release(pointer){this.held.delete(pointer);}
 clear(){this.held.clear();}
 keys(){return new Set(this.held.values());}
}
export function installTouchControls(root,{active,dodge}){
 const input=new TouchInput();
 for(const button of root.querySelectorAll('[data-hold]')){
  const key=button.dataset.hold;
  button.addEventListener('pointerdown',event=>{if(!active()||event.button>0)return;event.preventDefault();button.setPointerCapture?.(event.pointerId);input.press(event.pointerId,key);button.setAttribute('aria-pressed','true');});
  const release=event=>{input.release(event.pointerId);button.setAttribute('aria-pressed',String(input.keys().has(key)));};
  for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,release);
  button.addEventListener('keydown',event=>{if(![' ','Enter'].includes(event.key))return;event.preventDefault();if(active())input.press('keyboard:'+key,key);button.setAttribute('aria-pressed',String(input.keys().has(key)));});
  button.addEventListener('keyup',event=>{if(![' ','Enter'].includes(event.key))return;event.preventDefault();input.release('keyboard:'+key);button.setAttribute('aria-pressed',String(input.keys().has(key)));});
  button.addEventListener('blur',()=>{input.release('keyboard:'+key);button.setAttribute('aria-pressed',String(input.keys().has(key)));});
 }
 root.querySelector('[data-dodge]').addEventListener('click',()=>{if(active())dodge();});
 const clear=input.clear.bind(input);input.clear=()=>{clear();for(const button of root.querySelectorAll('[data-hold]'))button.setAttribute('aria-pressed','false');};
 return input;
}
