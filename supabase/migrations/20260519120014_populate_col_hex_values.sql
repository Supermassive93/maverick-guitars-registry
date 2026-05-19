-- Populate hex and hex_note for all COL ref_values.
-- Hex codes extracted from 2001 brochure and 2002 catalogue print material.
-- hex_note describes finish character (metallic, burst, natural grain) that
-- a flat hex cannot represent.

-- 2001 Brochure colours
UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#53372E", "hex_note": "Deep dark brown — warm and earthy with reddish undertones. Actual finish is metallic; will appear lighter and more reflective than the flat swatch."}'::jsonb
  WHERE id = 'COL-0001';

UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#414D8C", "hex_note": "Medium-deep cobalt blue — cool and saturated with a slightly muted tone. Actual finish is metallic; will appear lighter and more reflective than the flat swatch."}'::jsonb
  WHERE id = 'COL-0002';

UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#2D3D33", "hex_note": "Dark forest green — deep and earthy with a cool, shadowy quality. Actual finish is metallic; will appear lighter and more reflective than the flat swatch."}'::jsonb
  WHERE id = 'COL-0003';

UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#3D3C34", "hex_note": "Dark olive charcoal — a muted, near-neutral tone with warm earthy undertones. Actual finish is metallic; will appear lighter and more reflective than the flat swatch."}'::jsonb
  WHERE id = 'COL-0004';

UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#B5D0EA", "hex_note": "Soft powder blue — light and airy with a gentle cool tone. Actual finish is metallic; will appear shinier and more reflective than the flat swatch."}'::jsonb
  WHERE id = 'COL-0005';

UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#EEEFEB", "hex_note": "Off-white / warm white — very pale with a faint cool-neutral tone, almost pure white. Actual finish is metallic; will appear shinier and more reflective than the flat swatch."}'::jsonb
  WHERE id = 'COL-0006';

-- 2002 Catalogue colours
UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#D52114", "hex_note": "Bold true red — vivid and warm with a slightly orange-red intensity."}'::jsonb
  WHERE id = 'COL-0007';

UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#EFBE0A", "hex_note": "Warm golden yellow — rich and saturated with a strong amber quality."}'::jsonb
  WHERE id = 'COL-0008';

UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#161414", "hex_note": "Near-black — extremely dark with the faintest warm undertone. Actual finish has a subtle metallic sparkle not captured by the flat swatch."}'::jsonb
  WHERE id = 'COL-0009';

UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#737E8B", "hex_note": "Medium slate grey-blue — cool and muted with a soft industrial quality. Actual finish is metallic; will appear shinier and more reflective than the flat swatch."}'::jsonb
  WHERE id = 'COL-0012';

UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#541001", "hex_note": "Deep oxblood / dark burgundy — very dark rich red with an almost brown depth. Swatch represents the outer burst edge; actual finish transitions from this dark tone to a lighter amber-cream centre."}'::jsonb
  WHERE id = 'COL-0013';

UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#371F66", "hex_note": "Deep royal purple — rich and dark with strong violet depth."}'::jsonb
  WHERE id = 'COL-0018';

UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#ECAF80", "hex_note": "Warm peach / light tan — soft and peachy with a natural wood-grain quality. Swatch is an approximation; actual finish will vary with the grain and figure of the individual piece of wood."}'::jsonb
  WHERE id = 'COL-0019';

UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#DC3F2E", "hex_note": "Strong tomato red — warm and vivid. Swatch represents the outer burst edge; actual finish transitions from this red-orange tone to a warm yellow centre."}'::jsonb
  WHERE id = 'COL-0020';

UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#061A44", "hex_note": "Deep navy blue — dark and rich with a pure blue base."}'::jsonb
  WHERE id = 'COL-0021';

UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#218F97", "hex_note": "Medium teal / cyan — vibrant and saturated with a balanced blue-green quality."}'::jsonb
  WHERE id = 'COL-0022';

UPDATE public.ref_values SET metadata = metadata
  || '{"hex": "#9A6D4D", "hex_note": "Warm mid-tan / camel brown — earthy and natural, a classic neutral with golden-brown warmth."}'::jsonb
  WHERE id = 'COL-0023';
