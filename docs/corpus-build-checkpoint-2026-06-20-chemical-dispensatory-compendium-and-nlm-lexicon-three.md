# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next manually screened mixed Wellcome and NLM lane completed after the reformed-practice, Irish-pharmacopoeia, and Mayerne follow-up pass.

Main outcomes:

- 3 additional rights-cleared works were acquired and chunked successfully across Wellcome and NLM
- the lane added one substantial English chymical dispensatory, one thin pharmacopoeia compendium witness, and one browser-assisted NLM lexicon bridge
- the derived corpus layers were rebuilt again at the new `1271`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- `wellcome-ngf4vfpt` stayed out of `thin-work-review`, while `wellcome-cek32jpp` and `nlm-101526713` were both flagged and should be treated with lower retrieval weight
- the refreshed selector surfaced one stronger next-step practical compend plus two source-ready drift titles that were explicitly held back by manual screening

## Three newly completed works

The following 3 works are now acquired and chunked successfully:

- `wellcome-ngf4vfpt` - *The compleat chymical dispensatory, in five books* - `1979` chunks, `1997` paragraphs
- `wellcome-cek32jpp` - *Compendium pharmaceuticum* - `15` chunks, `16` paragraphs
- `nlm-101526713` - *Lexicon medicum, or, Medical dictionary* - `26` chunks, `46` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this mixed lane did three useful jobs for the archive:

- added a strong dispensatory and formulas witness with materially useful practical density
- added a compact pharmacopoeia compendium witness that is real but visibly thin
- added a browser-assisted NLM botany and materia-medica bridge that helps the cross-collection coverage even though it is also thin and family-saturated

## Editorial note on thin-work review

The 3 newly landed works split cleanly into one strong witness and two review-weight witnesses:

- `wellcome-ngf4vfpt` was not flagged in `thin-work-review`
- `wellcome-cek32jpp` was flagged as `thin-general`
- `nlm-101526713` was flagged as `severe-thin-reference`

That matters because this pass still improved the archive, but it also added two records that should be kept visible as evidence-bearing supplements rather than treated as equal retrieval anchors next to the larger practical books.

## Current corpus totals

- registered works: `2720`
- chunked works: `1271`
- discovered works: `1442`
- failed works: `7`
- chunk records: `1673970`
- paragraph records: `1887250`

### By collection

- NLM Digital Collections: `397` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `847` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `937`
- uncovered frontier families: `874`
- depth frontier families: `174`
- herb candidates: `83903`
- chunk signals: `1272534`
- graph nodes: `83971`
- graph edges: `480652`
- accepted term families: `78566`
- review term families: `36`
- rejected term families: `3959`
- seed-ready herb families: `124`
- supporting families: `145`
- herb profiles: `124`
- seed-review families: `62890`
- promotion candidates: `170`
- identity-review candidates: `32`
- secondary candidates: `58653`
- deprioritized candidates: `4035`

### Thin-work review

- total chunked works reviewed: `1271`
- flagged works: `155`
- severe thin works: `84`
- fragment flags: `23`
- reference flags: `95`
- multi-work-family flags: `75`

### Local footprint

- size: `11.37 GiB`
- files: `10914`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3261`
- `edition-family`: `1866`
- `work-summary`: `1271`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new work-summary documents were inserted
- `3258` existing retrieval documents were updated during the full refresh
- exact work-id retrieval was re-verified for:
  - `wellcome-ngf4vfpt` - total `1`, kind `work-summary`, chunk `1979`, paragraph `1997`
  - `wellcome-cek32jpp` - total `1`, kind `work-summary`, chunk `15`, paragraph `16`
  - `nlm-101526713` - total `1`, kind `work-summary`, chunk `26`, paragraph `46`

## Selector state after this pass

The refreshed selector remains noisy at the very top, so the next lane should stay manually screened.

Current route-ready reserve:

- `wellcome-gfr7cke2`
- source-ready but editorially held back `wellcome-gpp79sus`
- source-ready but editorially held back `wellcome-qk5mzrqw`

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

- `nlm-101526718` - official NLM OCR route is present through the browser-assisted lane, but it appears to be another lexicon-family repeat and should stay optional

## Recommended next move

Next manually screened lane should prefer:

- `wellcome-gfr7cke2`
- optional third slot `nlm-101526718`

Why this is the cleaner next lane now:

- `wellcome-gfr7cke2` is source-ready and materially closer to the practical pharmaceutical-formula and compend core
- `nlm-101526718` can be used as an optional cross-collection witness only if we deliberately want one more lexicon-family repeat
- `wellcome-gpp79sus` is source-ready but drifts into dental pathology and dental medicine
- `wellcome-qk5mzrqw` is source-ready but reads as a colonial trade, seamen-health, and travel-station witness rather than a strong herbal or practical-reference book
