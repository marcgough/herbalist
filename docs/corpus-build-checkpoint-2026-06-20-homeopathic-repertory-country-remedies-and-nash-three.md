# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next manually screened uncovered NLM lane completed after the tuned Thomsonian and botanic-principles pass.

Main outcomes:

- 3 additional rights-cleared NLM works were acquired and chunked successfully
- the lane added one homeopathic repertory and physician's vade-mecum, one regional country-remedies treatise, and one substantial practical family-physician witness
- the derived corpus layers were rebuilt again at the new `1295`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- none of the 3 newly landed works surfaced in `thin-work-review`, so the broader manual remedies lane widened coverage without adding fresh thin-reference burden

## Three newly completed works

The following 3 works are now acquired and chunked successfully:

- `nlm-101303235` - *A pocket manual, or, Repertory of homeopathic medicine* - `82` chunks, `109` paragraphs
- `nlm-2574040R` - *A treatise on the diseases of negroes, as they occur in the island of Jamaica* - `487` chunks, `620` paragraphs
- `nlm-63610710R` - *The third edition of Dr. Nash's practice* - `488` chunks, `494` paragraphs

All 3 processed successfully.

## Editorial note on the lane

This pass was intentionally broader than the immediate Thomsonian and botanic-principles rescue lane.

It widened the archive with:

- one compact remedies-and-repertory witness for practical lookup structure
- one region-specific historical remedies source with country-remedy observations
- one full-scale practical family-physician text

That combination improves later retrieval diversity without falling back into generic repeat dispensatories or the noisy Aristotle and sexual-physiology lane.

## Thin-work review

None of the 3 newly landed works surfaced in `thin-work-review`.

That matters because all 3 can currently stand as normal retrieval witnesses rather than low-weight supplements.

## Current corpus totals

- registered works: `2720`
- chunked works: `1295`
- discovered works: `1417`
- failed works: `8`
- chunk records: `1690812`
- paragraph records: `1907899`

### By collection

- NLM Digital Collections: `418` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `850` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `919`
- uncovered frontier families: `855`
- depth frontier families: `174`
- failed-only frontier families: `4`
- herb candidates: `84328`
- chunk signals: `1284352`
- graph nodes: `84396`
- graph edges: `483997`
- accepted term families: `78976`
- review term families: `36`
- rejected term families: `3971`
- seed-ready herb families: `124`
- supporting families: `145`
- herb profiles: `124`
- seed-review families: `63244`
- promotion candidates: `172`
- identity-review candidates: `34`
- secondary candidates: `58995`
- deprioritized candidates: `4043`

### Thin-work review totals

- total chunked works reviewed: `1295`
- flagged works: `162`
- severe thin works: `89`
- fragment flags: `23`
- reference flags: `101`
- multi-work-family flags: `79`

### Local footprint

- size: `11.46 GiB`
- files: `11113`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3285`
- `edition-family`: `1866`
- `work-summary`: `1295`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new retrieval documents were inserted
- `3282` existing retrieval documents were updated during the full refresh
- exact work-id retrieval was re-verified for:
  - `nlm-101303235` - total `1`, kind `work-summary`, chunk `82`, paragraph `109`
  - `nlm-2574040R` - total `1`, kind `work-summary`, chunk `487`, paragraph `620`
  - `nlm-63610710R` - total `1`, kind `work-summary`, chunk `488`, paragraph `494`

## Selector state after this pass

The refreshed selector is still running under `botanical-practical-reference-2026-06-20`.

Current reserve signals:

- the remaining selected NLM reserve is still `nlm-64230310R`, `nlm-2561026R`, and `nlm-9717182`
- the practical manual trio in this pass did not come from the selected reserve, which confirms that the current tuned botanical profile still misses part of the broader practical-remedies lane
- the selected Wellcome reserve remains dominated by route-bad, no-text, thin, or editorial-hold material and still does not justify a blind batch reopen

## Recommended next move

Next manual-screening move should prefer one of these two paths:

- continue hand-screening uncovered NLM practical manuals, repertories, country-remedy books, and family-physician witnesses outside the current selected reserve
- or create a second broader profile that preserves the current anti-noise brakes while surfacing practical remedies, repertories, and country-remedy books more reliably

The raw top uncovered frontier should still not be trusted directly.

