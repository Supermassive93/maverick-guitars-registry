# Maverick Guitars Registry — MD File Format Guide
# Source Extraction & Database Ingestion Standard
**Project:** Maverick Guitars Registry (maverickguitars.org)
**Stack:** Next.js + Supabase
**Purpose:** This document defines the exact format standard for all source material MD files produced for database ingestion. All new extractions must follow this standard precisely for consistency.

---

## OVERVIEW — What We Are Doing

We are extracting, annotating and converting primary and secondary source material about Maverick Guitars into structured Markdown files for ingestion into the Maverick Guitars Registry database.

Sources include:
- Magazine reviews and news articles (Total Guitar, Guitarist, Guitar Buyer, Guitar Magazine)
- Official Maverick catalogues and brochures (2001 brochure, 2002 catalogue, 2004 catalogue)
- Retail advertisements
- UK IPO registered design records
- First-hand qualitative assessments from instrument owner/researcher

---

## FILE NAMING CONVENTION

All files use lowercase with underscores. Format:

```
[publication]_[month/season]_[year]_[subject].md
```

Examples:
- `total_guitar_june_2006_maverick_f1.md`
- `guitarist_april_2001_maverick_f1_x1.md`
- `guitar_buyer_november_2001_maverick_f2_f3.md`
- `maverick_catalogue_2002.md`
- `maverick_brochure_2001.md`
- `ukipo_2096867_evolution_vt_system.md`
- `foxs_music_ad_guitarist_september_2002.md`

---

## STANDARD FILE HEADER

Every MD file must open with this header block:

```markdown
# [Article/Document Title]
**Source:** [Publication name]
**Issue:** [Month Year] or [Season Year]
**Pages:** [e.g. 28-30 (3 pages)] — omit if single page or non-paged document
**Article Type:** [Gear review / News article / Advertisement / Official catalogue / IPO record etc.]
**Author:** [Name] — omit if unknown or not applicable
**Products:** [Model name(s)] — omit if not applicable
**Price:** [£xxx] — omit if not applicable
**Rating:** [Stars + badge type] — omit if not applicable
```

---

## PAGE STRUCTURE

### For multi-page articles:
Use a level 2 header for each page:
```markdown
## PAGE 1 (p.28)
## PAGE 2 (p.29)
```

### For catalogues:
Use a level 2 header per page/section:
```markdown
## PAGE 3 — F-1 (Evolution Series)
## PAGE 7 — Matrix (Evolution Series)
## PAGE 16 — Back Cover
```

### For IPO records:
Use sections:
```markdown
## SECTION 1 — GOV.UK Overview Record
## SECTION 2 — Application Image Sheets
```

---

## TEXT ANNOTATION FORMAT

All extracted text must be annotated with its position and context using this format:

```markdown
### [ANNOTATION — position description]

Text content here
```

### Annotation types used:

| Annotation | Usage |
|---|---|
| `[SECTION HEADER — position]` | Magazine section labels, article headers |
| `[HEADLINE — description]` | Main article titles |
| `[STANDFIRST]` | Introductory paragraph below headline |
| `[BODY COPY — column description]` | Main article text |
| `[SIDEBAR: NAME — position, colour box]` | Boxed information panels |
| `[SPECIFICATION TABLE]` | Spec boxes — always render as markdown table |
| `[IMAGE CAPTION — position description]` | Photo captions with leader line descriptions |
| `[CALLOUT — position, leader line target]` | Callout text with arrows/lines to image areas |
| `[PRICE TAG — position, description]` | Price badges |
| `[VERDICT — position]` | FOR/AGAINST verdict lines |
| `[RATING — position]` | Star ratings |
| `[PULL QUOTE — position, style]` | Large display quotes |
| `[FOOTER — position]` | Page numbers and publication info |
| `[LEGAL SMALL PRINT — position]` | Legal text, registered design numbers |
| `[LOGO — position, style]` | Logo descriptions |
| `[VISUAL DESCRIPTION]` | Description of images where no text present |
| `[ARTIST CREDIT — position]` | Band/artist endorser credits |
| `[PHOTO CAPTION — position]` | Portrait/person photo captions |

---

## SPECIFICATION TABLES

All spec boxes must be rendered as markdown tables:

```markdown
| Field | Detail |
|---|---|
| **Body** | 2 x Piece Centre Joint Basswood |
| **Neck** | One Piece carved Canadian Maple |
| **Scale Length** | 25 Inches |
```

Field names in bold. Never use bullet points for spec data.

---

## SIDEBAR BOXES

Named sidebars use this format:

```markdown
### [SIDEBAR: WHO'S IT FOR? — Yellow box]

**WHO'S IT FOR?**
Content text here
```

```markdown
### [SIDEBAR: INFORMATION — Yellow box]

**INFORMATION**

| Field | Detail |
|---|---|
```

```markdown
### [SIDEBAR: ALTERNATIVELY — Yellow box]

**ALTERNATIVELY**
- Model name — £price
- Model name — £price
```

---

## DATABASE METADATA SECTION

Every file must end with a `## DATABASE METADATA` section. This is the primary structured data block for ingestion.

### For magazine reviews:

```markdown
## DATABASE METADATA

| Field | Value |
|---|---|
| **Document Type** | Gear review |
| **Publication** | [Name] |
| **Issue** | [Month Year] |
| **Pages** | [range] |
| **Author** | [Name] |
| **Product** | [Model] |
| **Price** | £[xxx] |
| **Rating** | [x/5 — badge type] |
| **Origin** | Korea |
| **Body** | [spec] |
| **Neck** | [spec] |
| **Fingerboard** | [spec] |
| **Frets** | [number] |
| **Pickups** | [spec] |
| **Controls** | [spec] |
| **Hardware** | [spec] |
| **Bridge** | [spec] |
| **Left-handers** | Yes/No (£price if yes) |
| **Colours** | [list] |
| **Contact** | [details] |
| **For** | [verdict text] |
| **Against** | [verdict text] |
```

### For catalogues:

```markdown
## DATABASE METADATA

| Field | Value |
|---|---|
| **Document Type** | Official product catalogue |
| **Publisher** | Maverick Guitars |
| **Year** | [year] |
| **Total Pages** | [number] |
| **Series Featured** | [list] |
| **Designer** | Trevor Wilkinson |
| **Registered Design — [name]** | No. [number] |
| **Website** | [url] |
| **Address** | [full address] |

### Complete Model Index

[Table of all models with full specs]

### Colour Code Reference

[Table of all colour codes]
```

### For IPO records:

```markdown
## DATABASE METADATA

| Field | Value |
|---|---|
| **Document type** | UK IPO Official Registered Design Record |
| **Design number** | [number] |
| **Design name** | [name] |
| **Applicant(s)** | [name(s)] |
| **Status** | Expired |
| **Registration date** | [date] |
| **Grant date** | [date] |
| **Publication date** | [date] |
| **Expiry date** | [date] |
| **Duration** | [x years — note if not renewed] |
| **Indication of product** | [text] |
| **Locarno Class** | [class] |
| **Statement of Novelty** | [text] |
| **Protected element** | [description] |

### Key Notes

[Table of analytical observations]
```

---

## GEN 1 vs GEN 2 TRACKING

Where a source reveals generational differences, include a `### Gen 2 Indicators` table:

```markdown
### Gen 2 Indicators Confirmed

| Feature | Gen 1 (2001-2002) | Gen 2 (2004+) | Source |
|---|---|---|---|
| **Neck construction** | 3-piece maple/bubinga laminate | 1-piece kiln-aged maple | [source] |
| **Left-handed option** | Yes (£529) | No | [source] |
```

---

## NOTES AND FLAGS

Use blockquote format for important editorial notes:

```markdown
> **Note:** Text of note here.
```

Use the editorial note style for cross-references and context:

```markdown
> **Editorial note:** The departure of left-handed options between the 2002 catalogue
> (LH available at £529) and this 2005 review (LH: No) is a further indicator of
> range rationalisation consistent with the Gen 2 transition.
```

---

## RIVALS / ALTERNATIVES TABLES

Always render as markdown tables:

```markdown
### Rivals Listed

| Model | Price |
|---|---|
| Jackson DX10D | from £329 |
| Ltd by ESP M-100 | £485 |
```

---

## ARTIST / ENDORSER TABLES

```markdown
### Artist Endorsers Featured

| Artist | Band / Context |
|---|---|
| Jim Davies | Pitchshifter / The Prodigy |
| Neil Brocklebank | Maverick ambassador |
```

---

## PRESS QUOTES TABLES

```markdown
### Press Quotes

| Publication | Date | Quote Summary |
|---|---|---|
| Guitarist | October 2001 | "F1 is an utter treat to play..." |
```

---

## COLOUR CODE TABLES

```markdown
### Colour Code Reference

| Code | Colour |
|---|---|
| CBK | Cosmos Black |
| LB | Lunar Blue |
```

---

## IMPORTANT RULES

1. **Never use bullet points for spec data** — always use tables
2. **Always annotate position** — every text element must have a positional annotation
3. **Preserve original spelling** — including catalogue typos (e.g. "Metalic" not "Metallic")
4. **Flag corrections** — if a number or name is corrected vs source, note it in a blockquote
5. **Every file needs DATABASE METADATA** — this is non-negotiable for ingestion
6. **Gen 1/Gen 2 flags** — always note which generation is being documented
7. **Registered design numbers** — always include all three when present in legal small print: 2096867, 3001705, 3001706
8. **Left-hander availability** — always note explicitly as this is a tracked field
9. **Address changes** — always note address vs previous sources as this tracks company history
10. **Colour codes** — always use the standardised code format (CBK, LB, GM etc.)

---

## CONTEXT — The Project

The Maverick Guitars Registry (maverickguitars.org) is a community database and archive documenting the full history of Maverick Guitars Ltd. (UK, 1997-2007).

**Key facts:**
- Company founded 1997 by Barry Stock and Mark James with Trevor Wilkinson
- First guitars to market: late 2000
- Peak range: 2002 (15+ models across 4 series)
- Gen 1 characteristics: 3-piece maple/bubinga neck, left-hand options, Tetbury address
- Gen 2 characteristics: 1-piece maple neck, no left-hand options, Grimsby address
- Company closed: September 2007
- All three registered designs expired: 2007 (3001705, 3001706) and 2010 (2096867)

**Known registered designs:**
- 2096867 — Evolution V&T System (filed Oct 2000, applicant: Barry George Stock sole)
- 3001705 — Matrix Guitar Neck (filed Mar 2002, joint: Stock + James)
- 3001706 — Evolution Single Volume System (filed Mar 2002, joint: Stock + James)

**Published source files already in database:**
- maverick_f1_total_guitar_june2006.md
- maverick_additional_sources.md
- maverick_total_guitar_september_2007.md
- foxs_music_ad_guitarist_september_2002.md
- guitarist_february_2001_news_page.md
- guitar_buyer_november_2001_maverick_f2_f3.md
- guitarist_april_2001_maverick_f1_x1.md
- guitarist_october_2001_maverick_f1.md
- guitarist_winter_2001_maverick_sf3_xtreme.md
- maverick_brochure_2001.md
- maverick_catalogue_2002.md
- maverick_catalogue_2004.md
- total_guitar_april_2005_maverick_f1.md
- total_guitar_summer_2005_maverick_species1_x1.md
- ukipo_2096867_evolution_vt_system.md
- ukipo_3001705_matrix_neck.md
- ukipo_3001706_evolution_single_volume.md
