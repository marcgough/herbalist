# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next Wellcome-led pharmacologia, U.S.-pharmacopoeia chemistry, and chirurgical-pharmacy pass completed after the pharmacographia, chemistry, and medicinal-preparations three checkpoint.

Main outcomes:

- 3 additional rights-cleared Wellcome works were acquired and chunked successfully
- the pass added a companion first volume for the pharmacologia bridge, a broad U.S.-pharmacopoeia chemistry manual, and one practical chirurgical-pharmacy bridge
- the derived corpus layers were rebuilt again at the new `1238`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- the next source-ready reserve shifted again toward a broader medicines-and-administration witness, a substantial therapeutics treatise, a companion chirurgical-pharmacy witness, and one industrial-flora witness, while the no-text Wellcome holds remain unchanged

## Pharmacologia, U.S. chemistry, and chirurgical pharmacy three completed

The following 3 works are now acquired and chunked successfully:

- `wellcome-tq6p5txw` - *Pharmacologia ... (Volume 1).* - `1038` chunks, `1132` paragraphs
- `wellcome-fd94cd3h` - *Chemistry : general, medical, and pharmaceutical ...* - `2115` chunks, `2179` paragraphs
- `wellcome-cygk9vrm` - *Pharmacopoeia chirurgica ...* - `334` chunks, `351` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this pass did four useful jobs for the archive:

- completed the immediate pharmacologia volume pairing so the bridge lane is less one-sided
- widened the chemistry support layer with a broad U.S.-pharmacopoeia companion to the British-pharmacopoeia chemistry witness
- added a practical chirurgical-pharmacy bridge that improves historical formulation and preparation coverage
- stayed inside the current source-ready Wellcome text lane without spending effort on route-bad witnesses

## Editorial note on thin-work review

None of the newly landed works were flagged in `thin-work-review`.

That matters because this pass deepened pharmacologia and pharmacy-practice coverage without adding new thin-reference burden.

## Current corpus totals

- registered works: `2720`
- chunked works: `1238`
- discovered works: `1475`
- failed works: `7`
- chunk records: `1597492`
- paragraph records: `1809901`

### By collection

- NLM Digital Collections: `396` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `815` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `961`
- uncovered frontier families: `891`
- depth frontier families: `181`
- herb candidates: `81894`
- chunk signals: `1219016`
- graph nodes: `81962`
- graph edges: `469877`
- accepted term families: `76675`
- review term families: `36`
- rejected term families: `3880`
- seed-ready herb families: `124`
- supporting families: `139`
- herb profiles: `124`
- seed-review families: `61359`
- promotion candidates: `153`
- identity-review candidates: `31`
- secondary candidates: `57207`
- deprioritized candidates: `3968`

### Thin-work review

- total chunked works reviewed: `1238`
- flagged works: `153`
- severe thin works: `82`
- fragment flags: `23`
- reference flags: `94`
- multi-work-family flags: `74`

### Local footprint

- size: `10.92 GiB`
- files: `10641`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3228`
- `edition-family`: `1866`
- `work-summary`: `1238`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `wellcome-tq6p5txw` - total `1`, kind `work-summary`, chunk `1038`, paragraph `1132`
  - `wellcome-fd94cd3h` - total `1`, kind `work-summary`, chunk `2115`, paragraph `2179`
  - `wellcome-cygk9vrm` - total `1`, kind `work-summary`, chunk `334`, paragraph `351`

## Selector state after this pass

The refreshed selector remains noisy at the very top, so the next lane should stay manually screened.

Current route-ready reserve:

- `wellcome-ybfdn8ze`
- `wellcome-wrd4fj88`
- `wellcome-pz2t9kxy`
- `wellcome-x4e5vzzu`
- `wellcome-cd68uah7`
- `wellcome-t4cqgruq`
- `wellcome-x5urdxkm`
- `wellcome-gyum2j5c`

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

- `wellcome-x5urdxkm`
- `wellcome-gyum2j5c`
- one optional third slot from `wellcome-t4cqgruq` or `wellcome-cd68uah7`

Why this is the cleaner next lane now:

- `wellcome-x5urdxkm` is source-ready and broad, with a strong medicines-and-administration and three-pharmacopoeias bridge profile
- `wellcome-gyum2j5c` is source-ready and substantial, giving a broad therapeutics and toxicology witness rather than another dictionary deepening move
- `wellcome-t4cqgruq` stays source-ready and English-accessible, but it deepens the chirurgical-pharmacy family we just expanded
- `wellcome-cd68uah7` remains source-ready and botanical, but narrower and Spanish-leading
- `wellcome-ybfdn8ze` and `wellcome-wrd4fj88` remain substantial, but both deepen already represented dictionary families
- `wellcome-pz2t9kxy` is source-ready but Latin-leading
- `wellcome-x4e5vzzu` is source-ready and substantial, but it deepens a manual family that is already well represented
