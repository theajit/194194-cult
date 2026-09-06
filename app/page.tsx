'use client';
import {FormEvent,useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {pincodes} from '../lib/pincodes';

type Mode='pin'|'place'|'browse';
type PlaceResult={pincode:string;district:string;state:string;office:string;postOffices:number};
type StateResult={state:string;slug:string;pins:number};

export default function Home(){
  const [mode,setMode]=useState<Mode>('pin');
  const [pin,setPin]=useState('');
  const [place,setPlace]=useState('');
  const [placeResults,setPlaceResults]=useState<PlaceResult[]>([]);
  const [states,setStates]=useState<StateResult[]>([]);
  const router=useRouter();

  useEffect(()=>{
    if(mode!=='place'||place.trim().length<2){setPlaceResults([]);return;}
    const controller=new AbortController();
    const timer=setTimeout(()=>fetch(`/api/pincodes?q=${encodeURIComponent(place.trim())}`,{signal:controller.signal}).then(r=>r.json()).then(d=>setPlaceResults(d.items||[])).catch(()=>{}),180);
    return ()=>{clearTimeout(timer);controller.abort()};
  },[mode,place]);

  useEffect(()=>{
    if(mode!=='browse'||states.length)return;
    fetch('/api/pincodes?mode=states').then(r=>r.json()).then(d=>setStates(d.items||[])).catch(()=>{});
  },[mode,states.length]);

  const submit=(e:FormEvent)=>{e.preventDefault();if(/^\d{6}$/.test(pin))router.push(`/pincode/${pin}`)};
  return <main>
<nav><div className="brand"><b>194.194</b><span>CULT</span></div><a className="cafeBrand" href="https://pincode.cafe" target="_blank" rel="noreferrer"><img src="https://pincode.cafe/pin-code-cafe-logo.jpg" alt="Pin Code Café"/><span>FOUNDED AT<br/><b>PIN CODE CAFÉ</b></span></a></nav>
<section className="hero"><div className="eyebrow">PIN CODE · DIGIPIN · COMMUNITY</div><h1>Know your PIN.<br/><i>Find your place.</i><br/>Find your people.</h1><p>Search an Indian PIN code, area or post office. Postal identity comes first; DIGIPIN adds precise location; 194.194 Cult adds the community layer.</p>
<div className="finderTabs" role="tablist" aria-label="PIN finder modes"><button className={mode==='pin'?'active':''} onClick={()=>setMode('pin')}>BY PIN CODE</button><button className={mode==='place'?'active':''} onClick={()=>setMode('place')}>BY PLACE NAME</button><button className={mode==='browse'?'active':''} onClick={()=>setMode('browse')}>BROWSE STATES</button></div>
{mode==='pin'&&<><form onSubmit={submit}><input aria-label="PIN code" inputMode="numeric" maxLength={6} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,''))} placeholder="Enter 6-digit PIN"/><button>EXPLORE PIN →</button></form><small>Try: <button className="link" onClick={()=>router.push('/pincode/759001')}>759001</button> · <button className="link" onClick={()=>router.push('/pincode/753001')}>753001</button> · <button className="link" onClick={()=>router.push('/pincode/751002')}>751002</button></small></>}
{mode==='place'&&<div className="placeFinder"><input aria-label="Place or post office" value={place} onChange={e=>setPlace(e.target.value)} placeholder="Area, district or post office"/>{place.trim().length>=2&&<div className="searchResults">{placeResults.length?placeResults.map(r=><button key={`${r.pincode}-${r.office}`} onClick={()=>router.push(`/pincode/${r.pincode}`)}><strong>{r.pincode}</strong><span>{r.office}</span><small>{r.district} · {r.state} · {r.postOffices} office{r.postOffices===1?'':'s'}</small></button>):<p>No verified local match yet. Odisha directory rollout is in progress.</p>}</div>}</div>}
{mode==='browse'&&<div className="browseStates">{states.map(x=><button key={x.slug} onClick={()=>router.push(`/pincodes/${x.slug}`)}><span>STATE / UT</span><b>{x.state}</b><small>{x.pins} PIN{x.pins===1?'':'s'} loaded →</small></button>)}<button className="allIndia" onClick={()=>router.push('/pincodes')}><span>DIRECTORY</span><b>ALL STATES</b><small>Open India PIN directory →</small></button></div>}
<div className="coverageNote"><b>DATA COVERAGE</b><span>Odisha first · all-India architecture ready</span></div></section>
<section className="identityGrid"><article><span>01 · POSTAL</span><h2>PIN CODE</h2><p>Your postal geography: post office, district and state.</p></article><article><span>02 · PRECISE</span><h2>DIGIPIN</h2><p>India Post&apos;s digital addressing layer for precise locations inside a PIN.</p></article><article><span>03 · PEOPLE</span><h2>194.194 CULT</h2><p>The community layer: Active, Forming, or Not Here Yet.</p></article></section>
<section className="registry"><div><span className="kicker">THE REGISTRY</span><h2>India, PIN by PIN.</h2></div><div className="stats"><b>{pincodes.filter(x=>x.status==='ACTIVE').length}</b><span>ACTIVE CULT</span><b>{pincodes.filter(x=>x.status==='FORMING').length}</b><span>FORMING</span></div></section>
<section className="origin"><span>WHERE IT STARTED</span><div><h2>PIN CODE CAFÉ</h2><p>Dhenkanal · 759001</p></div><a href="https://pincode.cafe" target="_blank" rel="noreferrer">VISIT PINCODE.CAFE →</a></section>
<footer><b>194.194 CULT</b><span>EVERY PIN HAS AN ADDRESS · EVERY PLACE CAN HAVE A DIGIPIN · SOME PINS HAVE A CULT</span><span>FOUNDED IN DHENKANAL</span></footer></main>}
