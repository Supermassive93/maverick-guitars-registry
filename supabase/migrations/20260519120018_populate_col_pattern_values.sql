-- Assign pattern values to all COL ref_values.
-- TBS, FB, NT already set in migration 120017; remaining entries assigned here.
-- Only TRL and DG are confirmed Gloss Solid; all other non-burst/grain colours are Gloss Metallic.

UPDATE public.ref_values
SET metadata = metadata || '{"pattern": "Gloss Metallic"}'::jsonb
WHERE id IN ('COL-0001','COL-0002','COL-0003','COL-0004','COL-0005','COL-0006',
             'COL-0009','COL-0012','COL-0018','COL-0021','COL-0022','COL-0023');

UPDATE public.ref_values
SET metadata = metadata || '{"pattern": "Gloss Solid"}'::jsonb
WHERE id IN ('COL-0007','COL-0008');
