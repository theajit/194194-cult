'use client';
import {FormEvent,useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';

type Mode='pin'|'place'|'browse';
type CultStatus='ACTIVE'|'FORMING'|'NOT_HERE_YET';
type PlaceResult={pincode:string;district:string;state:string;office:string;postOffices:number;cultStatus:CultStatus};
type StateResult={state:string;slug:string;pins:number;offices:number;districts:number};
type PostalStatus={configured:boolean;imported:boolean;latest?:{officeRows:number;uniquePins:number;importedAt:string}|null};
type CultStats={active:number;forming:number};
const DIGIPIN_SITE='https://digipin.pincode.cafe';
const slug=(v:string)=>v.toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const cultLabel=(status:CultStatus)=>status==='NOT_HERE_YET'?'NOT HERE YET':status;

export default function Home(){
  const [mode,setMode]=useState<Mode>('pin');
  const [pin,setPin]=useState('');
  const [place,setPlace]=useState('');
  const [placeResults,setPlaceResults]=useState<PlaceResult[]>([]);
  const [states,setStates]=useState<StateResult[]>([]);
  const [postalStatus,setPostalStatus]=useState<PostalStatus|null>(null);
  const [cultStats,setCultStats]=useState<CultStats>({active:0,forming:0});
  const router=useRouter();

  useEffect(()=>{
    fetch('/api/postal/status',{cache:'no-store'}).then(async r=>({data:await r.json()})).then(({data})=>setPostalStatus(data)).catch(()=>setPostalStatus({configured:false,imported:false}));
    fetch('/api/cult/stats',{cache:'no-store'}).then(r=>r.json()).then(d=>setCultStats({active:d.active||0,forming:d.forming||0})).catch(()=>{});
  },[]);

  useEffect(()=>{
    if(mode!=='place'||place.trim().length<2){setPlaceResults([]);return;}
    const controller=new AbortController();
    const timer=setTimeout(()=>fetch(`/api/postal/search?q=${encodeURIComponent(place.trim())}`,{signal:controller.signal}).then(r=>r.json()).then(d=>setPlaceResults(d.items||[])).catch(()=>{}),180);
    return ()=>{clearTimeout(timer);controller.abort()};
  },[mode,place]);

  useEffect(()=>{
    if(mode!=='browse'||states.length)return;
    fetch('/api/postal/states').then(r=>r.json()).then(d=>setStates((d.items||[]).map((x:Omit<StateResult,'slug'>)=>({...x,slug:slug(x.state)})))).catch(()=>{});
  },[mode,states.length]);

  const submit=(e:FormEvent)=>{e.preventDefault();if(/^\d{6}$/.test(pin))router.push(`/pincode/${pin}`)};
  const statusText=!postalStatus?'Checking postal database…':postalStatus.imported&&postalStatus.latest?`${postalStatus.latest.uniquePins.toLocaleString()} PINs · ${postalStatus.latest.officeRows.toLocaleString()} post offices available`:'Postal database awaiting official data import';

  return <main>
<nav><div className="brand"><b>194.194</b><span>CULT</span></div><a className="cafeBrand" href="https://pincode.cafe" target="_blank" rel="noreferrer"><img src="https://pincode.cafe/pin-code-cafe-logo.jpg" alt="Pin Code Café"/><span>FOUNDED AT<br/><b>PIN CODE CAFÉ</b></span></a></nav>
<section className="hero"><div className="eyebrow">PIN CODE · DIGIPIN · COMMUNITY</div><h1>Know your PIN.<br/><i>Find your place.</i><br/>Find your people.</h1><p>Search an Indian PIN code, area or post office. Postal identity comes first; DIGIPIN adds precise location; 194.194 Cult adds the community layer.</p>
<div className="finderTabs" role="tablist" aria-label="PIN finder modes"><button className={mode==='pin'?'active':''} onClick={()=>setMode('pin')}>BY PIN CODE</button><button className={mode==='place'?'active':''} onClick={()=>setMode('place')}>BY PLACE NAME</button><button className={mode==='browse'?'active':''} onClick={()=>setMode('browse')}>BROWSE STATES</button></div>
{mode==='pin'&&<><form onSubmit={submit}><input aria-label="PIN code" inputMode="numeric" maxLength={6} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,''))} placeholder="Enter 6-digit PIN"/><button>EXPLORE PIN →</button></form><small>Try: <button className="link" onClick={()=>router.push('/pincode/759001')}>759001</button> · <button className="link" onClick={()=>router.push('/pincode/759027')}>759027</button> · <button className="link" onClick={()=>router.push('/pincode/751002')}>751002</button></small></>}
{mode==='place'&&<div className="placeFinder"><input aria-label="Place or post office" value={place} onChange={e=>setPlace(e.target.value)} placeholder="Area, district or post office"/>{place.trim().length>=2&&<div className="searchResults">{placeResults.length?placeResults.map(r=><button key={`${r.pincode}-${r.office}`} onClick={()=>router.push(`/pincode/${r.pincode}`)}><strong>{r.pincode}</strong><span>{r.office}</span><small>{r.district} · {r.state} · {r.postOffices} office{r.postOffices===1?'':'s'} · CULT {cultLabel(r.cultStatus)}</small></button>):<p>No postal match found.</p>}</div>}</div>}
{mode==='browse'&&<div className="browseStates">{states.map(x=><button key={x.slug} onClick={()=>router.push(`/pincodes/${x.slug}`)}><span>STATE / UT</span><b>{x.state}</b><small>{x.pins} PIN{x.pins===1?'':'s'} · {x.districts} districts →</small></button>)}<button className="allIndia" onClick={()=>router.push('/pincodes')}><span>DIRECTORY</span><b>ALL STATES</b><small>Open India PIN directory →</small></button></div>}
<div className="coverageNote"><div><b>POSTAL DIRECTORY</b><span>{statusText}</span></div></div></section>
<section className="identityGrid"><article><span>01 · POSTAL</span><h2>PIN CODE</h2><p>Your postal geography: post office, district and state.</p></article><article><span>02 · PRECISE</span><h2>DIGIPIN</h2><p>Open the dedicated DIGIPIN service for precise digital location identity inside a PIN.</p><a className="textCta" href={DIGIPIN_SITE} target="_blank" rel="noreferrer">OPEN DIGIPIN →</a></article><article><span>03 · PEOPLE</span><h2>194.194 CULT</h2><p>The community layer: Active, Forming, or Not Here Yet.</p></article></section>
<section className="registry"><div><span className="kicker">THE REGISTRY</span><h2>India, PIN by PIN.</h2></div><div className="stats"><b>{cultStats.active}</b><span>ACTIVE CULT</span><b>{cultStats.forming}</b><span>FORMING</span></div></section>
<section className="origin"><span>WHERE IT STARTED</span><div><h2>PIN CODE CAFÉ</h2><p>Dhenkanal · 759001</p></div><a href="https://pincode.cafe" target="_blank" rel="noreferrer">VISIT PINCODE.CAFE →</a></section>
<footer><b>194.194 CULT</b><span>EVERY PIN HAS AN ADDRESS · EVERY PLACE CAN HAVE A DIGIPIN · SOME PINS HAVE A CULT</span><span>FOUNDED IN DHENKANAL</span></footer></main>}
