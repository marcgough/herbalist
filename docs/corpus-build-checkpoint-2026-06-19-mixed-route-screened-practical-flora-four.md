# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the next mixed acquisition pass completed after the NLM volume-completion and selector-tuning step.

Main outcomes:

- 4 additional rights-cleared works were acquired and chunked successfully
- the pass stayed small and manually screened, using live route checks to avoid the current crop of false-ready Wellcome candidates
- the batch added one uncovered NLM pharmacy-and-new-drugs witness, one prescriber-oriented pharmacopoeia, one large practical-medicine cyclopaedia, and one flora reference with medicinal-use notes
- the derived corpus layers were rebuilt after the pass
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 4 new works

## Mixed route-screened practical, pharmacopoeia, and flora four completed

The following 4 works are now acquired and chunked successfully:

- `nlm-9701530` - *The ethical relations existing between medicine and pharmacy ... investigation of new drugs* - `41` chunks
- `nlm-61860720R` - *The Prescriber's pharmacopoeia ...* - `160` chunks
- `wellcome-jdw9d8sn` - *The cyclopaedia of practical medicine ...* - `6543` chunks
- `wellcome-vhu7ubsh` - *Flora cestrica ... with brief notices of their properties and uses, in medicine, domestic and rural economy, and the arts* - `2523` chunks

All 4 processed successfully.

## Live route-screening notes

Before acquisition, live text probes were used to separate source-ready Wellcome titles from false-ready registry candidates.

Confirmed usable text responses:

- `wellcome-jdw9d8sn`
- `wellcome-vhu7ubsh`
- `wellcome-k79vcnmu`
- `wellcome-nhx2ne6y`
- `wellcome-xy2guga9`

Confirmed current text-endpoint misses:

- `wellcome-takhmyez`
- `wellcome-kw7su3cf`
- `wellcome-ww8gtwfv`

That route screen is why the pass stayed selective instead of simply taking the highest-ranked remaining Wellcome IDs.

## Current corpus totals

- registered works: `2720`
- chunked works: `1204`
- discovered works: `1509`
- failed works: `7`
- chunk records: `1548767`
- paragraph records: `1758918`

### By collection

- NLM Digital Collections: `390` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `787` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `983`
- uncovered frontier families: `903`
- depth frontier families: `193`
- herb candidates: `80652`
- high-confidence herb candidates: `5191`
- medium-confidence herb candidates: `23005`
- low-confidence herb candidates: `52456`
- seed-ready herb families: `124`
- supporting families: `138`
- herb profiles: `124`
- seed-review families: `60427`
- promotion candidates: `143`
- identity-review candidates: `28`
- secondary candidates: `56322`
- deprioritized candidates: `3934`

### Local footprint

- size: `10.627 GiB`
- files: `10358`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3194`
- `edition-family`: `1866`
- `work-summary`: `1204`
- `herb-profile`: `124`

Refresh status after this pass:

- `4` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `nlm-9701530`
  - `nlm-61860720R`
  - `wellcome-jdw9d8sn`
  - `wellcome-vhu7ubsh`

## Selector hardening after this pass

After the mixed pass, the botanical-reference profile was tightened again to suppress three recurring false-positive shapes:

- `prospectus`
- `occurrences which led to the removal`
- `veterinaria`

That change removed the obvious prospectus, institutional-dispute pamphlet, and veterinary lane from the immediate shortlist before the next manual screen.

## Next move

The immediate next lane should remain manually screened.

The strongest present direction is:

- one on-theme NLM herbal or recipe witness
- one controlled companion or pharmacopoeia witness
- at most one route-proven Wellcome title unless more route checks are done first
