'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

type NavItem = { href: string; label: string; description: string; badge?: string }
type NavSection = { label: string; basePath: string; items: NavItem[] }

const sections: NavSection[] = [
  {
    label: 'Registry',
    basePath: '/',
    items: [
      { href: '/', label: 'The Registry', description: 'Browse all documented Maverick guitars' },
      { href: '/submit', label: 'Submit Your Guitar', description: 'Add your instrument to the archive' },
    ],
  },
  {
    label: 'Models',
    basePath: '/models',
    items: [
      { href: '/models#range', label: 'Model Guide', description: '22 models across 9 series' },
      { href: '/models#identify', label: 'Generation Guide', description: 'Identify Gen 1, Gen 2 and beyond' },
    ],
  },
  {
    label: 'Archive',
    basePath: '/archive',
    items: [
      { href: '/archive#history', label: 'Company History', description: 'The Maverick story — origin to end' },
      { href: '/archive#source-archive', label: 'Source Archive', description: 'Catalogues, press and primary sources' },
      { href: '/archive#articles', label: 'Articles & Testimonials', description: 'Community writing and interviews' },
    ],
  },
  {
    label: 'Marketplace',
    basePath: '/marketplace',
    items: [
      { href: '/marketplace#parts', label: 'Parts & Modifications', description: 'Compatible hardware and upgrades', badge: 'Soon' },
      { href: '/marketplace#listings', label: 'Find a Maverick', description: 'Listed guitars for sale', badge: 'Soon' },
    ],
  },
]

export default function Nav() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setOpenSection(null)
    setAccountOpen(false)
  }, [pathname])

  const open = useCallback((key: string) => {
    if (timer.current) clearTimeout(timer.current)
    setOpenSection(key)
    setAccountOpen(false)
  }, [])

  const openAccount = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setAccountOpen(true)
    setOpenSection(null)
  }, [])

  const delayClose = useCallback(() => {
    timer.current = setTimeout(() => {
      setOpenSection(null)
      setAccountOpen(false)
    }, 160)
  }, [])

  const cancelClose = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  function isActive(section: NavSection) {
    if (section.basePath === '/') return pathname === '/'
    return pathname.startsWith(section.basePath)
  }

  const dropdownPanel: React.CSSProperties = {
    position: 'absolute', top: '56px',
    left: '50%', transform: 'translateX(-50%)',
    background: '#111',
    border: '1px solid rgba(255,255,255,0.1)',
    borderTop: '2px solid #c8a96e',
    boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
    minWidth: '240px', zIndex: 200,
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(14,14,14,0.96)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      height: '56px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 2rem',
    }}>
      {/* Logo */}
      <Link href="/" style={{
        fontFamily: 'var(--font-bebas)', fontSize: '22px',
        letterSpacing: '2px', color: '#c8a96e', textDecoration: 'none', flexShrink: 0,
      }}>
        MAVERICK{' '}
        <span style={{ color: '#9e9b96', fontSize: '13px', fontFamily: 'var(--font-dm-mono)', letterSpacing: '1px', marginLeft: '8px', verticalAlign: 'middle' }}>
          REGISTRY
        </span>
      </Link>

      {/* Section dropdowns */}
      <nav style={{ display: 'flex', alignItems: 'stretch', height: '56px' }}>
        {sections.map(section => {
          const active = isActive(section)
          const isOpen = openSection === section.label
          return (
            <div
              key={section.label}
              style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
              onMouseEnter={() => open(section.label)}
              onMouseLeave={delayClose}
            >
              <Link
                href={section.basePath}
                style={{
                  fontFamily: 'var(--font-dm-mono)', fontSize: '12px', letterSpacing: '0.5px',
                  color: active || isOpen ? '#c8a96e' : '#9e9b96',
                  textDecoration: 'none',
                  padding: '0 1.1rem', height: '56px',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  transition: 'color 0.2s',
                  borderBottom: active ? '2px solid #c8a96e' : '2px solid transparent',
                  marginBottom: active ? '0' : '0',
                }}
              >
                {section.label}
                <span style={{
                  fontSize: '9px', opacity: 0.5,
                  transform: isOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s', display: 'inline-block',
                }}>▾</span>
              </Link>

              {isOpen && (
                <div
                  onMouseEnter={cancelClose}
                  onMouseLeave={delayClose}
                  style={dropdownPanel}
                >
                  {section.items.map((item, i) => {
                    const itemBasePath = item.href.split('#')[0]
                    const itemActive = itemBasePath === '/' ? pathname === '/' : pathname === itemBasePath
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          display: 'block', padding: '0.9rem 1.2rem', textDecoration: 'none',
                          borderBottom: i < section.items.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                          background: itemActive ? 'rgba(200,169,110,0.06)' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (!itemActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = itemActive ? 'rgba(200,169,110,0.06)' : 'transparent' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '13px', color: itemActive ? '#c8a96e' : '#f0ede8' }}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span style={{
                              fontFamily: 'var(--font-dm-mono)', fontSize: '9px',
                              letterSpacing: '1px', textTransform: 'uppercase',
                              color: '#5c5a57', border: '1px solid rgba(255,255,255,0.1)',
                              padding: '1px 5px',
                            }}>{item.badge}</span>
                          )}
                        </div>
                        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', lineHeight: 1.4 }}>
                          {item.description}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Right side: Support + Account */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <Link
          href="/support"
          style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '1px',
            textTransform: 'uppercase', color: '#c8a96e',
            border: '1px solid rgba(200,169,110,0.35)',
            padding: '5px 12px', textDecoration: 'none',
            transition: 'border-color 0.2s, background 0.2s',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLElement).style.borderColor = '#c8a96e'
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(200,169,110,0.07)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,169,110,0.35)'
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          Support Us
        </Link>

        {user ? (
          <div
            style={{ position: 'relative' }}
            onMouseEnter={openAccount}
            onMouseLeave={delayClose}
          >
            <button style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-dm-mono)', fontSize: '12px',
              color: pathname.startsWith('/profile') ? '#c8a96e' : '#9e9b96',
              display: 'flex', alignItems: 'center', gap: '4px',
              transition: 'color 0.2s',
            }}>
              My Account
              <span style={{ fontSize: '9px', opacity: 0.5, transform: accountOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
            </button>

            {accountOpen && (
              <div
                onMouseEnter={cancelClose}
                onMouseLeave={delayClose}
                style={{ ...dropdownPanel, left: 'auto', right: 0, transform: 'none', top: '32px' }}
              >
                <Link href="/profile" style={{
                  display: 'block', padding: '0.85rem 1.2rem',
                  fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
                  color: '#f0ede8', textDecoration: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >My Guitars</Link>
                <Link href="/support" style={{
                  display: 'block', padding: '0.85rem 1.2rem',
                  fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
                  color: '#c8a96e', textDecoration: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >Support the Archive</Link>
                <button
                  onClick={async () => {
                    const supabase = createSupabaseBrowserClient()
                    await supabase.auth.signOut()
                    window.location.href = '/'
                  }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '0.85rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-dm-mono)', fontSize: '13px', color: '#5c5a57',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#9e9b96')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#5c5a57')}
                >Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/login"
              style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '12px',
                color: '#9e9b96', textDecoration: 'none', transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c8a96e')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9e9b96')}
            >Sign in</Link>
            <Link
              href="/register"
              style={{
                background: '#c8a96e', color: '#000',
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                fontWeight: 600, letterSpacing: '1px',
                padding: '7px 16px', textDecoration: 'none', transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >REGISTER</Link>
          </>
        )}
      </div>
    </header>
  )
}
