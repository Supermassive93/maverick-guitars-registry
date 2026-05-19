'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import GuidedCropModal from '@/components/GuidedCropModal'

type ModelConfig = { prefix: string }
const MODEL_CONFIG: Record<string, ModelConfig> = {
  'F1':               { prefix: 'F1-' },
  'F1HT':             { prefix: 'F1HT-' },
  'F2':               { prefix: 'F2-' },
  'F3':               { prefix: 'F3-' },
  'F4':               { prefix: 'F4-' },
  'FD-Tox':           { prefix: 'FD-' },
  'X1':               { prefix: 'X1-' },
  'XD-Tox':           { prefix: 'XD-' },
  'X-Treme':          { prefix: 'XT-' },
  'Species 1':        { prefix: 'SP1-' },
  'Species 2':        { prefix: 'SP2-' },
  'Species 3':        { prefix: 'SP3-' },
  'Species 7 String': { prefix: 'SP7-' },
  'Chaos 1':          { prefix: 'C1-' },
  'Chaos 2':          { prefix: 'C2-' },
  'SF-1':             { prefix: 'SF-' },
  'Matrix':           { prefix: 'MAT-' },
  'G1':               { prefix: 'G1-' },
  'G2':               { prefix: 'G2-' },
  'B1':               { prefix: 'B1-' },
  'S4':               { prefix: 'S4-' },
  'S5':               { prefix: 'S5-' },
  'Z-47':             { prefix: 'Z47-' },
  'JR4':              { prefix: 'JR4-' },
  'Unknown':          { prefix: '' },
}

// Series ref IDs by model name
const MODEL_SERIES_REF: Record<string, string> = {
  'F1': 'SER-0001', 'F1HT': 'SER-0005', 'F2': 'SER-0001', 'F3': 'SER-0001',
  'F4': 'SER-0001', 'FD-Tox': 'SER-0003', 'X1': 'SER-0001', 'XD-Tox': 'SER-0003',
  'X-Treme': 'SER-0001', 'Species 1': 'SER-0002', 'Species 2': 'SER-0002',
  'Species 3': 'SER-0002', 'Species 7 String': 'SER-0002', 'Chaos 1': 'SER-0002',
  'Chaos 2': 'SER-0002', 'SF-1': 'SER-0001', 'Matrix': 'SER-0001',
  'G1': 'SER-0005', 'G2': 'SER-0005', 'B1': 'SER-0004', 'S4': 'SER-0004',
  'S5': 'SER-0004', 'Z-47': 'SER-0004', 'JR4': 'SER-0005', 'Unknown': 'SER-0005',
}

const MODEL_GROUPS: Record<string, string[]> = {
  'Evolution': ['F1', 'F2', 'F3', 'F4', 'SF-1', 'X1', 'X-Treme', 'Matrix'],
  'Century':   ['Chaos 1', 'Chaos 2', 'Species 1', 'Species 2', 'Species 3', 'Species 7 String'],
  'D-Tox':     ['XD-Tox', 'FD-Tox'],
  'Nemesis':   ['B1', 'Z-47', 'S4', 'S5'],
  'Other':     ['F1HT', 'G1', 'G2', 'JR4'],
}

// Bridge ref IDs that have a whammy bar
const TREMOLO_BRIDGES = new Set(['BRG-0001', 'BRG-0002', 'BRG-0003', 'BRG-0006'])
// Bridge ref IDs that require a locking nut
const FLOYD_ROSE_BRIDGES = new Set(['BRG-0001', 'BRG-0002', 'BRG-0003'])

// Aftermarket ref IDs that trigger the "Modified" flag
const AFTERMARKET_IDS = new Set([
  'FIN-0003', 'NCK-0004', 'NCK-0005', 'BRG-0003',
  'PSR-0004', 'SKS-0003', 'SKN-0003', 'NUT-0003',
  'SWT-0004', 'POT-0003', 'TNR-0002',
])

type SelectOpt = { value: string; label: string }

// --- Dropdown option lists (value = ref ID, label = display name) ---
const FINISH_OPTS: SelectOpt[] = [
  { value: 'FIN-0001', label: 'Factory Finish' },
  { value: 'FIN-0002', label: 'Custom Shop Finish' },
  { value: 'FIN-0003', label: 'Refinished' },
  { value: 'FIN-0005', label: 'Unknown' },
]

const FACTORY_COLOUR_OPTS: SelectOpt[] = [
  { value: 'COL-0001', label: 'BK — Gloss Black' },
  { value: 'COL-0002', label: 'WH — Gloss White' },
  { value: 'COL-0003', label: 'CB — Cherry Burst' },
  { value: 'COL-0004', label: 'SR — Sunset Red' },
  { value: 'COL-0005', label: 'MB — Metallic Blue' },
  { value: 'COL-0006', label: 'EB — Electric Blue' },
  { value: 'COL-0007', label: 'TRL — Tribal Red' },
  { value: 'COL-0008', label: 'OW — Old White' },
  { value: 'COL-0009', label: 'CSK — Cosmos Black' },
  { value: 'COL-0012', label: 'GM — Gunmetal' },
  { value: 'COL-0013', label: 'TBS — Tobacco Sunburst' },
  { value: 'COL-0018', label: 'UV — Ultra Violet' },
  { value: 'COL-0019', label: 'NB — Natural Basswood' },
  { value: 'COL-0020', label: 'FB — Fireburst' },
  { value: 'COL-0021', label: 'MR — Metallic Red' },
  { value: 'COL-0022', label: 'NA — Natural Ash' },
  { value: 'COL-0023', label: 'Unknown' },
]

const CUSTOM_COLOUR_OPTS: SelectOpt[] = [
  { value: 'CSC-0001', label: 'BW — Black & White (Zebra)' },
  { value: 'CSC-0002', label: 'BR — Black & Red (Denis the Menace)' },
  { value: 'CSC-0005', label: 'NY — Neon Yellow' },
  { value: 'CSC-0003', label: 'Custom Airbrushed' },
  { value: 'CSC-0004', label: 'Unknown' },
]

const HEADSTOCK_FACE_OPTS: SelectOpt[] = [
  { value: 'HDF-0001', label: 'Matches body colour' },
  { value: 'HDF-0002', label: 'Black' },
  { value: 'HDF-0003', label: 'Natural' },
  { value: 'HDF-0004', label: 'Unknown' },
]

const HEADSTOCK_LOGO_OPTS: SelectOpt[] = [
  { value: 'HGL-0001', label: 'Maverick Script Logo — Lacquer-encapsulated foil decal' },
  { value: 'HGL-0002', label: 'Maverick Script Logo — Cream silkscreen' },
  { value: 'HGL-0003', label: 'Unknown' },
]

const BODY_WOOD_OPTS: SelectOpt[] = [
  { value: 'BWD-0001', label: 'Canadian Basswood' },
  { value: 'BWD-0002', label: 'American Alder' },
  { value: 'BWD-0003', label: 'American Swamp Ash' },
  { value: 'BWD-0004', label: 'Mahogany' },
  { value: 'BWD-0005', label: 'Unknown' },
]

const BODY_SHAPE_OPTS: SelectOpt[] = [
  { value: 'BSA-0001', label: 'Superstrat' },
  { value: 'BSA-0002', label: 'Offset Double Cut' },
  { value: 'BSA-0003', label: 'Single Cut — LP Style' },
  { value: 'BSA-0005', label: 'Double Cut — PRS Style' },
  { value: 'BSA-0006', label: 'Extended Range' },
  { value: 'BSA-0008', label: 'Jazz Bass' },
  { value: 'BSA-0009', label: 'Precision Bass' },
  { value: 'BSA-0010', label: 'Unknown' },
]

const BRIDGE_OPTS: SelectOpt[] = [
  { value: 'BRG-0001', label: 'Maverick Floyd Rose — Licensed' },
  { value: 'BRG-0002', label: 'Floyd Rose — Original' },
  { value: 'BRG-0003', label: 'Floyd Rose — Licensed (Non-Maverick)' },
  { value: 'BRG-0005', label: 'Hardtail' },
  { value: 'BRG-0006', label: 'Vintage Tremolo' },
  { value: 'BRG-0007', label: 'Maverick/Wilkinson Wraparound' },
  { value: 'BRG-0004', label: 'Tune-o-matic' },
  { value: 'BRG-0008', label: 'Bass Bridge' },
  { value: 'BRG-0009', label: 'Unknown' },
]

const WHAMMY_OPTS: SelectOpt[] = [
  { value: 'Factory — With O-ring grips',    label: 'Factory — With O-ring grips' },
  { value: 'Factory — Without O-ring grips', label: 'Factory — Without O-ring grips' },
  { value: 'Aftermarket',                    label: 'Aftermarket' },
  { value: 'Missing',                        label: 'Missing' },
]

const PICKUP_SURROUNDS_OPTS: SelectOpt[] = [
  { value: 'PSR-0001', label: 'Factory — No Surrounds' },
  { value: 'PSR-0002', label: 'Factory — Black Rings' },
  { value: 'PSR-0003', label: 'Factory — Cream Rings' },
  { value: 'PSR-0004', label: 'Aftermarket' },
  { value: 'PSR-0005', label: 'Unknown' },
]

const HARDWARE_COLOUR_OPTS: SelectOpt[] = [
  { value: 'HWC-0001', label: 'Gold' },
  { value: 'HWC-0002', label: 'Black' },
  { value: 'HWC-0003', label: 'Nickel' },
  { value: 'HWC-0004', label: 'Unknown' },
]

const SWITCH_KNOB_OPTS: SelectOpt[] = [
  { value: 'Factory — Cylindrical with O-rings', label: 'Factory — Cylindrical with O-rings' },
  { value: 'Factory — Tapered',                  label: 'Factory — Tapered' },
  { value: 'Aftermarket',                        label: 'Aftermarket' },
  { value: 'Unknown',                            label: 'Unknown' },
]

const TUNER_OPTS: SelectOpt[] = [
  { value: 'TNR-0001', label: 'Factory — Maverick/Wilkinson' },
  { value: 'TNR-0002', label: 'Aftermarket' },
  { value: 'TNR-0003', label: 'Unknown' },
]

const PICKUP_CONFIG_OPTS: SelectOpt[] = [
  { value: 'PCG-0001', label: 'HH' },
  { value: 'PCG-0002', label: 'HSH' },
  { value: 'PCG-0003', label: 'HSS' },
  { value: 'PCG-0004', label: 'HS' },
  { value: 'PCG-0005', label: 'H' },
  { value: 'PCG-0006', label: 'SSS' },
  { value: 'PCG-0007', label: 'SS' },
  { value: 'PCG-0008', label: 'Other' },
  { value: 'PCG-0009', label: 'Unknown' },
]

const PICKUP_COLOUR_OPTS: SelectOpt[] = [
  { value: 'PKC-0001', label: 'Black Covers' },
  { value: 'PKC-0002', label: 'Nickel Covers' },
  { value: 'PKC-0003', label: 'Cream Covers' },
  { value: 'PKC-0004', label: 'Black & Cream' },
  { value: 'PKC-0005', label: 'Unknown' },
]

const SWITCH_TYPE_OPTS: SelectOpt[] = [
  { value: 'SWT-0001', label: 'Factory 5 Way Blade Switch' },
  { value: 'SWT-0002', label: 'Factory 3 Way Toggle Switch' },
  { value: 'SWT-0003', label: 'Factory 3 Way Blade Switch' },
  { value: 'SWT-0004', label: 'Aftermarket' },
  { value: 'SWT-0005', label: 'Unknown' },
]

const POTENTIOMETER_OPTS: SelectOpt[] = [
  { value: 'POT-0001', label: 'Factory Patented Evolution Roller Pots' },
  { value: 'POT-0002', label: 'Factory Standard Pots' },
  { value: 'POT-0003', label: 'Aftermarket' },
  { value: 'POT-0004', label: 'Unknown' },
]

const NECK_CONSTRUCTION_OPTS: SelectOpt[] = [
  { value: 'NCK-0001', label: 'Factory — Bolt-on 2-piece scarf joint' },
  { value: 'NCK-0002', label: 'Factory — Set neck' },
  { value: 'NCK-0003', label: 'Factory — Neck-through' },
  { value: 'NCK-0004', label: 'Aftermarket Replacement' },
  { value: 'NCK-0005', label: 'Modified' },
  { value: 'NCK-0006', label: 'Unknown' },
]

const NECK_WOOD_OPTS: SelectOpt[] = [
  { value: 'NWD-0001', label: 'Selected Canadian Maple' },
  { value: 'NWD-0002', label: 'Rock Maple' },
  { value: 'NWD-0003', label: 'Maple' },
  { value: 'NWD-0005', label: 'Bubinga' },
  { value: 'NWD-0006', label: 'Mahogany' },
  { value: 'NWD-0004', label: 'Unknown' },
]

const NECK_PROFILE_OPTS: SelectOpt[] = [
  { value: 'NPR-0001', label: 'Ultra Thin' },
  { value: 'NPR-0002', label: 'Thin C' },
  { value: 'NPR-0003', label: 'Medium C' },
  { value: 'NPR-0004', label: 'Fat C' },
  { value: 'NPR-0005', label: 'D' },
  { value: 'NPR-0006', label: 'U' },
  { value: 'NPR-0007', label: 'Unknown' },
]

const BODY_CONSTRUCTION_OPTS: SelectOpt[] = [
  { value: 'BCN-0001', label: 'Single Slab' },
  { value: 'BCN-0002', label: 'Two-piece' },
  { value: 'BCN-0003', label: 'Three-piece' },
  { value: 'BCN-0004', label: 'Unknown' },
]

const HEADSTOCK_STYLE_OPTS: SelectOpt[] = [
  { value: 'HST-0001', label: '6-aside' },
  { value: 'HST-0002', label: '6-aside reversed' },
  { value: 'HST-0003', label: '4-aside' },
  { value: 'HST-0004', label: '3+3-aside' },
  { value: 'HST-0005', label: '3+2-aside' },
  { value: 'HST-0006', label: 'Unknown' },
]

const SCALE_LENGTH_OPTS: SelectOpt[] = [
  { value: 'SCL-0001', label: '25" (Maverick / PRS Core)' },
  { value: 'SCL-0002', label: '25.5" (Fender)' },
  { value: 'SCL-0003', label: '24.75" (Gibson)' },
  { value: 'SCL-0005', label: '30" (Bass — Short Scale)' },
  { value: 'SCL-0006', label: '34" (Bass — Standard)' },
  { value: 'SCL-0007', label: 'Unknown' },
]

const FRET_COUNT_OPTS: SelectOpt[] = [
  { value: 'FRT-0001', label: '19' },
  { value: 'FRT-0002', label: '21' },
  { value: 'FRT-0003', label: '22' },
  { value: 'FRT-0004', label: '24' },
  { value: 'FRT-0005', label: 'Unknown' },
]

const FRETBOARD_WOOD_OPTS: SelectOpt[] = [
  { value: 'FWD-0001', label: 'AAA Indian Rosewood' },
  { value: 'FWD-0002', label: 'AAA Grade Canadian Maple' },
  { value: 'FWD-0003', label: 'Ebony' },
  { value: 'FWD-0004', label: 'Matrix — Rosewood & Maple' },
  { value: 'FWD-0006', label: 'Unknown' },
]

const NUT_TYPE_OPTS: SelectOpt[] = [
  { value: 'NUT-0001', label: 'Factory — Locking nut' },
  { value: 'NUT-0002', label: 'Factory — Standard nut' },
  { value: 'NUT-0003', label: 'Aftermarket' },
  { value: 'NUT-0004', label: 'Unknown' },
]

const NECK_BINDING_OPTS: SelectOpt[] = [
  { value: 'NKB-0001', label: 'Factory — No Binding' },
  { value: 'NKB-0002', label: 'Factory — Cream Binding' },
  { value: 'NKB-0003', label: 'Factory — Black Binding' },
  { value: 'NKB-0004', label: 'Unknown' },
]

const SKUNK_STRIPE_OPTS: SelectOpt[] = [
  { value: 'SKS-0001', label: 'Factory — Skunk stripe' },
  { value: 'SKS-0002', label: 'Factory — No skunk stripe' },
  { value: 'SKS-0003', label: 'Aftermarket' },
  { value: 'SKS-0004', label: 'Unknown' },
]

// Pickup position labels by pickup_configuration ref ID
type PickupPositions = { bridge: string | null; middle: string | null; neck: string | null }
const PICKUP_CONFIG_MAP: Record<string, PickupPositions> = {
  'PCG-0001': { bridge: 'Humbucker',   middle: null,          neck: 'Humbucker'   },
  'PCG-0002': { bridge: 'Humbucker',   middle: 'Single Coil', neck: 'Humbucker'   },
  'PCG-0003': { bridge: 'Humbucker',   middle: 'Single Coil', neck: 'Single Coil' },
  'PCG-0004': { bridge: 'Humbucker',   middle: 'Single Coil', neck: null          },
  'PCG-0005': { bridge: 'Humbucker',   middle: null,          neck: null          },
  'PCG-0007': { bridge: 'Single Coil', middle: null,          neck: 'Single Coil' },
  'PCG-0006': { bridge: 'Single Coil', middle: 'Single Coil', neck: 'Single Coil' },
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
  bridge_type: string              // was bridge_configuration
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
  neck_wood: string
  neck_profile: string
  body_construction: string
  skunk_stripe: string
  headstock_break_angle: string
  neck_pitch: string
  left_handed_available: string    // was left_handed; stores 'No' or 'Yes' UI values
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
  left_handed_available: 'No',
  body_wood: '', body_shape_analogue: '', pickup_configuration: '',
  neck_pickup: '', middle_pickup: '', bridge_pickup: '', bridge_type: '',
  hardware_colour: '', headstock_face: '', headstock_style: '', headstock_logo: '', bridge_logo: '', pickup_surrounds: '',
  pickup_colours: '', tuner_style: '',
  neck_binding: '', switch_type: '', switch_knob: '', potentiometers: '',
  nut_type: '', whammy_bar: '', fret_count: '', fretboard_wood: '', scale_length: '',
  neck_construction: '', neck_wood: '', neck_profile: '', body_construction: '', skunk_stripe: '', headstock_break_angle: '',
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
  value: string
  onChange: (v: string) => void
  options: SelectOpt[]
  placeholder?: string
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={selectCls}>
      <option value="">{placeholder ?? 'Select…'}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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

function valueIndicatesModified(value: string): boolean {
  return AFTERMARKET_IDS.has(value)
}

type GateState = 'checking' | 'gate' | 'form'

export default function SubmitForm() {
  const searchParams = useSearchParams()
  const claimModel  = searchParams.get('model')  ?? ''
  const claimSerial = searchParams.get('serial') ?? ''

  const [gateState, setGateState] = useState<GateState>('checking')
  const [form, setForm] = useState<FormState>(INITIAL)
  const [modelId, setModelId] = useState<string>('')
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

  const claimApplied = useRef(false)
  useEffect(() => {
    if (gateState !== 'form' || claimApplied.current) return
    if (!claimModel || !MODEL_CONFIG[claimModel]) return
    claimApplied.current = true
    const prefix = MODEL_CONFIG[claimModel].prefix
    const digits = claimSerial.startsWith(prefix) ? claimSerial.slice(prefix.length) : claimSerial
    setForm(prev => ({ ...prev, model: claimModel, serial: claimSerial, serial_status: 'Complete' }))
    setSerialDigits(digits)
    if (claimModel !== 'Unknown') prefillFromModel(claimModel)
  }, [gateState, claimModel, claimSerial])

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

    const { data: msData } = await supabase
      .from('model_specifications')
      .select('id')
      .eq('model', model)
      .single()

    if (msData?.id) setModelId(msData.id)
    if (!msData?.id) return

    const [{ data }, { data: shapeData }] = await Promise.all([
      supabase
        .from('catalogue_models')
        .select('pickup_configuration, bridge_type, switch_type, potentiometers, body_shape_analogue, body_wood, pickup_colour, headstock_face, headstock_style, fretboard_wood, scale_length, nut_type')
        .eq('model_id', msData.id)
        .order('catalogue_year', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('model_shape_registry')
        .select('body_shape_analogue, headstock_style')
        .eq('model', model)
        .single(),
    ])

    if (!data && !shapeData) return

    const updates: Partial<FormState> = {}
    const filled = new Set<keyof FormState>()

    if (data?.pickup_configuration) {
      updates.pickup_configuration = data.pickup_configuration
      filled.add('pickup_configuration')
    }
    if (data?.bridge_type) {
      updates.bridge_type = data.bridge_type
      filled.add('bridge_type')
      if (!TREMOLO_BRIDGES.has(data.bridge_type)) updates.whammy_bar = ''
    }
    if (data?.switch_type) {
      updates.switch_type = data.switch_type
      filled.add('switch_type')
    }
    if (data?.potentiometers) {
      updates.potentiometers = data.potentiometers
      filled.add('potentiometers')
    }
    const bodyShape = shapeData?.body_shape_analogue ?? data?.body_shape_analogue
    if (bodyShape) {
      updates.body_shape_analogue = bodyShape
      filled.add('body_shape_analogue')
    }
    if (data?.body_wood) {
      updates.body_wood = data.body_wood
      filled.add('body_wood')
    }
    if (data?.pickup_colour) {
      updates.pickup_colours = data.pickup_colour
      filled.add('pickup_colours')
    }
    if (data?.headstock_face) {
      updates.headstock_face = data.headstock_face
      filled.add('headstock_face')
    }
    if (data?.fretboard_wood) {
      updates.fretboard_wood = data.fretboard_wood
      filled.add('fretboard_wood')
    }
    const headstockStyle = shapeData?.headstock_style ?? data?.headstock_style
    if (headstockStyle) {
      updates.headstock_style = headstockStyle
      filled.add('headstock_style')
    }
    if (data?.scale_length) {
      updates.scale_length = data.scale_length
      filled.add('scale_length')
    }
    if (data?.nut_type) {
      updates.nut_type = data.nut_type
      filled.add('nut_type')
    }

    updates.tuner_style = 'TNR-0001'
    filled.add('tuner_style')

    setForm(prev => ({ ...prev, ...updates }))
    setCatalogueValues(updates)
    setPrefilledFields(filled)
  }

  async function handleModelChange(model: string) {
    setSerialDigits('')
    setPrefilledFields(new Set())
    setCatalogueValues({})
    setModelId('')
    setForm(prev => ({ ...prev, model, serial: '', serial_status: '' }))
    if (model && model !== 'Unknown') {
      prefillFromModel(model)
    } else if (model === 'Unknown') {
      // Still look up the model_specifications UUID for Unknown
      const supabase = createSupabaseBrowserClient()
      const { data } = await supabase
        .from('model_specifications')
        .select('id')
        .eq('model', 'Unknown')
        .single()
      if (data?.id) setModelId(data.id)
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
      if (key === 'bridge_logo' && value !== 'Aftermarket branded') setBridgeLogoBrand('')
      if (key === 'neck_construction') {
        if (value === 'NCK-0001') {
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
      if (key === 'bridge_type') {
        if (FLOYD_ROSE_BRIDGES.has(value) || (value && !TREMOLO_BRIDGES.has(value) && value !== 'BRG-0009')) {
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
        if (key === 'bridge_type') {
          if (!TREMOLO_BRIDGES.has(value)) next.whammy_bar = ''
          if (FLOYD_ROSE_BRIDGES.has(value)) {
            next.nut_type = 'NUT-0001'
          } else if (value && value !== 'BRG-0009' && !TREMOLO_BRIDGES.has(value)) {
            next.nut_type = 'NUT-0002'
          }
        }
        if (key === 'neck_construction') {
          if (value === 'NCK-0001') {
            next.skunk_stripe = 'SKS-0001'
            next.neck_binding = 'NKB-0001'
            next.fret_count   = 'FRT-0004'
          } else if (value === 'NCK-0002') {
            next.skunk_stripe = 'SKS-0004'
            next.neck_binding = 'NKB-0004'
          } else if (value === 'NCK-0003') {
            next.skunk_stripe = 'SKS-0004'
            next.neck_binding = 'NKB-0004'
          } else if (value === 'NCK-0004' || value === 'NCK-0005') {
            next.skunk_stripe = 'SKS-0003'
            next.neck_binding = 'NKB-0004'
          } else {
            next.skunk_stripe = ''
            next.neck_binding = ''
            next.fret_count   = ''
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
    if (!modelId) { setError('Could not resolve model — please re-select your model and try again.'); return }
    setSubmitting(true)
    setError('')

    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      const hasImages = imageSlots.some(s => s.file)
      const uploadedMap = hasImages ? await uploadImages() : new Map<string, string>()
      const imageUrls = IMAGE_SCHEMA.map(p => uploadedMap.get(p)).filter((u): u is string => Boolean(u))

      let registeredBy = 'Guest'
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
        user_id:              user?.id ?? null,
        registered_by:        registeredBy,
        model_id:             modelId,
        serial:               form.serial || null,
        serial_status:        form.serial_status || null,
        series:               MODEL_SERIES_REF[form.model] ?? null,
        generation:           null,
        catalogue_year:       null,
        finish_type:          form.finish_type || null,
        factory_colour:       form.factory_colour || null,
        custom_shop_colour:   form.custom_shop_colour || null,
        body_wood:            form.body_wood || null,
        body_shape_analogue:  form.body_shape_analogue || null,
        pickup_configuration: form.pickup_configuration || null,
        neck_pickup:          form.neck_pickup || null,
        middle_pickup:        form.middle_pickup || null,
        bridge_pickup:        form.bridge_pickup || null,
        bridge_type:          form.bridge_type || null,
        hardware_colour:      form.hardware_colour || null,
        headstock_face:       form.headstock_face || null,
        headstock_style:      form.headstock_style || null,
        headstock_logo:       form.headstock_logo || null,
        bridge_logo:          form.bridge_logo === 'Aftermarket branded' && bridgeLogoBrand
                                ? `Aftermarket branded — ${bridgeLogoBrand}`
                                : form.bridge_logo || null,
        pickup_surrounds:     form.pickup_surrounds || null,
        pickup_colours:       form.pickup_colours || null,
        tuner_style:          form.tuner_style || null,
        neck_binding:         form.neck_binding || null,
        switch_type:          form.switch_type || null,
        switch_knob:          form.switch_knob || null,
        potentiometers:       form.potentiometers || null,
        whammy_bar:           form.whammy_bar || null,
        nut_type:             form.nut_type || null,
        fret_count:           form.fret_count || null,
        fretboard_wood:       form.fretboard_wood || null,
        scale_length:         form.scale_length || null,
        neck_construction:    form.neck_construction || null,
        neck_wood:            form.neck_wood || null,
        neck_profile:         form.neck_profile || null,
        body_construction:    form.body_construction || null,
        skunk_stripe:         form.skunk_stripe || null,
        left_handed_available: form.left_handed_available === 'Yes' ? 'LHA-0001' : null,
        headstock_break_angle: form.headstock_break_angle ? parseFloat(form.headstock_break_angle) : null,
        neck_pitch:           form.neck_pitch ? parseFloat(form.neck_pitch) : null,
        last_known_country:   form.last_known_country || null,
        last_known_region:    form.last_known_region || null,
        last_known_city:      form.last_known_city || null,
        source_type:          form.source_type || null,
        source_url:           form.source_url || null,
        last_price:           form.last_price ? parseFloat(form.last_price) : null,
        submitter_email:      form.submitter_email,
        submission_notes:     `${notesPrefix}${form.submission_notes}`.trim() || null,
        image_urls:           imageUrls.length > 0 ? imageUrls : null,
        primary_image_url:    uploadedMap.get('Full front') ?? imageUrls[0] ?? null,
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
          {form.submitter_email && (
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#5c5a57', marginBottom: '40px' }}>
              Confirmation will be sent to {form.submitter_email}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
            <Link href="/" style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#c8a96e', textDecoration: 'none' }}>
              ← Back to registry
            </Link>
            <button
              onClick={() => {
                setSubmitted(false)
                setForm(INITIAL)
                setModelId('')
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
                {Object.entries(MODEL_GROUPS).map(([series, models]) => (
                  <optgroup key={series} label={series}>
                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                  </optgroup>
                ))}
              </select>
            </Field>
          </div>

          {/* Serial */}
          <div className="sm:col-span-2">
            <Field label="Serial number">
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <span style={{
                  display: 'flex', alignItems: 'center',
                  background: '#141414',
                  border: '1px solid rgba(255,255,255,0.12)', borderRight: 'none',
                  padding: '0 12px',
                  fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
                  color: form.model ? '#c8a96e' : '#3a3835',
                  letterSpacing: '1px', whiteSpace: 'nowrap', minWidth: '56px',
                }}>
                  {form.model ? (MODEL_CONFIG[form.model]?.prefix || '?-') : '—'}
                </span>
                <input
                  type="text" inputMode="numeric"
                  value={serialDigits}
                  onChange={e => handleSerialDigits(e.target.value)}
                  disabled={!form.model}
                  placeholder={form.model ? '5-digit code' : 'Select model first'}
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
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', marginTop: '5px' }}>
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

          {!serialDigits && (
            <Field label="Serial status">
              <Select
                value={form.serial_status}
                onChange={set('serial_status')}
                options={[
                  { value: 'Prefix only',  label: 'Prefix only' },
                  { value: 'None Visible', label: 'None Visible' },
                  { value: 'Paper label',  label: 'Paper label' },
                  { value: 'Hand label',   label: 'Hand label' },
                ]}
                placeholder="Unknown / not entered"
              />
            </Field>
          )}

          {(form.serial_status === 'Paper label' || form.serial_status === 'Hand label') && (
            <div className="sm:col-span-2">
              <Field label="Label content">
                <input
                  type="text" value={form.serial}
                  onChange={e => setForm(prev => ({ ...prev, serial: e.target.value.slice(0, 60) }))}
                  placeholder="Describe or transcribe the label — e.g. 'Prototype 003', handwritten number…"
                  maxLength={60} className={inputCls}
                />
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
                  <button key={val} type="button" onClick={() => handleToggleModified(val === 'Modified')}
                    style={{
                      padding: '8px 28px', fontFamily: 'var(--font-dm-mono)', fontSize: '12px',
                      letterSpacing: '1px', textTransform: 'uppercase', border: 'none', cursor: 'pointer',
                      background: active ? '#c8a96e' : 'transparent',
                      color: active ? '#000' : '#5c5a57', transition: 'background 0.15s, color 0.15s',
                    }}
                  >{val}</button>
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

          {/* Handed toggle */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Handed</label>
            <div style={{ display: 'inline-flex', border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden' }}>
              {(['No', 'Yes'] as const).map(val => {
                const active = form.left_handed_available === val
                return (
                  <button key={val} type="button" onClick={() => set('left_handed_available')(val)}
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
            <Select value={form.finish_type} onChange={set('finish_type')} options={FINISH_OPTS} />
          </Field>
          {(!form.finish_type || form.finish_type === 'FIN-0001') && (
            <Field label="Factory colour">
              <Select value={form.factory_colour} onChange={set('factory_colour')} options={FACTORY_COLOUR_OPTS} />
            </Field>
          )}
          {form.finish_type === 'FIN-0002' && (
            <Field label="Custom Shop colour">
              <Select value={form.custom_shop_colour} onChange={set('custom_shop_colour')} options={CUSTOM_COLOUR_OPTS} />
            </Field>
          )}
          {form.finish_type === 'FIN-0003' && (
            <Field label="Refinish description">
              <input type="text" value={form.custom_shop_colour}
                onChange={e => set('custom_shop_colour')(e.target.value.slice(0, 100))}
                placeholder="e.g. Satin black rattle-can, sunburst respray…" maxLength={100} className={inputCls} />
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#3a3835', marginTop: '5px' }}>
                {form.custom_shop_colour.length}/100 characters
              </p>
            </Field>
          )}
          {form.finish_type === 'FIN-0005' && (
            <Field label="Finish description (optional)">
              <input type="text" value={form.custom_shop_colour}
                onChange={e => set('custom_shop_colour')(e.target.value.slice(0, 100))}
                placeholder="Describe what you can see, e.g. dark blue metallic…" maxLength={100} className={inputCls} />
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#3a3835', marginTop: '5px' }}>
                {form.custom_shop_colour.length}/100 characters
              </p>
            </Field>
          )}
          <Field label="Headstock face colour" prefilled={prefilledFields.has('headstock_face')}>
            <Select value={form.headstock_face} onChange={set('headstock_face')} options={HEADSTOCK_FACE_OPTS} />
          </Field>
          <Field label="Headstock logo">
            <Select value={form.headstock_logo} onChange={set('headstock_logo')} options={HEADSTOCK_LOGO_OPTS} />
          </Field>
          <Field label="Body wood" prefilled={prefilledFields.has('body_wood')}>
            <Select value={form.body_wood} onChange={set('body_wood')} options={BODY_WOOD_OPTS} />
          </Field>
          <Field label="Body shape" prefilled={prefilledFields.has('body_shape_analogue')}>
            <Select value={form.body_shape_analogue} onChange={set('body_shape_analogue')} options={BODY_SHAPE_OPTS} />
          </Field>
          <Field label="Body construction" prefilled={prefilledFields.has('body_construction')}>
            <Select value={form.body_construction} onChange={set('body_construction')} options={BODY_CONSTRUCTION_OPTS} />
          </Field>
        </Section>

        <Section title="Hardware & electronics">
          <div className="sm:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Hardware */}
              <div className="flex flex-col gap-4">
                <Field label="Bridge" prefilled={prefilledFields.has('bridge_type')}>
                  <Select value={form.bridge_type} onChange={set('bridge_type')} options={BRIDGE_OPTS} />
                </Field>
                <Field label="Bridge logo">
                  <Select value={form.bridge_logo} onChange={set('bridge_logo')} options={[
                    { value: 'Maverick Italic script logo',   label: 'Maverick Italic script logo' },
                    { value: 'Maverick Stencil script logo',  label: 'Maverick Stencil script logo' },
                    { value: 'No logo',                       label: 'No logo' },
                    { value: 'Aftermarket branded',           label: 'Aftermarket branded' },
                    { value: 'Unknown',                       label: 'Unknown' },
                  ]} />
                  {form.bridge_logo === 'Aftermarket branded' && (
                    <input type="text" value={bridgeLogoBrand}
                      onChange={e => setBridgeLogoBrand(e.target.value.slice(0, 60))}
                      placeholder="Brand name, e.g. Floyd Rose, Gotoh…" maxLength={60}
                      className={inputCls} style={{ marginTop: '6px' }} />
                  )}
                </Field>
                {TREMOLO_BRIDGES.has(form.bridge_type) && (
                  <Field label="Whammy bar">
                    <Select value={form.whammy_bar} onChange={set('whammy_bar')} options={WHAMMY_OPTS} />
                  </Field>
                )}
                <Field label="Pickup surrounds">
                  <Select value={form.pickup_surrounds} onChange={set('pickup_surrounds')} options={PICKUP_SURROUNDS_OPTS} />
                </Field>
                <Field label="Hardware colour">
                  <Select value={form.hardware_colour} onChange={set('hardware_colour')} options={HARDWARE_COLOUR_OPTS} />
                </Field>
                <Field label="Switch knob">
                  <Select value={form.switch_knob} onChange={set('switch_knob')} options={SWITCH_KNOB_OPTS} />
                </Field>
                <Field label="Tuner style" prefilled={prefilledFields.has('tuner_style')}>
                  <Select value={form.tuner_style} onChange={set('tuner_style')} options={TUNER_OPTS} />
                </Field>
              </div>

              {/* Electronics */}
              <div className="flex flex-col gap-4">
                <Field label="Pickup configuration" prefilled={prefilledFields.has('pickup_configuration')}>
                  <Select value={form.pickup_configuration} onChange={set('pickup_configuration')} options={PICKUP_CONFIG_OPTS} />
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
                  <Select value={form.pickup_colours} onChange={set('pickup_colours')} options={PICKUP_COLOUR_OPTS} />
                </Field>
                <Field label="Switch type" prefilled={prefilledFields.has('switch_type')}>
                  <Select value={form.switch_type} onChange={set('switch_type')} options={SWITCH_TYPE_OPTS} />
                </Field>
                <Field label="Potentiometers" prefilled={prefilledFields.has('potentiometers')}>
                  <Select value={form.potentiometers} onChange={set('potentiometers')} options={POTENTIOMETER_OPTS} />
                </Field>
              </div>

            </div>
          </div>
        </Section>

        <Section title="Neck & construction">
          <Field label="Neck construction">
            <Select value={form.neck_construction} onChange={set('neck_construction')} options={NECK_CONSTRUCTION_OPTS} />
          </Field>
          <Field label="Neck wood" prefilled={prefilledFields.has('neck_wood')}>
            <Select value={form.neck_wood} onChange={set('neck_wood')} options={NECK_WOOD_OPTS} />
          </Field>
          <Field label="Neck profile" prefilled={prefilledFields.has('neck_profile')}>
            <Select value={form.neck_profile} onChange={set('neck_profile')} options={NECK_PROFILE_OPTS} />
          </Field>
          <Field label="Headstock style" prefilled={prefilledFields.has('headstock_style')}>
            <Select value={form.headstock_style} onChange={set('headstock_style')} options={HEADSTOCK_STYLE_OPTS} />
          </Field>
          <Field label="Scale length" prefilled={prefilledFields.has('scale_length')}>
            <Select value={form.scale_length} onChange={set('scale_length')} options={SCALE_LENGTH_OPTS} />
          </Field>
          <Field label="Fret count" prefilled={prefilledFields.has('fret_count')}>
            <Select value={form.fret_count} onChange={set('fret_count')} options={FRET_COUNT_OPTS} />
          </Field>
          <Field label="Fretboard wood" prefilled={prefilledFields.has('fretboard_wood')}>
            <Select value={form.fretboard_wood} onChange={set('fretboard_wood')} options={FRETBOARD_WOOD_OPTS} />
          </Field>
          <Field label="Nut type" prefilled={prefilledFields.has('nut_type')}>
            <Select value={form.nut_type} onChange={set('nut_type')} options={NUT_TYPE_OPTS} />
          </Field>
          <Field label="Neck binding" prefilled={prefilledFields.has('neck_binding')}>
            <Select value={form.neck_binding} onChange={set('neck_binding')} options={NECK_BINDING_OPTS} />
          </Field>
          <Field label="Skunk stripe" prefilled={prefilledFields.has('skunk_stripe')}>
            <Select value={form.skunk_stripe} onChange={set('skunk_stripe')} options={SKUNK_STRIPE_OPTS} />
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
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#3a3835' }}>locked</span>
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
            <Select value={form.last_known_country} onChange={set('last_known_country')} options={[
              'United Kingdom','Ireland','United States','Canada','Australia','New Zealand',
              'Germany','France','Netherlands','Belgium','Sweden','Norway','Denmark','Spain','Italy','Other',
            ].map(c => ({ value: c, label: c }))} />
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
                <li>— Hold the camera directly above and perpendicular to the guitar — 90° minimises lens distortion</li>
                <li>— Keep the guitar centred and fill the frame — avoid wide empty borders</li>
              </ul>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {imageSlots.map((slot, i) => (
                <div key={slot.position} style={{ position: 'relative' }}>
                  <label style={{ display: 'block', cursor: 'pointer' }}>
                    <div style={{
                      position: 'relative', aspectRatio: '3 / 4',
                      border: `1px solid ${slot.file ? 'rgba(200,169,110,0.35)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '4px', overflow: 'hidden', background: '#0d0d0d',
                      transition: 'border-color 0.15s',
                    }}>
                      {slot.preview ? (
                        <img src={slot.preview} alt={slot.position} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <span style={{ color: '#2a2a2a', fontSize: '28px', lineHeight: 1 }}>+</span>
                        </div>
                      )}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '5px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
                        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', color: slot.file ? '#c8a96e' : '#3a3835' }}>
                          {slot.position}
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
