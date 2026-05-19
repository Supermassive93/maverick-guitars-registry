-- Replace every display-name string in available_colours[] with its COL ref ID.
-- Covers both exact-match names and the retired aliases confirmed during review.
UPDATE public.catalogue_models
SET available_colours = (
  SELECT array_agg(
    CASE val
      -- Exact display-name matches
      WHEN 'MB — Metallic Burgundy'   THEN 'COL-0001'
      WHEN 'MDB — Metallic Dark Blue' THEN 'COL-0002'
      WHEN 'MGN — Metallic Green'     THEN 'COL-0003'
      WHEN 'MGY — Metallic Grey'      THEN 'COL-0004'
      WHEN 'MIB — Metallic Ice Blue'  THEN 'COL-0005'
      WHEN 'PTR — Metallic Pewter'    THEN 'COL-0006'
      WHEN 'TRL — Tribal Red'         THEN 'COL-0007'
      WHEN 'DG — Dayglow'             THEN 'COL-0008'
      WHEN 'CSK — Cosmos Black'       THEN 'COL-0009'
      WHEN 'GM — Gunmetal'            THEN 'COL-0012'
      WHEN 'TBS — Tobacco Sunburst'   THEN 'COL-0013'
      WHEN 'UV — Ultra Violet'        THEN 'COL-0018'
      WHEN 'NT — Natural'             THEN 'COL-0019'
      WHEN 'FB — Fireburst'           THEN 'COL-0020'
      WHEN 'LB — Luna Blue'           THEN 'COL-0021'
      WHEN 'AQ — Aquamarine'          THEN 'COL-0022'
      WHEN 'DS — Desert Storm'        THEN 'COL-0023'
      -- Retired aliases → replacement COL ref IDs
      WHEN 'BK — Black'               THEN 'COL-0009'
      WHEN 'SL — Silver'              THEN 'COL-0012'
      WHEN 'CR — Candy Red'           THEN 'COL-0007'
      WHEN 'NY — Neon Yellow'         THEN 'COL-0008'
      WHEN 'TR — Transparent Red'     THEN 'COL-0013'
      WHEN 'MP — Metallic Purple'     THEN 'COL-0018'
      ELSE val
    END
  )
  FROM unnest(catalogue_models.available_colours) AS val
)
WHERE available_colours IS NOT NULL;
