'use client';

import {useMemo,useState} from 'react';

type Office={
  officeName:string;
  officeType:string|null;
  deliveryStatus:string|null;
  divisionName:string|null;
  regionName:string|null;
};

type Props={
  pincode:string;
  district:string;
  state:string;
  offices:Office[];
};

type OfficeKind='all'|'head'|'sub'|'branch'|'other';
type DeliveryKind='all'|'delivery'|'non-delivery'|'unknown';

type OfficeDisplay={kind:Exclude<OfficeKind,'all'>;label:string;icon:string};

function officeDisplay(office:Office):OfficeDisplay{
  const upper=office.officeName.toUpperCase();
  if(upper.includes(' H.O'))return {kind:'head',label:'Head Post Office (H.O)',icon:'fa-solid fa-landmark'};
  if(upper.includes(' S.O'))return {kind:'sub',label:'Sub Post Office (S.O)',icon:'fa-solid fa-building'};
  if(upper.includes(' B.O'))return {kind:'branch',label:'Branch Post Office (B.O)',icon:'fa-solid fa-building-columns'};
  return {kind:'other',label:office.officeType&&office.officeType.toUpperCase()!=='PO'?office.officeType:'Post Office',icon:'fa-solid fa-envelope'};
}

function deliveryDisplay(status:string|null){
  const normalized=(status||'').toLowerCase().replace(/[-_]/g,' ').trim();
  const non=normalized.includes('non')&&normalized.includes('delivery');
  if(!non&&normalized.includes('delivery'))return {kind:'delivery' as const,label:'Delivery Office',description:'Delivers mail to addresses in its assigned delivery area.',icon:'fa-solid fa-truck'};
  if(non)return {kind:'non-delivery' as const,label:'Non-Delivery Office',description:'Provides postal services, but doorstep delivery is handled by another delivery office.',icon:'fa-solid fa-circle-minus'};
  return {kind:'unknown' as const,label:'Delivery status not specified',description:'The source postal directory does not specify a delivery role for this office.',icon:'fa-solid fa-circle-question'};
}

export default function PostOfficeDirectory({pincode,district,state,offices}:Props){
  const [officeKind,setOfficeKind]=useState<OfficeKind>('all');
  const [deliveryKind,setDeliveryKind]=useState<DeliveryKind>('all');
  const [sort,setSort]=useState<'az'|'za'>('az');

  const counts=useMemo(()=>{
    const out={head:0,sub:0,branch:0,other:0,delivery:0,nonDelivery:0,unknown:0};
    for(const office of offices){
      out[officeDisplay(office).kind]++;
      const delivery=deliveryDisplay(office.deliveryStatus).kind;
      if(delivery==='delivery')out.delivery++;
      else if(delivery==='non-delivery')out.nonDelivery++;
      else out.unknown++;
    }
    return out;
  },[offices]);

  const filtered=useMemo(()=>offices
    .filter(office=>officeKind==='all'||officeDisplay(office).kind===officeKind)
    .filter(office=>deliveryKind==='all'||deliveryDisplay(office.deliveryStatus).kind===deliveryKind)
    .slice()
    .sort((a,b)=>sort==='az'?a.officeName.localeCompare(b.officeName):b.officeName.localeCompare(a.officeName)),[offices,officeKind,deliveryKind,sort]);

  const clear=()=>{setOfficeKind('all');setDeliveryKind('all');setSort('az')};

  return <section className="postalCompact">
    <div className="postalCompactHead"><div><span>POSTAL IDENTITY</span><h2>Post Offices in {pincode}</h2></div><b>{filtered.length} OF {offices.length} OFFICE{offices.length===1?'':'S'}</b></div>

    <div className="postalFilters" aria-label="Post office filters">
      <label><span>Office type</span><select value={officeKind} onChange={e=>setOfficeKind(e.target.value as OfficeKind)}><option value="all">All Office Types</option><option value="head">Head Post Office</option><option value="sub">Sub Post Office</option><option value="branch">Branch Post Office</option><option value="other">Other</option></select></label>
      <label><span>Delivery type</span><select value={deliveryKind} onChange={e=>setDeliveryKind(e.target.value as DeliveryKind)}><option value="all">All Delivery Types</option><option value="delivery">Delivery Office</option><option value="non-delivery">Non-Delivery Office</option><option value="unknown">Not Specified</option></select></label>
      <label><span>Sort by</span><select value={sort} onChange={e=>setSort(e.target.value as 'az'|'za')}><option value="az">Office Name (A–Z)</option><option value="za">Office Name (Z–A)</option></select></label>
      <button className="clearFilters" type="button" onClick={clear}><i className="fa-solid fa-rotate-left" aria-hidden="true"/> CLEAR FILTERS</button>
    </div>

    <div className="filterBadges" aria-label="Office counts">
      <button className={officeKind==='all'?'active':''} onClick={()=>setOfficeKind('all')}>ALL <b>{offices.length}</b></button>
      <button className={`officeBadge headBadge ${officeKind==='head'?'active':''}`} onClick={()=>setOfficeKind('head')}><i className="fa-solid fa-landmark" aria-hidden="true"/> HEAD <b>{counts.head}</b></button>
      <button className={`officeBadge subBadge ${officeKind==='sub'?'active':''}`} onClick={()=>setOfficeKind('sub')}><i className="fa-solid fa-building" aria-hidden="true"/> SUB <b>{counts.sub}</b></button>
      <button className={`officeBadge branchBadge ${officeKind==='branch'?'active':''}`} onClick={()=>setOfficeKind('branch')}><i className="fa-solid fa-building-columns" aria-hidden="true"/> BRANCH <b>{counts.branch}</b></button>
      <span className="filterDivider"/>
      <button className={`deliveryBadge deliveryYes ${deliveryKind==='delivery'?'active':''}`} onClick={()=>setDeliveryKind('delivery')}><i className="fa-solid fa-truck" aria-hidden="true"/> DELIVERY <b>{counts.delivery}</b></button>
      <button className={`deliveryBadge deliveryNo ${deliveryKind==='non-delivery'?'active':''}`} onClick={()=>setDeliveryKind('non-delivery')}><i className="fa-solid fa-circle-minus" aria-hidden="true"/> NON-DELIVERY <b>{counts.nonDelivery}</b></button>
    </div>

    {filtered.length?<div className="officeGrid compactOfficeGrid">{filtered.map(office=>{
      const officeInfo=officeDisplay(office);
      const delivery=deliveryDisplay(office.deliveryStatus);
      return <article key={office.officeName}>
        <h3>{office.officeName}</h3>
        <div className="cardBadges"><span className={`officeBadge ${officeInfo.kind}Badge`}><i className={officeInfo.icon} aria-hidden="true"/> {officeInfo.label}</span><span className={`deliveryBadge ${delivery.kind==='delivery'?'deliveryYes':delivery.kind==='non-delivery'?'deliveryNo':'deliveryUnknown'}`}><i className={delivery.icon} aria-hidden="true"/> {delivery.label}</span></div>
        <p className="deliveryDescription">{delivery.description}</p>
        <div className="officeMeta"><small><i className="fa-solid fa-location-dot" aria-hidden="true"/> {district}, {state} — {pincode}</small>{office.divisionName&&<small><i className="fa-solid fa-landmark" aria-hidden="true"/> <b>Division:</b> {office.divisionName}</small>}{office.regionName&&<small><i className="fa-solid fa-map" aria-hidden="true"/> <b>Region:</b> {office.regionName}</small>}</div>
      </article>})}</div>:<div className="noOfficeResults"><i className="fa-solid fa-filter-circle-xmark" aria-hidden="true"/><b>No post offices match these filters.</b><button type="button" onClick={clear}>CLEAR FILTERS</button></div>}
  </section>;
}
