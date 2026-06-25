# Herbalisti Brand System

Date: 2026-06-16

## Positioning

Herbalisti is a self-sovereign health intelligence brand: natural medicine and longevity research presented through a calm, high-technology interface.

The design direction is Star Trek clarity with Japanese Zen restraint. It should feel luminous, spacious, exacting, and contemporary. It should not feel rustic, dusty, occult, pharmaceutical, hospital-like, or low-tech.

Creative lock: Herbalisti is future-facing self-sovereign health intelligence. It can reference plants and natural medicine, but the experience should read as high-tech now: clean spatial rhythm, glass-light surfaces, precise data controls, subtle motion, and quiet confidence.

## Logo

Primary wordmark:

- Asset: `public/assets/herbalisti-logo.svg`
- Use for header, footer, review materials, and any first-level brand placement.
- The public logo is now a strong contemporary flowing wordmark in Titanium, with botanical line movement and no embedded tagline.
- Do not pair the wordmark with the previous separate icon in public UI.

App tile monogram:

- Asset: `public/assets/herbalisti-mark.svg`
- Use only where a square asset is technically required, such as favicon, compact app surfaces, social avatar crops, and small UI contexts.
- The app tile is typographic and Titanium-led, not the previous leaf/orbit icon.

Favicon:

- Asset: `public/favicon.svg`
- Uses the typographic monogram inside a warm-white rounded app tile.

## Colour

- Warm white: `#fbfaf6`
- Ink: `#0f1e21`
- Charcoal: `#23383b`
- Titanium: `#667b82`
- Glass blue: `#cfe8e7`
- Pale sage: `#a9cbb7`
- Chlorophyll: `#78a43a`
- Chlorophyll signal: `#b9d84b`

The palette should stay light and airy. Glass blue and sage are atmosphere; ink and titanium carry precision; chlorophyll is a signal accent, not a dominant wash.

## Typography

Current build uses performant system stacks:

- Display: `Avenir Next, Aptos Display, Segoe UI, system-ui, sans-serif`
- Body: `Aptos, Inter, Segoe UI, system-ui, sans-serif`

Later refinement can self-host a licensed geometric humanist sans if the brand needs tighter typographic control.

## Voice

The tone is clear, composed, intelligent, and empowering.

Use:

- "self-sovereign health intelligence"
- "public-source signals"
- "source transparency"
- "research interface"
- "personal agency"

Avoid:

- treatment promises
- miracle language
- anti-medical hostility
- hidden medical authority
- rustic apothecary nostalgia

## Motion

Motion should be subtle, continuous, and elegant:

- slow image drift
- soft scan lines
- data-grid movement
- manifest-driven Seedance loops behind hero/research sections after review

Motion should support attention, not compete with reading.

The public motion manifest is `/data/media-manifest.json`. Video slots stay disabled until the approved MP4 files exist in Herbalisti-owned storage, are recorded in provenance, and pass release verification.

## Launch Metadata

Current launch metadata is in `index.html` and includes:

- title and description
- canonical URL for `https://herbalisti.com/`
- Open Graph and Twitter image metadata
- theme colour
- web manifest

Verification:

- `npm run verify:brand`
