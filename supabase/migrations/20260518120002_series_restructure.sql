-- Migration 3: Series restructure — 12 old series collapsed to 4 named series + Unknown
-- CHECK constraints dropped first to avoid violations during UPDATE

ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_series_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_series_check;

-- model_specifications: assign new series
UPDATE public.model_specifications SET series = 'Evolution'
  WHERE model IN ('F1', 'F2', 'F3', 'F4', 'SF-1', 'X1', 'X-Treme', 'Matrix');

UPDATE public.model_specifications SET series = 'Century'
  WHERE model IN ('Chaos 1', 'Chaos 2', 'Species 1', 'Species 2', 'Species 3', 'Species 7 String');

UPDATE public.model_specifications SET series = 'D-Tox'
  WHERE model IN ('XD-Tox', 'FD-Tox');

UPDATE public.model_specifications SET series = 'Nemesis'
  WHERE model IN ('B1', 'Z-47', 'S4', 'S5');

UPDATE public.model_specifications SET series = 'Unknown'
  WHERE model IN ('F1HT', 'G1', 'G2', 'JR4');

-- catalogue_models: assign new series
UPDATE public.catalogue_models SET series = 'Evolution'
  WHERE model IN ('F1', 'F2', 'F3', 'F4', 'SF-1', 'X1', 'X-Treme', 'Matrix');

UPDATE public.catalogue_models SET series = 'Century'
  WHERE model IN ('Chaos 1', 'Chaos 2', 'Species 1', 'Species 2', 'Species 3', 'Species 7 String');

UPDATE public.catalogue_models SET series = 'D-Tox'
  WHERE model IN ('XD-Tox', 'FD-Tox');

UPDATE public.catalogue_models SET series = 'Nemesis'
  WHERE model IN ('B1', 'Z-47', 'S4', 'S5');

UPDATE public.catalogue_models SET series = 'Unknown'
  WHERE model IN ('F1HT', 'G1', 'G2', 'JR4');

-- guitars: propagate series from model_specifications via model text match
UPDATE public.guitars g
SET series = ms.series
FROM public.model_specifications ms
WHERE g.model = ms.model
  AND ms.series IS NOT NULL;
