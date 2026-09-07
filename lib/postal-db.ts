import {getDb,hasDatabase} from './db';

export type PostalOffice={
  officeName:string;officeType:string|null;deliveryStatus:string|null;circleName:string|null;regionName:string|null;divisionName:string|null;latitude:number|null;longitude:number|null;
};
export type PostalPin={pincode:string;district:string;state:string;postOffices:PostalOffice[]};
export type PostalSearchResult={pincode:string;district:string;state:string;office:string;postOffices:number;cultStatus:'ACTIVE'|'FORMING'|'NOT_HERE_YET'};
export const postalSlug=(value:string)=>value.toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export async function getPostalPin(pincode:string):Promise<PostalPin|null>{
  if(!hasDatabase())return null;
  const result=await getDb().query(`SELECT pincode,district,state,office_name,office_type,delivery_status,circle_name,region_name,division_name,latitude,longitude
    FROM postal_post_offices WHERE pincode=$1 ORDER BY office_name`,[pincode]);
  if(!result.rowCount)return null;
  const first=result.rows[0];
  return {pincode:first.pincode.trim(),district:first.district,state:first.state,postOffices:result.rows.map(r=>({officeName:r.office_name,officeType:r.office_type,deliveryStatus:r.delivery_status,circleName:r.circle_name,regionName:r.region_name,divisionName:r.division_name,latitude:r.latitude==null?null:Number(r.latitude),longitude:r.longitude==null?null:Number(r.longitude)}))};
}

export async function searchPostal(query:string,limit=20):Promise<PostalSearchResult[]>{
  if(!hasDatabase())return [];
  const q=query.trim();if(q.length<2)return [];
  const result=await getDb().query(`SELECT p.pincode,p.district,p.state,MIN(p.office_name) AS office,COUNT(*)::int AS post_offices,COALESCE(c.status,'NOT_HERE_YET') AS cult_status
    FROM postal_post_offices p
    LEFT JOIN cult_locations c ON c.pincode=p.pincode
    WHERE p.pincode LIKE $1 OR p.office_name ILIKE $2 OR p.district ILIKE $2 OR p.state ILIKE $2
    GROUP BY p.pincode,p.district,p.state,c.status
    ORDER BY CASE WHEN p.pincode=$3 THEN 0 WHEN p.pincode LIKE $1 THEN 1 ELSE 2 END,p.pincode
    LIMIT $4`,[`${q}%`,`%${q}%`,q,Math.min(Math.max(limit,1),50)]);
  return result.rows.map(r=>({pincode:r.pincode.trim(),district:r.district,state:r.state,office:r.office,postOffices:Number(r.post_offices),cultStatus:r.cult_status}));
}

export async function listPostalStates(){
  if(!hasDatabase())return [];
  const result=await getDb().query(`SELECT state,COUNT(DISTINCT district)::int AS districts,COUNT(DISTINCT pincode)::int AS pins,COUNT(*)::int AS offices FROM postal_post_offices GROUP BY state ORDER BY state`);
  return result.rows.map(r=>({state:r.state,districts:Number(r.districts),pins:Number(r.pins),offices:Number(r.offices)}));
}

export async function listPostalDistricts(state:string){
  if(!hasDatabase())return [];
  const result=await getDb().query(`SELECT district,COUNT(DISTINCT pincode)::int AS pins,COUNT(*)::int AS offices FROM postal_post_offices WHERE state=$1 GROUP BY district ORDER BY district`,[state]);
  return result.rows.map(r=>({district:r.district,pins:Number(r.pins),offices:Number(r.offices)}));
}

export async function findPostalStateBySlug(stateSlug:string){
  const states=await listPostalStates();
  return states.find(item=>postalSlug(item.state)===stateSlug)||null;
}

export async function findPostalDistrictBySlug(state:string,districtSlug:string){
  const districts=await listPostalDistricts(state);
  return districts.find(item=>postalSlug(item.district)===districtSlug)||null;
}

export async function listPinsForDistrict(state:string,district:string):Promise<PostalSearchResult[]>{
  if(!hasDatabase())return [];
  const result=await getDb().query(`SELECT p.pincode,p.district,p.state,MIN(p.office_name) AS office,COUNT(*)::int AS post_offices,COALESCE(c.status,'NOT_HERE_YET') AS cult_status
    FROM postal_post_offices p
    LEFT JOIN cult_locations c ON c.pincode=p.pincode
    WHERE p.state=$1 AND p.district=$2
    GROUP BY p.pincode,p.district,p.state,c.status ORDER BY p.pincode`,[state,district]);
  return result.rows.map(r=>({pincode:r.pincode.trim(),district:r.district,state:r.state,office:r.office,postOffices:Number(r.post_offices),cultStatus:r.cult_status}));
}

export async function getPostalImportStatus(){
  if(!hasDatabase())return null;
  const result=await getDb().query(`SELECT source_file,source_dataset,office_rows,unique_pins,imported_at FROM postal_imports ORDER BY imported_at DESC,id DESC LIMIT 1`);
  if(!result.rowCount)return null;
  const r=result.rows[0];return {sourceFile:r.source_file,sourceDataset:r.source_dataset,officeRows:Number(r.office_rows),uniquePins:Number(r.unique_pins),importedAt:r.imported_at};
}
