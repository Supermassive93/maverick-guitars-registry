import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getRefValues, r } from '@/lib/ref-values'
import type { Guitar } from '@/lib/types'
import { getModelName } from '@/lib/types'
import Link from 'next/link'

export const revalidate = 60

async function getGuitar(mgr_id: number): Promise<Guitar | null> {
  const { data } = await supabase
    .from('guitars')
    .select('*, model_specifications(model)')
    .eq('mgr_id', mgr_id)
    .eq('status', 'Approved')
    .single()
  return data as Guitar | null
}

function formatMgrId(id: number) {
  return `MGR-${String(id).padStart(4, '0')}`
}

function SpecBadge({ source }: { source: string | null }) {
  if (!source) return null
  const map: Record<string, { label: string; color: string; bg: string }> = {
    'Catalogue Confirmed': { label: 'Catalogue Confirmed', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
    'Press Confirmed':     { label: 'Press Confirmed',     color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    'Owner Confirmed':     { label: 'Owner Confirmed',     color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
    'Registry Derived':    { label: 'Registry Derived',    color: '#c8a96e', bg: 'rgba(200,169,110,0.12)' },
    'Unverified':          { label: 'Unverified',          color: '#5c5a57', bg: 'rgba(255,255,255,0.04)' },
  }
  const entry = map[source]
  if (!entry) return null
  return (
    <span style={{
      fontSize: '11px',
      fontFamily: 'var(--font-dm-mono)',
      color: entry.color,
      background: entry.bg,
      padding: '3px 8px',
      letterSpacing: '0.3px',
    }}>
      {entry.label}
    </span>
  )
}

function Tag({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: '12px',
      fontFamily: 'var(--font-dm-mono)',
      color: '#9e9b96',
      background: 'rgba(255,255,255,0.05)',
      padding: '3px 10px',
      letterSpacing: '0.3px',
    }}>
      {label}
    </span>
  )
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null
  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      fontSize: '14px',
    }}>
      <span style={{ color: '#5c5a57', width: '200px', flexShrink: 0, fontFamily: 'var(--font-dm-mono)', fontSize: '12px' }}>{label}</span>
      <span style={{ color: '#f0ede8' }}>{String(value)}</span>
    </div>
  )
}

export default async function GuitarPage({ params }: { params: Promise<{ mgr_id: string }> }) {
  const { mgr_id } = await params
  const id = parseInt(mgr_id)
  if (isNaN(id)) notFound()

  const [guitar, refMap] = await Promise.all([getGuitar(id), getRefValues()])
  if (!guitar) notFound()

  const modelName = getModelName(guitar)
  const images = guitar.image_urls ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/"
          className="link-muted"
          style={{ fontSize: '13px', fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.5px' }}
        >
          ← Registry
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {images.length > 0 ? (
            images.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt={`${modelName} photo ${i + 1}`}
                style={{ width: '100%', border: '1px solid rgba(255,255,255,0.08)', display: 'block' }}
              />
            ))
          ) : (
            <div style={{
              aspectRatio: '1',
              background: '#161616',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#2a2a2a', fontSize: '5rem', fontFamily: 'var(--font-dm-mono)',
            }}>
              ♦
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#5c5a57', letterSpacing: '0.5px' }}>
              {formatMgrId(guitar.mgr_id)}
            </span>
            <SpecBadge source={guitar.specification_source} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            letterSpacing: '2px',
            color: '#f0ede8',
            lineHeight: 1,
            marginBottom: '8px',
          }}>
            {modelName}
          </h1>

          {guitar.serial && (
            <p style={{ color: '#9e9b96', fontFamily: 'var(--font-dm-mono)', fontSize: '14px', marginBottom: '16px' }}>
              {guitar.serial}
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
            {guitar.generation && <Tag label={r(refMap, guitar.generation) ?? ''} />}
            {guitar.series && <Tag label={r(refMap, guitar.series) ?? ''} />}
            {(guitar.left_handed_available === 'LHA-0001' || guitar.left_handed_available === 'LHA-0002') && (
              <Tag label="Left handed" />
            )}
          </div>

          {(guitar.last_known_city || guitar.last_known_country) && (
            <p style={{ color: '#5c5a57', fontSize: '13px', fontFamily: 'var(--font-dm-mono)', marginBottom: '4px' }}>
              {[guitar.last_known_city, guitar.last_known_region, guitar.last_known_country].filter(Boolean).join(', ')}
            </p>
          )}

          {guitar.last_price && (
            <p style={{ color: '#5c5a57', fontSize: '13px', fontFamily: 'var(--font-dm-mono)', marginBottom: '4px' }}>
              Last known price: £{guitar.last_price}
            </p>
          )}

          {guitar.registered_by && (
            <p style={{ color: '#5c5a57', fontSize: '13px', fontFamily: 'var(--font-dm-mono)', marginBottom: '24px' }}>
              Registered by{' '}
              <span style={{ color: '#9e9b96' }}>{guitar.registered_by}</span>
            </p>
          )}

          <div style={{ marginTop: '24px' }}>
            <p style={{
              fontSize: '10px', fontFamily: 'var(--font-dm-mono)', color: '#5c5a57',
              letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px',
            }}>
              Specification
            </p>
            <Field label="Catalogue year"       value={r(refMap, guitar.catalogue_year)} />
            <Field label="Finish"               value={r(refMap, guitar.finish_type)} />
            <Field label="Colour"               value={r(refMap, guitar.factory_colour) ?? guitar.custom_shop_colour} />
            <Field label="Body"                 value={r(refMap, guitar.body_wood)} />
            <Field label="Body shape"           value={r(refMap, guitar.body_shape_analogue)} />
            <Field label="Body construction"    value={r(refMap, guitar.body_construction)} />
            <Field label="Pickup configuration" value={r(refMap, guitar.pickup_configuration)} />
            <Field label="Neck pickup"          value={guitar.neck_pickup} />
            <Field label="Middle pickup"        value={guitar.middle_pickup} />
            <Field label="Bridge pickup"        value={guitar.bridge_pickup} />
            <Field label="Bridge"               value={r(refMap, guitar.bridge_type)} />
            <Field label="Hardware"             value={r(refMap, guitar.hardware_colour)} />
            <Field label="Switch"               value={r(refMap, guitar.switch_type)} />
            <Field label="Switch knob"          value={guitar.switch_knob} />
            <Field label="Potentiometers"       value={r(refMap, guitar.potentiometers)} />
            <Field label="Whammy bar"           value={guitar.whammy_bar} />
            <Field label="Neck construction"    value={r(refMap, guitar.neck_construction)} />
            <Field label="Fretboard"            value={r(refMap, guitar.fretboard_wood)} />
            <Field label="Fret count"           value={r(refMap, guitar.fret_count)} />
            <Field label="Scale length"         value={r(refMap, guitar.scale_length)} />
            <Field label="Pickup surrounds"     value={r(refMap, guitar.pickup_surrounds)} />
            <Field label="Pickup colour"        value={r(refMap, guitar.pickup_colours)} />
            <Field label="Neck binding"         value={r(refMap, guitar.neck_binding)} />
            <Field label="Headstock logo"       value={r(refMap, guitar.headstock_logo)} />
            <Field label="Headstock face"       value={r(refMap, guitar.headstock_face)} />
            <Field label="Bridge logo"          value={guitar.bridge_logo} />
            <Field label="Skunk stripe"         value={r(refMap, guitar.skunk_stripe)} />
            <Field label="Nut"                  value={r(refMap, guitar.nut_type)} />
            <Field label="Headstock angle"      value={guitar.headstock_break_angle != null ? `${guitar.headstock_break_angle}°` : null} />
            <Field label="Neck pitch"           value={guitar.neck_pitch != null ? `${guitar.neck_pitch}mm packing` : null} />
          </div>

          {guitar.submission_notes && (
            <div style={{
              marginTop: '32px',
              padding: '16px',
              background: '#161616',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <p style={{ fontSize: '10px', fontFamily: 'var(--font-dm-mono)', color: '#5c5a57', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Notes
              </p>
              <p style={{ color: '#9e9b96', fontSize: '14px', lineHeight: 1.6 }}>{guitar.submission_notes}</p>
            </div>
          )}

          {guitar.date_approved && (
            <p style={{ color: '#5c5a57', fontSize: '12px', fontFamily: 'var(--font-dm-mono)', marginTop: '24px' }}>
              Added to registry{' '}
              {new Date(guitar.date_approved).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
