import {NextResponse} from 'next/server';
import {getCultStats} from '../../../../lib/cult-db';

export const dynamic='force-dynamic';

export async function GET(){
  try{return NextResponse.json(await getCultStats(),{headers:{'Cache-Control':'public, s-maxage=60, stale-while-revalidate=300'}})}
  catch(error){console.error('cult stats failed',error);return NextResponse.json({active:0,forming:0,error:'Cult stats unavailable'},{status:503})}
}
