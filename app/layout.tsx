import './globals.css';
import type {Metadata} from 'next';

export const metadata:Metadata={metadataBase:new URL('https://cult.pincode.cafe'),title:{default:'194.194 Cult — Find Your PIN',template:'%s'},description:'Every PIN has an address. Some PINs have a Cult.',alternates:{canonical:'/'},robots:{index:true,follow:true},openGraph:{siteName:'194.194 Cult',type:'website',locale:'en_IN'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-IN"><body>{children}</body></html>}
