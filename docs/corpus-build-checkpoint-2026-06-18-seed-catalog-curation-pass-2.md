# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Expand the first public herb shortlist without lowering curation quality, then keep the retrieval archive in sync with that broader seed set.

This pass did not add new books. It improved the semantic archive already built from the rights-cleared local corpus.

## What changed

### 1. A focused curation pass promoted 13 more strong herb families

Promoted from the review lane into `seed-ready`:

- `Aconite`
- `Boneset`
- `Buchu`
- `Comfrey`
- `Horehound`
- `Hyssop`
- `Mullein`
- `Plantain (Plantago)`
- `Rue`
- `Spearmint`
- `Tansy`
- `Witch Hazel`
- `Yarrow`

These were chosen because they were already strongly represented across the historical corpus and behaved like clear medicinal plant families rather than generic descriptors or OCR noise.

### 2. Additional naming variants were folded into the right canonical families

Merged into existing seed families:

- `Bay-Berry` -> `Bayberry`
- `Buck Thorn` -> `Buckthorn`
- `Flaxseed` -> `Linseed`
- `Flax-Seed` -> `Linseed`
- `Cayenne` -> `Capsicum`
- `Cayenne-pepper` -> `Capsicum`
- `Digitalis` -> `Foxglove`
- `Thorn-apple` -> `Stramonium`

This keeps public retrieval cleaner and preserves the historical witnesses without fragmenting them into near-duplicate herb pages.

### 3. Supporting material was kept in the right semantic lane

- `Catechu` was retained as `supporting`
- supporting class: `derived-substance`

That keeps the archive honest about the difference between a public-facing herb family and a historical preparation or extracted substance.

### 4. The herb-profile archive was resynchronized to the expanded shortlist

After the curation pass, `scripts/corpus/build-herb-profiles.mjs` was rerun and verified.

The result:

- all 125 current seed-ready families now have profile records
- all 13 newly promoted families now appear in `corpus/derived/herb-profiles/index.csv`
- the profile summary is back in sync with the current seed catalog

Important note:

The earlier 112-profile reading during review was a stale build artifact, not a logic defect in the profile builder.

## Current semantic totals after this pass

Corpus totals remain:

- 2,720 registered works
- 633 locally acquired and chunked works
- 2,086 additional discovered works still queued
- 1 failed work
- 855,570 total chunk records
- 1,002,890 total paragraph records

Seed-catalog layer after the curation rebuild:

- 47,388 accepted plant families as input
- 39 curator decision rows applied
- 8 aliased catalog families
- 125 seed-ready families
- 82 supporting families
- 37,842 review families
- 9,329 excluded noise families

Herb-profile layer after the rebuild:

- 125 herb profiles
- 125 profiles with preparation signals
- 125 profiles with condition signals
- 125 profiles with caution signals
- 125 profiles with plant-part signals
- 59,323 matched profile chunks in the builder pass

## Verified new profile coverage

Verified promoted profiles now present with matched chunk coverage:

- `Aconite` - 293 matched chunks across 85 works
- `Boneset` - 152 matched chunks across 49 works
- `Buchu` - 125 matched chunks across 60 works
- `Comfrey` - 110 matched chunks across 64 works
- `Horehound` - 70 matched chunks across 62 works
- `Hyssop` - 102 matched chunks across 81 works
- `Mullein` - 95 matched chunks across 43 works
- `Plantain (Plantago)` - 187 matched chunks across 109 works
- `Rue` - 238 matched chunks across 117 works
- `Spearmint` - 217 matched chunks across 76 works
- `Tansy` - 140 matched chunks across 110 works
- `Witch Hazel` - 97 matched chunks across 45 works
- `Yarrow` - 67 matched chunks across 32 works

## Why this matters

This was a real archive-quality improvement because it:

1. widened the first public herb layer without weakening provenance
2. reduced duplicate naming across historically variable sources
3. kept substances and descriptors out of the wrong public lane
4. gave the future search and chat layer 13 more stable herb envelopes immediately

## Files updated or regenerated

- `corpus/review/seed-catalog-decisions.csv`
- `corpus/derived/seed-catalog/`
- `corpus/derived/herb-profiles/`
- `corpus/exports/seed-catalog-summary.json`
- `corpus/exports/herb-profile-summary.json`

## Recommended next move

1. continue another curated review pass through the highest-signal `candidate-specific-family` queue
2. keep broadening the local book corpus from official no-key lanes so the herb profiles deepen automatically
3. begin defining a public-facing herb page contract that can read directly from the profile archive without hand-copying content
