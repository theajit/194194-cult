import Link from 'next/link';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {findPostalStateBySlug,listPostalDistricts,postalSlug} from '../../../lib/postal-db';
const SITE='https://cult.pincode.cafe';
export const dynamic='force-dynamic';

export async function generateMetadata({params}:{params:{state:string}}):Promise<Metadata>{
  let state=null;try{state=await findPostalStateBySlug(params.state)}catch{}
  if(!state)return {robots:{index:false,follow:false}};
  return {title:`${state.state} PIN Codes — DIGIPIN & Cult Directory`,description:`Browse PIN codes and post offices across districts in ${state.state}. Open a PIN to explore postal identity, DIGIPIN guidance and 194.194 Cult status.`,alternates:{canonical:`${SITE}/pincodes/${params.state}`}};
}

export default async function StatePage({params}:{params:{state:string}}){
  let state=null;try{state=await findPostalStateBySlug(params.state)}catch{}
  if(!state)notFound();
  const districts=await listPostalDistricts(state.state);
  return <main><nav><Link href="/" className="brand"><b>194.194</b><span>CULT</span></Link><Link href="/pincodes" className="back">← ALL STATES</Link></nav><div className="breadcrumbs"><Link href="/pincodes">India</Link> / {state.state}</div><section className="directoryHero"><span>STATE / UT</span><h1>{state.state}<br/><i>PIN Codes</i></h1><p>Choose a district to browse PIN codes, post offices, DIGIPIN guidance and community status.</p></section><section className="directoryGrid">{districts.map(d=><Link key={d.district} href={`/pincodes/${params.state}/${postalSlug(d.district)}`} className="directoryCard"><small>DISTRICT</small><h2>{d.district}</h2><p>{d.pins} PIN{d.pins===1?'':'s'} · {d.offices} post offices</p><b>VIEW PIN CODES →</b></Link>)}</section><footer><b>194.194 CULT</b><span>{state.state.toUpperCase()} PIN DIRECTORY</span><span>PIN CODE · DIGIPIN · COMMUNITY</span></footer></main>;
}
