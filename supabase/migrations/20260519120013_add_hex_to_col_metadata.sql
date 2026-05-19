-- Add hex field to all COL ref_values metadata.
-- Populated as null initially; hex codes will be filled in a follow-up migration
-- once values are extracted from printed catalogue material.
UPDATE public.ref_values
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"hex": null}'::jsonb
WHERE category = 'COL';
