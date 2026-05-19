-- Add PKC-0006 for models with no pickup covers
INSERT INTO public.ref_values (id, category, display_name, sort_order, is_active)
VALUES ('PKC-0006', 'PKC', 'None — No Covers', 6, true);

-- Migrate pickup_covers to PKC ref IDs
UPDATE public.catalogue_models
SET pickup_covers = CASE pickup_covers
  WHEN 'Nickel humbucker covers' THEN 'PKC-0002'
  WHEN 'None'                    THEN 'PKC-0006'
  ELSE pickup_covers
END
WHERE pickup_covers IS NOT NULL;
