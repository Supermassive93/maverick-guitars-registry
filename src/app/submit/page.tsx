'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { PRERELEASE } from '@/lib/config'

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
  neck_construction: string
  skunk_stripe: string
  headstock_break_angle: string
  neck_pitch: string
  left_handed: string
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
  hardware_colour: '', headstock_face: '', headstock_logo: '', bridge_logo: '', pickup_surrounds: '',
  pickup_colours: '', tuner_style: '',
  neck_binding: '', switch_type: '', switch_knob: '', potentiometers: '',
  whammy_bar: '', neck_construction: '', skunk_stripe: '', headstock_break_angle: '',
  neck_pitch: '', source_type: '', source_url: '', last_price: '',
  submitter_email: '', submission_notes: '',
}

// Map catalogue_models DB values → form dropdown values

function mapBodyShape(db: string | null): string {
  if (!db) return ''
  if (db === 'Explorer/Mockingbird') return 'Explorer-Mockingbird'
  return db
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
  const [images, setImages] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isModified, setIsModified] = useState(false)
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

  async function prefillFromModel(model: string) {
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase
      .from('catalogue_models')
      .select('pickup_configuration, bridge_type, switch_type, potentiometers, body_shape_analogue, pickup_colour, headstock_face')
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
    const mappedShape = mapBodyShape(data.body_shape_analogue)
    if (mappedShape) {
      updates.body_shape_analogue = mappedShape
      filled.add('body_shape_analogue')
    }

    if (data.pickup_colour) {
      updates.pickup_colours = data.pickup_colour
      filled.add('pickup_colours')
    }
    if (data.headstock_face) {
      updates.headstock_face = data.headstock_face
      filled.add('headstock_face')
    }

    updates.tuner_style = 'Factory - Maverick/Wilkinson'
    filled.add('tuner_style')

    setForm(prev => ({ ...prev, ...updates }))
    setPrefilledFields(filled)
  }

  function handleModelChange(model: string) {
    setSerialDigits('')
    setPrefilledFields(new Set())
    setForm(prev => ({ ...prev, model, serial: '', serial_status: '' }))
    if (!isModified && model && model !== 'Unknown') {
      prefillFromModel(model)
    }
  }

  function handleToggleModified(modified: boolean) {
    setIsModified(modified)
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
          setPrefilledFields(prev => new Set([...prev, 'skunk_stripe' as keyof FormState, 'neck_binding' as keyof FormState]))
        } else {
          setPrefilledFields(prev => { const n = new Set(prev); n.delete('skunk_stripe'); n.delete('neck_binding'); return n })
        }
      }
      if (key === 'skunk_stripe') {
        setPrefilledFields(prev => { const n = new Set(prev); n.delete('skunk_stripe'); return n })
      }
      if (key === 'neck_binding') {
        setPrefilledFields(prev => { const n = new Set(prev); n.delete('neck_binding'); return n })
      }
      // If user overrides a prefilled (catalogue-known) field, auto-switch to Modified
      if (prefilledFields.has(key as keyof FormState) && value !== form[key as keyof FormState]) {
        setIsModified(true)
        setPrefilledFields(prev => { const n = new Set(prev); n.delete(key as keyof FormState); return n })
      }
      setForm(prev => {
        const next = { ...prev, [key]: value }
        if (key === 'finish_type') { next.factory_colour = ''; next.custom_shop_colour = '' }
        if (key === 'bridge_configuration' && !TREMOLO_BRIDGES.includes(value)) { next.whammy_bar = '' }
        if (key === 'neck_construction') {
          if (value === 'Factory - Bolt-on 2-piece scarf joint') {
            next.skunk_stripe = 'Factory - Skunk stripe'
            next.neck_binding = 'Factory - No Binding'
          } else if (value === 'Factory - Bolt-on 1-piece') {
            next.skunk_stripe = 'Factory - No skunk stripe'
            next.neck_binding = 'Factory - Cream Binding'
          } else if (value === 'Set neck' || value === 'Through neck') {
            next.skunk_stripe = 'Unknown'
            next.neck_binding = 'Unknown'
          } else if (value === 'Aftermarket replacement neck') {
            next.skunk_stripe = 'Aftermarket replacement neck'
            next.neck_binding = 'Unknown'
          } else {
            next.skunk_stripe = ''
            next.neck_binding = ''
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

  async function uploadImages(): Promise<string[]> {
    const urls: string[] = []
    for (const file of images) {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) urls.push(data.url)
    }
    return urls
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.submitter_email) { setError('Email is required'); return }
    setSubmitting(true)
    setError('')

    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      const imageUrls = images.length > 0 ? await uploadImages() : []

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
        neck_construction: form.neck_construction || null,
        skunk_stripe: form.skunk_stripe || null,
        headstock_break_angle: form.headstock_break_angle ? parseFloat(form.headstock_break_angle) : null,
        neck_pitch: form.neck_pitch ? parseFloat(form.neck_pitch) : null,
        left_handed: form.left_handed || null,
        source_type: form.source_type || null,
        source_url: form.source_url || null,
        last_price: form.last_price ? parseFloat(form.last_price) : null,
        submitter_email: form.submitter_email,
        submission_notes: `${notesPrefix}${form.submission_notes}`.trim() || null,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        primary_image_url: imageUrls[0] ?? null,
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
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-6">✓</p>
        <h1 className="text-2xl font-bold text-white mb-3">Submission received</h1>
        <p className="text-zinc-400">Your guitar has been submitted for review. Once approved it will appear in the registry.</p>
        <a href="/" className="inline-block mt-8 text-sm text-red-500 hover:text-red-400">← Back to registry</a>
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
                    {val === 'No' ? 'Right Handed' : 'Left Handed'}
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
            <Select value={form.body_shape_analogue} onChange={set('body_shape_analogue')} options={['Superstrat', 'Explorer-Mockingbird', 'Les Paul', 'Single Cutaway', 'PRS', 'Telecaster', 'Other', 'Unknown']} />
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
            <Select value={form.neck_construction} onChange={set('neck_construction')} options={['Factory - Bolt-on 2-piece scarf joint', 'Factory - Bolt-on 1-piece', 'Set neck', 'Through neck', 'Aftermarket replacement neck', 'Unknown']} />
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
            <Select value={form.source_type} onChange={set('source_type')} options={['Owner registration', 'eBay listing', 'Reverb listing', 'Gumtree', 'Forum post', 'Other']} />
          </Field>
          <Field label="Last known price (£)">
            <input type="number" step="0.01" value={form.last_price} onChange={e => set('last_price')(e.target.value)} placeholder="e.g. 250" className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Source URL">
              <input type="url" value={form.source_url} onChange={e => set('source_url')(e.target.value)} placeholder="https://…" className={inputCls} />
            </Field>
          </div>
        </Section>

        <Section title="Photos">
          <div className="sm:col-span-2">
            <Field label="Upload photos (optional)">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={e => setImages(Array.from(e.target.files ?? []))}
                className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700"
              />
              {images.length > 0 && (
                <p className="text-zinc-500 text-xs mt-2">{images.length} file{images.length > 1 ? 's' : ''} selected</p>
              )}
            </Field>
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
    </div>
  )
}
