# Herbalisti Corpus Build Checkpoint

Date: 2026-06-22

## Batch landed

This checkpoint records the Wellcome-led follow-up taken after the tightened practical-remedies profile proved stronger on the curated Wellcome lane than on the same-family NLM depth lane.

- `wellcome-wkhtmbyj`
  - *Health restor'd, or, the triumph of nature, over physick, doctors, and apothecaries*
  - `237` chunks
  - `242` paragraphs
  - topic family: `materia-medica`
  - source mode: `wellcome_text_api`
- `wellcome-ubh77647`
  - *The cyclopædia of practical medicine*
  - `6519` chunks
  - `6627` paragraphs
  - topic family: `materia-medica`
  - source mode: `wellcome_alto_fallback`

## Partial retry lane

One additional Wellcome target was attempted in the same pass:

- `wellcome-takhmyez`
  - *Pharmacopoeia universalis: or, a new universal English dispensatory*
  - official raw-source files were fetched into `corpus/raw/wellcome-takhmyez/`
  - the attempt stalled before manifest and chunk output
  - the worker was stopped cleanly
  - registry state remains `discovered`
  - current treatment: keep as a retry candidate rather than count it as landed

## Live archive state

- `2720` registered works
- `1318` chunked works
- `1394` discovered works
- `8` failed works
- `1724086` chunk records
- `1945625` paragraph records

By collection:

- NLM Digital Collections: `437` chunked works
- Wellcome Collection: `854` chunked works
- Project Gutenberg: `27` chunked works

## Derived corpus state

- acquisition frontier families: `902`
- uncovered frontier families: `841`
- depth frontier families: `171`
- chunk signals: `1308529`
- herb candidates: `84578`
- graph nodes: `84646`
- graph edges: `486967`

Term-family layer:

- total families: `83230`
- accepted families: `79208`
- accepted plant families: `78692`
- accepted materia-medica families: `516`
- review families: `36`
- rejected families: `3986`

Seed catalog:

- seed-ready families: `124`
- supporting families: `145`
- review families: `63430`
- excluded families: `14981`

Seed priority buckets:

- promotion candidates: `179`
- identity-review candidates: `34`
- secondary candidates: `59161`
- deprioritized candidates: `4056`

Herb profiles:

- compiled profiles: `124`
- matched chunks: `120585`

Thin-work review totals:

- total chunked works reviewed: `1318`
- flagged works: `166`
- severe-thin works: `92`
- fragment-flagged works: `23`
- reference-flagged works: `104`
- multi-work-family flagged works: `83`

## Corpus Memory

`Corpus Memory` remains separate from shared Agent Memory and is stored locally at `corpus-memory/store/corpus-memory.sqlite3`.

- total retrieval documents: `3308`
- `edition-family` documents: `1866`
- `work-summary` documents: `1318`
- `herb-profile` documents: `124`

The latest ingest reported:

- `receivedCount`: `3308`
- `insertedCount`: `2`
- `updatedCount`: `3306`
- `prunedCount`: `0`

SQLite verification for the new work-summary documents:

- `work-wellcome-wkhtmbyj`
  - `237` chunks
  - `242` paragraphs
  - family id: `family-health-restord-or-the-triumph-of-nature-over-phy-804a7ffbdd`
- `work-wellcome-ubh77647`
  - `6519` chunks
  - `6627` paragraphs
  - family id: `family-cyclopaedia-of-practical-medicine-unknown-1baaaf6c9f`
- `work-wellcome-takhmyez`
  - not present, which matches the stalled retry state

## Verification notes

- `wellcome-wkhtmbyj` did not surface in `thin-work-review`
- `wellcome-ubh77647` did not surface in `thin-work-review`
- `wellcome-takhmyez` did not surface there either, because it never completed chunking

## Current selector read

The refreshed curated selector now keeps the remaining selected NLM reserve at:

1. `nlm-101313341`
2. `nlm-2561026R`
3. `nlm-64230310R`
4. `nlm-9717182`
5. `nlm-63570300R`

The current selected Wellcome reserve is now:

1. `wellcome-ndctabm6`
2. `wellcome-jkjv35ym`
3. `wellcome-f6f97kmm`
4. `wellcome-ww8gtwfv`
5. `wellcome-xtum85vk`
6. `wellcome-bn68mk4f`
7. `wellcome-pxvbjk85`
8. `wellcome-m7hb9km7`
9. `wellcome-takhmyez`
10. `wellcome-d6g6adwj`
11. `wellcome-qb3dkxup`
12. `wellcome-wmrh7xf2`

## Editorial interpretation

This follow-up strengthens the same lesson as the previous tightened-profile batch.

- the curated Wellcome lane is still outperforming the same-family NLM depth lane
- `wellcome-wkhtmbyj` validated the alternate English `Health restor'd` uncovered witness as a book-scale win
- `wellcome-ubh77647` landed as a very large practical-medicine cyclopaedia and materially deepened the usable corpus
- `wellcome-takhmyez` remains worth retrying, but it is now a retry lane item, not evidence of a landed batch slot
- after removing the two best current Wellcome holds, the remaining reserve leans more toward foreign-language-leading, student, exam-board, or repeat-depth shapes than the previous top pair did

## Local footprint

- corpus footprint: `11.65` GiB
- corpus file count: `11318`
