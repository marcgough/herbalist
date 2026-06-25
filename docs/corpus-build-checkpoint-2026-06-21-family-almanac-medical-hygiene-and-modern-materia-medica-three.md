# Herbalisti Corpus Build Checkpoint

Date: 2026-06-21

## Batch landed

This checkpoint records the next manually screened uncovered NLM trio after the mixed depth pass.

- `nlm-101178768`
  - *The family almanac and guide to health*
  - `25` chunks
  - `37` paragraphs
  - topic family: `domestic-medicine`
- `nlm-63810390R`
  - *Medical hygiene , or, Cures for all diseases without drugs*
  - `390` chunks
  - `393` paragraphs
  - topic family: `hygiene;nursing`
- `nlm-61761120R`
  - *Modern materia medica : with therapeutic notes : for the use of practitioners and students of medicine*
  - `1013` chunks
  - `1018` paragraphs
  - topic family: `materia-medica`

## Live archive state

- `2720` registered works
- `1313` chunked works
- `1399` discovered works
- `8` failed works
- `1714807` chunk records
- `1936188` paragraph records

By collection:

- NLM Digital Collections: `436` chunked works
- Wellcome Collection: `850` chunked works
- Project Gutenberg: `27` chunked works

## Derived corpus state

- acquisition frontier families: `905`
- uncovered frontier families: `844`
- depth frontier families: `171`
- chunk signals: `1302541`
- herb candidates: `84546`
- graph nodes: `84614`
- graph edges: `486762`

Term-family layer:

- total families: `83198`
- accepted families: `79177`
- accepted plant families: `78661`
- accepted materia-medica families: `516`
- review families: `36`
- rejected families: `3985`

Seed catalog:

- seed-ready families: `124`
- supporting families: `145`
- review families: `63403`
- excluded families: `14977`

Seed priority buckets:

- promotion candidates: `178`
- identity-review candidates: `34`
- secondary candidates: `59135`
- deprioritized candidates: `4056`

Herb profiles:

- compiled profiles: `124`
- matched chunks: `120505`

Thin-work review totals:

- total chunked works reviewed: `1313`
- flagged works: `165`
- severe-thin works: `91`
- fragment-flagged works: `23`
- reference-flagged works: `103`
- multi-work-family flagged works: `82`

## Corpus Memory

`Corpus Memory` remains separate from shared Agent Memory and is live at `127.0.0.1:8766`.

- total retrieval documents: `3303`
- `edition-family` documents: `1866`
- `work-summary` documents: `1313`
- `herb-profile` documents: `124`

Exact retrieval by work id was re-verified for the new lane:

- `nlm-101178768` -> `work-nlm-101178768`
- `nlm-63810390R` -> `work-nlm-63810390R`
- `nlm-61761120R` -> `work-nlm-61761120R`

All 3 currently resolve as `work-summary` documents with the expected chunk and paragraph counts.

## Verification notes

- `nlm-101178768` surfaced in `thin-work-review` as `severe-thin-reference` with `25` chunks, `37` paragraphs, and the recommended action `keep-but-review-retrieval-weight`
- `nlm-63810390R` did not surface in `thin-work-review`
- `nlm-61761120R` did not surface in `thin-work-review`

The thin review for `nlm-101178768` clarifies the newest frontier lesson:

- family id: `family-family-almanac-and-guide-to-health-fitch-ss1-f553489454`
- family size: `2` works
- chunked family witnesses: `1`
- heuristic reasons: `severe-thin-length`, `multi-work-family`, and `reference-shaped-title:manual`

## Current selector read

The refreshed curated selector still keeps the remaining selected NLM reserve at:

1. `nlm-101313340`
2. `nlm-2561026R`
3. `nlm-64230310R`
4. `nlm-9717182`
5. `nlm-63570300R`

## Editorial interpretation

This batch still improved the corpus, but it sharpened the editorial rule again.

- `nlm-63810390R` and `nlm-61761120R` are substantive uncovered additions and justify the batch
- `nlm-101178768` landed as a thin reference witness and should stay at lower retrieval weight
- the current uncovered lane is not uniformly weak, but almanac and guide-to-health shapes now deserve more suspicion than direct hygiene or materia-medica references
- the next move should either tighten the selector against thin manual-shaped uncovered titles or deliberately screen for more direct practical-hygiene and materia-medica books

## Local footprint

- corpus footprint: `11.59` GiB
- corpus file count: `11264`
