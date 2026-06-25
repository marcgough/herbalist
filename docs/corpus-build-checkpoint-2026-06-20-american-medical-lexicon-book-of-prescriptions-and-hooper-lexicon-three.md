# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next source-ready Wellcome trio completed after the lexicon-expanded therapeutics and American eclectic follow-up pass.

Main outcomes:

- 3 additional rights-cleared Wellcome works were acquired and chunked successfully
- the trio added one American medical lexicon witness, one practical prescription handbook, and one deeper Hooper lexicon repeat
- the derived corpus layers were rebuilt again at the new `1262`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- none of the new works were flagged in `thin-work-review`
- the refreshed selector moved the cleaner next lane toward two practical materia-medica books and only one optional broad lexicon fallback

## Three newly completed Wellcome works

The following 3 works are now acquired and chunked successfully:

- `wellcome-xsx7hr3e` - *The American medical lexicon* - `2602` chunks, `2635` paragraphs
- `wellcome-esx5mvqp` - *The book of prescriptions* - `928` chunks, `928` paragraphs
- `wellcome-z367wx5k` - *Lexicon medicum* - `8752` chunks, `8879` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this trio did three useful jobs for the archive:

- added one American lexicon witness that broadens practical terminology and materia-medica language without leaning only on British reference traditions
- added one compact but practical prescriptions handbook with dose, formula, and prescriber-reference value
- added one further Hooper `Lexicon medicum` witness only as a controlled broad-reference fallback once the two more practical titles were safely in hand

## Editorial note on thin-work review

None of the 3 newly landed works were flagged in `thin-work-review`.

That matters because this pass deepened the lexicon and prescription lanes without increasing the current thin-work burden.

## Current corpus totals

- registered works: `2720`
- chunked works: `1262`
- discovered works: `1451`
- failed works: `7`
- chunk records: `1657089`
- paragraph records: `1870178`

### By collection

- NLM Digital Collections: `396` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `839` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `944`
- uncovered frontier families: `879`
- depth frontier families: `176`
- herb candidates: `83551`
- chunk signals: `1262115`
- graph nodes: `83619`
- graph edges: `478821`
- accepted term families: `78233`
- review term families: `36`
- rejected term families: `3947`
- seed-ready herb families: `124`
- supporting families: `145`
- herb profiles: `124`
- seed-review families: `62624`
- promotion candidates: `166`
- identity-review candidates: `32`
- secondary candidates: `58404`
- deprioritized candidates: `4022`

### Thin-work review

- total chunked works reviewed: `1262`
- flagged works: `153`
- severe thin works: `82`
- fragment flags: `23`
- reference flags: `94`
- multi-work-family flags: `74`

### Local footprint

- size: `11.271 GiB`
- files: `10839`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3252`
- `edition-family`: `1866`
- `work-summary`: `1262`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new work-summary documents were inserted
- `3249` existing retrieval documents were updated during the full refresh
- exact work-id retrieval was re-verified for:
  - `wellcome-xsx7hr3e` - total `1`, kind `work-summary`, chunk `2602`, paragraph `2635`
  - `wellcome-esx5mvqp` - total `1`, kind `work-summary`, chunk `928`, paragraph `928`
  - `wellcome-z367wx5k` - total `1`, kind `work-summary`, chunk `8752`, paragraph `8879`

## Selector state after this pass

The refreshed selector remains noisy at the very top, so the next lane should stay manually screened.

Current route-ready reserve:

- `wellcome-bjnepyda`
- `wellcome-bkhg7djn`
- optional fallback `wellcome-gy79dgeq`

Current route-bad or route-fragile holds:

- `wellcome-ubh77647` - official text endpoint still returns `404`
- `wellcome-takhmyez`
- `wellcome-kw7su3cf`
- `wellcome-jkjv35ym`
- `wellcome-f6f97kmm`
- `wellcome-ww8gtwfv`
- `wellcome-xtum85vk`
- `wellcome-bn68mk4f`
- `wellcome-n2yp92tq`
- `wellcome-vs9d8y7g`
- `wellcome-x9vpr68y`
- `wellcome-kpjgpmdd`
- `wellcome-j98e5bzy`

Cross-collection follow-up candidate:

- `nlm-101526713` - official NLM OCR route is present and the title remains a broad botany and materia-medica dictionary witness if we want a non-Wellcome lane in parallel

## Recommended next move

Next Wellcome-led manually screened lane should prefer:

- `wellcome-bjnepyda`
- `wellcome-bkhg7djn`
- optional third slot `wellcome-gy79dgeq`

Why this is the cleaner next lane now:

- `wellcome-bjnepyda` is source-ready and adds practical materia-medica and therapeutics weight
- `wellcome-bkhg7djn` is source-ready and adds a botanic and Thomsonian-principles bridge that is closer to the practical herbal core than another plain dictionary
- `wellcome-gy79dgeq` is source-ready and broad, but it is another deep lexicon-family repeat and should stay optional
