# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next Wellcome-led botanical home-physician and prescriptions pass completed after the therapeutics and dispensing three checkpoint.

Main outcomes:

- 3 additional rights-cleared Wellcome works were acquired and chunked successfully
- the pass added one botanical-system family physician, one pharmacological-and-botanical papers volume, and one large prescriptions compendium
- the derived corpus layers were rebuilt again at the new `1223`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- the next source-ready reserve widened again, but the refreshed selector still needs manual screening because some of its highest-ranked Wellcome entries continue to be route-bad or weaker retrieval fits

## Botanical home physician and prescriptions three completed

The following 3 works are now acquired and chunked successfully:

- `wellcome-mazvcjjv` - *The home physician, or, A treatise upon the cure of diseases by the botanical system of medicine ...* - `1063` chunks, `1078` paragraphs
- `wellcome-zvb4nnsd` - *Science papers : chiefly pharmacological and botanical ...* - `1301` chunks, `1307` paragraphs
- `wellcome-ynsejrrk` - *The book of prescriptions ...* - `1014` chunks, `1015` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this pass did four useful jobs for the archive:

- added a practical botanical-system bridge that speaks directly to family and practitioner use
- strengthened the botanical-pharmacological evidence layer with a solid book-scale papers volume
- added prescription-oriented breadth that should help later retrieval around remedies, dose structure, and cross-reference use
- widened the next route-ready reserve enough that we can keep favoring broader book-shaped witnesses instead of defaulting to more dictionary depth

## Editorial note on thin-work review

None of the newly landed works were flagged in `thin-work-review`.

That matters because this pass added meaningful breadth without increasing the archive's thin-reference burden.

## Current corpus totals

- registered works: `2720`
- chunked works: `1223`
- discovered works: `1490`
- failed works: `7`
- chunk records: `1566846`
- paragraph records: `1778718`

### By collection

- NLM Digital Collections: `396` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `800` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `969`
- uncovered frontier families: `897`
- depth frontier families: `183`
- herb candidates: `81380`
- chunk signals: `1197324`
- graph nodes: `81448`
- graph edges: `467399`
- accepted term families: `76176`
- review term families: `35`
- rejected term families: `3871`
- seed-ready herb families: `124`
- supporting families: `139`
- herb profiles: `124`
- seed-review families: `60946`
- promotion candidates: `149`
- identity-review candidates: `30`
- secondary candidates: `56816`
- deprioritized candidates: `3951`

### Thin-work review

- total chunked works reviewed: `1223`
- flagged works: `153`
- severe thin works: `82`
- fragment flags: `23`
- reference flags: `94`
- multi-work-family flags: `74`

### Local footprint

- size: `10.74 GiB`
- files: `10516`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3213`
- `edition-family`: `1866`
- `work-summary`: `1223`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `wellcome-mazvcjjv`
  - `wellcome-zvb4nnsd`
  - `wellcome-ynsejrrk`

## Selector state after this pass

The refreshed selector remains noisy at the very top, so the next lane should stay manually screened.

Current route-ready reserve:

- `wellcome-zjkfqhnm`
- `wellcome-g3mr6uq5`
- `wellcome-za7rnxwq`
- `wellcome-v765jzmt`
- `wellcome-ybfdn8ze`
- `wellcome-wrd4fj88`
- `wellcome-pz2t9kxy`
- `wellcome-x4e5vzzu`

Current route-bad or non-ready holds:

- `wellcome-takhmyez`
- `wellcome-kw7su3cf`
- `wellcome-jkjv35ym`
- `wellcome-f6f97kmm`
- `wellcome-ww8gtwfv`
- `wellcome-xtum85vk`
- `wellcome-bn68mk4f`
- `wellcome-n2yp92tq`

## Next move

The strongest current shape is likely:

- `wellcome-zjkfqhnm` first
- `wellcome-g3mr6uq5` second
- one optional third slot from `wellcome-za7rnxwq` or `wellcome-v765jzmt`, depending on whether we want broader historical-public-health context or a pharmacopoeia-and-remedies bridge
