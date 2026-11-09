import {attackDiagnostics} from './shared/attack-diagnostics.js?v=20261109-final-ui-release';
// Keep long guidance out of narrow mapper cards. Imported text is never HTML.
export function attackChecks(attack) {
 const button=document.createElement('button');button.type='button';button.className='attack-checks';button.textContent='Compatibility checks';button.setAttribute('aria-haspopup','dialog');
 button.onclick=()=>{
  const dialog=document.createElement('dialog');dialog.setAttribute('aria-label','Attack compatibility checks');dialog.style.cssText='width:min(680px,92vw);max-width:92vw;max-height:85dvh;overflow:auto;padding:20px;box-sizing:border-box';
  const heading=document.createElement('h2');heading.textContent='Compatibility checks';
  const name=document.createElement('p');name.textContent=attack.name;name.style.overflowWrap='anywhere';
  const close=document.createElement('button');close.type='button';close.textContent='Close compatibility checks';close.onclick=()=>dialog.close();
  const list=document.createElement('ul');list.style.cssText='padding-left:1.25em;line-height:1.55;overflow-wrap:anywhere';
  for(const finding of attackDiagnostics(attack)){
   const item=document.createElement('li');item.dataset.diagnostic=finding.code;item.style.marginBlock='0.85em';item.textContent=(finding.level==='warning'?'Check: ':'Note: ')+finding.message+' '+finding.action;list.append(item);
  }
  dialog.append(heading,name,close,list);dialog.addEventListener('close',()=>{dialog.remove();button.focus();});document.body.append(dialog);dialog.showModal();close.focus();
 };
 return button;
}
