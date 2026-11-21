import type { Metadata } from 'next'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import FormClosed from '@/components/FormClosed'
import { IS_LOCAL_DEV } from '@/lib/config'

const BUY_ME_A_COFFEE_URL = 'https://www.buymeacoffee.com/maverickguitarsorg'

export const metadata: Metadata = {
  title: 'Support the Archive — Maverick Guitars Registry',
  description: 'Help keep the Maverick Guitars Registry running. Leave a tip towards hosting, research and ongoing development.',
}

const funds = [
  { title: 'Hosting & Infrastructure', body: 'Database, storage, and serving the registry to everyone who uses it — free at the point of access.' },
  { title: 'Catalogue Digitisation', body: 'Professional scanning of the physical Maverick catalogues and press material being sourced from collectors.' },
  { title: 'Research', body: 'Tracking down press references, archive subscriptions, and correspondence with former employees and retailers.' },
  { title: 'Development', body: 'Building new features, improving the submission system, and keeping the platform running cleanly.' },
]

export default async function SupportPage() {
  const supabase = await createSupabaseServerClient()
  const { data: settingsRaw } = await supabase.from('site_settings').select('support_open').maybeSingle()
  const data = settingsRaw as { support_open: boolean } | null

  if (!IS_LOCAL_DEV && data && !data.support_open) {
    return (
      <FormClosed
        title="IN DEVELOPMENT"
        message="We're still setting up supporter accounts and payment processing — coming soon. Check back shortly."
      />
    )
  }

  return (
    <>
      {/* Hero — the pitch and the button together, so the ask is the first thing you see */}
      <section style={{
        padding: '4.5rem 4rem 3.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,0.02) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,0.02) 60px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '3rem 4rem', flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 460px', maxWidth: '680px' }}>
            <p style={{
              fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
              color: '#c8a96e', textTransform: 'uppercase', marginBottom: '16px',
            }}>Support the Archive</p>
            <h1 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(48px, 6vw, 84px)',
              letterSpacing: '3px', lineHeight: 0.92,
              color: '#f0ede8', marginBottom: '20px',
            }}>KEEP IT ALIVE</h1>
            <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.75 }}>
              The Maverick Guitars Registry is free, independent and community-built, but it costs real money
              to run. If you&apos;ve found the registry useful and you&apos;re able to contribute, hit the Buy Me a Coffee
              button to help keep it alive. There are no tiers, subscriptions or accounts needed. It&apos;s a one-off
              tip of whatever you like, and every coffee is genuinely appreciated.
            </p>
          </div>

          <div style={{
            border: '1px solid rgba(200,169,110,0.25)',
            background: 'rgba(200,169,110,0.04)',
            padding: '2rem 2.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
            flex: '0 0 auto',
          }}>
            <p style={{
              fontFamily: 'var(--font-bebas)', fontSize: '24px', letterSpacing: '1px', color: '#f0ede8',
            }}>Tips go straight to running the archive</p>
            {/* Buy Me a Coffee's own button image (plain <img>: it's their hosted asset, not ours to optimise) */}
            <a href={BUY_ME_A_COFFEE_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', lineHeight: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                alt="Buy Me a Coffee"
                width={217}
                height={60}
                style={{ height: '60px', width: '217px' }}
              />
            </a>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57' }}>
              You&apos;ll complete your tip on Buy Me a Coffee.
            </p>
          </div>
        </div>
      </section>

      {/* Where it goes + other ways to help, together */}
      <section style={{ padding: '3rem 4rem 3.5rem' }}>
        <p style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
          color: '#5c5a57', textTransform: 'uppercase', marginBottom: '12px',
        }}>Where it goes</p>
        <h2 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(28px, 3.5vw, 44px)',
          letterSpacing: '2px', lineHeight: 1,
          color: '#f0ede8', marginBottom: '24px',
        }}>WHAT YOUR SUPPORT FUNDS</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1px',
          background: 'rgba(255,255,255,0.06)',
        }}>
          {funds.map(item => (
            <div key={item.title} style={{ background: '#161616', padding: '1.5rem' }}>
              <div style={{
                fontFamily: 'var(--font-bebas)', fontSize: '20px',
                letterSpacing: '1px', color: '#c8a96e', marginBottom: '8px',
              }}>{item.title}</div>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#9e9b96', lineHeight: 1.6 }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <p style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
          color: '#5c5a57', lineHeight: 1.7, maxWidth: '640px', marginTop: '28px',
        }}>
          Not in a position to support financially? That&apos;s completely fine —{' '}
          <Link href="/submit" style={{ color: '#c8a96e', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            registering your guitar
          </Link>
          , sharing the registry with other Maverick owners, and contributing knowledge all help the archive grow.
          Every submission is a contribution. Got a question, or something to share?{' '}
          <Link href="/contribute" style={{ color: '#c8a96e', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            Contact the archive
          </Link>.
        </p>
      </section>
    </>
  )
}
