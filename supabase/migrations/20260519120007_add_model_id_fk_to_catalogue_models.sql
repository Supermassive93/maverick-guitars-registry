-- Add model_id column
ALTER TABLE public.catalogue_models ADD COLUMN model_id uuid;

-- Populate from model_specifications by text match
UPDATE public.catalogue_models cm
SET model_id = ms.id
FROM public.model_specifications ms
WHERE cm.model = ms.model;

-- Abort if any row failed to match
DO $$
DECLARE unmatched integer;
BEGIN
  SELECT COUNT(*) INTO unmatched FROM public.catalogue_models WHERE model_id IS NULL;
  IF unmatched > 0 THEN
    RAISE EXCEPTION 'Aborted: % catalogue_models row(s) could not be matched to model_specifications', unmatched;
  END IF;
END $$;

-- Add FK constraint and make NOT NULL
ALTER TABLE public.catalogue_models
  ADD CONSTRAINT catalogue_models_model_id_fkey
  FOREIGN KEY (model_id) REFERENCES public.model_specifications(id);

ALTER TABLE public.catalogue_models ALTER COLUMN model_id SET NOT NULL;

-- Drop the old text column
ALTER TABLE public.catalogue_models DROP COLUMN model;
