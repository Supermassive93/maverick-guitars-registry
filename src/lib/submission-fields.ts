// What the registration form asks for, in the same order and grouping as the model spec sheets.
// Every `key` is a column on `guitars` that mirrors a column on model_specifications / model_gen_specs,
// so a model's spec can pre-fill the form directly. Options for `cat` fields come from ref_values
// (never hard-coded), so the form can't drift from the spec tables.

export type FieldKind = 'ref' | 'number' | 'count'

export type FieldDef = {
  key: string
  label: string
  /** ref_values category (ID prefix, e.g. 'BSA') — omitted for numeric fields */
  cat?: string
  kind?: FieldKind
  unit?: string
  /** Owner may flag this part as an aftermarket replacement */
  flaggable?: boolean
  /** Aftermarket replacements for this field are picked from / added to the shared parts list */
  part?: 'pickup' | 'bridge' | 'tuner'
  /** Fixed by the model and can't change after the fact — shown as a read-only spec, never asked */
  fixed?: boolean
  /** Only asked for bass models (e.g. EQ circuitry) */
  bassOnly?: boolean
  /** Only shown when the bridge is a tremolo */
  needsTremolo?: boolean
  placeholder?: string
}

export type SectionDef = { id: string; title: string; fields: FieldDef[] }

export const BASS_MODELS = new Set(['B1', 'Z-47', 'S4', 'S5'])

export const SPEC_SECTIONS: SectionDef[] = [
  {
    id: 'body', title: 'Body',
    fields: [
      { key: 'body_shape_analogue', label: 'Body design analogue', cat: 'BSA', fixed: true },
      { key: 'body_wood', label: 'Body wood', cat: 'BWD', fixed: true },
      { key: 'body_construction', label: 'Body construction', cat: 'BCN', fixed: true },
      { key: 'joint_type', label: 'Joint type', cat: 'JNT', fixed: true },
      { key: 'body_bookmatched', label: 'Bookmatched', cat: 'BMK', fixed: true },
      { key: 'body_carving', label: 'Body contouring', cat: 'BCV', fixed: true },
      { key: 'body_decorative_routing', label: 'Decorative body routing', cat: 'BDR', fixed: true },
      { key: 'body_binding', label: 'Body binding', cat: 'BBN', fixed: true },
      { key: 'binding_colour', label: 'Binding colour', cat: 'BNC', fixed: true },
    ],
  },
  {
    id: 'electronics', title: 'Pickups & electronics',
    fields: [
      { key: 'pickup_configuration', label: 'Pickup configuration', cat: 'PCG' },
      // The three pickup positions are rendered by the form (they depend on the configuration)
      { key: 'bridge_pickup', label: 'Bridge pickup', cat: 'PKP', flaggable: true, part: 'pickup' },
      { key: 'middle_pickup', label: 'Middle pickup', cat: 'PKP', flaggable: true, part: 'pickup' },
      { key: 'neck_pickup', label: 'Neck pickup', cat: 'PKP', flaggable: true, part: 'pickup' },
      { key: 'pickup_colours', label: 'Pickup colours', cat: 'PKC' },
      { key: 'pickup_surrounds', label: 'Pickup surrounds', cat: 'PSR', flaggable: true },
      { key: 'coil_tap', label: 'Coil tap', cat: 'CTF', flaggable: true },
      { key: 'switch_type', label: 'Selector switch type', cat: 'SWT', flaggable: true },
      { key: 'switch_knob', label: 'Selector switch knob', cat: 'SKN', flaggable: true },
      { key: 'volume_pot', label: 'Volume pot', cat: 'POT', flaggable: true },
      { key: 'volume_pot_count', label: 'Volume pot count', kind: 'count' },
      { key: 'tone_pot', label: 'Tone pot', cat: 'POT', flaggable: true },
      { key: 'tone_pot_count', label: 'Tone pot count', kind: 'count' },
      { key: 'jack_socket', label: 'Jack socket', cat: 'JSK', flaggable: true },
      { key: 'eq_circuitry', label: 'EQ circuitry', cat: 'EQC', bassOnly: true },
    ],
  },
  {
    id: 'hardware', title: 'Hardware',
    fields: [
      { key: 'bridge_type', label: 'Bridge', cat: 'BRG', flaggable: true, part: 'bridge' },
      { key: 'bridge_logo', label: 'Bridge logo', cat: 'BGL' },
      { key: 'trem_arm', label: 'Trem arm', cat: 'TRM', flaggable: true, needsTremolo: true },
      { key: 'tremolo_cover_routing', label: 'Tremolo cover routing', cat: 'TCR', needsTremolo: true },
      { key: 'tuner_style', label: 'Tuners', cat: 'TNR', flaggable: true, part: 'tuner' },
      { key: 'hardware_colour', label: 'Hardware colour', cat: 'HWC', flaggable: true },
    ],
  },
  {
    id: 'neck', title: 'Neck',
    fields: [
      { key: 'neck_mount', label: 'Neck mount', cat: 'NMT' },
      { key: 'neck_construction', label: 'Neck construction', cat: 'NCK', flaggable: true },
      { key: 'neck_wood', label: 'Neck wood', cat: 'NWD' },
      { key: 'neck_profile', label: 'Neck profile', cat: 'NPR' },
      { key: 'neck_finish', label: 'Neck finish', cat: 'NKF' },
      { key: 'truss_rod', label: 'Truss rod', cat: 'TRD' },
      { key: 'truss_rod_cover', label: 'Truss rod cover', cat: 'TRC', flaggable: true },
      { key: 'fretboard_wood', label: 'Fretboard', cat: 'FWD' },
      { key: 'fretboard_radius_mm', label: 'Fretboard radius', kind: 'number', unit: 'mm', placeholder: 'e.g. 400' },
      { key: 'fret_count', label: 'Fret count', cat: 'FRT' },
      { key: 'scale_length', label: 'Scale length', cat: 'SCL' },
      { key: 'nut_type', label: 'Nut type', cat: 'NUT', flaggable: true },
      { key: 'nut_width', label: 'Nut width', kind: 'number', unit: 'mm', placeholder: 'e.g. 42.5 (calipers)' },
      { key: 'fretboard_markers', label: 'Fretboard markers', cat: 'FMK' },
      { key: 'fretboard_marker_colour', label: 'Fretboard marker colour', cat: 'FMC' },
      { key: 'side_dot_markers', label: 'Side-dot markers', cat: 'SDM' },
      { key: 'side_dot_colour', label: 'Side-dot colour', cat: 'FMC' },
      { key: 'neck_binding', label: 'Neck binding', cat: 'NKB' },
      { key: 'skunk_stripe', label: 'Skunk stripe', cat: 'SKS' },
    ],
  },
  {
    id: 'headstock', title: 'Headstock',
    fields: [
      { key: 'headstock_style', label: 'Headstock style', cat: 'HST' },
      { key: 'headstock_face', label: 'Headstock face', cat: 'HDF' },
      { key: 'headstock_logo', label: 'Headstock logo', cat: 'HGL' },
      { key: 'headstock_trademark', label: 'Headstock trademark', cat: 'HTM' },
      { key: 'headstock_binding', label: 'Headstock binding', cat: 'HDB' },
      { key: 'headstock_decorative_routing', label: 'Decorative headstock routing', cat: 'HDR' },
    ],
  },
  {
    id: 'other', title: 'Other measurements',
    fields: [
      { key: 'string_count', label: 'String count', kind: 'count' },
      { key: 'weight_kg', label: 'Weight', kind: 'number', unit: 'kg', placeholder: 'e.g. 3.4' },
      { key: 'headstock_break_angle', label: 'Headstock break angle', kind: 'number', unit: '°' },
      { key: 'neck_pitch', label: 'Neck pitch (mm packing to level)', kind: 'number', unit: 'mm' },
    ],
  },
]

export const ALL_SPEC_FIELDS: FieldDef[] = SPEC_SECTIONS.flatMap(s => s.fields)

// Pickup slots → how many pickups a configuration has, bridge-first (e.g. HSH = bridge, middle, neck).
// Unknown/Other configurations show all three so nothing is hidden from the owner.
export function pickupSlotsFor(configName: string | undefined): { bridge: boolean; middle: boolean; neck: boolean } {
  const n = configName && /^[HSP]+$/.test(configName) ? configName.length : 0
  if (n === 1) return { bridge: true, middle: false, neck: false }
  if (n === 2) return { bridge: true, middle: false, neck: true }
  return { bridge: true, middle: true, neck: true }
}

// ── Photos ─────────────────────────────────────────────────────────────────
export type PhotoSlotDef = { position: string; required?: boolean; hint?: string }

export const PHOTO_SLOTS: PhotoSlotDef[] = [
  { position: 'Full front' },
  { position: 'Full rear' },
  { position: 'Body front' },
  { position: 'Body rear' },
  { position: 'Headstock front' },
  { position: 'Headstock rear' },
  { position: 'Electronics cavity', required: true, hint: 'Cover plate off, wiring visible' },
  { position: 'Pickup cavity', hint: 'Optional — a pickup removed so the cavity is visible' },
]

// ── Silhouettes ────────────────────────────────────────────────────────────
// Overlay files live in /public/silhouettes and are discovered automatically — drop a file in and
// the form uses it. Naming (all lower case, .svg):
//   body-<MBF id>-<full-front|full-rear|body-front|body-rear>   e.g. body-mbf-0002-full-front.svg
//   headstock-<HST id>-<front|rear>                             e.g. headstock-hst-0002-front.svg
//   cavity-<model slug>                                         e.g. cavity-f1.svg  (HT variants fall back to their base model)
export function modelSlug(model: string): string {
  return model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function silhouetteFor(
  files: ReadonlySet<string>,
  position: string,
  ctx: { bodyFamily?: string | null; headstockStyle?: string | null; model?: string | null },
): string | undefined {
  const find = (name: string) => (files.has(name) ? `/silhouettes/${name}` : undefined)
  const viewByPosition: Record<string, string> = {
    'Full front': 'full-front', 'Full rear': 'full-rear', 'Body front': 'body-front', 'Body rear': 'body-rear',
  }
  if (position.startsWith('Headstock')) {
    if (!ctx.headstockStyle) return undefined
    return find(`headstock-${ctx.headstockStyle.toLowerCase()}-${position.endsWith('front') ? 'front' : 'rear'}.svg`)
  }
  if (position === 'Electronics cavity') {
    if (!ctx.model) return undefined
    return find(`cavity-${modelSlug(ctx.model)}.svg`) ?? find(`cavity-${modelSlug(ctx.model.replace(/\s*HT$/i, ''))}.svg`)
  }
  const view = viewByPosition[position]
  if (!view || !ctx.bodyFamily) return undefined
  return find(`body-${ctx.bodyFamily.toLowerCase()}-${view}.svg`)
}
