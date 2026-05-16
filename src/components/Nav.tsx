'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Registry' },
  { href: '/models', label: 'Models' },
  { href: '/identify', label: 'Identify' },
  { href: '/submit', label: 'Submit' },
  { href: '/history', label: 'History' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="font-mono font-bold text-lg tracking-tight text-white">
          MGR<span className="text-red-500">.</span>
        </Link>
        <nav className="flex gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                pathname === href ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
