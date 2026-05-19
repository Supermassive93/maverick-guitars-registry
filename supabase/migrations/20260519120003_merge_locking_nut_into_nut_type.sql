-- Add nut_type to catalogue_models
ALTER TABLE public.catalogue_models ADD COLUMN IF NOT EXISTS nut_type text;

-- Migrate locking_nut values to NUT ref IDs in nut_type (handle both hyphen and em dash variants)
UPDATE public.catalogue_models SET nut_type = 'NUT-0001' WHERE locking_nut IN ('Factory — Locking nut', 'Factory - Locking nut');
UPDATE public.catalogue_models SET nut_type = 'NUT-0002' WHERE locking_nut IN ('Factory — Standard nut', 'Factory - Standard nut');
UPDATE public.catalogue_models SET nut_type = 'NUT-0003' WHERE locking_nut IN ('Aftermarket');
UPDATE public.catalogue_models SET nut_type = 'NUT-0004' WHERE locking_nut IN ('Unknown');

-- Drop the old locking_nut column
ALTER TABLE public.catalogue_models DROP COLUMN locking_nut;
