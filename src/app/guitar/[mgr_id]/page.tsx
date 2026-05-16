import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Guitar } from '@/lib/types'
import Link from 'next/link'

export const revalidate = 60

async function getGuitar(mgr_id: number): Promise<Guitar | null> {
  const { data } = await supabase
    .from('guitars')
    .select('*')
    .eq('mgr_id', mgr_id)
    .eq('status', 'Approved')
    .single()
  return data as Guitar | null
}

function formatMgrId(id: number) {
  return `MGR-${String(id).padStart(4, '0')}`
}

function Badge({ label, colour }: { label: string; colour: string }) {
  return <span className={`text-xs px-2 py-0.5 rounded font-mono ${colour}`}>{label}</span>
}

function specBadge(source: string | null) {
  const map: Record<string, { label: string; colour: string }> = {
    'Catalogue Confirmed': { label: 'Catalogue Confirmed', colour: 'bg-emerald-900/60 text-emerald-400' },
    'Press Confirmed':     { label: 'Press Confirmed',     colour: 'bg-blue-900/60 text-blue-400' },
    'Owner Confirmed':     { label: 'Owner Confirmed',     colour: 'bg-violet-900/60 text-violet-400' },
    'Registry Derived':    { label: 'Registry Derived',    colour: 'bg-yellow-900/60 text-yellow-400' },
    'Unverified':          { label: 'Unverified',          colour: 'bg-zinc-800 text-zinc-500' },
  }
  const entry = source ? map[source] : null
  if (!entry) return null
  return <Badge {...entry} />
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex gap-3 py-2 border-b border-zinc-800/50 text-sm">
      <span className="text-zinc-500 w-48 shrink-0">{label}</span>
      <span className="text-zinc-200">{String(value)}</span>
    </div>
  )
}

export default async function GuitarPage({ params }: { params: Promise<{ mgr_id: string }> }) {
  const { mgr_id } = await params
  const id = parseInt(mgr_id)
  if (isNaN(id)) notFound()

  const guitar = await getGuitar(id)
  if (!guitar) notFound()

  const images = guitar.image_urls ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">← Registry</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          {images.length > 0 ? (
            images.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt={`${guitar.model} photo ${i + 1}`} className="w-full rounded-lg border border-zinc-800" />
            ))
          ) : (
            <div className="aspect-square bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-700 text-7xl font-mono">♦</div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start gap-3 mb-1">
            <span className="font-mono text-sm text-zinc-500">{formatMgrId(guitar.mgr_id)}</span>
            {specBadge(guitar.specification_source)}
          </div>
          <h1 className="text-3xl font-bold text-white mt-1">{guitar.model ?? 'Unknown model'}</h1>
          {guitar.serial && <p className="text-zinc-400 font-mono text-lg mt-1">{guitar.serial}</p>}

          <div className="flex flex-wrap gap-2 mt-4">
            {guitar.generation && <Badge label={guitar.generation} colour="bg-zinc-800 text-zinc-300" />}
            {guitar.series && <Badge label={guitar.series} colour="bg-zinc-800 text-zinc-400" />}
            {guitar.left_handed === 'Yes — Factory' && <Badge label="Left handed" colour="bg-zinc-800 text-zinc-400" />}
          </div>

          {(guitar.last_known_city || guitar.last_known_country) && (
            <p className="text-zinc-500 text-sm mt-4">
              📍 Last known: {[guitar.last_known_city, guitar.last_known_region, guitar.last_known_country].filter(Boolean).join(', ')}
            </p>
          )}

          {guitar.last_price && (
            <p className="text-zinc-500 text-sm mt-1">Last known price: £{guitar.last_price}</p>
          )}

          <div className="mt-8 space-y-0">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Specification</h2>
            <Field label="Catalogue year"       value={guitar.catalogue_year} />
            <Field label="Finish"               value={guitar.finish_type} />
            <Field label="Colour"               value={guitar.factory_colour ?? guitar.custom_shop_colour} />
            <Field label="Body"                 value={guitar.body_wood} />
            <Field label="Body shape"           value={guitar.body_shape_analogue} />
            <Field label="Pickup configuration" value={guitar.pickup_configuration} />
            <Field label="Neck pickup"          value={guitar.neck_pickup} />
            <Field label="Middle pickup"        value={guitar.middle_pickup} />
            <Field label="Bridge pickup"        value={guitar.bridge_pickup} />
            <Field label="Bridge"               value={guitar.bridge_configuration} />
            <Field label="Hardware"             value={guitar.hardware_colour} />
            <Field label="Switch"               value={guitar.switch_type} />
            <Field label="Switch knob"          value={guitar.switch_knob} />
            <Field label="Potentiometers"       value={guitar.potentiometers} />
            <Field label="Whammy bar"           value={guitar.whammy_bar} />
            <Field label="Neck construction"    value={guitar.neck_construction} />
            <Field label="Pickup surrounds"     value={guitar.pickup_surrounds} />
            <Field label="Neck binding"         value={guitar.neck_binding} />
            <Field label="Headstock logo"       value={guitar.headstock_logo} />
            <Field label="Bridge logo"          value={guitar.bridge_logo} />
            <Field label="Skunk stripe"         value={guitar.skunk_stripe} />
            <Field label="Headstock angle"      value={guitar.headstock_break_angle != null ? `${guitar.headstock_break_angle}°` : null} />
            <Field label="Neck pitch"           value={guitar.neck_pitch != null ? `${guitar.neck_pitch}mm packing` : null} />
          </div>

          {guitar.submission_notes && (
            <div className="mt-8 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Notes</p>
              <p className="text-zinc-300 text-sm">{guitar.submission_notes}</p>
            </div>
          )}

          {guitar.date_approved && (
            <p className="text-zinc-600 text-xs mt-6">
              Added to registry {new Date(guitar.date_approved).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
