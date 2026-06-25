# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Add a canonical term layer above the raw corpus evidence output so the Herbalisti archive becomes more retrieval-ready without losing provenance.

## What was added

A new derived layer now sits between raw extraction and any later search or herb-profile assembly:

- raw evidence in `corpus/derived/evidence/`
- canonical term grouping in `corpus/derived/term-families/`

This keeps the archive faithful to source passages while making it easier to work with meaningful terms instead of every OCR fragment and lexical variant as if it were equally valid.

## New outputs

- `corpus/derived/term-families/families.csv`
- `corpus/derived/term-families/memberships.csv`
- `corpus/derived/term-families/review-queue.csv`
- `corpus/derived/term-families/accepted-families.csv`
- `corpus/derived/term-families/accepted-plant-families.csv`
- `corpus/derived/term-families/accepted-materia-medica-families.csv`
- `corpus/derived/term-families/README.md`
- `corpus/exports/term-family-summary.json`

## Current term-family totals

- 34,508 canonical families
- 32,474 accepted families
- 32,363 accepted plant-like families
- 111 accepted broader materia medica families
- 30 review families
- 2,004 rejected families
- 34,974 raw term members processed

## What the layer is already doing well

It is collapsing obvious lexical variants into cleaner canonical families. Useful examples from the current run:

- `camomile`, `chamomile`, `camomile flowers`, `chamomile flowers`
- `lemon`, `lemons`
- `rose`, `roses`
- `licorice`, `liquorice`
- `elder`, `elder flower`, `elder flowers`

It is also separating obvious noise or generic fragments from more useful term families. Examples now routed to review or rejection include:

- `green`
- `long`
- `watery`
- `other`
- `four`
- `herb`
- `thefe`

## Why this matters

The corpus is now closer to a Corpus Memory semantic archive in practice:

- raw passages remain intact
- extracted terms remain source-linked
- canonical families provide a cleaner semantic handle for retrieval
- noisy terms can be inspected without polluting the main layer

This is the right shape for later work on:

- herb database assembly
- evidence-grounded search
- source-linked chat retrieval
- human review queues for risky, obsolete, or low-quality material

## Current limitation

The term-family layer is a first canonical pass, not a final botanical authority layer.

What still needs doing:

1. synonym and historical-spelling families beyond the current lexical rules
2. stronger OCR-noise suppression for lower-frequency fragments
3. a clearer split between plant terms and broader materia medica substances
4. later human-reviewed identity resolution for herb pages

## Recommended next move

Build a second normalization pass focused on accepted families only:

- tighten plant-term versus non-plant-term classification
- cluster synonym families
- create a curated shortlist that can seed the first public herbal database
