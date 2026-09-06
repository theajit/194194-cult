import {NextRequest,NextResponse} from 'next/server';
import {allPins,states,slug} from '../../../lib/directory';

export const dynamic='force-dynamic';

export function GET(request:NextRequest){
  const {searchParams}=new URL(request.url);
  const mode=searchParams.get('mode');
  if(mode==='states'){
    const items=states().map(state=>({state,slug:slug(state),pins:allPins().filter(r=>r.state===state).length}));
    return NextResponse.json({items});
  }
  const q=(searchParams.get('q')||'').trim().toLowerCase();
  if(q.length<2)return NextResponse.json({items:[]});
  const items=allPins().filter(r=>r.pincode.includes(q)||r.district.toLowerCase().includes(q)||r.state.toLowerCase().includes(q)||r.postOffices.some(o=>o.officeName.toLowerCase().includes(q))).slice(0,20).map(r=>({pincode:r.pincode,district:r.district,state:r.state,office:r.postOffices[0]?.officeName||r.district,postOffices:r.postOffices.length}));
  return NextResponse.json({items});
}
