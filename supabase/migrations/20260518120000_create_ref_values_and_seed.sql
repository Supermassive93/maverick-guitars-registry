-- Migration 1: Create ref_values table and seed all reference data

CREATE TABLE IF NOT EXISTS public.ref_values (
  id           text PRIMARY KEY,
  category     text NOT NULL,
  display_name text NOT NULL,
  sort_order   integer DEFAULT 0,
  is_active    boolean DEFAULT true,
  descriptor   text,
  metadata     jsonb
);

CREATE INDEX IF NOT EXISTS ref_values_category_idx
  ON public.ref_values (category);

CREATE UNIQUE INDEX IF NOT EXISTS ref_values_category_display_name_idx
  ON public.ref_values (category, display_name);

ALTER TABLE public.ref_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ref_values_public_read"
  ON public.ref_values FOR SELECT USING (true);

-- SER: Series
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('SER-0001', 'SER', 'Evolution', 1, 'Original superstrat lineup — F-series, X-series, SF, Matrix'),
  ('SER-0002', 'SER', 'Century',   2, 'Offset double-cut and ergonomic body lineup — Chaos, Species'),
  ('SER-0003', 'SER', 'D-Tox',    3, 'Extended-range and aggressive body lineup — XD-Tox, FD-Tox'),
  ('SER-0004', 'SER', 'Nemesis',  4, 'Bass guitar lineup — B1, Z-47, S4, S5'),
  ('SER-0005', 'SER', 'Unknown',  99, 'Series not confirmed');

-- GEN: Generation
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('GEN-0001', 'GEN', 'Gen 1', 1, '1999–2000 pre-catalogue instruments'),
  ('GEN-0002', 'GEN', 'Gen 2', 2, '2001 brochure instruments'),
  ('GEN-0003', 'GEN', 'Gen 3', 3, '2002 catalogue instruments'),
  ('GEN-0004', 'GEN', 'Gen 4', 4, 'Post-catalogue instruments (2003 onwards)'),
  ('GEN-0005', 'GEN', 'Unknown', 99, 'Generation not confirmed');

-- FIN: Finish type
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('FIN-0001', 'FIN', 'Factory Finish',      1, 'Original factory finish, unmodified'),
  ('FIN-0002', 'FIN', 'Custom Shop Finish',  2, 'Non-standard finish applied at factory by special order'),
  ('FIN-0003', 'FIN', 'Refinished',          3, 'Body or neck has been refinished after leaving the factory'),
  ('FIN-0004', 'FIN', 'Relic',               4, 'Artificially aged or distressed finish'),
  ('FIN-0005', 'FIN', 'Unknown',             99, 'Finish origin not confirmed');

-- CYR: Catalogue year
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('CYR-0001', 'CYR', '2001 Brochure', 1, 'Appeared in the 2001 product brochure'),
  ('CYR-0002', 'CYR', '2002 Catalogue', 2, 'Appeared in the 2002 full catalogue'),
  ('CYR-0003', 'CYR', 'Both',          3, 'Appeared in both the 2001 brochure and 2002 catalogue'),
  ('CYR-0004', 'CYR', 'Unknown',       99, 'Catalogue year not confirmed');

-- BSA: Body shape
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('BSA-0001', 'BSA', 'Superstrat',                1, 'Offset double-cutaway based on the Stratocaster outline'),
  ('BSA-0002', 'BSA', 'Offset Double Cut',         2, 'Asymmetric double-cutaway — deeper lower horn'),
  ('BSA-0003', 'BSA', 'Single Cut — LP Style',     3, 'Single-cutaway body based on the Les Paul outline'),
  ('BSA-0004', 'BSA', 'Single Cut — LP Style',     3, 'Single-cutaway body based on the Les Paul outline'),
  ('BSA-0005', 'BSA', 'Double Cut — PRS Style',    4, 'Symmetrical double-cutaway based on the PRS outline'),
  ('BSA-0006', 'BSA', 'Extended Range',            5, 'Stretched lower bout for extended-range ergonomics'),
  ('BSA-0007', 'BSA', 'Stratocaster',              6, 'Classic Stratocaster double-cutaway outline'),
  ('BSA-0008', 'BSA', 'Jazz Bass',                 7, 'Offset waist Jazz Bass body outline'),
  ('BSA-0009', 'BSA', 'Precision Bass',            8, 'Slab double-cutaway Precision Bass outline'),
  ('BSA-0010', 'BSA', 'Unknown',                   99, 'Body shape not confirmed');

-- BWD: Body wood
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('BWD-0001', 'BWD', 'Canadian Basswood',    1, 'Lightweight tonewood sourced from Canada'),
  ('BWD-0002', 'BWD', 'American Alder',       2, 'Classic solid-body tonewood used extensively in Fender-style instruments'),
  ('BWD-0003', 'BWD', 'American Swamp Ash',   3, 'Lightweight ash with pronounced grain, used in see-through finishes'),
  ('BWD-0004', 'BWD', 'Mahogany',             4, 'Dense tonewood associated with warm, sustain-heavy tone'),
  ('BWD-0005', 'BWD', 'Unknown',              99, 'Body wood not confirmed');

-- BCN: Body construction
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('BCN-0001', 'BCN', 'Single Slab',   1, 'Body cut from a single piece of wood'),
  ('BCN-0002', 'BCN', 'Two-piece',     2, 'Body joined from two pieces of wood'),
  ('BCN-0003', 'BCN', 'Three-piece',   3, 'Body joined from three pieces of wood'),
  ('BCN-0004', 'BCN', 'Unknown',       99, 'Body construction not confirmed');

-- FWD: Fretboard wood (FWD-0005 retired — gap preserved)
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('FWD-0001', 'FWD', 'AAA Indian Rosewood',           1, 'Premium-grade Indian rosewood fretboard'),
  ('FWD-0002', 'FWD', 'AAA Grade Canadian Maple',      2, 'Premium-grade Canadian maple fretboard'),
  ('FWD-0003', 'FWD', 'Ebony',                         3, 'Dense, dark hardwood fretboard'),
  ('FWD-0004', 'FWD', 'Matrix — Rosewood & Maple',     4, 'Alternating rosewood and maple strips — Matrix model exclusive'),
  ('FWD-0006', 'FWD', 'Unknown',                       99, 'Fretboard wood not confirmed');

-- NWD: Neck wood
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('NWD-0001', 'NWD', 'Selected Canadian Maple',  1, 'Hand-selected Canadian maple neck'),
  ('NWD-0002', 'NWD', 'Rock Maple',               2, 'Hard rock maple neck'),
  ('NWD-0003', 'NWD', 'Maple',                    3, 'Maple neck, grade unspecified'),
  ('NWD-0004', 'NWD', 'Unknown',                  99, 'Neck wood not confirmed'),
  ('NWD-0005', 'NWD', 'Bubinga',                  5, 'African hardwood neck — warm tone with tight grain'),
  ('NWD-0006', 'NWD', 'Mahogany',                 6, 'Mahogany neck — warm tone with good sustain');

-- NPR: Neck profile
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('NPR-0001', 'NPR', 'Ultra Thin',        1, 'Very thin front-to-back depth — fast, modern feel'),
  ('NPR-0002', 'NPR', 'Thin C',            2, 'Shallow C-shaped profile'),
  ('NPR-0003', 'NPR', 'Medium C',          3, 'Standard C-shaped profile'),
  ('NPR-0004', 'NPR', 'Fat C',             4, 'Fuller C-shaped profile with more back depth'),
  ('NPR-0005', 'NPR', 'D',                 5, 'Asymmetric D-shaped profile — flatter back'),
  ('NPR-0006', 'NPR', 'U',                 6, 'Deep U-shaped profile'),
  ('NPR-0007', 'NPR', 'Unknown',           99, 'Neck profile not confirmed');

-- NCK: Neck construction
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('NCK-0001', 'NCK', 'Factory — Bolt-on 2-piece scarf joint',  1, 'Standard Maverick bolt-on neck — headstock angle achieved via scarf joint'),
  ('NCK-0002', 'NCK', 'Factory — Set neck',                     2, 'Glued-in neck joint'),
  ('NCK-0003', 'NCK', 'Factory — Neck-through',                 3, 'Neck wood runs the full length of the body'),
  ('NCK-0004', 'NCK', 'Aftermarket Replacement',                4, 'Original neck replaced after leaving the factory'),
  ('NCK-0005', 'NCK', 'Modified',                               5, 'Original neck with post-factory modifications'),
  ('NCK-0006', 'NCK', 'Unknown',                                99, 'Neck construction not confirmed');

-- FRT: Fret count
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('FRT-0001', 'FRT', '19',      1, '19-fret neck'),
  ('FRT-0002', 'FRT', '21',      2, '21-fret neck'),
  ('FRT-0003', 'FRT', '22',      3, '22-fret neck'),
  ('FRT-0004', 'FRT', '24',      4, '24-fret neck'),
  ('FRT-0005', 'FRT', 'Unknown', 99, 'Fret count not confirmed');

-- SCL: Scale length
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('SCL-0001', 'SCL', '25" (Maverick / PRS Core)',   1, 'Standard Maverick scale length — matches PRS Core instruments'),
  ('SCL-0002', 'SCL', '25.5" (Fender)',              2, 'Standard Fender/Strat scale length'),
  ('SCL-0003', 'SCL', '24.75" (Gibson)',             3, 'Standard Gibson scale length'),
  ('SCL-0004', 'SCL', '24" (Warmoth Short Scale)',   4, 'Short scale — 24 inches'),
  ('SCL-0005', 'SCL', '30" (Bass — Short Scale)',    5, 'Bass short scale — 30 inches'),
  ('SCL-0006', 'SCL', '34" (Bass — Standard)',       6, 'Bass standard scale — 34 inches'),
  ('SCL-0007', 'SCL', 'Unknown',                     99, 'Scale length not confirmed');

-- PCG: Pickup configuration (electric guitar)
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('PCG-0001', 'PCG', 'HH',      1, 'Dual humbucker'),
  ('PCG-0002', 'PCG', 'HSH',     2, 'Humbucker — single coil — humbucker'),
  ('PCG-0003', 'PCG', 'HSS',     3, 'Humbucker — single coil — single coil'),
  ('PCG-0004', 'PCG', 'HS',      4, 'Humbucker — single coil'),
  ('PCG-0005', 'PCG', 'H',       5, 'Single humbucker'),
  ('PCG-0006', 'PCG', 'SSS',     6, 'Three single coils'),
  ('PCG-0007', 'PCG', 'SS',      7, 'Two single coils'),
  ('PCG-0008', 'PCG', 'Other',   8, 'Non-standard configuration'),
  ('PCG-0009', 'PCG', 'Unknown', 99, 'Pickup configuration not confirmed');

-- PCB: Pickup configuration (bass guitar)
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('PCB-0001', 'PCB', 'JJ',      1, 'Two Jazz Bass single coil pickups'),
  ('PCB-0002', 'PCB', 'HH',      2, 'Two humbucker pickups'),
  ('PCB-0003', 'PCB', 'P',       3, 'Single Precision split coil pickup'),
  ('PCB-0004', 'PCB', 'PJ',      4, 'Precision neck and Jazz Bass bridge'),
  ('PCB-0005', 'PCB', 'PH',      5, 'Precision neck and humbucker bridge'),
  ('PCB-0006', 'PCB', 'HJ',      6, 'Humbucker neck and Jazz Bass bridge'),
  ('PCB-0007', 'PCB', 'Unknown', 99, 'Pickup configuration not confirmed');

-- BRG: Bridge type
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('BRG-0001', 'BRG', 'Maverick Floyd Rose — Licensed',        1, 'Maverick-branded licensed Floyd Rose double-locking tremolo'),
  ('BRG-0002', 'BRG', 'Floyd Rose — Original',                 2, 'Genuine Floyd Rose double-locking tremolo'),
  ('BRG-0003', 'BRG', 'Floyd Rose — Licensed (Non-Maverick)',  3, 'Licensed Floyd Rose from a third-party manufacturer'),
  ('BRG-0004', 'BRG', 'Tune-o-matic',                         4, 'Fixed bridge with separate stop tailpiece'),
  ('BRG-0005', 'BRG', 'Hardtail',                             5, 'Fixed bridge with through-body or top-load stringing'),
  ('BRG-0006', 'BRG', 'Vintage Tremolo',                      6, 'Non-locking tremolo — Fender-style synchronised'),
  ('BRG-0007', 'BRG', 'Maverick/Wilkinson Wraparound',        7, 'Maverick-branded Wilkinson wraparound bridge/tailpiece combo'),
  ('BRG-0008', 'BRG', 'Bass Bridge',                          8, 'Standard bass guitar bridge'),
  ('BRG-0009', 'BRG', 'Unknown',                              99, 'Bridge type not confirmed');

-- HWC: Hardware colour
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('HWC-0001', 'HWC', 'Gold',    1, 'Gold-plated hardware'),
  ('HWC-0002', 'HWC', 'Black',   2, 'Black-finished hardware'),
  ('HWC-0003', 'HWC', 'Nickel',  3, 'Nickel-plated hardware'),
  ('HWC-0004', 'HWC', 'Unknown', 99, 'Hardware colour not confirmed');

-- SWT: Switching
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('SWT-0001', 'SWT', 'Factory 5 Way Blade Switch',   1, 'Standard 5-position blade selector'),
  ('SWT-0002', 'SWT', 'Factory 3 Way Toggle Switch',  2, '3-position toggle selector'),
  ('SWT-0003', 'SWT', 'Factory 3 Way Blade Switch',   3, '3-position blade selector'),
  ('SWT-0004', 'SWT', 'Aftermarket',                  4, 'Non-original switch fitted after leaving the factory'),
  ('SWT-0005', 'SWT', 'Unknown',                      99, 'Switching not confirmed');

-- POT: Potentiometers
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('POT-0001', 'POT', 'Factory Patented Evolution Roller Pots', 1, 'Maverick proprietary roller-style potentiometers'),
  ('POT-0002', 'POT', 'Factory Standard Pots',                  2, 'Standard rotary potentiometers'),
  ('POT-0003', 'POT', 'Aftermarket',                            3, 'Non-original pots fitted after leaving the factory'),
  ('POT-0004', 'POT', 'Unknown',                                99, 'Potentiometers not confirmed');

-- HGL: Headstock logo
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('HGL-0001', 'HGL', 'Maverick Script Logo — Lacquer-encapsulated foil decal', 1, 'Reflective foil decal sealed under lacquer'),
  ('HGL-0002', 'HGL', 'Maverick Script Logo — Cream silkscreen',                2, 'Cream silkscreened logo directly on headstock'),
  ('HGL-0003', 'HGL', 'Unknown',                                                99, 'Headstock logo type not confirmed');

-- HST: Headstock style
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('HST-0001', 'HST', '6-aside',          1, 'Six tuners in a straight line on one side'),
  ('HST-0002', 'HST', '6-aside reversed', 2, 'Six tuners in a straight line — mirrored for left-hand'),
  ('HST-0003', 'HST', '4-aside',          3, 'Four tuners in a straight line on one side — bass'),
  ('HST-0004', 'HST', '3+3-aside',        4, 'Three tuners on each side'),
  ('HST-0005', 'HST', '3+2-aside',        5, 'Three tuners one side, two the other — 5-string bass'),
  ('HST-0006', 'HST', 'Unknown',          99, 'Headstock style not confirmed');

-- PSR: Pickup surrounds
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('PSR-0001', 'PSR', 'Factory — No Surrounds',    1, 'Pickups mounted directly without rings'),
  ('PSR-0002', 'PSR', 'Factory — Black Rings',     2, 'Black pickup mounting rings'),
  ('PSR-0003', 'PSR', 'Factory — Cream Rings',     3, 'Cream pickup mounting rings'),
  ('PSR-0004', 'PSR', 'Aftermarket',               4, 'Non-original surrounds fitted after leaving the factory'),
  ('PSR-0005', 'PSR', 'Unknown',                   99, 'Pickup surrounds not confirmed');

-- NKB: Neck binding
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('NKB-0001', 'NKB', 'Factory — No Binding',    1, 'Neck has no binding'),
  ('NKB-0002', 'NKB', 'Factory — Cream Binding', 2, 'Cream binding on fretboard edges'),
  ('NKB-0003', 'NKB', 'Factory — Black Binding', 3, 'Black binding on fretboard edges'),
  ('NKB-0004', 'NKB', 'Unknown',                 99, 'Neck binding not confirmed');

-- SKN: Strap knobs
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('SKN-0001', 'SKN', 'Factory — Cylindrical with O-rings', 1, 'Standard Maverick strap button with rubber O-ring retention'),
  ('SKN-0002', 'SKN', 'Factory — Tapered',                  2, 'Tapered strap button'),
  ('SKN-0003', 'SKN', 'Aftermarket Replacement',            3, 'Non-original strap buttons'),
  ('SKN-0004', 'SKN', 'Unknown',                            99, 'Strap knob type not confirmed');

-- SKS: Skunk stripe
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('SKS-0001', 'SKS', 'Factory — Skunk stripe',             1, 'Walnut skunk stripe on back of neck — standard truss rod access'),
  ('SKS-0002', 'SKS', 'Factory — No skunk stripe',          2, 'No skunk stripe — truss rod access via headstock or no stripe needed'),
  ('SKS-0003', 'SKS', 'Aftermarket',                        3, 'Skunk stripe fitted or modified after leaving the factory'),
  ('SKS-0004', 'SKS', 'Unknown',                            99, 'Skunk stripe status not confirmed');

-- NUT: Nut type
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('NUT-0001', 'NUT', 'Factory — Locking nut',  1, 'Locking nut — required for Floyd Rose bridges'),
  ('NUT-0002', 'NUT', 'Factory — Standard nut', 2, 'Non-locking nut'),
  ('NUT-0003', 'NUT', 'Aftermarket',            3, 'Non-original nut fitted after leaving the factory'),
  ('NUT-0004', 'NUT', 'Unknown',                99, 'Nut type not confirmed');

-- SPC: Spec confidence
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('SPC-0001', 'SPC', 'Catalogue Confirmed',     1, 'Spec verified against official catalogue photography or text'),
  ('SPC-0002', 'SPC', 'Multi-source Confirmed',  2, 'Spec verified across multiple independent sources'),
  ('SPC-0003', 'SPC', 'Owner Confirmed',         3, 'Spec confirmed by owner with physical instrument access'),
  ('SPC-0004', 'SPC', 'Probable',                4, 'Spec is likely correct but not independently verified'),
  ('SPC-0005', 'SPC', 'Unverified',              99, 'Spec taken from a single unverified source');

-- SRT: Submission source type
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('SRT-0001', 'SRT', 'Owner registration',      1, 'Submitted by the current owner'),
  ('SRT-0002', 'SRT', 'Previous owner',          2, 'Submitted by a previous owner'),
  ('SRT-0003', 'SRT', 'Third-party researcher',  3, 'Submitted by a researcher who is not the owner'),
  ('SRT-0004', 'SRT', 'Admin import',            4, 'Imported by an administrator from existing records'),
  ('SRT-0005', 'SRT', 'Catalogue reference',     5, 'Derived from catalogue data, no physical instrument'),
  ('SRT-0006', 'SRT', 'Other',                   99, 'Source type does not fit the above categories');

-- SLS: Serial label style
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('SLS-0001', 'SLS', 'Complete',              1, 'Full serial label present and legible'),
  ('SLS-0002', 'SLS', 'Partial',               2, 'Label present but partially illegible or damaged'),
  ('SLS-0003', 'SLS', 'Missing',               3, 'Label absent — removed or fell off'),
  ('SLS-0004', 'SLS', 'Stamped',               4, 'Serial number stamped directly into wood — no label'),
  ('SLS-0005', 'SLS', 'Engraved',              5, 'Serial number engraved into a plate'),
  ('SLS-0006', 'SLS', 'Hand label',            6, 'Handwritten label');

-- LHA: Left-handed availability
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('LHA-0001', 'LHA', 'Yes — Factory',       1, 'Left-handed version was a standard factory option'),
  ('LHA-0002', 'LHA', 'Yes — Custom Order',  2, 'Left-handed version was available by custom order only'),
  ('LHA-0003', 'LHA', 'No',                  3, 'No left-handed version was available'),
  ('LHA-0004', 'LHA', 'Unknown',             99, 'Left-handed availability not confirmed');

-- COL: Colour
-- COL-0010, COL-0011 retired (merged into existing IDs)
-- COL-0014 through COL-0017 retired (duplicates / renames)
INSERT INTO public.ref_values (id, category, display_name, sort_order, is_active, descriptor, metadata) VALUES
  ('COL-0001', 'COL', 'BK — Gloss Black',              1,  true,  'Solid gloss black',                              '{"colour_source": "2001 Brochure", "source_year": 2001}'),
  ('COL-0002', 'COL', 'WH — Gloss White',              2,  true,  'Solid gloss white',                              '{"colour_source": "2001 Brochure", "source_year": 2001}'),
  ('COL-0003', 'COL', 'CB — Cherry Burst',             3,  true,  'Cherry sunburst — dark red outer, amber centre', '{"colour_source": "2001 Brochure", "source_year": 2001}'),
  ('COL-0004', 'COL', 'SR — Sunset Red',               4,  true,  'Deep translucent red',                           '{"colour_source": "2001 Brochure", "source_year": 2001}'),
  ('COL-0005', 'COL', 'MB — Metallic Blue',            5,  true,  'Solid metallic blue',                            '{"colour_source": "2001 Brochure", "source_year": 2001}'),
  ('COL-0006', 'COL', 'EB — Electric Blue',            6,  true,  'Bright translucent electric blue',               '{"colour_source": "2001 Brochure", "source_year": 2001}'),
  ('COL-0007', 'COL', 'TRL — Tribal Red',              7,  true,  'Deep opaque tribal red',                         '{"colour_source": "2002 Catalogue", "source_year": 2002}'),
  ('COL-0008', 'COL', 'OW — Old White',                8,  true,  'Aged off-white',                                 '{"colour_source": "2002 Catalogue", "source_year": 2002}'),
  ('COL-0009', 'COL', 'CSK — Cosmos Black',            9,  true,  'Dark metallic black with subtle sparkle',        '{"colour_source": "2002 Catalogue", "source_year": 2002}'),
  ('COL-0012', 'COL', 'GM — Gunmetal',                 12, true,  'Dark metallic grey',                             '{"colour_source": "2002 Catalogue", "source_year": 2002}'),
  ('COL-0013', 'COL', 'TBS — Tobacco Sunburst',        13, true,  'Brown outer with amber-to-cream centre burst',   '{"colour_source": "2002 Catalogue", "source_year": 2002}'),
  ('COL-0018', 'COL', 'UV — Ultra Violet',             18, true,  'Bright translucent purple',                      '{"colour_source": "2002 Catalogue", "source_year": 2002}'),
  ('COL-0019', 'COL', 'NB — Natural Basswood',         19, true,  'Unfinished natural basswood grain',              '{"colour_source": "2002 Catalogue", "source_year": 2002}'),
  ('COL-0020', 'COL', 'FB — Fireburst',                20, true,  'Yellow centre bursting to red-orange outer',     '{"colour_source": "2002 Catalogue", "source_year": 2002}'),
  ('COL-0021', 'COL', 'MR — Metallic Red',             21, true,  'Solid metallic red',                             '{"colour_source": "2002 Catalogue", "source_year": 2002}'),
  ('COL-0022', 'COL', 'NA — Natural Ash',              22, true,  'Unfinished natural swamp ash grain',             '{"colour_source": "2002 Catalogue", "source_year": 2002}'),
  ('COL-0023', 'COL', 'Unknown',                       99, true,  'Colour not confirmed',                           NULL);

-- HDF: Headstock face colour
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('HDF-0001', 'HDF', 'Matches body colour', 1, 'Headstock face finished to match the body colour'),
  ('HDF-0002', 'HDF', 'Black',               2, 'Gloss black headstock face'),
  ('HDF-0003', 'HDF', 'Natural',             3, 'Unfinished or natural wood headstock face'),
  ('HDF-0004', 'HDF', 'Unknown',             99, 'Headstock face colour not confirmed');

-- PKC: Pickup cover colour
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('PKC-0001', 'PKC', 'Black Covers',      1, 'All pickup covers in black'),
  ('PKC-0002', 'PKC', 'Nickel Covers',     2, 'All pickup covers in nickel'),
  ('PKC-0003', 'PKC', 'Cream Covers',      3, 'All pickup covers in cream'),
  ('PKC-0004', 'PKC', 'Black & Cream',     4, 'Mixed black and cream covers'),
  ('PKC-0005', 'PKC', 'Unknown',           99, 'Pickup cover colour not confirmed');

-- TNR: Tuner type
INSERT INTO public.ref_values (id, category, display_name, sort_order, descriptor) VALUES
  ('TNR-0001', 'TNR', 'Factory — Maverick/Wilkinson', 1, 'Maverick-branded Wilkinson machine heads'),
  ('TNR-0002', 'TNR', 'Aftermarket',                  2, 'Non-original tuners fitted after leaving the factory'),
  ('TNR-0003', 'TNR', 'Unknown',                      99, 'Tuner type not confirmed');
