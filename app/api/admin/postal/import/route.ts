import {NextResponse} from 'next/server';
import {isAdminAuthorized} from '../../../../../lib/admin-auth';
import {importPostalCsvToDatabase} from '../../../../../lib/postal-import';
import {hasDatabase} from '../../../../../lib/db';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function POST(request:Request){
  if(!isAdminAuthorized(request))return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!hasDatabase())return NextResponse.json({error:'DATABASE_URL is not configured'},{status:503});

  let form:FormData;
  try{form=await request.formData()}catch{return NextResponse.json({error:'Expected multipart/form-data'},{status:400})}
  const file=form.get('file');
  if(!(file instanceof File))return NextResponse.json({error:'CSV file is required in form field "file"'},{status:400});
  if(!file.name.toLowerCase().endsWith('.csv'))return NextResponse.json({error:'Only CSV files are accepted'},{status:400});

  try{
    const result=await importPostalCsvToDatabase({
      bytes:new Uint8Array(await file.arrayBuffer()),
      sourceFile:file.name,
      sourceDataset:String(form.get('sourceDataset')||'Department of Posts / data.gov.in'),
      sourceUpdatedAt:form.get('sourceUpdatedAt')?String(form.get('sourceUpdatedAt')):null
    });
    return NextResponse.json({ok:true,...result});
  }catch(error){
    console.error('postal import failed',error);
    return NextResponse.json({error:error instanceof Error?error.message:'Unable to import postal directory'},{status:500});
  }
}
