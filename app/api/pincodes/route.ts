import {NextRequest,NextResponse} from 'next/server';
import {listPostalStates,postalSlug,searchPostal} from '../../../lib/postal-db';
import {hasDatabase} from '../../../lib/db';

export const dynamic='force-dynamic';

export async function GET(request:NextRequest){
  if(!hasDatabase())return NextResponse.json({error:'Postal database is not configured',items:[]},{status:503});
  const mode=request.nextUrl.searchParams.get('mode');
  try{
    if(mode==='states'){
      const items=(await listPostalStates()).map(item=>({...item,slug:postalSlug(item.state)}));
      return NextResponse.json({items});
    }
    const q=(request.nextUrl.searchParams.get('q')||'').trim();
    if(q.length<2)return NextResponse.json({items:[]});
    return NextResponse.json({items:await searchPostal(q,20)});
  }catch(error){
    console.error('legacy pincode API failed',error);
    return NextResponse.json({error:'Postal lookup unavailable',items:[]},{status:503});
  }
}
