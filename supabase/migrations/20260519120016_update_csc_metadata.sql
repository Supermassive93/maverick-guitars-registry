-- Enrich CSC ref_values with primary/secondary hex, pattern, pattern_description, and aka.
-- Nicknames moved out of display_name into metadata.aka.
-- Black standard across all Maverick finishes: #161414 (Cosmos Black, COL-0009).

-- Initialise new fields as null on all CSC rows
UPDATE public.ref_values
SET metadata = metadata || '{"hex_primary": null, "hex_secondary": null, "pattern": null, "pattern_description": null, "aka": null}'::jsonb
WHERE category = 'CSC';

-- CSC-0001: BW — Black & White (Zebra)
UPDATE public.ref_values
SET
  display_name = 'BW — Black & White',
  descriptor   = 'Horizontal striped finish — wide bold bands of black and white at regular even intervals across the body face',
  metadata     = metadata || '{
    "hex_primary":         "#161414",
    "hex_secondary":       "#E5E2D6",
    "pattern":             "Striped",
    "pattern_description": "Horizontal stripes — wide, bold bands at regular even intervals across the body face, approximately the width of a humbucker pickup and surround",
    "aka":                 "Zebra",
    "hex_note":            "Two-tone striped finish — primary (black) #161414, secondary (off-white) #E5E2D6. No single hex applies."
  }'::jsonb
WHERE id = 'CSC-0001';

-- CSC-0002: BR — Black & Red (Denis the Menace)
UPDATE public.ref_values
SET
  display_name = 'BR — Black & Red',
  descriptor   = 'Horizontal striped finish — wide bold bands of black and red at regular even intervals across the body face',
  metadata     = metadata || '{
    "hex_primary":         "#161414",
    "hex_secondary":       "#66111D",
    "pattern":             "Striped",
    "pattern_description": "Horizontal stripes — wide, bold bands at regular even intervals across the body face, approximately the width of a humbucker pickup and surround",
    "aka":                 "Denis the Menace",
    "hex_note":            "Two-tone striped finish — primary (black) #161414, secondary (crimson) #66111D. No single hex applies."
  }'::jsonb
WHERE id = 'CSC-0002';
