-- F1HT was incorrectly left as SER-0005 (Unknown) — it belongs in Evolution
UPDATE public.model_specifications SET series = 'SER-0001' WHERE model = 'F1HT';
