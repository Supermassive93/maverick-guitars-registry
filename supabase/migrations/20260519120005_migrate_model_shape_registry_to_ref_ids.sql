-- Migrate body_shape_analogue to BSA ref IDs
UPDATE public.model_shape_registry SET body_shape_analogue = 'BSA-0001' WHERE body_shape_analogue IN ('Superstrat');
UPDATE public.model_shape_registry SET body_shape_analogue = 'BSA-0002' WHERE body_shape_analogue IN ('Semi-Superstrat');
UPDATE public.model_shape_registry SET body_shape_analogue = 'BSA-0003' WHERE body_shape_analogue IN ('Explorer-Mockingbird');
UPDATE public.model_shape_registry SET body_shape_analogue = 'BSA-0004' WHERE body_shape_analogue IN ('Single Cut — LP Style', 'Single Cut - LP Style', 'Single Cut — LP style', 'Single Cut - LP style');

-- Migrate headstock_style to HST ref IDs
-- Species 3: '3-aside' confirmed as 3+3 layout → HST-0004
UPDATE public.model_shape_registry SET headstock_style = 'HST-0001' WHERE headstock_style IN ('6-aside');
UPDATE public.model_shape_registry SET headstock_style = 'HST-0003' WHERE headstock_style IN ('4-aside');
UPDATE public.model_shape_registry SET headstock_style = 'HST-0004' WHERE headstock_style IN ('3+3-aside', '3-aside');

-- Set headstock_style for JR4 and F1HT (were NULL, confirmed 6-aside)
UPDATE public.model_shape_registry SET headstock_style = 'HST-0001' WHERE model IN ('JR4', 'F1HT');
