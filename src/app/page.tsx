import { supabase } from '@/lib/supabase'
import { getRefValues } from '@/lib/ref-values'
import type { Guitar } from '@/lib/types'
import RegistrySection from '@/components/RegistrySection'

export const revalidate = 60

async function getGuitars(modelFilter?: string): Promise<Guitar[]> {
  let query = supabase
    .from('guitars')
    .select('id, mgr_id, model_id, serial, serial_number_only, series, generation, factory_colour, last_known_city, last_known_country, specification_source, registered_by, primary_image_url, status, model_specifications(model)')
    .in('status', ['Approved', 'Pending', 'Pre-populated'])
    .order('serial_number_only', { ascending: true, nullsFirst: false })

  if (modelFilter) {
    const { data: ms } = await supabase
      .from('model_specifications')
      .select('id')
      .eq('model', modelFilter.toUpperCase())
      .single()
    if (ms?.id) query = query.eq('model_id', ms.id)
  }

  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return data as Guitar[]
}

export default async function RegistryPage({ searchParams }: { searchParams: Promise<{ model?: string }> }) {
  const { model: modelFilter } = await searchParams
  const [guitars, refMap] = await Promise.all([getGuitars(modelFilter), getRefValues()])

  return (
    <>
      {/* HERO */}
      <section style={{
        minHeight: 'calc(100vh - 56px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 4rem 5rem',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,0.02) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,0.02) 60px)',
          pointerEvents: 'none',
        }} />
        {/* Glow */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          background: 'radial-gradient(circle,rgba(200,169,110,0.07) 0%,transparent 70%)',
          top: '-100px', right: '-100px', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <p style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
            color: '#c8a96e', textTransform: 'uppercase', marginBottom: '24px',
          }}>
            Est. 1998 · Knebworth, UK · Community Archive
          </p>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(72px, 10vw, 140px)',
            lineHeight: 0.92, letterSpacing: '3px',
            color: '#f0ede8', marginBottom: '32px',
          }}>
            MAVERICK<br />
            <span style={{ color: '#c8a96e' }}>GUITARS</span>
          </h1>
          <p style={{
            maxWidth: '560px', color: '#9e9b96', fontSize: '16px', lineHeight: 1.7, marginBottom: '40px',
          }}>
            The community registry, identification guide and archive for Maverick Guitars — the British-designed guitar brand active 1998–2006. Document your instrument. Preserve the history.
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="#registry" style={{
              background: '#c8a96e', color: '#000',
              fontFamily: 'var(--font-dm-mono)', fontSize: '13px', fontWeight: 500,
              letterSpacing: '1.5px', padding: '14px 28px', textDecoration: 'none',
              display: 'inline-block',
            }}>
              BROWSE REGISTRY
            </a>
            <a href="/submit" style={{
              background: 'transparent', color: '#9e9b96',
              fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
              letterSpacing: '1px', padding: '14px 28px',
              border: '1px solid rgba(255,255,255,0.15)', textDecoration: 'none',
              display: 'inline-block', transition: 'color 0.2s, border-color 0.2s',
            }}
            className="btn-ghost"
            >
              REGISTER YOUR GUITAR
            </a>
          </div>
        </div>

        {/* Stats — bottom right */}
        <div style={{
          position: 'absolute', bottom: '5rem', right: '4rem',
          display: 'flex', gap: '48px',
        }} className="hero-stats-desktop">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '48px', color: '#c8a96e', lineHeight: 1 }}>{guitars.length}</div>
            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '2px', color: '#5c5a57', textTransform: 'uppercase', marginTop: '4px' }}>Registered</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '48px', color: '#c8a96e', lineHeight: 1 }}>22</div>
            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '2px', color: '#5c5a57', textTransform: 'uppercase', marginTop: '4px' }}>Models</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '48px', color: '#c8a96e', lineHeight: 1 }}>2</div>
            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '2px', color: '#5c5a57', textTransform: 'uppercase', marginTop: '4px' }}>Generations</div>
          </div>
        </div>
      </section>

      {/* Model filter banner */}
      {modelFilter && (
        <div style={{
          padding: '12px 4rem',
          background: 'rgba(200,169,110,0.06)',
          borderBottom: '1px solid rgba(200,169,110,0.15)',
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#c8a96e', letterSpacing: '0.5px' }}>
            Showing: {modelFilter.toUpperCase()}
          </span>
          <a
            href="/"
            style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', textDecoration: 'none', letterSpacing: '0.5px' }}
          >
            Clear filter ×
          </a>
        </div>
      )}

      {/* REGISTRY */}
      <RegistrySection guitars={guitars} refMap={refMap} />
    </>
  )
}
