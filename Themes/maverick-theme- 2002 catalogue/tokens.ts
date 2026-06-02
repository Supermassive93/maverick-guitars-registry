/**
 * Maverick Guitars 2002 — Design Tokens
 * Source: Maverick Guitars 2002 catalogue scan analysis
 *
 * Usage pattern: Tailwind for structure, these tokens for inline style design values.
 * e.g. style={{ color: tokens.color.textPrimary, fontFamily: tokens.font.display }}
 *
 * All tokens also available as CSS custom properties via globals.css (:root vars).
 */

export const tokens = {

  // ─── COLOUR ───────────────────────────────────────────────────────────────

  color: {
    // Backgrounds
    bgPrimary:       '#0a0a0c',   // Cosmos Black — page/card base
    bgSecondary:     '#1a1a1f',   // Deep Charcoal — elevated surfaces
    bgTertiary:      '#242428',   // Lifted surface, nav bars

    // Section background tints (cracked-earth texture tones, per series)
    bgTealCracked:   '#1a3840',   // Evolution series pages
    bgGreenCracked:  '#1e2e18',   // Century series pages
    bgPurpleCracked: '#1e1e38',   // Matrix / Streetfighter pages
    bgRustCracked:   '#2a1510',   // X-Treme / X1 pages
    bgBlueCracked:   '#151828',   // Nemesis bass pages

    // Text
    textPrimary:     '#e8e8e0',   // Ghost White — primary body text on dark
    textSecondary:   '#c8c8cc',   // Steel Silver — secondary / captions
    textMuted:       '#888890',   // Muted — tertiary, disabled
    textInverted:    '#0a0a0c',   // For text on light surfaces

    // Brand / Accent
    maverickRed:     '#cc2222',   // Logo red / script accent
    goldChrome:      '#d4a840',   // Hardware / premium accent
    ghostWhite:      '#e8e8e0',   // Large heading foreground

    // Borders & dividers
    borderSubtle:    '#2e2e36',   // Subtle dividers
    borderMid:       '#484858',   // Mid-weight borders
    borderStrong:    '#888890',   // Strong borders / rules

    // Colour key swatches (from Standard Colour Key page)
    colourTribalRed:        '#cc2222',
    colourLunarBlue:        '#1a3a8c',
    colourDayglow:          '#d4e020',
    colourCosmoBlack:       '#0a0a0c',
    colourDesertStorm:      '#c8b870',
    colourFireburst:        '#cc4a10',
    colourGunMetal:         '#4a4a54',
    colourTobaccoSunburst:  '#7a3a10',
    colourTransparentBlack: '#1a1a22',
    colourAquamarine:       '#20a090',
    colourUltraviolet:      '#5a20cc',
    colourNatural:          '#d4b878',
  },

  // ─── TYPOGRAPHY ───────────────────────────────────────────────────────────

  font: {
    // Wordmark — calligraphic script (Maverick logo)
    script:    "'Dancing Script', 'Pacifico', cursive",

    // Large section/page display headings — condensed heavy slab
    display:   "'Bebas Neue', 'Barlow Condensed', 'Oswald', sans-serif",

    // Model name display — condensed heavy sans (distressed effect applied via CSS)
    modelName: "'Barlow Condensed', 'Oswald', sans-serif",

    // Series label — condensed mixed-weight (e.g. "EVOLUTION series")
    series:    "'Barlow Condensed', 'Oswald', sans-serif",

    // Body copy — humanist sans
    body:      "'Source Sans 3', 'Nunito Sans', 'Myriad Pro', sans-serif",

    // Spec / callout — same family, bold
    spec:      "'Source Sans 3', 'Nunito Sans', sans-serif",
  },

  // ─── TYPE SCALE ───────────────────────────────────────────────────────────

  fontSize: {
    // Display / hero headings
    heroXl:    'clamp(3rem, 8vw, 6rem)',       // "THE ETHOS OF EVOLUTION" scale
    heroLg:    'clamp(2.5rem, 6vw, 4.5rem)',
    modelName: 'clamp(2rem, 5vw, 3.5rem)',     // F1, F2, Streetfighter etc.

    // Series / section labels
    seriesLabel: '0.75rem',   // "EVOLUTION series" header strip
    seriesName:  '0.875rem',

    // Body
    bodyLg:   '1.0625rem',    // ~17px — primary body paragraphs
    body:     '0.9375rem',    // ~15px — secondary copy
    bodySm:   '0.8125rem',    // ~13px — captions, specs

    // Micro
    micro:    '0.6875rem',    // ~11px — fine print
  },

  // ─── FONT WEIGHTS ─────────────────────────────────────────────────────────

  fontWeight: {
    light:       300,
    regular:     400,
    medium:      500,
    semibold:    600,
    bold:        700,
    extraBold:   800,
    black:       900,
  },

  // ─── LETTER SPACING ───────────────────────────────────────────────────────

  letterSpacing: {
    tight:    '-0.02em',
    normal:   '0em',
    wide:     '0.08em',        // Series labels: "EVOLUTION series"
    extraWide:'0.15em',        // Colour key labels, spec tables
    display:  '-0.01em',       // Large display headings — slightly compressed
  },

  // ─── LINE HEIGHT ──────────────────────────────────────────────────────────

  lineHeight: {
    tight:   1.1,    // Display / hero headings
    snug:    1.3,    // Subheadings
    normal:  1.5,    // Body
    relaxed: 1.7,    // Long-form catalogue copy
  },

  // ─── SPACING ──────────────────────────────────────────────────────────────

  spacing: {
    // Component-level
    xs:   '4px',
    sm:   '8px',
    md:   '16px',
    lg:   '24px',
    xl:   '40px',
    '2xl':'64px',
    '3xl':'96px',

    // Page-level (catalogue spread proportions)
    pagePaddingX:    'clamp(1.5rem, 5vw, 4rem)',
    pagePaddingY:    'clamp(2rem, 4vw, 3.5rem)',
    sectionGap:      'clamp(3rem, 6vw, 6rem)',
    columnGap:       '2rem',
  },

  // ─── BORDER RADIUS ────────────────────────────────────────────────────────

  borderRadius: {
    none:   '0px',
    sm:     '2px',
    md:     '4px',
    lg:     '8px',
    xl:     '12px',
    pill:   '9999px',
  },

  // ─── BORDERS ──────────────────────────────────────────────────────────────

  border: {
    subtle:  '1px solid #2e2e36',
    mid:     '1px solid #484858',
    strong:  '1px solid #888890',
    accent:  '1px solid #cc2222',
    gold:    '1px solid #d4a840',
    // Page header strip (top of inner pages)
    headerStrip: '8px solid #3a3a42',
  },

  // ─── SHADOWS ──────────────────────────────────────────────────────────────

  shadow: {
    // Guitar product image drop shadow (intense, dramatic)
    productImage: '0 8px 40px rgba(0,0,0,0.85), 0 2px 12px rgba(0,0,0,0.6)',
    // Elevated card / panel
    card:         '0 4px 24px rgba(0,0,0,0.7)',
    // Subtle lift
    subtle:       '0 2px 8px rgba(0,0,0,0.4)',
    // Glow accent (red)
    glowRed:      '0 0 24px rgba(204,34,34,0.4)',
    // Glow accent (gold)
    glowGold:     '0 0 24px rgba(212,168,64,0.35)',
  },

  // ─── EFFECTS — DISTRESSED TEXT ────────────────────────────────────────────
  // Applied via CSS classes in typography.css
  // These are the CSS property values to apply programmatically

  distressed: {
    // Model name display treatment — cracked/eroded letterforms
    // Uses a CSS filter + mix-blend-mode + texture overlay approach
    filterValue:     'contrast(1.1) brightness(0.95)',
    mixBlendMode:    'multiply' as const,
    // Ghost/emboss behind main heading (large, low-opacity duplicate)
    ghostOpacity:    '0.07',
    ghostScale:      '1.04',
    ghostColor:      '#c8c8cc',
  },

  // ─── Z-INDEX ──────────────────────────────────────────────────────────────

  zIndex: {
    base:    0,
    raised:  10,
    overlay: 20,
    modal:   30,
    nav:     40,
    tooltip: 50,
  },

} as const;

export type MaverickTokens = typeof tokens;
