-- Migration 2: Structural column changes across all tables + ITY ref category

-- New ITY ref category (Instrument Type)
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('ITY-0001', 'ITY', 'Electric Guitar', 1, 'Six-string electric guitar'),
  ('ITY-0002', 'ITY', 'Bass Guitar',     2, 'Electric bass guitar — four or five string'),
  ('ITY-0003', 'ITY', 'Unknown',         99, 'Instrument type not confirmed');

-- guitars: column renames
ALTER TABLE public.guitars RENAME COLUMN bridge_configuration TO bridge_type;
ALTER TABLE public.guitars RENAME COLUMN left_handed TO left_handed_available;

-- guitars: type change
ALTER TABLE public.guitars ALTER COLUMN headstock_face TYPE text;

-- guitars: new columns
ALTER TABLE public.guitars ADD COLUMN IF NOT EXISTS instrument_type text;
ALTER TABLE public.guitars ADD COLUMN IF NOT EXISTS model_id uuid;
ALTER TABLE public.guitars ADD COLUMN IF NOT EXISTS neck_wood text;
ALTER TABLE public.guitars ADD COLUMN IF NOT EXISTS neck_profile text;
ALTER TABLE public.guitars ADD COLUMN IF NOT EXISTS body_construction text;
ALTER TABLE public.guitars ADD COLUMN IF NOT EXISTS body_bookmatched text;

-- model_specifications: new columns
ALTER TABLE public.model_specifications ADD COLUMN IF NOT EXISTS body_construction text;
ALTER TABLE public.model_specifications ADD COLUMN IF NOT EXISTS body_bookmatched text;

-- catalogue_models: new columns
ALTER TABLE public.catalogue_models ADD COLUMN IF NOT EXISTS body_construction text;
ALTER TABLE public.catalogue_models ADD COLUMN IF NOT EXISTS body_bookmatched text;

-- catalogue_models: convert left_handed_available from boolean to text
ALTER TABLE public.catalogue_models
  ALTER COLUMN left_handed_available TYPE text
  USING CASE
    WHEN left_handed_available = true  THEN 'Yes — Factory'
    WHEN left_handed_available = false THEN 'No'
    ELSE NULL
  END;
