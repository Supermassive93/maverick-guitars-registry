export interface ModelData {
  model: string
  series: string
  description: string
  specs: { key: string; value: string }[]
  rarity?: string
  notes?: string
}

export const MODEL_CATALOGUE: ModelData[] = [
  // F-Series
  {
    model: 'F1',
    series: 'F-Series',
    description: 'The flagship superstrat. Dual humbucker configuration with Floyd Rose locking tremolo. The highest volume model in the range — the guitar most associated with the Maverick name.',
    specs: [
      { key: 'Config', value: 'HH' },
      { key: 'Bridge', value: 'Floyd Rose' },
      { key: 'Body', value: 'Basswood' },
    ],
  },
  {
    model: 'F1HT',
    series: 'F-Series',
    description: 'The F1 platform with a fixed Wilkinson hardtail in place of the Floyd Rose. All the ergonomics of the F1 with added tuning stability and sustain.',
    specs: [
      { key: 'Config', value: 'HH' },
      { key: 'Bridge', value: 'Wilkinson hardtail' },
      { key: 'Body', value: 'Basswood' },
    ],
  },
  {
    model: 'F2',
    series: 'F-Series',
    description: 'The sophisticated hybrid. Gibson neck geometry married to a low Fender-style hardtail. Gen 1 examples carry a ~1° neck pitch requiring ~8mm body packing — PRS-equivalent geometry producing exceptionally low action potential. Low production numbers. All known examples are Transparent Red — this appears to be the only colour the F2 was ever produced in.',
    specs: [
      { key: 'Config', value: 'HH' },
      { key: 'Bridge', value: 'Hardtail' },
      { key: 'Neck pitch', value: '~1° / ~8mm packing' },
    ],
    rarity: 'Low production',
  },
  {
    model: 'F3',
    series: 'F-Series',
    description: 'The versatile workhorse. HSH pickup configuration with Floyd Rose locking tremolo. Highest production numbers of any Maverick model — the most commercially successful guitar in the catalogue.',
    specs: [
      { key: 'Config', value: 'HSH' },
      { key: 'Bridge', value: 'Floyd Rose' },
      { key: 'Body', value: 'Basswood' },
    ],
  },
  {
    model: 'F4',
    series: 'F-Series',
    description: 'HSS configuration with Wilkinson hardtail. Features a composite neck profile morphing from vintage V at the nut to D-shape at the body join — delivering a dynamic playing feel across the full range.',
    specs: [
      { key: 'Config', value: 'HSS' },
      { key: 'Bridge', value: 'Wilkinson hardtail' },
      { key: 'Neck profile', value: 'V-to-D composite' },
    ],
  },
  {
    model: 'FD-Tox',
    series: 'F-Series',
    description: 'An F-Series variant with its own distinct identity within the family. Shares the core F-Series platform and construction approach.',
    specs: [
      { key: 'Series', value: 'F-Series' },
    ],
  },
  // X-Series
  {
    model: 'X1',
    series: 'X-Series',
    description: 'Explorer/Mockingbird-influenced body with aggressive angular styling. Available in both 6 and 7-string configurations. Used by Mindstorms and American Headcharge. The heaviest-looking guitar Maverick produced.',
    specs: [
      { key: 'Body', value: 'Explorer/Mockingbird' },
      { key: 'Strings', value: '6 and 7 string' },
    ],
  },
  {
    model: 'XD-Tox',
    series: 'X-Series',
    description: 'X-Series variant sharing the angular body platform of the X1. Produced in limited numbers as a companion model within the X family.',
    specs: [
      { key: 'Series', value: 'X-Series' },
    ],
    rarity: 'Limited',
  },
  // X-Treme — standalone model
  {
    model: 'X-Treme',
    series: 'X-Treme',
    description: 'A standalone model with an extreme Explorer/Mockingbird body. Uniquely features decorative lines routed through the paint into bare wood — on the body face behind the tremolo and on the headstock face between the tuners. Zebra pickups and a split Rosewood & Maple fingerboard complete a look found nowhere else in the range.',
    specs: [
      { key: 'Style', value: 'Extreme body' },
    ],
    rarity: 'Rare',
  },
  // Streetfighter — standalone model
  {
    model: 'SF-1',
    series: 'Streetfighter',
    description: 'Commonly known as the Streetfighter. The rarest Maverick guitar — a retailer-commissioned limited run featuring a reverse headstock, fret vents, and Wilkinson hardware throughout. As few as 4 known examples in certain colourways. Exceptionally collectible.',
    specs: [
      { key: 'Headstock', value: 'Reverse' },
      { key: 'Hardware', value: 'Wilkinson' },
      { key: 'Origin', value: 'Retailer commissioned' },
    ],
    rarity: 'Extremely rare',
  },
  // JR-Series — Jim Root prototype signature
  {
    model: 'JR4',
    series: 'JR-Series',
    description: 'A limited production guitar with a direct tie to Jim Root of Stone Sour and Slipknot. Maverick provided Root with several prototypes to test, and he played them live — including at the 2002 Reading Festival. The signature relationship was never formalised and Root moved on, but Maverick went ahead and produced a limited run for the market regardless. Superstrat body with full Maverick contouring, no pickup surrounds, and a hardtail bridge. 24-fret rosewood fingerboard with centralised inlays. Headstock matches body colour — observed in Pewter/Silver. Controls are a single through-body pot (likely push-pull volume/tone) and a 5-way blade switch mounted below the bridge, with no Evolution roller pots. Factory pickups were Duncan Designed or Wilkinson Alnico V humbuckers as standard across the Maverick range — many owners have since upgraded to EMG 81/85 actives.',
    specs: [
      { key: 'Config', value: 'HH' },
      { key: 'Bridge', value: 'Hardtail' },
      { key: 'Frets', value: '24' },
      { key: 'Fingerboard', value: 'Rosewood' },
      { key: 'Inlays', value: 'Centralised' },
      { key: 'Headstock', value: 'Body-matched colour' },
      { key: 'Controls', value: '1x pot (push-pull), 5-way blade' },
      { key: 'Observed colour', value: 'Pewter / Silver' },
    ],
    rarity: 'Limited production',
    notes: 'Not an official signature — Jim Root tested prototypes and played them live (2002 Reading Festival) but did not pursue the endorsement. Maverick produced a limited market run regardless. One of the most historically significant models in the Maverick catalogue.',
  },
  // Matrix — standalone model
  {
    model: 'Matrix',
    series: 'Matrix',
    description: 'A standalone model occupying its own classification in the Maverick catalogue. Distinct from both the F-Series superstrats and the angular X family.',
    specs: [
      { key: 'Series', value: 'Matrix' },
    ],
  },
  // Species
  {
    model: 'Species 1',
    series: 'Species',
    description: 'The entry model in Maverick\'s Species range. A distinctive sub-series with its own body styling and identity separate from the core F-Series superstrat platform. All known Species examples have been observed in Gloss Black only.',
    specs: [
      { key: 'Series', value: 'Species' },
    ],
  },
  {
    model: 'Species 2',
    series: 'Species',
    description: 'Mid-range Species variant. Builds on the Species 1 platform with a different pickup or hardware configuration.',
    specs: [
      { key: 'Series', value: 'Species' },
    ],
  },
  {
    model: 'Species 3',
    series: 'Species',
    description: 'The top-spec Species model. Produced alongside the other Species variants as part of a focused sub-range.',
    specs: [
      { key: 'Series', value: 'Species' },
    ],
  },
  {
    model: 'Species 7 String',
    series: 'Species',
    description: 'Seven-string variant within the Species line. One of the few extended-range instruments Maverick offered alongside the X1.',
    specs: [
      { key: 'Strings', value: '7 string' },
    ],
    rarity: 'Rare',
  },
  // Chaos
  {
    model: 'Chaos 1',
    series: 'Chaos',
    description: 'Entry model in the Chaos series. A more affordable route into the Maverick range while retaining the core construction philosophy.',
    specs: [
      { key: 'Series', value: 'Chaos' },
    ],
  },
  {
    model: 'Chaos 2',
    series: 'Chaos',
    description: 'Upgraded Chaos variant with improved specification over the Chaos 1.',
    specs: [
      { key: 'Series', value: 'Chaos' },
    ],
  },
  // G-Series
  {
    model: 'G1',
    series: 'G-Series',
    description: 'Maverick\'s take on the Les Paul format. Set-neck construction departs from the bolt-on superstrat approach of the F-Series. Rarer than the F-Series models.',
    specs: [
      { key: 'Style', value: 'Les Paul' },
      { key: 'Neck', value: 'Set neck' },
    ],
    rarity: 'Low production',
  },
  {
    model: 'G2',
    series: 'G-Series',
    description: 'Second variant in the G-Series. Complements the G1 within the set-neck, humbucker-driven side of the Maverick catalogue.',
    specs: [
      { key: 'Style', value: 'Les Paul variant' },
      { key: 'Neck', value: 'Set neck' },
    ],
    rarity: 'Low production',
  },
  // B-Series (bass — 2001 catalogue)
  {
    model: 'B1',
    series: 'B-Series',
    description: 'Maverick\'s first bass guitar, featured in the 2001 catalogue. Brought the same British-designed ethos and Korean manufacturing to the low end.',
    specs: [
      { key: 'Type', value: 'Bass guitar' },
      { key: 'Catalogue', value: '2001' },
    ],
    rarity: 'Rarely seen',
  },
  // S-Series (bass — 2002 catalogue)
  {
    model: 'S4',
    series: 'S-Series',
    description: 'Maverick\'s 4-string bass, introduced in the 2002 catalogue. Complemented the guitar range for full-band setups.',
    specs: [
      { key: 'Type', value: 'Bass guitar' },
      { key: 'Strings', value: '4 string' },
      { key: 'Catalogue', value: '2002' },
    ],
  },
  {
    model: 'S5',
    series: 'S-Series',
    description: 'The 5-string bass, introduced alongside the S4 in the 2002 catalogue. Extended low-end reach for players needing the additional low B string.',
    specs: [
      { key: 'Type', value: 'Bass guitar' },
      { key: 'Strings', value: '5 string' },
      { key: 'Catalogue', value: '2002' },
    ],
  },
]

export const SERIES_ORDER = [
  'F-Series',
  'X-Series',
  'X-Treme',
  'Streetfighter',
  'Matrix',
  'JR-Series',
  'Species',
  'Chaos',
  'G-Series',
  // Bass guitars below the divider
  'B-Series',
  'S-Series',
]

export const BASS_SERIES = ['B-Series', 'S-Series']
