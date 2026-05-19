import { MODEL_CATALOGUE, SERIES_ORDER, BASS_SERIES, STANDARD_SPEC_KEYS } from '@/data/models'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Model Guide — Maverick Guitars Registry',
  description: 'The complete Maverick Guitars model catalogue — all 22 models across the F, X, Species, Chaos, Streetfighter, Matrix, G and B series.',
}

const STANDALONE_SERIES = ['X-Treme', 'Streetfighter', 'Matrix']

const subNav = [
  { href: '#range', label: 'Model Guide' },
  { href: '#identify', label: 'Generation Guide' },
]

export default async function ModelsPage() {
  const supabase = await createSupabaseServerClient()

  type SpecRow = {
    id: string
    model: string
    body_shape_analogue: string | null
    body_wood: string | null
    pickup_configuration: string | null
    bridge_type: string | null
    headstock_style: string | null
    fret_count: string | null
    fretboard_wood: string | null
    potentiometers: string | null
    switch_type: string | null
    description: string | null
    rarity: string | null
  }
  type CatalogueRow = {
    model_id: string
    body_shape_analogue: string | null
    body_wood: string | null
    pickup_configuration: string | null
    bridge_type: string | null
    headstock_style: string | null
    fret_count: string | null
    fretboard_wood: string | null
    potentiometers: string | null
    switch_type: string | null
  }
  type ShapeRow = { model: string; body_shape_analogue: string | null; headstock_style: string | null }

  const [{ data: rawSpecRows }, { data: rawCatalogueRows }, { data: rawShapeRows }, { data: rawCounts }] = await Promise.all([
    supabase
      .from('model_specifications')
      .select('id, model, body_shape_analogue, body_wood, pickup_configuration, bridge_type, headstock_style, fret_count, fretboard_wood, potentiometers, switch_type, description, rarity'),
    supabase
      .from('catalogue_models')
      .select('model_id, body_shape_analogue, body_wood, pickup_configuration, bridge_type, headstock_style, fret_count, fretboard_wood, potentiometers, switch_type')
      .order('catalogue_year', { ascending: false }),
    supabase
      .from('model_shape_registry')
      .select('model, body_shape_analogue, headstock_style'),
    supabase
      .from('guitars')
      .select('model_id')
      .eq('status', 'Approved'),
  ])

  const specByModel = new Map<string, SpecRow>()
  for (const row of (rawSpecRows ?? []) as SpecRow[]) {
    specByModel.set(row.model, row)
  }

  // catalogue_models: keep only the most recent row per model as fallback, keyed by model_id UUID
  const catalogueByModel = new Map<string, CatalogueRow>()
  for (const row of (rawCatalogueRows ?? []) as CatalogueRow[]) {
    if (!catalogueByModel.has(row.model_id)) catalogueByModel.set(row.model_id, row)
  }

  const shapeByModel = new Map<string, ShapeRow>()
  for (const row of (rawShapeRows ?? []) as ShapeRow[]) {
    shapeByModel.set(row.model, row)
  }

  // Only show rarity once ≥ 3 approved guitars exist for the model, keyed by model_id UUID
  const registryCountByModel = new Map<string, number>()
  for (const row of (rawCounts ?? []) as { model_id: string | null }[]) {
    if (!row.model_id) continue
    registryCountByModel.set(row.model_id, (registryCountByModel.get(row.model_id) ?? 0) + 1)
  }

  function normaliseHeadstock(raw: string): string {
    const val = raw.toLowerCase()
    if (val === '6-aside') return 'Standard 6-aside'
    if (val === '6-aside reversed') return 'Reverse 6-aside'
    return raw
  }

  const SPEC_FIELD_MAP: Record<string, keyof CatalogueRow> = {
    'Body style':    'body_shape_analogue',
    'Body wood':     'body_wood',
    'Pickup config': 'pickup_configuration',
    'Bridge':        'bridge_type',
    'Headstock':     'headstock_style',
    'Frets':         'fret_count',
    'Fretboard':     'fretboard_wood',
    'Potentiometers':'potentiometers',
    'Switch':        'switch_type',
  }

  function getSpec(modelName: string, key: string, staticSpecs: { key: string; value: string }[]): string | null {
    const spec  = specByModel.get(modelName)
    const cat   = catalogueByModel.get(spec?.id ?? '')
    const shape = shapeByModel.get(modelName)
    const field = SPEC_FIELD_MAP[key]

    let raw: string | null = null
    if (key === 'Body style') {
      // Priority: model_shape_registry → model_specifications → catalogue_models → static
      raw = shape?.body_shape_analogue
        ?? spec?.body_shape_analogue
        ?? cat?.body_shape_analogue
        ?? staticSpecs.find(s => s.key === key)?.value
        ?? null
    } else if (key === 'Headstock') {
      raw = shape?.headstock_style
        ?? spec?.headstock_style
        ?? cat?.headstock_style
        ?? staticSpecs.find(s => s.key === key)?.value
        ?? null
    } else {
      raw = (field && spec ? (spec[field] as string | null) : null)
        ?? (field && cat  ? (cat[field]  as string | null) : null)
        ?? staticSpecs.find(s => s.key === key)?.value
        ?? null
    }
    if (key === 'Headstock' && raw) return normaliseHeadstock(raw)
    return raw
  }

  const electricSeries = SERIES_ORDER.filter(s => !BASS_SERIES.includes(s))
  const bassSeries = SERIES_ORDER.filter(s => BASS_SERIES.includes(s))

  function seriesModels(series: string) {
    return MODEL_CATALOGUE.filter(m => m.series === series)
  }

  function SeriesSection({ series, bass = false }: { series: string; bass?: boolean }) {
    const models = seriesModels(series)
    const isStandalone = STANDALONE_SERIES.includes(series)
    const accentColor = bass ? '#9e9b96' : '#c8a96e'

    return (
      <section style={{
        padding: isStandalone ? '3rem 4rem' : '5rem 4rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ marginBottom: '28px' }}>
          <p style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
            color: '#5c5a57', textTransform: 'uppercase', marginBottom: '8px',
          }}>
            {models.length} {models.length === 1 ? 'model' : 'models'}
          </p>
          <h2 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: isStandalone ? 'clamp(28px, 3vw, 42px)' : 'clamp(32px, 4vw, 52px)',
            letterSpacing: '2px', lineHeight: 1,
            color: accentColor,
          }}>
            {series}
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1px',
          background: 'rgba(255,255,255,0.06)',
        }}>
          {models.map(m => {
            const spec = specByModel.get(m.model)
            const description = spec?.description ?? m.description
            const rarityRaw = spec?.rarity ?? m.rarity
            const rarity = (registryCountByModel.get(spec?.id ?? '') ?? 0) >= 3 ? rarityRaw : null
            return (
            <div key={m.model} style={{ background: '#161616', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '52px',
                color: accentColor,
                letterSpacing: '3px',
                lineHeight: 1,
                marginBottom: '8px',
              }}>
                {m.model}
              </div>

              {rarity && (
                <div style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-dm-mono)', fontSize: '10px',
                  letterSpacing: '1.5px', textTransform: 'uppercase',
                  color: bass ? '#5c5a57' : '#8b6e3f',
                  background: bass ? 'rgba(255,255,255,0.04)' : 'rgba(200,169,110,0.08)',
                  padding: '3px 8px', marginBottom: '8px',
                }}>
                  {rarity}
                </div>
              )}

              <p style={{
                fontSize: '13px', color: '#9e9b96', lineHeight: 1.6,
                marginTop: '12px', marginBottom: '0',
              }}>
                {description}
              </p>

              <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                {STANDARD_SPEC_KEYS.map(key => {
                  const value = getSpec(m.model, key, m.specs)
                  const isUnknown = !value
                  return (
                    <div key={key} style={{
                      display: 'flex', justifyContent: 'space-between', gap: '12px',
                      fontFamily: 'var(--font-dm-mono)', fontSize: '12px',
                      padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <span style={{ color: '#5c5a57', flexShrink: 0 }}>{key}</span>
                      <span style={{ color: isUnknown ? '#3a3835' : '#f0ede8', textAlign: 'right' }}>
                        {value ?? 'Unknown'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
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
            Maverick produced a focused range of rock and metal-oriented electric guitars and basses,
            all British-designed and manufactured in Korea in collaboration with hardware
            designer Trev Wilkinson. 22 models across 9 series.
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
          Maverick extended the range into bass guitars across two catalogue years.
          The B1 appeared in the 2001 catalogue; the S4 and S5 followed in 2002.
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
              This guide reflects what the registry has established to date — it sharpens as more examples are documented.
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
                A plastic ring or frame surrounds the pickup. Primary marker for Gen 2 in the registry.
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
              gen2: 'Present — plastic surrounds visible around each pickup housing',
            },
            {
              label: 'Catalogue evidence', confidence: 'Confirmed' as const,
              gen1: '2001 and 2002 catalogues both show Gen 1 spec throughout',
              gen2: 'Not yet catalogue-confirmed — based on physical examples',
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
                body: 'Gen 1 F2 examples carry a ~1° neck pitch requiring ~8mm body packing — PRS-equivalent geometry producing exceptionally low action. All known F2 examples are Transparent Red. Any other colour would be significant.',
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
    </>
  )
}
