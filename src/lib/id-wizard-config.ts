// Identification wizard decision tree (draft v1). Source: MD Files/Identification wizard/maverick-id-wizard-spec.md
// Pure data — no database access. The wizard only outputs a model + generation; the spec sheet step looks those up later.

export const WIZARD_VERSION = '1.0.0'
export const START_QUESTION = 'Q_KNOW_MODEL'
export const GEN_QUESTION = 'Q_GEN_LOGO'

export type GenerationCode = 'GEN_0_5' | 'GEN_1' | 'GEN_2' | 'GEN_UNKNOWN'

export type Next =
  | { type: 'question'; id: string }
  | { type: 'model'; model: string }
  | { type: 'generation'; generation: GenerationCode }

export interface WizardOption {
  id: string
  label: string
  next: Next
  zoomable?: boolean
  glyph?: string // shown in the tile's image area instead of a picture
  image?: string // tile picture; defaults to /wizard/tiles/<option id>.webp
}

export interface WizardQuestion {
  id: string
  prompt: string
  help?: string
  inputType: 'tiles' | 'model-picker'
  options: WizardOption[]
}

export interface WizardModel {
  code: string
  displayName: string
  dbName: string // model name in model_specifications
  family: 'bass' | 'guitar'
  body: 'F' | 'X' | 'G' | 'OTHER'
  tile: string // file stem in /public/model-tiles
}

export const MODELS: WizardModel[] = [
  { code: 'MDL_B1', dbName: 'B1', displayName: 'B1 Bass', family: 'bass', body: 'F', tile: 'b1' },
  { code: 'MDL_S4', dbName: 'S4', displayName: 'S4 Bass', family: 'bass', body: 'F', tile: 's4' },
  { code: 'MDL_Z47', dbName: 'Z-47', displayName: 'Z-47 Bass', family: 'bass', body: 'X', tile: 'z-47' },
  { code: 'MDL_S5', dbName: 'S5', displayName: 'S5 Bass', family: 'bass', body: 'OTHER', tile: 's5' },
  { code: 'MDL_F1', dbName: 'F1', displayName: 'F1', family: 'guitar', body: 'F', tile: 'f1' },
  { code: 'MDL_FDTOX', dbName: 'FD-Tox', displayName: 'FD-Tox', family: 'guitar', body: 'F', tile: 'fd-tox' },
  { code: 'MDL_MATRIX', dbName: 'Matrix', displayName: 'Matrix', family: 'guitar', body: 'F', tile: 'matrix' },
  { code: 'MDL_SF1', dbName: 'SF-1', displayName: 'SF-1', family: 'guitar', body: 'F', tile: 'sf-1' },
  { code: 'MDL_SF3', dbName: 'SF-3', displayName: 'SF-3', family: 'guitar', body: 'F', tile: 'sf-3' },
  { code: 'MDL_CHAOS1', dbName: 'Chaos 1', displayName: 'Chaos 1', family: 'guitar', body: 'F', tile: 'chaos-1' },
  { code: 'MDL_JR4', dbName: 'JR4', displayName: 'JR4', family: 'guitar', body: 'F', tile: 'jr4' },
  { code: 'MDL_F2', dbName: 'F2', displayName: 'F2', family: 'guitar', body: 'F', tile: 'f2' },
  { code: 'MDL_SPECIES1', dbName: 'Species 1', displayName: 'Species 1', family: 'guitar', body: 'F', tile: 'species-1' },
  { code: 'MDL_F3', dbName: 'F3', displayName: 'F3', family: 'guitar', body: 'F', tile: 'f3' },
  { code: 'MDL_F4', dbName: 'F4', displayName: 'F4', family: 'guitar', body: 'F', tile: 'f4' },
  { code: 'MDL_XDTOX', dbName: 'XD-Tox', displayName: 'XD-Tox', family: 'guitar', body: 'X', tile: 'xd-tox' },
  { code: 'MDL_XTREME', dbName: 'X-Treme', displayName: 'X-Treme', family: 'guitar', body: 'X', tile: 'x-treme' },
  { code: 'MDL_X1', dbName: 'X1', displayName: 'X1', family: 'guitar', body: 'X', tile: 'x1' },
  { code: 'MDL_CHAOS2', dbName: 'Chaos 2', displayName: 'Chaos 2', family: 'guitar', body: 'X', tile: 'chaos-2' },
  { code: 'MDL_SPECIES2', dbName: 'Species 2', displayName: 'Species 2', family: 'guitar', body: 'X', tile: 'species-2' },
  { code: 'MDL_G1', dbName: 'G1', displayName: 'G1', family: 'guitar', body: 'G', tile: 'g1' },
  { code: 'MDL_G2', dbName: 'G2', displayName: 'G2', family: 'guitar', body: 'G', tile: 'g2' },
  { code: 'MDL_SPECIES3', dbName: 'Species 3', displayName: 'Species 3', family: 'guitar', body: 'G', tile: 'species-3' },
  { code: 'MDL_SPECIES7', dbName: 'Species 7 String', displayName: 'Species 7 String', family: 'guitar', body: 'OTHER', tile: 'species-7-string' },
]

// Generation ids in ref_values (GEN_UNKNOWN has none — left for review)
export const GENERATION_DB_ID: Record<GenerationCode, string> = {
  GEN_0_5: 'GEN-0005', GEN_1: 'GEN-0001', GEN_2: 'GEN-0002', GEN_UNKNOWN: '',
}

export const GENERATION_NAMES: Record<GenerationCode, string> = {
  GEN_0_5: 'Gen 0.5',
  GEN_1: 'Gen 1',
  GEN_2: 'Gen 2',
  GEN_UNKNOWN: 'Generation unknown — our team will confirm during review',
}

// "a" or "an" by how the name is spoken: initialisms are read letter by letter (F1 = "eff one" → an F1,
// B1 = "bee one" → a B1), whereas ordinary words follow their first sound (Matrix → a Matrix)
export function withArticle(name: string): string {
  const spokenAsLetter = !/^[A-Za-z][a-z]/.test(name) // 2nd char isn't a lowercase letter → initialism
  const vowelSound = spokenAsLetter ? 'AEFHILMNORSX'.includes(name[0].toUpperCase()) : 'AEIOU'.includes(name[0].toUpperCase())
  return `${vowelSound ? 'an' : 'a'} ${name}`
}

const Q = (id: string): Next => ({ type: 'question', id })
const M = (model: string): Next => ({ type: 'model', model })
const G = (generation: GenerationCode): Next => ({ type: 'generation', generation })
const o = (id: string, label: string, next: Next, zoomable = false): WizardOption => ({ id, label, next, zoomable })
const q = (id: string, prompt: string, options: WizardOption[], help?: string): WizardQuestion =>
  ({ id, prompt, help, inputType: 'tiles', options })

const LOOK_CONTROLS = 'Look at the controls on the body. How many volume/tone controls are there?'
const LOOK_BRIDGE = 'Look at your bridge. Which type does your Maverick have?'
const ONE = 'One control'
const TWO = 'Two controls (volume and tone)'
const FLOYD = 'Floyd Rose tremolo'
const WILK = 'Fixed Wilkinson-style bridge'
const TOM = 'Tune-o-Matic bridge, strings through the body'

export const QUESTIONS: WizardQuestion[] = [
  q('Q_KNOW_MODEL', 'Do you know which Maverick model you have?', [
    o('OPT_KNOW_MODEL_YES', 'Yes, I know my model', Q('Q_SELECT_MODEL')),
    o('OPT_KNOW_MODEL_NO', 'No, help me identify it', Q('Q_TUNERS')),
  ]),
  { id: 'Q_SELECT_MODEL', prompt: 'Select your model.', inputType: 'model-picker', options: [] }, // options = every model; next is always Q_GEN_LOGO

  q('Q_TUNERS', 'Look at your headstock. How many tuners does your Maverick have?', [
    o('OPT_TUNERS_4', '4 tuners', Q('Q_BODY_4STR')),
    o('OPT_TUNERS_5', '5 tuners', M('MDL_S5')),
    o('OPT_TUNERS_6', '6 tuners', Q('Q_BODY_6STR')),
    o('OPT_TUNERS_7', '7 tuners', M('MDL_SPECIES7')),
  ]),

  // Basses
  q('Q_BODY_4STR', 'Which body shape best matches your Maverick?', [
    o('OPT_BODY_4STR_F', 'F body', Q('Q_KNOBS_4STR')),
    o('OPT_BODY_4STR_X', 'X body', M('MDL_Z47')),
  ]),
  q('Q_KNOBS_4STR', 'Look at the control knobs on the body. Are they in a straight line or staggered?', [
    o('OPT_KNOBS_4STR_STRAIGHT', 'In a straight line', M('MDL_B1')),
    o('OPT_KNOBS_4STR_STAGGERED', 'Staggered', M('MDL_S4')),
  ]),

  // Guitars
  q('Q_BODY_6STR', 'Which body shape best matches your Maverick?', [
    o('OPT_BODY_6STR_F', 'F body', Q('Q_PICKUPS_F')),
    o('OPT_BODY_6STR_X', 'X body', Q('Q_PICKUPS_X')),
    o('OPT_BODY_6STR_G', 'G body', Q('Q_BRIDGE_G')),
  ]),

  // F body
  q('Q_PICKUPS_F', 'Look at your pickups and pickup selector. Which layout matches yours?', [
    o('OPT_PICKUPS_F_HH3', 'Two humbuckers + 3-way toggle', Q('Q_HEADSTOCK_F')),
    o('OPT_PICKUPS_F_HH5', 'Two humbuckers + 5-way selector', Q('Q_BRIDGE_F')),
    o('OPT_PICKUPS_F_HSH5', 'Humbucker / single / humbucker + 5-way selector', M('MDL_F3')),
    o('OPT_PICKUPS_F_HSS5', 'Humbucker / single / single + 5-way selector', M('MDL_F4')),
  ], 'H = humbucker (wide, twin-coil), S = single coil (narrow). Count pickups from neck to bridge.'),
  q('Q_HEADSTOCK_F', 'Look at your headstock. Are the tuners on the top edge (standard) or the bottom edge (reversed)?', [
    o('OPT_HEADSTOCK_F_STANDARD', 'Standard — 6 tuners along the top', M('MDL_F1')),
    o('OPT_HEADSTOCK_F_REVERSED', 'Reversed — 6 tuners along the bottom', Q('Q_CONTROLS_F_REV')),
  ]),
  q('Q_CONTROLS_F_REV', LOOK_CONTROLS, [
    o('OPT_CONTROLS_F_REV_ONE', ONE, M('MDL_FDTOX')),
    o('OPT_CONTROLS_F_REV_TWO', TWO, Q('Q_FINGERBOARD_F')),
  ]),
  q('Q_FINGERBOARD_F', 'Look at your fingerboard. Which matches yours?', [
    o('OPT_FINGERBOARD_F_TWO_WOOD', 'Maple and rosewood, standard fret markers', M('MDL_MATRIX')),
    o('OPT_FINGERBOARD_F_ONE_WOOD', 'Single wood, Maverick vent fret markers', M('MDL_SF1')),
  ]),
  q('Q_BRIDGE_F', LOOK_BRIDGE, [
    o('OPT_BRIDGE_F_FLOYD', FLOYD, Q('Q_CONTROLS_F_FLOYD')),
    o('OPT_BRIDGE_F_WILKINSON', WILK, Q('Q_CONTROLS_F_HT')),
    o('OPT_BRIDGE_F_TOM_THRU', TOM, M('MDL_SPECIES1')),
  ]),
  q('Q_CONTROLS_F_FLOYD', 'Look at the controls on the body. Are they Evolution roller controls or standard knobs?', [
    o('OPT_CONTROLS_F_FLOYD_ROLLERS', 'Evolution roller controls', M('MDL_SF3')),
    o('OPT_CONTROLS_F_FLOYD_KNOBS', 'Standard knobs', M('MDL_CHAOS1')),
  ]),
  q('Q_CONTROLS_F_HT', LOOK_CONTROLS, [
    o('OPT_CONTROLS_F_HT_ONE', ONE, M('MDL_JR4')),
    o('OPT_CONTROLS_F_HT_TWO', TWO, M('MDL_F2')),
  ]),

  // X body
  q('Q_PICKUPS_X', 'Look at your pickups and pickup selector. Which layout matches yours?', [
    o('OPT_PICKUPS_X_HH3', 'Two humbuckers + 3-way toggle', Q('Q_CONTROLS_X')),
    o('OPT_PICKUPS_X_HH5', 'Two humbuckers + 5-way selector', Q('Q_BRIDGE_X')),
  ]),
  q('Q_CONTROLS_X', LOOK_CONTROLS, [
    o('OPT_CONTROLS_X_ONE', ONE, M('MDL_XDTOX')),
    o('OPT_CONTROLS_X_TWO', TWO, Q('Q_ROUTING_X')),
  ]),
  q('Q_ROUTING_X', 'Look at the front of the body. Does it have decorative routing (carved grooves or channels for decoration)?', [
    o('OPT_ROUTING_X_YES', 'Yes, decorative routing', M('MDL_XTREME')),
    o('OPT_ROUTING_X_NO', 'No decorative routing', M('MDL_X1')),
  ]),
  q('Q_BRIDGE_X', "Look at your Maverick's bridge. Does it have a through-body Tune-o-Matic style bridge?", [
    o('OPT_BRIDGE_X_TOM_THRU', 'Yes — Tune-o-Matic style bridge, strings through the body', M('MDL_SPECIES2')),
    o('OPT_BRIDGE_X_OTHER', 'No — another style (Floyd Rose or hardtail)', M('MDL_CHAOS2')),
  ]),

  // G body
  q('Q_BRIDGE_G', LOOK_BRIDGE, [
    o('OPT_BRIDGE_G_WRAP', 'Single wraparound (LP-style) bridge', Q('Q_BINDING_G')),
    o('OPT_BRIDGE_G_TOM_THRU', TOM, M('MDL_SPECIES3')),
  ]),
  q('Q_BINDING_G', 'Look at the edges of the body. Is there binding (a contrasting strip running around the edge)?', [
    o('OPT_BINDING_G_NONE', 'No body binding', M('MDL_G1')),
    o('OPT_BINDING_G_BOUND', 'Body binding present', M('MDL_G2')),
  ]),

  // Shared ending
  q('Q_GEN_LOGO', 'Look at the Maverick logo on your headstock. Which trademark matches yours?', [
    { ...o('OPT_GEN_LOGO_NO_TM', 'No trademark symbol', G('GEN_0_5'), true), image: '/wizard/tiles/OPT_GEN_LOGO_NO_TM.png' },
    { ...o('OPT_GEN_LOGO_STYLISED_TM', 'Stylised trademark symbol', G('GEN_1'), true), image: '/wizard/tiles/OPT_GEN_LOGO_STYLISED_TM.png' },
    { ...o('OPT_GEN_LOGO_STANDARD_TM', 'Standard trademark symbol', G('GEN_2'), true), image: '/wizard/tiles/OPT_GEN_LOGO_STANDARD_TM.png' },
    { ...o('OPT_GEN_LOGO_CANT_TELL', "Can't tell (logo worn, refinished or missing)", G('GEN_UNKNOWN')), glyph: '?' },
  ], 'Look closely at the area next to the logo for a small trademark symbol.'),
]

const QUESTION_MAP = new Map(QUESTIONS.map(x => [x.id, x]))
export const MODEL_MAP = new Map(MODELS.map(m => [m.code, m]))
export const getQuestion = (id: string) => QUESTION_MAP.get(id)

export type PathStep = { questionId: string; choice: string } // choice = option id, or model code on Q_SELECT_MODEL

export type WizardState =
  | { status: 'question'; question: WizardQuestion; step: number }
  | { status: 'result'; model: string; generation: GenerationCode; entry: 'known' | 'guided' }

// Replay the answers from the start to find where the owner is now
export function resolve(path: PathStep[]): WizardState {
  let qid = START_QUESTION
  let model: string | null = null
  let entry: 'known' | 'guided' = 'guided'
  for (const step of path) {
    if (step.questionId !== qid) break
    if (qid === 'Q_SELECT_MODEL') {
      model = step.choice; entry = 'known'; qid = GEN_QUESTION; continue
    }
    const opt = QUESTION_MAP.get(qid)?.options.find(x => x.id === step.choice)
    if (!opt) break
    if (opt.next.type === 'question') qid = opt.next.id
    else if (opt.next.type === 'model') { model = opt.next.model; qid = GEN_QUESTION }
    else return { status: 'result', model: model ?? '', generation: opt.next.generation, entry }
  }
  return { status: 'question', question: QUESTION_MAP.get(qid)!, step: path.length + 1 }
}

export interface WizardResult {
  wizardVersion: string
  entry: 'known' | 'guided'
  modelCode: string
  generation: GenerationCode
  path: PathStep[]
  completedAt: string
}
