-- Fix populate_serial_range: model text → model_id uuid, series already a SER ref ID
CREATE OR REPLACE FUNCTION public.populate_serial_range(
  p_model_id uuid,
  p_series   text,
  p_prefix   text,
  p_max      integer
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  i        int;
  v_serial text;
  v_count  int := 0;
BEGIN
  FOR i IN 1..p_max LOOP
    v_serial := p_prefix || lpad(i::text, 5, '0');
    INSERT INTO public.guitars (serial, serial_number_only, serial_status, model_id, series, status)
    VALUES (v_serial, i, 'Complete', p_model_id, p_series, 'Pre-populated')
    ON CONFLICT DO NOTHING;
    IF FOUND THEN v_count := v_count + 1; END IF;
  END LOOP;
  RETURN v_count;
END;
$$;

-- Fix trigger_populate_on_approval: model → model_id
CREATE OR REPLACE FUNCTION public.trigger_populate_on_approval()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_prefix text;
BEGIN
  IF NEW.status = 'Approved'
     AND (OLD.status IS DISTINCT FROM 'Approved')
     AND NEW.serial_status = 'Complete'
     AND NEW.serial_number_only IS NOT NULL
     AND NEW.model_id IS NOT NULL
     AND NEW.serial IS NOT NULL
  THEN
    v_prefix := regexp_replace(NEW.serial, '[0-9]+$', '');
    PERFORM public.populate_serial_range(NEW.model_id, NEW.series, v_prefix, NEW.serial_number_only);
  END IF;
  RETURN NEW;
END;
$$;

-- Fix two unmapped ref-ID values on guitars
UPDATE public.guitars SET pickup_colours = 'PKC-0002' WHERE pickup_colours = 'Nickel Covers';
UPDATE public.guitars SET tuner_style    = 'TNR-0001' WHERE tuner_style    = 'Factory - Maverick/Wilkinson';
