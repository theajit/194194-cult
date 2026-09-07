import {NextResponse} from 'next/server';
import {getPostalPin} from '../../../../../lib/postal-db';
import {hasDatabase} from '../../../../../lib/db';

export const dynamic='force-dynamic';

export async function GET(_request:Request,{params}:{params:{pin:string}}){
  if(!/^\d{6}$/.test(params.pin))return NextResponse.json({error:'PIN must be exactly 6 digits'},{status:400});
  if(!hasDatabase())return NextResponse.json({error:'Postal database is not configured'},{status:503});
  try{
    const item=await getPostalPin(params.pin);
    if(!item)return NextResponse.json({error:'PIN not found'},{status:404});
    return NextResponse.json(item,{headers:{'Cache-Control':'public, s-maxage=86400, stale-while-revalidate=604800'}});
  }catch(error){
    console.error('postal pin lookup failed',error);
    return NextResponse.json({error:'Postal lookup unavailable'},{status:503});
  }
}
