import Link from 'next/link';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getPostalPin,postalSlug} from '../../../lib/postal-db';
import {getCultLocation} from '../../../lib/cult-db';

const SITE='https://cult.pincode.cafe';
const DIGIPIN_SITE='https://digipin.pincode.cafe';
const label={ACTIVE:'ACTIVE',FORMING:'FORMING',NOT_HERE_YET:'NOT HERE YET'} as const;
export const dynamic='force-dynamic';

async function resolvePostal(pin:string){
  try{return await getPostalPin(pin)}
  catch{return null}
}

export async function generateMetadata({params}:{params:{pin:string}}):Promise<Metadata>{
  if(!/^\d{6}$/.test(params.pin))return {title:'Invalid PIN Code',robots:{index:false,follow:false}};
  const d=await resolvePostal(params.pin);
  if(!d){
    const title=`${params.pin} PIN Code | DIGIPIN & 194.194 Cult`;
    const description=`Explore PIN ${params.pin}. Postal details are currently unavailable; DIGIPIN guidance and 194.194 Cult discovery remain available.`;
    return {title,description,robots:{index:false,follow:true},alternates:{canonical:`${SITE}/pincode/${params.pin}`}};
  }
  const office=d.postOffices[0]?.officeName;
  const title=`${d.pincode} PIN Code — ${d.district}, ${d.state} | DIGIPIN & 194.194 Cult`;
  const description=`Explore ${d.pincode} PIN code for ${office||d.district}, ${d.district}, ${d.state}: post offices, DIGIPIN guidance and 194.194 Cult community status.`;
  return {title,description,alternates:{canonical:`${SITE}/pincode/${d.pincode}`},openGraph:{title,description,url:`${SITE}/pincode/${d.pincode}`,type:'website'}};
}

export default async function PinPage({params}:{params:{pin:string}}){
  if(!/^\d{6}$/.test(params.pin))notFound();
  const [d,cult]=await Promise.all([resolvePostal(params.pin),getCultLocation(params.pin)]);
  const status=cult.status;
  if(!d)return <main><nav><Link href="/" className="brand"><b>194.194</b><span>CULT</span></Link><Link href="/" className="back">← SEARCH ANOTHER PIN</Link></nav><section className="pinHero"><div className={`status ${status.toLowerCase()}`}><span>●</span> {label[status]}</div><div className="pinNumber">{params.pin}</div><h1>Postal data<br/><i>not available</i></h1><p>This is a valid six-digit format, but the PostgreSQL postal directory has no matching record yet.</p></section><section className="pinLayers"><article><span>POSTAL IDENTITY</span><h2>PIN CODE</h2><p>Load the official Department of Posts CSV into PostgreSQL to resolve this PIN.</p></article><article><span>PRECISE LOCATION</span><h2>DIGIPIN</h2><p>A PIN identifies a postal area. DIGIPIN identifies a precise location within that area.</p><a className="textCta" href={DIGIPIN_SITE} target="_blank" rel="noreferrer">OPEN DIGIPIN →</a></article></section><footer><b>194.194 CULT</b><span>PIN CODE · DIGIPIN · COMMUNITY</span><span>POSTAL DATABASE</span></footer></main>;

  const stateSlug=postalSlug(d.state),districtSlug=postalSlug(d.district);
  const jsonLd={"@context":"https://schema.org","@type":"PostalAddress",postalCode:d.pincode,addressLocality:d.district,addressRegion:d.state,addressCountry:'IN'};
  return <main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><nav><Link href="/" className="brand"><b>194.194</b><span>CULT</span></Link><Link href="/" className="back">← SEARCH ANOTHER PIN</Link></nav><div className="breadcrumbs"><Link href="/pincodes">India</Link> / <Link href={`/pincodes/${stateSlug}`}>{d.state}</Link> / <Link href={`/pincodes/${stateSlug}/${districtSlug}`}>{d.district}</Link> / {d.pincode}</div><section className="pinHero"><div className={`status ${status.toLowerCase()}`}><span>●</span> {label[status]}</div><div className="pinNumber">{d.pincode}</div><h1>{d.district}<br/><i>{d.state}</i></h1><p>{d.postOffices.length} post office{d.postOffices.length===1?'':'s'} listed for PIN {d.pincode}.</p></section><section className="pinLayers"><article><span>POSTAL IDENTITY</span><h2>PIN CODE</h2><div className="officeGrid">{d.postOffices.map(o=><article key={o.officeName}><h3>{o.officeName}</h3><p>{o.officeType||'Post Office'}{o.deliveryStatus?` · ${o.deliveryStatus}`:''}</p><small>{d.district}, {d.state} — {d.pincode}</small></article>)}</div></article><article><span>PRECISE LOCATION</span><h2>DIGIPIN</h2><p>A PIN identifies a postal area. DIGIPIN identifies a precise location within that area, so one PIN can contain many DIGIPINs.</p><a className="textCta" href={DIGIPIN_SITE} target="_blank" rel="noreferrer">OPEN DIGIPIN →</a></article></section>{status==='ACTIVE'?<section className="chapter"><span>194.194 CULT · CHAPTER</span><h2>{cult.chapterName||'Active Chapter'}</h2>{cult.hostLocation==='Pin Code Café'&&<a className="foundingCafe" href="https://pincode.cafe" target="_blank" rel="noreferrer"><img src="https://pincode.cafe/pin-code-cafe-logo.jpg" alt="Pin Code Café"/><div><small>BIRTHPLACE OF 194.194 CULT</small><b>Pin Code Café · Dhenkanal</b><em>pincode.cafe →</em></div></a>}<dl><div><dt>HOME</dt><dd>{cult.hostLocation||d.district}</dd></div><div><dt>SINCE</dt><dd>{cult.sinceYear||'—'}</dd></div><div><dt>STATUS</dt><dd>ALIVE & BREWING ☕</dd></div></dl><blockquote>“This PIN has a Cult.”</blockquote></section>:status==='FORMING'?<section className="cta"><span>194.194 CULT · {d.pincode}</span><h2>This PIN is<br/>forming a Cult.</h2><p>The community is taking shape here.</p></section>:<section className="cta"><span>194.194 CULT · {d.pincode}</span><h2>Not here yet.<br/>Be the reason it starts.</h2><button>BRING 194.194 HERE →</button><p>Register interest. When enough people raise their hands, this PIN starts forming.</p></section>}<footer><b>194.194 CULT</b><span>PIN CODE · DIGIPIN · COMMUNITY</span><span>PIN DATA: INDIA POST / OGD</span></footer></main>;
}
