'use client';
import {FormEvent,useState} from 'react';
import {useRouter} from 'next/navigation';
import {pincodes} from '../lib/pincodes';

export default function Home(){const [pin,setPin]=useState('');const router=useRouter();const submit=(e:FormEvent)=>{e.preventDefault();if(/^\d{6}$/.test(pin))router.push(`/pincode/${pin}`)};return <main>
<nav><div className="brand"><b>194.194</b><span>CULT</span></div><a className="cafeBrand" href="https://pincode.cafe" target="_blank" rel="noreferrer"><img src="https://pincode.cafe/pin-code-cafe-logo.jpg" alt="Pin Code Café"/><span>FOUNDED AT<br/><b>PIN CODE CAFÉ</b></span></a></nav>
<section className="hero"><div className="eyebrow">A HYPERLOCAL COMMUNITY MOVEMENT · BORN IN DHENKANAL</div><h1>Does your PIN<br/>have a <i>Cult?</i></h1><p>Every PIN has an address. Some PINs have a Cult.<br/>Find yours — or be the reason it starts.</p>
<form onSubmit={submit}><input aria-label="PIN code" inputMode="numeric" maxLength={6} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,''))} placeholder="Enter 6-digit PIN"/><button>FIND MY PIN →</button></form><small>Try the founding PIN: <button className="link" onClick={()=>router.push('/pincode/759001')}>759001</button></small></section>
<section className="registry"><div><span className="kicker">THE REGISTRY</span><h2>India, PIN by PIN.</h2></div><div className="stats"><b>{pincodes.filter(x=>x.status==='ACTIVE').length}</b><span>ACTIVE CULT</span><b>{pincodes.filter(x=>x.status==='FORMING').length}</b><span>FORMING</span></div></section>
<section className="origin"><span>WHERE IT STARTED</span><div><h2>PIN CODE CAFÉ</h2><p>Dhenkanal · 759001</p></div><a href="https://pincode.cafe" target="_blank" rel="noreferrer">VISIT PINCODE.CAFE →</a></section>
<footer><b>194.194 CULT</b><span>FOUNDED AT PIN CODE CAFÉ · DHENKANAL</span><span>NO ALGORITHM. JUST PEOPLE.</span></footer></main>}
