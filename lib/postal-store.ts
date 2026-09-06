'use client';

import type {PinRecord} from './directory';

const DB_NAME='194194-postal-directory';
const DB_VERSION=1;
const PIN_STORE='pins';
const META_STORE='meta';
const META_KEY='directory';

export type PostalCacheMeta={version:string;pinCount:number;officeCount:number;syncedAt:string};

type DirectoryPayload={version:string;records:PinRecord[];pinCount:number;officeCount:number};

function openDb():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains(PIN_STORE)){
        const store=db.createObjectStore(PIN_STORE,{keyPath:'pincode'});
        store.createIndex('state','state',{unique:false});
        store.createIndex('district','district',{unique:false});
      }
      if(!db.objectStoreNames.contains(META_STORE))db.createObjectStore(META_STORE);
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

function requestValue<T>(request:IDBRequest<T>):Promise<T>{
  return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
}

export async function getPostalCacheMeta():Promise<PostalCacheMeta|null>{
  if(typeof indexedDB==='undefined')return null;
  const db=await openDb();
  try{return (await requestValue(db.transaction(META_STORE,'readonly').objectStore(META_STORE).get(META_KEY)))||null}
  finally{db.close()}
}

export async function replacePostalDirectory(payload:DirectoryPayload):Promise<PostalCacheMeta>{
  const db=await openDb();
  const meta:PostalCacheMeta={version:payload.version,pinCount:payload.pinCount,officeCount:payload.officeCount,syncedAt:new Date().toISOString()};
  await new Promise<void>((resolve,reject)=>{
    const tx=db.transaction([PIN_STORE,META_STORE],'readwrite');
    const pins=tx.objectStore(PIN_STORE);
    pins.clear();
    for(const record of payload.records)pins.put(record);
    tx.objectStore(META_STORE).put(meta,META_KEY);
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
    tx.onabort=()=>reject(tx.error);
  });
  db.close();
  return meta;
}

export async function syncPostalDirectory(force=false):Promise<PostalCacheMeta>{
  const current=await getPostalCacheMeta();
  const response=await fetch('/api/pincodes/all',{cache:'no-store'});
  if(!response.ok)throw new Error(`Postal directory sync failed (${response.status})`);
  const payload=await response.json() as DirectoryPayload;
  if(!force&&current?.version===payload.version&&current.pinCount===payload.pinCount)return current;
  return replacePostalDirectory(payload);
}

export async function getCachedPin(pincode:string):Promise<PinRecord|null>{
  const db=await openDb();
  try{return (await requestValue(db.transaction(PIN_STORE,'readonly').objectStore(PIN_STORE).get(pincode)))||null}
  finally{db.close()}
}

export async function searchCachedPostalDirectory(query:string,limit=20):Promise<PinRecord[]>{
  const q=query.trim().toLowerCase();
  if(q.length<2)return [];
  const db=await openDb();
  try{
    const records=await requestValue(db.transaction(PIN_STORE,'readonly').objectStore(PIN_STORE).getAll());
    return records.filter(r=>r.pincode.includes(q)||r.district.toLowerCase().includes(q)||r.state.toLowerCase().includes(q)||r.postOffices.some(o=>o.officeName.toLowerCase().includes(q))).slice(0,limit);
  }finally{db.close()}
}

export async function cachedStates():Promise<Array<{state:string;pins:number}>>{
  const db=await openDb();
  try{
    const records=await requestValue(db.transaction(PIN_STORE,'readonly').objectStore(PIN_STORE).getAll());
    const counts=new Map<string,number>();
    for(const record of records)counts.set(record.state,(counts.get(record.state)||0)+1);
    return Array.from(counts.entries()).sort(([a],[b])=>a.localeCompare(b)).map(([state,pins])=>({state,pins}));
  }finally{db.close()}
}
