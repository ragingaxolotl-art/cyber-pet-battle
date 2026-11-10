export const API='https://cyber-pet-classroom-settings.ragingaxolotl.chatgpt.site/student-backups';
// Credentials stay in memory; a response belongs to exactly one sign-in session.
export function accountClient(request=fetch,now=Date.now){
 let credentials=null,expires=0,expiryTimer,generation=0;
 const clear=()=>{generation++;credentials=null;expires=0;clearTimeout(expiryTimer);};
 function current(expected){
  if(expected!==generation)throw Error('Your account session changed. Sign in again to continue.');
  if(!credentials||now()>=expires){clear();throw Error('Sign in again to load a pet.');}
 }
 function headers(){current(generation);return {'X-Student-Id':credentials.id,'X-Student-Pin':credentials.pin};}
 async function get(path=''){
  const auth=headers(),session=generation;
  const response=await request(API+path,{headers:auth,cache:'no-store',credentials:'omit',redirect:'error'});current(session);
  if(!response.ok){
   let message='Could not load your backup.';try{message=(await response.json()).error||message;}catch{}
   current(session);if(response.status===401)clear();throw Error(message);
  }
  return {response,session};
 }
 async function readJson(path){const {response,session}=await get(path);const value=await response.json();current(session);return value;}
 return {
  async signIn(id,pin){
   if(!/^[a-z0-9_-]{3,32}$/.test(id)||!/^\d{5,12}$/.test(pin))throw Error('Enter your classroom username and 5–12 digit PIN.');
   clear();credentials={id,pin};expires=now()+15*60*1000;const session=generation;
   expiryTimer=setTimeout(()=>{if(session===generation)clear();},15*60*1000);expiryTimer.unref?.();
   try{return await readJson('');}catch(error){if(session===generation)clear();throw error;}
  },
  async download(revision){
   if(!Number.isInteger(revision)||revision<1||revision>999999999)throw Error('Invalid backup revision.');
   const {response,session}=await get('/revisions/'+revision),hash=response.headers.get('X-Backup-SHA256');
   if(!/^[a-f0-9]{64}$/.test(hash||''))throw Error('Backup checksum is missing.');
   const buffer=await response.arrayBuffer();current(session);
   if(buffer.byteLength>32*1024*1024)throw Error('Backup is too large.');return {buffer,hash};
  },
  readTrees:()=>readJson('/trees'),
  readBattleProfile:petId=>readJson('/battle-profile?pet='+encodeURIComponent(petId)),
  async saveBattleProfile(profile,revision){
   const auth=headers(),session=generation;
   const response=await request(API+'/battle-profile?pet='+encodeURIComponent(profile.petId),{method:'PUT',headers:{...auth,'Content-Type':'application/json'},body:JSON.stringify({profile,revision}),credentials:'omit',redirect:'error'});current(session);
   let body;try{body=await response.json();}catch{current(session);throw Error('Website saving returned an unreadable response. Keep your local backup.');}
   current(session);if(!response.ok){if(response.status===401)clear();throw Error(body.error||'Could not save battle progress.');}return body;
  },
  signOut:clear
 };
}
