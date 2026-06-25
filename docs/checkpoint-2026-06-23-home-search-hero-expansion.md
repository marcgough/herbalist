# Herbalisti checkpoint - 2026-06-23 - home search hero expansion

## Goal

Make the home hero behave like the actual front door of Herbalisti rather than a herb-only prompt.

The desired behavior for the primary home interaction is now:

- herb queries still return the public-domain herbal retrieval response
- broader research queries surface the wider archive
- the home hero can lead directly into the full research console with the same query carried through

## What changed

### `src/App.tsx`

- expanded the hero interaction from herbal chat only into a combined archive search flow
- home search now loads:
  - unified search groups from `/api/search` with fallback to the local indexed cache
  - herbal retrieval from `/api/herbal-chat` with fallback to the local herbal index
- herb queries keep the detailed herbal response and source citations
- broader queries now generate a concise archive-level response and show a preview of matching result groups
- added a direct handoff from the hero preview into `/search?q=...`

### `src/App.css`

- added styling for the new home search preview area
- kept the panel visually aligned to the calm high-tech hero treatment
- added responsive behavior so the preview stacks cleanly on smaller screens

## Verified

- `npm run lint`: passed
- `npm run build`: passed

Browser verification against the local preview:

1. `ginger`
   - home hero returns a detailed herbal response
   - preview groups appear for Herbs, Remedies, and Notes
   - the herb-specific retrieval path remains intact

2. `CRISPR`
   - home hero no longer dead-ends in the herb index
   - it returns an archive-level response describing indexed results
   - preview groups surface Signals matches

3. `Open research console`
   - clicking from the hero preview navigates to `/search?q=CRISPR`
   - the search console input remains hydrated with `CRISPR`

## Result

The home page now behaves more like a true search-first entry point for Herbalisti: calm, compact, and useful across herbs, books, source notes, and independent signals.
