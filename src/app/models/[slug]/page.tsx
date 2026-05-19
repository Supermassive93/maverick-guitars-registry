import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getRefValues, r } from '@/lib/ref-values'
import type { ModelSpec, ModelGenSpec } from '@/lib/types'

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

// Always renders — shows "—" for null so every field is visible for review
function SpecRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  const hasValue = value !== null && value !== undefined && value !== ''
  return (
    <div style={{
      display: 'flex', gap: '16px', padding: '8px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px',
    }}>
      <span style={{ color: '#5c5a57', width: '180px', flexShrink: 0, fontFamily: 'var(--font-dm-mono)', fontSize: '11px' }}>
        {label}
      </span>
      <span style={{ color: hasValue ? '#f0ede8' : '#2e2d2b' }}>{hasValue ? String(value) : '—'}</span>
    </div>
  )
}

// Section header within a spec block
function SpecGroup({ label }: { label: string }) {
  return (
    <p style={{
      fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '2px',
      textTransform: 'uppercase', color: '#3a3835',
      marginTop: '16px', marginBottom: '4px',
    }}>
      {label}
    </p>
  )
}

function ColourSwatches({ colours, colourMetaMap, refMap }: {
  colours: string[]
  colourMetaMap: Record<string, ColourMeta>
  refMap: Record<string, string>
}) {
  if (!colours.length) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}>
      {colours.map(colId => {
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
  )
}

// Full spec block — same field list for both universal and gen rows
function SpecBlock({
  spec,
  refMap,
  colourMetaMap,
  isGenRow = false,
}: {
  spec: Partial<ModelSpec & ModelGenSpec>
  refMap: Record<string, string>
  colourMetaMap: Record<string, ColourMeta>
  isGenRow?: boolean
}) {
  return (
    <div>
      {isGenRow && spec.available_colours && spec.available_colours.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#3a3835', marginBottom: '8px' }}>
            Available colours
          </p>
          <ColourSwatches colours={spec.available_colours} colourMetaMap={colourMetaMap} refMap={refMap} />
        </div>
      )}

      {isGenRow && (
        <SpecRow label="Original RRP" value={spec.original_rrp != null ? `£${spec.original_rrp}` : null} />
      )}

      <SpecGroup label="Body" />
      <SpecRow label="Body shape"           value={r(refMap, spec.body_shape_analogue)} />
      <SpecRow label="Body wood"            value={r(refMap, spec.body_wood)} />
      <SpecRow label="Body construction"    value={r(refMap, spec.body_construction)} />

      <SpecGroup label="Pickups & electronics" />
      <SpecRow label="Pickup configuration" value={r(refMap, spec.pickup_configuration)} />
      <SpecRow label="Switch type"          value={r(refMap, spec.switch_type)} />
      <SpecRow label="Switch knob"          value={r(refMap, spec.switch_knob)} />
      <SpecRow label="Potentiometers"       value={r(refMap, spec.potentiometers)} />
      <SpecRow label="Pickup surrounds"     value={r(refMap, spec.pickup_surrounds)} />
      <SpecRow label="Pickup colours"       value={r(refMap, spec.pickup_colours)} />

      <SpecGroup label="Hardware" />
      <SpecRow label="Bridge"               value={r(refMap, spec.bridge_type)} />
      <SpecRow label="Hardware colour"      value={r(refMap, spec.hardware_colour)} />
      <SpecRow label="Tuner style"          value={r(refMap, spec.tuner_style)} />

      <SpecGroup label="Neck" />
      <SpecRow label="Neck construction"    value={r(refMap, spec.neck_construction)} />
      <SpecRow label="Neck wood"            value={r(refMap, spec.neck_wood)} />
      <SpecRow label="Neck profile"         value={r(refMap, spec.neck_profile)} />
      <SpecRow label="Fretboard"            value={r(refMap, spec.fretboard_wood)} />
      <SpecRow label="Fret count"           value={r(refMap, spec.fret_count)} />
      <SpecRow label="Scale length"         value={r(refMap, spec.scale_length)} />
      <SpecRow label="Neck binding"         value={r(refMap, spec.neck_binding)} />
      <SpecRow label="Skunk stripe"         value={r(refMap, spec.skunk_stripe)} />
      <SpecRow label="Nut type"             value={r(refMap, spec.nut_type)} />

      <SpecGroup label="Headstock" />
      <SpecRow label="Headstock style"      value={r(refMap, spec.headstock_style)} />
      <SpecRow label="Headstock face"       value={r(refMap, spec.headstock_face)} />
      <SpecRow label="Headstock logo"       value={r(refMap, spec.headstock_logo)} />

      <SpecGroup label="Other" />
      <SpecRow label="Left handed"          value={r(refMap, spec.left_handed_available)} />
      {!isGenRow && <SpecRow label="Serial prefix" value={(spec as ModelSpec).serial_prefix} />}
      {!isGenRow && spec.original_rrp != null && (
        <SpecRow label="Original RRP" value={`£${spec.original_rrp}`} />
      )}
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase
    .from('model_specifications')
    .select('model, description')
    .eq('model', slug.toUpperCase())
    .single()
  const spec = data as Pick<ModelSpec, 'model' | 'description'> | null
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
    { data: rawGenSpecs },
    { data: rawRegistry },
    { data: rawColourMeta },
    { data: parentSpecData },
  ] = await Promise.all([
    getRefValues(),
    supabase.from('model_specifications').select('*').eq('parent_model_id', spec.id),
    supabase.from('model_gen_specs').select('*').eq('model_id', spec.id).order('generation'),
    supabase.from('guitars').select('serial_number_only').eq('model_id', spec.id).eq('status', 'Approved'),
    supabase.from('ref_values').select('id, metadata').in('category', ['COL', 'CSC']).eq('is_active', true),
    parentSpecPromise,
  ])

  const colourMetaMap: Record<string, ColourMeta> = {}
  for (const row of (rawColourMeta ?? []) as { id: string; metadata: ColourMeta | null }[]) {
    colourMetaMap[row.id] = row.metadata ?? {}
  }

  const variants = (rawVariants ?? []) as ModelSpec[]
  const genSpecs = (rawGenSpecs ?? []) as ModelGenSpec[]
  const parentSpec = parentSpecData as { id: string; model: string } | null

  const serials = (rawRegistry ?? [])
    .map((g: { serial_number_only: number | null }) => g.serial_number_only)
    .filter((n): n is number => n != null)
  const registeredCount = rawRegistry?.length ?? 0
  const serialMin = serials.length ? Math.min(...serials) : null
  const serialMax = serials.length ? Math.max(...serials) : null

  const seriesLabel = r(refMap, spec.series)

  const sectionHead = (label: string) => (
    <p style={{
      fontSize: '10px', fontFamily: 'var(--font-dm-mono)', color: '#5c5a57',
      letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px',
    }}>
      {label}
    </p>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      {/* Back nav */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/models" className="link-muted" style={{ fontSize: '13px', fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.5px' }}>
          ← Model Guide
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
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
          marginBottom: '12px',
        }}>
          {spec.model}
        </h1>

        {spec.rarity && (
          <div style={{
            display: 'inline-block',
            fontFamily: 'var(--font-dm-mono)', fontSize: '10px',
            letterSpacing: '1.5px', textTransform: 'uppercase',
            color: '#8b6e3f', background: 'rgba(200,169,110,0.08)',
            padding: '3px 8px', marginBottom: '12px',
          }}>
            {spec.rarity}
          </div>
        )}

        {spec.description && (
          <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.7, maxWidth: '680px', marginTop: '8px' }}>
            {spec.description}
          </p>
        )}

        {/* View in Registry + notes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
          <Link
            href={`/?model=${spec.model}`}
            style={{
              fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '1px',
              color: '#c8a96e', border: '1px solid rgba(200,169,110,0.3)',
              padding: '5px 12px', textDecoration: 'none',
            }}
          >
            View in Registry →
          </Link>
          {registeredCount > 0 && (
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57' }}>
              {registeredCount} registered
            </span>
          )}
          {serialMin != null && serialMax != null && serialMin !== serialMax && (
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57' }}>
              Serial range {serialMin}–{serialMax}
            </span>
          )}
        </div>

        {spec.notes && (
          <div style={{ marginTop: '20px', padding: '14px 16px', background: '#161616', border: '1px solid rgba(255,255,255,0.08)', maxWidth: '680px' }}>
            <p style={{ color: '#9e9b96', fontSize: '13px', lineHeight: 1.6 }}>{spec.notes}</p>
          </div>
        )}
      </div>

      {/* Spec columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Universal specification */}
        <div>
          {sectionHead('Universal Specification')}
          <SpecBlock spec={spec} refMap={refMap} colourMetaMap={colourMetaMap} />
        </div>

        {/* Gen-specific specs */}
        {genSpecs.map(gs => (
          <div key={gs.id}>
            {sectionHead(r(refMap, gs.generation) ?? gs.generation)}
            <SpecBlock spec={gs} refMap={refMap} colourMetaMap={colourMetaMap} isGenRow />
          </div>
        ))}

        {/* Placeholder columns if fewer than 2 gen specs */}
        {genSpecs.length === 0 && (
          <>
            <div>
              {sectionHead('Gen 2 Specification')}
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#2e2d2b', paddingTop: '8px' }}>No data yet</p>
            </div>
            <div>
              {sectionHead('Gen 3 Specification')}
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#2e2d2b', paddingTop: '8px' }}>No data yet</p>
            </div>
          </>
        )}
        {genSpecs.length === 1 && (
          <div>
            {sectionHead('No further gen data')}
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#2e2d2b', paddingTop: '8px' }}>No data yet</p>
          </div>
        )}

      </div>

      {/* HT Variants */}
      {variants.length > 0 && (
        <div style={{ marginTop: '48px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {sectionHead('HT Variants')}
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
                {v.bridge_type && (
                  <div style={{ display: 'flex', gap: '16px', padding: '6px 0', fontSize: '13px' }}>
                    <span style={{ color: '#5c5a57', width: '120px', flexShrink: 0, fontFamily: 'var(--font-dm-mono)', fontSize: '11px' }}>Bridge</span>
                    <span style={{ color: '#f0ede8' }}>{r(refMap, v.bridge_type)}</span>
                  </div>
                )}
                {v.description && (
                  <p style={{ color: '#9e9b96', fontSize: '13px', lineHeight: 1.6, marginTop: '12px' }}>{v.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
