-- Capitalise contributions.status CHECK values to match guitars.status casing
ALTER TABLE public.contributions
  DROP CONSTRAINT IF EXISTS contributions_status_check;

ALTER TABLE public.contributions
  ADD CONSTRAINT contributions_status_check
  CHECK (status = ANY (ARRAY['Pending'::text, 'Reviewed'::text, 'Published'::text, 'Declined'::text]));

ALTER TABLE public.contributions
  ALTER COLUMN status SET DEFAULT 'Pending';
