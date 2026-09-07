import {NextResponse} from 'next/server';
import {COFFEE_GUIDE_IMAGE} from '../../../blog/coffee-guide-image';

export const runtime='nodejs';
export const dynamic='force-static';

export async function GET(){
  const marker='base64,';
  const index=COFFEE_GUIDE_IMAGE.indexOf(marker);
  if(index<0)return new NextResponse('Image unavailable',{status:500});
  const bytes=Buffer.from(COFFEE_GUIDE_IMAGE.slice(index+marker.length),'base64');
  return new NextResponse(bytes,{
    status:200,
    headers:{
      'Content-Type':'image/webp',
      'Content-Length':String(bytes.length),
      'Cache-Control':'public, max-age=31536000, immutable'
    }
  });
}
