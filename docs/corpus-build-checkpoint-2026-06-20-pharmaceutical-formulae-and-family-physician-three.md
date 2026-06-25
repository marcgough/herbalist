# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next mixed Wellcome and NLM lane completed after the chemical-dispensatory, compendium, and NLM lexicon follow-up pass.

Main outcomes:

- 3 additional rights-cleared works were acquired and chunked successfully across Wellcome and NLM
- the lane added one practical pharmaceutical-formula compend and two substantive family-physician witnesses
- the derived corpus layers were rebuilt again at the new `1274`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- none of the 3 newly landed works surfaced a new `thin-work-review` flag
- the refreshed selector removed `wellcome-gfr7cke2` from reserve and introduced `wellcome-yhv25daq` as the next selected Wellcome replacement

## Three newly completed works

The following 3 works are now acquired and chunked successfully:

- `wellcome-gfr7cke2` - *Physicians' medical compend and pharmaceutical formulae* - `390` chunks, `396` paragraphs
- `nlm-64220630R` - *The American improved family physician, or home doctor* - `124` chunks, `161` paragraphs
- `nlm-63560990R` - *The physiological family physician* - `428` chunks, `795` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this lane materially improved the practical-reference core:

- `wellcome-gfr7cke2` adds a compact but substantial formula and compend witness anchored in practical pharmaceutical use
- `nlm-64220630R` adds a concise but still book-scale family physician witness rather than another thin leaflet or fragment
- `nlm-63560990R` adds a much larger domestic-medicine and family-physician volume that broadens the non-Wellcome practical reference layer

## Editorial note on thin-work review

The 3 newly landed works all stayed out of `thin-work-review`:

- `wellcome-gfr7cke2` was not flagged
- `nlm-64220630R` was not flagged
- `nlm-63560990R` was not flagged

That matters because this pass added practical density without introducing another lower-weight fragment witness.

## Current corpus totals

- registered works: `2720`
- chunked works: `1274`
- discovered works: `1439`
- failed works: `7`
- chunk records: `1674912`
- paragraph records: `1888602`

### By collection

- NLM Digital Collections: `399` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `848` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `934`
- uncovered frontier families: `871`
- depth frontier families: `174`
- herb candidates: `83951`
- chunk signals: `1273238`
- graph nodes: `84019`
- graph edges: `480954`
- accepted term families: `78612`
- review term families: `36`
- rejected term families: `3959`
- seed-ready herb families: `124`
- supporting families: `145`
- herb profiles: `124`
- seed-review families: `62929`
- promotion candidates: `170`
- identity-review candidates: `32`
- secondary candidates: `58691`
- deprioritized candidates: `4036`

### Thin-work review

- total chunked works reviewed: `1274`
- flagged works: `155`
- severe thin works: `84`
- fragment flags: `23`
- reference flags: `95`
- multi-work-family flags: `75`

### Local footprint

- size: `11.38 GiB`
- files: `10939`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3264`
- `edition-family`: `1866`
- `work-summary`: `1274`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new work-summary documents were inserted
- `3261` existing retrieval documents were updated during the full refresh
- exact work-id retrieval was re-verified for:
  - `wellcome-gfr7cke2` - total `1`, kind `work-summary`, chunk `390`, paragraph `396`
  - `nlm-64220630R` - total `1`, kind `work-summary`, chunk `124`, paragraph `161`
  - `nlm-63560990R` - total `1`, kind `work-summary`, chunk `428`, paragraph `795`

## Selector state after this pass

The refreshed selector moved cleanly after this lane.

Current selected reserve signals:

- `wellcome-yhv25daq` is now the new selected Wellcome replacement after `wellcome-gfr7cke2` was consumed
- `wellcome-gpp79sus` remains source-ready but should stay held back for dental drift
- `wellcome-qk5mzrqw` remains source-ready but should stay held back for trade, seamen-health, and travel-station drift
- `wellcome-ubh77647` still returns `404` on the official text endpoint
- `nlm-101526718` remains present as an optional browser-assisted lexicon repeat rather than a must-take next slot

Relevant next NLM uncovered-family leads still visible in the frontier:

- `nlm-63950560R` - *The hydropathic family physician*
- `nlm-2672001R` - *The modern family physician*

Both already have official NLM OCR routes registered in the local registry and remain cleaner practical-reference follow-ups than the held Wellcome drift titles.

## Recommended next move

Next manual-screening lane should prefer:

- `wellcome-yhv25daq`
- `nlm-63950560R`
- `nlm-2672001R`

Keep these as optional or held:

- `nlm-101526718` only if we deliberately want one more lexicon-family repeat
- `wellcome-gpp79sus` as a dental hold
- `wellcome-qk5mzrqw` as a travel and seamen-health hold
