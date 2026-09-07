import {NextResponse} from 'next/server';
import {listPostalDistricts} from '../../../../../../lib/postal-db';
import {hasDatabase} from '../../../../../../lib/db';

export const dynamic='force-dynamic';

export async function GET(_request:Request,{params}:{params:{state:string}}){
  if(!hasDatabase())return NextResponse.json({error:'Postal database is not configured',items:[]},{status:503});
  const state=decodeURIComponent(params.state).trim();
  if(!state)return NextResponse.json({error:'State is required',items:[]},{status:400});
  try{return NextResponse.json({state,items:await listPostalDistricts(state)},{headers:{'Cache-Control':'public, s-maxage=3600, stale-while-revalidate=86400'}})}
  catch(error){console.error('postal districts failed',error);return NextResponse.json({error:'Postal districts unavailable',items:[]},{status:503})}
}
