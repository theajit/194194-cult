import {NextResponse} from 'next/server';
import {listPostalStates} from '../../../../lib/postal-db';
import {hasDatabase} from '../../../../lib/db';

export const dynamic='force-dynamic';

export async function GET(){
  if(!hasDatabase())return NextResponse.json({error:'Postal database is not configured',items:[]},{status:503});
  try{return NextResponse.json({items:await listPostalStates()},{headers:{'Cache-Control':'public, s-maxage=3600, stale-while-revalidate=86400'}})}
  catch(error){console.error('postal states failed',error);return NextResponse.json({error:'Postal states unavailable',items:[]},{status:503})}
}
