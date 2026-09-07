import {NextResponse} from 'next/server';
import {getPostalImportStatus} from '../../../../lib/postal-db';
import {hasDatabase} from '../../../../lib/db';

export const dynamic='force-dynamic';

export async function GET(){
  if(!hasDatabase())return NextResponse.json({configured:false,imported:false},{status:503});
  try{
    const latest=await getPostalImportStatus();
    return NextResponse.json({configured:true,imported:Boolean(latest),latest});
  }catch(error){
    console.error('postal status failed',error);
    return NextResponse.json({configured:true,imported:false,error:'Postal status unavailable'},{status:503});
  }
}
