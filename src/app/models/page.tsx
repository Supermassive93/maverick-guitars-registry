import { MODEL_CATALOGUE, SERIES_ORDER, BASS_SERIES } from '@/data/models'

const MODEL_NICKNAMES: Record<string, string> = {
  'SF-1': 'Streetfighter',
  'SF-3': 'Streetfighter',
}
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Metadata } from 'next'
import Link from 'next/link'
import ModelCard from '@/components/ModelCard'

export const metadata: Metadata = {
  title: 'Model Guide — Maverick Guitars Registry',
  description: 'The complete Maverick Guitars model catalogue — 24 models across the Evolution, Century, D-Tox and Nemesis series.',
}

const subNav = [
  { href: '#range',   label: 'Model Guide' },
  { href: '#identify', label: 'Generation Guide' },
  { href: '#colours', label: 'Colour Guide' },
]

export default async function ModelsPage() {
  const supabase = await createSupabaseServerClient()

  type ColourRow = {
    id: string
    category: string
    display_name: string
    descriptor: string | null
    metadata: {
      hex: string | null
      hex_note: string | null
      hex_primary: string | null
      hex_secondary: string | null
      pattern: string | null
      pattern_description: string | null
      aka: string | null
      colour_source: string | null
      source_year: number | null
      style: string | null
    } | null
  }

  type SpecRow = {
    id: string
    model: string
    parent_model_id: string | null
    description: string | null
    rarity: string | null
  }
  const [{ data: rawSpecRows }, { data: rawCounts }, { data: rawColours }, { data: rawSourceColours }] = await Promise.all([
    supabase
      .from('model_specifications')
      .select('id, model, parent_model_id, description, rarity'),
    supabase
      .from('guitars')
      .select('model_id')
      .eq('status', 'Approved'),
    supabase
      .from('ref_values')
      .select('id, category, display_name, descriptor, metadata')
      .in('category', ['COL', 'CSC', 'HWC', 'PKC', 'CPKC'])
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('model_source_colours')
      .select('available_colours, source_materials(year)'),
  ])

  const specByModel = new Map<string, SpecRow>()
  for (const row of (rawSpecRows ?? []) as SpecRow[]) {
    specByModel.set(row.model, row)
  }

  // Only show rarity once ≥ 3 approved guitars exist for the model, keyed by model_id UUID
  const registryCountByModel = new Map<string, number>()
  for (const row of (rawCounts ?? []) as { model_id: string | null }[]) {
    if (!row.model_id) continue
    registryCountByModel.set(row.model_id, (registryCountByModel.get(row.model_id) ?? 0) + 1)
  }

  const colourRows = (rawColours ?? []) as ColourRow[]
  const col2001  = colourRows.filter(r => r.category === 'COL' && r.metadata?.source_year === 2001)
  const col2002  = colourRows.filter(r => r.category === 'COL' && r.metadata?.source_year === 2002)
  const cscRows  = colourRows.filter(r => r.category === 'CSC' && r.id !== 'CSC-0004')
  const hwcRows  = colourRows.filter(r => r.category === 'HWC' && r.id !== 'HWC-0004')
  const pkcRows  = colourRows.filter(r => r.category === 'PKC'  && r.id !== 'PKC-0005')
  const cpkcRows = colourRows.filter(r => r.category === 'CPKC' && r.id !== 'CPKC-0005')

  // Derive 2006 palette from model_source_colours entries linked to 2006 source materials
  type SourceColourEntry = { available_colours: string[]; source_materials: { year: string | null } | null }
  const col2006Ids = new Set<string>()
  for (const row of (rawSourceColours ?? []) as SourceColourEntry[]) {
    if (row.source_materials?.year === '2006') {
      for (const id of row.available_colours) col2006Ids.add(id)
    }
  }
  const col2006 = colourRows.filter(r => r.category === 'COL' && col2006Ids.has(r.id))

  const electricSeries = SERIES_ORDER.filter(s => !BASS_SERIES.includes(s))
  const bassSeries = SERIES_ORDER.filter(s => BASS_SERIES.includes(s))

  function seriesModels(series: string) {
    return MODEL_CATALOGUE.filter(m => m.series === series)
  }

  function swatchBg(row: ColourRow): string {
    const m = row.metadata
    if (!m) return 'rgba(255,255,255,0.05)'
    const { hex, hex_primary, hex_secondary, pattern } = m
    if (pattern === 'Striped' && hex_primary && hex_secondary)
      return `repeating-linear-gradient(0deg, ${hex_primary} 0px, ${hex_primary} 22px, ${hex_secondary} 22px, ${hex_secondary} 44px)`
    if (pattern === 'Burst' && hex) {
      const centre = row.id === 'COL-0013' ? '#C4903C' : '#F0C030'
      return `radial-gradient(ellipse at center, ${centre} 0%, ${hex} 72%)`
    }
    if (pattern === 'Natural Grain' && hex)
      return `repeating-linear-gradient(92deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 7px), ${hex}`
    if (pattern === 'Gloss Metallic' && hex)
      return `linear-gradient(135deg, rgba(255,255,255,0.20) 0%, transparent 50%, rgba(255,255,255,0.06) 100%), ${hex}`
    if (pattern === 'Brushed' && hex)
      return `repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 4px), ${hex}`
    if (hex) return hex
    return 'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 8px)'
  }

  function swatchLabel(displayName: string): { code: string; name: string } {
    const parts = displayName.split(' — ')
    return parts.length >= 2
      ? { code: parts[0], name: parts.slice(1).join(' — ') }
      : { code: '', name: displayName }
  }

  function HumbuckerIcon({ row }: { row: ColourRow }) {
    const style = row.metadata?.style ?? 'covered'
    const primary = row.metadata?.hex_primary ?? '#1e1c1a'
    const secondary = row.metadata?.hex_secondary ?? primary
    const line = 'rgba(255,255,255,0.45)'
    const pole = 'rgba(0,0,0,0.55)'
    const sw = '13.75'
    const cys = [300, 505.5, 710.5, 917, 1123, 1329]
    const screwYs = [257.5, 462.5, 668.5, 874.5, 1080.5, 1286.5]
    if (style === 'open_coil') {
      return (
        <svg viewBox="3319 111 766 1407" width="38" height="70" style={{ display: 'block' }}>
          <rect x="3326" y="118" width="365" height="1393" rx="182" fill={primary} />
          <rect x="3713" y="118" width="365" height="1393" rx="182" fill={secondary} />
          {cys.map(cy => <circle key={`l${cy}`} cx="3508.5" cy={cy} r="60.5" fill={pole} />)}
          {cys.map(cy => <circle key={`r${cy}`} cx="3895.5" cy={cy} r="60.5" fill={pole} />)}
          <path d="M3326 243.335C3326 174.114 3382.11 118 3451.34 118L3952.67 118C4021.89 118 4078 174.114 4078 243.335L4078 1385.67C4078 1454.89 4021.89 1511 3952.67 1511L3451.34 1511C3382.11 1511 3326 1454.89 3326 1385.67Z" stroke={line} strokeWidth={sw} strokeMiterlimit="8" fill="none" />
          <g stroke={line} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10">
            <path d="M3508.5 118C3609.29 118 3691 199.484 3691 300"/>
            <path d="M3326 300C3326 199.484 3407.71 118 3508.5 118"/>
            <path d="M3508.5 1511C3407.71 1511 3326 1429.52 3326 1329"/>
            <path d="M3691 1329C3691 1429.52 3609.29 1511 3508.5 1511"/>
            <path d="M3326 300 3326 1329.12"/><path d="M3691 300 3691 1329.12"/>
            {cys.map(cy => <circle key={cy} cx="3508.5" cy={cy} r="60.5"/>)}
          </g>
          <g stroke={line} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10">
            <path d="M3895.5 118C3996.29 118 4078 199.484 4078 300"/>
            <path d="M3713 300C3713 199.484 3794.71 118 3895.5 118"/>
            <path d="M3895.5 1511C3794.71 1511 3713 1429.52 3713 1329"/>
            <path d="M4078 1329C4078 1429.52 3996.29 1511 3895.5 1511"/>
            <path d="M3713 300 3713 1329.12"/><path d="M4078 300 4078 1329.12"/>
            {cys.map(cy => <circle key={cy} cx="3895.5" cy={cy} r="60.5"/>)}
          </g>
          {screwYs.map(y => <path key={y} d="M0 0 85.8837 85.8837" stroke={line} strokeWidth="22.9167" strokeMiterlimit="8" fill="none" transform={`matrix(-1 0 0 1 3551.38 ${y})`}/>)}
        </svg>
      )
    }
    return (
      <svg viewBox="2362 111 766 1407" width="38" height="70" style={{ display: 'block' }}>
        <rect x="2369" y="118" width="752" height="1393" rx="125" fill={primary} />
        {cys.map(cy => <circle key={cy} cx="2551.5" cy={cy} r="60.5" fill={pole} />)}
        <path d="M2369 243.335C2369 174.114 2425.11 118 2494.34 118L2995.67 118C3064.89 118 3121 174.114 3121 243.335L3121 1385.67C3121 1454.89 3064.89 1511 2995.67 1511L2494.34 1511C2425.11 1511 2369 1454.89 2369 1385.67Z" stroke={line} strokeWidth={sw} strokeMiterlimit="8" fill="none" />
        <g stroke={line} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10">
          <path d="M2369 300 2369 1329.12"/><path d="M3121 300 3121 1329.12"/>
          {cys.map(cy => <circle key={cy} cx="2551.5" cy={cy} r="60.5"/>)}
        </g>
        {screwYs.map(y => <path key={y} d="M0 0 85.8837 85.8837" stroke={line} strokeWidth="22.9167" strokeMiterlimit="8" fill="none" transform={`matrix(-1 0 0 1 2594.38 ${y})`}/>)}
      </svg>
    )
  }

  function SeriesSection({ series, bass = false }: { series: string; bass?: boolean }) {
    const models = seriesModels(series)
    const accentColor = bass ? '#9e9b96' : '#c8a96e'

    return (
      <section style={{
        padding: '3rem 4rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
            color: '#5c5a57', textTransform: 'uppercase', marginBottom: '8px',
          }}>
            {models.length} {models.length === 1 ? 'model' : 'models'}
          </p>
          <h2 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(32px, 4vw, 52px)',
            letterSpacing: '2px', lineHeight: 1,
            color: accentColor,
          }}>
            {series}
          </h2>
        </div>

        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '1px',
          background: 'rgba(255,255,255,0.06)',
          paddingBottom: '2px',
        }}>
          {models.map(m => {
            const spec = specByModel.get(m.model)
            const description = spec?.description ?? m.description
            const rarityRaw = spec?.rarity ?? m.rarity
            const rarity = (registryCountByModel.get(spec?.id ?? '') ?? 0) >= 3 ? rarityRaw : null
            return (
              <ModelCard
                key={m.model}
                model={m.model}
                nickname={MODEL_NICKNAMES[m.model]}
                description={description ?? null}
                rarity={rarity ?? null}
                slug={m.model.toLowerCase().replace(/\s+/g, '-')}
                accentColor={accentColor}
                bass={bass}
              />
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <>
      {/* Header */}
      <section id="range" style={{ scrollMarginTop: '56px' }} />{/* anchor target at top */}
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
          }}>
            Model Guide
          </p>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(52px, 7vw, 96px)',
            letterSpacing: '3px', lineHeight: 0.92,
            color: '#f0ede8', marginBottom: '24px',
          }}>
            THE RANGE
          </h1>
          <p style={{ maxWidth: '600px', color: '#9e9b96', fontSize: '16px', lineHeight: 1.7 }}>
            In 1997, hardware designer Trev Wilkinson introduced Maverick Guitars to a small custom
            workshop in Korea. Recognising the level of hand craftsmanship on offer, Maverick spent
            the next three years researching what contemporary players needed — and where existing
            manufacturing fell short. The first guitars reached the market in late 2000.
          </p>
          <p style={{ maxWidth: '600px', color: '#9e9b96', fontSize: '16px', lineHeight: 1.7, marginTop: '16px' }}>
            British-designed and Korean-built, the range spanned 24 models across four catalogue
            series — featuring the patented Evolution roller volume and tone system as one of several
            in-house developments that set Maverick apart from the broader market.
          </p>
        </div>
      </section>

      {/* Sticky section sub-nav */}
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

      {/* Electric guitar series */}
      {electricSeries.map(series => (
        <SeriesSection key={series} series={series} />
      ))}

      {/* Bass guitars divider */}
      <div style={{
        padding: '4rem 4rem 3rem',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <p style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
          color: '#5c5a57', textTransform: 'uppercase', marginBottom: '12px',
        }}>
          Low end
        </p>
        <h2 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(42px, 5vw, 72px)',
          letterSpacing: '3px', lineHeight: 0.95,
          color: '#9e9b96',
        }}>
          BASS GUITARS
        </h2>
        <p style={{
          maxWidth: '520px', color: '#5c5a57', fontSize: '14px',
          lineHeight: 1.7, marginTop: '16px',
          fontFamily: 'var(--font-dm-mono)',
        }}>
          The Nemesis series covers Maverick&apos;s full bass range. The B1 and Z-47 predate
          the Nemesis branding appearing in catalogues but are referenced as Nemesis in
          secondary market listings — Registry Derived. The S4 and S5 are Catalogue Confirmed
          from the 2002 catalogue.
        </p>
      </div>

      {/* Bass series */}
      {bassSeries.map(series => (
        <SeriesSection key={series} series={series} bass />
      ))}

      {/* Footer note */}
      <section style={{ padding: '4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
          color: '#5c5a57', lineHeight: 1.7, maxWidth: '600px',
        }}>
          Model descriptions are based on catalogue sources, press references, and documented registry examples.
          If you own a Maverick in a series not yet well-documented,{' '}
          <Link href="/submit" style={{ color: '#c8a96e', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            register your guitar
          </Link>{' '}
          to help complete the archive.
        </p>
      </section>

      {/* ── GENERATION GUIDE ── */}
      <section id="identify" style={{ scrollMarginTop: '100px' }}>
        {/* Section header */}
        <div style={{
          padding: '5rem 4rem 4rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'relative', overflow: 'hidden',
          background: 'rgba(255,255,255,0.01)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,0.015) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,0.015) 60px)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <p style={{
              fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
              color: '#c8a96e', textTransform: 'uppercase', marginBottom: '16px',
            }}>Generation Guide</p>
            <h2 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(52px, 7vw, 88px)',
              letterSpacing: '3px', lineHeight: 0.92,
              color: '#f0ede8', marginBottom: '24px',
            }}>IDENTIFY YOUR GEN</h2>
            <p style={{ maxWidth: '600px', color: '#9e9b96', fontSize: '16px', lineHeight: 1.7 }}>
              Maverick guitars were produced across multiple generations with identifiable spec changes between them.
              Seven confirmed indicators have been established from catalogue evidence and documented examples — primarily the F1 and F1HT.
              This guide sharpens as more examples are registered.
            </p>
          </div>
        </div>

        {/* Caveat */}
        <div style={{
          padding: '1.25rem 4rem',
          background: 'rgba(200,169,110,0.04)',
          borderBottom: '1px solid rgba(200,169,110,0.12)',
        }}>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#8b6e3f', lineHeight: 1.7, maxWidth: '820px' }}>
            <span style={{ color: '#c8a96e', letterSpacing: '1px', textTransform: 'uppercase', marginRight: '10px' }}>Note</span>
            Generation boundaries are based on catalogue evidence and physical examples. Where evidence is limited, indicators are marked Tentative.
            If your guitar doesn&apos;t match what&apos;s described here —{' '}
            <Link href="/submit" style={{ color: '#c8a96e', textDecoration: 'underline', textUnderlineOffset: '3px' }}>register it</Link>
            {' '}to help extend the picture.
          </p>
        </div>

        {/* Quickest test */}
        <div style={{ padding: '4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
            color: '#5c5a57', textTransform: 'uppercase', marginBottom: '16px',
          }}>The quickest test</p>
          <h3 style={{
            fontFamily: 'var(--font-bebas)', fontSize: 'clamp(28px, 3vw, 44px)',
            letterSpacing: '2px', color: '#f0ede8', marginBottom: '20px',
          }}>LOOK AT THE PICKUPS</h3>
          <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.75, maxWidth: '680px', marginBottom: '32px' }}>
            The single most reliable visual indicator is the pickup surrounds.
            Does a plastic frame surround each pickup, or does it sit flush in a routed cavity with body finish visible around it?
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px',
            background: 'rgba(255,255,255,0.06)', maxWidth: '680px',
          }}>
            <div style={{ background: '#161616', padding: '1.75rem' }}>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '24px', letterSpacing: '2px', color: '#c8a96e', marginBottom: '10px' }}>
                No surround → Gen 1
              </div>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#9e9b96', lineHeight: 1.65 }}>
                Pickup sits flush in the routed cavity. Confirmed spec shown throughout the 2001 and 2002 catalogues.
              </p>
            </div>
            <div style={{ background: '#161616', padding: '1.75rem', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '24px', letterSpacing: '2px', color: '#9e9b96', marginBottom: '10px' }}>
                Surround present → Gen 2
              </div>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#9e9b96', lineHeight: 1.65 }}>
                A metal surround frames each pickup. Confirmed Gen 2 indicator across documented examples.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <div style={{ padding: '4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{
            fontFamily: 'var(--font-bebas)', fontSize: 'clamp(28px, 3vw, 44px)',
            letterSpacing: '2px', color: '#f0ede8', marginBottom: '32px',
          }}>GEN 1 vs GEN 2</h3>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1px' }}>
            <div style={{ background: '#111', padding: '0.75rem 1.5rem' }}>
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#5c5a57' }}>Feature</span>
            </div>
            <div style={{ background: '#111', padding: '0.75rem 1.5rem', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '18px', letterSpacing: '2px', color: '#c8a96e' }}>Gen 1</span>
            </div>
            <div style={{ background: '#111', padding: '0.75rem 1.5rem', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '18px', letterSpacing: '2px', color: '#9e9b96' }}>Gen 2</span>
            </div>
          </div>

          {[
            {
              label: 'Pickup surrounds', confidence: 'Confirmed' as const,
              gen1: 'None — pickups sit flush in routed cavities with no plastic frame',
              gen2: 'Metal surrounds — a frame surrounds each pickup housing',
            },
            {
              label: 'Switch knob', confidence: 'Confirmed' as const,
              gen1: 'Cylindrical barrel knob with O-ring detail',
              gen2: 'Tapered knob — no O-ring',
            },
            {
              label: 'Headstock logo', confidence: 'Confirmed' as const,
              gen1: 'Maverick script — lacquer-encapsulated foil decal',
              gen2: 'Maverick script — cream silkscreen print',
            },
            {
              label: 'Bridge logo', confidence: 'Confirmed' as const,
              gen1: 'Maverick classic script logo on bridge plate',
              gen2: 'Maverick stencil script logo on bridge plate',
            },
            {
              label: 'Neck construction', confidence: 'Confirmed' as const,
              gen1: 'Bolt-on 2-piece with scarf joint',
              gen2: 'Bolt-on 1-piece',
            },
            {
              label: 'Neck binding', confidence: 'Confirmed' as const,
              gen1: 'No binding',
              gen2: 'Cream binding',
            },
            {
              label: 'Skunk stripe', confidence: 'Confirmed' as const,
              gen1: 'Bubinga skunk stripe on neck back',
              gen2: 'No skunk stripe',
            },
            {
              label: 'Potentiometers', confidence: 'Tentative' as const,
              gen1: 'Evolution roller pots — distinctive rolling barrel controls',
              gen2: 'To be established — pending more documented Gen 2 examples',
            },
            {
              label: 'Serial number range', confidence: 'Unknown' as const,
              gen1: 'Not yet established',
              gen2: 'Not yet established',
            },
          ].map((row, i, arr) => {
            const confColour = row.confidence === 'Confirmed' ? '#c8a96e' : row.confidence === 'Tentative' ? '#7a6a4f' : '#3a3835'
            const confBg = row.confidence === 'Confirmed' ? 'rgba(200,169,110,0.08)' : row.confidence === 'Tentative' ? 'rgba(200,169,110,0.04)' : 'rgba(255,255,255,0.03)'
            return (
              <div key={row.label} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px',
                background: 'rgba(255,255,255,0.06)',
                marginBottom: i < arr.length - 1 ? '1px' : '0',
              }}>
                <div style={{ background: '#161616', padding: '1.25rem 1.5rem' }}>
                  <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '13px', color: '#f0ede8', marginBottom: '6px' }}>{row.label}</div>
                  <div style={{ display: 'inline-block', fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: confColour, background: confBg, padding: '2px 7px' }}>
                    {row.confidence}
                  </div>
                </div>
                <div style={{ background: '#161616', padding: '1.25rem 1.5rem', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#9e9b96', lineHeight: 1.55 }}>{row.gen1}</p>
                </div>
                <div style={{ background: '#161616', padding: '1.25rem 1.5rem', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#9e9b96', lineHeight: 1.55 }}>{row.gen2}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Model-specific notes */}
        <div style={{ padding: '4rem' }}>
          <h3 style={{
            fontFamily: 'var(--font-bebas)', fontSize: 'clamp(28px, 3vw, 44px)',
            letterSpacing: '2px', color: '#f0ede8', marginBottom: '32px',
          }}>MODEL-SPECIFIC NOTES</h3>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1px', background: 'rgba(255,255,255,0.06)',
          }}>
            {[
              {
                model: 'F2', badge: 'Confirmed', badgeGold: true,
                body: 'Gen 1 F2 examples carry a ~1° neck pitch requiring ~8mm body packing — PRS-equivalent geometry producing exceptionally low action. Confirmed available in Tobacco Burst and Fireburst per the 2002 catalogue.',
              },
              {
                model: 'X1', badge: 'Tentative', badgeGold: false,
                body: 'Available in 6 and 7-string configurations. The 7-string variant is rarer and generation placement is unconfirmed. If you own an X1 7-string, register it.',
              },
              {
                model: 'SF-1', badge: 'Confirmed', badgeGold: true,
                body: 'Retailer-commissioned limited run — does not follow the same production timeline as the main catalogue. As few as 4 known examples in certain colourways. Generation assignment should be treated with caution.',
              },
            ].map(item => (
              <div key={item.model} style={{ background: '#161616', padding: '2rem' }}>
                <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '42px', color: '#c8a96e', letterSpacing: '3px', lineHeight: 1, marginBottom: '8px' }}>
                  {item.model}
                </div>
                <div style={{
                  display: 'inline-block', marginBottom: '14px',
                  fontFamily: 'var(--font-dm-mono)', fontSize: '10px',
                  letterSpacing: '1.5px', textTransform: 'uppercase',
                  color: item.badgeGold ? '#c8a96e' : '#7a6a4f',
                  background: item.badgeGold ? 'rgba(200,169,110,0.08)' : 'rgba(200,169,110,0.04)',
                  padding: '2px 7px',
                }}>{item.badge}</div>
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#9e9b96', lineHeight: 1.65 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── COLOUR GUIDE ── */}
      <section id="colours" style={{ scrollMarginTop: '100px' }}>

        {/* Section header */}
        <div style={{
          padding: '5rem 4rem 4rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'relative', overflow: 'hidden',
          background: 'rgba(255,255,255,0.01)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,0.015) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,0.015) 60px)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <p style={{
              fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
              color: '#c8a96e', textTransform: 'uppercase', marginBottom: '16px',
            }}>Colour Guide</p>
            <h2 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(52px, 7vw, 88px)',
              letterSpacing: '3px', lineHeight: 0.92,
              color: '#f0ede8', marginBottom: '24px',
            }}>THE PALETTE</h2>
            <p style={{ maxWidth: '600px', color: '#9e9b96', fontSize: '16px', lineHeight: 1.7 }}>
              All known Maverick body finishes — factory catalogue colours and confirmed custom shop options.
              Grouped by source material.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          padding: '1.25rem 4rem',
          background: 'rgba(200,169,110,0.04)',
          borderBottom: '1px solid rgba(200,169,110,0.12)',
        }}>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#8b6e3f', lineHeight: 1.7, maxWidth: '820px' }}>
            <span style={{ color: '#c8a96e', letterSpacing: '1px', textTransform: 'uppercase', marginRight: '10px' }}>Note</span>
            Swatches are approximate — sampled from printed catalogue material and rendered as flat colour.
            Metallic, burst, and natural-grain finishes will differ significantly in person.
          </p>
        </div>

        {/* Factory colours — 2001 Brochure */}
        {col2001.length > 0 && (
          <div style={{ padding: '3rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
                color: '#5c5a57', textTransform: 'uppercase', marginBottom: '8px',
              }}>Factory Colours · {col2001.length} colours</p>
              <h3 style={{
                fontFamily: 'var(--font-bebas)', fontSize: 'clamp(28px, 3vw, 44px)',
                letterSpacing: '2px', color: '#c8a96e', lineHeight: 1,
              }}>2001 Brochure</h3>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1px', background: 'rgba(255,255,255,0.06)',
            }}>
              {col2001.map(row => {
                const { code, name } = swatchLabel(row.display_name)
                return (
                  <div key={row.id} style={{ background: '#161616' }}>
                    <div
                      title={row.metadata?.hex_note ?? undefined}
                      style={{ height: '100px', background: swatchBg(row) }}
                    />
                    <div style={{ padding: '12px 14px' }}>
                      {code && <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px', letterSpacing: '2px', color: '#c8a96e', lineHeight: 1, marginBottom: '3px' }}>{code}</div>}
                      <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#9e9b96', lineHeight: 1.4 }}>{name}</div>
                      {row.metadata?.pattern && (
                        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#3a3835', marginTop: '6px' }}>
                          {row.metadata.pattern}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Factory colours — 2002 Catalogue */}
        {col2002.length > 0 && (
          <div style={{ padding: '3rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
                color: '#5c5a57', textTransform: 'uppercase', marginBottom: '8px',
              }}>Factory Colours · {col2002.length} colours</p>
              <h3 style={{
                fontFamily: 'var(--font-bebas)', fontSize: 'clamp(28px, 3vw, 44px)',
                letterSpacing: '2px', color: '#c8a96e', lineHeight: 1,
              }}>2002 Catalogue</h3>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1px', background: 'rgba(255,255,255,0.06)',
            }}>
              {col2002.map(row => {
                const { code, name } = swatchLabel(row.display_name)
                return (
                  <div key={row.id} style={{ background: '#161616' }}>
                    <div
                      title={row.metadata?.hex_note ?? undefined}
                      style={{ height: '100px', background: swatchBg(row) }}
                    />
                    <div style={{ padding: '12px 14px' }}>
                      {code && <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px', letterSpacing: '2px', color: '#c8a96e', lineHeight: 1, marginBottom: '3px' }}>{code}</div>}
                      <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#9e9b96', lineHeight: 1.4 }}>{name}</div>
                      {row.metadata?.pattern && (
                        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#3a3835', marginTop: '6px' }}>
                          {row.metadata.pattern}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Factory colours — 2006 */}
        {col2006.length > 0 && (
          <div style={{ padding: '3rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
                color: '#5c5a57', textTransform: 'uppercase', marginBottom: '8px',
              }}>Factory Colours · {col2006.length} colours</p>
              <h3 style={{
                fontFamily: 'var(--font-bebas)', fontSize: 'clamp(28px, 3vw, 44px)',
                letterSpacing: '2px', color: '#c8a96e', lineHeight: 1,
              }}>2006 Confirmed</h3>
              <p style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57',
                marginTop: '8px', lineHeight: 1.6, maxWidth: '560px',
              }}>
                Colours confirmed available in 2006 via press sources. These are a subset of the 2002 catalogue palette carried forward.
              </p>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1px', background: 'rgba(255,255,255,0.06)',
            }}>
              {col2006.map(row => {
                const { code, name } = swatchLabel(row.display_name)
                return (
                  <div key={row.id} style={{ background: '#161616' }}>
                    <div
                      title={row.metadata?.hex_note ?? undefined}
                      style={{ height: '100px', background: swatchBg(row) }}
                    />
                    <div style={{ padding: '12px 14px' }}>
                      {code && <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px', letterSpacing: '2px', color: '#c8a96e', lineHeight: 1, marginBottom: '3px' }}>{code}</div>}
                      <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#9e9b96', lineHeight: 1.4 }}>{name}</div>
                      {row.metadata?.pattern && (
                        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#3a3835', marginTop: '6px' }}>
                          {row.metadata.pattern}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Factory pickup colours */}
        {pkcRows.length > 0 && (
          <div style={{ padding: '3rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
                color: '#5c5a57', textTransform: 'uppercase', marginBottom: '8px',
              }}>Factory Pickup Colours · {pkcRows.length} options</p>
              <h3 style={{
                fontFamily: 'var(--font-bebas)', fontSize: 'clamp(28px, 3vw, 44px)',
                letterSpacing: '2px', color: '#c8a96e', lineHeight: 1,
              }}>Factory Pickup Colours</h3>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '1px', background: 'rgba(255,255,255,0.06)',
            }}>
              {pkcRows.map(row => {
                const { code, name } = swatchLabel(row.display_name)
                return (
                  <div key={row.id} style={{ background: '#161616' }}>
                    <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HumbuckerIcon row={row} />
                    </div>
                    <div style={{ padding: '10px 14px' }}>
                      {code && <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px', letterSpacing: '2px', color: '#c8a96e', lineHeight: 1, marginBottom: '3px' }}>{code}</div>}
                      <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#9e9b96', lineHeight: 1.4 }}>{name}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Hardware colours */}
        {hwcRows.length > 0 && (
          <div style={{ padding: '3rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
                color: '#5c5a57', textTransform: 'uppercase', marginBottom: '8px',
              }}>Hardware Finishes · {hwcRows.length} options</p>
              <h3 style={{
                fontFamily: 'var(--font-bebas)', fontSize: 'clamp(28px, 3vw, 44px)',
                letterSpacing: '2px', color: '#c8a96e', lineHeight: 1,
              }}>Hardware Colours</h3>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1px', background: 'rgba(255,255,255,0.06)',
            }}>
              {hwcRows.map(row => {
                const { code, name } = swatchLabel(row.display_name)
                return (
                  <div key={row.id} style={{ background: '#161616' }}>
                    <div
                      title={row.metadata?.hex_note ?? undefined}
                      style={{ height: '100px', background: swatchBg(row) }}
                    />
                    <div style={{ padding: '12px 14px' }}>
                      {code && <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px', letterSpacing: '2px', color: '#c8a96e', lineHeight: 1, marginBottom: '3px' }}>{code}</div>}
                      <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#9e9b96', lineHeight: 1.4 }}>{name}</div>
                      {row.metadata?.pattern && (
                        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#3a3835', marginTop: '6px' }}>
                          {row.metadata.pattern}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Custom shop colours */}
        {cscRows.length > 0 && (
          <div style={{ padding: '3rem 4rem' }}>
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
                color: '#5c5a57', textTransform: 'uppercase', marginBottom: '8px',
              }}>Custom Shop · {cscRows.length} options</p>
              <h3 style={{
                fontFamily: 'var(--font-bebas)', fontSize: 'clamp(28px, 3vw, 44px)',
                letterSpacing: '2px', color: '#9e9b96', lineHeight: 1,
              }}>Custom Shop Colours</h3>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1px', background: 'rgba(255,255,255,0.06)',
            }}>
              {cscRows.map(row => {
                const { code, name } = swatchLabel(row.display_name)
                return (
                  <div key={row.id} style={{ background: '#161616' }}>
                    <div
                      title={row.metadata?.hex_note ?? undefined}
                      style={{ height: '100px', background: swatchBg(row) }}
                    />
                    <div style={{ padding: '12px 14px' }}>
                      {code && <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px', letterSpacing: '2px', color: '#9e9b96', lineHeight: 1, marginBottom: '3px' }}>{code}</div>}
                      <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#9e9b96', lineHeight: 1.4 }}>{name}</div>
                      {row.metadata?.aka && (
                        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#5c5a57', marginTop: '4px' }}>
                          {row.metadata.aka}
                        </div>
                      )}
                      {row.metadata?.pattern && (
                        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#3a3835', marginTop: '6px' }}>
                          {row.metadata.pattern}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Custom shop pickup colours */}
        {cpkcRows.length > 0 && (
          <div style={{ padding: '3rem 4rem' }}>
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
                color: '#5c5a57', textTransform: 'uppercase', marginBottom: '8px',
              }}>Custom Shop · {cpkcRows.length} options</p>
              <h3 style={{
                fontFamily: 'var(--font-bebas)', fontSize: 'clamp(28px, 3vw, 44px)',
                letterSpacing: '2px', color: '#9e9b96', lineHeight: 1,
              }}>Custom Shop Pickup Colours</h3>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '1px', background: 'rgba(255,255,255,0.06)',
            }}>
              {cpkcRows.map(row => {
                const { code, name } = swatchLabel(row.display_name)
                return (
                  <div key={row.id} style={{ background: '#161616' }}>
                    <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HumbuckerIcon row={row} />
                    </div>
                    <div style={{ padding: '10px 14px' }}>
                      {code && <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px', letterSpacing: '2px', color: '#9e9b96', lineHeight: 1, marginBottom: '3px' }}>{code}</div>}
                      <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#9e9b96', lineHeight: 1.4 }}>{name}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </section>
    </>
  )
}
