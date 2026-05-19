-- Add pattern field to all COL ref_values metadata.
-- Only TBS, FB, and NT carry non-null values; all others default to null.

UPDATE public.ref_values
SET metadata = metadata || '{"pattern": null, "pattern_description": null}'::jsonb
WHERE category = 'COL';

UPDATE public.ref_values
SET metadata = metadata || '{
  "pattern":             "Burst",
  "pattern_description": "Sunburst — dark outer edge transitioning to amber-cream centre"
}'::jsonb
WHERE id = 'COL-0013';

UPDATE public.ref_values
SET metadata = metadata || '{
  "pattern":             "Burst",
  "pattern_description": "Fireburst — red-orange outer edge transitioning to warm yellow centre"
}'::jsonb
WHERE id = 'COL-0020';

UPDATE public.ref_values
SET metadata = metadata || '{
  "pattern":             "Natural Grain",
  "pattern_description": "Unfinished natural wood — grain and figure vary between individual instruments"
}'::jsonb
WHERE id = 'COL-0019';
