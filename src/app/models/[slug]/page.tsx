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

type PickupMeta = {
  style?: string | null
  hex_primary?: string | null
  hex_secondary?: string | null
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
  if (pattern === 'Brushed' && hex)
    return `repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 4px), ${hex}`
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '4px' }}>
      {colours.map(colId => {
        const name = r(refMap, colId) ?? colId
        const parts = name.split(' — ')
        const code = parts.length >= 2 ? parts[0] : name
        const label = parts.length >= 2 ? parts[1] : ''
        const bg = swatchBg(colId, colourMetaMap[colId] ?? null)
        return (
          <div key={colId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '56px' }}>
            <div style={{
              width: '36px', height: '36px', flexShrink: 0,
              background: bg ?? 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
            }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#c8a96e', letterSpacing: '0.5px' }}>
                {code}
              </div>
              {label && (
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: '#5c5a57', marginTop: '2px', lineHeight: 1.3 }}>
                  {label}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HumbuckerIcon({ meta }: { meta: PickupMeta | null }) {
  const style = meta?.style ?? 'covered'
  const primary = meta?.hex_primary ?? '#1e1c1a'
  const secondary = meta?.hex_secondary ?? primary
  const line = 'rgba(255,255,255,0.45)'
  const pole = 'rgba(0,0,0,0.55)'
  const sw = '13.75'
  const cys = [300, 505.5, 710.5, 917, 1123, 1329]
  const screwYs = [257.5, 462.5, 668.5, 874.5, 1080.5, 1286.5]

  if (style === 'open_coil') {
    return (
      <svg viewBox="3319 111 766 1407" width="38" height="70" style={{ display: 'block' }}>
        {/* Bobbin fills */}
        <rect x="3326" y="118" width="365" height="1393" rx="182" fill={primary} />
        <rect x="3713" y="118" width="365" height="1393" rx="182" fill={secondary} />
        {/* Pole fills */}
        {cys.map(cy => <circle key={`l${cy}`} cx="3508.5" cy={cy} r="60.5" fill={pole} />)}
        {cys.map(cy => <circle key={`r${cy}`} cx="3895.5" cy={cy} r="60.5" fill={pole} />)}
        {/* Outer housing outline */}
        <path d="M3326 243.335C3326 174.114 3382.11 118 3451.34 118L3952.67 118C4021.89 118 4078 174.114 4078 243.335L4078 1385.67C4078 1454.89 4021.89 1511 3952.67 1511L3451.34 1511C3382.11 1511 3326 1454.89 3326 1385.67Z" stroke={line} strokeWidth={sw} strokeMiterlimit="8" fill="none" />
        {/* Left bobbin */}
        <g stroke={line} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10">
          <path d="M3508.5 118C3609.29 118 3691 199.484 3691 300"/>
          <path d="M3326 300C3326 199.484 3407.71 118 3508.5 118"/>
          <path d="M3508.5 1511C3407.71 1511 3326 1429.52 3326 1329"/>
          <path d="M3691 1329C3691 1429.52 3609.29 1511 3508.5 1511"/>
          <path d="M3326 300 3326 1329.12"/>
          <path d="M3691 300 3691 1329.12"/>
          {cys.map(cy => <circle key={cy} cx="3508.5" cy={cy} r="60.5"/>)}
        </g>
        {/* Right bobbin */}
        <g stroke={line} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10">
          <path d="M3895.5 118C3996.29 118 4078 199.484 4078 300"/>
          <path d="M3713 300C3713 199.484 3794.71 118 3895.5 118"/>
          <path d="M3895.5 1511C3794.71 1511 3713 1429.52 3713 1329"/>
          <path d="M4078 1329C4078 1429.52 3996.29 1511 3895.5 1511"/>
          <path d="M3713 300 3713 1329.12"/>
          <path d="M4078 300 4078 1329.12"/>
          {cys.map(cy => <circle key={cy} cx="3895.5" cy={cy} r="60.5"/>)}
        </g>
        {screwYs.map(y => (
          <path key={y} d="M0 0 85.8837 85.8837" stroke={line} strokeWidth="22.9167" strokeMiterlimit="8" fill="none" transform={`matrix(-1 0 0 1 3551.38 ${y})`}/>
        ))}
      </svg>
    )
  }

  // Covered
  return (
    <svg viewBox="2362 111 766 1407" width="38" height="70" style={{ display: 'block' }}>
      {/* Body fill */}
      <rect x="2369" y="118" width="752" height="1393" rx="125" fill={primary} />
      {/* Pole piece fills */}
      {cys.map(cy => <circle key={cy} cx="2551.5" cy={cy} r="60.5" fill={pole} />)}
      {/* Outer housing outline */}
      <path d="M2369 243.335C2369 174.114 2425.11 118 2494.34 118L2995.67 118C3064.89 118 3121 174.114 3121 243.335L3121 1385.67C3121 1454.89 3064.89 1511 2995.67 1511L2494.34 1511C2425.11 1511 2369 1454.89 2369 1385.67Z" stroke={line} strokeWidth={sw} strokeMiterlimit="8" fill="none" />
      {/* Rails and pole circles */}
      <g stroke={line} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10">
        <path d="M2369 300 2369 1329.12"/>
        <path d="M3121 300 3121 1329.12"/>
        {cys.map(cy => <circle key={cy} cx="2551.5" cy={cy} r="60.5"/>)}
      </g>
      {screwYs.map(y => (
        <path key={y} d="M0 0 85.8837 85.8837" stroke={line} strokeWidth="22.9167" strokeMiterlimit="8" fill="none" transform={`matrix(-1 0 0 1 2594.38 ${y})`}/>
      ))}
    </svg>
  )
}

function PickupSwatches({ pickupIds, pickupMetaMap, refMap }: {
  pickupIds: string[]
  pickupMetaMap: Record<string, PickupMeta>
  refMap: Record<string, string>
}) {
  if (!pickupIds.length) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', paddingTop: '4px' }}>
      {pickupIds.map(id => {
        const full = r(refMap, id) ?? id
        const parts = full.split(' — ')
        const code  = parts.length >= 2 ? parts[0] : ''
        const label = parts.length >= 2 ? parts[1] : full
        const meta = pickupMetaMap[id] ?? null
        return (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <HumbuckerIcon meta={meta} />
            {code && (
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#c8a96e', letterSpacing: '0.5px' }}>
                {code}
              </div>
            )}
            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: '#5c5a57', textAlign: 'center', maxWidth: '56px', lineHeight: 1.4 }}>
              {label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Universal specification — all fields that apply across all generations
function SpecBlock({ spec, refMap, bsaMetaMap, productionYears }: { spec: Partial<ModelSpec>; refMap: Record<string, string>; bsaMetaMap: Record<string, { maverick_body_name?: string }>; productionYears: string | null }) {
  return (
    <div>
      <SpecGroup label="Body" />
      <SpecRow label="Body design analogue"  value={r(refMap, spec.body_shape_analogue)} />
      <SpecRow label="Maverick body family"  value={spec.body_shape_analogue ? (bsaMetaMap[spec.body_shape_analogue]?.maverick_body_name ?? null) : null} />
      <SpecRow label="Body wood"            value={r(refMap, spec.body_wood)} />
      <SpecRow label="Body construction"    value={r(refMap, spec.body_construction)} />
      <SpecRow label="Joint type"           value={r(refMap, spec.joint_type)} />
      <SpecRow label="Bookmatched"          value={r(refMap, spec.body_bookmatched)} />
      <SpecRow label="Body contouring"       value={r(refMap, spec.body_carving)} />
      <SpecRow label="Decorative body routing" value={r(refMap, spec.body_decorative_routing)} />

      <SpecGroup label="Pickups & electronics" />
      <SpecRow label="Pickup configuration" value={r(refMap, spec.pickup_configuration)} />
      <SpecRow label="Neck pickup"          value={r(refMap, spec.neck_pickup)} />
      <SpecRow label="Middle pickup"        value={r(refMap, spec.middle_pickup)} />
      <SpecRow label="Bridge pickup"        value={r(refMap, spec.bridge_pickup)} />
      <SpecRow label="Coil tap"             value={r(refMap, spec.coil_tap)} />
      <SpecRow label="Selector switch type" value={r(refMap, spec.switch_type)} />
      <SpecRow label="Volume pot"           value={r(refMap, spec.volume_pot)} />
      <SpecRow label="Volume pot count"     value={spec.volume_pot_count} />
      <SpecRow label="Tone pot"             value={r(refMap, spec.tone_pot)} />
      <SpecRow label="Tone pot count"       value={spec.tone_pot_count} />

      <SpecGroup label="Hardware" />
      <SpecRow label="Bridge"               value={r(refMap, spec.bridge_type)} />
      <SpecRow label="Tuner style"          value={r(refMap, spec.tuner_style)} />

      <SpecGroup label="Neck" />
      <SpecRow label="Neck mount"           value={r(refMap, spec.neck_mount)} />
      <SpecRow label="Neck wood"            value={r(refMap, spec.neck_wood)} />
      <SpecRow label="Neck profile"         value={r(refMap, spec.neck_profile)} />

      <SpecRow label="Fretboard"            value={r(refMap, spec.fretboard_wood)} />
      <SpecRow label="Fretboard markers"    value={r(refMap, spec.fretboard_markers)} />
      <SpecRow label="Fretboard radius"     value={spec.fretboard_radius_mm != null ? `${spec.fretboard_radius_mm}mm` : null} />
      <SpecRow label="Fret count"           value={r(refMap, spec.fret_count)} />
      <SpecRow label="Scale length"         value={r(refMap, spec.scale_length)} />
      <SpecRow label="Nut type"             value={r(refMap, spec.nut_type)} />
      <SpecRow label="Nut width"            value={spec.nut_width != null ? `${spec.nut_width}mm` : null} />

      <SpecGroup label="Headstock" />
      <SpecRow label="Headstock style"      value={r(refMap, spec.headstock_style)} />
      <SpecRow label="Headstock face"       value={r(refMap, spec.headstock_face)} />
      <SpecRow label="Decorative headstock routing" value={r(refMap, spec.headstock_decorative_routing)} />

      <SpecGroup label="Other" />
      <SpecRow label="Weight"               value={spec.weight_kg != null ? `${spec.weight_kg}kg` : null} />
      <SpecRow label="Production years"     value={productionYears} />
      <SpecRow label="Left handed option"   value={r(refMap, spec.left_handed_available)} />
      <SpecRow label="Serial prefix"        value={spec.serial_prefix} />
      <SpecRow label="Original RRP"         value={spec.original_rrp != null ? `£${spec.original_rrp}` : 'Unknown'} />
    </div>
  )
}

// Generational indicators only — fields confirmed to vary between Gen 1 and Gen 2
function GenIndicatorBlock({ spec, refMap }: { spec: Partial<ModelGenSpec>; refMap: Record<string, string> }) {
  return (
    <div>
      <SpecGroup label="Pickups & electronics" />
      <SpecRow label="Switch knob"      value={r(refMap, spec.switch_knob)} />
      <SpecRow label="Pickup surrounds" value={r(refMap, spec.pickup_surrounds)} />

      <SpecGroup label="Hardware" />
      <SpecRow label="Bridge logo"      value={r(refMap, spec.bridge_logo)} />
      <SpecRow label="Trem arm"         value={r(refMap, spec.trem_arm)} />

      <SpecGroup label="Neck" />
      <SpecRow label="Neck construction" value={r(refMap, spec.neck_construction)} />
      <SpecRow label="Neck finish"       value={r(refMap, spec.neck_finish)} />
      <SpecRow label="Neck profile"      value={r(refMap, spec.neck_profile)} />
      <SpecRow label="Neck binding"      value={r(refMap, spec.neck_binding)} />
      <SpecRow label="Skunk stripe"      value={r(refMap, spec.skunk_stripe)} />

      <SpecGroup label="Headstock" />
      <SpecRow label="Headstock logo"   value={r(refMap, spec.headstock_logo)} />
    </div>
  )
}

const MODEL_NICKNAMES: Record<string, string> = {
  'SF-1': 'Streetfighter',
}

function resolveSlug(slug: string, models: { model: string }[]): string {
  const match = models.find(m => m.model.toLowerCase().replace(/\s+/g, '-') === slug)
  return match?.model ?? slug
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data: allModels } = await supabase.from('model_specifications').select('model')
  const modelName = resolveSlug(slug, allModels ?? [])
  const { data } = await supabase
    .from('model_specifications')
    .select('model, description')
    .eq('model', modelName)
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
  const { data: allModels } = await supabase.from('model_specifications').select('model')
  const modelName = resolveSlug(slug, allModels ?? [])

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
    { data: rawSourceColours },
  ] = await Promise.all([
    getRefValues(),
    supabase.from('model_specifications').select('*').eq('parent_model_id', spec.id),
    supabase.from('model_gen_specs').select('*').eq('model_id', spec.id).order('generation'),
    supabase.from('guitars').select('serial_number_only').eq('model_id', spec.id).eq('status', 'Approved'),
    supabase.from('ref_values').select('id, metadata').in('category', ['COL', 'CSC', 'HWC', 'PKC', 'CPKC', 'BSA']).eq('is_active', true),
    parentSpecPromise,
    supabase.from('model_source_colours').select('available_colours, available_custom_shop_colours, available_hardware_colours, available_pickup_colours, available_custom_shop_pickup_colours, notes, year_qualifier, source_materials(id, title, year, material_type)').eq('model_id', spec.id),
  ])

  const colourMetaMap: Record<string, ColourMeta> = {}
  const pickupMetaMap: Record<string, PickupMeta> = {}
  const bsaMetaMap: Record<string, { maverick_body_name?: string }> = {}
  for (const row of (rawColourMeta ?? []) as { id: string; metadata: Record<string, unknown> | null }[]) {
    if (row.id.startsWith('BSA-')) {
      bsaMetaMap[row.id] = (row.metadata ?? {}) as { maverick_body_name?: string }
    } else if (row.id.startsWith('PKC-') || row.id.startsWith('CPKC-')) {
      pickupMetaMap[row.id] = (row.metadata ?? {}) as PickupMeta
    } else {
      colourMetaMap[row.id] = (row.metadata ?? {}) as ColourMeta
    }
  }

  const variants = (rawVariants ?? []) as ModelSpec[]
  const genSpecs = (rawGenSpecs ?? []) as ModelGenSpec[]
  const parentSpec = parentSpecData as { id: string; model: string } | null
  type SourceColourRow = { available_colours: string[]; available_custom_shop_colours: string[] | null; available_hardware_colours: string[] | null; available_pickup_colours: string[] | null; available_custom_shop_pickup_colours: string[] | null; notes: string | null; year_qualifier: string | null; source_materials: { id: string; title: string; year: string | null; material_type: string | null } }
  const sourceColours = (rawSourceColours ?? []) as SourceColourRow[]

  function sourceLabel(sm: SourceColourRow['source_materials'] | null): string {
    if (!sm) return 'Source Pending'
    if (sm.title === 'Pending — Source Required') return 'Source Pending'
    const y = sm.year ?? ''
    if (sm.material_type === 'Magazine') return `${y} Press Sourced Colours`
    if (sm.title.toLowerCase().includes('brochure')) return `${y} Maverick Brochure`
    return `${y} Maverick Catalogue`
  }

  // Aggregate all custom shop, hardware, and pickup colour IDs across all source rows — not split by year.
  const customShopColourIds = [...new Set(
    sourceColours.flatMap(sc => sc.available_custom_shop_colours ?? [])
  )]
  const hardwareColourIds = [...new Set(
    sourceColours.flatMap(sc => sc.available_hardware_colours ?? [])
  )]
  const pickupColourIds = [...new Set(
    sourceColours.flatMap(sc => sc.available_pickup_colours ?? [])
  )]
  const customShopPickupColourIds = [...new Set(
    sourceColours.flatMap(sc => sc.available_custom_shop_pickup_colours ?? [])
  )]

  // Group factory body colours by year_qualifier — deduplicated across all sources for that year
  const factoryColoursByYear = new Map<string, string[]>()
  for (const sc of sourceColours) {
    if (!sc.source_materials || sc.source_materials.title === 'Pending — Source Required') continue
    if (!sc.year_qualifier) continue
    const existing = factoryColoursByYear.get(sc.year_qualifier) ?? []
    const merged = [...new Set([...existing, ...(sc.available_colours ?? [])])]
    factoryColoursByYear.set(sc.year_qualifier, merged)
  }
  const sortedFactoryYears = [...factoryColoursByYear.keys()].sort()

  // Derive production years from source material years linked via model_source_colours.
  // DO NOT hardcode — add a model_source_colours row to extend the window.
  const sourceYears = sourceColours
    .map(sc => sc.source_materials?.year)
    .filter((y): y is string => y != null)
    .map(y => parseInt(y))
    .filter(y => !isNaN(y))
    .sort((a, b) => a - b)
  const singleYear = sourceYears.length > 0 && sourceYears[0] === sourceYears[sourceYears.length - 1]
  const yearQualifier = singleYear
    ? (sourceColours.find(sc => sc.year_qualifier)?.year_qualifier ?? null)
    : null
  const productionYears = sourceYears.length === 0
    ? null
    : singleYear
      ? yearQualifier ? `${yearQualifier} ${sourceYears[0]}` : String(sourceYears[0])
      : `${sourceYears[0]}–${sourceYears[sourceYears.length - 1]}`

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

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
          display: 'flex', alignItems: 'baseline', gap: '20px', flexWrap: 'wrap',
        }}>
          {spec.model}
          {MODEL_NICKNAMES[spec.model] && (
            <span style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', color: '#3a3835', letterSpacing: '2px' }}>
              {MODEL_NICKNAMES[spec.model]}
            </span>
          )}
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

      </div>

      {/* Universal specification + Available colours */}
      <div style={{ marginBottom: '48px', paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Col 1 — Universal spec */}
          <div>
            {sectionHead('Universal Specification')}
            <SpecBlock spec={spec} refMap={refMap} bsaMetaMap={bsaMetaMap} productionYears={productionYears} />
          </div>

          {/* Col 2 — Body colours + Hardware colours */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

            {/* Factory body colours grouped by year — deduplicated across sources */}
            <div>
              {sectionHead('Factory Body Colours')}
              {sortedFactoryYears.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {sortedFactoryYears.map(year => (
                    <div key={year}>
                      <p style={{
                        fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '2px',
                        textTransform: 'uppercase', color: '#5c5a57', marginBottom: '12px',
                      }}>
                        Available Colours {year}
                      </p>
                      <ColourSwatches colours={factoryColoursByYear.get(year) ?? []} colourMetaMap={colourMetaMap} refMap={refMap} />
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#2e2d2b' }}>No colour data yet</p>
              )}
            </div>

            {/* Factory pickup colours */}
            <div>
              {sectionHead('Factory Pickup Colours')}
              {pickupColourIds.length > 0 ? (
                <PickupSwatches pickupIds={pickupColourIds} pickupMetaMap={pickupMetaMap} refMap={refMap} />
              ) : (
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#2e2d2b' }}>No pickup colour data yet</p>
              )}
            </div>

            {/* Custom shop body colours — aggregated across full production run */}
            <div>
              {sectionHead('Custom Shop Body Colours')}
              {customShopColourIds.length > 0 ? (
                <ColourSwatches colours={customShopColourIds} colourMetaMap={colourMetaMap} refMap={refMap} />
              ) : (
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#2e2d2b' }}>No custom shop data yet</p>
              )}
            </div>

            {/* Custom shop pickup colours */}
            <div>
              {sectionHead('Custom Shop Pickup Colours')}
              {customShopPickupColourIds.length > 0 ? (
                <PickupSwatches pickupIds={customShopPickupColourIds} pickupMetaMap={pickupMetaMap} refMap={refMap} />
              ) : (
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#2e2d2b' }}>No custom shop pickup data yet</p>
              )}
            </div>

            {/* Available hardware colours — aggregated across full production run */}
            <div>
              {sectionHead('Available Hardware Colours')}
              {hardwareColourIds.length > 0 ? (
                <ColourSwatches colours={hardwareColourIds} colourMetaMap={colourMetaMap} refMap={refMap} />
              ) : (
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#2e2d2b' }}>No hardware colour data yet</p>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* HT Variants */}
      {variants.length > 0 && (
        <div style={{ marginBottom: '48px', paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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
                  <div style={{ display: 'flex', gap: '16px', padding: '6px 0' }}>
                    <span style={{ color: '#5c5a57', width: '120px', flexShrink: 0, fontFamily: 'var(--font-dm-mono)', fontSize: '11px' }}>Bridge</span>
                    <span style={{ color: '#f0ede8', fontSize: '13px' }}>{r(refMap, v.bridge_type)}</span>
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

      {/* Gen 1 & Gen 2 specification columns */}
      <div style={{ paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {(['GEN-0001', 'GEN-0002'] as const).map(genId => {
            const gs = genSpecs.find(g => g.generation === genId) ?? null
            return (
              <div key={genId}>
                {sectionHead(r(refMap, genId) ?? genId)}
                <GenIndicatorBlock spec={gs ?? {}} refMap={refMap} />
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
