import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Maverick Guitars Registry',
  description: 'A community registry and identification resource for Maverick Guitar Company instruments.',
  openGraph: {
    title: 'Maverick Guitars Registry',
    description: 'Community registry for Maverick Guitar Company instruments.',
    url: 'https://maverickguitars.org',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen`}>
        <Nav />
        <main>{children}</main>
        <footer className="border-t border-zinc-800 mt-24 py-10 text-center text-zinc-600 text-sm">
          <p>Maverick Guitars Registry — an independent community project</p>
          <p className="mt-1">Maverick Guitar Company Limited operated 1998–2006 · 6 Warren Business Park, Knebworth, Hertfordshire</p>
        </footer>
      </body>
    </html>
  )
}
