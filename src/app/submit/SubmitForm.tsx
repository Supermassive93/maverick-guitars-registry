'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import GuidedCropModal from '@/components/GuidedCropModal'
import IdWizard from '@/components/IdWizard'
import { MODEL_MAP, GENERATION_DB_ID, type WizardResult } from '@/lib/id-wizard-config'
import SpecFieldRow, {
  inputCls, selectCls, isAftermarketName, OTHER_SENTINEL,
  type RefOption, type FieldStatus, type AftermarketPart, type PartChoice,
} from './SpecFieldRow'
import {
  SPEC_SECTIONS, ALL_SPEC_FIELDS, BASS_MODELS, PHOTO_SLOTS, pickupSlotsFor, silhouetteFor,
  type FieldDef,
} from '@/lib/submission-fields'

// Everything the form offers comes from the database: the model list and serial prefixes from
// model_specifications, every dropdown from ref_values, and the prefill from the model's spec sheet
// (universal spec, overlaid with the chosen generation's spec). Nothing here is hard-coded to a ref ID
// except the finish-type logic, which is about what the finish *means*.

type ModelRow = {
  id: string
  model: string
  series: string | null
  serial_prefix: string | null
  maverick_body_family: string | null
  headstock_style: string | null
  display_order: number | null
}

type SpecMap = Record<string, string | null>
type GenIndicator = { feature: string; feature_value: string; generation: string; model: string | null }
type ImageSlot = { position: string; required: boolean; hint?: string; file: File | null; preview: string | null }

type IdentityState = {
  serial: string
  serial_status: string
  model: string
  generation: string
  finish_type: string
  factory_colour: string
  custom_shop_colour: string
  left_handed: 'No' | 'Yes'
  last_known_country: string
  last_known_region: string
  last_known_city: string
  last_price: string
  source_url: string
  submitter_email: string
  submission_notes: string
}

const INITIAL_IDENTITY: IdentityState = {
  serial: '', serial_status: '', model: '', generation: '',
  finish_type: '', factory_colour: '', custom_shop_colour: '', left_handed: 'No',
  last_known_country: '', last_known_region: '', last_known_city: '',
  last_price: '', source_url: '', submitter_email: '', submission_notes: '',
}

function makeInitialSlots(): ImageSlot[] {
  return PHOTO_SLOTS.map(s => ({ position: s.position, required: !!s.required, hint: s.hint, file: null, preview: null }))
}

const FINISH_FACTORY = 'FIN-0001'
const FINISH_CUSTOM_SHOP = 'FIN-0002'
const FINISH_REFINISHED = 'FIN-0003'
const FINISH_RELIC = 'FIN-0004'

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

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="border border-zinc-800 rounded-lg p-6">
      <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-1">{title}</h2>
      {note && <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', marginBottom: '16px', lineHeight: 1.6 }}>{note}</p>}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${note ? '' : 'mt-4'}`}>{children}</div>
    </div>
  )
}

function splitEmailPrefix(email: string) {
  return email.split('@')[0] || 'Anonymous'
}

function sameValue(a: string, b: string | null | undefined) {
  if (b == null) return false
  if (a === b) return true
  const na = Number(a), nb = Number(b)
  return a !== '' && b !== '' && !Number.isNaN(na) && !Number.isNaN(nb) && na === nb
}

function escapeLike(s: string) {
  return s.replace(/[\\%_]/g, c => `\\${c}`)
}

// The registration tables added with the spec-aligned form aren't in the hand-maintained generated types yet
const untyped = (c: ReturnType<typeof createSupabaseBrowserClient>) => c as unknown as SupabaseClient

type GateState = 'checking' | 'gate' | 'form'

export default function SubmitForm({ silhouetteFiles }: { silhouetteFiles: string[] }) {
  const searchParams = useSearchParams()
  const claimModel = searchParams.get('model') ?? ''
  const claimSerial = searchParams.get('serial') ?? ''
  const silhouetteSet = useMemo(() => new Set(silhouetteFiles), [silhouetteFiles])

  const [gateState, setGateState] = useState<GateState>('checking')
  // The identification wizard runs after sign-in / guest and before the form; a claim link (?model=) skips it
  const [wizardDone, setWizardDone] = useState(false)
  const [wizardGeneration, setWizardGeneration] = useState('')
  const [identity, setIdentity] = useState<IdentityState>(INITIAL_IDENTITY)
  const [serialDigits, setSerialDigits] = useState('')

  // Reference data
  const [models, setModels] = useState<ModelRow[]>([])
  const [refsByCat, setRefsByCat] = useState<Record<string, RefOption[]>>({})
  const [refNames, setRefNames] = useState<Record<string, string>>({})
  const [parts, setParts] = useState<AftermarketPart[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [indicators, setIndicators] = useState<GenIndicator[]>([])
  const [touched, setTouched] = useState<Record<string, true>>({})
  // Learned serial ranges for the chosen model, and its generations in production order
  const [serialRanges, setSerialRanges] = useState<{ generation: string; serial_min: number; serial_max: number }[]>([])
  const [genOrder, setGenOrder] = useState<string[]>([])

  // Spec answers
  const [values, setValues] = useState<Record<string, string>>({})
  const [statuses, setStatuses] = useState<Record<string, FieldStatus>>({})
  const [others, setOthers] = useState<Record<string, string>>({})
  const [partChoices, setPartChoices] = useState<Record<string, PartChoice | null>>({})
  const [spec, setSpec] = useState<SpecMap>({})

  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(makeInitialSlots)
  const [cropTarget, setCropTarget] = useState<{ index: number; file: File } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const specRequest = useRef(0)
  const modelRow = models.find(m => m.model === identity.model) ?? null
  const isBass = BASS_MODELS.has(identity.model)

  // ── Load reference data once ─────────────────────────────────────────────
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    Promise.all([
      supabase.from('model_specifications')
        .select('id, model, series, serial_prefix, maverick_body_family, headstock_style, display_order')
        .order('display_order', { ascending: true, nullsFirst: false }),
      supabase.from('ref_values').select('id, category, display_name').eq('is_active', true).order('sort_order', { ascending: true }),
      untyped(supabase).from('aftermarket_parts').select('id, part_type, brand, model, pickup_type, status'),
      supabase.from('generation_indicators').select('feature, feature_value, generation, model').eq('status', 'confirmed'),
    ]).then(([m, r, p, gi]) => {
      setIndicators((gi.data ?? []) as GenIndicator[])
      setModels((m.data ?? []) as ModelRow[])
      const byCat: Record<string, RefOption[]> = {}
      const names: Record<string, string> = {}
      for (const row of (r.data ?? []) as { id: string; category: string; display_name: string }[]) {
        names[row.id] = row.display_name
        if (/^RETIRED/i.test(row.display_name) || row.display_name === 'Unknown') continue
        ;(byCat[row.category] ??= []).push({ id: row.id, display_name: row.display_name })
      }
      setRefsByCat(byCat)
      setRefNames(names)
      setParts((p.data ?? []) as AftermarketPart[])
      setDataLoaded(true)
    })
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        if (data.user.email) setIdentity(prev => ({ ...prev, submitter_email: data.user!.email! }))
        setGateState('form')
      } else {
        setGateState('gate')
      }
    })
  }, [])

  // ── Prefill from the model's spec sheet ──────────────────────────────────
  async function loadSpec(model: ModelRow, generation: string, keepEdits: boolean) {
    const supabase = createSupabaseBrowserClient()
    const request = ++specRequest.current

    const gen = generation

    const [{ data: uni }, { data: genSpec }] = await Promise.all([
      supabase.from('model_specifications').select('*').eq('id', model.id).single(),
      gen
        ? supabase.from('model_gen_specs').select('*').eq('model_id', model.id).eq('generation', gen).maybeSingle()
        : Promise.resolve({ data: null }),
    ])
    if (request !== specRequest.current) return

    const merged: SpecMap = {}
    for (const def of ALL_SPEC_FIELDS) {
      const raw = (genSpec as Record<string, unknown> | null)?.[def.key] ?? (uni as Record<string, unknown> | null)?.[def.key] ?? null
      const text = raw == null ? null : String(raw)
      // 'Unknown' is dropped from pre-fill so owners aren't handed it as an answer, but fixed fields are
      // shown exactly as the spec sheet records them, Unknown included
      merged[def.key] = text && refNames[text] === 'Unknown' && !def.fixed ? null : text
    }

    setValues(prev => {
      const next: Record<string, string> = keepEdits ? { ...prev } : {}
      for (const def of ALL_SPEC_FIELDS) {
        const untouched = !keepEdits || prev[def.key] === undefined || prev[def.key] === '' || prev[def.key] === spec[def.key]
        if (untouched) next[def.key] = merged[def.key] ?? ''
      }
      return next
    })
    setSpec(merged)
    if (!keepEdits) {
      setStatuses({})
      setOthers({})
      setPartChoices({})
    }
  }

  function selectModel(name: string, serial = '') {
    const row = models.find(m => m.model === name) ?? null
    const prefix = row?.serial_prefix && row.serial_prefix !== 'Unknown' ? row.serial_prefix : ''
    const digits = serial && serial.startsWith(prefix) ? serial.slice(prefix.length) : serial
    setSerialDigits(digits)
    setIdentity(prev => ({
      ...prev, model: name, generation: '',
      serial: serial, serial_status: serial ? 'Complete' : '',
    }))
    setSpec({}); setValues({}); setStatuses({}); setOthers({}); setPartChoices({}); setTouched({})
    setSerialRanges([]); setGenOrder([])
    if (row) {
      loadSpec(row, '', false)
      const supabase = createSupabaseBrowserClient()
      Promise.all([
        untyped(supabase).from('serial_range_indicators').select('generation, serial_min, serial_max').eq('model', row.model),
        supabase.from('model_gen_specs').select('generation, production_year_start').eq('model_id', row.id),
      ]).then(([ranges, gens]) => {
        setSerialRanges((ranges.data ?? []) as { generation: string; serial_min: number; serial_max: number }[])
        const order = ((gens.data ?? []) as { generation: string; production_year_start: number | null }[])
          .sort((a, b) => (a.production_year_start ?? 9999) - (b.production_year_start ?? 9999))
          .map(g => g.generation)
        setGenOrder(Array.from(new Set(order)))
      })
    }
  }

  // Claim link (?model=…&serial=…) from the registry grid
  const claimApplied = useRef(false)
  useEffect(() => {
    if (gateState !== 'form' || claimApplied.current || !dataLoaded || !claimModel) return
    if (!models.some(m => m.model === claimModel)) return
    const t = setTimeout(() => { claimApplied.current = true; selectModel(claimModel, claimSerial) }, 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateState, dataLoaded, claimModel, claimSerial, models])

  function applyWizardResult(result: WizardResult) {
    const wizardModel = MODEL_MAP.get(result.modelCode)
    const row = models.find(m => m.model === wizardModel?.dbName) ?? null
    const gen = GENERATION_DB_ID[result.generation]
    if (wizardModel) selectModel(wizardModel.dbName)
    if (gen) {
      setWizardGeneration(gen)
      setIdentity(prev => ({ ...prev, generation: gen }))
      if (row) loadSpec(row, gen, false)
    }
    setWizardDone(true)
  }

  function handleSerialDigits(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 5)
    setSerialDigits(digits)
    const prefix = modelRow?.serial_prefix && modelRow.serial_prefix !== 'Unknown' ? modelRow.serial_prefix : ''
    if (digits.length === 0) {
      setIdentity(prev => ({ ...prev, serial: '', serial_status: '' }))
    } else {
      setIdentity(prev => ({
        ...prev,
        serial: `${prefix}${digits.padStart(5, '0')}`,
        serial_status: digits.length === 5 ? 'Complete' : 'Partial',
      }))
    }
  }

  // ── Field state helpers ──────────────────────────────────────────────────
  const optionsFor = (def: FieldDef): RefOption[] => (def.cat ? refsByCat[def.cat] ?? [] : [])
  const statusOf = (key: string): FieldStatus => statuses[key] ?? 'original'

  function setValue(key: string, v: string) {
    setValues(prev => ({ ...prev, [key]: v }))
  }

  // Owner-edited fields (not model pre-fill) are what the live generation guess is based on
  function setOwnerValue(key: string, v: string) {
    setTouched(prev => ({ ...prev, [key]: true }))
    setValue(key, v)
  }

  function changeStatus(def: FieldDef, s: FieldStatus) {
    setStatuses(prev => ({ ...prev, [def.key]: s }))
    setTouched(prev => ({ ...prev, [def.key]: true }))
    const aftermarket = optionsFor(def).filter(o => isAftermarketName(o.display_name))
    if (s === 'aftermarket') {
      setValue(def.key, aftermarket.length === 1 ? aftermarket[0].id : '')
    } else if (s === 'original') {
      setValue(def.key, spec[def.key] ?? '')
    } else {
      setValue(def.key, '')
    }
  }

  // ── Generation is worked out from the details given, never asked ─────────
  // Each confirmed generation indicator that matches an answer is a vote for its generation; the
  // generation is only set when one has strictly the most votes (a tie leaves it for review).
  function voteGeneration(answers: Record<string, string>): string | null {
    const norm = (t: string) => t.toLowerCase().replace(/[—–]/g, '-').replace(/\s*-\s*/g, '-').replace(/×/g, 'x').replace(/\s+/g, ' ').trim()
    const tally: Record<string, number> = {}
    for (const ind of indicators) {
      if (ind.model && ind.model !== modelRow?.id && ind.model !== modelRow?.model) continue
      const answer = answers[ind.feature]
      if (!answer) continue
      const candidates = [answer, refNames[answer]].filter(Boolean).map(norm)
      if (candidates.includes(norm(ind.feature_value))) tally[ind.generation] = (tally[ind.generation] ?? 0) + 1
    }
    const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1])
    if (ranked.length === 0) return null
    return ranked.length === 1 || ranked[0][1] > ranked[1][1] ? ranked[0][0] : null
  }

  const ownerAnswers: Record<string, string> = {}
  for (const def of ALL_SPEC_FIELDS) {
    if (touched[def.key] && values[def.key] && statuses[def.key] !== 'aftermarket') ownerAnswers[def.key] = values[def.key]
  }
  if (identity.serial_status) ownerAnswers['serial_status'] = identity.serial_status
  // Learned serial ranges: a serial inside a generation's known range belongs to it, and a serial below the
  // range of the model's first generation is also that generation (serials count up from 00001)
  function generationFromSerial(): string | null {
    if (identity.serial_status !== 'Complete' || serialDigits.length !== 5) return null
    const n = Number(serialDigits)
    const hit = serialRanges.find(r => n >= r.serial_min && n <= r.serial_max)
    if (hit) return hit.generation
    const first = serialRanges.find(r => r.generation === genOrder[0])
    return first && n < first.serial_min ? first.generation : null
  }

  const indicatorGeneration = modelRow ? voteGeneration(ownerAnswers) : null
  const serialGeneration = modelRow ? generationFromSerial() : null
  const liveGeneration = indicatorGeneration ?? serialGeneration
  const generationBasis = indicatorGeneration ? 'indicators' : serialGeneration ? 'serial range' : null

  useEffect(() => {
    if (!modelRow || !liveGeneration || liveGeneration === identity.generation) return
    const t = setTimeout(() => {
      setIdentity(prev => ({ ...prev, generation: liveGeneration }))
      loadSpec(modelRow, liveGeneration, true)
    }, 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveGeneration, modelRow, identity.generation])

  const isTremolo = (() => {
    const bridge = values['bridge_type']
    if (!bridge || statusOf('bridge_type') === 'unsure') return true // unknown → don't hide the fields
    return /floyd rose|tremolo/i.test(refNames[bridge] ?? '')
  })()

  const pickupSlots = pickupSlotsFor(refNames[values['pickup_configuration']])

  function visible(def: FieldDef): boolean {
    if (def.bassOnly && !isBass) return false
    if (def.needsTremolo && !isTremolo) return false
    if (def.key === 'bridge_pickup') return pickupSlots.bridge
    if (def.key === 'middle_pickup') return pickupSlots.middle
    if (def.key === 'neck_pickup') return pickupSlots.neck
    return true
  }

  // Any field the owner has marked as an aftermarket replacement (or a refinish) makes the guitar "Modified"
  const modifiedFields = [
    ...ALL_SPEC_FIELDS.filter(d => visible(d) && statusOf(d.key) === 'aftermarket').map(d => d.key),
    ...((identity.finish_type === FINISH_REFINISHED || identity.finish_type === FINISH_RELIC) ? ['finish_type'] : []),
  ]
  const originality: 'Factory original' | 'Modified' | 'Unknown' =
    modifiedFields.length > 0 ? 'Modified' : modelRow ? 'Factory original' : 'Unknown'

  // ── Photos ───────────────────────────────────────────────────────────────
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
      if (!data.url) throw new Error(`Could not upload the "${slot.position}" photo — please try again.`)
      result.set(slot.position, data.url)
    }
    return result
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!identity.submitter_email) { setError('Email is required'); return }
    if (!modelRow) { setError('Please select your model.'); return }
    const missing = imageSlots.filter(s => s.required && !s.file)
    if (missing.length > 0) { setError(`A photo is required for: ${missing.map(s => s.position).join(', ')}.`); return }
    for (const def of ALL_SPEC_FIELDS) {
      const c = partChoices[def.key]
      if (visible(def) && statusOf(def.key) === 'aftermarket' && c?.kind === 'new' && (!c.brand.trim() || !c.model.trim())) {
        setError(`Please enter the brand and model for the ${def.label.toLowerCase()} you added.`)
        return
      }
    }

    setSubmitting(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      const uploaded = await uploadImages()

      let registeredBy = 'Guest'
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
        registeredBy = profile?.username ?? splitEmailPrefix(user.email ?? '')
      }

      // Resolve the aftermarket parts (existing picks, or new ones to add to the shared list)
      const slotPartIds: Record<string, string> = {}
      for (const def of ALL_SPEC_FIELDS) {
        const choice = partChoices[def.key]
        if (!def.part || !visible(def) || statusOf(def.key) !== 'aftermarket' || !choice) continue
        if (choice.kind === 'existing') { slotPartIds[def.key] = choice.id; continue }
        const brand = choice.brand.trim(), model = choice.model.trim()
        const pickupType = def.part === 'pickup' ? choice.pickup_type : null
        const { data: created, error: createErr } = await untyped(supabase).from('aftermarket_parts')
          .insert({ part_type: def.part, brand, model, pickup_type: pickupType, status: 'unverified', created_by: user?.id ?? null })
          .select('id').single()
        if (created) { slotPartIds[def.key] = created.id; continue }
        if (createErr?.code === '23505') {
          // Someone already added this part — use theirs
          let q = untyped(supabase).from('aftermarket_parts').select('id').eq('part_type', def.part)
            .ilike('brand', escapeLike(brand)).ilike('model', escapeLike(model))
          q = pickupType ? q.eq('pickup_type', pickupType) : q.is('pickup_type', null)
          const { data: existing } = await q.maybeSingle()
          if (existing) { slotPartIds[def.key] = existing.id; continue }
        }
        throw createErr ?? new Error('Could not save the part you added.')
      }

      // Columns + per-field flags
      const columns: Record<string, string | number | null> = {}
      const flags: { field: string; status: string; detail: string | null; evidence_eligible: boolean }[] = []
      const suggestions: { field: string; proposed_value: string }[] = []

      for (const def of ALL_SPEC_FIELDS) {
        if (!visible(def)) continue
        const st = statusOf(def.key)
        const raw = values[def.key] ?? ''
        const other = (others[def.key] ?? '').trim()
        const numeric = def.kind === 'number' || def.kind === 'count'
        const toColumn = (v: string) => (numeric ? (v === '' ? null : Number(v)) : v || null)

        // Fixed by the model: stored as the model's value, never owner-edited so no flag
        if (def.fixed) {
          columns[def.key] = toColumn(spec[def.key] ?? '')
          continue
        }

        if (st === 'unsure') {
          columns[def.key] = null
          flags.push({ field: def.key, status: 'unknown', detail: null, evidence_eligible: false })
        } else if (st === 'aftermarket') {
          columns[def.key] = toColumn(raw === OTHER_SENTINEL ? '' : raw)
          flags.push({ field: def.key, status: 'aftermarket', detail: other || null, evidence_eligible: false })
        } else if (raw === OTHER_SENTINEL) {
          columns[def.key] = null
          if (other) suggestions.push({ field: def.key, proposed_value: other })
          flags.push({ field: def.key, status: 'factory_unlisted', detail: other || null, evidence_eligible: false })
        } else if (raw !== '') {
          columns[def.key] = toColumn(raw)
          const matches = sameValue(raw, spec[def.key])
          flags.push({ field: def.key, status: matches ? 'matches' : 'factory_unlisted', detail: null, evidence_eligible: matches })
        }
      }
      if (identity.finish_type === FINISH_REFINISHED || identity.finish_type === FINISH_RELIC) {
        flags.push({ field: 'finish_type', status: 'aftermarket', detail: identity.custom_shop_colour || null, evidence_eligible: false })
      }

      // Last pass over everything entered (including model pre-fill) if no generation was settled while filling in
      const allAnswers: Record<string, string> = {}
      for (const def of ALL_SPEC_FIELDS) {
        if (visible(def) && values[def.key] && statusOf(def.key) !== 'aftermarket') allAnswers[def.key] = values[def.key]
      }
      if (identity.serial_status) allAnswers['serial_status'] = identity.serial_status
      const finalIndicator = voteGeneration(allAnswers)
      const finalGeneration = finalIndicator ?? serialGeneration

      const guitarId = crypto.randomUUID()
      const imageUrls = PHOTO_SLOTS.map(s => uploaded.get(s.position)).filter((u): u is string => Boolean(u))
      const notesPrefix = originality === 'Modified' ? '[Modified] ' : ''

      const payload = {
        id: guitarId,
        user_id: user?.id ?? null,
        registered_by: registeredBy,
        model_id: modelRow.id,
        serial: identity.serial || null,
        serial_status: identity.serial_status || null,
        series: modelRow.series,
        generation: identity.generation || finalGeneration,
        generation_basis: (identity.generation || finalGeneration)
          ? (wizardGeneration && identity.generation === wizardGeneration ? 'wizard (logo)' : (generationBasis ?? (finalIndicator ? 'indicators' : 'serial range')))
          : null,
        catalogue_year: null,
        finish_type: identity.finish_type || null,
        factory_colour: identity.finish_type === FINISH_FACTORY || !identity.finish_type ? identity.factory_colour || null : null,
        custom_shop_colour: identity.custom_shop_colour || null,
        left_handed_available: identity.left_handed === 'Yes' ? 'LHA-0001' : null,
        ...columns,
        last_known_country: identity.last_known_country || null,
        last_known_region: identity.last_known_region || null,
        last_known_city: identity.last_known_city || null,
        source_type: 'Owner registration',
        source_url: identity.source_url || null,
        last_price: identity.last_price ? parseFloat(identity.last_price) : null,
        submitter_email: identity.submitter_email,
        submission_notes: `${notesPrefix}${identity.submission_notes}`.trim() || null,
        originality,
        modified_fields: modifiedFields.length ? modifiedFields : null,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        primary_image_url: uploaded.get('Full front') ?? imageUrls[0] ?? null,
        status: 'Pending',
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await supabase.from('guitars').insert(payload as any)
      if (dbError) throw dbError

      const children = await Promise.all([
        flags.length ? untyped(supabase).from('guitar_field_flags').insert(flags.map(f => ({ guitar_id: guitarId, ...f }))) : null,
        Object.keys(slotPartIds).length
          ? untyped(supabase).from('guitar_parts').insert(Object.entries(slotPartIds).map(([slot, part_id]) => ({ guitar_id: guitarId, slot, part_id })))
          : null,
        suggestions.length ? untyped(supabase).from('spec_suggestions').insert(suggestions.map(s => ({ guitar_id: guitarId, ...s }))) : null,
        uploaded.size
          ? untyped(supabase).from('guitar_photos').insert(PHOTO_SLOTS.filter(s => uploaded.has(s.position)).map((s, i) => ({
              guitar_id: guitarId, position: s.position, url: uploaded.get(s.position)!, sort_order: i,
            })))
          : null,
      ])
      const childError = children.find(c => c?.error)?.error
      if (childError) throw childError

      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (err as { message?: string })?.message ?? 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────────
  function renderField(def: FieldDef, labelOverride?: string) {
    if (!visible(def)) return null
    const key = def.key
    const st = statusOf(key)
    return (
      <SpecFieldRow
        key={key}
        def={def}
        label={labelOverride}
        options={optionsFor(def)}
        value={values[key] ?? ''}
        status={st}
        specValue={spec[key] ?? null}
        prefilled={spec[key] != null}
        otherText={others[key] ?? ''}
        part={partChoices[key] ?? null}
        parts={parts}
        onValue={v => setOwnerValue(key, v)}
        onStatus={s => changeStatus(def, s)}
        onOther={v => setOthers(prev => ({ ...prev, [key]: v }))}
        onPart={p => setPartChoices(prev => ({ ...prev, [key]: p }))}
      />
    )
  }

  const seriesName = (id: string | null) => (id ? refNames[id] ?? id : 'Other')
  const modelGroups = useMemo(() => {
    const groups: { series: string; models: ModelRow[] }[] = []
    for (const m of models) {
      const name = seriesName(m.series)
      let g = groups.find(x => x.series === name)
      if (!g) { g = { series: name, models: [] }; groups.push(g) }
      g.models.push(m)
    }
    return groups
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models, refNames])

  const prefix = modelRow?.serial_prefix && modelRow.serial_prefix !== 'Unknown' ? modelRow.serial_prefix : ''

  if (gateState === 'checking') {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#3a3835', letterSpacing: '3px', textTransform: 'uppercase' }}>
          Loading...
        </p>
      </div>
    )
  }

  if (gateState === 'form' && !wizardDone && !claimModel) {
    return <IdWizard onConfirmed={applyWizardResult} />
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
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '36px', letterSpacing: '2px', color: '#c8a96e', marginBottom: '12px' }}>Sign In</div>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#9e9b96', lineHeight: 1.7, marginBottom: '20px' }}>
                Already have an account? Sign in and your submission will be linked to your profile — you can track it, view approval status, and build a record of all your guitars.
              </p>
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#c8a96e' }}>Sign in →</span>
            </Link>

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
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '36px', letterSpacing: '2px', color: '#c8a96e', marginBottom: '12px' }}>Create Account</div>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#9e9b96', lineHeight: 1.7, marginBottom: '20px' }}>
                New to the registry? Create a free account in under a minute. Everything you submit gets tied to your profile — you can come back, add photos, and see your guitars in the archive.
              </p>
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#c8a96e' }}>Register →</span>
            </Link>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '2rem', flexWrap: 'wrap',
            padding: '1.75rem 2rem',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.01)',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '13px', color: '#9e9b96', marginBottom: '4px' }}>Continue as guest</div>
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
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px', color: '#c8a96e', textTransform: 'uppercase', marginBottom: '20px' }}>
            Submission received
          </p>
          <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(48px, 7vw, 80px)', letterSpacing: '3px', lineHeight: 0.92, color: '#f0ede8', marginBottom: '28px' }}>
            GUITAR REGISTERED
          </h1>
          <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.75, marginBottom: '8px' }}>
            Your submission is pending review. Once approved it will appear in the registry.
          </p>
          {identity.submitter_email && (
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#5c5a57', marginBottom: '40px' }}>
              Confirmation will be sent to {identity.submitter_email}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
            <Link href="/" style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#c8a96e', textDecoration: 'none' }}>
              ← Back to registry
            </Link>
            <button
              onClick={() => window.location.assign('/submit')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                letterSpacing: '1px', textTransform: 'uppercase', color: '#5c5a57',
              }}
            >
              Register another →
            </button>
          </div>
        </div>
      </div>
    )
  }

  const monoNote: React.CSSProperties = { fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', lineHeight: 1.6 }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Register your guitar</h1>
        <p className="text-zinc-400">
          Pick your model and the form fills in the factory specification. Only change what is different on your guitar.
          All submissions are reviewed before appearing in the registry.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Guitar identity">
          <div className="sm:col-span-2">
            <Field label="Model" required>
              <select
                value={identity.model}
                onChange={e => selectModel(e.target.value)}
                required
                className={selectCls}
              >
                <option value="">{dataLoaded ? 'Select your model…' : 'Loading models…'}</option>
                {modelGroups.map(g => (
                  <optgroup key={g.series} label={g.series}>
                    {g.models.map(m => <option key={m.id} value={m.model}>{m.model}</option>)}
                  </optgroup>
                ))}
              </select>
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Serial number">
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <span style={{
                  display: 'flex', alignItems: 'center',
                  background: '#141414',
                  border: '1px solid rgba(255,255,255,0.12)', borderRight: 'none',
                  padding: '0 12px',
                  fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
                  color: identity.model ? '#c8a96e' : '#3a3835',
                  letterSpacing: '1px', whiteSpace: 'nowrap', minWidth: '56px',
                }}>
                  {identity.model ? (prefix || '?-') : '—'}
                </span>
                <input
                  type="text" inputMode="numeric"
                  value={serialDigits}
                  onChange={e => handleSerialDigits(e.target.value)}
                  disabled={!identity.model}
                  placeholder={identity.model ? '5-digit code' : 'Select model first'}
                  maxLength={5} className={inputCls} style={{ flex: 1 }}
                />
                {serialDigits.length > 0 && (
                  <span style={{
                    display: 'flex', alignItems: 'center', padding: '0 10px',
                    background: '#141414', border: '1px solid rgba(255,255,255,0.12)', borderLeft: 'none',
                    fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                    color: serialDigits.length === 5 ? '#27ae60' : '#c8a96e', whiteSpace: 'nowrap',
                  }}>
                    {serialDigits.length}/5
                  </span>
                )}
              </div>
              {serialDigits.length > 0 && (
                <p style={{ ...monoNote, marginTop: '5px' }}>
                  Full serial: <span style={{ color: '#9e9b96' }}>{identity.serial}</span>
                  {' · '}
                  <span style={{ color: serialDigits.length === 5 ? '#27ae60' : '#c8a96e' }}>
                    {serialDigits.length === 5 ? 'Complete' : 'Partial'}
                  </span>
                </p>
              )}
              {!serialDigits && (
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#3a3835', marginTop: '5px' }}>
                  Don’t know the serial, or can’t read it? Leave this blank and carry on — the generation will be worked out from the details you enter instead.
                </p>
              )}
            </Field>
          </div>

          {!serialDigits && (
            <Field label="Serial status">
              <select value={identity.serial_status} onChange={e => setIdentity(p => ({ ...p, serial_status: e.target.value }))} className={selectCls}>
                <option value="">Serial unknown / not entered</option>
                {['Prefix only', 'None Visible', 'Paper label', 'Hand label'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          )}

          {(identity.serial_status === 'Paper label' || identity.serial_status === 'Hand label') && (
            <div className="sm:col-span-2">
              <Field label="Label content">
                <input
                  type="text" value={identity.serial}
                  onChange={e => setIdentity(p => ({ ...p, serial: e.target.value.slice(0, 60) }))}
                  placeholder="Describe or transcribe the label — e.g. 'Prototype 003', handwritten number…"
                  maxLength={60} className={inputCls}
                />
              </Field>
            </div>
          )}

          {/* Generation is assigned by the system from the serial and the details given — it is not a choice */}
          <div className="sm:col-span-2">
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#5c5a57' }}>Generation</span>
              {(liveGeneration ?? identity.generation) ? (
                <>
                  <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '22px', letterSpacing: '1px', color: '#c8a96e' }}>
                    {refNames[(liveGeneration ?? identity.generation)] ?? (liveGeneration ?? identity.generation)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57' }}>
                    {generationBasis === 'serial range' ? 'assigned from the serial number range' : 'assigned from the details you have given'}
                  </span>
                </>
              ) : (
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57' }}>
                  Assigned automatically from your serial number and the details you enter below
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Handed</label>
            <div style={{ display: 'inline-flex', border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden' }}>
              {(['No', 'Yes'] as const).map(val => {
                const active = identity.left_handed === val
                return (
                  <button key={val} type="button" onClick={() => setIdentity(p => ({ ...p, left_handed: val }))}
                    style={{
                      padding: '8px 20px', fontFamily: 'var(--font-dm-mono)', fontSize: '12px',
                      letterSpacing: '1px', textTransform: 'uppercase', border: 'none', cursor: 'pointer',
                      background: active ? '#c8a96e' : 'transparent',
                      color: active ? '#000' : '#5c5a57', transition: 'background 0.15s, color 0.15s',
                    }}
                  >{val === 'No' ? 'Right handed' : 'Left handed'}</button>
                )
              })}
            </div>
          </div>
        </Section>

        <Section title="Finish & colour">
          <Field label="Finish type">
            <select
              value={identity.finish_type}
              onChange={e => setIdentity(p => ({ ...p, finish_type: e.target.value, factory_colour: '', custom_shop_colour: '' }))}
              className={selectCls}
            >
              <option value="">Select…</option>
              {(refsByCat['FIN'] ?? []).map(o => <option key={o.id} value={o.id}>{o.display_name}</option>)}
            </select>
          </Field>
          {(!identity.finish_type || identity.finish_type === FINISH_FACTORY) && (
            <Field label="Factory colour">
              <select value={identity.factory_colour} onChange={e => setIdentity(p => ({ ...p, factory_colour: e.target.value }))} className={selectCls}>
                <option value="">Select…</option>
                {(refsByCat['COL'] ?? []).map(o => <option key={o.id} value={o.id}>{o.display_name}</option>)}
              </select>
            </Field>
          )}
          {identity.finish_type === FINISH_CUSTOM_SHOP && (
            <Field label="Custom Shop colour">
              <select value={identity.custom_shop_colour} onChange={e => setIdentity(p => ({ ...p, custom_shop_colour: e.target.value }))} className={selectCls}>
                <option value="">Select…</option>
                {(refsByCat['CSC'] ?? []).map(o => <option key={o.id} value={o.id}>{o.display_name}</option>)}
              </select>
            </Field>
          )}
          {(identity.finish_type === FINISH_REFINISHED || identity.finish_type === FINISH_RELIC || identity.finish_type === 'FIN-0005') && (
            <Field label={identity.finish_type === 'FIN-0005' ? 'Finish description (optional)' : 'Describe the finish'}>
              <input type="text" value={identity.custom_shop_colour}
                onChange={e => setIdentity(p => ({ ...p, custom_shop_colour: e.target.value.slice(0, 100) }))}
                placeholder="e.g. Satin black rattle-can, sunburst respray, dark blue metallic…" maxLength={100} className={inputCls} />
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#3a3835', marginTop: '5px' }}>
                {identity.custom_shop_colour.length}/100 characters
              </p>
            </Field>
          )}
        </Section>

        {SPEC_SECTIONS.map(section => {
          const fields = section.fields.filter(visible)
          if (fields.length === 0) return null
          return (
            <Section
              key={section.id}
              title={section.title}
              note={section.id === 'body' ? 'These are set by the model, so there is nothing to fill in.' : undefined}
            >
              {fields.some(f => f.fixed) && (
                <div className="sm:col-span-2">
                  <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', padding: '12px 16px' }}>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#5c5a57', marginBottom: '10px' }}>
                      {identity.model ? `${identity.model} — fixed by the model` : 'Fixed by the model — select a model above'}
                    </p>
                    <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px 24px', margin: 0 }}>
                      {fields.filter(f => f.fixed).map(f => (
                        <div key={f.key}>
                          <dt style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#5c5a57', letterSpacing: '1px', textTransform: 'uppercase' }}>{f.label}</dt>
                          <dd style={{ margin: 0, fontSize: '14px', color: spec[f.key] ? '#f0ede8' : '#3a3835' }}>
                            {spec[f.key] ? (refNames[spec[f.key]!] ?? spec[f.key]) : '—'}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}
              {fields.filter(f => !f.fixed).map(def => renderField(def))}
            </Section>
          )
        })}

        <Section title="Provenance">
          <Field label="Source type">
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#141414', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '4px', padding: '8px 12px',
            }}>
              <span style={{ color: '#f0ede8', fontSize: '14px' }}>Owner registration</span>
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#3a3835' }}>locked</span>
            </div>
          </Field>
          <Field label="Last known price (£)">
            <input type="number" step="0.01" value={identity.last_price} onChange={e => setIdentity(p => ({ ...p, last_price: e.target.value }))} placeholder="e.g. 250" className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Source URL">
              <input type="url" value={identity.source_url} onChange={e => setIdentity(p => ({ ...p, source_url: e.target.value }))} placeholder="https://…" className={inputCls} />
            </Field>
          </div>
          <Field label="Last known country">
            <select value={identity.last_known_country} onChange={e => setIdentity(p => ({ ...p, last_known_country: e.target.value }))} className={selectCls}>
              <option value="">Select…</option>
              {['United Kingdom','Ireland','United States','Canada','Australia','New Zealand','Germany','France','Netherlands','Belgium','Sweden','Norway','Denmark','Spain','Italy','Other']
                .map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Last known region">
            <input type="text" value={identity.last_known_region} onChange={e => setIdentity(p => ({ ...p, last_known_region: e.target.value }))} placeholder="e.g. Scotland, California, New South Wales…" maxLength={80} className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Last known city">
              <input type="text" value={identity.last_known_city} onChange={e => setIdentity(p => ({ ...p, last_known_city: e.target.value }))} placeholder="e.g. Glasgow, Los Angeles, Sydney…" maxLength={80} className={inputCls} />
            </Field>
          </div>
        </Section>

        <Section title="Photos">
          <div className="sm:col-span-2">
            <p style={{ ...monoNote, marginBottom: '10px' }}>
              Upload a photo for each position where possible. The <b>electronics cavity</b> photo is required — it lets us check wiring and any modifications that can&apos;t be seen from outside.
            </p>
            <div style={{ marginBottom: '16px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a96e', marginBottom: '8px' }}>
                Photo tips
              </p>
              <ul style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#5c5a57', lineHeight: 1.8, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>— Natural or soft diffused light works best — avoid direct flash</li>
                <li>— Plain backgrounds help: a light-coloured carpet, rug, or clean towel laid flat is ideal</li>
                <li>— Hold the camera directly above and perpendicular to the guitar — 90° minimises lens distortion</li>
                <li>— Keep the guitar centred and fill the frame — avoid wide empty borders</li>
                <li>— For the electronics cavity, remove the cover plate and show all the wiring clearly</li>
              </ul>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
              {imageSlots.map((slot, i) => (
                <div key={slot.position} style={{ position: 'relative' }}>
                  <label style={{ display: 'block', cursor: 'pointer' }}>
                    <div style={{
                      position: 'relative', aspectRatio: '3 / 4',
                      border: `1px solid ${slot.file ? 'rgba(200,169,110,0.35)' : slot.required ? 'rgba(184,85,58,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '4px', overflow: 'hidden', background: '#0d0d0d',
                      transition: 'border-color 0.15s',
                    }}>
                      {slot.preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={slot.preview} alt={slot.position} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '6px', padding: '8px', textAlign: 'center' }}>
                          <span style={{ color: '#2a2a2a', fontSize: '28px', lineHeight: 1 }}>+</span>
                          {slot.hint && <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '8px', color: '#3a3835', lineHeight: 1.4 }}>{slot.hint}</span>}
                        </div>
                      )}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '5px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
                        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', color: slot.file ? '#c8a96e' : '#3a3835' }}>
                          {slot.position}{slot.required && !slot.file ? ' *' : ''}
                        </span>
                      </div>
                    </div>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleSlotFile(i, e.target.files?.[0] ?? null)} />
                  </label>
                  {slot.file && (
                    <button type="button" onClick={() => handleSlotFile(i, null)}
                      style={{
                        position: 'absolute', top: '6px', right: '6px',
                        background: 'rgba(0,0,0,0.75)', border: 'none', borderRadius: '2px',
                        width: '22px', height: '22px', cursor: 'pointer', color: '#9e9b96',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', lineHeight: 1,
                      }}
                    >×</button>
                  )}
                </div>
              ))}
            </div>
            {imageSlots.some(s => s.file) && (
              <p style={{ ...monoNote, marginTop: '12px' }}>
                {imageSlots.filter(s => s.file).length} of {imageSlots.length} positions filled
              </p>
            )}
          </div>
        </Section>

        <Section title="Your details">
          <Field label="Your email" required>
            <input type="email" value={identity.submitter_email} onChange={e => setIdentity(p => ({ ...p, submitter_email: e.target.value }))} placeholder="never displayed publicly" required className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea
                value={identity.submission_notes}
                onChange={e => setIdentity(p => ({ ...p, submission_notes: e.target.value }))}
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
          silhouetteUrl={silhouetteFor(silhouetteSet, imageSlots[cropTarget.index].position, {
            bodyFamily: modelRow?.maverick_body_family,
            headstockStyle: values['headstock_style'] || modelRow?.headstock_style,
            model: identity.model,
          })}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropTarget(null)}
        />
      )}
    </div>
  )
}
