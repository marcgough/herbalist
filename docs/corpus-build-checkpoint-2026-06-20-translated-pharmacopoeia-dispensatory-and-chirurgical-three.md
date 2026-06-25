# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next Wellcome-led translated-pharmacopoeia, extemporaneous-dispensatory, and chirurgical-pharmacy pass completed after the medicines, therapeutics, and industrial-flora three checkpoint.

Main outcomes:

- 3 additional rights-cleared Wellcome works were acquired and chunked successfully
- the pass added one English pharmacopoeia translation, one broad extemporaneous-dispensatory practice witness, and one chirurgical-pharmacy manual witness
- the derived corpus layers were rebuilt again at the new `1244`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- the next source-ready reserve shifted again toward therapeutic-annotation pharmacopoeia, plague-antidote and dispensatory reform commentary, homoeopathic pharmacopoeia, and remaining deep reference families, while the no-text Wellcome holds remain unchanged

## Translated pharmacopoeia, dispensatory, and chirurgical three completed

The following 3 works are now acquired and chunked successfully:

- `wellcome-xdthjw73` - *The pharmacopoeia of the Royal College of Physicians of London ... translated into English ...* - `629` chunks, `647` paragraphs
- `wellcome-r82ueyna` - *A complete extemporaneous dispensatory ...* - `798` chunks, `810` paragraphs
- `wellcome-t4cqgruq` - *Pharmacopoeia chirurgica ...* - `342` chunks, `359` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this pass did four useful jobs for the archive:

- added an English pharmacopoeia translation that should help first-pass retrieval and later source presentation
- widened the practical compounding and prescribing layer with a broad extemporaneous-dispensatory witness
- added one chirurgical-pharmacy manual witness to keep the pharmacy-practice lane usable rather than purely theoretical
- stayed inside the current source-ready Wellcome text lane without spending effort on route-bad witnesses

## Editorial note on thin-work review

None of the newly landed works were flagged in `thin-work-review`.

That matters because this pass deepened pharmacopoeia translation, compounding, and pharmacy-practice coverage without adding new thin-reference burden.

## Current corpus totals

- registered works: `2720`
- chunked works: `1244`
- discovered works: `1469`
- failed works: `7`
- chunk records: `1603899`
- paragraph records: `1816414`

### By collection

- NLM Digital Collections: `396` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `821` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `957`
- uncovered frontier families: `888`
- depth frontier families: `180`
- herb candidates: `82017`
- chunk signals: `1223980`
- graph nodes: `82085`
- graph edges: `470546`
- accepted term families: `76795`
- review term families: `36`
- rejected term families: `3883`
- seed-ready herb families: `124`
- supporting families: `141`
- herb profiles: `124`
- seed-review families: `61459`
- promotion candidates: `154`
- identity-review candidates: `31`
- secondary candidates: `57305`
- deprioritized candidates: `3969`

### Thin-work review

- total chunked works reviewed: `1244`
- flagged works: `153`
- severe thin works: `82`
- fragment flags: `23`
- reference flags: `94`
- multi-work-family flags: `74`

### Local footprint

- size: `10.97 GiB`
- files: `10691`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3234`
- `edition-family`: `1866`
- `work-summary`: `1244`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `wellcome-xdthjw73` - total `1`, kind `work-summary`, chunk `629`, paragraph `647`
  - `wellcome-r82ueyna` - total `1`, kind `work-summary`, chunk `798`, paragraph `810`
  - `wellcome-t4cqgruq` - total `1`, kind `work-summary`, chunk `342`, paragraph `359`

## Selector state after this pass

The refreshed selector remains noisy at the very top, so the next lane should stay manually screened.

Current route-ready reserve:

- `wellcome-ybfdn8ze`
- `wellcome-wrd4fj88`
- `wellcome-pz2t9kxy`
- `wellcome-x4e5vzzu`
- `wellcome-gdh7c6kr`
- `wellcome-sxa9nnuw`
- `wellcome-jxb2z3u7`

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

## Recommended next move

Next Wellcome-led manually screened lane should prefer:

- `wellcome-sxa9nnuw`
- `wellcome-jxb2z3u7`
- one optional third slot from `wellcome-gdh7c6kr` or `wellcome-ybfdn8ze`

Why this is the cleaner next lane now:

- `wellcome-sxa9nnuw` is source-ready and broad, with therapeutic annotations and a prescriber-oriented handbook shape
- `wellcome-jxb2z3u7` is source-ready and useful as a dispensatory-reform and antidote witness rather than another deep repeat manual family
- `wellcome-gdh7c6kr` is source-ready, but narrower and title-leading toward a homoeopathic pharmacopoeia lane
- `wellcome-ybfdn8ze` is source-ready and broad, but it deepens an already heavily represented lexicon family
- `wellcome-wrd4fj88` also deepens a dictionary family
- `wellcome-pz2t9kxy` is source-ready but Latin-leading
- `wellcome-x4e5vzzu` is source-ready and substantial, but it deepens a manual family that is already well represented
