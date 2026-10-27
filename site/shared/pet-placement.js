import {stableArtwork,stableFrame} from './stable-artwork.js';
import {framePlacement} from './display.js';
const valid=(v,min,max,fallback)=>Number.isFinite(v)&&v>=min&&v<=max?v:fallback;
// Canvas readback happens once when artwork is loaded, never in the render loop.
export function preparePetPlacement(data,measure=measureImage){
 const bounds=new Map();for(const [name,image] of data.images)bounds.set(name,measure(image));
 const byImage=new Map([...data.images].map(([name,image])=>[image,bounds.get(name)]));
 const stable=stableArtwork(data,image=>byImage.get(image));
 data.placementBounds=bounds;data.stableFrames=stable.frames;data.artworkEnvelope=stable.envelope;
 return data;
}
function measureImage(image){
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
 const pixels=ctx.getImageData(0,0,image.width,image.height).data;
 let left=image.width,top=image.height,right=-1,bottom=-1;
 for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++)if(pixels[(y*image.width+x)*4+3]>0){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 canvas.width=canvas.height=1;
 return right<0?{x:0,y:0,w:image.width,h:image.height,empty:true}:{x:left,y:top,w:right-left+1,h:bottom-top+1};
}
export function petPlacement(data,action,name){
 const envelope=data.artworkEnvelope,image=data.images.get(name),bounds=data.placementBounds.get(name);
 const authored=valid(data.config.display?.pet_scale,.01,16,3);
 const unit=100/220*1.25,requested=authored*unit;
 const scale=Math.min(requested,150/Math.max(1,envelope.bottom-envelope.top),180/Math.max(1,envelope.right-envelope.left));
 const frame=stableFrame(data,action,name,bounds,image);
 const placement=framePlacement(frame,envelope,scale);
 placement.y+=valid(data.config.display?.pet_y_offset,-2048,2048,0)*unit*(scale/requested);
 return placement;
}
