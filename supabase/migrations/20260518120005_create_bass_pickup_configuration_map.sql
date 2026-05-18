-- Migration 6: Create bass_pickup_configuration_map table
-- Mirrors pickup_configuration_map but for bass guitars (no middle position)

CREATE TABLE IF NOT EXISTS public.bass_pickup_configuration_map (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  configuration text NOT NULL,
  neck_type     text,
  bridge_type   text,
  notes         text
);

CREATE UNIQUE INDEX IF NOT EXISTS bass_pcm_configuration_idx
  ON public.bass_pickup_configuration_map (configuration);

ALTER TABLE public.bass_pickup_configuration_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bass_pickup_configuration_map_public_read"
  ON public.bass_pickup_configuration_map
  FOR SELECT USING (true);

INSERT INTO public.bass_pickup_configuration_map (configuration, neck_type, bridge_type, notes) VALUES
  ('JJ',      'Jazz Bass (Single Coil)',  'Jazz Bass (Single Coil)',  'Two Jazz Bass single coil pickups'),
  ('HH',      'Humbucker',               'Humbucker',               'Two humbucker pickups'),
  ('P',       'Precision (Split Coil)',   NULL,                      'Single Precision split coil pickup — neck position only'),
  ('PJ',      'Precision (Split Coil)',   'Jazz Bass (Single Coil)',  'Precision neck and Jazz Bass bridge'),
  ('PH',      'Precision (Split Coil)',   'Humbucker',               'Precision neck and humbucker bridge'),
  ('HJ',      'Humbucker',               'Jazz Bass (Single Coil)',  'Humbucker neck and Jazz Bass bridge'),
  ('Unknown', NULL,                       NULL,                      'Configuration not confirmed');
