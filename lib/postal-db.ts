import {getDb,hasDatabase} from './db';

export type PostalOffice={
  officeName:string;officeType:string|null;deliveryStatus:string|null;circleName:string|null;regionName:string|null;divisionName:string|null;latitude:number|null;longitude:number|null;
};
export type PostalPin={pincode:string;district:string;state:string;postOffices:PostalOffice[]};
export type PostalSearchResult={pincode:string;district:string;state:string;office:string;postOffices:number};

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
  const result=await getDb().query(`SELECT pincode,district,state,MIN(office_name) AS office,COUNT(*)::int AS post_offices
    FROM postal_post_offices
    WHERE pincode LIKE $1 OR office_name ILIKE $2 OR district ILIKE $2 OR state ILIKE $2
    GROUP BY pincode,district,state
    ORDER BY CASE WHEN pincode=$3 THEN 0 WHEN pincode LIKE $1 THEN 1 ELSE 2 END,pincode
    LIMIT $4`,[`${q}%`,`%${q}%`,q,Math.min(Math.max(limit,1),50)]);
  return result.rows.map(r=>({pincode:r.pincode.trim(),district:r.district,state:r.state,office:r.office,postOffices:Number(r.post_offices)}));
}

export async function listPostalStates(){
  if(!hasDatabase())return [];
  const result=await getDb().query(`SELECT state,COUNT(DISTINCT pincode)::int AS pins,COUNT(*)::int AS offices FROM postal_post_offices GROUP BY state ORDER BY state`);
  return result.rows.map(r=>({state:r.state,pins:Number(r.pins),offices:Number(r.offices)}));
}

export async function listPostalDistricts(state:string){
  if(!hasDatabase())return [];
  const result=await getDb().query(`SELECT district,COUNT(DISTINCT pincode)::int AS pins,COUNT(*)::int AS offices FROM postal_post_offices WHERE state=$1 GROUP BY district ORDER BY district`,[state]);
  return result.rows.map(r=>({district:r.district,pins:Number(r.pins),offices:Number(r.offices)}));
}

export async function getPostalImportStatus(){
  if(!hasDatabase())return null;
  const result=await getDb().query(`SELECT source_file,source_dataset,office_rows,unique_pins,imported_at FROM postal_imports ORDER BY imported_at DESC,id DESC LIMIT 1`);
  if(!result.rowCount)return null;
  const r=result.rows[0];return {sourceFile:r.source_file,sourceDataset:r.source_dataset,officeRows:Number(r.office_rows),uniquePins:Number(r.unique_pins),importedAt:r.imported_at};
}
