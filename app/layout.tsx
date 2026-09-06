import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '194.194 Cult — Find Your PIN', description: 'Every PIN has an address. Some PINs have a Cult.' };

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
