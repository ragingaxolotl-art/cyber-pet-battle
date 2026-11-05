// A small DOM/Canvas test double, not a browser or a visual-layout test.
import fs from 'node:fs';
import path from 'node:path';
export function environment(htmlPath,root){
 const ids=new Map(),frames=[],storage=new Map();
 const context=new Proxy({getImageData:()=>({data:new Uint8ClampedArray(128*128*4)}),measureText:t=>({width:String(t).length*7}),createLinearGradient:()=>({addColorStop(){}})}, {get:(o,k)=>k in o?o[k]:()=>{}});
 class Node{
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.style={setProperty(){}};this.dataset={};this.listeners={};this._text='';this._value=undefined;this.checked=false;this.disabled=false;this.className='';this.classList={toggle:(c,on)=>{const s=new Set(this.className.split(' '));if(on??!s.has(c))s.add(c);else s.delete(c);this.className=[...s].join(' ');},add:c=>this.classList.toggle(c,true),remove:c=>this.classList.toggle(c,false),contains:c=>this.className.split(' ').includes(c)};}
  set id(v){this.attributes.id=v;ids.set(v,this);}get id(){return this.attributes.id;}
  set textContent(v){this._text=String(v);this.children=[];}get textContent(){return this._text+this.children.map(c=>c.textContent||'').join('');}
  set innerHTML(v){this.replaceChildren();this._text=v;}get innerHTML(){return this.textContent;}
  get options(){return this.children.filter(c=>c.tagName==='OPTION');}
  set value(v){this._value=String(v);}get value(){return this._value??(this.tagName==='SELECT'?(this.options.find(o=>o.selected)||this.options[0])?.value||'':this.attributes.value||'');}
  append(...nodes){for(let n of nodes){if(typeof n==='string')n=Object.assign(new Node('#text'),{_text:n});if(n.parentElement)n.remove();n.parentElement=this;this.children.push(n);}}
  prepend(...nodes){for(const n of nodes.reverse()){n.parentElement=this;this.children.unshift(n);}}
  appendChild(n){this.append(n);return n;}replaceChildren(...nodes){this.children.forEach(c=>c.parentElement=null);this.children=[];this._text='';this.append(...nodes);}add(o){this.append(o);}
  remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(c=>c!==this);this.parentElement=null;}
  get lastChild(){return this.children.at(-1);}get firstChild(){return this.children[0];}
  setAttribute(k,v){if(k==='id')this.id=v;else if(k==='class')this.className=v;else if(k.startsWith('data-'))this.dataset[k.slice(5)]=v;this.attributes[k]=String(v);}getAttribute(k){return this.attributes[k]??null;}
  matches(q){q=q.trim();if(q==='*')return true;if(q.startsWith('#'))return this.id===q.slice(1);if(q.startsWith('.'))return this.classList.contains(q.slice(1));const attr=q.match(/^\[([^=]+)(?:=["']?([^"'\]]+)["']?)?\]$/);if(attr)return attr[2]?this.getAttribute(attr[1])===attr[2]:this.getAttribute(attr[1])!==null;return this.tagName===q.toUpperCase();}
  querySelectorAll(query){const parts=query.trim().split(/\s+/),last=parts.pop(),all=[];const visit=n=>{for(const c of n.children){if(last.split(',').some(q=>c.matches(q))){let parent=c.parentElement,ok=true;for(const p of [...parts].reverse()){while(parent&&!parent.matches(p))parent=parent.parentElement;if(!parent){ok=false;break;}parent=parent.parentElement;}if(ok)all.push(c);}visit(c);}};visit(this);return all;}
  querySelector(q){return this.querySelectorAll(q)[0]||null;}closest(q){let n=this;while(n){if(q.split(',').some(p=>n.matches(p)))return n;n=n.parentElement;}return null;}
  addEventListener(t,fn){(this.listeners[t]??=[]).push(fn);}removeEventListener(){}
  async click(){if(this.disabled)return;const e={target:this,preventDefault(){},stopImmediatePropagation(){this.stopped=true;}};for(const fn of this.listeners.click||[]){await fn(e);if(e.stopped)return;}return this.onclick?.(e);}
  focus(){document.activeElement=this;}showModal(){this.open=true;}close(){this.open=false;for(const fn of this.listeners.close||[])fn({target:this});}
  checkValidity(){const n=Number(this.value);return this.type!=='number'||this.value!==''&&Number.isFinite(n)&&(this.min===undefined||n>=Number(this.min))&&(this.max===undefined||n<=Number(this.max));}
  getContext(){return context;}getBoundingClientRect(){return {left:0,top:0,width:960,height:480};}setPointerCapture(){}scrollIntoView(){}
  cloneNode(deep){const n=new Node(this.tagName);n._text=this._text;n.className=this.className;n._value=this._value;if(deep)for(const child of this.children)n.append(child.cloneNode(true));return n;}
 }
 const doc=new Node('document'),stack=[doc],voids=new Set(['input','meta','link','img','br','hr']);
 const html=fs.readFileSync(htmlPath,'utf8');
 for(const token of html.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g)||[]){if(token.startsWith('<!'))continue;if(token.startsWith('</')){if(stack.length>1)stack.pop();continue;}if(token.startsWith('<')){const tag=token.match(/^<([\w-]+)/)?.[1];if(!tag)continue;const n=new Node(tag);for(const m of token.matchAll(/\s([\w-]+)(?:="([^"]*)"|'([^']*)'|([^\s>]+))?/g)){const [_,k,a,b,c]=m,v=a??b??c??'';n.setAttribute(k,v);if(['checked','disabled','selected','hidden','open'].includes(k))n[k]=true;else if(['type','min','max','width','height','value'].includes(k))n[k]=v;}stack.at(-1).append(n);if(!voids.has(tag)&&!token.endsWith('/>'))stack.push(n);}else stack.at(-1)._text+=token;}
 doc.getElementById=id=>ids.get(id)||null;doc.createElement=tag=>new Node(tag);doc.createTextNode=t=>Object.assign(new Node('#text'),{_text:String(t)});doc.documentElement=doc.querySelector('html');doc.body=doc.querySelector('body');doc.activeElement=doc.body;
 globalThis.document=doc;globalThis.window=new Node('window');window.devicePixelRatio=1;
 globalThis.location={search:'',origin:'http://127.0.0.1:8766',href:'http://127.0.0.1:8766/design.html'};
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 globalThis.Option=class extends Node{constructor(text,value){super('option');this.textContent=text;this.value=value;}};
 globalThis.Image=class{constructor(){this.complete=false;this.naturalWidth=128;this.naturalHeight=128;this.width=128;this.height=128;}set src(v){this.url=v;queueMicrotask(()=>{this.complete=true;this.onload?.();});}addEventListener(t,f){if(t==='load')queueMicrotask(f);}};
 globalThis.indexedDB={open(){throw Error('IndexedDB unavailable in this test');}};
 globalThis.requestAnimationFrame=fn=>{frames.push(fn);return frames.length;};globalThis.confirm=()=>true;
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{}});
 globalThis.fetch=async url=>{try{const relative=String(url).split('?')[0];if(relative.startsWith('http'))return new Response('{}',{status:401});return new Response(fs.readFileSync(path.join(root,relative)),{status:200});}catch{return new Response('{}',{status:404});}};
 return {doc,ids,frames,storage,context,Node};
}
