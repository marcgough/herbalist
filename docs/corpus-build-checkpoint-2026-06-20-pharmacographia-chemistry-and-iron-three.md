# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next Wellcome-led pharmacographia, chemistry, and medicinal-preparations pass completed after the cyclopaedia, scientific-terms, and pharmacologia three checkpoint.

Main outcomes:

- 3 additional rights-cleared Wellcome works were acquired and chunked successfully
- the pass added one substantial plant-drug history witness, one broad medical-and-pharmaceutical chemistry reference, and one narrower medicinal-preparations bridge focused on iron and British pharmacopoeial practice
- the derived corpus layers were rebuilt again at the new `1235`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- the next source-ready reserve shifted again toward pharmacologia volume pairing, U.S.-pharmacopoeia chemistry, surgical pharmacy, and one industrial-flora witness, while the no-text Wellcome holds remain unchanged

## Pharmacographia, chemistry, and iron three completed

The following 3 works are now acquired and chunked successfully:

- `wellcome-ax3xqr3q` - *Pharmacographia ...* - `2803` chunks, `2805` paragraphs
- `wellcome-c5zgvvdt` - *Chemistry : general, medical and pharmaceutical ...* - `2359` chunks, `2393` paragraphs
- `wellcome-tez8snwv` - *Manual of the medicinal preparations of iron ...* - `260` chunks, `263` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this pass did four useful jobs for the archive:

- added a substantial plant-drug history witness that should help botanical and materia-medica retrieval quality
- widened the chemistry and pharmacopoeia support layer with a broad general manual
- added a narrower but still useful medicinal-preparations bridge that strengthens later handling of historical pharmacy and formulation language
- stayed inside the current source-ready Wellcome text lane without spending effort on route-bad witnesses

## Editorial note on thin-work review

None of the newly landed works were flagged in `thin-work-review`.

That matters because this pass deepened plant-drug history and pharmacopoeial chemistry coverage without adding new thin-reference burden.

## Current corpus totals

- registered works: `2720`
- chunked works: `1235`
- discovered works: `1478`
- failed works: `7`
- chunk records: `1594005`
- paragraph records: `1806239`

### By collection

- NLM Digital Collections: `396` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `812` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `962`
- uncovered frontier families: `893`
- depth frontier families: `180`
- herb candidates: `81855`
- chunk signals: `1217182`
- graph nodes: `81923`
- graph edges: `469668`
- accepted term families: `76636`
- review term families: `36`
- rejected term families: `3880`
- seed-ready herb families: `124`
- supporting families: `139`
- herb profiles: `124`
- seed-review families: `61328`
- promotion candidates: `152`
- identity-review candidates: `31`
- secondary candidates: `57177`
- deprioritized candidates: `3968`

### Thin-work review

- total chunked works reviewed: `1235`
- flagged works: `153`
- severe thin works: `82`
- fragment flags: `23`
- reference flags: `94`
- multi-work-family flags: `74`

### Local footprint

- size: `10.90 GiB`
- files: `10616`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3225`
- `edition-family`: `1866`
- `work-summary`: `1235`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `wellcome-ax3xqr3q` - total `1`, kind `work-summary`, chunk `2803`, paragraph `2805`
  - `wellcome-c5zgvvdt` - total `1`, kind `work-summary`, chunk `2359`, paragraph `2393`
  - `wellcome-tez8snwv` - total `1`, kind `work-summary`, chunk `260`, paragraph `263`

## Selector state after this pass

The refreshed selector remains noisy at the very top, so the next lane should stay manually screened.

Current route-ready reserve:

- `wellcome-ybfdn8ze`
- `wellcome-wrd4fj88`
- `wellcome-pz2t9kxy`
- `wellcome-x4e5vzzu`
- `wellcome-cd68uah7`
- `wellcome-fd94cd3h`
- `wellcome-cygk9vrm`
- `wellcome-tq6p5txw`

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

- `wellcome-tq6p5txw`
- `wellcome-fd94cd3h`
- one optional third slot from `wellcome-cygk9vrm` or `wellcome-cd68uah7`

Why this is the cleaner next lane now:

- `wellcome-tq6p5txw` is source-ready and naturally pairs with the newly landed volume 2 pharmacologia bridge
- `wellcome-fd94cd3h` is source-ready and broad, giving a U.S.-pharmacopoeia chemistry companion to the newly landed British-pharmacopoeia chemistry manual
- `wellcome-cygk9vrm` stays source-ready and English-accessible, but is narrower because it is centered on chirurgical pharmacy
- `wellcome-cd68uah7` remains source-ready and botanical, but narrower and Spanish-leading
- `wellcome-ybfdn8ze` and `wellcome-wrd4fj88` remain substantial, but both deepen already represented dictionary families
- `wellcome-pz2t9kxy` is source-ready but Latin-leading
- `wellcome-x4e5vzzu` is source-ready and substantial, but it deepens a manual family that is already well represented
