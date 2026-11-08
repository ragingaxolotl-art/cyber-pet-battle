import {attackDiagnostics} from './shared/attack-diagnostics.js?v=20261108-cancels';
// Text-only rendering keeps imported attack names and notes out of HTML parsing.
export function attackChecks(attack,{expanded=false}={}) {
 const details=document.createElement('details');details.className='attack-checks';details.open=expanded;
 const summary=document.createElement('summary');summary.textContent='Compatibility checks';details.append(summary);
 const list=document.createElement('ul');
 for(const finding of attackDiagnostics(attack)) {
  const item=document.createElement('li');item.dataset.diagnostic=finding.code;
  item.textContent=(finding.level==='warning'?'Check: ':'Note: ')+finding.message+' '+finding.action;list.append(item);
 }
 details.append(list);return details;
}
