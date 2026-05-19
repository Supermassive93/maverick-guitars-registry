-- Replace catalogue_models with model_gen_specs.
-- model_gen_specs is the single authoritative source for generation-specific
-- and universal override spec data, keyed by (model_id UUID, generation GEN ref ID).
-- model_specifications remains the universal baseline spec.

-- ── Trigger function ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Create model_gen_specs ───────────────────────────────────────────────────
CREATE TABLE public.model_gen_specs (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id              uuid        NOT NULL REFERENCES public.model_specifications(id) ON DELETE CASCADE,
  generation            text        NOT NULL,   -- GEN ref ID (GEN-0001 … GEN-0005)

  -- Availability
  available_colours     text[],                 -- array of COL/CSC ref IDs
  original_rrp          integer,
  left_handed_rrp       integer,

  -- Body
  body_shape_analogue   text,                   -- BSA ref ID
  body_wood             text,                   -- BWD ref ID
  body_construction     text,                   -- BCN ref ID

  -- Pickups & electronics
  pickup_configuration  text,                   -- PCG ref ID
  switch_type           text,                   -- SWT ref ID
  switch_knob           text,                   -- SKN ref ID
  potentiometers        text,                   -- POT ref ID
  pickup_surrounds      text,                   -- PSR ref ID
  pickup_colours        text,                   -- PKC ref ID

  -- Hardware
  bridge_type           text,                   -- BRG ref ID
  hardware_colour       text,                   -- HWC ref ID
  tuner_style           text,                   -- TNR ref ID

  -- Neck
  neck_construction     text,                   -- NCK ref ID
  neck_wood             text,                   -- NWD ref ID
  neck_profile          text,                   -- NPR ref ID
  fretboard_wood        text,                   -- FWD ref ID
  fret_count            text,                   -- FRT ref ID
  scale_length          text,                   -- SCL ref ID
  neck_binding          text,                   -- NKB ref ID
  skunk_stripe          text,                   -- SKS ref ID
  nut_type              text,                   -- NUT ref ID

  -- Headstock
  headstock_style       text,                   -- HST ref ID
  headstock_face        text,                   -- HDF ref ID
  headstock_logo        text,                   -- HGL ref ID

  -- Other
  left_handed_available text,                   -- LHA ref ID

  -- Metadata
  specification_source  text,                   -- SPC ref ID
  notes                 text,

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  UNIQUE (model_id, generation)
);

CREATE TRIGGER model_gen_specs_updated_at
  BEFORE UPDATE ON public.model_gen_specs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Extend model_specifications with missing spec columns ────────────────────
-- These were only on guitars/catalogue_models before; now universal spec can
-- record them directly.
ALTER TABLE public.model_specifications
  ADD COLUMN IF NOT EXISTS hardware_colour     text,   -- HWC ref ID
  ADD COLUMN IF NOT EXISTS headstock_style     text,   -- HST ref ID
  ADD COLUMN IF NOT EXISTS headstock_face      text,   -- HDF ref ID
  ADD COLUMN IF NOT EXISTS headstock_logo      text,   -- HGL ref ID
  ADD COLUMN IF NOT EXISTS neck_binding        text,   -- NKB ref ID
  ADD COLUMN IF NOT EXISTS skunk_stripe        text,   -- SKS ref ID
  ADD COLUMN IF NOT EXISTS switch_knob         text,   -- SKN ref ID
  ADD COLUMN IF NOT EXISTS pickup_surrounds    text,   -- PSR ref ID
  ADD COLUMN IF NOT EXISTS pickup_colours      text,   -- PKC ref ID
  ADD COLUMN IF NOT EXISTS nut_type            text,   -- NUT ref ID
  ADD COLUMN IF NOT EXISTS tuner_style         text;   -- TNR ref ID

-- ── Migrate catalogue_models → model_gen_specs ───────────────────────────────
-- CYR-0001 (2001 Brochure) → GEN-0002
INSERT INTO public.model_gen_specs (
  model_id, generation, available_colours, original_rrp, left_handed_rrp,
  body_shape_analogue, body_wood, body_construction,
  pickup_configuration, switch_type, potentiometers, pickup_surrounds, pickup_colours,
  bridge_type, hardware_colour,
  neck_construction, neck_wood, neck_profile, fretboard_wood, fret_count, scale_length, nut_type,
  headstock_style, headstock_face, headstock_logo,
  left_handed_available, specification_source, notes
)
SELECT
  model_id, 'GEN-0002',
  available_colours, original_rrp, left_handed_rrp,
  body_shape_analogue, body_wood, body_construction,
  pickup_configuration, switch_type, potentiometers, pickup_surrounds, pickup_colour,
  bridge_type, hardware_colour,
  neck_construction, neck_wood, neck_profile, fretboard_wood, fret_count, scale_length, nut_type,
  headstock_style, headstock_face, headstock_logo,
  left_handed_available, specification_source, notes
FROM public.catalogue_models
WHERE catalogue_year = 'CYR-0001' AND model_id IS NOT NULL
ON CONFLICT (model_id, generation) DO NOTHING;

-- CYR-0002 (2002 Catalogue) → GEN-0003
INSERT INTO public.model_gen_specs (
  model_id, generation, available_colours, original_rrp, left_handed_rrp,
  body_shape_analogue, body_wood, body_construction,
  pickup_configuration, switch_type, potentiometers, pickup_surrounds, pickup_colours,
  bridge_type, hardware_colour,
  neck_construction, neck_wood, neck_profile, fretboard_wood, fret_count, scale_length, nut_type,
  headstock_style, headstock_face, headstock_logo,
  left_handed_available, specification_source, notes
)
SELECT
  model_id, 'GEN-0003',
  available_colours, original_rrp, left_handed_rrp,
  body_shape_analogue, body_wood, body_construction,
  pickup_configuration, switch_type, potentiometers, pickup_surrounds, pickup_colour,
  bridge_type, hardware_colour,
  neck_construction, neck_wood, neck_profile, fretboard_wood, fret_count, scale_length, nut_type,
  headstock_style, headstock_face, headstock_logo,
  left_handed_available, specification_source, notes
FROM public.catalogue_models
WHERE catalogue_year = 'CYR-0002' AND model_id IS NOT NULL
ON CONFLICT (model_id, generation) DO NOTHING;

-- CYR-0003 (Both 2001 & 2002) → create a row for each gen
INSERT INTO public.model_gen_specs (
  model_id, generation, available_colours, original_rrp, left_handed_rrp,
  body_shape_analogue, body_wood, body_construction,
  pickup_configuration, switch_type, potentiometers, pickup_surrounds, pickup_colours,
  bridge_type, hardware_colour,
  neck_construction, neck_wood, neck_profile, fretboard_wood, fret_count, scale_length, nut_type,
  headstock_style, headstock_face, headstock_logo,
  left_handed_available, specification_source, notes
)
SELECT
  cm.model_id, g.gen,
  cm.available_colours, cm.original_rrp, cm.left_handed_rrp,
  cm.body_shape_analogue, cm.body_wood, cm.body_construction,
  cm.pickup_configuration, cm.switch_type, cm.potentiometers, cm.pickup_surrounds, cm.pickup_colour,
  cm.bridge_type, cm.hardware_colour,
  cm.neck_construction, cm.neck_wood, cm.neck_profile, cm.fretboard_wood, cm.fret_count, cm.scale_length, cm.nut_type,
  cm.headstock_style, cm.headstock_face, cm.headstock_logo,
  cm.left_handed_available, cm.specification_source, cm.notes
FROM public.catalogue_models cm
CROSS JOIN (VALUES ('GEN-0002'), ('GEN-0003')) AS g(gen)
WHERE cm.catalogue_year = 'CYR-0003' AND cm.model_id IS NOT NULL
ON CONFLICT (model_id, generation) DO NOTHING;

-- ── Drop catalogue_models ────────────────────────────────────────────────────
DROP TABLE public.catalogue_models;
