# Herbalisti Corpus Build Checkpoint

Date: 2026-06-21

## Batch landed

This checkpoint records the mixed NLM lane that deliberately paired two selected depth holds with one cleaner uncovered health-guide witness.

- `nlm-8206608`
  - *The medical companion, or, Family physician*
  - `36` chunks
  - `52` paragraphs
  - topic family: `materia-medica;domestic-medicine`
- `nlm-101306881`
  - *Homoeopathic domestic physician*
  - `1711` chunks
  - `2164` paragraphs
  - topic family: `materia-medica;hygiene`
- `nlm-2702091R`
  - *A guide to health through the various stages of life*
  - `4580` chunks
  - `5705` paragraphs
  - topic family: `domestic-medicine`

## Live archive state

- `2720` registered works
- `1310` chunked works
- `1402` discovered works
- `8` failed works
- `1713379` chunk records
- `1934740` paragraph records

By collection:

- NLM Digital Collections: `433` chunked works
- Wellcome Collection: `850` chunked works
- Project Gutenberg: `27` chunked works

## Derived corpus state

- acquisition frontier families: `907`
- uncovered frontier families: `847`
- depth frontier families: `170`
- chunk signals: `1301174`
- herb candidates: `84524`
- graph nodes: `84592`
- graph edges: `486394`

Term-family layer:

- total families: `83176`
- accepted families: `79155`
- accepted plant families: `78639`
- accepted materia-medica families: `516`
- review families: `36`
- rejected families: `3985`

Seed catalog:

- seed-ready families: `124`
- supporting families: `145`
- review families: `63387`
- excluded families: `14971`

Seed priority buckets:

- promotion candidates: `178`
- identity-review candidates: `34`
- secondary candidates: `59120`
- deprioritized candidates: `4055`

Herb profiles:

- compiled profiles: `124`
- matched chunks: `120358`

Thin-work review totals:

- total chunked works reviewed: `1310`
- flagged works: `164`
- severe-thin works: `90`
- fragment-flagged works: `23`
- reference-flagged works: `102`
- multi-work-family flagged works: `81`

## Corpus Memory

`Corpus Memory` remains separate from shared Agent Memory and is live at `127.0.0.1:8766`.

- total retrieval documents: `3300`
- `edition-family` documents: `1866`
- `work-summary` documents: `1310`
- `herb-profile` documents: `124`

Exact retrieval by work id was re-verified for the new lane:

- `nlm-8206608` -> `work-nlm-8206608`
- `nlm-101306881` -> `work-nlm-101306881`
- `nlm-2702091R` -> `work-nlm-2702091R`

All 3 currently resolve as `work-summary` documents with the expected chunk and paragraph counts.

## Verification notes

- `nlm-8206608` surfaced in `thin-work-review` as `severe-thin-reference` with `36` chunks, `52` paragraphs, and the recommended action `keep-but-review-retrieval-weight`
- `nlm-101306881` did not surface in `thin-work-review`
- `nlm-2702091R` did not surface in `thin-work-review`

The thin review for `nlm-8206608` also confirms why this lane only partially validates the remaining selected-depth queue:

- family id: `family-medical-companion-or-family-physician-ewell-j1-7491fc6d52`
- family size: `8` works
- chunked family witnesses: `7`
- heuristic reasons: `severe-thin-length`, `multi-work-family`, and `reference-shaped-title:materia-medica|dispensatory|dictionary|manual`

## Current selector read

The refreshed curated selector now keeps the remaining selected NLM reserve at:

1. `nlm-101313340`
2. `nlm-2561026R`
3. `nlm-64230310R`
4. `nlm-9717182`
5. `nlm-63570300R`

## Editorial interpretation

This batch strengthened the corpus, but it also clarified the next decision.

- `nlm-101306881` and `nlm-2702091R` are full-scale practical additions and justify the batch
- `nlm-8206608` landed much thinner than its title suggested and should be treated as a lower-weight reference witness
- that result weakens the case for blindly consuming the rest of the selected NLM depth queue
- the safest next move is now either a manually screened uncovered NLM trio or a tighter selector pass that pushes thin repeat-family witnesses lower before another depth batch

## Local footprint

- corpus footprint: `11.58` GiB
- corpus file count: `11239`
