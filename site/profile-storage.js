import {validateProfile,freshProfile} from './progression.js?v=20261109-conditional-release';
// Database transactions preserve the original localStorage profile as a fallback.
export class ProfileDatabase {
 constructor(storage){this.storage=storage;this.key=null;this.raw=null;}
 open(petId){this.key='cyber-pet-battle-profile-v1:'+encodeURIComponent(petId);this.raw=this.storage.getItem(this.key);const p=this.raw?validateProfile(JSON.parse(this.raw)):freshProfile(petId);if(p.petId!==petId)throw Error('This profile belongs to another pet.');return p;}
 async save(profile,extra){profile=validateProfile(profile);if(this.key!=='cyber-pet-battle-profile-v1:'+encodeURIComponent(profile.petId))throw Error('Open the matching pet before saving its profile.');const key=this.key,expected=this.raw,raw=JSON.stringify(profile);await this.storage.transaction(storage=>{if(storage.getItem(key)!==expected)throw Error('This pet changed in another tab. Reopen its profile before saving.');storage.setItem(key,raw);extra?.(storage);});if(this.key===key)this.raw=raw;return profile;}
}
