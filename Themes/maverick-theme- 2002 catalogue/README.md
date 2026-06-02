# Maverick Guitars 2002 — Theme Package

A complete design skin for a Next.js website imitating the visual language of the **Maverick Guitars 2002 product catalogue**.

Covers: colour palette, typography, textures, layout patterns, CSS components, and a Tailwind config extension — all derived by analysing the 16-page catalogue scan.

---

## Package contents

```
maverick-theme/
  tokens.ts           ← TypeScript design token object (for inline styles)
  tailwind.config.ts  ← Tailwind theme extension (for class-based styles)
  globals.css         ← CSS custom properties (:root) + base reset + font import
  typography.css      ← Semantic type classes (headings, body, captions etc.)
  components.css      ← Reusable component patterns (product card, colour key etc.)
  crack-overlay.svg   ← SVG texture for distressed model-name text effect
  README.md           ← This file
```

---

## Installation

### 1. Copy the theme folder

Place the entire `maverick-theme/` folder somewhere in your project, e.g.:

```
src/
  theme/
    maverick-theme/
```

### 2. Install required fonts (via Google Fonts or next/font)

The theme uses four Google Fonts families. Either add the import already present in `globals.css`, or use `next/font/google` in your `layout.tsx`:

```ts
import { Dancing_Script, Bebas_Neue, Barlow_Condensed, Source_Sans_3 } from 'next/font/google';

const dancingScript = Dancing_Script({ subsets: ['latin'], weight: ['400', '700'] });
const bebasNeue     = Bebas_Neue({ subsets: ['latin'], weight: '400' });
const barlowCond    = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '700', '800'] });
const sourceSans    = Source_Sans_3({ subsets: ['latin'], weight: ['300', '400', '600', '700'] });
```

Then pass the `.variable` CSS vars into your `<html>` className, and update the `--font-*` variables in `globals.css` to use those variables.

### 3. Import CSS files in layout.tsx / _app.tsx

```ts
// app/layout.tsx (App Router)
import '@/theme/maverick-theme/globals.css';
import '@/theme/maverick-theme/typography.css';
import '@/theme/maverick-theme/components.css';
```

### 4. Merge Tailwind config

```ts
// tailwind.config.ts (your project's root config)
import maverickTheme from '@/theme/maverick-theme/tailwind.config';

const config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      ...maverickTheme.theme.extend,
    },
  },
};

export default config;
```

### 5. Copy texture asset

Copy `crack-overlay.svg` to your `public/` folder:

```
public/
  textures/
    crack-overlay.svg
```

---

## How to use it

### Pattern: Tailwind for structure, tokens for design values

```tsx
import { tokens } from '@/theme/maverick-theme/tokens';

// Layout via Tailwind, design values via tokens
<section
  className="mvk-section mvk-section--evolution lg:grid lg:grid-cols-2 gap-8 px-8 py-12"
  // no inline style needed — section bg handled by CSS class
>
  {/* Model heading */}
  <h2
    className="type-model-name type-model-name--ghost"
    data-text="F1"
    style={{ fontFamily: tokens.font.modelName }}
  >
    F1
  </h2>

  {/* Body copy */}
  <p
    className="type-body"
    style={{ maxWidth: '54ch' }}
  >
    The F1 was the birthplace of the Maverick electric guitar...
  </p>
</section>
```

### Model name with distressed effect

```tsx
<div className="distressed-text-wrap">
  <h2
    className="type-model-name"
    data-text="X-Treme"
    style={{ fontFamily: tokens.font.modelName }}
  >
    X-Treme
  </h2>
</div>
```

### Colour key table

```tsx
<div className="mvk-colour-key">
  <p className="mvk-colour-key__heading">Standard Colour Key</p>
  {colours.map(c => (
    <div className="mvk-colour-key__item" key={c.code}>
      <span className="mvk-colour-key__swatch" style={{ background: c.hex }} />
      <span className="mvk-colour-key__code">{c.code}</span>
      <span className="mvk-colour-key__name">{c.name}</span>
    </div>
  ))}
</div>
```

### Press quote

```tsx
<blockquote className="mvk-quote-block">
  <p className="mvk-quote-block__text">
    The action is the slickest of any guitar to arrive in this office in a long time.
  </p>
  <cite className="mvk-quote-block__attribution">Guitar Magazine — November 2001</cite>
</blockquote>
```

---

## Typography reference

| Class | Usage | Font | Size |
|---|---|---|---|
| `.type-wordmark` | Maverick logo script | Dancing Script | clamp(2–4rem) |
| `.type-wordmark--red` | Red interior logo variant | Dancing Script | clamp(2–4rem) |
| `.type-display` | Section headings ("THE ETHOS OF...") | Bebas Neue | clamp(3–6rem) |
| `.type-display--ghost` | Ghost emboss behind heading | Bebas Neue | same |
| `.type-model-name` | Guitar model names (F1, F2, Matrix...) | Barlow Condensed 800 | clamp(2.5–5rem) |
| `.type-series-sub` | "MAVERICK EVOLUTION" micro-label | Barlow Condensed 600 | 0.6875rem |
| `.type-body` | Catalogue body paragraphs | Source Sans 3 | 0.9375rem |
| `.type-spec-label` | "Fixed Bridge colour options:" | Source Sans 3 700 | 0.875rem |
| `.type-quote` | Press review quotes | Source Sans 3 300 italic | 0.875rem |
| `.type-colour-caption` | Guitar neck colour labels | Source Sans 3 | 0.75rem |
| `.type-artist-credit` | "NUMBER ONE SON", artist credits | Source Sans 3 700 | 0.75rem |

---

## Colour reference

| Token | Hex | Usage |
|---|---|---|
| `--color-bg-primary` | `#0a0a0c` | Cosmos Black — page background |
| `--color-bg-secondary` | `#1a1a1f` | Elevated surfaces, cards |
| `--color-bg-teal-cracked` | `#1a3840` | Evolution series pages |
| `--color-bg-green-cracked` | `#1e2e18` | Century series pages |
| `--color-bg-purple-cracked` | `#1e1e38` | Matrix/Streetfighter pages |
| `--color-bg-rust-cracked` | `#2a1510` | X-Treme/X1 pages |
| `--color-bg-blue-cracked` | `#151828` | Nemesis bass pages |
| `--color-text-primary` | `#e8e8e0` | Primary text |
| `--color-text-secondary` | `#c8c8cc` | Secondary/captions |
| `--color-maverick-red` | `#cc2222` | Brand red (logo, accents) |
| `--color-gold-chrome` | `#d4a840` | Hardware gold accent |

---

## The font question — graphical / display type

### What the catalogue uses

Three tiers of graphical type appear in the scans:

1. **The wordmark** — a custom hand-lettered script unique to Maverick. *Dancing Script* is the closest free match; if fidelity matters, consider commissioning an SVG recreation from the logo scans, or licensing *Pacifico* as a slightly bolder alternative.

2. **Section display headings** ("THE ETHOS OF EVOLUTION") — *Bebas Neue* is a near-perfect match. Free on Google Fonts.

3. **Model name display** ("F1", "Streetfighter", "X-Treme") — this is *Barlow Condensed ExtraBold* or similar, with a **cracked/eroded texture treatment** baked in at print. On the web this is reproduced via:
   - The `.distressed-text-wrap` CSS class (see `components.css`)
   - `crack-overlay.svg` as a `mix-blend-mode: multiply` overlay
   - Optionally: the SVG `<filter>` in `crack-overlay.svg` can be inlined directly into HTML for sharper results

### Improving distressed fidelity

If the CSS approach isn't close enough, a higher-fidelity method is to:
1. Render the model name in Figma/Illustrator using Barlow Condensed ExtraBold
2. Apply a displacement map or roughen effect
3. Export each model name as an SVG — the letterforms become paths and the texture is baked in
4. Use the SVG as an `<img>` or inline SVG component

This package includes everything needed for the CSS approach. SVG-path model name components can be added as a second phase.

---

## Design decisions documented

- **No light mode provided** — the catalogue is an entirely dark-background document. All colours are calibrated for dark backgrounds only.
- **Texture is approximate** — the catalogue's cracked-earth backgrounds are photographic. The SVG noise filter in this package is a programmatic approximation. For the closest match, source a high-resolution cracked mud/earth texture photograph and use it as a CSS `background-image` with the section tint applied via `mix-blend-mode: color`.
- **Column grid** — the catalogue uses an asymmetric 40/60 split (image left, text right) on product pages, with some pages reversed. The `mvk-product-card` component uses `1fr 1fr` by default; adjust with Tailwind's responsive column utilities.
- **Page number system** — pages 2–15 are numbered bottom-left (even) / bottom-right (odd) in muted text. Replicate with `.type-page-number`.
