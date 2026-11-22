import { existsSync } from 'node:fs'
import path from 'node:path'
import { readPickupSvg, injectPickupColors } from '@/lib/pickup-svg'

// Special-size tiles (the standard width is set in ModelCard). The JR4 picture is wider than the
// others — 417x600 — so its tile is widened to show it whole at the standard tile height.
const MODEL_TILE_WIDTHS: Record<string, number> = {
  'jr4': 470,
}

// Tile background art lives in public/model-tiles/<model-slug>.jpg — a model gets one by
// having a file there; models without one keep the plain tile.
function modelTileImage(slug: string): string | null {
  return existsSync(path.join(process.cwd(), 'public', 'model-tiles', `${slug}.jpg`))
    ? `/model-tiles/${slug}.jpg`
    : null
}

const MODEL_NICKNAMES: Record<string, string> = {
  'SF-1': 'Streetfighter',
  'SF-3': 'Streetfighter',
}

const BASS_SERIES_ID = 'SER-0004' // Nemesis

import { DECK_CSS } from '@/lib/deck-css'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Metadata } from 'next'
import Link from 'next/link'
import ModelCard from '@/components/ModelCard'
import { monoLabel } from '@/lib/text-styles'

export const metadata: Metadata = {
  title: 'Model Guide — Maverick Guitars Registry',
  description: 'The complete Maverick Guitars model catalogue — 24 models across the Evolution, Century, D-Tox and Nemesis series.',
}

const subNav = [
  { href: '#range',   label: 'Model Guide' },
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
    tile_synopsis: string | null
    rarity: string | null
    series: string | null
    display_order: number | null
  }
  const [{ data: rawSpecRows }, { data: rawCounts }, { data: rawColours }, { data: rawSourceColours }] = await Promise.all([
    supabase
      .from('model_specifications')
      .select('id, model, parent_model_id, description, tile_synopsis, rarity, series, display_order')
      .is('parent_model_id', null)
      .order('display_order'),
    supabase
      .from('guitars')
      .select('model_id')
      .eq('status', 'Approved'),
    supabase
      .from('ref_values')
      .select('id, category, display_name, descriptor, metadata, sort_order')
      .in('category', ['COL', 'CSC', 'HWC', 'PKC', 'CPKC', 'BNC', 'FMC', 'SER'])
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('model_source_colours')
      .select('available_colours, source_materials(year)'),
  ])

  const specRows = (rawSpecRows ?? []) as SpecRow[]

  // Only show rarity once ≥ 3 approved guitars exist for the model, keyed by model_id UUID
  const registryCountByModel = new Map<string, number>()
  for (const row of (rawCounts ?? []) as { model_id: string | null }[]) {
    if (!row.model_id) continue
    registryCountByModel.set(row.model_id, (registryCountByModel.get(row.model_id) ?? 0) + 1)
  }

  const colourRows = (rawColours ?? []) as ColourRow[]
  const seriesRows = colourRows.filter(r => r.category === 'SER')
  const seriesLabelById = new Map(seriesRows.map(r => [r.id, r.display_name]))
  const cscRows  = colourRows.filter(r => r.category === 'CSC'  && r.id !== 'CSC-0004')
  const hwcRows  = colourRows.filter(r => r.category === 'HWC'  && r.id !== 'HWC-0004')
  const pkcRows  = colourRows.filter(r => r.category === 'PKC'  && r.id !== 'PKC-0005')
  const cpkcRows = colourRows.filter(r => r.category === 'CPKC' && r.id !== 'CPKC-0005')
  const bncRows  = colourRows.filter(r => r.category === 'BNC'  && r.id !== 'BNC-0004')
  const fmcRows  = colourRows.filter(r => r.category === 'FMC'  && r.id !== 'FMC-0005')

  // Group factory body colours by model year from model_source_colours — dynamic, no hardcoded years
  type SourceColourEntry = { available_colours: string[]; source_materials: { year: string | null } | null }
  const yearToColourIds = new Map<string, Set<string>>()
  for (const row of (rawSourceColours ?? []) as SourceColourEntry[]) {
    const year = row.source_materials?.year
    if (!year) continue
    const existing = yearToColourIds.get(year) ?? new Set<string>()
    for (const id of (row.available_colours ?? [])) existing.add(id)
    yearToColourIds.set(year, existing)
  }
  const sortedColourYears = [...yearToColourIds.keys()].sort()
  const colByYear = new Map(
    sortedColourYears.map(year => [
      year,
      colourRows.filter(r => r.category === 'COL' && (yearToColourIds.get(year)?.has(r.id) ?? false)),
    ])
  )

  const electricSeries = seriesRows.filter(r => r.id !== BASS_SERIES_ID).map(r => r.id)
  const bassSeries = seriesRows.filter(r => r.id === BASS_SERIES_ID).map(r => r.id)

  function seriesModels(seriesId: string) {
    return specRows.filter(m => m.series === seriesId)
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

  function pickupSwatchHtml(row: ColourRow): string {
    const style = row.metadata?.style ?? 'covered'
    const primary = row.metadata?.hex_primary ?? '#1e1c1a'
    const secondary = row.metadata?.hex_secondary ?? undefined
    const filename =
      style === 'active'    ? 'pkp-0005-active' :
      style === 'open_coil' ? 'pkp-0001-a-type-open-bridge' :
                              'pkp-0001-a-type-nickel-bridge'
    try {
      return injectPickupColors(readPickupSvg(filename), primary, secondary, style)
    } catch {
      return ''
    }
  }

  function SeriesSection({ series, bass = false }: { series: string; bass?: boolean }) {
    const models = seriesModels(series)
    const seriesLabel = seriesLabelById.get(series) ?? series
    const accentColor = bass ? '#9e9b96' : '#c8a96e'

    return (
      <section style={{
        padding: '3rem 4rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{
            ...monoLabel('11px', '3px'),
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
            {seriesLabel}
          </h2>
        </div>

        <div className="model-deck" style={{ ['--deck-n' as string]: models.length }}>
          {models.map((m, index) => {
            const rarity = (registryCountByModel.get(m.id) ?? 0) >= 3 ? m.rarity : null
            return (
              <ModelCard
                key={m.model}
                index={index}
                model={m.model}
                nickname={MODEL_NICKNAMES[m.model]}
                description={m.tile_synopsis}
                rarity={rarity ?? null}
                slug={m.model.toLowerCase().replace(/\s+/g, '-')}
                image={modelTileImage(m.model.toLowerCase().replace(/\s+/g, '-'))}
                width={MODEL_TILE_WIDTHS[m.model.toLowerCase().replace(/\s+/g, '-')]}
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
      <style>{DECK_CSS}</style>
      {/* Header */}
      <section id="range" style={{ scrollMarginTop: '56px' }} />{/* anchor target at top */}
      <section style={{
        padding: '6rem 4rem 2.5rem',
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
            ...monoLabel('11px', '3px'),
            color: '#c8a96e', textTransform: 'uppercase', marginBottom: '16px',
          }}>
            Model Guide
          </p>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(52px, 7vw, 96px)',
            letterSpacing: '3px', lineHeight: 0.92,
            color: '#f0ede8', marginBottom: 0,
          }}>
            THE RANGE
          </h1>
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
          ...monoLabel('11px', '3px'),
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
              ...monoLabel('11px', '3px'),
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

        {/* Factory colours — dynamic by model year */}
        {sortedColourYears.map(year => {
          const colours = colByYear.get(year) ?? []
          if (!colours.length) return null
          return (
            <div key={year} style={{ padding: '3rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ marginBottom: '24px' }}>
                <p style={{
                  ...monoLabel('11px', '3px'),
                  color: '#5c5a57', textTransform: 'uppercase', marginBottom: '8px',
                }}>Factory Colours · {colours.length} colours</p>
                <h3 style={{
                  fontFamily: 'var(--font-bebas)', fontSize: 'clamp(28px, 3vw, 44px)',
                  letterSpacing: '2px', color: '#c8a96e', lineHeight: 1,
                }}>{year}</h3>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1px', background: 'rgba(255,255,255,0.06)',
              }}>
                {colours.map(row => {
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
                          <div style={{ ...monoLabel('9px', '1px'), textTransform: 'uppercase', color: '#3a3835', marginTop: '6px' }}>
                            {row.metadata.pattern}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Factory pickup colours */}
        {pkcRows.length > 0 && (
          <div style={{ padding: '3rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                ...monoLabel('11px', '3px'),
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
                    <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      dangerouslySetInnerHTML={{ __html: pickupSwatchHtml(row) }}
                    />
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
                ...monoLabel('11px', '3px'),
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
                        <div style={{ ...monoLabel('9px', '1px'), textTransform: 'uppercase', color: '#3a3835', marginTop: '6px' }}>
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

        {/* Binding colours */}
        {bncRows.length > 0 && (
          <div style={{ padding: '3rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                ...monoLabel('11px', '3px'),
                color: '#5c5a57', textTransform: 'uppercase', marginBottom: '8px',
              }}>Binding · {bncRows.length} options</p>
              <h3 style={{
                fontFamily: 'var(--font-bebas)', fontSize: 'clamp(28px, 3vw, 44px)',
                letterSpacing: '2px', color: '#c8a96e', lineHeight: 1,
              }}>Binding Colours</h3>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1px', background: 'rgba(255,255,255,0.06)',
            }}>
              {bncRows.map(row => {
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
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Fretboard marker colours */}
        {fmcRows.length > 0 && (
          <div style={{ padding: '3rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                ...monoLabel('11px', '3px'),
                color: '#5c5a57', textTransform: 'uppercase', marginBottom: '8px',
              }}>Fretboard Markers · {fmcRows.length} options</p>
              <h3 style={{
                fontFamily: 'var(--font-bebas)', fontSize: 'clamp(28px, 3vw, 44px)',
                letterSpacing: '2px', color: '#c8a96e', lineHeight: 1,
              }}>Fretboard Marker Colours</h3>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1px', background: 'rgba(255,255,255,0.06)',
            }}>
              {fmcRows.map(row => {
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
                ...monoLabel('11px', '3px'),
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
                        <div style={{ ...monoLabel('9px', '1px'), textTransform: 'uppercase', color: '#3a3835', marginTop: '6px' }}>
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
                ...monoLabel('11px', '3px'),
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
                    <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      dangerouslySetInnerHTML={{ __html: pickupSwatchHtml(row) }}
                    />
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
