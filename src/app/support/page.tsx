import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Support the Archive — Maverick Guitars Registry',
  description: 'Help keep the Maverick Guitars Registry running. Support the archive through Patreon or one-off contributions.',
}

const tiers = [
  {
    name: 'Supporter',
    amount: '£2 / month',
    description: 'Keep the lights on. Covers hosting and keeps the registry free for everyone.',
    perks: ['Supporter badge on your profile', 'Name in the credits'],
  },
  {
    name: 'Contributor',
    amount: '£5 / month',
    description: 'Fund active research — digitisation costs, postage for catalogue loans, and archive subscriptions.',
    perks: ['Supporter badge', 'Name in credits', 'Early access to new archive material'],
  },
  {
    name: 'Patron',
    amount: '£10 / month',
    description: 'Sustain the long-term mission. Makes the difference between the registry surviving and thriving.',
    perks: ['Patron badge', 'Name prominently in credits', 'Early access', 'Direct input on research priorities'],
  },
]

export default function SupportPage() {
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
          }}>Support the Archive</p>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(52px, 7vw, 96px)',
            letterSpacing: '3px', lineHeight: 0.92,
            color: '#f0ede8', marginBottom: '24px',
          }}>KEEP IT ALIVE</h1>
          <p style={{ maxWidth: '600px', color: '#9e9b96', fontSize: '16px', lineHeight: 1.7 }}>
            The Maverick Guitars Registry is free, independent, and community-built. It costs real money to run —
            hosting, digitisation, research, and the time it takes to do this properly.
            If this archive has been useful to you, consider supporting it.
          </p>
        </div>
      </section>

      {/* What your support funds */}
      <section style={{ padding: '5rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
          color: '#5c5a57', textTransform: 'uppercase', marginBottom: '16px',
        }}>Where it goes</p>
        <h2 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(32px, 4vw, 52px)',
          letterSpacing: '2px', lineHeight: 1,
          color: '#f0ede8', marginBottom: '40px',
        }}>WHAT YOUR SUPPORT FUNDS</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1px',
          background: 'rgba(255,255,255,0.06)',
          marginBottom: '0',
        }}>
          {[
            { title: 'Hosting & Infrastructure', body: 'Database, storage, and serving the registry to everyone who uses it — free at the point of access.' },
            { title: 'Catalogue Digitisation', body: 'Professional scanning of the physical Maverick catalogues and press material being sourced from collectors.' },
            { title: 'Research', body: 'Tracking down press references, archive subscriptions, and correspondence with former employees and retailers.' },
            { title: 'Development', body: 'Building new features, improving the submission system, and keeping the platform running cleanly.' },
          ].map(item => (
            <div key={item.title} style={{ background: '#161616', padding: '2rem' }}>
              <div style={{
                fontFamily: 'var(--font-bebas)', fontSize: '22px',
                letterSpacing: '1px', color: '#c8a96e', marginBottom: '12px',
              }}>{item.title}</div>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#9e9b96', lineHeight: 1.65 }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section style={{ padding: '5rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
          color: '#5c5a57', textTransform: 'uppercase', marginBottom: '16px',
        }}>Patreon</p>
        <h2 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(32px, 4vw, 52px)',
          letterSpacing: '2px', lineHeight: 1,
          color: '#f0ede8', marginBottom: '12px',
        }}>SUPPORT TIERS</h2>
        <p style={{ color: '#5c5a57', fontFamily: 'var(--font-dm-mono)', fontSize: '13px', marginBottom: '40px' }}>
          Monthly support via Patreon — cancel any time.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1px',
          background: 'rgba(255,255,255,0.06)',
          marginBottom: '40px',
        }}>
          {tiers.map(tier => (
            <div key={tier.name} style={{ background: '#161616', padding: '2rem' }}>
              <div style={{
                fontFamily: 'var(--font-bebas)', fontSize: '36px',
                letterSpacing: '2px', color: '#c8a96e', lineHeight: 1, marginBottom: '6px',
              }}>{tier.name}</div>
              <div style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '16px',
                color: '#f0ede8', marginBottom: '16px',
              }}>{tier.amount}</div>
              <p style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '12px',
                color: '#9e9b96', lineHeight: 1.65, marginBottom: '20px',
              }}>{tier.description}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {tier.perks.map(perk => (
                  <div key={perk} style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                    color: '#5c5a57', paddingLeft: '12px',
                    borderLeft: '1px solid rgba(200,169,110,0.25)',
                  }}>
                    {perk}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Patreon CTA — placeholder until page is live */}
        <div style={{
          border: '1px solid rgba(200,169,110,0.2)',
          padding: '2.5rem 3rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem',
          flexWrap: 'wrap',
        }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-bebas)', fontSize: '24px',
              letterSpacing: '1px', color: '#f0ede8', marginBottom: '6px',
            }}>Patreon page launching soon</p>
            <p style={{
              fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#5c5a57',
            }}>In the meantime, if you want to contribute directly — get in touch.</p>
          </div>
          <Link href="/contribute" style={{
            background: '#c8a96e', color: '#000',
            fontFamily: 'var(--font-dm-mono)', fontSize: '12px',
            fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
            padding: '12px 28px', textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>Get in touch</Link>
        </div>
      </section>

      {/* One-off note */}
      <section style={{ padding: '3rem 4rem' }}>
        <p style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
          color: '#5c5a57', lineHeight: 1.7, maxWidth: '600px',
        }}>
          Not in a position to support financially? That&apos;s completely fine —{' '}
          <Link href="/submit" style={{ color: '#c8a96e', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            registering your guitar
          </Link>
          , sharing the registry with other Maverick owners, and contributing knowledge all help the archive grow.
          Every submission is a contribution.
        </p>
      </section>
    </>
  )
}
