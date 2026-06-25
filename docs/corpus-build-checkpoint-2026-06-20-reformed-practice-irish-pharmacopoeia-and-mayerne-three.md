# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next source-ready Wellcome trio completed after the Garrod, Thomsonian, and lexicon follow-up pass.

Main outcomes:

- 3 additional rights-cleared Wellcome works were acquired and chunked successfully
- the trio added one reformed-or-botanic practice witness, one compact Irish pharmacopoeia witness, and one deeper Mayerne pharmacopoeia-and-formulas volume
- the derived corpus layers were rebuilt again at the new `1268`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- none of the new works were flagged in `thin-work-review`
- the refreshed selector surfaced one source-ready dental-pathology drift title, which was explicitly held back by manual screening rather than being allowed into the next lane automatically

## Three newly completed Wellcome works

The following 3 works are now acquired and chunked successfully:

- `wellcome-aw843fyz` - *The practice of medicine, according to the plan most approved by the Reformed or Botanic Colleges of the U. S* - `1191` chunks, `1203` paragraphs
- `wellcome-ac4j48ht` - *Pharmacopœia collegi mediocorum Regis et Reginae in Hibernia* - `194` chunks, `197` paragraphs
- `wellcome-gecedbpt` - *Theo. Turquet Mayernii ... opera medica* - `2387` chunks, `2398` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this trio did three useful jobs for the archive:

- added a family- and reform-medicine practice witness that stays close to the herbal and practical home-reference core
- added a compact pharmacopoeia witness that can strengthen formulas, preparations, and dose-oriented retrieval
- added a deeper historical pharmacopoeia-and-formulas source even though it is older and more Latin-leading than the first two titles

## Editorial note on thin-work review

None of the 3 newly landed works were flagged in `thin-work-review`.

That matters because this pass expanded the practical and pharmacopoeia layers without increasing the current thin-work burden.

## Current corpus totals

- registered works: `2720`
- chunked works: `1268`
- discovered works: `1445`
- failed works: `7`
- chunk records: `1671950`
- paragraph records: `1885191`

### By collection

- NLM Digital Collections: `396` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `845` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `939`
- uncovered frontier families: `876`
- depth frontier families: `174`
- herb candidates: `83708`
- chunk signals: `1271022`
- graph nodes: `83776`
- graph edges: `479894`
- accepted term families: `78342`
- review term families: `36`
- rejected term families: `3954`
- seed-ready herb families: `124`
- supporting families: `145`
- herb profiles: `124`
- seed-review families: `62715`
- promotion candidates: `170`
- identity-review candidates: `32`
- secondary candidates: `58485`
- deprioritized candidates: `4028`

### Thin-work review

- total chunked works reviewed: `1268`
- flagged works: `153`
- severe thin works: `82`
- fragment flags: `23`
- reference flags: `94`
- multi-work-family flags: `74`

### Local footprint

- size: `11.357 GiB`
- files: `10889`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3258`
- `edition-family`: `1866`
- `work-summary`: `1268`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new work-summary documents were inserted
- `3255` existing retrieval documents were updated during the full refresh
- exact work-id retrieval was re-verified for:
  - `wellcome-aw843fyz` - total `1`, kind `work-summary`, chunk `1191`, paragraph `1203`
  - `wellcome-ac4j48ht` - total `1`, kind `work-summary`, chunk `194`, paragraph `197`
  - `wellcome-gecedbpt` - total `1`, kind `work-summary`, chunk `2387`, paragraph `2398`

## Selector state after this pass

The refreshed selector remains noisy at the very top, so the next lane should stay manually screened.

Current route-ready reserve:

- `wellcome-ngf4vfpt`
- `wellcome-cek32jpp`
- source-ready but editorially held back `wellcome-gpp79sus`

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

- `nlm-101526713` - official NLM OCR route is present, though browser-assisted, and the title remains a broad botany and materia-medica dictionary witness if we want a non-Wellcome lane in parallel

## Recommended next move

Next manually screened lane should prefer:

- `wellcome-ngf4vfpt`
- `wellcome-cek32jpp`
- optional third slot `nlm-101526713`

Why this is the cleaner next lane now:

- `wellcome-ngf4vfpt` is source-ready and materially closer to the dispensatory and formulas core than a general drift title
- `wellcome-cek32jpp` is source-ready and keeps the pharmacopoeia lane moving, even though it is Latin-leading
- `nlm-101526713` is still a strong cross-collection lexicon and botany bridge if we want the third slot to stay more relevant than `wellcome-gpp79sus`
- `wellcome-gpp79sus` is source-ready but should be held back because dental pathology and dental medicine are weaker matches for the current herbal and practical-medicine retrieval core
