'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { PRERELEASE } from '@/lib/config'
import GuidedCropModal from '@/components/GuidedCropModal'

type ModelConfig = { series: string; prefix: string }
const MODEL_CONFIG: Record<string, ModelConfig> = {
  'F1':               { series: 'F-Series',      prefix: 'F1-' },
  'F1HT':             { series: 'F-Series',      prefix: 'F1HT-' },
  'F2':               { series: 'F-Series',      prefix: 'F2-' },
  'F3':               { series: 'F-Series',      prefix: 'F3-' },
  'F4':               { series: 'F-Series',      prefix: 'F4-' },
  'FD-Tox':           { series: 'F-Series',      prefix: 'FD-' },
  'X1':               { series: 'X-Series',      prefix: 'X1-' },
  'XD-Tox':           { series: 'X-Series',      prefix: 'XD-' },
  'X-Treme':          { series: 'X-Treme',       prefix: 'XT-' },
  'Species 1':        { series: 'Species',       prefix: 'SP1-' },
  'Species 2':        { series: 'Species',       prefix: 'SP2-' },
  'Species 3':        { series: 'Species',       prefix: 'SP3-' },
  'Species 7 String': { series: 'Species',       prefix: 'SP7-' },
  'Chaos 1':          { series: 'Chaos',         prefix: 'C1-' },
  'Chaos 2':          { series: 'Chaos',         prefix: 'C2-' },
  'SF-1':             { series: 'Streetfighter', prefix: 'SF-' },
  'Matrix':           { series: 'Matrix',        prefix: 'MAT-' },
  'G1':               { series: 'G-Series',      prefix: 'G1-' },
  'G2':               { series: 'G-Series',      prefix: 'G2-' },
  'B1':               { series: 'B-Series',      prefix: 'B1-' },
  'S4':               { series: 'S-Series',      prefix: 'S4-' },
  'S5':               { series: 'S-Series',      prefix: 'S5-' },
  'JR4':              { series: 'JR-Series',     prefix: 'JR4-' },
  'Unknown':          { series: 'Unknown',       prefix: '' },
}

const MODEL_GROUPS: Record<string, string[]> = Object.entries(MODEL_CONFIG).reduce(
  (acc, [model, { series }]) => {
    if (!acc[series]) acc[series] = []
    acc[series].push(model)
    return acc
  },
  {} as Record<string, string[]>
)

const FACTORY_COLOURS = [
  'MB — Metallic Burgundy', 'MDB — Metallic Dark Blue', 'MGN — Metallic Green',
  'MGY — Metallic Grey', 'MIB — Metallic Ice Blue', 'PTR — Metallic Pewter',
  'CR — Candy Red', 'NY — Neon Yellow', 'BK — Black', 'WH — White',
  'CM — Cream', 'SL — Silver', 'TR — Transparent Red', 'TB — Transparent Blue',
  'TG — Transparent Green', 'TP — Transparent Purple', 'MS — Metallic Sage', 'MP — Metallic Purple',
  'NT — Natural',
  'CB — Cherryburst',
]

const CUSTOM_COLOURS = ['BW — Black & White (Zebra)', 'BR — Black & Red (DTM)', 'Custom Airbrushed', 'Unknown']

const TREMOLO_BRIDGES = ['Maverick Floyd Rose - Licensed', 'Floyd Rose - Aftermarket', 'Synchronised Tremolo - Fender Style']
const FLOYD_ROSE_BRIDGES = ['Maverick Floyd Rose - Licensed', 'Floyd Rose - Aftermarket']

type PickupPositions = { bridge: string | null; middle: string | null; neck: string | null }
const PICKUP_CONFIG_MAP: Record<string, PickupPositions> = {
  'HH':      { bridge: 'Humbucker',   middle: null,          neck: 'Humbucker'   },
  'HSH':     { bridge: 'Humbucker',   middle: 'Single Coil', neck: 'Humbucker'   },
  'HSS':     { bridge: 'Humbucker',   middle: 'Single Coil', neck: 'Single Coil' },
  'HS':      { bridge: 'Humbucker',   middle: 'Single Coil', neck: null          },
  'H':       { bridge: 'Humbucker',   middle: null,          neck: null          },
  'SS':      { bridge: 'Single Coil', middle: null,          neck: 'Single Coil' },
  'SSS':     { bridge: 'Single Coil', middle: 'Single Coil', neck: 'Single Coil' },
}

const WHAMMY_OPTIONS = [
  'Factory — With O-ring grips',
  'Factory — Without O-ring grips',
  'Aftermarket',
  'Missing',
]

function valueIndicatesModified(value: string): boolean {
  return value.includes('Aftermarket') || value === 'Refinished'
}

const IMAGE_SCHEMA = [
  'Full front', 'Full rear',
  'Body front', 'Body rear',
  'Headstock front', 'Headstock rear',
]

type ImageSlot = { position: string; file: File | null; preview: string | null }

function makeInitialSlots(): ImageSlot[] {
  return IMAGE_SCHEMA.map(position => ({ position, file: null, preview: null }))
}

type FormState = {
  serial: string
  serial_status: string
  model: string
  finish_type: string
  factory_colour: string
  custom_shop_colour: string
  body_wood: string
  body_shape_analogue: string
  pickup_configuration: string
  neck_pickup: string
  middle_pickup: string
  bridge_pickup: string
  bridge_configuration: string
  hardware_colour: string
  headstock_face: string
  headstock_style: string
  headstock_logo: string
  bridge_logo: string
  pickup_surrounds: string
  pickup_colours: string
  tuner_style: string
  neck_binding: string
  switch_type: string
  switch_knob: string
  potentiometers: string
  whammy_bar: string
  nut_type: string
  fret_count: string
  fretboard_wood: string
  scale_length: string
  neck_construction: string
  skunk_stripe: string
  headstock_break_angle: string
  neck_pitch: string
  left_handed: string
  last_known_country: string
  last_known_region: string
  last_known_city: string
  source_type: string
  source_url: string
  last_price: string
  submitter_email: string
  submission_notes: string
}

const INITIAL: FormState = {
  serial: '', serial_status: '', model: '',
  finish_type: '', factory_colour: '', custom_shop_colour: '',
  left_handed: 'No',
  body_wood: '', body_shape_analogue: '', pickup_configuration: '',
  neck_pickup: '', middle_pickup: '', bridge_pickup: '', bridge_configuration: '',
  hardware_colour: '', headstock_face: '', headstock_style: '', headstock_logo: '', bridge_logo: '', pickup_surrounds: '',
  pickup_colours: '', tuner_style: '',
  neck_binding: '', switch_type: '', switch_knob: '', potentiometers: '',
  nut_type: '', whammy_bar: '', fret_count: '', fretboard_wood: '', scale_length: '',
  neck_construction: '', skunk_stripe: '', headstock_break_angle: '',
  neck_pitch: '', last_known_country: '', last_known_region: '', last_known_city: '',
  source_type: 'Owner registration', source_url: '', last_price: '',
  submitter_email: '', submission_notes: '',
}


function Field({ label, required, prefilled, children }: {
  label: string; required?: boolean; prefilled?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-1" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>{label}{required && <span className="text-red-500 ml-1">*</span>}</span>
        {prefilled && (
          <span style={{
            fontSize: '9px', color: '#c8a96e',
            fontFamily: 'var(--font-dm-mono)', letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>pre-filled</span>
        )}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-500'
const selectCls = inputCls + ' appearance-none'

function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={selectCls}>
      <option value="">{placeholder ?? 'Select…'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-zinc-800 rounded-lg p-6">
      <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-5">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

function split_email_prefix(email: string) {
  return email.split('@')[0] || 'Anonymous'
}

type GateState = 'checking' | 'gate' | 'form'

export default function SubmitPage() {
  if (PRERELEASE) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-bebas)', fontSize: '42px', letterSpacing: '2px', color: '#f0ede8', marginBottom: '12px' }}>
            SUBMISSIONS OPENING SOON
          </p>
          <p style={{ color: '#9e9b96', fontSize: '14px', lineHeight: 1.7, fontFamily: 'var(--font-dm-mono)', marginBottom: '32px' }}>
            The registry is currently in pre-release. Guitar submissions will open to the public shortly.
          </p>
          <Link
            href="/"
            style={{ display: 'inline-block', fontSize: '12px', color: '#5c5a57', fontFamily: 'var(--font-dm-mono)', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none' }}
            className="link-muted"
          >
            ← Back to registry
          </Link>
        </div>
      </div>
    )
  }
  return <SubmitForm />
}

function SubmitForm() {
  const [gateState, setGateState] = useState<GateState>('checking')
  const [form, setForm] = useState<FormState>(INITIAL)
  const [serialDigits, setSerialDigits] = useState('')
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(makeInitialSlots)
  const [cropTarget, setCropTarget] = useState<{ index: number; file: File } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isModified, setIsModified] = useState(false)
  const [catalogueValues, setCatalogueValues] = useState<Partial<FormState>>({})
  const [prefilledFields, setPrefilledFields] = useState(new Set<keyof FormState>())
  const [bridgeLogoBrand, setBridgeLogoBrand] = useState('')

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        if (data.user.email) {
          setForm(prev => ({ ...prev, submitter_email: data.user!.email! }))
        }
        setGateState('form')
      } else {
        setGateState('gate')
      }
    })
  }, [])

  useEffect(() => {
    const hasAftermarket = Object.values(form).some(
      v => typeof v === 'string' && valueIndicatesModified(v)
    )
    const hasCatalogueDeviation = Object.entries(catalogueValues).some(([key, catalogueValue]) => {
      const formValue = form[key as keyof FormState]
      return Boolean(catalogueValue && formValue && formValue !== catalogueValue)
    })
    setIsModified(hasAftermarket || hasCatalogueDeviation)
  }, [form, catalogueValues])

  async function prefillFromModel(model: string) {
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase
      .from('catalogue_models')
      .select('pickup_configuration, bridge_type, switch_type, potentiometers, body_shape_analogue, body_wood, pickup_colour, headstock_face, headstock_style, fretboard_wood, scale_length, locking_nut')
      .eq('model', model)
      .order('catalogue_year', { ascending: false })
      .limit(1)
      .single()

    if (!data) return

    const updates: Partial<FormState> = {}
    const filled = new Set<keyof FormState>()

    if (data.pickup_configuration) {
      updates.pickup_configuration = data.pickup_configuration
      filled.add('pickup_configuration')
    }
    if (data.bridge_type) {
      updates.bridge_configuration = data.bridge_type
      filled.add('bridge_configuration')
      if (!TREMOLO_BRIDGES.includes(data.bridge_type)) updates.whammy_bar = ''
    }
    if (data.switch_type) {
      updates.switch_type = data.switch_type
      filled.add('switch_type')
    }
    if (data.potentiometers) {
      updates.potentiometers = data.potentiometers
      filled.add('potentiometers')
    }
    if (data.body_shape_analogue) {
      updates.body_shape_analogue = data.body_shape_analogue
      filled.add('body_shape_analogue')
    }
    if (data.body_wood) {
      updates.body_wood = data.body_wood
      filled.add('body_wood')
    }

    if (data.pickup_colour) {
      updates.pickup_colours = data.pickup_colour
      filled.add('pickup_colours')
    }
    if (data.headstock_face) {
      updates.headstock_face = data.headstock_face
      filled.add('headstock_face')
    }
    if (data.fretboard_wood) {
      updates.fretboard_wood = data.fretboard_wood
      filled.add('fretboard_wood')
    }
    if (data.headstock_style) {
      updates.headstock_style = data.headstock_style
      filled.add('headstock_style')
    }
    if (data.scale_length) {
      updates.scale_length = data.scale_length
      filled.add('scale_length')
    }
    if (data.locking_nut) {
      updates.nut_type = data.locking_nut
      filled.add('nut_type')
    }

    updates.tuner_style = 'Factory - Maverick/Wilkinson'
    filled.add('tuner_style')

    setForm(prev => ({ ...prev, ...updates }))
    setCatalogueValues(updates)
    setPrefilledFields(filled)
  }

  function handleModelChange(model: string) {
    setSerialDigits('')
    setPrefilledFields(new Set())
    setCatalogueValues({})
    setForm(prev => ({ ...prev, model, serial: '', serial_status: '' }))
    if (model && model !== 'Unknown') {
      prefillFromModel(model)
    }
  }

  function handleToggleModified(modified: boolean) {
    if (modified) {
      setPrefilledFields(new Set())
    } else if (form.model && form.model !== 'Unknown') {
      prefillFromModel(form.model)
    }
  }

  function set(key: keyof FormState) {
    return (value: string) => {
      // Side effects outside setState
      if (key === 'bridge_logo' && value !== 'Aftermarket branded') setBridgeLogoBrand('')
      if (key === 'neck_construction') {
        if (value === 'Factory - Bolt-on 2-piece scarf joint' || value === 'Factory - Bolt-on 1-piece') {
          setPrefilledFields(prev => new Set([...prev, 'skunk_stripe' as keyof FormState, 'neck_binding' as keyof FormState, 'fret_count' as keyof FormState]))
        } else {
          setPrefilledFields(prev => { const n = new Set(prev); n.delete('skunk_stripe'); n.delete('neck_binding'); n.delete('fret_count'); return n })
        }
      }
      if (key === 'skunk_stripe') {
        setPrefilledFields(prev => { const n = new Set(prev); n.delete('skunk_stripe'); return n })
      }
      if (key === 'neck_binding') {
        setPrefilledFields(prev => { const n = new Set(prev); n.delete('neck_binding'); return n })
      }
      if (key === 'fret_count') {
        setPrefilledFields(prev => { const n = new Set(prev); n.delete('fret_count'); return n })
      }
      if (key === 'bridge_configuration') {
        if (FLOYD_ROSE_BRIDGES.includes(value) || (value && value !== 'Unknown' && !TREMOLO_BRIDGES.includes(value))) {
          setPrefilledFields(prev => new Set([...prev, 'nut_type' as keyof FormState]))
        } else {
          setPrefilledFields(prev => { const n = new Set(prev); n.delete('nut_type'); return n })
        }
      }
      if (prefilledFields.has(key as keyof FormState) && value !== form[key as keyof FormState]) {
        setPrefilledFields(prev => { const n = new Set(prev); n.delete(key as keyof FormState); return n })
      }
      setForm(prev => {
        const next = { ...prev, [key]: value }
        if (key === 'finish_type') { next.factory_colour = ''; next.custom_shop_colour = '' }
        if (key === 'bridge_configuration') {
          if (!TREMOLO_BRIDGES.includes(value)) next.whammy_bar = ''
          if (FLOYD_ROSE_BRIDGES.includes(value)) {
            next.nut_type = 'Factory - Locking nut'
          } else if (value && value !== 'Unknown' && !TREMOLO_BRIDGES.includes(value)) {
            next.nut_type = 'Factory - Standard nut'
          }
        }
        if (key === 'neck_construction') {
          if (value === 'Factory - Bolt-on 2-piece scarf joint') {
            next.skunk_stripe = 'Factory - Skunk stripe'
            next.neck_binding = 'Factory - No Binding'
            next.fret_count = '24'
          } else if (value === 'Factory - Bolt-on 1-piece') {
            next.skunk_stripe = 'Factory - No skunk stripe'
            next.neck_binding = 'Factory - Cream Binding'
            next.fret_count = '24'
          } else if (value === 'Factory - Set neck' || value === 'Factory - Through neck') {
            next.skunk_stripe = 'Unknown'
            next.neck_binding = 'Unknown'
            next.fret_count = ''
          } else if (value === 'Aftermarket replacement neck') {
            next.skunk_stripe = 'Aftermarket replacement neck'
            next.neck_binding = 'Unknown'
            next.fret_count = ''
          } else {
            next.skunk_stripe = ''
            next.neck_binding = ''
            next.fret_count = ''
          }
        }
        return next
      })
    }
  }


  function handleSerialDigits(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 5)
    setSerialDigits(digits)
    const prefix = MODEL_CONFIG[form.model]?.prefix ?? ''
    if (digits.length === 0) {
      setForm(prev => ({ ...prev, serial: '', serial_status: '' }))
    } else {
      const padded = digits.padStart(5, '0')
      setForm(prev => ({
        ...prev,
        serial: `${prefix}${padded}`,
        serial_status: digits.length === 5 ? 'Complete' : 'Partial',
      }))
    }
  }

  function handleSlotFile(index: number, file: File | null) {
    if (!file) {
      setImageSlots(prev => prev.map((slot, i) => {
        if (i !== index) return slot
        if (slot.preview) URL.revokeObjectURL(slot.preview)
        return { ...slot, file: null, preview: null }
      }))
      return
    }
    setCropTarget({ index, file })
  }

  function handleCropConfirm(croppedFile: File) {
    const index = cropTarget?.index
    if (index == null) return
    setImageSlots(prev => prev.map((slot, i) => {
      if (i !== index) return slot
      if (slot.preview) URL.revokeObjectURL(slot.preview)
      return { ...slot, file: croppedFile, preview: URL.createObjectURL(croppedFile) }
    }))
    setCropTarget(null)
  }

  async function uploadImages(): Promise<Map<string, string>> {
    const result = new Map<string, string>()
    for (const slot of imageSlots) {
      if (!slot.file) continue
      const fd = new FormData()
      fd.append('image', slot.file)
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) result.set(slot.position, data.url)
    }
    return result
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.submitter_email) { setError('Email is required'); return }
    setSubmitting(true)
    setError('')

    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      const hasImages = imageSlots.some(s => s.file)
      const uploadedMap = hasImages ? await uploadImages() : new Map<string, string>()
      const imageUrls = IMAGE_SCHEMA.map(p => uploadedMap.get(p)).filter((u): u is string => Boolean(u))

      let registeredBy = 'Anonymous'
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        registeredBy = profile?.username ?? split_email_prefix(user.email ?? '')
      }

      const notesPrefix = isModified ? '[Modified] ' : ''
      const payload = {
        user_id: user?.id ?? null,
        registered_by: registeredBy,
        serial: form.serial || null,
        serial_status: (form.serial_status || null),
        series: (MODEL_CONFIG[form.model]?.series ?? null),
        model: form.model || null,
        generation: null,
        catalogue_year: null,
        finish_type: (form.finish_type || null),
        factory_colour: form.factory_colour || null,
        custom_shop_colour: form.custom_shop_colour || null,
        body_wood: form.body_wood || null,
        body_shape_analogue: form.body_shape_analogue || null,
        pickup_configuration: form.pickup_configuration || null,
        neck_pickup: form.neck_pickup || null,
        middle_pickup: form.middle_pickup || null,
        bridge_pickup: form.bridge_pickup || null,
        bridge_configuration: form.bridge_configuration || null,
        hardware_colour: form.hardware_colour || null,
        headstock_face: form.headstock_face || null,
        headstock_style: form.headstock_style || null,
        headstock_logo: form.headstock_logo || null,
        bridge_logo: form.bridge_logo === 'Aftermarket branded' && bridgeLogoBrand
          ? `Aftermarket branded — ${bridgeLogoBrand}`
          : form.bridge_logo || null,
        pickup_surrounds: form.pickup_surrounds || null,
        pickup_colours: form.pickup_colours || null,
        tuner_style: form.tuner_style || null,
        neck_binding: form.neck_binding || null,
        switch_type: form.switch_type || null,
        switch_knob: form.switch_knob || null,
        potentiometers: form.potentiometers || null,
        whammy_bar: form.whammy_bar || null,
        nut_type: form.nut_type || null,
        fret_count: form.fret_count || null,
        fretboard_wood: form.fretboard_wood || null,
        scale_length: form.scale_length || null,
        neck_construction: form.neck_construction || null,
        skunk_stripe: form.skunk_stripe || null,
        headstock_break_angle: form.headstock_break_angle ? parseFloat(form.headstock_break_angle) : null,
        neck_pitch: form.neck_pitch ? parseFloat(form.neck_pitch) : null,
        left_handed: form.left_handed || null,
        last_known_country: form.last_known_country || null,
        last_known_region: form.last_known_region || null,
        last_known_city: form.last_known_city || null,
        source_type: form.source_type || null,
        source_url: form.source_url || null,
        last_price: form.last_price ? parseFloat(form.last_price) : null,
        submitter_email: form.submitter_email,
        submission_notes: `${notesPrefix}${form.submission_notes}`.trim() || null,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        primary_image_url: uploadedMap.get('Full front') ?? imageUrls[0] ?? null,
        status: 'Pending',
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await supabase.from('guitars').insert(payload as any)

      if (dbError) throw dbError
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (gateState === 'checking') {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#3a3835', letterSpacing: '3px', textTransform: 'uppercase' }}>
          Loading...
        </p>
      </div>
    )
  }

  if (gateState === 'gate') {
    return (
      <>
        {/* Header */}
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
            }}>Registry Submission</p>
            <h1 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(52px, 7vw, 88px)',
              letterSpacing: '3px', lineHeight: 0.92,
              color: '#f0ede8', marginBottom: '24px',
            }}>REGISTER YOUR GUITAR</h1>
            <p style={{ maxWidth: '560px', color: '#9e9b96', fontSize: '16px', lineHeight: 1.7 }}>
              Add your Maverick to the archive. All submissions are reviewed before appearing in the registry.
              An account lets you track your submissions and build your guitar history.
            </p>
          </div>
        </section>

        {/* Options */}
        <section style={{ padding: '5rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
            marginBottom: '32px',
          }}>
            {/* Sign in */}
            <Link href="/login" style={{
              display: 'block', background: '#161616', padding: '2.5rem 2rem',
              textDecoration: 'none', transition: 'background 0.15s',
              borderBottom: '2px solid transparent',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#1a1a1a'
              ;(e.currentTarget as HTMLElement).style.borderBottomColor = '#c8a96e'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#161616'
              ;(e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent'
            }}
            >
              <div style={{
                fontFamily: 'var(--font-bebas)', fontSize: '36px',
                letterSpacing: '2px', color: '#c8a96e', marginBottom: '12px',
              }}>Sign In</div>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#9e9b96', lineHeight: 1.7, marginBottom: '20px' }}>
                Already have an account? Sign in and your submission will be linked to your profile — you can track it, view approval status, and build a record of all your guitars.
              </p>
              <span style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                letterSpacing: '1px', textTransform: 'uppercase',
                color: '#c8a96e',
              }}>Sign in →</span>
            </Link>

            {/* Create account */}
            <Link href="/register" style={{
              display: 'block', background: '#161616', padding: '2.5rem 2rem',
              textDecoration: 'none', transition: 'background 0.15s',
              borderBottom: '2px solid transparent',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#1a1a1a'
              ;(e.currentTarget as HTMLElement).style.borderBottomColor = '#c8a96e'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#161616'
              ;(e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent'
            }}
            >
              <div style={{
                fontFamily: 'var(--font-bebas)', fontSize: '36px',
                letterSpacing: '2px', color: '#c8a96e', marginBottom: '12px',
              }}>Create Account</div>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#9e9b96', lineHeight: 1.7, marginBottom: '20px' }}>
                New to the registry? Create a free account in under a minute. Everything you submit gets tied to your profile — you can come back, add photos, and see your guitars in the archive.
              </p>
              <span style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                letterSpacing: '1px', textTransform: 'uppercase',
                color: '#c8a96e',
              }}>Register →</span>
            </Link>
          </div>

          {/* Guest option */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '2rem', flexWrap: 'wrap',
            padding: '1.75rem 2rem',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.01)',
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
                color: '#9e9b96', marginBottom: '4px',
              }}>Continue as guest</div>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57' }}>
                No account needed — you&apos;ll just need to provide an email address for follow-up. Your submission won&apos;t be linked to a profile.
              </div>
            </div>
            <button
              onClick={() => setGateState('form')}
              style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.12)',
                color: '#9e9b96', fontFamily: 'var(--font-dm-mono)',
                fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
                padding: '10px 20px', cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'
                ;(e.currentTarget as HTMLElement).style.color = '#f0ede8'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'
                ;(e.currentTarget as HTMLElement).style.color = '#9e9b96'
              }}
            >
              Continue as guest →
            </button>
          </div>
        </section>
      </>
    )
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
        <div style={{ width: '100%', maxWidth: '560px' }}>
          <p style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
            letterSpacing: '3px', color: '#c8a96e',
            textTransform: 'uppercase', marginBottom: '20px',
          }}>
            Submission received
          </p>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(48px, 7vw, 80px)',
            letterSpacing: '3px', lineHeight: 0.92,
            color: '#f0ede8', marginBottom: '28px',
          }}>
            GUITAR REGISTERED
          </h1>
          <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.75, marginBottom: '8px' }}>
            Your submission is pending review. Once approved it will appear in the registry.
          </p>
          {form.submitter_email && (
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#5c5a57', marginBottom: '40px' }}>
              Confirmation will be sent to {form.submitter_email}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                letterSpacing: '1px', textTransform: 'uppercase',
                color: '#c8a96e', textDecoration: 'none',
              }}
            >
              ← Back to registry
            </Link>
            <button
              onClick={() => {
                setSubmitted(false)
                setForm(INITIAL)
                setSerialDigits('')
                setImageSlots(prev => {
                  prev.forEach(s => { if (s.preview) URL.revokeObjectURL(s.preview) })
                  return makeInitialSlots()
                })
                setPrefilledFields(new Set())
                setCatalogueValues({})
                setBridgeLogoBrand('')
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                letterSpacing: '1px', textTransform: 'uppercase',
                color: '#5c5a57',
              }}
            >
              Register another →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Register your guitar</h1>
        <p className="text-zinc-400">Fill in as much as you know. All submissions are reviewed before appearing in the registry.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Guitar identity">
          {/* Model — grouped by series */}
          <div className="sm:col-span-2">
            <Field label="Model *">
              <select
                value={form.model}
                onChange={e => handleModelChange(e.target.value)}
                required
                className={selectCls}
              >
                <option value="">Select your model…</option>
                <option value="Unknown">Unknown — can&apos;t identify</option>
                {Object.entries(MODEL_GROUPS).filter(([s]) => s !== 'Unknown').map(([series, models]) => (
                  <optgroup key={series} label={series}>
                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                  </optgroup>
                ))}
              </select>
            </Field>
          </div>

          {/* Serial — prefix auto-filled, user enters 5-digit code */}
          <div className="sm:col-span-2">
            <Field label="Serial number">
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <span style={{
                  display: 'flex', alignItems: 'center',
                  background: '#141414',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRight: 'none',
                  padding: '0 12px',
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: '13px',
                  color: form.model ? '#c8a96e' : '#3a3835',
                  letterSpacing: '1px',
                  whiteSpace: 'nowrap',
                  minWidth: '56px',
                }}>
                  {form.model ? (MODEL_CONFIG[form.model]?.prefix || '?-') : '—'}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={serialDigits}
                  onChange={e => handleSerialDigits(e.target.value)}
                  disabled={!form.model}
                  placeholder={form.model ? '5-digit code' : 'Select model first'}
                  maxLength={5}
                  className={inputCls}
                  style={{ flex: 1 }}
                />
                {serialDigits.length > 0 && (
                  <span style={{
                    display: 'flex', alignItems: 'center',
                    padding: '0 10px',
                    background: '#141414',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderLeft: 'none',
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '11px',
                    color: serialDigits.length === 5 ? '#27ae60' : '#c8a96e',
                    whiteSpace: 'nowrap',
                  }}>
                    {serialDigits.length}/5
                  </span>
                )}
              </div>
              {serialDigits.length > 0 && (
                <p style={{
                  fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                  color: '#5c5a57', marginTop: '5px',
                }}>
                  Full serial: <span style={{ color: '#9e9b96' }}>{form.serial}</span>
                  {' · '}
                  <span style={{ color: serialDigits.length === 5 ? '#27ae60' : '#c8a96e' }}>
                    {serialDigits.length === 5 ? 'Complete' : 'Partial'}
                  </span>
                </p>
              )}
              {!serialDigits && (
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#3a3835', marginTop: '5px' }}>
                  Leave blank if serial is missing or not visible — you can set the status below
                </p>
              )}
            </Field>
          </div>

          {/* Serial status — only shown when no digits entered */}
          {!serialDigits && (
            <Field label="Serial status">
              <Select
                value={form.serial_status}
                onChange={set('serial_status')}
                options={['Prefix only', 'None Visible', 'Paper label', 'Hand label']}
                placeholder="Unknown / not entered"
              />
            </Field>
          )}

          {/* Label content — shown when a label-based serial is indicated */}
          {(form.serial_status === 'Paper label' || form.serial_status === 'Hand label') && (
            <div className="sm:col-span-2">
              <Field label="Label content">
                <input
                  type="text"
                  value={form.serial}
                  onChange={e => setForm(prev => ({ ...prev, serial: e.target.value.slice(0, 60) }))}
                  placeholder="Describe or transcribe the label — e.g. 'Prototype 003', handwritten number…"
                  maxLength={60}
                  className={inputCls}
                />
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#3a3835', marginTop: '5px' }}>
                  May indicate a pre-production or prototype instrument. Record exactly what is written.
                </p>
              </Field>
            </div>
          )}

          {/* Factory / Modified toggle */}
          <div className="sm:col-span-2">
            <label className="block text-sm text-zinc-400 mb-2">Guitar spec</label>
            <div style={{ display: 'inline-flex', border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden' }}>
              {(['Factory', 'Modified'] as const).map(val => {
                const active = val === 'Factory' ? !isModified : isModified
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleToggleModified(val === 'Modified')}
                    style={{
                      padding: '8px 28px',
                      fontFamily: 'var(--font-dm-mono)',
                      fontSize: '12px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: 'pointer',
                      background: active ? '#c8a96e' : 'transparent',
                      color: active ? '#000' : '#5c5a57',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                  >
                    {val}
                  </button>
                )
              })}
            </div>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#3a3835', marginTop: '6px' }}>
              {isModified
                ? 'Fill in the spec as it currently is — hardware fields will not be auto-filled.'
                : form.model && form.model !== 'Unknown'
                  ? 'Catalogue spec has been pre-filled. Update any fields that differ on your guitar.'
                  : 'Select a model to auto-fill catalogue spec — update anything that differs.'}
            </p>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Handed</label>
            <div style={{ display: 'inline-flex', border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden' }}>
              {(['No', 'Yes'] as const).map(val => {
                const active = form.left_handed === val
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => set('left_handed')(val)}
                    style={{
                      padding: '8px 20px',
                      fontFamily: 'var(--font-dm-mono)',
                      fontSize: '12px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: 'pointer',
                      background: active ? '#c8a96e' : 'transparent',
                      color: active ? '#000' : '#5c5a57',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                  >
                    {val === 'No' ? 'Right handed' : 'Left handed'}
                  </button>
                )
              })}
            </div>
          </div>
        </Section>

        <Section title="Finish & colour">
          <Field label="Finish type">
            <Select value={form.finish_type} onChange={set('finish_type')} options={['Factory Finish', 'Custom Shop Finish', 'Refinished', 'Unknown']} />
          </Field>
          {(!form.finish_type || form.finish_type === 'Factory Finish') && (
            <Field label="Factory colour">
              <Select value={form.factory_colour} onChange={set('factory_colour')} options={FACTORY_COLOURS} />
            </Field>
          )}
          {form.finish_type === 'Custom Shop Finish' && (
            <Field label="Custom Shop colour">
              <Select value={form.custom_shop_colour} onChange={set('custom_shop_colour')} options={CUSTOM_COLOURS} />
            </Field>
          )}
          {form.finish_type === 'Refinished' && (
            <Field label="Refinish description">
              <input
                type="text"
                value={form.custom_shop_colour}
                onChange={e => set('custom_shop_colour')(e.target.value.slice(0, 100))}
                placeholder="e.g. Satin black rattle-can, sunburst respray…"
                maxLength={100}
                className={inputCls}
              />
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#3a3835', marginTop: '5px' }}>
                {form.custom_shop_colour.length}/100 characters
              </p>
            </Field>
          )}
          {form.finish_type === 'Unknown' && (
            <Field label="Finish description (optional)">
              <input
                type="text"
                value={form.custom_shop_colour}
                onChange={e => set('custom_shop_colour')(e.target.value.slice(0, 100))}
                placeholder="Describe what you can see, e.g. dark blue metallic…"
                maxLength={100}
                className={inputCls}
              />
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#3a3835', marginTop: '5px' }}>
                {form.custom_shop_colour.length}/100 characters
              </p>
            </Field>
          )}
          <Field label="Headstock face colour" prefilled={prefilledFields.has('headstock_face')}>
            <Select value={form.headstock_face} onChange={set('headstock_face')} options={['Gloss Black', 'Matches body colour', 'Other']} />
          </Field>
          <Field label="Headstock logo">
            <Select value={form.headstock_logo} onChange={set('headstock_logo')} options={['Reflective metal inlay', 'Cream silkscreen', 'Unknown']} />
          </Field>
          <Field label="Body wood">
            <Select value={form.body_wood} onChange={set('body_wood')} options={['Canadian Basswood', 'Alder', 'Mahogany', 'Basswood', 'Unknown']} />
          </Field>
          <Field label="Body shape analogue" prefilled={prefilledFields.has('body_shape_analogue')}>
            <Select value={form.body_shape_analogue} onChange={set('body_shape_analogue')} options={['Superstrat', 'Explorer-Mockingbird', 'Les Paul', 'Single Cutaway', 'PRS', 'Telecaster', 'Superbass', 'Other', 'Unknown']} />
          </Field>
        </Section>

        <Section title="Hardware & electronics">
          <div className="sm:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Hardware */}
              <div className="flex flex-col gap-4">
                <Field label="Bridge" prefilled={prefilledFields.has('bridge_configuration')}>
                  <Select value={form.bridge_configuration} onChange={set('bridge_configuration')} options={['Maverick Floyd Rose - Licensed', 'Floyd Rose - Aftermarket', 'Maverick/Wilkinson Hardtail', 'Hardtail - Aftermarket', 'Tune-o-matic - String Through', 'Standard Tune-o-matic - Nashville', 'Wraparound', 'Synchronised Tremolo - Fender Style', 'Unknown']} />
                </Field>
                <Field label="Bridge logo">
                  <Select value={form.bridge_logo} onChange={set('bridge_logo')} options={['Maverick Italic script logo', 'Maverick Stencil script logo', 'No logo', 'Aftermarket branded', 'Unknown']} />
                  {form.bridge_logo === 'Aftermarket branded' && (
                    <input
                      type="text"
                      value={bridgeLogoBrand}
                      onChange={e => setBridgeLogoBrand(e.target.value.slice(0, 60))}
                      placeholder="Brand name, e.g. Floyd Rose, Gotoh…"
                      maxLength={60}
                      className={inputCls}
                      style={{ marginTop: '6px' }}
                    />
                  )}
                </Field>
                {TREMOLO_BRIDGES.includes(form.bridge_configuration) && (
                  <Field label="Whammy bar">
                    <Select value={form.whammy_bar} onChange={set('whammy_bar')} options={WHAMMY_OPTIONS} />
                  </Field>
                )}
                <Field label="Humbucker surrounds">
                  <Select value={form.pickup_surrounds} onChange={set('pickup_surrounds')} options={['Factory - No Surrounds', 'Factory - Metal Surrounds', 'Factory - Plastic Surrounds', 'Aftermarket Surrounds', 'Unknown']} />
                </Field>
                <Field label="Hardware colour">
                  <Select value={form.hardware_colour} onChange={set('hardware_colour')} options={['Gold', 'Black', 'Nickel', 'Unknown']} />
                </Field>
                <Field label="Switch knob">
                  <Select value={form.switch_knob} onChange={set('switch_knob')} options={['Factory - Cylindrical with O-rings', 'Factory - Tapered', 'Aftermarket Replacement', 'Unknown']} />
                </Field>
                <Field label="Tuner style" prefilled={prefilledFields.has('tuner_style')}>
                  <Select value={form.tuner_style} onChange={set('tuner_style')} options={['Factory - Maverick/Wilkinson', 'Standard Die-Cast', 'Locking Tuners', 'Grover', 'Schaller', 'Gotoh', 'Aftermarket', 'Unknown']} />
                </Field>
              </div>

              {/* Electronics */}
              <div className="flex flex-col gap-4">
                <Field label="Pickup configuration" prefilled={prefilledFields.has('pickup_configuration')}>
                  <Select value={form.pickup_configuration} onChange={set('pickup_configuration')} options={['HH', 'HSH', 'HSS', 'HS', 'H', 'SS', 'SSS', 'Other', 'Unknown']} />
                </Field>
                {(() => {
                  const pos = PICKUP_CONFIG_MAP[form.pickup_configuration]
                  const bridgeLabel = pos?.bridge ? `Bridge pickup — ${pos.bridge}` : 'Bridge pickup'
                  const middleLabel = pos?.middle ? `Middle pickup — ${pos.middle}` : 'Middle pickup'
                  const neckLabel   = pos?.neck   ? `Neck pickup — ${pos.neck}`     : 'Neck pickup'
                  const hasMiddle   = pos ? pos.middle !== null : true
                  return (
                    <>
                      <Field label={bridgeLabel}>
                        <input type="text" value={form.bridge_pickup} onChange={e => set('bridge_pickup')(e.target.value)} placeholder="e.g. Duncan Designed HB-102" className={inputCls} />
                      </Field>
                      {hasMiddle && (
                        <Field label={middleLabel}>
                          <input type="text" value={form.middle_pickup} onChange={e => set('middle_pickup')(e.target.value)} placeholder="e.g. Wilkinson single coil" className={inputCls} />
                        </Field>
                      )}
                      <Field label={neckLabel}>
                        <input type="text" value={form.neck_pickup} onChange={e => set('neck_pickup')(e.target.value)} placeholder="e.g. Duncan Designed HB-102" className={inputCls} />
                      </Field>
                    </>
                  )
                })()}
                <Field label="Pickup colours" prefilled={prefilledFields.has('pickup_colours')}>
                  <Select value={form.pickup_colours} onChange={set('pickup_colours')} options={['All Black', 'All Cream', 'Zebra — Black/Cream', 'All White', 'Nickel Covers', 'Unknown']} />
                </Field>
                <Field label="Switch type" prefilled={prefilledFields.has('switch_type')}>
                  <Select value={form.switch_type} onChange={set('switch_type')} options={['Factory 5 Way Blade Switch', 'Factory 3 Way Blade Switch', 'Factory 3 Way Toggle Switch', 'Aftermarket Switch', 'Unknown']} />
                </Field>
                <Field label="Potentiometers" prefilled={prefilledFields.has('potentiometers')}>
                  <Select value={form.potentiometers} onChange={set('potentiometers')} options={['Factory Patented Evolution Roller Pots', 'Factory Standard Through Body Pots', 'Aftermarket Replacement', 'Unknown']} />
                </Field>
              </div>

            </div>
          </div>
        </Section>

        <Section title="Neck & construction">
          <Field label="Neck construction">
            <Select value={form.neck_construction} onChange={set('neck_construction')} options={['Factory - Bolt-on 2-piece scarf joint', 'Factory - Bolt-on 1-piece', 'Factory - Set neck', 'Factory - Through neck', 'Aftermarket replacement neck', 'Unknown']} />
          </Field>
          <Field label="Headstock style" prefilled={prefilledFields.has('headstock_style')}>
            <Select value={form.headstock_style} onChange={set('headstock_style')} options={['6-aside', '6-aside reversed', '4-aside', '3+2 (3 tuners standard side, 2 opposing edge)', 'Unknown']} />
          </Field>
          <Field label="Scale length" prefilled={prefilledFields.has('scale_length')}>
            <Select value={form.scale_length} onChange={set('scale_length')} options={['25" (Maverick / PRS Core)', '25.5" (Fender / Ibanez)', '24.75" (Gibson)', '24.724" (PRS SE)', 'Unknown']} />
          </Field>
          <Field label="Fret count" prefilled={prefilledFields.has('fret_count')}>
            <Select value={form.fret_count} onChange={set('fret_count')} options={['19', '21', '22', '24', 'Unknown']} />
          </Field>
          <Field label="Fretboard wood" prefilled={prefilledFields.has('fretboard_wood')}>
            <Select value={form.fretboard_wood} onChange={set('fretboard_wood')} options={['AAA Indian Rosewood', 'Maple', 'Ebony', 'Split — Rosewood & Maple', 'Unknown']} />
          </Field>
          <Field label="Nut type" prefilled={prefilledFields.has('nut_type')}>
            <Select value={form.nut_type} onChange={set('nut_type')} options={['Factory - Standard nut', 'Factory - Locking nut', 'Aftermarket - GraphTech nut', 'Aftermarket - Bone nut', 'Aftermarket - Standard nut', 'Aftermarket - Locking nut', 'Aftermarket - Other nut', 'Unknown']} />
          </Field>
          <Field label="Neck binding" prefilled={prefilledFields.has('neck_binding')}>
            <Select value={form.neck_binding} onChange={set('neck_binding')} options={['Factory - No Binding', 'Factory - Cream Binding', 'Refinished Binding', 'Unknown']} />
          </Field>
          <Field label="Skunk stripe" prefilled={prefilledFields.has('skunk_stripe')}>
            <Select value={form.skunk_stripe} onChange={set('skunk_stripe')} options={['Factory - Skunk stripe', 'Factory - No skunk stripe', 'Aftermarket replacement neck', 'Unknown']} />
          </Field>
          <Field label="Headstock break angle (degrees)">
            <input type="number" step="0.1" value={form.headstock_break_angle} onChange={e => set('headstock_break_angle')(e.target.value)} placeholder="e.g. 13" className={inputCls} />
          </Field>
          <Field label="Neck pitch (mm packing to level)">
            <input type="number" step="0.1" value={form.neck_pitch} onChange={e => set('neck_pitch')(e.target.value)} placeholder="e.g. 8" className={inputCls} />
          </Field>
        </Section>

        <Section title="Provenance">
          <Field label="Source type">
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#141414', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '4px', padding: '8px 12px',
            }}>
              <span style={{ color: '#f0ede8', fontSize: '14px' }}>Owner registration</span>
              <span style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '9px',
                letterSpacing: '1px', textTransform: 'uppercase', color: '#3a3835',
              }}>locked</span>
            </div>
          </Field>
          <Field label="Last known price (£)">
            <input type="number" step="0.01" value={form.last_price} onChange={e => set('last_price')(e.target.value)} placeholder="e.g. 250" className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Source URL">
              <input type="url" value={form.source_url} onChange={e => set('source_url')(e.target.value)} placeholder="https://…" className={inputCls} />
            </Field>
          </div>
          <Field label="Last known country">
            <Select value={form.last_known_country} onChange={set('last_known_country')} options={['United Kingdom', 'Ireland', 'United States', 'Canada', 'Australia', 'New Zealand', 'Germany', 'France', 'Netherlands', 'Belgium', 'Sweden', 'Norway', 'Denmark', 'Spain', 'Italy', 'Other']} />
          </Field>
          <Field label="Last known region">
            <input type="text" value={form.last_known_region} onChange={e => set('last_known_region')(e.target.value)} placeholder="e.g. Scotland, California, New South Wales…" maxLength={80} className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Last known city">
              <input type="text" value={form.last_known_city} onChange={e => set('last_known_city')(e.target.value)} placeholder="e.g. Glasgow, Los Angeles, Sydney…" maxLength={80} className={inputCls} />
            </Field>
          </div>
        </Section>

        <Section title="Photos">
          <div className="sm:col-span-2">
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', marginBottom: '10px', lineHeight: 1.6 }}>
              Upload a photo for each position where possible. Clear, well-lit shots help with verification and make your entry stand out in the registry.
            </p>
            <div style={{ marginBottom: '16px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a96e', marginBottom: '8px' }}>
                Photo tips
              </p>
              <ul style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#5c5a57', lineHeight: 1.8, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>— Natural or soft diffused light works best — avoid direct flash</li>
                <li>— Plain backgrounds help: a light-coloured carpet, rug, or clean towel laid flat is ideal</li>
                <li>— Plain wrapping paper or a roll of craft paper makes an easy portable backdrop</li>
                <li>— A guitar stand in front of a neutral wall works well for full-length shots</li>
                <li>— Wall hangers provide a clean, consistent angle for front and rear views</li>
                <li>— Keep the guitar centred and fill the frame — avoid wide empty borders</li>
              </ul>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {imageSlots.map((slot, i) => (
                <div key={slot.position} style={{ position: 'relative' }}>
                  <label style={{ display: 'block', cursor: 'pointer' }}>
                    <div style={{
                      position: 'relative',
                      aspectRatio: '3 / 4',
                      border: `1px solid ${slot.file ? 'rgba(200,169,110,0.35)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '4px',
                      overflow: 'hidden',
                      background: '#0d0d0d',
                      transition: 'border-color 0.15s',
                    }}>
                      {slot.preview ? (
                        <img src={slot.preview} alt={slot.position} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <span style={{ color: '#2a2a2a', fontSize: '28px', lineHeight: 1 }}>+</span>
                        </div>
                      )}
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        padding: '5px 8px',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-dm-mono)', fontSize: '8px',
                          letterSpacing: '1px', textTransform: 'uppercase',
                          color: slot.file ? '#c8a96e' : '#3a3835',
                        }}>
                          {slot.position}
                        </span>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => handleSlotFile(i, e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {slot.file && (
                    <button
                      type="button"
                      onClick={() => handleSlotFile(i, null)}
                      style={{
                        position: 'absolute', top: '6px', right: '6px',
                        background: 'rgba(0,0,0,0.75)', border: 'none',
                        borderRadius: '2px', width: '22px', height: '22px',
                        cursor: 'pointer', color: '#9e9b96',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {imageSlots.some(s => s.file) && (
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', marginTop: '12px' }}>
                {imageSlots.filter(s => s.file).length} of {IMAGE_SCHEMA.length} positions filled
              </p>
            )}
          </div>
        </Section>

        <Section title="Your details">
          <Field label="Your email" required>
            <input type="email" value={form.submitter_email} onChange={e => set('submitter_email')(e.target.value)} placeholder="never displayed publicly" required className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea
                value={form.submission_notes}
                onChange={e => set('submission_notes')(e.target.value)}
                rows={4}
                placeholder="Anything else you'd like to add — mods, history, provenance…"
                className={inputCls + ' resize-none'}
              />
            </Field>
          </div>
        </Section>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-white text-zinc-950 font-semibold py-3 rounded text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit guitar for review'}
        </button>
      </form>

      {cropTarget && (
        <GuidedCropModal
          file={cropTarget.file}
          position={imageSlots[cropTarget.index].position}
          bodyShape={form.body_shape_analogue || undefined}
          headstockStyle={form.headstock_style || undefined}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropTarget(null)}
        />
      )}
    </div>
  )
}
