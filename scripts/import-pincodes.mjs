import fs from 'node:fs/promises';

const RESOURCE_ID=process.env.OGD_PINCODE_RESOURCE_ID||'5c2f62fe-5afa-4119-a499-fec9d604d5bd';
const API_KEY=process.env.DATA_GOV_IN_API_KEY;
if(!API_KEY) throw new Error('Set DATA_GOV_IN_API_KEY from data.gov.in');
const base=`https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${encodeURIComponent(API_KEY)}&format=json`;
let offset=0;const limit=1000;const rows=[];
while(true){const res=await fetch(`${base}&limit=${limit}&offset=${offset}`);if(!res.ok)throw new Error(`OGD request failed ${res.status}`);const json=await res.json();const batch=json.records||[];rows.push(...batch);if(batch.length<limit)break;offset+=limit;}
const pick=(r,names)=>{for(const n of names)if(r[n]!=null&&String(r[n]).trim())return String(r[n]).trim();return ''};
const byPin=new Map();
for(const r of rows){const pincode=pick(r,['pincode','pin_code','pin']);if(!/^\d{6}$/.test(pincode))continue;const state=pick(r,['statename','state_name','state']);const district=pick(r,['district','districtname','district_name']);const officeName=pick(r,['officename','office_name','office']);if(!state||!district||!officeName)continue;const office={officeName,officeType:pick(r,['officetype','office_type']),deliveryStatus:pick(r,['delivery','deliverystatus','delivery_status'])};const existing=byPin.get(pincode);if(existing){if(!existing.postOffices.some(x=>x.officeName===officeName))existing.postOffices.push(office)}else byPin.set(pincode,{pincode,district,state,postOffices:[office]});}
const output=[...byPin.values()].sort((a,b)=>a.pincode.localeCompare(b.pincode));
await fs.mkdir('data',{recursive:true});await fs.writeFile('data/pincodes.json',JSON.stringify(output));
console.log(`Imported ${rows.length} post-office rows into ${output.length} unique PIN pages.`);
