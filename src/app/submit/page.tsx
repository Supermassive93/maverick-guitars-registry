'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const SERIES_MODELS: Record<string, string[]> = {
  'F-Series':     ['F1', 'F1HT', 'F2', 'F3', 'F4'],
  'X-Series':     ['X1', 'X-Treme', 'FD-Tox', 'XD-Tox'],
  'Species':      ['Species 1', 'Species 2', 'Species 3', 'Species 7 String'],
  'Chaos':        ['Chaos 1', 'Chaos 2'],
  'S-Series':     ['S4', 'S5'],
  'Streetfighter':['Streetfighter'],
  'Matrix':       ['Matrix'],
  'G-Series':     ['G1', 'G2'],
  'B-Series':     ['B1'],
}

const FACTORY_COLOURS = [
  'MB — Metallic Burgundy', 'MDB — Metallic Dark Blue', 'MGN — Metallic Green',
  'MGY — Metallic Grey', 'MIB — Metallic Ice Blue', 'PTR — Metallic Pewter',
  'CR — Candy Red', 'NY — Neon Yellow', 'BK — Black', 'WH — White',
  'CM — Cream', 'SL — Silver', 'TR — Transparent Red', 'TB — Transparent Blue',
  'TG — Transparent Green', 'TP — Transparent Purple', 'MS — Metallic Sage', 'MP — Metallic Purple',
]

const CUSTOM_COLOURS = ['BW — Black & White (Zebra)', 'BR — Black & Red (DTM)', 'Custom Airbrushed', 'Unknown']

type FormState = {
  serial: string
  serial_status: string
  series: string
  model: string
  generation: string
  catalogue_year: string
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
  serial: '', serial_status: '', series: '', model: '', generation: '',
  catalogue_year: '', finish_type: '', factory_colour: '', custom_shop_colour: '',
  body_wood: '', body_shape_analogue: '', pickup_configuration: '',
  neck_pickup: '', middle_pickup: '', bridge_pickup: '', bridge_configuration: '',
  hardware_colour: '', headstock_logo: '', bridge_logo: '', pickup_surrounds: '',
  neck_binding: '', switch_type: '', switch_knob: '', potentiometers: '',
  whammy_bar: '', neck_construction: '', skunk_stripe: '', headstock_break_angle: '',
  neck_pitch: '', left_handed: '', source_type: '', source_url: '', last_price: '',
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

export default function SubmitPage() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [images, setImages] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function set(key: keyof FormState) {
    return (value: string) => setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'series') next.model = ''
      if (key === 'finish_type') { next.factory_colour = ''; next.custom_shop_colour = '' }
      return next
    })
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
      const imageUrls = images.length > 0 ? await uploadImages() : []

      const payload = {
        serial: form.serial || null,
        serial_status: (form.serial_status || null),
        series: (form.series || null),
        model: form.model || null,
        generation: (form.generation || null),
        catalogue_year: form.catalogue_year || null,
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

  const availableModels = form.series ? SERIES_MODELS[form.series] ?? [] : []

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Register your guitar</h1>
        <p className="text-zinc-400">Fill in as much as you know. All submissions are reviewed before appearing in the registry.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Guitar identity">
          <Field label="Serial number">
            <input type="text" value={form.serial} onChange={e => set('serial')(e.target.value)} placeholder="e.g. F2-00024" className={inputCls} />
          </Field>
          <Field label="Serial status">
            <Select value={form.serial_status} onChange={set('serial_status')} options={['Complete', 'Partial', 'Prefix only', 'None Visible']} />
          </Field>
          <Field label="Series">
            <Select value={form.series} onChange={set('series')} options={Object.keys(SERIES_MODELS)} />
          </Field>
          <Field label="Model">
            <Select value={form.model} onChange={set('model')} options={availableModels} placeholder={form.series ? 'Select model…' : 'Select series first'} />
          </Field>
          <Field label="Generation">
            <Select value={form.generation} onChange={set('generation')} options={['Gen 1', 'Gen 2', 'Gen 3', 'Unknown']} />
          </Field>
          <Field label="Catalogue year">
            <Select value={form.catalogue_year} onChange={set('catalogue_year')} options={['2001 Brochure', '2002 Catalogue', 'Both', 'Unknown']} />
          </Field>
          <Field label="Left handed">
            <Select value={form.left_handed} onChange={set('left_handed')} options={['Yes — Factory', 'Yes — Custom Order', 'No', 'Unknown']} />
          </Field>
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
