import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {default:'PIN Code, DIGIPIN & 194.194 Cult — Explore Your PIN',template:'%s | 194.194 Cult'},
  description:'Search an Indian PIN code to explore postal identity, precise-location DIGIPIN information and 194.194 Cult community status.',
  keywords:['India PIN code','PIN code search','DIGIPIN','India Post DIGIPIN','194.194 Cult','Dhenkanal','Pin Code Café'],
  openGraph:{title:'Know your PIN. Find your place. Find your people.',description:'PIN Code · DIGIPIN · 194.194 Cult',type:'website'},
  robots:{index:true,follow:true}
};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-IN"><body>{children}</body></html>}