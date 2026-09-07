import Link from 'next/link';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getPostalPin,postalSlug} from '../../../lib/postal-db';
import {getCultLocation} from '../../../lib/cult-db';

const SITE='https://cult.pincode.cafe';
const DIGIPIN_SITE='https://digipin.pincode.cafe';
const label={ACTIVE:'ACTIVE',FORMING:'FORMING',NOT_HERE_YET:'NOT HERE YET'} as const;
export const dynamic='force-dynamic';

async function resolvePostal(pin:string){try{return await getPostalPin(pin)}catch{return null}}
function officeTypeLabel(name:string,type:string|null){const u=name.toUpperCase();if(u.includes(' B.O'))return 'Branch Post Office (B.O)';if(u.includes(' S.O'))return 'Sub Post Office (S.O)';if(u.includes(' H.O'))return 'Head Post Office (H.O)';return type&&type.toUpperCase()!=='PO'?type:'Post Office'}
function deliveryInfo(status:string|null){const n=(status||'').toLowerCase().replace(/[-_]/g,' ').trim();const non=n.includes('non')&&n.includes('delivery');if(!non&&n.includes('delivery'))return {label:'Delivery Office',description:'Delivers mail to addresses in its assigned delivery area.',icon:'fa-solid fa-truck'};if(non)return {label:'Non-Delivery Office',description:'Provides postal services, but doorstep delivery is handled by another delivery office.',icon:'fa-solid fa-circle-minus'};return {label:'Delivery status not specified',description:'The source postal directory does not specify a delivery role for this office.',icon:'fa-solid fa-circle-question'}}

export async function generateMetadata({params}:{params:{pin:string}}):Promise<Metadata>{
  if(!/^\d{6}$/.test(params.pin))return {title:'Invalid PIN Code',robots:{index:false,follow:false}};
  const d=await resolvePostal(params.pin);
  if(!d){const title=`${params.pin} PIN Code | DIGIPIN & 194.194 Cult`;const description=`Explore PIN ${params.pin}. Postal details are currently unavailable; DIGIPIN guidance and 194.194 Cult discovery remain available.`;return {title,description,robots:{index:false,follow:true},alternates:{canonical:`${SITE}/pincode/${params.pin}`}}}
  const office=d.postOffices[0]?.officeName;
  const title=`${d.pincode} PIN Code — ${d.district}, ${d.state} | DIGIPIN & 194.194 Cult`;
  const description=`Explore ${d.pincode} PIN code for ${office||d.district}, ${d.district}, ${d.state}: post offices, DIGIPIN guidance and 194.194 Cult community status.`;
  return {title,description,alternates:{canonical:`${SITE}/pincode/${d.pincode}`},openGraph:{title,description,url:`${SITE}/pincode/${d.pincode}`,type:'website'}};
}

export default async function PinPage({params}:{params:{pin:string}}){
  if(!/^\d{6}$/.test(params.pin))notFound();
  const [d,cult]=await Promise.all([resolvePostal(params.pin),getCultLocation(params.pin)]);
  const status=cult.status;
  if(!d)return <main><nav><Link href="/" className="brand"><b>194.194</b><span>CULT</span></Link><Link href="/" className="back">← SEARCH ANOTHER PIN</Link></nav><section className="pinHero"><div className={`status ${status.toLowerCase()}`}><span>●</span> {label[status]}</div><div className="pinNumber">{params.pin}</div><h1>Postal data<br/><i>not available</i></h1><p>This is a valid six-digit format, but the PostgreSQL postal directory has no matching record yet.</p></section><footer><b>194.194 CULT</b><span>PIN CODE · DIGIPIN · COMMUNITY</span><span>POSTAL DATABASE</span></footer></main>;

  const stateSlug=postalSlug(d.state),districtSlug=postalSlug(d.district);
  const firstOffice=d.postOffices[0];
  const division=firstOffice?.divisionName||'—';
  const region=firstOffice?.regionName||'—';
  const cultMailto=`mailto:partnership@pincode.cafe?subject=${encodeURIComponent(`Bring 194.194 Cult to PIN ${d.pincode}`)}&body=${encodeURIComponent(`Hi Pin Code Café team,\n\nI am interested in bringing 194.194 Cult to PIN ${d.pincode} (${d.district}, ${d.state}).\n\nName:\nPhone / WhatsApp:\nHow I would like to be involved:\n\nThanks`)}`;
  const jsonLd={"@context":"https://schema.org","@type":"PostalAddress",postalCode:d.pincode,addressLocality:d.district,addressRegion:d.state,addressCountry:'IN'};

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <nav><Link href="/" className="brand"><b>194.194</b><span>CULT</span></Link><Link href="/" className="back">← SEARCH ANOTHER PIN</Link></nav>
    <div className="breadcrumbs"><Link href="/pincodes">India</Link> / <Link href={`/pincodes/${stateSlug}`}>{d.state}</Link> / <Link href={`/pincodes/${stateSlug}/${districtSlug}`}>{d.district}</Link> / {d.pincode}</div>

    <section className="pinDashboard">
      <div className="pinDashboardMain">
        <div className={`status ${status.toLowerCase()}`}><span>●</span> {label[status]}</div>
        <div className="pinDashboardNumber">{d.pincode}</div>
        <h1>{d.district}<span>{d.state}</span></h1>
        <div className="pinSummaryGrid">
          <div><span>POST OFFICES</span><b>{d.postOffices.length}</b></div>
          <div><span>DIVISION</span><b>{division}</b></div>
          <div><span>REGION</span><b>{region}</b></div>
        </div>
      </div>
      <aside className="pinDashboardAside">
        <a className="utilityCard" href={DIGIPIN_SITE} target="_blank" rel="noreferrer"><span>PRECISE LOCATION</span><h2><i className="fa-solid fa-location-dot" aria-hidden="true"/> DIGIPIN</h2><p>Find the precise digital location inside this postal area.</p><b>OPEN DIGIPIN →</b></a>
        {status==='ACTIVE'?<div className="utilityCard cultUtility"><span>194.194 CULT</span><h2>{cult.chapterName||'Active Chapter'}</h2><p>{cult.hostLocation||d.district}{cult.sinceYear?` · Since ${cult.sinceYear}`:''}</p><b>THIS PIN HAS A CULT.</b></div>:status==='FORMING'?<div className="utilityCard cultUtility formingUtility"><span>194.194 CULT</span><h2>FORMING</h2><p>The community is taking shape in this PIN.</p></div>:<a className="utilityCard cultUtility" href={cultMailto}><span>194.194 CULT</span><h2>NOT HERE YET</h2><p>Be the reason it starts in {d.pincode}.</p><b>BRING 194.194 CULT HERE →</b></a>}
      </aside>
    </section>

    <section className="postalCompact">
      <div className="postalCompactHead"><div><span>POSTAL IDENTITY</span><h2>Post Offices in {d.pincode}</h2></div><b>{d.postOffices.length} OFFICE{d.postOffices.length===1?'':'S'}</b></div>
      <div className="officeGrid compactOfficeGrid">{d.postOffices.map(o=>{const delivery=deliveryInfo(o.deliveryStatus);return <article key={o.officeName}><h3>{o.officeName}</h3><p className="officeType"><i className="fa-solid fa-building" aria-hidden="true"/> <b>{officeTypeLabel(o.officeName,o.officeType)}</b></p><p className="deliveryRole"><i className={delivery.icon} aria-hidden="true"/> <b>{delivery.label}</b></p><p>{delivery.description}</p><div className="officeMeta"><small><i className="fa-solid fa-location-dot" aria-hidden="true"/> {d.district}, {d.state} — {d.pincode}</small>{o.divisionName&&<small><i className="fa-solid fa-building-columns" aria-hidden="true"/> <b>Division:</b> {o.divisionName}</small>}{o.regionName&&<small><i className="fa-solid fa-map" aria-hidden="true"/> <b>Region:</b> {o.regionName}</small>}</div></article>})}</div>
    </section>

    {status==='ACTIVE'&&cult.hostLocation==='Pin Code Café'&&<section className="originCompact"><span>FOUNDING CHAPTER</span><div><h2>Pin Code Café · Dhenkanal</h2><p>Birthplace of 194.194 Cult · PIN {d.pincode}</p></div><a href="https://pincode.cafe" target="_blank" rel="noreferrer">VISIT PINCODE.CAFE →</a></section>}
    <footer><b>194.194 CULT</b><span>PIN CODE · DIGIPIN · COMMUNITY</span><span>PIN DATA: INDIA POST / OGD</span></footer>
  </main>;
}
