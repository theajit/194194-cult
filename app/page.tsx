'use client';
import {FormEvent,useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {pincodes} from '../lib/pincodes';
import {cachedStates,searchCachedPostalDirectory,syncPostalDirectory,type PostalCacheMeta} from '../lib/postal-store';

type Mode='pin'|'place'|'browse';
type PlaceResult={pincode:string;district:string;state:string;office:string;postOffices:number};
type StateResult={state:string;slug:string;pins:number};
const slug=(v:string)=>v.toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export default function Home(){
  const [mode,setMode]=useState<Mode>('pin');
  const [pin,setPin]=useState('');
  const [place,setPlace]=useState('');
  const [placeResults,setPlaceResults]=useState<PlaceResult[]>([]);
  const [states,setStates]=useState<StateResult[]>([]);
  const [cacheMeta,setCacheMeta]=useState<PostalCacheMeta|null>(null);
  const [cacheState,setCacheState]=useState<'syncing'|'ready'|'offline'>('syncing');
  const router=useRouter();

  useEffect(()=>{
    let alive=true;
    syncPostalDirectory().then(meta=>{if(alive){setCacheMeta(meta);setCacheState('ready')}}).catch(()=>{if(alive)setCacheState('offline')});
    return ()=>{alive=false};
  },[]);

  useEffect(()=>{
    if(mode!=='place'||place.trim().length<2){setPlaceResults([]);return;}
    let alive=true;
    const controller=new AbortController();
    const timer=setTimeout(async()=>{
      try{
        if(cacheState==='ready'){
          const records=await searchCachedPostalDirectory(place.trim(),20);
          if(!alive)return;
          setPlaceResults(records.map(r=>({pincode:r.pincode,district:r.district,state:r.state,office:r.postOffices[0]?.officeName||r.district,postOffices:r.postOffices.length})));
          return;
        }
        const response=await fetch(`/api/pincodes?q=${encodeURIComponent(place.trim())}`,{signal:controller.signal});
        const data=await response.json();
        if(alive)setPlaceResults(data.items||[]);
      }catch{}
    },180);
    return ()=>{alive=false;clearTimeout(timer);controller.abort()};
  },[mode,place,cacheState]);

  useEffect(()=>{
    if(mode!=='browse'||states.length)return;
    let alive=true;
    const load=async()=>{
      try{
        if(cacheState==='ready'){
          const rows=await cachedStates();
          if(alive)setStates(rows.map(x=>({...x,slug:slug(x.state)})));
          return;
        }
        const response=await fetch('/api/pincodes?mode=states');
        const data=await response.json();
        if(alive)setStates(data.items||[]);
      }catch{}
    };
    load();
    return ()=>{alive=false};
  },[mode,states.length,cacheState]);

  const submit=(e:FormEvent)=>{e.preventDefault();if(/^\d{6}$/.test(pin))router.push(`/pincode/${pin}`)};
  return <main>
<nav><div className="brand"><b>194.194</b><span>CULT</span></div><a className="cafeBrand" href="https://pincode.cafe" target="_blank" rel="noreferrer"><img src="https://pincode.cafe/pin-code-cafe-logo.jpg" alt="Pin Code Café"/><span>FOUNDED AT<br/><b>PIN CODE CAFÉ</b></span></a></nav>
<section className="hero"><div className="eyebrow">PIN CODE · DIGIPIN · COMMUNITY</div><h1>Know your PIN.<br/><i>Find your place.</i><br/>Find your people.</h1><p>Search an Indian PIN code, area or post office. Postal identity comes first; DIGIPIN adds precise location; 194.194 Cult adds the community layer.</p>
<div className="finderTabs" role="tablist" aria-label="PIN finder modes"><button className={mode==='pin'?'active':''} onClick={()=>setMode('pin')}>BY PIN CODE</button><button className={mode==='place'?'active':''} onClick={()=>setMode('place')}>BY PLACE NAME</button><button className={mode==='browse'?'active':''} onClick={()=>setMode('browse')}>BROWSE STATES</button></div>
{mode==='pin'&&<><form onSubmit={submit}><input aria-label="PIN code" inputMode="numeric" maxLength={6} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,''))} placeholder="Enter 6-digit PIN"/><button>EXPLORE PIN →</button></form><small>Try: <button className="link" onClick={()=>router.push('/pincode/759001')}>759001</button> · <button className="link" onClick={()=>router.push('/pincode/753001')}>753001</button> · <button className="link" onClick={()=>router.push('/pincode/751002')}>751002</button></small></>}
{mode==='place'&&<div className="placeFinder"><input aria-label="Place or post office" value={place} onChange={e=>setPlace(e.target.value)} placeholder="Area, district or post office"/>{place.trim().length>=2&&<div className="searchResults">{placeResults.length?placeResults.map(r=><button key={`${r.pincode}-${r.office}`} onClick={()=>router.push(`/pincode/${r.pincode}`)}><strong>{r.pincode}</strong><span>{r.office}</span><small>{r.district} · {r.state} · {r.postOffices} office{r.postOffices===1?'':'s'}</small></button>):<p>No local match found.</p>}</div>}</div>}
{mode==='browse'&&<div className="browseStates">{states.map(x=><button key={x.slug} onClick={()=>router.push(`/pincodes/${x.slug}`)}><span>STATE / UT</span><b>{x.state}</b><small>{x.pins} PIN{x.pins===1?'':'s'} cached →</small></button>)}<button className="allIndia" onClick={()=>router.push('/pincodes')}><span>DIRECTORY</span><b>ALL STATES</b><small>Open India PIN directory →</small></button></div>}
<div className="coverageNote"><b>POSTAL DIRECTORY</b><span>{cacheState==='syncing'?'Saving postal data to this device…':cacheState==='ready'?`${cacheMeta?.pinCount||0} PINs · ${cacheMeta?.officeCount||0} post offices stored locally`:'Local cache unavailable · server lookup active'}</span></div></section>
<section className="identityGrid"><article><span>01 · POSTAL</span><h2>PIN CODE</h2><p>Your postal geography: post office, district and state.</p></article><article><span>02 · PRECISE</span><h2>DIGIPIN</h2><p>India Post&apos;s digital addressing layer for precise locations inside a PIN.</p></article><article><span>03 · PEOPLE</span><h2>194.194 CULT</h2><p>The community layer: Active, Forming, or Not Here Yet.</p></article></section>
<section className="registry"><div><span className="kicker">THE REGISTRY</span><h2>India, PIN by PIN.</h2></div><div className="stats"><b>{pincodes.filter(x=>x.status==='ACTIVE').length}</b><span>ACTIVE CULT</span><b>{pincodes.filter(x=>x.status==='FORMING').length}</b><span>FORMING</span></div></section>
<section className="origin"><span>WHERE IT STARTED</span><div><h2>PIN CODE CAFÉ</h2><p>Dhenkanal · 759001</p></div><a href="https://pincode.cafe" target="_blank" rel="noreferrer">VISIT PINCODE.CAFE →</a></section>
<footer><b>194.194 CULT</b><span>EVERY PIN HAS AN ADDRESS · EVERY PLACE CAN HAVE A DIGIPIN · SOME PINS HAVE A CULT</span><span>FOUNDED IN DHENKANAL</span></footer></main>}
