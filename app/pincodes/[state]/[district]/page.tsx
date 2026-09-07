import Link from 'next/link';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {findPostalDistrictBySlug,findPostalStateBySlug,listPinsForDistrict} from '../../../../lib/postal-db';
const SITE='https://cult.pincode.cafe';
export const dynamic='force-dynamic';

async function resolve(params:{state:string;district:string}){
  const state=await findPostalStateBySlug(params.state);
  if(!state)return null;
  const district=await findPostalDistrictBySlug(state.state,params.district);
  return district?{state,district}:null;
}

export async function generateMetadata({params}:{params:{state:string;district:string}}):Promise<Metadata>{
  let found=null;try{found=await resolve(params)}catch{}
  if(!found)return {robots:{index:false,follow:false}};
  return {title:`${found.district.district} PIN Codes, ${found.state.state} — DIGIPIN & Cult`,description:`Browse PIN codes and post offices for ${found.district.district}, ${found.state.state}. Open any PIN for postal details, DIGIPIN guidance and 194.194 Cult status.`,alternates:{canonical:`${SITE}/pincodes/${params.state}/${params.district}`}};
}

export default async function DistrictPage({params}:{params:{state:string;district:string}}){
  let found=null;try{found=await resolve(params)}catch{}
  if(!found)notFound();
  const pins=await listPinsForDistrict(found.state.state,found.district.district);
  return <main><nav><Link href="/" className="brand"><b>194.194</b><span>CULT</span></Link><Link href={`/pincodes/${params.state}`} className="back">← {found.state.state.toUpperCase()}</Link></nav><div className="breadcrumbs"><Link href="/pincodes">India</Link> / <Link href={`/pincodes/${params.state}`}>{found.state.state}</Link> / {found.district.district}</div><section className="directoryHero"><span>DISTRICT</span><h1>{found.district.district}<br/><i>{found.state.state}</i></h1><p>{pins.length} PIN code{pins.length===1?'':'s'} in this directory.</p></section><section className="pinGrid">{pins.map(p=><Link key={p.pincode} href={`/pincode/${p.pincode}`} className="pinCard"><strong>{p.pincode}</strong><span>{p.office||found.district.district}</span><small>{p.postOffices} post office{p.postOffices===1?'':'s'} · DIGIPIN · CULT</small></Link>)}</section><footer><b>194.194 CULT</b><span>{found.district.district.toUpperCase()} · {found.state.state.toUpperCase()}</span><span>PIN CODE · DIGIPIN · COMMUNITY</span></footer></main>;
}
