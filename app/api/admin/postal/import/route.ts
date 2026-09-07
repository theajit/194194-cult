import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {NextResponse} from 'next/server';
import {isAdminAuthorized} from '../../../../../lib/admin-auth';
import {importPostalCsvToDatabase} from '../../../../../lib/postal-import';
import {hasDatabase} from '../../../../../lib/db';

export const runtime='nodejs';
export const dynamic='force-dynamic';

const BUNDLED_POSTAL_PATH=path.join(process.cwd(),'data','postal','all-india-pincode-directory.csv');
const BUNDLED_POSTAL_FILE='all-india-pincode-directory.csv';

export async function POST(request:Request){
  if(!isAdminAuthorized(request))return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!hasDatabase())return NextResponse.json({error:'DATABASE_URL is not configured'},{status:503});

  try{
    const contentType=request.headers.get('content-type')||'';
    let bytes:Uint8Array;
    let sourceFile=BUNDLED_POSTAL_FILE;
    let sourceDataset='Department of Posts / data.gov.in';
    let sourceUpdatedAt:string|null=null;
    let source:'bundled'|'upload'='bundled';

    if(contentType.includes('multipart/form-data')){
      const form=await request.formData();
      const file=form.get('file');
      if(file instanceof File){
        if(!file.name.toLowerCase().endsWith('.csv'))return NextResponse.json({error:'Only CSV files are accepted'},{status:400});
        bytes=new Uint8Array(await file.arrayBuffer());
        sourceFile=file.name;
        sourceDataset=String(form.get('sourceDataset')||sourceDataset);
        sourceUpdatedAt=form.get('sourceUpdatedAt')?String(form.get('sourceUpdatedAt')):null;
        source='upload';
      }else{
        bytes=new Uint8Array(await readFile(BUNDLED_POSTAL_PATH));
      }
    }else{
      bytes=new Uint8Array(await readFile(BUNDLED_POSTAL_PATH));
    }

    const result=await importPostalCsvToDatabase({bytes,sourceFile,sourceDataset,sourceUpdatedAt});
    return NextResponse.json({ok:true,source,...result});
  }catch(error){
    console.error('postal import failed',error);
    return NextResponse.json({error:error instanceof Error?error.message:'Unable to import postal directory'},{status:500});
  }
}
