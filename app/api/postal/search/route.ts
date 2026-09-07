import {NextRequest,NextResponse} from 'next/server';
import {searchPostal} from '../../../../lib/postal-db';
import {hasDatabase} from '../../../../lib/db';

export const dynamic='force-dynamic';

export async function GET(request:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Postal database is not configured',items:[]},{status:503});
  const q=(request.nextUrl.searchParams.get('q')||'').trim();
  const limit=Number(request.nextUrl.searchParams.get('limit')||20);
  if(q.length<2)return NextResponse.json({items:[]});
  try{return NextResponse.json({items:await searchPostal(q,Number.isFinite(limit)?limit:20)},{headers:{'Cache-Control':'public, s-maxage=300, stale-while-revalidate=3600'}})}
  catch(error){console.error('postal search failed',error);return NextResponse.json({error:'Postal search unavailable',items:[]},{status:503})}
}
