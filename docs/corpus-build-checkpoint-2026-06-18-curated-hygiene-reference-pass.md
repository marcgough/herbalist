# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Keep the rights-cleared Herbalisti corpus growing with practical, English-accessible books while avoiding another long Wellcome batch stall.

This pass used a smaller curated acquisition slice focused on hygiene, household medicine, and practical materia-medica references, then rebuilt the semantic archive from committed local state.

## What changed

### 1. A curated NLM slice landed cleanly

Committed NLM works:

- `nlm-61560590R` - `Essays on some of the most important articles of the materia medica`
- `nlm-101278499` - `Manual of naval hygiene and sanitation`
- `nlm-63560880R` - `A handbook of family medicine and hygiene`
- `nlm-63610890R` - `A friend in need : a household guide in health and in disease`

Result:

- `4` additional NLM works acquired and chunked
- no new NLM failures

Manifest-backed counts:

- `nlm-61560590R`: `14` chunks, `33` paragraphs
- `nlm-101278499`: `913` chunks, `915` paragraphs
- `nlm-63560880R`: `2,329` chunks, `2,683` paragraphs
- `nlm-63610890R`: `1,514` chunks, `1,515` paragraphs

### 2. A multi-work Wellcome slice exposed a title-specific stall

Initial attempted Wellcome slice:

- `wellcome-kz4hv4c5`
- `wellcome-sybxj2dc`
- `wellcome-hfs9jey3`
- `wellcome-x7z98bw6`

What happened:

- the 4-work Wellcome exact-ID batch exceeded a 10-minute shell window
- only `wellcome-kz4hv4c5` showed raw acquisition artifacts on disk
- no registry rows were promoted to `chunked` from that stalled worker

Observed partial state for the outlier:

- `wellcome-kz4hv4c5`
- raw artifacts staged:
  - `source-manifest.json`
  - `source-presentation.json`
  - `source-text-b21996556.zip`

Operational response:

- the stuck Wellcome worker was stopped cleanly
- the registry lock was cleared
- the remaining lighter Wellcome works were retried one-by-one

### 3. Four lighter Wellcome hygiene titles then processed cleanly

Committed Wellcome works:

- `wellcome-hfs9jey3` - `Home hygiene`
- `wellcome-sybxj2dc` - `Healthy life and healthy dwellings`
- `wellcome-x7z98bw6` - `The elements of sanitary science`
- `wellcome-ae8q5bxn` - `An elementary textbook of hygiene`

Result:

- `4` additional Wellcome works acquired and chunked
- all four used `wellcome_text_api`
- no new Wellcome failures

Manifest-backed counts:

- `wellcome-hfs9jey3`: `340` chunks, `343` paragraphs
- `wellcome-sybxj2dc`: `711` chunks, `732` paragraphs
- `wellcome-x7z98bw6`: `764` chunks, `772` paragraphs
- `wellcome-ae8q5bxn`: `476` chunks, `476` paragraphs

### 4. The archive was rebuilt from committed state

After the acquisitions, the derived layers were refreshed with:

- `reconcile-registry-from-manifests.mjs`
- `build-edition-families.mjs`
- `build-acquisition-frontier.mjs`
- `build-corpus-evidence.mjs`
- `build-thin-work-review.mjs`
- `build-term-families.mjs`
- `build-seed-catalog.mjs`
- `build-herb-profiles.mjs`
- `build-seed-review-priority.mjs`
- `report-status.mjs`

## Current corpus totals after rebuild

- `2,720` registered works
- `976` locally acquired and chunked works
- `1,743` discovered works still queued
- `1` failed work
- `1,188,812` total chunk records
- `1,370,064` total paragraph records

Current source mix:

- `27` Project Gutenberg works
- `631` Wellcome Collection works
- `318` NLM Digital Collections works

Current local footprint:

- `8.212 GB`
- `8,399` files

Net change relative to the prior checkpoint:

- `+8` chunked works
- `-8` discovered works
- `+7,061` chunk records
- `+7,469` paragraph records
- `+67` files
- about `+40.82 MB`

## Current semantic-archive totals after rebuild

### Acquisition frontier

- `1,144` actionable frontier title families
- `1,052` uncovered families
- `212` depth families
- `0` failed-only families

### Evidence layer

- `976` chunked works represented
- `923,162` chunk-signal records
- `67,284` herb candidates
- `4,259` high-confidence herb candidates
- `17,979` medium-confidence herb candidates
- `45,046` low-confidence herb candidates
- `67,352` graph nodes
- `389,749` graph edges

### Term-family layer

- `66,216` canonical families
- `62,775` accepted families
- `62,407` accepted plant families
- `368` accepted broader materia-medica families
- `31` review families
- `3,410` rejected families

### Seed-catalog layer

- `124` seed-ready families
- `120` supporting families
- `50,025` review families
- `12,128` excluded families

### Herb-profile layer

- `124` herb profiles
- `84,352` matched chunks

### Seed-review-priority layer

- `67` promotion candidates
- `24` identity-review candidates
- `46,530` secondary candidates
- `3,404` deprioritized families

## What this means operationally

1. Curated exact-ID intake is still a strong way to grow the archive when the raw frontier contains too many low-value domestic-medicine repeats.
2. The Wellcome lane is not broadly blocked, but some individual works remain too heavy for grouped exact-ID runs.
3. The current safe pattern for lighter Wellcome hygiene and reference titles is single-work execution with a clean lock between runs.
4. The English-practical intake profile has now been tightened again to suppress the specific committee-report, opening-lecture, Latin-reference, and grouped-run outliers exposed in this pass.

## Recommended next move

1. Keep broadening with curated NLM and Wellcome exact-ID slices biased toward practical hygiene, household medicine, materia medica, and herbal reference works.
2. Add a specific retry lane or timeout-aware handling for heavy Wellcome outliers such as `wellcome-kz4hv4c5`.
3. Validate the tightened English-practical selector with the next dry run so the default frontier moves further away from saturated family-physician and fringe domestic-medicine survivors.
4. Begin a focused promotion pass from `promotion-candidates.csv` once another one or two curated acquisition slices have landed.
