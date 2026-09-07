import {NextResponse} from 'next/server';
import {isAdminAuthorized} from '../../../../../lib/admin-auth';
import {getCultLocation,updateCultLocation,type CultPatch,type CultStatus} from '../../../../../lib/cult-db';
import {hasDatabase} from '../../../../../lib/db';

export const dynamic='force-dynamic';
const statuses=new Set<CultStatus>(['ACTIVE','FORMING','NOT_HERE_YET']);
const allowed=new Set(['status','chapterName','chapterNumber','hostLocation','sinceYear','activatedAt','instagramUrl','whatsappUrl','memberCount']);

export async function PATCH(request:Request,{params}:{params:{pin:string}}){
  if(!isAdminAuthorized(request))return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!hasDatabase())return NextResponse.json({error:'DATABASE_URL is not configured'},{status:503});
  if(!/^\d{6}$/.test(params.pin))return NextResponse.json({error:'PIN must be exactly 6 digits'},{status:400});
  let body:Record<string,unknown>;
  try{body=await request.json()}catch{return NextResponse.json({error:'Body must be valid JSON'},{status:400})}
  const unknown=Object.keys(body).filter(k=>!allowed.has(k));
  if(unknown.length)return NextResponse.json({error:`Unsupported field(s): ${unknown.join(', ')}`},{status:400});
  const current=await getCultLocation(params.pin);
  if(current.status==='NOT_HERE_YET'&&body.status===undefined)return NextResponse.json({error:'status is required when creating a Cult location'},{status:400});
  if(body.status!==undefined&&!statuses.has(body.status as CultStatus))return NextResponse.json({error:'status must be ACTIVE, FORMING, or NOT_HERE_YET'},{status:400});
  if(body.chapterNumber!==undefined&&body.chapterNumber!==null&&(typeof body.chapterNumber!=='number'||!Number.isInteger(body.chapterNumber)||body.chapterNumber<1))return NextResponse.json({error:'chapterNumber must be a positive integer or null'},{status:400});
  if(body.sinceYear!==undefined&&body.sinceYear!==null&&(typeof body.sinceYear!=='number'||!Number.isInteger(body.sinceYear)||body.sinceYear<1900||body.sinceYear>2100))return NextResponse.json({error:'sinceYear must be a valid year or null'},{status:400});
  if(body.memberCount!==undefined&&body.memberCount!==null&&(typeof body.memberCount!=='number'||!Number.isInteger(body.memberCount)||body.memberCount<0))return NextResponse.json({error:'memberCount must be a non-negative integer or null'},{status:400});
  const nullableStrings=['chapterName','hostLocation','activatedAt','instagramUrl','whatsappUrl'];
  for(const key of nullableStrings)if(body[key]!==undefined&&body[key]!==null&&typeof body[key]!=='string')return NextResponse.json({error:`${key} must be a string or null`},{status:400});
  try{return NextResponse.json(await updateCultLocation(params.pin,body as CultPatch))}
  catch(error){console.error('cult update failed',error);return NextResponse.json({error:'Unable to update Cult location'},{status:500})}
}
