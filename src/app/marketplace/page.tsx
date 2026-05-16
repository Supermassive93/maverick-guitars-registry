import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marketplace — Maverick Guitars Registry',
  description: 'Parts, modifications, and listings for Maverick guitars.',
}

const subNav = [
  { href: '#parts', label: 'Parts & Modifications' },
  { href: '#listings', label: 'Find a Maverick' },
]

export default function MarketplacePage() {
  return (
    <>
      {/* Header */}
      <section style={{
        padding: '6rem 4rem 4rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,0.02) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,0.02) 60px)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <p style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
            color: '#c8a96e', textTransform: 'uppercase', marginBottom: '16px',
          }}>Marketplace</p>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(52px, 7vw, 96px)',
            letterSpacing: '3px', lineHeight: 0.92,
            color: '#f0ede8', marginBottom: '24px',
          }}>PARTS & GUITARS</h1>
          <p style={{ maxWidth: '600px', color: '#9e9b96', fontSize: '16px', lineHeight: 1.7 }}>
            Compatible hardware, replacement parts, and a curated view of Maverick guitars currently listed for sale.
            This section is in development — content will be added as the registry grows.
          </p>
        </div>
      </section>

      {/* Sticky sub-nav */}
      <div style={{
        position: 'sticky', top: '56px', zIndex: 50,
        background: 'rgba(14,14,14,0.97)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
      }}>
        {subNav.map(item => (
          <a key={item.href} href={item.href} className="subnav-link">
            {item.label}
          </a>
        ))}
      </div>

      {/* ── SECTION 1: PARTS ── */}
      <section id="parts" style={{ scrollMarginTop: '100px', padding: '5rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
          color: '#5c5a57', textTransform: 'uppercase', marginBottom: '16px',
        }}>Hardware & Upgrades</p>
        <h2 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(36px, 5vw, 64px)',
          letterSpacing: '2px', lineHeight: 1,
          color: '#f0ede8', marginBottom: '24px',
        }}>PARTS & MODIFICATIONS</h2>
        <p style={{ maxWidth: '580px', color: '#9e9b96', fontSize: '15px', lineHeight: 1.7, marginBottom: '48px' }}>
          Compatible replacement hardware, known-good substitutes, and modification guides for Maverick guitars.
          The Wilkinson hardware used across the range remains in production and widely available.
        </p>

        <div style={{
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '3rem', textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-bebas)', fontSize: '28px',
            letterSpacing: '2px', color: '#2a2826', marginBottom: '12px',
          }}>IN DEVELOPMENT</p>
          <p style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
            color: '#5c5a57', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto',
          }}>
            Parts guides and affiliate links are being curated. Content will appear here as the registry&apos;s hardware knowledge is formalised.
          </p>
        </div>
      </section>

      {/* ── SECTION 2: LISTINGS ── */}
      <section id="listings" style={{ scrollMarginTop: '100px', padding: '5rem 4rem' }}>
        <p style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
          color: '#5c5a57', textTransform: 'uppercase', marginBottom: '16px',
        }}>Secondary Market</p>
        <h2 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(36px, 5vw, 64px)',
          letterSpacing: '2px', lineHeight: 1,
          color: '#f0ede8', marginBottom: '24px',
        }}>FIND A MAVERICK</h2>
        <p style={{ maxWidth: '580px', color: '#9e9b96', fontSize: '15px', lineHeight: 1.7, marginBottom: '48px' }}>
          A curated view of Maverick guitars currently listed for sale across eBay, Reverb, and other marketplaces.
          Rare models — the SF-1, X-Treme, F2, G-Series — surface infrequently. This feed will track them when they appear.
        </p>

        <div style={{
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '3rem', textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-bebas)', fontSize: '28px',
            letterSpacing: '2px', color: '#2a2826', marginBottom: '12px',
          }}>IN DEVELOPMENT</p>
          <p style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
            color: '#5c5a57', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto',
          }}>
            Marketplace integration is planned. In the meantime, searching eBay for &ldquo;Maverick guitar&rdquo; or &ldquo;Maverick F1&rdquo; is the most reliable way to find listed instruments.
          </p>
        </div>
      </section>
    </>
  )
}
