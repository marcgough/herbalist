# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Deepen the Herbalisti archive with a more deliberate botany and pharmacopoeia acquisition slice while keeping the seed catalog trustworthy as the corpus grows.

## What changed

### 1. Frontier profiles can now steer topic and title bias directly

Updated:

- `scripts/corpus/run-frontier-batch.mjs`
- `corpus/review/frontier-profiles/README.md`

New frontier profile support now includes:

- `excludeTitlePhrases`
- `topicBoosts`
- `clusterBoosts`
- `titleScoreAdjustments`

This matters because we can now push the frontier toward specific knowledge lanes such as botany, medicinal plants, pharmacopoeia, and reference works without rebuilding a new hardcoded exclusion list every time.

### 2. Added a reusable deepening profile for the herb-reference spine

Added:

- `corpus/review/frontier-profiles/botany-pharmacopoeia-deepening-2026-06-18.json`

This profile biases selection toward:

- botany
- medicinal plants
- materia medica
- pharmacopoeia
- reference works

It also suppresses:

- saturated family-physician repeats
- fringe domestic-medicine outliers
- lecture and report shaped strays
- selected foreign-language or low-value witnesses that are not strong first-pass retrieval material

### 3. A targeted live batch added 18 more rights-cleared works

The profile was used to acquire a tighter book-like slice:

- `8` NLM works
- `10` Wellcome works
- `0` failures in either lane

Selected NLM works:

- `A treatise on the materia medica`
- `A guide to the organic drugs of the United States pharmacopoeia 1890`
- `First lessons in botany and vegetable physiology`
- `The pharmacopoeia of the Massachusetts Medical Society`
- `Materia medica of American provings`
- `Collections for an essay towards a materia medica of the United-States`
- `The practitioner's pharmacopoeia and universal formulary`
- `A pocket conspectus of the London and Edinburgh pharmacopoeias`

Selected Wellcome works:

- `A conspectus of the pharmacopoeias of the London, Edinburgh, and Dublin, Colleges of Physicians`
- `The pharmacopoeias of the London, Edinburgh, and Dublin colleges, translated into English`
- `Thomson's conspectus`
- `Additions to the British pharmacopoeia of 1867`
- `Cooley's cyclopaedia of practical receipts`
- `The Eclectic and general dispensatory`
- `The English flora`
- `Companion to the last edition of the British pharmacopoeia`
- `Dr. Pereira's Elements of materia medica and therapeutics`
- `Experiments and observations on the cortex salicis latifoliae`

## Current totals after this pass

Corpus totals now:

- `2,720` registered works
- `846` locally acquired and chunked works
- `1,873` discovered works still queued
- `1` failed work
- `1,094,578` total chunk records
- `1,262,004` total paragraph records

Collection mix now:

- `27` Project Gutenberg works
- `284` NLM Digital Collections works
- `535` Wellcome Collection works

Net change during this pass:

- `+18` chunked works
- `-18` discovered works
- `+22,446` chunk records
- `+25,845` paragraph records

Local corpus footprint now:

- `7.38 GB`
- `7,319` files

## Semantic-layer totals after the rebuild

- frontier families: `1,242`
- uncovered families: `1,156`
- depth families: `204`
- herb candidates: `62,920`
- evidence signals: `849,362`
- graph nodes: `62,988`
- graph edges: `362,802`
- total term families: `61,922`
- accepted families: `58,674`
- accepted plant families: `58,316`
- seed-ready families: `125`
- supporting families: `111`
- herb profiles: `125`

## What the catalog audit proved

The seed catalog remained stable after the deeper pharmacopoeia and botany intake.

Verified:

- seed-ready families remain `125`
- automatic high-confidence seed terms remain `103`
- missing high-confidence seed terms remain `[]`
- manual `seed-ready` decisions present: `22 / 22`
- manual `supporting` decisions present: `7 / 7`
- unresolved alias targets: `0`

The cleanup for punctuation-tainted display names is also now visible in the export:

- `Carraway`
- `Prune`

## Verification

Verified:

- `run-frontier-batch.mjs` passes `node --check`
- the new profile dry run selected a stronger botany and pharmacopoeia slice than the previous broadening profile
- the NLM explicit-ID batch processed `8 / 8` requested works with `0` failures
- the Wellcome explicit-ID batch processed `10 / 10` requested works with `0` failures
- `corpus:reconcile` reported `updatedCount: 0` and `missingRegistryRowCount: 0`
- the derived rebuild completed through:
  - edition families
  - acquisition frontier
  - corpus evidence
  - term families
  - seed catalog
  - herb profiles
  - seed-catalog curation audit
  - corpus status

## Why this matters

This pass did two useful things at once:

1. it grew the archive with a more reference-heavy slice instead of another domestic-medicine-heavy expansion
2. it gave the frontier tooling a reusable way to express editorial intent directly

That makes the next collection waves cheaper to steer and more aligned with the eventual Herbalisti retrieval experience.

## Files updated or added

Updated project notes:

- `docs/knowledge-corpus-first-plan.md`

Updated scripts:

- `scripts/corpus/run-frontier-batch.mjs`

Updated review/config files:

- `corpus/review/frontier-profiles/README.md`

Added review/config files:

- `corpus/review/frontier-profiles/botany-pharmacopoeia-deepening-2026-06-18.json`

Updated corpus and exports:

- `corpus/registry/works.csv`
- `corpus/exports/nlm-corpus-summary.json`
- `corpus/exports/wellcome-corpus-summary.json`
- `corpus/exports/edition-family-summary.json`
- `corpus/exports/acquisition-frontier-summary.json`
- `corpus/exports/corpus-evidence-summary.json`
- `corpus/exports/term-family-summary.json`
- `corpus/exports/seed-catalog-summary.json`
- `corpus/exports/herb-profile-summary.json`
- `corpus/exports/seed-catalog-curation-audit.json`
- `corpus/derived/`

## Recommended next move

1. continue profile-driven intake with one more botany and medicinal-plants-weighted slice, but trim thin pharmacopoeia addenda and short report witnesses more aggressively
2. add a first-class `minimumChunkCount` or `minimumParagraphCount` review heuristic so thin pamphlets can be flagged automatically after intake
3. begin a canonical work-family review pass on the highest-volume repeated pharmacopoeia and domestic-medicine families so later retrieval can collapse duplicate editions more gracefully
