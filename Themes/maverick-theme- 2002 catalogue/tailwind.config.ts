import type { Config } from 'tailwindcss';

/**
 * Maverick Guitars 2002 — Tailwind Config Extension
 *
 * Extends defaultTheme with all brand tokens.
 * Colours, fonts, type scale, spacing, shadows, and border-radius
 * all draw from the same source as tokens.ts via CSS custom properties.
 *
 * Usage:
 *   import maverickConfig from './theme/tailwind.config';
 *   export default { ...maverickConfig, content: [...] };
 *
 * Or merge into your existing config:
 *   theme: { extend: { ...maverickConfig.theme.extend } }
 */

const maverickConfig: Config = {
  content: [],
  theme: {
    extend: {

      // ── COLOURS ─────────────────────────────────────────────────────────
      colors: {
        // Backgrounds
        'bg-primary':        'var(--color-bg-primary)',
        'bg-secondary':      'var(--color-bg-secondary)',
        'bg-tertiary':       'var(--color-bg-tertiary)',

        // Section backgrounds (cracked-earth tints per series)
        'bg-teal-cracked':   'var(--color-bg-teal-cracked)',
        'bg-green-cracked':  'var(--color-bg-green-cracked)',
        'bg-purple-cracked': 'var(--color-bg-purple-cracked)',
        'bg-rust-cracked':   'var(--color-bg-rust-cracked)',
        'bg-blue-cracked':   'var(--color-bg-blue-cracked)',

        // Text
        'text-primary':      'var(--color-text-primary)',
        'text-secondary':    'var(--color-text-secondary)',
        'text-muted':        'var(--color-text-muted)',
        'text-inverted':     'var(--color-text-inverted)',

        // Brand accents
        'maverick-red':      'var(--color-maverick-red)',
        'gold-chrome':       'var(--color-gold-chrome)',
        'ghost-white':       'var(--color-ghost-white)',

        // Borders
        'border-subtle':     'var(--color-border-subtle)',
        'border-mid':        'var(--color-border-mid)',
        'border-strong':     'var(--color-border-strong)',

        // Colour key swatches
        'tribal-red':        '#cc2222',
        'lunar-blue':        '#1a3a8c',
        'dayglow':           '#d4e020',
        'cosmos-black':      '#0a0a0c',
        'desert-storm':      '#c8b870',
        'fireburst':         '#cc4a10',
        'gun-metal':         '#4a4a54',
        'tobacco-sunburst':  '#7a3a10',
        'aquamarine':        '#20a090',
        'ultraviolet':       '#5a20cc',
        'natural':           '#d4b878',
      },

      // ── FONTS ───────────────────────────────────────────────────────────
      fontFamily: {
        script:  ["'Dancing Script'", 'Pacifico', 'cursive'],
        display: ["'Bebas Neue'", "'Barlow Condensed'", 'Oswald', 'sans-serif'],
        model:   ["'Barlow Condensed'", 'Oswald', 'sans-serif'],
        series:  ["'Barlow Condensed'", 'Oswald', 'sans-serif'],
        body:    ["'Source Sans 3'", "'Nunito Sans'", "'Myriad Pro'", 'sans-serif'],
      },

      // ── FONT SIZES ──────────────────────────────────────────────────────
      fontSize: {
        'hero-xl':    ['clamp(3rem, 8vw, 6rem)',    { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'hero-lg':    ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'model-name': ['clamp(2rem, 5vw, 3.5rem)',  { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'series-label': ['0.75rem',  { lineHeight: '1', letterSpacing: '0.08em' }],
        'series-name':  ['0.875rem', { lineHeight: '1', letterSpacing: '0.08em' }],
        'body-lg':    ['1.0625rem', { lineHeight: '1.7' }],
        'body-sm':    ['0.8125rem', { lineHeight: '1.5' }],
        'micro':      ['0.6875rem', { lineHeight: '1.4' }],
      },

      // ── FONT WEIGHTS ────────────────────────────────────────────────────
      fontWeight: {
        light:      '300',
        regular:    '400',
        medium:     '500',
        semibold:   '600',
        bold:       '700',
        extrabold:  '800',
        black:      '900',
      },

      // ── LETTER SPACING ──────────────────────────────────────────────────
      letterSpacing: {
        tight:      '-0.02em',
        display:    '-0.01em',
        normal:     '0em',
        wide:       '0.08em',
        'extra-wide':'0.15em',
      },

      // ── SPACING EXTENSIONS ──────────────────────────────────────────────
      spacing: {
        '18':  '4.5rem',
        '22':  '5.5rem',
        '26':  '6.5rem',
        '30':  '7.5rem',
        '34':  '8.5rem',
      },

      // ── BORDER RADIUS ───────────────────────────────────────────────────
      borderRadius: {
        none: '0px',
        sm:   '2px',
        md:   '4px',
        lg:   '8px',
        xl:   '12px',
        pill: '9999px',
      },

      // ── BOX SHADOWS ─────────────────────────────────────────────────────
      boxShadow: {
        'product':    '0 8px 40px rgba(0,0,0,0.85), 0 2px 12px rgba(0,0,0,0.6)',
        'card':       '0 4px 24px rgba(0,0,0,0.7)',
        'subtle':     '0 2px 8px rgba(0,0,0,0.4)',
        'glow-red':   '0 0 24px rgba(204,34,34,0.4)',
        'glow-gold':  '0 0 24px rgba(212,168,64,0.35)',
      },

      // ── BACKGROUNDS (texture-aware utilities) ───────────────────────────
      backgroundImage: {
        // Cracked earth texture (SVG data URI — generated in globals.css)
        // Use bg-cracked-teal, bg-cracked-green etc. combined with
        // the section bg colours above
        'crack-overlay':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
        // Diagonal hash rule (used for colour-key table cells)
        'diagonal-rule':
          "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
      },

      // ── SCREENS (no overrides — use Tailwind defaults) ──────────────────
      // sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px

    },
  },
  plugins: [],
};

export default maverickConfig;
