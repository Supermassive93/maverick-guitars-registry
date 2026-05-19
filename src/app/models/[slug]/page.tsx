import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getRefValues, r } from '@/lib/ref-values'
import type { ModelSpec, CatalogueModel } from '@/lib/types'

export const revalidate = 60

type ColourMeta = {
  hex?: string | null
  hex_primary?: string | null
  hex_secondary?: string | null
  pattern?: string | null
}

function swatchBg(refId: string, meta: ColourMeta | null): string | null {
  if (!meta) return null
  const { hex, hex_primary, hex_secondary, pattern } = meta
  if (pattern === 'Striped' && hex_primary && hex_secondary)
    return `repeating-linear-gradient(0deg, ${hex_primary} 0px, ${hex_primary} 10px, ${hex_secondary} 10px, ${hex_secondary} 20px)`
  if (pattern === 'Burst' && hex) {
    const centre = refId === 'COL-0013' ? '#C4903C' : '#F0C030'
    return `radial-gradient(ellipse at center, ${centre} 0%, ${hex} 72%)`
  }
  if (pattern === 'Natural Grain' && hex)
    return `repeating-linear-gradient(92deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 7px), ${hex}`
  if (pattern === 'Gloss Metallic' && hex)
    return `linear-gradient(135deg, rgba(255,255,255,0.20) 0%, transparent 50%, rgba(255,255,255,0.06) 100%), ${hex}`
  return hex ?? null
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null
  return (
    <div style={{
      display: 'flex', gap: '16px', padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '14px',
    }}>
      <span style={{ color: '#5c5a57', width: '200px', flexShrink: 0, fontFamily: 'var(--font-dm-mono)', fontSize: '12px' }}>
        {label}
      </span>
      <span style={{ color: '#f0ede8' }}>{String(value)}</span>
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data: spec } = await supabase
    .from('model_specifications')
    .select('model, description')
    .eq('model', slug.toUpperCase())
    .single()
  if (!spec) return { title: 'Model Not Found — Maverick Guitars Registry' }
  return {
    title: `${spec.model} — Maverick Guitars Registry`,
    description: spec.description ?? `Maverick ${spec.model} — full specification, available colours, and registry data.`,
  }
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const modelName = slug.toUpperCase()

  const { data: specRaw } = await supabase
    .from('model_specifications')
    .select('*')
    .eq('model', modelName)
    .single()

  if (!specRaw) notFound()
  const spec = specRaw as ModelSpec

  const parentSpecPromise = spec.parent_model_id
    ? supabase.from('model_specifications').select('id, model').eq('id', spec.parent_model_id).single()
    : Promise.resolve({ data: null })

  const [
    refMap,
    { data: rawVariants },
    { data: rawCatalogueRows },
    { data: rawRegistry },
    { data: rawColourMeta },
    { data: parentSpecData },
  ] = await Promise.all([
    getRefValues(),
    supabase.from('model_specifications').select('*').eq('parent_model_id', spec.id),
    supabase.from('catalogue_models').select('*').eq('model_id', spec.id).order('catalogue_year'),
    supabase.from('guitars').select('serial_number_only').eq('model_id', spec.id).eq('status', 'Approved'),
    supabase.from('ref_values').select('id, metadata').in('category', ['COL', 'CSC']).eq('is_active', true),
    parentSpecPromise,
  ])

  const colourMetaMap: Record<string, ColourMeta> = {}
  for (const row of (rawColourMeta ?? []) as { id: string; metadata: ColourMeta | null }[]) {
    colourMetaMap[row.id] = row.metadata ?? {}
  }

  const variants = (rawVariants ?? []) as ModelSpec[]
  const catalogueRows = (rawCatalogueRows ?? []) as CatalogueModel[]
  const parentSpec = parentSpecData as { id: string; model: string } | null

  const serials = (rawRegistry ?? [])
    .map((g: { serial_number_only: number | null }) => g.serial_number_only)
    .filter((n): n is number => n != null)
  const registeredCount = rawRegistry?.length ?? 0
  const serialMin = serials.length ? Math.min(...serials) : null
  const serialMax = serials.length ? Math.max(...serials) : null

  const seriesLabel = r(refMap, spec.series)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      {/* Back nav */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/models"
          className="link-muted"
          style={{ fontSize: '13px', fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.5px' }}
        >
          ← Model Guide
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {seriesLabel && (
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px', color: '#c8a96e', textTransform: 'uppercase' }}>
              {seriesLabel}
            </span>
          )}
          {parentSpec && (
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57' }}>
              HT variant of{' '}
              <Link href={`/models/${parentSpec.model.toLowerCase()}`} style={{ color: '#9e9b96' }}>
                {parentSpec.model}
              </Link>
            </span>
          )}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(3rem, 8vw, 5rem)',
          letterSpacing: '3px', color: '#f0ede8', lineHeight: 1,
          marginBottom: '16px',
        }}>
          {spec.model}
        </h1>

        {spec.rarity && (
          <div style={{
            display: 'inline-block',
            fontFamily: 'var(--font-dm-mono)', fontSize: '10px',
            letterSpacing: '1.5px', textTransform: 'uppercase',
            color: '#8b6e3f', background: 'rgba(200,169,110,0.08)',
            padding: '3px 8px', marginBottom: '16px',
          }}>
            {spec.rarity}
          </div>
        )}

        {spec.description && (
          <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.7, maxWidth: '680px', marginTop: '8px' }}>
            {spec.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Left — Full specification */}
        <div>
          <p style={{
            fontSize: '10px', fontFamily: 'var(--font-dm-mono)', color: '#5c5a57',
            letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px',
          }}>
            Specification
          </p>
          <Field label="Body shape"           value={r(refMap, spec.body_shape_analogue)} />
          <Field label="Body wood"            value={r(refMap, spec.body_wood)} />
          <Field label="Body construction"    value={r(refMap, spec.body_construction)} />
          <Field label="Pickup configuration" value={r(refMap, spec.pickup_configuration)} />
          <Field label="Bridge"               value={r(refMap, spec.bridge_type)} />
          <Field label="Scale length"         value={r(refMap, spec.scale_length)} />
          <Field label="Neck construction"    value={r(refMap, spec.neck_construction)} />
          <Field label="Neck wood"            value={r(refMap, spec.neck_wood)} />
          <Field label="Neck profile"         value={r(refMap, spec.neck_profile)} />
          <Field label="Fretboard"            value={r(refMap, spec.fretboard_wood)} />
          <Field label="Fret count"           value={r(refMap, spec.fret_count)} />
          <Field label="Switch"               value={r(refMap, spec.switch_type)} />
          <Field label="Potentiometers"       value={r(refMap, spec.potentiometers)} />
          <Field label="Left handed"          value={r(refMap, spec.left_handed_available)} />
          <Field label="Serial prefix"        value={spec.serial_prefix} />
          {spec.original_rrp != null && (
            <Field label="Original RRP"       value={`£${spec.original_rrp}`} />
          )}

          {spec.notes && (
            <div style={{
              marginTop: '24px', padding: '16px',
              background: '#161616', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <p style={{ fontSize: '10px', fontFamily: 'var(--font-dm-mono)', color: '#5c5a57', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Notes
              </p>
              <p style={{ color: '#9e9b96', fontSize: '14px', lineHeight: 1.6 }}>{spec.notes}</p>
            </div>
          )}
        </div>

        {/* Right — Catalogue by year + registry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Catalogue by year */}
          {catalogueRows.length > 0 && (
            <div>
              <p style={{
                fontSize: '10px', fontFamily: 'var(--font-dm-mono)', color: '#5c5a57',
                letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px',
              }}>
                By Year
              </p>
              {catalogueRows.map(row => (
                <div key={row.id} style={{
                  marginBottom: '20px', paddingBottom: '20px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '12px',
                    color: '#c8a96e', letterSpacing: '1px', marginBottom: '10px',
                  }}>
                    {r(refMap, row.catalogue_year) ?? row.catalogue_year}
                  </p>

                  {row.original_rrp != null && (
                    <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#5c5a57', marginBottom: '10px' }}>
                      RRP £{row.original_rrp}
                    </p>
                  )}

                  {row.available_colours && row.available_colours.length > 0 && (
                    <div>
                      <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#5c5a57', letterSpacing: '1px', marginBottom: '8px' }}>
                        Available colours
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {row.available_colours.map(colId => {
                          const name = r(refMap, colId) ?? colId
                          const parts = name.split(' — ')
                          const code = parts.length >= 2 ? parts[0] : name
                          const bg = swatchBg(colId, colourMetaMap[colId] ?? null)
                          return (
                            <div key={colId} style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title={name}>
                              <div style={{
                                width: '14px', height: '14px', flexShrink: 0,
                                background: bg ?? 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                              }} />
                              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#9e9b96' }}>
                                {code}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Registry stats */}
          <div>
            <p style={{
              fontSize: '10px', fontFamily: 'var(--font-dm-mono)', color: '#5c5a57',
              letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px',
            }}>
              Registry
            </p>
            <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-bebas)', fontSize: '56px', color: '#c8a96e', lineHeight: 1 }}>
                  {registeredCount}
                </p>
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', letterSpacing: '1px' }}>
                  Registered
                </p>
              </div>
              {serialMin != null && serialMax != null && serialMin !== serialMax && (
                <div style={{ paddingBottom: '4px' }}>
                  <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '15px', color: '#f0ede8' }}>
                    {serialMin} — {serialMax}
                  </p>
                  <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', letterSpacing: '1px' }}>
                    Serial range
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* HT Variants */}
      {variants.length > 0 && (
        <div style={{ marginTop: '48px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{
            fontSize: '10px', fontFamily: 'var(--font-dm-mono)', color: '#5c5a57',
            letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px',
          }}>
            HT Variants
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
            {variants.map(v => (
              <Link
                key={v.id}
                href={`/models/${v.model.toLowerCase()}`}
                style={{
                  flex: '0 0 auto', minWidth: '240px', background: '#161616',
                  padding: '24px', textDecoration: 'none', display: 'block',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-dm-mono)', fontSize: '9px',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  color: '#8b6e3f', background: 'rgba(200,169,110,0.08)',
                  padding: '2px 6px', display: 'inline-block', marginBottom: '10px',
                }}>
                  HT Variant
                </span>
                <p style={{
                  fontFamily: 'var(--font-bebas)', fontSize: '36px',
                  color: '#c8a96e', letterSpacing: '2px', lineHeight: 1, marginBottom: '12px',
                }}>
                  {v.model}
                </p>
                <Field label="Bridge" value={r(refMap, v.bridge_type)} />
                {v.description && (
                  <p style={{ color: '#9e9b96', fontSize: '13px', lineHeight: 1.6, marginTop: '12px' }}>
                    {v.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
