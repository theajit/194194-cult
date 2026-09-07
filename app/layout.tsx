import './globals.css';
import './pin-directory.css';
import type {Metadata} from 'next';

export const metadata:Metadata={
  metadataBase:new URL('https://cult.pincode.cafe'),
  title:{default:'PIN Code, DIGIPIN & 194.194 Cult — Explore Your PIN',template:'%s | 194.194 Cult'},
  description:'Search an Indian PIN code to explore postal identity, precise-location DIGIPIN information and 194.194 Cult community status.',
  keywords:['India PIN code','PIN code search','PIN code directory','DIGIPIN','India Post DIGIPIN','194.194 Cult','Dhenkanal','Pin Code Café'],
  alternates:{canonical:'/'},
  robots:{index:true,follow:true},
  openGraph:{siteName:'194.194 Cult',title:'Know your PIN. Find your place. Find your people.',description:'PIN Code · DIGIPIN · 194.194 Cult',type:'website',locale:'en_IN'}
};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-IN"><head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" referrerPolicy="no-referrer"/></head><body>{children}</body></html>}
