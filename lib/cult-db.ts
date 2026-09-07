import {getDb,hasDatabase} from './db';
import {findPincode} from './pincodes';

export type CultStatus='ACTIVE'|'FORMING'|'NOT_HERE_YET';
export type CultLocation={
  pincode:string;status:CultStatus;chapterName:string|null;chapterNumber:number|null;hostLocation:string|null;sinceYear:number|null;activatedAt:string|null;instagramUrl:string|null;whatsappUrl:string|null;memberCount:number|null;updatedAt:string|null;
};
export type CultPatch=Partial<Omit<CultLocation,'pincode'|'updatedAt'>>;

const empty=(pincode:string):CultLocation=>({pincode,status:'NOT_HERE_YET',chapterName:null,chapterNumber:null,hostLocation:null,sinceYear:null,activatedAt:null,instagramUrl:null,whatsappUrl:null,memberCount:null,updatedAt:null});

function legacy(pincode:string):CultLocation{
  const item=findPincode(pincode);
  if(!item||item.status==='NOT_HERE_YET')return empty(pincode);
  return {pincode,status:item.status,chapterName:item.chapter??null,chapterNumber:item.status==='ACTIVE'&&pincode==='759001'?1:null,hostLocation:item.host??null,sinceYear:item.since??null,activatedAt:null,instagramUrl:null,whatsappUrl:null,memberCount:item.members??null,updatedAt:null};
}

export async function getCultLocation(pincode:string):Promise<CultLocation>{
  if(!hasDatabase())return legacy(pincode);
  const result=await getDb().query(`SELECT pincode,status,chapter_name,chapter_number,host_location,since_year,activated_at,instagram_url,whatsapp_url,member_count,updated_at FROM cult_locations WHERE pincode=$1`,[pincode]);
  if(!result.rowCount)return empty(pincode);
  const r=result.rows[0];
  return {pincode:r.pincode.trim(),status:r.status,chapterName:r.chapter_name,chapterNumber:r.chapter_number,hostLocation:r.host_location,sinceYear:r.since_year,activatedAt:r.activated_at?.toISOString?.()??r.activated_at??null,instagramUrl:r.instagram_url,whatsappUrl:r.whatsapp_url,memberCount:r.member_count,updatedAt:r.updated_at?.toISOString?.()??r.updated_at??null};
}

export async function updateCultLocation(pincode:string,patch:CultPatch):Promise<CultLocation>{
  if(!hasDatabase())throw new Error('DATABASE_URL is not configured');
  const current=await getCultLocation(pincode);
  const next={...current,...patch,pincode};
  if(next.status==='NOT_HERE_YET'){
    await getDb().query('DELETE FROM cult_locations WHERE pincode=$1',[pincode]);
    return empty(pincode);
  }
  const result=await getDb().query(`INSERT INTO cult_locations
    (pincode,status,chapter_name,chapter_number,host_location,since_year,activated_at,instagram_url,whatsapp_url,member_count,updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
    ON CONFLICT (pincode) DO UPDATE SET
      status=EXCLUDED.status,chapter_name=EXCLUDED.chapter_name,chapter_number=EXCLUDED.chapter_number,host_location=EXCLUDED.host_location,since_year=EXCLUDED.since_year,activated_at=EXCLUDED.activated_at,instagram_url=EXCLUDED.instagram_url,whatsapp_url=EXCLUDED.whatsapp_url,member_count=EXCLUDED.member_count,updated_at=NOW()
    RETURNING pincode,status,chapter_name,chapter_number,host_location,since_year,activated_at,instagram_url,whatsapp_url,member_count,updated_at`,[
      pincode,next.status,next.chapterName,next.chapterNumber,next.hostLocation,next.sinceYear,next.activatedAt,next.instagramUrl,next.whatsappUrl,next.memberCount
    ]);
  const r=result.rows[0];
  return {pincode:r.pincode.trim(),status:r.status,chapterName:r.chapter_name,chapterNumber:r.chapter_number,hostLocation:r.host_location,sinceYear:r.since_year,activatedAt:r.activated_at?.toISOString?.()??r.activated_at??null,instagramUrl:r.instagram_url,whatsappUrl:r.whatsapp_url,memberCount:r.member_count,updatedAt:r.updated_at?.toISOString?.()??r.updated_at??null};
}

export async function getCultStats(){
  if(!hasDatabase())return {active:1,forming:0};
  const result=await getDb().query(`SELECT status,COUNT(*)::int AS count FROM cult_locations GROUP BY status`);
  const counts=new Map(result.rows.map(r=>[r.status,Number(r.count)]));
  return {active:counts.get('ACTIVE')||0,forming:counts.get('FORMING')||0};
}
