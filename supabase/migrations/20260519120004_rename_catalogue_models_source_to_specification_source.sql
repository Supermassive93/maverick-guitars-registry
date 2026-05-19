-- Rename source → specification_source to match guitars and model_specifications
ALTER TABLE public.catalogue_models RENAME COLUMN source TO specification_source;

-- Migrate plain text values to SPC ref IDs
UPDATE public.catalogue_models SET specification_source = 'SPC-0001' WHERE specification_source = 'Catalogue Confirmed';
UPDATE public.catalogue_models SET specification_source = 'SPC-0002' WHERE specification_source = 'Multi-source Confirmed';
UPDATE public.catalogue_models SET specification_source = 'SPC-0003' WHERE specification_source = 'Owner Confirmed';
UPDATE public.catalogue_models SET specification_source = 'SPC-0004' WHERE specification_source = 'Probable';
UPDATE public.catalogue_models SET specification_source = 'SPC-0005' WHERE specification_source = 'Unverified';
