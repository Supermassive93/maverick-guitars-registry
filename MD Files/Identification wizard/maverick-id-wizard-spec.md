# Maverick Guitars Registry — Identification Wizard Spec (v1 draft)

> **For Claude Code.** This document specifies the **identification wizard** for maverickguitars.org (Next.js + Supabase, deployed via Vercel). Build only what is in scope below. Where this spec and the existing codebase disagree on names (model names, table names), **check the codebase/database first and report the mismatch** rather than inventing new records.

Source: Alex's PowerPoint flowchart "ID_wizard_Flowchart.pptx" (14 slides), reviewed and corrected. Slide references are kept as `src:` comments so each node can be traced back.

---

## 1. Scope

### In scope
- The guided identification wizard: questions → model result → generation question → result screen with **Correct / Incorrect**.
- The "I already know my model" shortcut (select model → generation question → result screen).
- The data handed over when the owner presses **Correct**.

### Out of scope (do not build here — stub the hand-off only)
The wider submission flow sits above this wizard and will be specified separately:

1. Owner completes this wizard.
2. Result screen → **Correct** → full spec sheet for that model/generation (owner confirms specs, edits, notes modifications, enters **serial number, colour** etc., adds images, submits).
   **Incorrect** → back to the start of the wizard.
3. Submission enters a super-admin review queue: review / modify / approve / reject.
4. Approval publishes the guitar to the registry and, if it is an original/factory example, links it as a **registry-derived source** on the spec sheet.
5. Rejection emails the submitter with a reason and invites resubmission.

For this build, **Correct** calls a single hand-off function (`onWizardConfirmed(result)`) — see §7. If a spec sheet route already exists, navigate to it with the result; otherwise leave a clearly marked TODO.

---

## 2. Design principles (decided)

| Decision | Rule |
|---|---|
| **Rigid answers** | Every question offers only the tiles listed. No "Not sure" or "None of these" options (the one exception is "Can't tell" on the generation question). |
| **Stock caveat** | Every question shows this note: *"If your guitar has been modified, answer as if it were stock. Modifications are recorded later on the spec sheet."* |
| **Same ending for every model** | Every one of the 25 model results goes to the same generation question `Q_GEN_LOGO`. No model skips it. |
| **No spec-data gating** | All generations are always offered for every model. The wizard **never blocks or warns** on a model + generation combination missing from spec data. It only tags it (`in_spec_data: false`) so the registry can later supply registry-derived evidence. |
| **Navigation** | Every question has **Back** (previous question, previous answer remembered) and **Start again** (reset to the first question). |
| **Describe, don't name** | Tile labels describe what the owner can see. They never name a model (the owner doesn't know it yet). |
| **Logic as data** | The whole decision tree lives in one typed config file. UI components render whatever the config says. Adding a question or tile later should not need UI code changes. |
| **Images later** | Every tile has an image slot. Until an image exists, a placeholder card with the label is shown. |

---

## 3. ID / coding scheme

All IDs are `UPPER_SNAKE_CASE`, unique across the whole config, and stable (never reuse or rename an ID once shipped; add new ones instead).

| Prefix | Meaning | Example |
|---|---|---|
| `Q_` | Question node | `Q_PICKUPS_F` |
| `OPT_` | Answer option (tile). Format: `OPT_<QUESTION SUFFIX>_<ANSWER>` | `OPT_PICKUPS_F_HSH5` |
| `MDL_` | Model result | `MDL_SF1` |
| `GEN_` | Generation result | `GEN_1` |

Body / family suffixes used inside question IDs: `_4STR` (4-string bass), `_6STR` (6-string guitar), `_F` (F body), `_X` (X body), `_G` (G body).

Model codes must map 1:1 to the existing models in the database. Add a `model_code` column/field (or use the existing slug) — **look up the existing models table first**. If any model below has no DB match, list it in your summary instead of creating it.

---

## 4. Data model (TypeScript)

Create a single source of truth, e.g. `src/features/id-wizard/wizardConfig.ts`.

```ts
export const WIZARD_VERSION = "1.0.0";

export type QuestionId = `Q_${string}`;
export type OptionId = `OPT_${string}`;
export type ModelCode = `MDL_${string}`;
export type GenerationCode = "GEN_0_5" | "GEN_1" | "GEN_2" | "GEN_UNKNOWN";

export type Next =
  | { type: "question"; id: QuestionId }
  | { type: "model"; model: ModelCode }            // model identified → always goes to Q_GEN_LOGO
  | { type: "generation"; generation: GenerationCode }; // only used by Q_GEN_LOGO

export interface WizardOption {
  id: OptionId;
  label: string;          // shown on tile, also used as alt text
  sublabel?: string;      // optional short description under the label
  imageKey: string;       // file name stem in /public/wizard/tiles/ (default = option id)
  zoomable?: boolean;     // true for close-up tiles (logos) → tap to enlarge
  next: Next;
}

export interface WizardQuestion {
  id: QuestionId;
  src: string;            // slide reference from Alex's flowchart (traceability only)
  prompt: string;
  help?: string;          // optional extra guidance under the prompt
  showStockCaveat: boolean; // true on every question in v1
  candidates: ModelCode[] | "ALL"; // models still possible at this node (hidden; used for validation/admin debug)
  inputType: "tiles" | "model-picker";
  options: WizardOption[];
}

export interface WizardModel {
  code: ModelCode;
  displayName: string;    // must match the DB display name (verify)
  family: "bass" | "guitar";
  body: "F" | "X" | "G" | "OTHER";
}
```

`START_QUESTION = "Q_KNOW_MODEL"`.

---

## 5. Models (25 results)

> Verify each `displayName` against the database. The slides use mixed spellings (X1 / X-1, G1 / G-1, Xtreme / X-Treme, FD-tox / FD-TOX) — use the canonical DB spelling.

| Code | Display name | Family | Body | Reached via |
|---|---|---|---|---|
| `MDL_B1` | B1 Bass | bass | F | 4 tuners → F body → knobs in a straight line |
| `MDL_S4` | S4 Bass | bass | F | 4 tuners → F body → knobs staggered |
| `MDL_Z47` | Z-47 Bass | bass | X | 4 tuners → X body |
| `MDL_S5` | S-5 Bass | bass | OTHER | 5 tuners |
| `MDL_F1` | F1 | guitar | F | 6 → F → HH 3-way → standard headstock |
| `MDL_FDTOX` | FD-tox | guitar | F | 6 → F → HH 3-way → reversed headstock → one control |
| `MDL_MATRIX` | Matrix | guitar | F | 6 → F → HH 3-way → reversed → two controls → two-wood fingerboard |
| `MDL_SF1` | SF-1 | guitar | F | 6 → F → HH 3-way → reversed → two controls → single-wood fingerboard with vent markers |
| `MDL_SF3` | SF-3 | guitar | F | 6 → F → HH 5-way → Floyd Rose → Evolution rollers |
| `MDL_CHAOS1` | Chaos-1 | guitar | F | 6 → F → HH 5-way → Floyd Rose → standard pots |
| `MDL_JR4` | JR-4 | guitar | F | 6 → F → HH 5-way → Wilkinson fixed → one control |
| `MDL_F2` | F2 | guitar | F | 6 → F → HH 5-way → Wilkinson fixed → two controls |
| `MDL_SPECIES1` | Species-1 | guitar | F | 6 → F → HH 5-way → Tune-o-matic through-body |
| `MDL_F3` | F3 | guitar | F | 6 → F → HSH 5-way |
| `MDL_F4` | F4 | guitar | F | 6 → F → HSS 5-way |
| `MDL_XDTOX` | XD-tox | guitar | X | 6 → X → HH 3-way → one control |
| `MDL_XTREME` | X-Treme | guitar | X | 6 → X → HH 3-way → two controls → decorative routing |
| `MDL_X1` | X-1 | guitar | X | 6 → X → HH 3-way → two controls → no decorative routing |
| `MDL_CHAOS2` | Chaos-2 | guitar | X | 6 → X → HH 5-way → Floyd Rose |
| `MDL_CHAOS2_HT` | Chaos-2 Hardtail | guitar | X | 6 → X → HH 5-way → Wilkinson fixed |
| `MDL_SPECIES2` | Species-2 | guitar | X | 6 → X → HH 5-way → Tune-o-matic through-body |
| `MDL_G1` | G-1 | guitar | G | 6 → G → wraparound bridge → no binding |
| `MDL_G2` | G-2 | guitar | G | 6 → G → wraparound bridge → body binding |
| `MDL_SPECIES3` | Species-3 | guitar | G | 6 → G → Tune-o-matic through-body |
| `MDL_SPECIES7` | Species-7 | guitar | OTHER | 7 tuners |

Each model is reached by **exactly one** guided path (validated in §9).

---

## 6. Question nodes

Stock caveat (`showStockCaveat: true`) applies to every question below.

### 6.1 Entry

#### `Q_KNOW_MODEL` — src: slide 1, Q1
**Prompt:** Do you know which Maverick model you have?
candidates: ALL

| Option ID | Label | Next |
|---|---|---|
| `OPT_KNOW_MODEL_YES` | Yes, I know my model | `Q_SELECT_MODEL` |
| `OPT_KNOW_MODEL_NO` | No, help me identify it | `Q_TUNERS` |

#### `Q_SELECT_MODEL` — src: slide 1, "YES: select model"
**Prompt:** Select your model.
inputType: `model-picker` — a grid of all 25 models grouped into **Basses** and **Guitars** (and by body within guitars), each tile with a model image slot (`imageKey = model code`, e.g. `MDL_SF1`).
**Next:** chosen model → `Q_GEN_LOGO`.
The handover records `entry: "known"` for this path.

### 6.2 Tuner count

#### `Q_TUNERS` — src: slide 1, Q2.2
**Prompt:** Look at your headstock. How many tuners does your Maverick have?
candidates: ALL

| Option ID | Label | Next |
|---|---|---|
| `OPT_TUNERS_4` | 4 tuners | `Q_BODY_4STR` |
| `OPT_TUNERS_5` | 5 tuners | model `MDL_S5` |
| `OPT_TUNERS_6` | 6 tuners | `Q_BODY_6STR` |
| `OPT_TUNERS_7` | 7 tuners | model `MDL_SPECIES7` |

### 6.3 Basses (4-string)

#### `Q_BODY_4STR` — src: slide 1, Q3.2 (upper)
**Prompt:** Which body shape best matches your Maverick?
candidates: `MDL_B1, MDL_S4, MDL_Z47`

| Option ID | Label | Next |
|---|---|---|
| `OPT_BODY_4STR_F` | F body | `Q_KNOBS_4STR` |
| `OPT_BODY_4STR_X` | X body | model `MDL_Z47` |

#### `Q_KNOBS_4STR` — src: slide 2, Q4.1
**Prompt:** Look at the control knobs on the body. Are they in a straight line or staggered?
candidates: `MDL_B1, MDL_S4`

| Option ID | Label | Next |
|---|---|---|
| `OPT_KNOBS_4STR_STRAIGHT` | In a straight line | model `MDL_B1` |
| `OPT_KNOBS_4STR_STAGGERED` | Staggered | model `MDL_S4` |

> Fix vs slides: tile 2 was mislabelled "SF-1 Neck" and the question said 4 tiles. Confirmed by Alex: straight → B1, staggered → S4.

### 6.4 Guitars (6-string)

#### `Q_BODY_6STR` — src: slide 1, Q3.2 (lower)
**Prompt:** Which body shape best matches your Maverick?
candidates: F, X and G body guitars (all `guitar` models except `MDL_SPECIES7`)

| Option ID | Label | Next |
|---|---|---|
| `OPT_BODY_6STR_F` | F body | `Q_PICKUPS_F` |
| `OPT_BODY_6STR_X` | X body | `Q_PICKUPS_X` |
| `OPT_BODY_6STR_G` | G body | `Q_BRIDGE_G` |

### 6.5 F body branch

#### `Q_PICKUPS_F` — src: slide 3, Q4.2
**Prompt:** Look at your pickups and pickup selector. Which layout matches yours?
help: H = humbucker (wide, twin-coil), S = single coil (narrow). Count pickups from neck to bridge.
candidates: `MDL_F1, MDL_F2, MDL_F3, MDL_F4, MDL_SF1, MDL_SF3, MDL_MATRIX, MDL_CHAOS1, MDL_SPECIES1, MDL_FDTOX, MDL_JR4`

| Option ID | Label | Next |
|---|---|---|
| `OPT_PICKUPS_F_HH3` | Two humbuckers + 3-way toggle | `Q_HEADSTOCK_F` |
| `OPT_PICKUPS_F_HH5` | Two humbuckers + 5-way selector | `Q_BRIDGE_F` |
| `OPT_PICKUPS_F_HSH5` | Humbucker / single / humbucker + 5-way selector | model `MDL_F3` |
| `OPT_PICKUPS_F_HSS5` | Humbucker / single / single + 5-way selector | model `MDL_F4` |

> Fix vs slides: slide 1's 6-string candidate list was missing F4.

#### `Q_HEADSTOCK_F` — src: slide 4, Q4.3
**Prompt:** Look at your headstock. Are the tuners on the top edge (standard) or the bottom edge (reversed)?
candidates: `MDL_F1, MDL_SF1, MDL_MATRIX, MDL_FDTOX`

| Option ID | Label | Next |
|---|---|---|
| `OPT_HEADSTOCK_F_STANDARD` | Standard — 6 tuners along the top | model `MDL_F1` |
| `OPT_HEADSTOCK_F_REVERSED` | Reversed — 6 tuners along the bottom | `Q_CONTROLS_F_REV` |

#### `Q_CONTROLS_F_REV` — src: slide 4, Q5.1
**Prompt:** Look at the controls on the body. How many volume/tone controls are there?
candidates: `MDL_SF1, MDL_MATRIX, MDL_FDTOX`

| Option ID | Label | Next |
|---|---|---|
| `OPT_CONTROLS_F_REV_ONE` | One control | model `MDL_FDTOX` |
| `OPT_CONTROLS_F_REV_TWO` | Two controls (volume and tone) | `Q_FINGERBOARD_F` |

> Fix vs slides: the prompt said "how many evolution rollers" while the tiles said "pots". Wording is neutral here. **Alex to confirm terminology.**

#### `Q_FINGERBOARD_F` — src: slide 5, Q6.1
**Prompt:** Look at your fingerboard. Which matches yours?
candidates: `MDL_SF1, MDL_MATRIX`

| Option ID | Label | Next |
|---|---|---|
| `OPT_FINGERBOARD_F_TWO_WOOD` | Maple and rosewood, standard fret markers | model `MDL_MATRIX` |
| `OPT_FINGERBOARD_F_ONE_WOOD` | Single wood, Maverick vent fret markers | model `MDL_SF1` |

> Fix vs slides: the arrows were crossed (the "Matrix neck" tile led to SF-1 and vice versa). Mapping here assumes the tile names were right and the arrows wrong. **Alex to confirm.**

#### `Q_BRIDGE_F` — src: slide 6, Q5.2
**Prompt:** Look at your bridge. Which type does your Maverick have?
candidates: `MDL_F2, MDL_SF3, MDL_CHAOS1, MDL_SPECIES1, MDL_JR4`

| Option ID | Label | Next |
|---|---|---|
| `OPT_BRIDGE_F_FLOYD` | Floyd Rose tremolo | `Q_CONTROLS_F_FLOYD` |
| `OPT_BRIDGE_F_WILKINSON` | Fixed Wilkinson-style bridge | `Q_CONTROLS_F_HT` |
| `OPT_BRIDGE_F_TOM_THRU` | Tune-o-matic bridge, strings through body | model `MDL_SPECIES1` |

#### `Q_CONTROLS_F_FLOYD` — src: slide 7, Q6.3
**Prompt:** Look at the controls on the body. Are they Evolution roller controls or standard knobs?
candidates: `MDL_SF3, MDL_CHAOS1`

| Option ID | Label | Next |
|---|---|---|
| `OPT_CONTROLS_F_FLOYD_ROLLERS` | Evolution roller controls | model `MDL_SF3` |
| `OPT_CONTROLS_F_FLOYD_KNOBS` | Standard knobs | model `MDL_CHAOS1` |

#### `Q_CONTROLS_F_HT` — src: slide 8, Q6.2
**Prompt:** Look at the controls on the body. How many volume/tone controls are there?
candidates: `MDL_F2, MDL_JR4`

| Option ID | Label | Next |
|---|---|---|
| `OPT_CONTROLS_F_HT_ONE` | One control | model `MDL_JR4` |
| `OPT_CONTROLS_F_HT_TWO` | Two controls (volume and tone) | model `MDL_F2` |

### 6.6 X body branch

#### `Q_PICKUPS_X` — src: slide 9, Q4.2
**Prompt:** Look at your pickups and pickup selector. Which layout matches yours?
candidates: `MDL_X1, MDL_XTREME, MDL_CHAOS2, MDL_CHAOS2_HT, MDL_SPECIES2, MDL_XDTOX`

| Option ID | Label | Next |
|---|---|---|
| `OPT_PICKUPS_X_HH3` | Two humbuckers + 3-way toggle | `Q_CONTROLS_X` |
| `OPT_PICKUPS_X_HH5` | Two humbuckers + 5-way selector | `Q_BRIDGE_X` |

> Confirmed by Alex: 2 tiles only (the slide's "4 tiles" note was wrong).

#### `Q_CONTROLS_X` — src: slide 10, Q5.1
**Prompt:** Look at the controls on the body. How many volume/tone controls are there?
candidates: `MDL_X1, MDL_XTREME, MDL_XDTOX`

| Option ID | Label | Next |
|---|---|---|
| `OPT_CONTROLS_X_ONE` | One control | model `MDL_XDTOX` |
| `OPT_CONTROLS_X_TWO` | Two controls (volume and tone) | `Q_ROUTING_X` |

#### `Q_ROUTING_X` — src: slide 11, Q6.5
**Prompt:** Look at the front of the body. Does it have decorative routing (carved grooves or channels for looks)?
candidates: `MDL_X1, MDL_XTREME`

| Option ID | Label | Next |
|---|---|---|
| `OPT_ROUTING_X_YES` | Yes, decorative routing | model `MDL_XTREME` |
| `OPT_ROUTING_X_NO` | No decorative routing | model `MDL_X1` |

#### `Q_BRIDGE_X` — src: slide 12, Q5.2
**Prompt:** Look at your bridge. Which type does your Maverick have?
candidates: `MDL_CHAOS2, MDL_CHAOS2_HT, MDL_SPECIES2`

| Option ID | Label | Next |
|---|---|---|
| `OPT_BRIDGE_X_FLOYD` | Floyd Rose tremolo | model `MDL_CHAOS2` |
| `OPT_BRIDGE_X_WILKINSON` | Fixed Wilkinson-style bridge | model `MDL_CHAOS2_HT` |
| `OPT_BRIDGE_X_TOM_THRU` | Tune-o-matic bridge, strings through body | model `MDL_SPECIES2` |

### 6.7 G body branch

#### `Q_BRIDGE_G` — src: slide 13, Q4.3
**Prompt:** Look at your bridge. Which type does your Maverick have?
candidates: `MDL_G1, MDL_G2, MDL_SPECIES3`

| Option ID | Label | Next |
|---|---|---|
| `OPT_BRIDGE_G_WRAP` | Single wraparound (LP-style) bridge | `Q_BINDING_G` |
| `OPT_BRIDGE_G_TOM_THRU` | Tune-o-matic bridge, strings through body | model `MDL_SPECIES3` |

#### `Q_BINDING_G` — src: slide 14, Q6.3
**Prompt:** Look at the edges of the body. Is there binding (a contrasting strip running around the edge)?
candidates: `MDL_G1, MDL_G2`

| Option ID | Label | Next |
|---|---|---|
| `OPT_BINDING_G_NONE` | No body binding | model `MDL_G1` |
| `OPT_BINDING_G_BOUND` | Body binding present | model `MDL_G2` |

### 6.8 Generation (shared by every model)

#### `Q_GEN_LOGO` — src: every slide, Q2.1
**Prompt:** Look at the Maverick logo on your headstock. Which matches yours?
help: Look closely at the area next to the logo for a ™ symbol.
candidates: the single model chosen so far
All options `zoomable: true`.

| Option ID | Label | Next |
|---|---|---|
| `OPT_GEN_LOGO_NO_TM` | Logo with no trademark symbol | generation `GEN_0_5` |
| `OPT_GEN_LOGO_STYLISED_TM` | Logo with stylised ™ | generation `GEN_1` |
| `OPT_GEN_LOGO_STANDARD_TM` | Logo with standard ™ | generation `GEN_2` |
| `OPT_GEN_LOGO_CANT_TELL` | Can't tell (logo worn, refinished or missing) | generation `GEN_UNKNOWN` |

Generation display names: `GEN_0_5` → "Gen 0.5", `GEN_1` → "Gen 1", `GEN_2` → "Gen 2", `GEN_UNKNOWN` → "Generation unknown — our team will confirm during review".

The generation question is the same for **all 25 models**, including Z-47, S-5 and Species-7.

---

## 7. Result screen & hand-off

### Result screen
- Heading: **"Your Maverick is a {displayName} {generation display}"** (e.g. "Your Maverick is a SF-1 Gen 1"). Use correct article handling or drop the article if simpler.
- Model image slot (`imageKey = model code`) with placeholder.
- A short recap of the answers given (question prompt → chosen label), each with an **Edit** link that jumps back to that question. Answers after it are cleared, since the path may change.
- Buttons:
  - **Correct — continue** → `onWizardConfirmed(result)`
  - **Incorrect — start again** → reset to `Q_KNOW_MODEL`, clearing all answers.

### Hand-off payload
```ts
export interface WizardResult {
  wizardVersion: string;            // WIZARD_VERSION
  entry: "known" | "guided";        // known = picked from Q_SELECT_MODEL
  modelCode: ModelCode;
  generation: GenerationCode;
  inSpecData: boolean | null;       // null when generation is GEN_UNKNOWN
  path: { questionId: QuestionId; optionId: OptionId | ModelCode }[]; // in order answered
  completedAt: string;              // ISO timestamp
}
```

- `inSpecData`: look up whether spec data exists for this model + generation. **Tag only, never block or warn.** `false` means the guitar may later become **registry-derived** evidence for that generation once approved.
- Persist the in-progress wizard state (current question, path) in session storage so a page refresh doesn't lose progress. Wrap storage access in try/catch.
- Serial number, colour and all other specs are **not** collected here. They belong to the spec sheet step.

---

## 8. UI behaviour

- **One question per screen.** Prompt, optional help text, stock caveat note, then a tile grid.
- **Tiles:** image area (4:3) above the label (and sublabel). Tapping a tile selects it and advances immediately. Keep the selected state visible if the user comes back via Back.
- **Images:** load `/public/wizard/tiles/{imageKey}.webp`. If the file is missing (404 or not in a manifest), show a neutral placeholder card containing the label. Alt text = label. `zoomable` tiles open a larger view on tap of a zoom icon (separate from the select action).
- **Navigation bar:** **Back** (disabled on the first question) and **Start again** on every screen. Show "Step N" (paths vary in length, so don't show "N of M").
- **Stock caveat:** a small, always-visible note under the prompt (not a dismissable banner).
- **Responsive:** 2 columns on mobile, up to 4 on desktop. Fully keyboard-operable (tiles are buttons). Visible focus states.
- **Styling:** use the site's existing theme (from the 2002 catalogue theme work). Don't introduce new design tokens.
- **No dead ends:** every option has a valid `next`. Enforced by tests.

---

## 9. Validation & tests (must pass)

Write a config validator (run in unit tests and, in dev, at startup):

1. All IDs are unique. Every `next.id` points to an existing question.
2. Every question has ≥ 2 options (except `Q_SELECT_MODEL`, which lists all models).
3. Every `next.type === "model"` is followed by `Q_GEN_LOGO`, and `Q_GEN_LOGO` is the only question with `generation` nexts.
4. **Coverage:** walking every guided path from `Q_TUNERS` reaches all 25 models, **each exactly once**.
5. **Candidates consistency:** for each option, the models reachable from its `next` are a subset of the parent question's `candidates`, and each question's `candidates` equals exactly the set of models reachable below it.
6. Every model code in config maps to a DB model (integration test or seed check). Report any that don't.
7. Path tests: a table-driven test per model (25 cases) asserting the exact answer sequence from §5 produces that model, plus each of the 4 generation options producing the right `GenerationCode`.
8. Back/Start again: going back restores the previous answer. Start again empties the path.

---

## 10. Image shot list

Save as WebP, 4:3, ~800×600, in `/public/wizard/tiles/`. File name = `imageKey` (default: the option ID). Placeholders appear until a file exists.

| File (imageKey) | What to photograph |
|---|---|
| `OPT_KNOW_MODEL_YES` / `_NO` | Optional icons. Can stay as placeholders. |
| `OPT_TUNERS_4` | 4-tuner bass headstock, face on |
| `OPT_TUNERS_5` | 5-tuner headstock (S-5) |
| `OPT_TUNERS_6` | 6-tuner guitar headstock |
| `OPT_TUNERS_7` | 7-tuner headstock (Species-7) |
| `OPT_BODY_4STR_F` | Full front of an F-body bass |
| `OPT_BODY_4STR_X` | Full front of an X-body bass (Z-47) |
| `OPT_KNOBS_4STR_STRAIGHT` | Bass control area, knobs in a line (B1) |
| `OPT_KNOBS_4STR_STAGGERED` | Bass control area, staggered knobs (S4) |
| `OPT_BODY_6STR_F` / `_X` / `_G` | Full front of an F, X and G body guitar |
| `OPT_PICKUPS_F_HH3` | F body: pickups + 3-way toggle in frame |
| `OPT_PICKUPS_F_HH5` | F body: HH + 5-way selector in frame |
| `OPT_PICKUPS_F_HSH5` | F body: HSH + 5-way (F3) |
| `OPT_PICKUPS_F_HSS5` | F body: HSS + 5-way (F4) |
| `OPT_HEADSTOCK_F_STANDARD` | Headstock, tuners along the top |
| `OPT_HEADSTOCK_F_REVERSED` | Reversed headstock, tuners along the bottom |
| `OPT_CONTROLS_F_REV_ONE` / `_TWO` | Control area, one control vs two |
| `OPT_FINGERBOARD_F_TWO_WOOD` | Fingerboard close-up, maple + rosewood, standard markers |
| `OPT_FINGERBOARD_F_ONE_WOOD` | Fingerboard close-up, single wood, vent markers |
| `OPT_BRIDGE_F_FLOYD` / `_WILKINSON` / `_TOM_THRU` | Bridge close-ups on an F body |
| `OPT_CONTROLS_F_FLOYD_ROLLERS` | Evolution roller controls close-up |
| `OPT_CONTROLS_F_FLOYD_KNOBS` | Standard knobs close-up |
| `OPT_CONTROLS_F_HT_ONE` / `_TWO` | Control area, one vs two controls (JR-4 / F2) |
| `OPT_PICKUPS_X_HH3` / `_HH5` | X body pickup + switch layouts |
| `OPT_CONTROLS_X_ONE` / `_TWO` | X body control area, one vs two |
| `OPT_ROUTING_X_YES` / `_NO` | X body front, with vs without decorative routing |
| `OPT_BRIDGE_X_FLOYD` / `_WILKINSON` / `_TOM_THRU` | Bridge close-ups on an X body |
| `OPT_BRIDGE_G_WRAP` / `_TOM_THRU` | Bridge close-ups on a G body |
| `OPT_BINDING_G_NONE` / `_BOUND` | G body edge, with vs without binding |
| `OPT_GEN_LOGO_NO_TM` | Headstock logo close-up, no ™ (Gen 0.5, e.g. F1-00092) |
| `OPT_GEN_LOGO_STYLISED_TM` | Logo close-up, stylised ™ (Gen 1) |
| `OPT_GEN_LOGO_STANDARD_TM` | Logo close-up, standard ™ (Gen 2) |
| `OPT_GEN_LOGO_CANT_TELL` | Optional icon (question mark). Can stay as a placeholder. |
| `MDL_*` (25) | One hero shot per model for `Q_SELECT_MODEL` and the result screen |

An image can be shared between options by pointing several options at the same `imageKey`, but separate photos per body are better (the body shape gives context).

---

## 11. Open items for Alex (don't block the build — use the defaults shown)

1. **Fingerboard mapping** (`Q_FINGERBOARD_F`): default two-wood → Matrix, single wood with vent markers → SF-1.
2. **Control terminology** ("Evolution rollers" vs "pots" vs "controls") for `Q_CONTROLS_F_REV`, `Q_CONTROLS_F_HT`, `Q_CONTROLS_X`: default neutral wording "One control / Two controls (volume and tone)".
3. **Canonical model spellings**: default to the DB.

---

## 12. Suggested build order

1. `wizardConfig.ts` + types + validator + tests (§4–6, §9). Get coverage tests green before any UI.
2. Model code ↔ DB mapping. Report mismatches.
3. Wizard UI (question screen, tiles with placeholders, Back / Start again, session persistence).
4. Result screen + `onWizardConfirmed` hand-off (stub or wire to the existing spec sheet route).
5. Summary for Alex: what was built, any DB mismatches, any open items still on defaults.
