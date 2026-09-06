import {NextResponse} from 'next/server';
import {allPins} from '../../../../lib/directory';

export const dynamic='force-dynamic';

export function GET(){
  const records=allPins();
  const officeCount=records.reduce((sum,r)=>sum+r.postOffices.length,0);
  const version=process.env.PIN_DATA_VERSION||`pins-${records.length}-offices-${officeCount}`;
  return NextResponse.json({version,records,pinCount:records.length,officeCount},{headers:{'Cache-Control':'public, max-age=3600, stale-while-revalidate=86400'}});
}
