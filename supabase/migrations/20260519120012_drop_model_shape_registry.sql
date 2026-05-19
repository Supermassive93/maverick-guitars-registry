-- Copy the one unique value (JR4 headstock) into model_specifications before dropping
UPDATE public.model_specifications
SET headstock_style = 'HST-0001'
WHERE model = 'JR4' AND headstock_style IS NULL;

-- model_shape_registry is redundant — model_specifications is the authoritative source
DROP TABLE public.model_shape_registry;
