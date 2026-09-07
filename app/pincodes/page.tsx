import Link from 'next/link';
import type {Metadata} from 'next';
import {listPostalStates,postalSlug} from '../../lib/postal-db';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'India PIN Code Directory — DIGIPIN & 194.194 Cult',description:'Browse Indian PIN codes by state and district, explore post-office details, understand DIGIPIN, and check 194.194 Cult status.',alternates:{canonical:'https://cult.pincode.cafe/pincodes'}};

export default async function PincodesPage(){
  let items:Awaited<ReturnType<typeof listPostalStates>>=[];
  try{items=await listPostalStates()}catch{}
  return <main><nav><Link href="/" className="brand"><b>194.194</b><span>CULT</span></Link><Link href="/" className="back">← HOME</Link></nav><section className="directoryHero"><span>INDIA PIN CODE DIRECTORY</span><h1>Know your PIN.<br/><i>Find your place.</i></h1><p>Browse postal geography by state and district. Every PIN page combines postal identity, precise-location DIGIPIN guidance, and 194.194 Cult community status.</p></section>{items.length?<section className="directoryGrid">{items.map(x=><Link key={x.state} href={`/pincodes/${postalSlug(x.state)}`} className="directoryCard"><small>STATE / UT</small><h2>{x.state}</h2><p>{x.districts} district{x.districts===1?'':'s'} · {x.pins} PIN{x.pins===1?'':'s'}</p><b>EXPLORE →</b></Link>)}</section>:<section className="postal"><span>POSTAL DATABASE</span><h2>Directory awaiting import.</h2><p>Configure PostgreSQL and import the official Department of Posts CSV to populate the India directory.</p></section>}<footer><b>194.194 CULT</b><span>PIN CODE · DIGIPIN · COMMUNITY</span><span>PIN DATA: INDIA POST / OGD</span></footer></main>;
}
