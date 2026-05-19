-- Add bridge_logo (BGL ref ID) to model_gen_specs as a generational indicator.
-- BGL-0001 = Maverick Classic Script logo (Gen 1)
-- BGL-0002 = Maverick Stencil Script logo (Gen 2)

ALTER TABLE public.model_gen_specs
  ADD COLUMN IF NOT EXISTS bridge_logo text;
