-- Migration 4: Migrate all enum text values to ref IDs; drop remaining CHECK constraints
-- Handles both em dash (—) and single hyphen (-) variants found in existing data

-- ── Drop remaining CHECK constraints ────────────────────────────────────────

ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_body_shape_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_body_wood_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_bridge_type_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_catalogue_year_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_factory_colour_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_finish_type_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_fret_count_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_fretboard_wood_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_generation_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_hardware_colour_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_headstock_face_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_headstock_logo_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_headstock_style_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_left_handed_available_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_neck_binding_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_neck_construction_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_nut_type_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_pickup_colour_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_pickup_configuration_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_pickup_surrounds_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_potentiometers_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_scale_length_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_series_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_skunk_stripe_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_strap_knobs_check;
ALTER TABLE public.guitars DROP CONSTRAINT IF EXISTS guitars_switching_check;

ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_body_shape_check;
ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_body_wood_check;
ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_bridge_type_check;
ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_catalogue_year_check;
ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_fret_count_check;
ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_fretboard_wood_check;
ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_generation_check;
ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_hardware_colour_check;
ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_headstock_face_check;
ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_headstock_logo_check;
ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_headstock_style_check;
ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_left_handed_available_check;
ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_neck_binding_check;
ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_neck_construction_check;
ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_nut_type_check;
ALTER TABLE public.model_specifications DROP CONSTRAINT IF EXISTS model_specifications_pickup_configuration_check;

-- ── Move free-text notes out of enum columns (catalogue_models) ──────────────

-- neck_profile has a non-enum descriptive value on one row
UPDATE public.catalogue_models
SET notes = CASE WHEN notes IS NULL OR notes = '' THEN '' ELSE notes || E'\n' END
            || '[Neck profile note] ' || neck_profile,
    neck_profile = NULL
WHERE neck_profile = 'Wider than S4 to accommodate 5th string';

-- pickup_configuration has non-enum descriptive values on two rows
UPDATE public.catalogue_models
SET notes = CASE WHEN notes IS NULL OR notes = '' THEN '' ELSE notes || E'\n' END
            || '[Pickup configuration note] ' || pickup_configuration,
    pickup_configuration = NULL
WHERE pickup_configuration IN (
  'HH (or H — bridge only on some units)',
  'HH (confirmed) or H (some units ship bridge-only)'
);

-- headstock_logo has a non-enum value on one row
UPDATE public.catalogue_models
SET notes = CASE WHEN notes IS NULL OR notes = '' THEN '' ELSE notes || E'\n' END
            || '[Headstock logo note] ' || headstock_logo,
    headstock_logo = NULL
WHERE headstock_logo NOT IN (
  'Maverick Script Logo — Lacquer-encapsulated foil decal',
  'Maverick Script Logo - Lacquer-encapsulated foil decal',
  'Maverick Script Logo — Cream silkscreen',
  'Maverick Script Logo - Cream silkscreen'
) AND headstock_logo IS NOT NULL AND headstock_logo != '';

-- ── guitars table ────────────────────────────────────────────────────────────

UPDATE public.guitars SET series = 'SER-0001' WHERE series = 'Evolution';
UPDATE public.guitars SET series = 'SER-0002' WHERE series = 'Century';
UPDATE public.guitars SET series = 'SER-0003' WHERE series = 'D-Tox';
UPDATE public.guitars SET series = 'SER-0004' WHERE series = 'Nemesis';
UPDATE public.guitars SET series = 'SER-0005' WHERE series IN ('Unknown', 'Other');

UPDATE public.guitars SET generation = 'GEN-0001' WHERE generation = 'Gen 1';
UPDATE public.guitars SET generation = 'GEN-0002' WHERE generation = 'Gen 2';
UPDATE public.guitars SET generation = 'GEN-0003' WHERE generation = 'Gen 3';
UPDATE public.guitars SET generation = 'GEN-0004' WHERE generation = 'Gen 4';
UPDATE public.guitars SET generation = 'GEN-0005' WHERE generation = 'Unknown';

UPDATE public.guitars SET finish_type = 'FIN-0001' WHERE finish_type IN ('Factory Finish');
UPDATE public.guitars SET finish_type = 'FIN-0002' WHERE finish_type IN ('Custom Shop Finish');
UPDATE public.guitars SET finish_type = 'FIN-0003' WHERE finish_type IN ('Refinished');
UPDATE public.guitars SET finish_type = 'FIN-0004' WHERE finish_type IN ('Relic');
UPDATE public.guitars SET finish_type = 'FIN-0005' WHERE finish_type IN ('Unknown');

UPDATE public.guitars SET body_shape = 'BSA-0001' WHERE body_shape IN ('Superstrat');
UPDATE public.guitars SET body_shape = 'BSA-0002' WHERE body_shape IN ('Offset Double Cut');
UPDATE public.guitars SET body_shape = 'BSA-0003' WHERE body_shape IN ('Single Cut — LP Style', 'Single Cut - LP Style', 'Single Cut — LP style', 'Single Cut - LP style');
UPDATE public.guitars SET body_shape = 'BSA-0005' WHERE body_shape IN ('Double Cut — PRS Style', 'Double Cut - PRS Style');
UPDATE public.guitars SET body_shape = 'BSA-0006' WHERE body_shape IN ('Extended Range');
UPDATE public.guitars SET body_shape = 'BSA-0007' WHERE body_shape IN ('Stratocaster');
UPDATE public.guitars SET body_shape = 'BSA-0008' WHERE body_shape IN ('Jazz Bass');
UPDATE public.guitars SET body_shape = 'BSA-0009' WHERE body_shape IN ('Precision Bass');
UPDATE public.guitars SET body_shape = 'BSA-0010' WHERE body_shape IN ('Unknown');

UPDATE public.guitars SET body_wood = 'BWD-0001' WHERE body_wood IN ('Canadian Basswood', 'Basswood');
UPDATE public.guitars SET body_wood = 'BWD-0002' WHERE body_wood IN ('American Alder', 'Alder');
UPDATE public.guitars SET body_wood = 'BWD-0003' WHERE body_wood IN ('American Swamp Ash', 'Swamp Ash');
UPDATE public.guitars SET body_wood = 'BWD-0004' WHERE body_wood IN ('Mahogany');
UPDATE public.guitars SET body_wood = 'BWD-0005' WHERE body_wood IN ('Unknown');

UPDATE public.guitars SET fretboard_wood = 'FWD-0001' WHERE fretboard_wood IN ('AAA Indian Rosewood', 'Indian Rosewood', 'Rosewood');
UPDATE public.guitars SET fretboard_wood = 'FWD-0002' WHERE fretboard_wood IN ('AAA Grade Canadian Maple', 'Canadian Maple', 'Maple');
UPDATE public.guitars SET fretboard_wood = 'FWD-0003' WHERE fretboard_wood IN ('Ebony');
UPDATE public.guitars SET fretboard_wood = 'FWD-0004' WHERE fretboard_wood IN ('Matrix — Rosewood & Maple', 'Matrix - Rosewood & Maple');
UPDATE public.guitars SET fretboard_wood = 'FWD-0006' WHERE fretboard_wood IN ('Unknown');

UPDATE public.guitars SET neck_construction = 'NCK-0001' WHERE neck_construction IN ('Factory — Bolt-on 2-piece scarf joint', 'Factory - Bolt-on 2-piece scarf joint');
UPDATE public.guitars SET neck_construction = 'NCK-0002' WHERE neck_construction IN ('Factory — Set neck', 'Factory - Set neck');
UPDATE public.guitars SET neck_construction = 'NCK-0003' WHERE neck_construction IN ('Factory — Neck-through', 'Factory - Neck-through');
UPDATE public.guitars SET neck_construction = 'NCK-0004' WHERE neck_construction IN ('Aftermarket Replacement');
UPDATE public.guitars SET neck_construction = 'NCK-0005' WHERE neck_construction IN ('Modified');
UPDATE public.guitars SET neck_construction = 'NCK-0006' WHERE neck_construction IN ('Unknown');

UPDATE public.guitars SET fret_count = 'FRT-0001' WHERE fret_count IN ('19');
UPDATE public.guitars SET fret_count = 'FRT-0002' WHERE fret_count IN ('21');
UPDATE public.guitars SET fret_count = 'FRT-0003' WHERE fret_count IN ('22');
UPDATE public.guitars SET fret_count = 'FRT-0004' WHERE fret_count IN ('24');
UPDATE public.guitars SET fret_count = 'FRT-0005' WHERE fret_count IN ('Unknown');

UPDATE public.guitars SET scale_length = 'SCL-0001' WHERE scale_length IN ('25" (Maverick / PRS Core)', '25"');
UPDATE public.guitars SET scale_length = 'SCL-0002' WHERE scale_length IN ('25.5" (Fender)', '25.5"');
UPDATE public.guitars SET scale_length = 'SCL-0003' WHERE scale_length IN ('24.75" (Gibson)', '24.75"');
UPDATE public.guitars SET scale_length = 'SCL-0004' WHERE scale_length IN ('24" (Warmoth Short Scale)', '24"');
UPDATE public.guitars SET scale_length = 'SCL-0005' WHERE scale_length IN ('30" (Bass — Short Scale)', '30"');
UPDATE public.guitars SET scale_length = 'SCL-0006' WHERE scale_length IN ('34" (Bass — Standard)', '34"');
UPDATE public.guitars SET scale_length = 'SCL-0007' WHERE scale_length IN ('Unknown');

UPDATE public.guitars SET pickup_configuration = 'PCG-0001' WHERE pickup_configuration IN ('HH');
UPDATE public.guitars SET pickup_configuration = 'PCG-0002' WHERE pickup_configuration IN ('HSH');
UPDATE public.guitars SET pickup_configuration = 'PCG-0003' WHERE pickup_configuration IN ('HSS');
UPDATE public.guitars SET pickup_configuration = 'PCG-0004' WHERE pickup_configuration IN ('HS');
UPDATE public.guitars SET pickup_configuration = 'PCG-0005' WHERE pickup_configuration IN ('H');
UPDATE public.guitars SET pickup_configuration = 'PCG-0006' WHERE pickup_configuration IN ('SSS');
UPDATE public.guitars SET pickup_configuration = 'PCG-0007' WHERE pickup_configuration IN ('SS');
UPDATE public.guitars SET pickup_configuration = 'PCG-0008' WHERE pickup_configuration IN ('Other');
UPDATE public.guitars SET pickup_configuration = 'PCG-0009' WHERE pickup_configuration IN ('Unknown');

UPDATE public.guitars SET bridge_type = 'BRG-0001' WHERE bridge_type IN ('Maverick Floyd Rose — Licensed', 'Maverick Floyd Rose - Licensed');
UPDATE public.guitars SET bridge_type = 'BRG-0002' WHERE bridge_type IN ('Floyd Rose — Original', 'Floyd Rose - Original');
UPDATE public.guitars SET bridge_type = 'BRG-0003' WHERE bridge_type IN ('Floyd Rose — Licensed (Non-Maverick)', 'Floyd Rose - Licensed (Non-Maverick)');
UPDATE public.guitars SET bridge_type = 'BRG-0004' WHERE bridge_type IN ('Tune-o-matic');
UPDATE public.guitars SET bridge_type = 'BRG-0005' WHERE bridge_type IN ('Hardtail');
UPDATE public.guitars SET bridge_type = 'BRG-0006' WHERE bridge_type IN ('Vintage Tremolo');
UPDATE public.guitars SET bridge_type = 'BRG-0007' WHERE bridge_type IN ('Maverick/Wilkinson Wraparound', 'Wraparound');
UPDATE public.guitars SET bridge_type = 'BRG-0008' WHERE bridge_type IN ('Bass Bridge');
UPDATE public.guitars SET bridge_type = 'BRG-0009' WHERE bridge_type IN ('Unknown');

UPDATE public.guitars SET hardware_colour = 'HWC-0001' WHERE hardware_colour IN ('Gold');
UPDATE public.guitars SET hardware_colour = 'HWC-0002' WHERE hardware_colour IN ('Black');
UPDATE public.guitars SET hardware_colour = 'HWC-0003' WHERE hardware_colour IN ('Nickel');
UPDATE public.guitars SET hardware_colour = 'HWC-0004' WHERE hardware_colour IN ('Unknown');

UPDATE public.guitars SET switching = 'SWT-0001' WHERE switching IN ('Factory 5 Way Blade Switch', 'Factory 5-Way Blade Switch');
UPDATE public.guitars SET switching = 'SWT-0002' WHERE switching IN ('Factory 3 Way Toggle Switch', 'Factory 3-Way Toggle Switch');
UPDATE public.guitars SET switching = 'SWT-0003' WHERE switching IN ('Factory 3 Way Blade Switch', 'Factory 3-Way Blade Switch');
UPDATE public.guitars SET switching = 'SWT-0004' WHERE switching IN ('Aftermarket');
UPDATE public.guitars SET switching = 'SWT-0005' WHERE switching IN ('Unknown');

UPDATE public.guitars SET potentiometers = 'POT-0001' WHERE potentiometers IN ('Factory Patented Evolution Roller Pots');
UPDATE public.guitars SET potentiometers = 'POT-0002' WHERE potentiometers IN ('Factory Standard Pots');
UPDATE public.guitars SET potentiometers = 'POT-0003' WHERE potentiometers IN ('Aftermarket');
UPDATE public.guitars SET potentiometers = 'POT-0004' WHERE potentiometers IN ('Unknown');

UPDATE public.guitars SET headstock_logo = 'HGL-0001' WHERE headstock_logo IN ('Maverick Script Logo — Lacquer-encapsulated foil decal', 'Maverick Script Logo - Lacquer-encapsulated foil decal', 'Reflective metal inlay');
UPDATE public.guitars SET headstock_logo = 'HGL-0002' WHERE headstock_logo IN ('Maverick Script Logo — Cream silkscreen', 'Maverick Script Logo - Cream silkscreen');
UPDATE public.guitars SET headstock_logo = 'HGL-0003' WHERE headstock_logo IN ('Unknown');

UPDATE public.guitars SET headstock_style = 'HST-0001' WHERE headstock_style IN ('6-aside');
UPDATE public.guitars SET headstock_style = 'HST-0002' WHERE headstock_style IN ('6-aside reversed');
UPDATE public.guitars SET headstock_style = 'HST-0003' WHERE headstock_style IN ('4-aside');
UPDATE public.guitars SET headstock_style = 'HST-0004' WHERE headstock_style IN ('3+3-aside');
UPDATE public.guitars SET headstock_style = 'HST-0005' WHERE headstock_style IN ('3+2-aside', '3+2 (3 tuners standard side, 2 opposing edge)');
UPDATE public.guitars SET headstock_style = 'HST-0006' WHERE headstock_style IN ('Unknown');

UPDATE public.guitars SET headstock_face = 'HDF-0001' WHERE headstock_face IN ('Matches body colour');
UPDATE public.guitars SET headstock_face = 'HDF-0002' WHERE headstock_face IN ('Black');
UPDATE public.guitars SET headstock_face = 'HDF-0003' WHERE headstock_face IN ('Natural');
UPDATE public.guitars SET headstock_face = 'HDF-0004' WHERE headstock_face IN ('Unknown');

UPDATE public.guitars SET pickup_surrounds = 'PSR-0001' WHERE pickup_surrounds IN ('Factory — No Surrounds', 'Factory - No Surrounds');
UPDATE public.guitars SET pickup_surrounds = 'PSR-0002' WHERE pickup_surrounds IN ('Factory — Black Rings', 'Factory - Black Rings');
UPDATE public.guitars SET pickup_surrounds = 'PSR-0003' WHERE pickup_surrounds IN ('Factory — Cream Rings', 'Factory - Cream Rings');
UPDATE public.guitars SET pickup_surrounds = 'PSR-0004' WHERE pickup_surrounds IN ('Aftermarket');
UPDATE public.guitars SET pickup_surrounds = 'PSR-0005' WHERE pickup_surrounds IN ('Unknown');

UPDATE public.guitars SET neck_binding = 'NKB-0001' WHERE neck_binding IN ('Factory — No Binding', 'Factory - No Binding');
UPDATE public.guitars SET neck_binding = 'NKB-0002' WHERE neck_binding IN ('Factory — Cream Binding', 'Factory - Cream Binding');
UPDATE public.guitars SET neck_binding = 'NKB-0003' WHERE neck_binding IN ('Factory — Black Binding', 'Factory - Black Binding');
UPDATE public.guitars SET neck_binding = 'NKB-0004' WHERE neck_binding IN ('Unknown');

UPDATE public.guitars SET strap_knobs = 'SKN-0001' WHERE strap_knobs IN ('Factory — Cylindrical with O-rings', 'Factory - Cylindrical with O-rings');
UPDATE public.guitars SET strap_knobs = 'SKN-0002' WHERE strap_knobs IN ('Factory — Tapered', 'Factory - Tapered');
UPDATE public.guitars SET strap_knobs = 'SKN-0003' WHERE strap_knobs IN ('Aftermarket Replacement');
UPDATE public.guitars SET strap_knobs = 'SKN-0004' WHERE strap_knobs IN ('Unknown');

UPDATE public.guitars SET skunk_stripe = 'SKS-0001' WHERE skunk_stripe IN ('Factory — Skunk stripe', 'Factory - Skunk stripe');
UPDATE public.guitars SET skunk_stripe = 'SKS-0002' WHERE skunk_stripe IN ('Factory — No skunk stripe', 'Factory - No skunk stripe');
UPDATE public.guitars SET skunk_stripe = 'SKS-0003' WHERE skunk_stripe IN ('Aftermarket');
UPDATE public.guitars SET skunk_stripe = 'SKS-0004' WHERE skunk_stripe IN ('Unknown');

UPDATE public.guitars SET nut_type = 'NUT-0001' WHERE nut_type IN ('Factory — Locking nut', 'Factory - Locking nut');
UPDATE public.guitars SET nut_type = 'NUT-0002' WHERE nut_type IN ('Factory — Standard nut', 'Factory - Standard nut');
UPDATE public.guitars SET nut_type = 'NUT-0003' WHERE nut_type IN ('Aftermarket');
UPDATE public.guitars SET nut_type = 'NUT-0004' WHERE nut_type IN ('Unknown');

UPDATE public.guitars SET pickup_colour = 'PKC-0001' WHERE pickup_colour IN ('Black Covers');
UPDATE public.guitars SET pickup_colour = 'PKC-0002' WHERE pickup_colour IN ('Nickel Covers');
UPDATE public.guitars SET pickup_colour = 'PKC-0003' WHERE pickup_colour IN ('Cream Covers');
UPDATE public.guitars SET pickup_colour = 'PKC-0004' WHERE pickup_colour IN ('Black & Cream');
UPDATE public.guitars SET pickup_colour = 'PKC-0005' WHERE pickup_colour IN ('Unknown');

UPDATE public.guitars SET left_handed_available = 'LHA-0001' WHERE left_handed_available IN ('Yes — Factory', 'Yes - Factory');
UPDATE public.guitars SET left_handed_available = 'LHA-0002' WHERE left_handed_available IN ('Yes — Custom Order', 'Yes - Custom Order');
UPDATE public.guitars SET left_handed_available = 'LHA-0003' WHERE left_handed_available IN ('No');
UPDATE public.guitars SET left_handed_available = 'LHA-0004' WHERE left_handed_available IN ('Unknown');

-- factory_colour: old colour names mapped to new IDs
UPDATE public.guitars SET factory_colour = 'COL-0001' WHERE factory_colour IN ('BK — Gloss Black', 'BK - Gloss Black');
UPDATE public.guitars SET factory_colour = 'COL-0002' WHERE factory_colour IN ('WH — Gloss White', 'WH - Gloss White');
UPDATE public.guitars SET factory_colour = 'COL-0003' WHERE factory_colour IN ('CB — Cherry Burst', 'CB - Cherry Burst');
UPDATE public.guitars SET factory_colour = 'COL-0004' WHERE factory_colour IN ('SR — Sunset Red', 'SR - Sunset Red');
UPDATE public.guitars SET factory_colour = 'COL-0005' WHERE factory_colour IN ('MB — Metallic Blue', 'MB - Metallic Blue');
UPDATE public.guitars SET factory_colour = 'COL-0006' WHERE factory_colour IN ('EB — Electric Blue', 'EB - Electric Blue');
UPDATE public.guitars SET factory_colour = 'COL-0007' WHERE factory_colour IN ('TRL — Tribal Red', 'TRL - Tribal Red');
UPDATE public.guitars SET factory_colour = 'COL-0008' WHERE factory_colour IN ('OW — Old White', 'OW - Old White');
UPDATE public.guitars SET factory_colour = 'COL-0009' WHERE factory_colour IN ('CSK — Cosmos Black', 'CSK - Cosmos Black');
UPDATE public.guitars SET factory_colour = 'COL-0012' WHERE factory_colour IN ('GM — Gunmetal', 'GM - Gunmetal');
UPDATE public.guitars SET factory_colour = 'COL-0013' WHERE factory_colour IN ('TBS — Tobacco Sunburst', 'TBS - Tobacco Sunburst', 'TR — Transparent Red', 'TR - Transparent Red');
UPDATE public.guitars SET factory_colour = 'COL-0018' WHERE factory_colour IN ('UV — Ultra Violet', 'UV - Ultra Violet');
UPDATE public.guitars SET factory_colour = 'COL-0019' WHERE factory_colour IN ('NB — Natural Basswood', 'NB - Natural Basswood');
UPDATE public.guitars SET factory_colour = 'COL-0020' WHERE factory_colour IN ('FB — Fireburst', 'FB - Fireburst');
UPDATE public.guitars SET factory_colour = 'COL-0021' WHERE factory_colour IN ('MR — Metallic Red', 'MR - Metallic Red');
UPDATE public.guitars SET factory_colour = 'COL-0022' WHERE factory_colour IN ('NA — Natural Ash', 'NA - Natural Ash');
UPDATE public.guitars SET factory_colour = 'COL-0023' WHERE factory_colour IN ('Unknown');

-- ── model_specifications table ───────────────────────────────────────────────

UPDATE public.model_specifications SET series = 'SER-0001' WHERE series = 'Evolution';
UPDATE public.model_specifications SET series = 'SER-0002' WHERE series = 'Century';
UPDATE public.model_specifications SET series = 'SER-0003' WHERE series = 'D-Tox';
UPDATE public.model_specifications SET series = 'SER-0004' WHERE series = 'Nemesis';
UPDATE public.model_specifications SET series = 'SER-0005' WHERE series IN ('Unknown', 'Other');

UPDATE public.model_specifications SET generation = 'GEN-0001' WHERE generation = 'Gen 1';
UPDATE public.model_specifications SET generation = 'GEN-0002' WHERE generation = 'Gen 2';
UPDATE public.model_specifications SET generation = 'GEN-0003' WHERE generation = 'Gen 3';
UPDATE public.model_specifications SET generation = 'GEN-0004' WHERE generation = 'Gen 4';
UPDATE public.model_specifications SET generation = 'GEN-0005' WHERE generation = 'Unknown';

UPDATE public.model_specifications SET body_shape = 'BSA-0001' WHERE body_shape IN ('Superstrat');
UPDATE public.model_specifications SET body_shape = 'BSA-0002' WHERE body_shape IN ('Offset Double Cut');
UPDATE public.model_specifications SET body_shape = 'BSA-0003' WHERE body_shape IN ('Single Cut — LP Style', 'Single Cut - LP Style', 'Single Cut — LP style', 'Single Cut - LP style');
UPDATE public.model_specifications SET body_shape = 'BSA-0005' WHERE body_shape IN ('Double Cut — PRS Style', 'Double Cut - PRS Style');
UPDATE public.model_specifications SET body_shape = 'BSA-0006' WHERE body_shape IN ('Extended Range');
UPDATE public.model_specifications SET body_shape = 'BSA-0007' WHERE body_shape IN ('Stratocaster');
UPDATE public.model_specifications SET body_shape = 'BSA-0008' WHERE body_shape IN ('Jazz Bass');
UPDATE public.model_specifications SET body_shape = 'BSA-0009' WHERE body_shape IN ('Precision Bass');
UPDATE public.model_specifications SET body_shape = 'BSA-0010' WHERE body_shape IN ('Unknown');

UPDATE public.model_specifications SET body_wood = 'BWD-0001' WHERE body_wood IN ('Canadian Basswood', 'Basswood');
UPDATE public.model_specifications SET body_wood = 'BWD-0002' WHERE body_wood IN ('American Alder', 'Alder');
UPDATE public.model_specifications SET body_wood = 'BWD-0003' WHERE body_wood IN ('American Swamp Ash', 'Swamp Ash');
UPDATE public.model_specifications SET body_wood = 'BWD-0004' WHERE body_wood IN ('Mahogany');
UPDATE public.model_specifications SET body_wood = 'BWD-0005' WHERE body_wood IN ('Unknown');

UPDATE public.model_specifications SET fretboard_wood = 'FWD-0001' WHERE fretboard_wood IN ('AAA Indian Rosewood', 'Indian Rosewood', 'Rosewood');
UPDATE public.model_specifications SET fretboard_wood = 'FWD-0002' WHERE fretboard_wood IN ('AAA Grade Canadian Maple', 'Canadian Maple', 'Maple');
UPDATE public.model_specifications SET fretboard_wood = 'FWD-0003' WHERE fretboard_wood IN ('Ebony');
UPDATE public.model_specifications SET fretboard_wood = 'FWD-0004' WHERE fretboard_wood IN ('Matrix — Rosewood & Maple', 'Matrix - Rosewood & Maple');
UPDATE public.model_specifications SET fretboard_wood = 'FWD-0006' WHERE fretboard_wood IN ('Unknown');

UPDATE public.model_specifications SET neck_construction = 'NCK-0001' WHERE neck_construction IN ('Factory — Bolt-on 2-piece scarf joint', 'Factory - Bolt-on 2-piece scarf joint');
UPDATE public.model_specifications SET neck_construction = 'NCK-0002' WHERE neck_construction IN ('Factory — Set neck', 'Factory - Set neck');
UPDATE public.model_specifications SET neck_construction = 'NCK-0003' WHERE neck_construction IN ('Factory — Neck-through', 'Factory - Neck-through');
UPDATE public.model_specifications SET neck_construction = 'NCK-0004' WHERE neck_construction IN ('Aftermarket Replacement');
UPDATE public.model_specifications SET neck_construction = 'NCK-0005' WHERE neck_construction IN ('Modified');
UPDATE public.model_specifications SET neck_construction = 'NCK-0006' WHERE neck_construction IN ('Unknown');

UPDATE public.model_specifications SET fret_count = 'FRT-0001' WHERE fret_count IN ('19');
UPDATE public.model_specifications SET fret_count = 'FRT-0002' WHERE fret_count IN ('21');
UPDATE public.model_specifications SET fret_count = 'FRT-0003' WHERE fret_count IN ('22');
UPDATE public.model_specifications SET fret_count = 'FRT-0004' WHERE fret_count IN ('24');
UPDATE public.model_specifications SET fret_count = 'FRT-0005' WHERE fret_count IN ('Unknown');

UPDATE public.model_specifications SET scale_length = 'SCL-0001' WHERE scale_length IN ('25" (Maverick / PRS Core)', '25"');
UPDATE public.model_specifications SET scale_length = 'SCL-0002' WHERE scale_length IN ('25.5" (Fender)', '25.5"');
UPDATE public.model_specifications SET scale_length = 'SCL-0003' WHERE scale_length IN ('24.75" (Gibson)', '24.75"');
UPDATE public.model_specifications SET scale_length = 'SCL-0004' WHERE scale_length IN ('24" (Warmoth Short Scale)', '24"');
UPDATE public.model_specifications SET scale_length = 'SCL-0005' WHERE scale_length IN ('30" (Bass — Short Scale)', '30"');
UPDATE public.model_specifications SET scale_length = 'SCL-0006' WHERE scale_length IN ('34" (Bass — Standard)', '34"');
UPDATE public.model_specifications SET scale_length = 'SCL-0007' WHERE scale_length IN ('Unknown');

UPDATE public.model_specifications SET pickup_configuration = 'PCG-0001' WHERE pickup_configuration IN ('HH');
UPDATE public.model_specifications SET pickup_configuration = 'PCG-0002' WHERE pickup_configuration IN ('HSH');
UPDATE public.model_specifications SET pickup_configuration = 'PCG-0003' WHERE pickup_configuration IN ('HSS');
UPDATE public.model_specifications SET pickup_configuration = 'PCG-0004' WHERE pickup_configuration IN ('HS');
UPDATE public.model_specifications SET pickup_configuration = 'PCG-0005' WHERE pickup_configuration IN ('H');
UPDATE public.model_specifications SET pickup_configuration = 'PCG-0006' WHERE pickup_configuration IN ('SSS');
UPDATE public.model_specifications SET pickup_configuration = 'PCG-0007' WHERE pickup_configuration IN ('SS');
UPDATE public.model_specifications SET pickup_configuration = 'PCG-0008' WHERE pickup_configuration IN ('Other');
UPDATE public.model_specifications SET pickup_configuration = 'PCG-0009' WHERE pickup_configuration IN ('Unknown');

UPDATE public.model_specifications SET bridge_type = 'BRG-0001' WHERE bridge_type IN ('Maverick Floyd Rose — Licensed', 'Maverick Floyd Rose - Licensed');
UPDATE public.model_specifications SET bridge_type = 'BRG-0002' WHERE bridge_type IN ('Floyd Rose — Original', 'Floyd Rose - Original');
UPDATE public.model_specifications SET bridge_type = 'BRG-0003' WHERE bridge_type IN ('Floyd Rose — Licensed (Non-Maverick)', 'Floyd Rose - Licensed (Non-Maverick)');
UPDATE public.model_specifications SET bridge_type = 'BRG-0004' WHERE bridge_type IN ('Tune-o-matic');
UPDATE public.model_specifications SET bridge_type = 'BRG-0005' WHERE bridge_type IN ('Hardtail');
UPDATE public.model_specifications SET bridge_type = 'BRG-0006' WHERE bridge_type IN ('Vintage Tremolo');
UPDATE public.model_specifications SET bridge_type = 'BRG-0007' WHERE bridge_type IN ('Maverick/Wilkinson Wraparound', 'Wraparound');
UPDATE public.model_specifications SET bridge_type = 'BRG-0008' WHERE bridge_type IN ('Bass Bridge');
UPDATE public.model_specifications SET bridge_type = 'BRG-0009' WHERE bridge_type IN ('Unknown');

UPDATE public.model_specifications SET hardware_colour = 'HWC-0001' WHERE hardware_colour IN ('Gold');
UPDATE public.model_specifications SET hardware_colour = 'HWC-0002' WHERE hardware_colour IN ('Black');
UPDATE public.model_specifications SET hardware_colour = 'HWC-0003' WHERE hardware_colour IN ('Nickel');
UPDATE public.model_specifications SET hardware_colour = 'HWC-0004' WHERE hardware_colour IN ('Unknown');

UPDATE public.model_specifications SET headstock_logo = 'HGL-0001' WHERE headstock_logo IN ('Maverick Script Logo — Lacquer-encapsulated foil decal', 'Maverick Script Logo - Lacquer-encapsulated foil decal');
UPDATE public.model_specifications SET headstock_logo = 'HGL-0002' WHERE headstock_logo IN ('Maverick Script Logo — Cream silkscreen', 'Maverick Script Logo - Cream silkscreen');
UPDATE public.model_specifications SET headstock_logo = 'HGL-0003' WHERE headstock_logo IN ('Unknown');

UPDATE public.model_specifications SET headstock_style = 'HST-0001' WHERE headstock_style IN ('6-aside');
UPDATE public.model_specifications SET headstock_style = 'HST-0002' WHERE headstock_style IN ('6-aside reversed');
UPDATE public.model_specifications SET headstock_style = 'HST-0003' WHERE headstock_style IN ('4-aside');
UPDATE public.model_specifications SET headstock_style = 'HST-0004' WHERE headstock_style IN ('3+3-aside');
UPDATE public.model_specifications SET headstock_style = 'HST-0005' WHERE headstock_style IN ('3+2-aside', '3+2 (3 tuners standard side, 2 opposing edge)');
UPDATE public.model_specifications SET headstock_style = 'HST-0006' WHERE headstock_style IN ('Unknown');

UPDATE public.model_specifications SET neck_binding = 'NKB-0001' WHERE neck_binding IN ('Factory — No Binding', 'Factory - No Binding');
UPDATE public.model_specifications SET neck_binding = 'NKB-0002' WHERE neck_binding IN ('Factory — Cream Binding', 'Factory - Cream Binding');
UPDATE public.model_specifications SET neck_binding = 'NKB-0003' WHERE neck_binding IN ('Factory — Black Binding', 'Factory - Black Binding');
UPDATE public.model_specifications SET neck_binding = 'NKB-0004' WHERE neck_binding IN ('Unknown');

UPDATE public.model_specifications SET left_handed_available = 'LHA-0001' WHERE left_handed_available IN ('Yes — Factory', 'Yes - Factory');
UPDATE public.model_specifications SET left_handed_available = 'LHA-0002' WHERE left_handed_available IN ('Yes — Custom Order', 'Yes - Custom Order');
UPDATE public.model_specifications SET left_handed_available = 'LHA-0003' WHERE left_handed_available IN ('No');
UPDATE public.model_specifications SET left_handed_available = 'LHA-0004' WHERE left_handed_available IN ('Unknown');

-- ── catalogue_models table ───────────────────────────────────────────────────

UPDATE public.catalogue_models SET series = 'SER-0001' WHERE series = 'Evolution';
UPDATE public.catalogue_models SET series = 'SER-0002' WHERE series = 'Century';
UPDATE public.catalogue_models SET series = 'SER-0003' WHERE series = 'D-Tox';
UPDATE public.catalogue_models SET series = 'SER-0004' WHERE series = 'Nemesis';
UPDATE public.catalogue_models SET series = 'SER-0005' WHERE series IN ('Unknown', 'Other');

UPDATE public.catalogue_models SET catalogue_year = 'CYR-0001' WHERE catalogue_year IN ('2001', '2001 Brochure');
UPDATE public.catalogue_models SET catalogue_year = 'CYR-0002' WHERE catalogue_year IN ('2002', '2002 Catalogue');
UPDATE public.catalogue_models SET catalogue_year = 'CYR-0003' WHERE catalogue_year IN ('Both');
UPDATE public.catalogue_models SET catalogue_year = 'CYR-0004' WHERE catalogue_year IN ('Unknown');

UPDATE public.catalogue_models SET body_shape = 'BSA-0001' WHERE body_shape IN ('Superstrat');
UPDATE public.catalogue_models SET body_shape = 'BSA-0002' WHERE body_shape IN ('Offset Double Cut');
UPDATE public.catalogue_models SET body_shape = 'BSA-0003' WHERE body_shape IN ('Single Cut — LP Style', 'Single Cut - LP Style', 'Single Cut — LP style', 'Single Cut - LP style');
UPDATE public.catalogue_models SET body_shape = 'BSA-0005' WHERE body_shape IN ('Double Cut — PRS Style', 'Double Cut - PRS Style');
UPDATE public.catalogue_models SET body_shape = 'BSA-0006' WHERE body_shape IN ('Extended Range');
UPDATE public.catalogue_models SET body_shape = 'BSA-0007' WHERE body_shape IN ('Stratocaster');
UPDATE public.catalogue_models SET body_shape = 'BSA-0008' WHERE body_shape IN ('Jazz Bass');
UPDATE public.catalogue_models SET body_shape = 'BSA-0009' WHERE body_shape IN ('Precision Bass');
UPDATE public.catalogue_models SET body_shape = 'BSA-0010' WHERE body_shape IN ('Unknown');

UPDATE public.catalogue_models SET body_wood = 'BWD-0001' WHERE body_wood IN ('Canadian Basswood', 'Basswood');
UPDATE public.catalogue_models SET body_wood = 'BWD-0002' WHERE body_wood IN ('American Alder', 'Alder');
UPDATE public.catalogue_models SET body_wood = 'BWD-0003' WHERE body_wood IN ('American Swamp Ash', 'Swamp Ash');
UPDATE public.catalogue_models SET body_wood = 'BWD-0004' WHERE body_wood IN ('Mahogany');
UPDATE public.catalogue_models SET body_wood = 'BWD-0005' WHERE body_wood IN ('Unknown');

UPDATE public.catalogue_models SET fretboard_wood = 'FWD-0001' WHERE fretboard_wood IN ('AAA Indian Rosewood', 'Indian Rosewood', 'Rosewood');
UPDATE public.catalogue_models SET fretboard_wood = 'FWD-0002' WHERE fretboard_wood IN ('AAA Grade Canadian Maple', 'Canadian Maple', 'Maple');
UPDATE public.catalogue_models SET fretboard_wood = 'FWD-0003' WHERE fretboard_wood IN ('Ebony');
UPDATE public.catalogue_models SET fretboard_wood = 'FWD-0004' WHERE fretboard_wood IN ('Matrix — Rosewood & Maple', 'Matrix - Rosewood & Maple');
UPDATE public.catalogue_models SET fretboard_wood = 'FWD-0006' WHERE fretboard_wood IN ('Unknown');

UPDATE public.catalogue_models SET neck_construction = 'NCK-0001' WHERE neck_construction IN ('Factory — Bolt-on 2-piece scarf joint', 'Factory - Bolt-on 2-piece scarf joint');
UPDATE public.catalogue_models SET neck_construction = 'NCK-0002' WHERE neck_construction IN ('Factory — Set neck', 'Factory - Set neck');
UPDATE public.catalogue_models SET neck_construction = 'NCK-0003' WHERE neck_construction IN ('Factory — Neck-through', 'Factory - Neck-through');
UPDATE public.catalogue_models SET neck_construction = 'NCK-0004' WHERE neck_construction IN ('Aftermarket Replacement');
UPDATE public.catalogue_models SET neck_construction = 'NCK-0005' WHERE neck_construction IN ('Modified');
UPDATE public.catalogue_models SET neck_construction = 'NCK-0006' WHERE neck_construction IN ('Unknown');

UPDATE public.catalogue_models SET fret_count = 'FRT-0001' WHERE fret_count IN ('19');
UPDATE public.catalogue_models SET fret_count = 'FRT-0002' WHERE fret_count IN ('21');
UPDATE public.catalogue_models SET fret_count = 'FRT-0003' WHERE fret_count IN ('22');
UPDATE public.catalogue_models SET fret_count = 'FRT-0004' WHERE fret_count IN ('24');
UPDATE public.catalogue_models SET fret_count = 'FRT-0005' WHERE fret_count IN ('Unknown');

UPDATE public.catalogue_models SET scale_length = 'SCL-0001' WHERE scale_length IN ('25" (Maverick / PRS Core)', '25"');
UPDATE public.catalogue_models SET scale_length = 'SCL-0002' WHERE scale_length IN ('25.5" (Fender)', '25.5"');
UPDATE public.catalogue_models SET scale_length = 'SCL-0003' WHERE scale_length IN ('24.75" (Gibson)', '24.75"');
UPDATE public.catalogue_models SET scale_length = 'SCL-0004' WHERE scale_length IN ('24" (Warmoth Short Scale)', '24"');
UPDATE public.catalogue_models SET scale_length = 'SCL-0005' WHERE scale_length IN ('30" (Bass — Short Scale)', '30"');
UPDATE public.catalogue_models SET scale_length = 'SCL-0006' WHERE scale_length IN ('34" (Bass — Standard)', '34"');
UPDATE public.catalogue_models SET scale_length = 'SCL-0007' WHERE scale_length IN ('Unknown');

UPDATE public.catalogue_models SET pickup_configuration = 'PCG-0001' WHERE pickup_configuration IN ('HH');
UPDATE public.catalogue_models SET pickup_configuration = 'PCG-0002' WHERE pickup_configuration IN ('HSH');
UPDATE public.catalogue_models SET pickup_configuration = 'PCG-0003' WHERE pickup_configuration IN ('HSS');
UPDATE public.catalogue_models SET pickup_configuration = 'PCG-0004' WHERE pickup_configuration IN ('HS');
UPDATE public.catalogue_models SET pickup_configuration = 'PCG-0005' WHERE pickup_configuration IN ('H');
UPDATE public.catalogue_models SET pickup_configuration = 'PCG-0006' WHERE pickup_configuration IN ('SSS');
UPDATE public.catalogue_models SET pickup_configuration = 'PCG-0007' WHERE pickup_configuration IN ('SS');
UPDATE public.catalogue_models SET pickup_configuration = 'PCG-0008' WHERE pickup_configuration IN ('Other');
UPDATE public.catalogue_models SET pickup_configuration = 'PCG-0009' WHERE pickup_configuration IN ('Unknown');

UPDATE public.catalogue_models SET bridge_type = 'BRG-0001' WHERE bridge_type IN ('Maverick Floyd Rose — Licensed', 'Maverick Floyd Rose - Licensed');
UPDATE public.catalogue_models SET bridge_type = 'BRG-0002' WHERE bridge_type IN ('Floyd Rose — Original', 'Floyd Rose - Original');
UPDATE public.catalogue_models SET bridge_type = 'BRG-0003' WHERE bridge_type IN ('Floyd Rose — Licensed (Non-Maverick)', 'Floyd Rose - Licensed (Non-Maverick)');
UPDATE public.catalogue_models SET bridge_type = 'BRG-0004' WHERE bridge_type IN ('Tune-o-matic');
UPDATE public.catalogue_models SET bridge_type = 'BRG-0005' WHERE bridge_type IN ('Hardtail');
UPDATE public.catalogue_models SET bridge_type = 'BRG-0006' WHERE bridge_type IN ('Vintage Tremolo');
UPDATE public.catalogue_models SET bridge_type = 'BRG-0007' WHERE bridge_type IN ('Maverick/Wilkinson Wraparound', 'Wraparound');
UPDATE public.catalogue_models SET bridge_type = 'BRG-0008' WHERE bridge_type IN ('Bass Bridge');
UPDATE public.catalogue_models SET bridge_type = 'BRG-0009' WHERE bridge_type IN ('Unknown');

UPDATE public.catalogue_models SET hardware_colour = 'HWC-0001' WHERE hardware_colour IN ('Gold');
UPDATE public.catalogue_models SET hardware_colour = 'HWC-0002' WHERE hardware_colour IN ('Black');
UPDATE public.catalogue_models SET hardware_colour = 'HWC-0003' WHERE hardware_colour IN ('Nickel');
UPDATE public.catalogue_models SET hardware_colour = 'HWC-0004' WHERE hardware_colour IN ('Unknown');

UPDATE public.catalogue_models SET headstock_logo = 'HGL-0001' WHERE headstock_logo IN ('Maverick Script Logo — Lacquer-encapsulated foil decal', 'Maverick Script Logo - Lacquer-encapsulated foil decal');
UPDATE public.catalogue_models SET headstock_logo = 'HGL-0002' WHERE headstock_logo IN ('Maverick Script Logo — Cream silkscreen', 'Maverick Script Logo - Cream silkscreen');
UPDATE public.catalogue_models SET headstock_logo = 'HGL-0003' WHERE headstock_logo IN ('Unknown');

UPDATE public.catalogue_models SET headstock_style = 'HST-0001' WHERE headstock_style IN ('6-aside');
UPDATE public.catalogue_models SET headstock_style = 'HST-0002' WHERE headstock_style IN ('6-aside reversed');
UPDATE public.catalogue_models SET headstock_style = 'HST-0003' WHERE headstock_style IN ('4-aside');
UPDATE public.catalogue_models SET headstock_style = 'HST-0004' WHERE headstock_style IN ('3+3-aside');
UPDATE public.catalogue_models SET headstock_style = 'HST-0005' WHERE headstock_style IN ('3+2-aside', '3+2 (3 tuners standard side, 2 opposing edge)');
UPDATE public.catalogue_models SET headstock_style = 'HST-0006' WHERE headstock_style IN ('Unknown');

UPDATE public.catalogue_models SET neck_binding = 'NKB-0001' WHERE neck_binding IN ('Factory — No Binding', 'Factory - No Binding');
UPDATE public.catalogue_models SET neck_binding = 'NKB-0002' WHERE neck_binding IN ('Factory — Cream Binding', 'Factory - Cream Binding');
UPDATE public.catalogue_models SET neck_binding = 'NKB-0003' WHERE neck_binding IN ('Factory — Black Binding', 'Factory - Black Binding');
UPDATE public.catalogue_models SET neck_binding = 'NKB-0004' WHERE neck_binding IN ('Unknown');

UPDATE public.catalogue_models SET left_handed_available = 'LHA-0001' WHERE left_handed_available IN ('Yes — Factory', 'Yes - Factory');
UPDATE public.catalogue_models SET left_handed_available = 'LHA-0002' WHERE left_handed_available IN ('Yes — Custom Order', 'Yes - Custom Order');
UPDATE public.catalogue_models SET left_handed_available = 'LHA-0003' WHERE left_handed_available IN ('No');
UPDATE public.catalogue_models SET left_handed_available = 'LHA-0004' WHERE left_handed_available IN ('Unknown');
