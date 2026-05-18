-- Migration 5: Replace guitars.model text FK with guitars.model_id UUID FK

-- Step 1: Populate model_id from model_specifications by matching on model text
UPDATE public.guitars g
SET model_id = ms.id
FROM public.model_specifications ms
WHERE g.model = ms.model;

-- Step 2: Abort if any row failed to match
DO $$
DECLARE
  unmatched_count integer;
BEGIN
  SELECT COUNT(*) INTO unmatched_count
  FROM public.guitars
  WHERE model_id IS NULL;

  IF unmatched_count > 0 THEN
    RAISE EXCEPTION 'Migration 5 aborted: % guitar row(s) could not be matched to model_specifications', unmatched_count;
  END IF;
END $$;

-- Step 3: Add FK constraint
ALTER TABLE public.guitars
  ADD CONSTRAINT guitars_model_id_fkey
  FOREIGN KEY (model_id) REFERENCES public.model_specifications(id);

-- Step 4: Make model_id NOT NULL
ALTER TABLE public.guitars
  ALTER COLUMN model_id SET NOT NULL;

-- Step 5: Drop the old text model column
ALTER TABLE public.guitars
  DROP COLUMN model;
