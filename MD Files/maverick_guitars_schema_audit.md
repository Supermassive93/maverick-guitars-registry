# Schema Audit Report — Maverick Guitars Registry

13 tables found. Full inventory, all issues, and proposed ID system below.

---

## Part 1 — Table Inventory

| Table | Rows | Purpose |
|---|---|---|
| guitars | 24 | Core registry records |
| model_specifications | 24 | Canonical per-model reference data |
| catalogue_models | 19 | Per-year catalogue entries |
| profiles | 1 | User accounts and roles |
| generation_indicators | 18 | Rules for Gen 1/2/3 identification |
| pickup_configuration_map | 9 | Maps HH/HSH/etc. to pickup component types |
| model_shape_registry | 5 | Body shape and headstock per model |
| site_settings | 1 | Global feature flags |
| articles | 0 | Articles/testimonials |
| contributions | 0 | User-submitted contributions |
| source_materials | 0 | Catalogues, magazines, photos |
| generation_indicator_sources | 0 | Links indicators to source materials |
| serial_range_indicators | 0 | Serial number range data |

---

## Part 2 — Structural Issues Found

### Issue 1 — Text-based foreign key on guitars.model
`guitars.model` is a text column that FK-links to `model_specifications.model` (also text). If a model name is ever corrected (e.g., capitalisation, spacing), the FK breaks and guitar records become orphaned. Fix: guitars should link via `model_specifications.id` (UUID).

### Issue 2 — catalogue_models has zero FK constraints
All fields (model, series, body_shape_analogue, etc.) are unconstrained free text. Any typo silently diverges from the rest of the schema. There is also no FK linking `catalogue_models` to `model_specifications` at all.

### Issue 3 — serial_range_indicators and generation_indicators reference model/series by free text
No FK to any reference table. Free-text drift is invisible.

### Issue 4 — Column name inconsistency: bridge_configuration vs bridge_type
The same physical concept is named `bridge_configuration` in guitars and `bridge_type` in both `model_specifications` and `catalogue_models`. Should be unified to `bridge_type` everywhere.

### Issue 5 — guitars.headstock_face is character varying, not text
Every other text field in the schema uses `text`. One stray `varchar` column.

### Issue 6 — guitars is missing neck_wood and neck_profile columns
Both fields exist in `model_specifications` and `catalogue_models` but are absent from `guitars`, meaning individual guitar records cannot document what wood the neck is made from or what profile it has.

### Issue 7 — Z-Series missing from guitars.series CHECK constraint
`model_specifications` includes Z-Series and the Z-47 model is seeded. The `guitars.series` CHECK constraint does not include Z-Series. Any Z-47 guitar submission would fail validation.

### Issue 8 — 3-aside headstock style exists in model data but not in any constraint
`model_specifications` has G1 and G2 with `headstock_style = '3-aside'`. The `guitars.headstock_style` CHECK constraint does not include `'3-aside'`. These values exist in the DB but the option is missing from the guitar field.

### Issue 9 — Body shape analogue options are inconsistent between tables

| Value | guitars | model_specs |
|---|---|---|
| Superstrat | ✓ | ✓ |
| Semi-Superstrat | ✗ | ✓ |
| Explorer-Mockingbird | ✓ | ✓ |
| Les Paul | ✓ | ✗ |
| Single Cutaway | ✓ | ✗ |
| PRS | ✓ | ✗ |
| Single Cut — LP style | ✗ | ✓ |
| Telecaster | ✗ | ✓ |
| Superbass | ✓ | ✓ |

Les Paul, Single Cutaway, and PRS in guitars appear to be legacy names for concepts that model_specifications calls Single Cut — LP style. These need to be unified.

### Issue 10 — Fretboard wood options inconsistent between tables
- guitars: `'Split — Rosewood & Maple'`
- model_specifications: `'Split — Rosewood/Maple (Matrix)'` and `'Split — Other'`

Different names for the same concept, plus a second split variant that exists in model_specs but not guitars.

### Issue 11 — left_handed_available type inconsistency
`catalogue_models.left_handed_available` is a boolean. `model_specifications.left_handed_available` is text with four options (Yes — Factory / Yes — Custom Order / No / Unknown). These represent the same field across tables with incompatible types.

### Issue 12 — catalogue_models.available_colours is an unstructured text array
No validation, no link to any colour reference. Once the colour ID system is in place, this column needs to store colour IDs instead.

### Issue 13 — model_specifications.headstock_style has no CHECK constraint
Added via migration without a constraint. Any text is accepted. `guitars.headstock_style` does have a CHECK — these should share the same validated option set.

### Issue 14 — guitars has three unconstrained free-text fields that should be enumerated
`tuner_style`, `pickup_colours`, and `headstock_face` have no CHECK constraint and no consistent values. Currently one guitar record exists with values `'Factory - Maverick/Wilkinson'`, `'Nickel Covers'`, and `'Matches body colour'` respectively. These need defined option sets.

### Issue 15 — guitars status column uses 'Pending' with capital P
Minor casing inconsistency vs. `contributions.status` which uses all-lowercase. Not blocking but worth noting.

---

## Part 3 — ID System Design

### Recommended: single ref_values table

```sql
CREATE TABLE ref_values (
  id           text PRIMARY KEY,        -- e.g. 'COL-0013'
  category     text NOT NULL,           -- e.g. 'colour'
  display_name text NOT NULL,           -- e.g. 'TR — Transparent Red'
  sort_order   integer DEFAULT 0,
  is_active    boolean DEFAULT true,
  notes        text
);
CREATE UNIQUE INDEX ref_values_category_name ON ref_values (category, display_name);
```

All option-list columns across all tables store the ID (e.g. `COL-0013`). The application resolves IDs to display names at query time via a join or a client-side lookup map. IDs never appear in the UI.

**Why single table, not 30 separate tables:** This project has ~30 categories. Separate tables would require 30 separate migrations to create, 30 API endpoints to expose, and 30 JOIN paths in queries. A single `ref_values` table with category-scoped queries is far simpler to manage and query, and category-prefix CHECK constraints (e.g. `factory_colour ~ '^COL-'`) still enforce that only colour IDs go in colour columns.

### Migration approach for each affected column

1. Drop existing CHECK constraint on the column
2. Populate `ref_values` with all values for that category
3. UPDATE the column in place: `SET col = (SELECT id FROM ref_values WHERE category = 'x' AND display_name = col)`
4. Add new CHECK constraint: `CHECK (col ~ '^PREFIX-')`
5. Column name stays the same — no rename needed in most cases (except `bridge_configuration` → `bridge_type`)

---

## Part 4 — Complete Reference Categories

The following 30 categories will be created in `ref_values`. Items marked ⚠️ need your input before finalising.

| Prefix | Category | Field(s) it covers | Notes |
|---|---|---|---|
| COL | colour | guitars.factory_colour, catalogue_models.available_colours[] | 20 values from current CHECK |
| SER | series | guitars.series, model_specifications.series, catalogue_models.series, generation_indicators.series, serial_range_indicators.series | Adds Z-Series (missing from guitars) |
| GEN | generation | guitars.generation, generation_indicators.generation, serial_range_indicators.generation | 5 values |
| FIN | finish_type | guitars.finish_type | 4 values |
| CYR | catalogue_year | guitars.catalogue_year, model_specifications.catalogue_year, catalogue_models.catalogue_year | 4 values |
| BSA | body_shape_analogue | guitars.body_shape_analogue, model_specifications.body_shape_analogue, catalogue_models.body_shape_analogue, model_shape_registry.body_shape_analogue | Unified set — see ⚠️ below |
| BWD | body_wood | guitars.body_wood, model_specifications.body_wood, catalogue_models.body_wood | 5 values |
| FWD | fretboard_wood | guitars.fretboard_wood, model_specifications.fretboard_wood, catalogue_models.fretboard_wood | Unified — see ⚠️ below |
| NWD | neck_wood | model_specifications.neck_wood, catalogue_models.neck_wood (also add to guitars) | 4 values |
| NPR | neck_profile | model_specifications.neck_profile, catalogue_models.neck_profile (also add to guitars) | 7 values |
| NCK | neck_construction | guitars.neck_construction, model_specifications.neck_construction, catalogue_models.neck_construction | 6 values |
| FRT | fret_count | guitars.fret_count, model_specifications.fret_count, catalogue_models.fret_count | 5 values |
| SCL | scale_length | guitars.scale_length, model_specifications.scale_length, catalogue_models.scale_length | 7 values (including bass) |
| PCF | pickup_configuration | guitars.pickup_configuration, model_specifications.pickup_configuration, catalogue_models.pickup_configuration, pickup_configuration_map.configuration | 9 values |
| BRG | bridge_type | guitars.bridge_configuration (rename → bridge_type), model_specifications.bridge_type, catalogue_models.bridge_type | 9 values; column rename in guitars |
| HWC | hardware_colour | guitars.hardware_colour, catalogue_models.hardware_colour | 4 values |
| SWT | switch_type | guitars.switch_type, model_specifications.switch_type, catalogue_models.switch_type | 5 values |
| POT | potentiometers | guitars.potentiometers, model_specifications.potentiometers, catalogue_models.potentiometers | 3 values |
| HST | headstock_style | guitars.headstock_style, model_specifications.headstock_style, catalogue_models.headstock_style, model_shape_registry.headstock_style | Adds 3-aside; simplifies verbose 3+2 label |
| HGL | headstock_logo | guitars.headstock_logo, catalogue_models.headstock_logo | 3 values |
| PSR | pickup_surrounds | guitars.pickup_surrounds, catalogue_models.pickup_surrounds | 5 values |
| NKB | neck_binding | guitars.neck_binding | 4 values |
| SKN | switch_knob | guitars.switch_knob | 4 values |
| SKS | skunk_stripe | guitars.skunk_stripe | 4 values |
| NUT | nut_type | guitars.nut_type, model_specifications.nut_type, catalogue_models.locking_nut | Merge locking_nut into nut_type; 4 values |
| SPC | specification_source | guitars.specification_source, model_specifications.specification_source, catalogue_models.source | Unify catalogue_models.source into this |
| SRT | source_type | guitars.source_type | 6 values |
| SLS | serial_status | guitars.serial_status | 6 values |
| LHD | left_handed | guitars.left_handed | 3 values (Yes/No/Unknown) |
| LHA | left_handed_available | model_specifications.left_handed_available, catalogue_models.left_handed_available (type fix: bool → text) | 4 values |
| HDF | headstock_face | guitars.headstock_face (fix type: varchar → text), catalogue_models.headstock_face | ⚠️ Needs defined values |
| PKC | pickup_colours | guitars.pickup_colours, catalogue_models.pickup_colour | ⚠️ Needs defined values |
| TNR | tuner_style | guitars.tuner_style | ⚠️ Needs defined values |

### Categories kept as plain CHECK constraints

These are workflow/access control states, not reference data:

| Table | Column | Reason |
|---|---|---|
| guitars | status | Workflow state (Pending/Approved/Rejected/Pre-populated) |
| profiles | role | Access control (user/admin/super_admin) |
| generation_indicators | status | Workflow state |
| generation_indicators | confidence | Internal assessment |
| serial_range_indicators | confidence | Internal assessment |
| contributions | status | Workflow state |
| source_materials | extraction_status | Workflow state |
| articles | article_type | Small fixed set, no renaming need |
| contributions | contribution_type | Small fixed set, no renaming need |
| source_materials | material_type | Small fixed set, no renaming need |

---

## Part 5 — Decisions Needed Before Proceeding

### ⚠️ Decision 1 — Body shape analogue unification
guitars uses `'Les Paul'`, `'Single Cutaway'`, and `'PRS'`. model_specifications uses `'Single Cut — LP style'`. Proposed unified set:

```
BSA-0001  Superstrat
BSA-0002  Semi-Superstrat
BSA-0003  Explorer-Mockingbird
BSA-0004  Single Cut — LP Style   ← replaces 'Les Paul', 'Single Cutaway', 'PRS'
BSA-0005  Telecaster
BSA-0006  Superbass
BSA-0007  Other
BSA-0008  Unknown
```

Do you want Les Paul, Single Cutaway, and PRS all collapsed into Single Cut — LP Style? Or should any of them be separate entries?

### ⚠️ Decision 2 — Fretboard wood unification
guitars has `'Split — Rosewood & Maple'`, model_specifications has `'Split — Rosewood/Maple (Matrix)'` and `'Split — Other'`. Proposed unified set:

```
FWD-0001  AAA Indian Rosewood
FWD-0002  Maple
FWD-0003  Ebony
FWD-0004  Split — Rosewood & Maple
FWD-0005  Split — Other
FWD-0006  Unknown
```

`'Split — Rosewood/Maple (Matrix)'` becomes FWD-0004. Agree?

### ⚠️ Decision 3 — Headstock face values
Currently free text with only one example value in the live data: `'Matches body colour'`. Proposed complete set:
- Matches body colour
- Black
- Natural (unfinished)
- Unknown

### ⚠️ Decision 4 — Pickup colours values
Currently free text. One example in live data: `'Nickel Covers'`. Full list needed:
- Black Covers
- Nickel Covers
- Cream Covers
- Unknown

### ⚠️ Decision 5 — Tuner style values
Currently free text. One example: `'Factory - Maverick/Wilkinson'`. Full list needed:
- Factory — Maverick/Wilkinson
- Aftermarket
- Unknown

### ⚠️ Decision 6 — guitars.model FK fix
Currently `guitars.model` (text) links to `model_specifications.model` (text). Propose changing `guitars.model_id` to be a UUID FK to `model_specifications.id` instead. This is the right long-term fix but is a bigger migration. Include in this task, or defer?

### ⚠️ Decision 7 — Add neck_wood and neck_profile to guitars
These columns exist in `model_specifications` and `catalogue_models` but not in `guitars`, meaning individual guitar records cannot document their neck wood or profile. Add them?

### ⚠️ Decision 8 — Headstock style label simplification
Current value: `'3+2 (3 tuners standard side, 2 opposing edge)'`. Proposed simplified label: `'3+2'`. Same ID, just a cleaner display name. Agree?

---

## Summary of What Will Change

| Area | Change |
|---|---|
| New table | ref_values (single reference table for all 33 categories) |
| Column rename | guitars.bridge_configuration → bridge_type |
| Column type fix | guitars.headstock_face varchar → text |
| New columns in guitars | neck_wood, neck_profile (pending Decision 7) |
| Constraint fixes | Z-Series added to guitars.series; 3-aside added to headstock_style |
| Body shape alignment | Unified BSA values across all tables (pending Decision 1) |
| Fretboard wood alignment | Unified FWD values across all tables (pending Decision 2) |
| catalogue_models type fix | left_handed_available bool → text |
| Data migration | All 24 existing guitar records migrated from text → IDs for all 33 categories |
| All model_specifications rows | Same migration (24 rows) |
| All catalogue_models rows | Same migration (19 rows) |
| FK from guitars.model | Pending Decision 6 |

Nothing in the existing UI breaks — the application code will need a lookup helper that resolves ref IDs to display names, but that is one shared utility function. No user ever sees a `COL-` or `BRG-` code.

---

*Awaiting answers to the 8 decisions above before any changes are made to the database.*
