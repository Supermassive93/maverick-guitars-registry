-- Add parent_model_id for HT variant relationships
ALTER TABLE public.model_specifications
ADD COLUMN parent_model_id uuid REFERENCES public.model_specifications(id);

-- Link existing F1HT to its parent F1
UPDATE public.model_specifications
SET parent_model_id = (SELECT id FROM public.model_specifications WHERE model = 'F1')
WHERE model = 'F1HT';

-- Insert the six new HT variants, inheriting series from parent and overriding bridge only
INSERT INTO public.model_specifications (model, series, parent_model_id, bridge_type, specification_source)
SELECT 'XD-Tox HT', series, id, 'BRG-0003', 'SPC-0001' FROM public.model_specifications WHERE model = 'XD-Tox';

INSERT INTO public.model_specifications (model, series, parent_model_id, bridge_type, specification_source)
SELECT 'FD-Tox HT', series, id, 'BRG-0003', 'SPC-0001' FROM public.model_specifications WHERE model = 'FD-Tox';

INSERT INTO public.model_specifications (model, series, parent_model_id, bridge_type, specification_source)
SELECT 'Matrix HT', series, id, 'BRG-0003', 'SPC-0001' FROM public.model_specifications WHERE model = 'Matrix';

INSERT INTO public.model_specifications (model, series, parent_model_id, bridge_type, specification_source)
SELECT 'Chaos 1 HT', series, id, 'BRG-0003', 'SPC-0001' FROM public.model_specifications WHERE model = 'Chaos 1';

INSERT INTO public.model_specifications (model, series, parent_model_id, bridge_type, specification_source)
SELECT 'Chaos 2 HT', series, id, 'BRG-0003', 'SPC-0001' FROM public.model_specifications WHERE model = 'Chaos 2';

INSERT INTO public.model_specifications (model, series, parent_model_id, bridge_type, specification_source)
SELECT 'X-Treme HT', series, id, 'BRG-0003', 'SPC-0001' FROM public.model_specifications WHERE model = 'X-Treme';
