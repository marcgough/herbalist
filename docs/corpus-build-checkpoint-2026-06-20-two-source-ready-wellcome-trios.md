# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures two consecutive source-ready Wellcome trios completed after the therapeutic-annotation, antidotaria, and homoeopathic-pharmacopoeia checkpoint.

Main outcomes:

- 6 additional rights-cleared Wellcome works were acquired and chunked successfully
- the first trio added one uncovered dispensatory supplement, one substantial materia-medica manual, and one uncovered Boerhaave bridge volume
- the second trio added one very large United States dispensatory witness, one substantial Edinburgh new dispensatory witness, and one lighter-repeat London medical dictionary companion volume
- the derived corpus layers were rebuilt again at the new `1253`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 6 new works
- the next source-ready reserve now narrows toward one uncovered London dispensatory plus two botanical or materia-medica reference witnesses, while the route-bad uncovered pharmacopoeia cluster still dominates the top raw selector ranks

## Six newly completed Wellcome works

The following 6 works are now acquired and chunked successfully:

- `wellcome-wmk5vabn` - *Supplement to the Edinburgh new dispensatory* - `857` chunks, `862` paragraphs
- `wellcome-x4e5vzzu` - *A manual of materia medica and therapeutics ...* - `2692` chunks, `2697` paragraphs
- `wellcome-pz2t9kxy` - *H. Boerhaave De cognoscendis et curandis morbis aphorismi ...* - `822` chunks, `842` paragraphs
- `wellcome-dkebu9hu` - *The dispensatory of the United States of America* - `10905` chunks, `11035` paragraphs
- `wellcome-efag9654` - *The Edinburgh new dispensatory ...* - `1793` chunks, `1809` paragraphs
- `wellcome-wrd4fj88` - *The London medical dictionary ... (Volume 2)* - `5378` chunks, `5405` paragraphs

All 6 processed successfully.

## Batch characteristics

Taken together, these two trios did six useful jobs for the archive:

- added one uncovered dispensatory supplement that broadens the Edinburgh dispensatory lane
- deepened the practical materia-medica and therapeutics layer with a very substantial manual witness
- added one uncovered Boerhaave bridge volume even though it is Latin-leading
- landed a very large United States dispensatory witness with strong practical pharmacy weight
- added one further Edinburgh new dispensatory witness from a separate uncovered family
- added one lighter-repeat medical dictionary companion volume without spending effort on route-bad uncovered items

## Editorial note on thin-work review

None of the 6 newly landed works were flagged in `thin-work-review`.

That matters because these two passes added substantial pharmacopoeia, dispensatory, and materia-medica weight without increasing the current thin-work burden.

## Current corpus totals

- registered works: `2720`
- chunked works: `1253`
- discovered works: `1460`
- failed works: `7`
- chunk records: `1627335`
- paragraph records: `1840066`

### By collection

- NLM Digital Collections: `396` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `830` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `950`
- uncovered frontier families: `880`
- depth frontier families: `181`
- herb candidates: `83155`
- chunk signals: `1241075`
- graph nodes: `83223`
- graph edges: `476367`
- accepted term families: `77863`
- review term families: `36`
- rejected term families: `3926`
- seed-ready herb families: `124`
- supporting families: `144`
- herb profiles: `124`
- seed-review families: `62324`
- promotion candidates: `164`
- identity-review candidates: `32`
- secondary candidates: `58121`
- deprioritized candidates: `4007`

### Thin-work review

- total chunked works reviewed: `1253`
- flagged works: `153`
- severe thin works: `82`
- fragment flags: `23`
- reference flags: `94`
- multi-work-family flags: `74`

### Local footprint

- size: `11.10 GiB`
- files: `10765`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3243`
- `edition-family`: `1866`
- `work-summary`: `1253`
- `herb-profile`: `124`

Refresh status after these two passes:

- `6` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `wellcome-wmk5vabn` - total `1`, kind `work-summary`, chunk `857`, paragraph `862`
  - `wellcome-x4e5vzzu` - total `1`, kind `work-summary`, chunk `2692`, paragraph `2697`
  - `wellcome-pz2t9kxy` - total `1`, kind `work-summary`, chunk `822`, paragraph `842`
  - `wellcome-dkebu9hu` - total `1`, kind `work-summary`, chunk `10905`, paragraph `11035`
  - `wellcome-efag9654` - total `1`, kind `work-summary`, chunk `1793`, paragraph `1809`
  - `wellcome-wrd4fj88` - total `1`, kind `work-summary`, chunk `5378`, paragraph `5405`

## Selector state after these passes

The refreshed selector remains noisy at the very top, so the next lane should stay manually screened.

Current route-ready reserve:

- `wellcome-ybfdn8ze`
- `wellcome-an2hygfn`
- `wellcome-zc9bsska`
- `wellcome-v6vrvfxq`

Current no-text hold list:

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

## Recommended next move

Next Wellcome-led manually screened lane should prefer:

- `wellcome-an2hygfn`
- `wellcome-zc9bsska`
- one optional third slot from `wellcome-v6vrvfxq` or `wellcome-ybfdn8ze`

Why this is the cleaner next lane now:

- `wellcome-an2hygfn` is uncovered, source-ready, and adds a clean London dispensatory witness
- `wellcome-zc9bsska` is source-ready and more botanically aligned than another plain dictionary repeat
- `wellcome-v6vrvfxq` is source-ready and still materially useful as a vegetable-kingdom materia-medica witness
- `wellcome-ybfdn8ze` remains source-ready and broad, but it is a much heavier repeat lexicon family
