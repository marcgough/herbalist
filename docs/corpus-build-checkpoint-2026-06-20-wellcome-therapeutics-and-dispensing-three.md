# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next Wellcome-led therapeutics and dispensing pass completed after the Lindley, manual, and prescriber three checkpoint.

Main outcomes:

- 3 additional rights-cleared Wellcome works were acquired and chunked successfully
- the pass added one dispensing-focused British-pharmacopoeia laboratory course, one large therapeutics-and-toxicology treatise, and one narrower phosphorus monograph
- the derived corpus layers were already rebuilt at the new `1220`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- widened manifest-derived route probing now gives us a stronger next Wellcome reserve than the archive had before this pass

## Wellcome therapeutics and dispensing three completed

The following 3 works are now acquired and chunked successfully:

- `wellcome-hz9mwjjm` - *A laboratory course of pharmacy and materia medica ...* - `779` chunks, `788` paragraphs
- `wellcome-ea93a269` - *A treatise on therapeutics ...* - `2599` chunks, `2624` paragraphs
- `wellcome-efy6q6j4` - *Free phosphorus in medicine ...* - `512` chunks, `514` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this pass did four useful jobs for the archive:

- added a practical dispensing-and-pharmacopoeia bridge that is easier to use for operational retrieval than another dictionary repeat
- strengthened the broader therapeutics layer with a large, text-rich clinical reference
- kept one narrower but still book-scale materia-medica witness that may help later evidence linking around phosphorus, neuralgia, and historical drug framing
- widened the next route-ready reserve enough that the following pass can stay book-shaped without defaulting back to heavy lexicon depth

## Editorial note on thin-work review

None of the newly landed works were flagged in `thin-work-review`.

That matters because this pass added breadth without introducing another small reference witness that would need special weighting treatment.

## Current corpus totals

- registered works: `2720`
- chunked works: `1220`
- discovered works: `1493`
- failed works: `7`
- chunk records: `1563468`
- paragraph records: `1775318`

### By collection

- NLM Digital Collections: `396` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `797` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `972`
- uncovered frontier families: `898`
- depth frontier families: `185`
- herb candidates: `81320`
- chunk signals: `1194690`
- graph nodes: `81388`
- graph edges: `467002`
- seed-ready herb families: `124`
- supporting families: `139`
- herb profiles: `124`
- seed-review families: `60903`
- promotion candidates: `149`
- identity-review candidates: `30`
- secondary candidates: `56773`
- deprioritized candidates: `3951`

### Thin-work review

- total chunked works reviewed: `1220`
- flagged works: `153`
- severe thin works: `82`
- fragment flags: `23`
- reference flags: `94`
- multi-work-family flags: `74`

### Local footprint

- size: `10.72 GiB`
- files: `10491`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3210`
- `edition-family`: `1866`
- `work-summary`: `1220`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `wellcome-hz9mwjjm`
  - `wellcome-ea93a269`
  - `wellcome-efy6q6j4`

## Selector state after this pass

The widened route-ready reserve is now stronger than the previous immediate lane:

- strongest broadening leads now include `wellcome-mazvcjjv` and `wellcome-zvb4nnsd`
- further source-ready reserve options include `wellcome-zjkfqhnm`, `wellcome-ynsejrrk`, `wellcome-ybfdn8ze`, `wellcome-wrd4fj88`, `wellcome-pz2t9kxy`, and `wellcome-x4e5vzzu`
- current hold-backs due to route failure or non-ready status remain `wellcome-takhmyez`, `wellcome-kw7su3cf`, `wellcome-ww8gtwfv`, `wellcome-n2yp92tq`, and `wellcome-jkjv35ym`

## Next move

The next lane should stay manually screened.

The strongest current shape is likely:

- `wellcome-mazvcjjv` first
- `wellcome-zvb4nnsd` second
- one optional third slot from `wellcome-ynsejrrk` or `wellcome-zjkfqhnm`, depending on whether we want prescriptions breadth or another large materia-medica manual
