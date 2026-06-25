# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next Wellcome-led cyclopaedia, scientific-terms, and pharmacologia pass completed after the dispensatory, remedies, and therapeutics-textbook three checkpoint.

Main outcomes:

- 3 additional rights-cleared Wellcome works were acquired and chunked successfully
- the pass added one large practical-medicine cyclopaedia volume, one scientific-terms bridge across botany and medicine, and one pharmacologia bridge volume
- the derived corpus layers were rebuilt again at the new `1232`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- the next source-ready reserve shifted again toward pharmacographia, chemistry-and-pharmacopoeia, medicinal-preparations, and one industrial-flora witness, while the no-text Wellcome holds remain unchanged

## Cyclopaedia, terms, and pharmacologia three completed

The following 3 works are now acquired and chunked successfully:

- `wellcome-gh8qckjz` - *The cyclopaedia of practical medicine ... (Volume 4).* - `6256` chunks, `6406` paragraphs
- `wellcome-j47whxdc` - *A manual of scientific terms ...* - `1926` chunks, `1935` paragraphs
- `wellcome-fy6758dg` - *Pharmacologia ... (Volume 2).* - `1319` chunks, `1364` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this pass did four useful jobs for the archive:

- added a broad practical-medicine and materia-medica cyclopaedia witness that strengthens the reference backbone
- widened the terminology bridge between botany, medicine, and natural-history language for later retrieval and profile-building
- added a pharmacologia bridge volume aligned with London pharmacopoeia practice and historical chemical science
- stayed inside the current source-ready Wellcome text lane without spending effort on route-bad witnesses

## Editorial note on thin-work review

None of the newly landed works were flagged in `thin-work-review`.

That matters because this pass materially broadened the reference and terminology layer without adding new thin-reference burden.

## Current corpus totals

- registered works: `2720`
- chunked works: `1232`
- discovered works: `1481`
- failed works: `7`
- chunk records: `1588583`
- paragraph records: `1800778`

### By collection

- NLM Digital Collections: `396` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `809` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `966`
- uncovered frontier families: `895`
- depth frontier families: `182`
- herb candidates: `81755`
- chunk signals: `1213709`
- graph nodes: `81823`
- graph edges: `469250`
- accepted term families: `76538`
- review term families: `36`
- rejected term families: `3878`
- seed-ready herb families: `124`
- supporting families: `139`
- herb profiles: `124`
- seed-review families: `61238`
- promotion candidates: `151`
- identity-review candidates: `31`
- secondary candidates: `57091`
- deprioritized candidates: `3965`

### Thin-work review

- total chunked works reviewed: `1232`
- flagged works: `153`
- severe thin works: `82`
- fragment flags: `23`
- reference flags: `94`
- multi-work-family flags: `74`

### Local footprint

- size: `10.87 GiB`
- files: `10591`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3222`
- `edition-family`: `1866`
- `work-summary`: `1232`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `wellcome-gh8qckjz` - total `1`, kind `work-summary`, chunk `6256`, paragraph `6406`
  - `wellcome-j47whxdc` - total `1`, kind `work-summary`, chunk `1926`, paragraph `1935`
  - `wellcome-fy6758dg` - total `1`, kind `work-summary`, chunk `1319`, paragraph `1364`

## Selector state after this pass

The refreshed selector remains noisy at the very top, so the next lane should stay manually screened.

Current route-ready reserve:

- `wellcome-ybfdn8ze`
- `wellcome-wrd4fj88`
- `wellcome-pz2t9kxy`
- `wellcome-x4e5vzzu`
- `wellcome-cd68uah7`
- `wellcome-ax3xqr3q`
- `wellcome-c5zgvvdt`
- `wellcome-tez8snwv`

Current no-text hold list:

- `wellcome-takhmyez`
- `wellcome-kw7su3cf`
- `wellcome-jkjv35ym`
- `wellcome-f6f97kmm`
- `wellcome-ww8gtwfv`
- `wellcome-xtum85vk`
- `wellcome-bn68mk4f`
- `wellcome-n2yp92tq`

## Recommended next move

Next Wellcome-led manually screened lane should prefer:

- `wellcome-ax3xqr3q`
- `wellcome-c5zgvvdt`
- one optional third slot from `wellcome-tez8snwv` or `wellcome-cd68uah7`

Why this is the cleaner next lane now:

- `wellcome-ax3xqr3q` is source-ready and especially useful as a plant-drug history bridge without being a heavy repeat family
- `wellcome-c5zgvvdt` is source-ready, uncovered in this lane, and useful for chemistry-plus-pharmacopoeia context
- `wellcome-tez8snwv` stays English-accessible and source-ready, but is narrower because of its iron-preparations focus
- `wellcome-cd68uah7` is source-ready and botanical, but narrower and Spanish-leading
- `wellcome-ybfdn8ze` and `wellcome-wrd4fj88` remain substantial, but both deepen already represented dictionary families
- `wellcome-pz2t9kxy` is source-ready but Latin-leading
- `wellcome-x4e5vzzu` is source-ready and substantial, but deepens a manual family that is already well represented
