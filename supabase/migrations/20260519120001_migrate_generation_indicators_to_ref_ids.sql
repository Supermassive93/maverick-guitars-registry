-- Migrate generation_indicators.generation to GEN ref IDs
-- GEN-0004 = Pre-production (already present in ref_values)
UPDATE public.generation_indicators SET generation = 'GEN-0001' WHERE generation = 'Gen 1';
UPDATE public.generation_indicators SET generation = 'GEN-0002' WHERE generation = 'Gen 2';
UPDATE public.generation_indicators SET generation = 'GEN-0003' WHERE generation = 'Gen 3';
UPDATE public.generation_indicators SET generation = 'GEN-0004' WHERE generation = 'Pre-production';
UPDATE public.generation_indicators SET generation = 'GEN-0005' WHERE generation = 'Unknown';
