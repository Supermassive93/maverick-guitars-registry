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
  'JR4':              { series: 'JR-Series',      prefix: 'JR4-' },
  'Unknown':          { series: 'Unknown',        prefix: '' },
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
]

const CUSTOM_COLOURS = ['BW — Black & White (Zebra)', 'BR — Black & Red (DTM)', 'Custom Airbrushed', 'Unknown']

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
  headstock_logo: string
  bridge_logo: string
  pickup_surrounds: string
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
  hardware_colour: '', headstock_logo: '', bridge_logo: '', pickup_surrounds: '',
  neck_binding: '', switch_type: '', switch_knob: '', potentiometers: '',
  whammy_bar: '', neck_construction: '', skunk_stripe: '', headstock_break_angle: '',
  neck_pitch: '', source_type: '', source_url: '', last_price: '',
  submitter_email: '', submission_notes: '',
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
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

  function set(key: keyof FormState) {
    return (value: string) => setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'model') { next.serial = ''; setSerialDigits('') }
      if (key === 'finish_type') { next.factory_colour = ''; next.custom_shop_colour = '' }
      return next
    })
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
        headstock_logo: form.headstock_logo || null,
        bridge_logo: form.bridge_logo || null,
        pickup_surrounds: form.pickup_surrounds || null,
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
        submission_notes: form.submission_notes || null,
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
                onChange={e => set('model')(e.target.value)}
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

          {/* Serial status — only shown when no digits entered (e.g. None Visible / Prefix only) */}
          {!serialDigits && (
            <Field label="Serial status">
              <Select value={form.serial_status} onChange={set('serial_status')} options={['Prefix only', 'None Visible']} placeholder="Unknown / not entered" />
            </Field>
          )}

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
          {(!form.finish_type || form.finish_type === 'Factory Finish' || form.finish_type === 'Refinished') && (
            <Field label="Factory colour">
              <Select value={form.factory_colour} onChange={set('factory_colour')} options={FACTORY_COLOURS} />
            </Field>
          )}
          {(form.finish_type === 'Custom Shop Finish') && (
            <Field label="Custom Shop colour">
              <Select value={form.custom_shop_colour} onChange={set('custom_shop_colour')} options={CUSTOM_COLOURS} />
            </Field>
          )}
          <Field label="Body wood">
            <Select value={form.body_wood} onChange={set('body_wood')} options={['Canadian Basswood', 'Alder', 'Mahogany', 'Basswood', 'Unknown']} />
          </Field>
          <Field label="Body shape">
            <Select value={form.body_shape_analogue} onChange={set('body_shape_analogue')} options={['Superstrat', 'Explorer-Mockingbird', 'Les Paul', 'Single Cutaway', 'PRS', 'Telecaster', 'Other', 'Unknown']} />
          </Field>
        </Section>

        <Section title="Hardware & electronics">
          <Field label="Pickup configuration">
            <Select value={form.pickup_configuration} onChange={set('pickup_configuration')} options={['HH', 'HSH', 'HSS', 'H', 'SS', 'SSS', 'Other', 'Unknown']} />
          </Field>
          <Field label="Bridge">
            <Select value={form.bridge_configuration} onChange={set('bridge_configuration')} options={['Floyd Rose', 'Floyd Rose Licensed', 'Wilkinson Hardtail', 'Hardtail', 'Tune-o-matic', 'Wraparound', 'Synchronised Tremolo', 'Unknown']} />
          </Field>
          <Field label="Hardware colour">
            <Select value={form.hardware_colour} onChange={set('hardware_colour')} options={['Chrome', 'Gold', 'Black', 'Nickel', 'Unknown']} />
          </Field>
          <Field label="Switch type">
            <Select value={form.switch_type} onChange={set('switch_type')} options={['Factory 5 Way Blade Switch', 'Factory 3 Way Blade Switch', 'Factory 3 Way Toggle Switch', 'Aftermarket Switch', 'Unknown']} />
          </Field>
          <Field label="Switch knob">
            <Select value={form.switch_knob} onChange={set('switch_knob')} options={['Cylindrical with O-ring', 'Tapered', 'Aftermarket Replacement', 'Unknown']} />
          </Field>
          <Field label="Potentiometers">
            <Select value={form.potentiometers} onChange={set('potentiometers')} options={['Factory Patented Evolution Roller Pots', 'Factory Standard Through Body Pots', 'Aftermarket Replacement', 'Unknown']} />
          </Field>
          <Field label="Neck pickup">
            <input type="text" value={form.neck_pickup} onChange={e => set('neck_pickup')(e.target.value)} placeholder="e.g. A-Type custom humbucker" className={inputCls} />
          </Field>
          <Field label="Bridge pickup">
            <input type="text" value={form.bridge_pickup} onChange={e => set('bridge_pickup')(e.target.value)} placeholder="e.g. A-Type custom humbucker" className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Whammy bar">
              <input type="text" value={form.whammy_bar} onChange={e => set('whammy_bar')(e.target.value)} placeholder="e.g. Original with O-ring grips" className={inputCls} />
            </Field>
          </div>
        </Section>

        <Section title="Neck & construction">
          <Field label="Neck construction">
            <Select value={form.neck_construction} onChange={set('neck_construction')} options={['Bolt-on — 2 piece scarf joint', 'Bolt-on — 1 piece', 'Set neck', 'Through neck', 'Unknown']} />
          </Field>
          <Field label="Pickup surrounds">
            <Select value={form.pickup_surrounds} onChange={set('pickup_surrounds')} options={['Absent', 'Present', 'Unknown']} />
          </Field>
          <Field label="Neck binding">
            <Select value={form.neck_binding} onChange={set('neck_binding')} options={['Absent', 'Present', 'Unknown']} />
          </Field>
          <Field label="Skunk stripe">
            <Select value={form.skunk_stripe} onChange={set('skunk_stripe')} options={['Present', 'Absent', 'Unknown']} />
          </Field>
          <Field label="Headstock logo">
            <Select value={form.headstock_logo} onChange={set('headstock_logo')} options={['Reflective metal inlay', 'Cream silkscreen', 'Unknown']} />
          </Field>
          <Field label="Bridge logo">
            <Select value={form.bridge_logo} onChange={set('bridge_logo')} options={['Italic script', 'Stencil block', 'Unknown']} />
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
