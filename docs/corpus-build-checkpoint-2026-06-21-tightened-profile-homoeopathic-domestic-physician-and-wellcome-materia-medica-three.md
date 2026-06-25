# Herbalisti Corpus Build Checkpoint

Date: 2026-06-21

## Batch landed

This checkpoint records the first mixed acquisition batch taken after tightening the practical-remedies selector profile.

- `nlm-101313340`
  - *Homoeopathic domestic physician*
  - `30` chunks
  - `51` paragraphs
  - topic family: `materia-medica;hygiene`
- `wellcome-rhxrvc4u`
  - *Manual of homœopathic medicine*
  - `2253` chunks
  - `2273` paragraphs
  - topic family: `materia-medica`
- `wellcome-kw7su3cf`
  - *Health restor'd, or, the triumph of nature, over physick, doctors, and apothecaries*
  - `240` chunks
  - `244` paragraphs
  - topic family: `materia-medica`

## Live archive state

- `2720` registered works
- `1316` chunked works
- `1396` discovered works
- `8` failed works
- `1717330` chunk records
- `1938756` paragraph records

By collection:

- NLM Digital Collections: `437` chunked works
- Wellcome Collection: `852` chunked works
- Project Gutenberg: `27` chunked works

## Derived corpus state

- acquisition frontier families: `903`
- uncovered frontier families: `842`
- depth frontier families: `171`
- chunk signals: `1304465`
- herb candidates: `84551`
- graph nodes: `84619`
- graph edges: `486817`

Term-family layer:

- total families: `83203`
- accepted families: `79182`
- accepted plant families: `78666`
- accepted materia-medica families: `516`
- review families: `36`
- rejected families: `3985`

Seed catalog:

- seed-ready families: `124`
- supporting families: `145`
- review families: `63408`
- excluded families: `14977`

Seed priority buckets:

- promotion candidates: `178`
- identity-review candidates: `34`
- secondary candidates: `59135`
- deprioritized candidates: `4056`

Herb profiles:

- compiled profiles: `124`
- matched chunks: `120506`

Thin-work review totals:

- total chunked works reviewed: `1316`
- flagged works: `166`
- severe-thin works: `92`
- fragment-flagged works: `23`
- reference-flagged works: `104`
- multi-work-family flagged works: `83`

## Corpus Memory

`Corpus Memory` remains separate from shared Agent Memory and is live at `127.0.0.1:8766`.

- total retrieval documents: `3306`
- `edition-family` documents: `1866`
- `work-summary` documents: `1316`
- `herb-profile` documents: `124`

Exact retrieval by work id was re-verified for the new lane:

- `nlm-101313340` -> `work-nlm-101313340`
- `wellcome-rhxrvc4u` -> `work-wellcome-rhxrvc4u`
- `wellcome-kw7su3cf` -> `work-wellcome-kw7su3cf`

All 3 currently resolve as `work-summary` documents with the expected chunk and paragraph counts.

## Verification notes

- `nlm-101313340` surfaced in `thin-work-review` as `severe-thin-reference` with `30` chunks, `51` paragraphs, and the recommended action `keep-but-review-retrieval-weight`
- `wellcome-rhxrvc4u` did not surface in `thin-work-review`
- `wellcome-kw7su3cf` did not surface in `thin-work-review`

The thin review for `nlm-101313340` confirms that the tightened profile helped, but did not fully solve same-family NLM depth risk:

- family id: `family-homoeopathic-domestic-physician-pulte-jh1-1b572da989`
- family size: `19` works
- chunked family witnesses: `4`
- heuristic reasons: `severe-thin-length`, `multi-work-family`, and `reference-shaped-title:materia-medica`

## Current selector read

The refreshed curated selector now keeps the remaining selected NLM reserve at:

1. `nlm-101313341`
2. `nlm-2561026R`
3. `nlm-64230310R`
4. `nlm-9717182`
5. `nlm-63570300R`

It also surfaces a healthier Wellcome book-scale reserve that now includes:

- `wellcome-wkhtmbyj`
- `wellcome-ubh77647`

## Editorial interpretation

This batch materially improved the corpus, but it also made the route split clearer.

- the tightened profile worked well on the curated Wellcome lane
- `wellcome-rhxrvc4u` and `wellcome-kw7su3cf` landed as substantive additions
- `nlm-101313340` still landed thin, which means the next same-family NLM reserve item should be treated more skeptically
- for this practical-remedies lane, curated-selector output is now more trustworthy than a raw frontier-batch dry run

## Local footprint

- corpus footprint: `11.60` GiB
- corpus file count: `11295`
