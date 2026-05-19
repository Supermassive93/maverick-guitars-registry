-- CSC: Custom Shop Colour ref values.
-- Covers known custom shop finish options from the submit form.
-- hex is null for all CSC entries — multi-tone and bespoke finishes
-- cannot be meaningfully represented as a single flat colour.

INSERT INTO public.ref_values (id, category, display_name, sort_order, is_active, descriptor, metadata) VALUES
  ('CSC-0001', 'CSC', 'BW — Black & White (Zebra)', 1, true, 'Two-tone black and white split body finish',         '{"hex": null, "hex_note": "Two-tone black and white finish — no single hex applies.", "colour_source": "Submit form options"}'),
  ('CSC-0002', 'CSC', 'BR — Black & Red (DTM)',      2, true, 'Two-tone black and red DTM paint scheme',            '{"hex": null, "hex_note": "Two-tone black and red finish — no single hex applies.", "colour_source": "Submit form options"}'),
  ('CSC-0003', 'CSC', 'Custom Airbrushed',           3, true, 'Hand-applied custom airbrushed artwork — unique per instrument', '{"hex": null, "hex_note": "Bespoke airbrushed finish — each instrument is unique, no hex applies.", "colour_source": "Submit form options"}'),
  ('CSC-0004', 'CSC', 'Unknown',                     99, true, 'Custom shop colour not confirmed',                  '{"hex": null, "hex_note": null, "colour_source": null}');
