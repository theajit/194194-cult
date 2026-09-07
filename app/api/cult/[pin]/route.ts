import {NextResponse} from 'next/server';
import {getCultLocation} from '../../../../lib/cult-db';

export const dynamic='force-dynamic';

export async function GET(_request:Request,{params}:{params:{pin:string}}){
  if(!/^\d{6}$/.test(params.pin))return NextResponse.json({error:'PIN must be exactly 6 digits'},{status:400});
  try{return NextResponse.json(await getCultLocation(params.pin),{headers:{'Cache-Control':'public, s-maxage=60, stale-while-revalidate=300'}})}
  catch(error){console.error('cult lookup failed',error);return NextResponse.json({error:'Cult lookup unavailable'},{status:503})}
}
