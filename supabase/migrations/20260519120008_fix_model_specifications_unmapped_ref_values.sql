-- Fix unmapped headstock_style and nut_type values in model_specifications
UPDATE public.model_specifications
SET headstock_style = CASE headstock_style
  WHEN '6-aside' THEN 'HST-0001'
  WHEN '4-aside' THEN 'HST-0003'
  WHEN '3-aside' THEN 'HST-0004'
  ELSE headstock_style
END
WHERE headstock_style IN ('6-aside', '4-aside', '3-aside');

UPDATE public.model_specifications
SET nut_type = CASE nut_type
  WHEN 'Factory - Locking nut'  THEN 'NUT-0001'
  WHEN 'Factory - Standard nut' THEN 'NUT-0002'
  ELSE nut_type
END
WHERE nut_type IN ('Factory - Locking nut', 'Factory - Standard nut');
