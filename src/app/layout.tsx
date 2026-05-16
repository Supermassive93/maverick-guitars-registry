import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'

const bebasNeue = Bebas_Neue({ variable: '--font-bebas', weight: '400', subsets: ['latin'] })
const dmSans    = DM_Sans({ variable: '--font-dm-sans', subsets: ['latin'], weight: ['300','400','500'] })
const dmMono    = DM_Mono({ variable: '--font-dm-mono', subsets: ['latin'], weight: ['300','400','500'] })

export const metadata: Metadata = {
  title: 'Maverick Guitars Registry',
  description: 'The community registry, identification guide and archive for Maverick Guitars — the British guitar brand active 1998–2006.',
  openGraph: {
    title: 'Maverick Guitars Registry',
    description: 'The community registry, identification guide and archive for Maverick Guitars.',
    url: 'https://maverickguitars.org',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bebasNeue.variable} ${dmSans.variable} ${dmMono.variable} antialiased min-h-screen`}>
        <Nav />
        <main style={{ paddingTop: '56px' }}>{children}</main>
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} className="mt-24 py-10 text-center text-sm">
          <p style={{ color: '#5c5a57', fontFamily: 'var(--font-dm-mono)' }}>
            Maverick Guitars Registry — an independent community project
          </p>
          <p style={{ color: '#5c5a57', fontFamily: 'var(--font-dm-mono)', marginTop: '4px' }}>
            Maverick Guitar Company Limited · Est. 1998 · Knebworth, Hertfordshire
          </p>
        </footer>
      </body>
    </html>
  )
}
