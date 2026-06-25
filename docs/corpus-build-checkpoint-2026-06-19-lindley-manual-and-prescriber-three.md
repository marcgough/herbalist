# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the next mixed reference pass completed after the Lindley botany pair checkpoint.

Main outcomes:

- 3 additional rights-cleared works were acquired and chunked successfully
- the pass added one fifth-edition Lindley botany witness, one large materia-medica and therapeutics manual, and one small prescriber-oriented pharmacopoeia anchor
- the derived corpus layers were rebuilt after the pass
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- the route picture widened again after a manifest-derived live check showed several additional Wellcome text endpoints are source-ready, including two candidates that had looked doubtful under earlier rough probing

## Lindley, manual, and prescriber three completed

The following 3 works are now acquired and chunked successfully:

- `wellcome-qtbs8rc4` - *The elements of botany, structural, physiological, systematicl, and medical ...* - `689` chunks, `694` paragraphs
- `wellcome-k79vcnmu` - *A manual of materia medica and therapeutics ...* - `2606` chunks, `2618` paragraphs
- `nlm-61860730R` - *The Prescriber's pharmacopoeia ...* - `32` chunks, `108` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this pass did four useful jobs for the archive:

- continued the Lindley botany lane with another substantial edition witness
- added a large and text-rich materia-medica manual that deepens the practical therapeutics layer
- kept one standards-oriented pharmacopoeia lane moving, even though that witness is clearly reference-shaped rather than book-scale
- exposed a better next-lane Wellcome reserve by forcing live checks from manifest-derived text IDs instead of relying on rougher assumptions

## Editorial note on thin-work review

One of the newly landed works was immediately flagged in thin-work review:

- `nlm-61860730R`
  - review class: `severe-thin-reference`
  - recommendation: keep as a standards anchor, but weight it as a reference witness rather than a full-scale practical manual

That does not make the acquisition a mistake. It means the archive is now explicitly classifying a small pharmacopoeia witness that is useful for names, actions, and dose structure, without letting it blur into the same retrieval pool as the larger manuals.

## Current corpus totals

- registered works: `2720`
- chunked works: `1217`
- discovered works: `1496`
- failed works: `7`
- chunk records: `1559578`
- paragraph records: `1771392`

### By collection

- NLM Digital Collections: `396` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `794` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `974`
- uncovered frontier families: `898`
- depth frontier families: `187`
- herb candidates: `81270`
- seed-ready herb families: `124`
- supporting families: `139`
- herb profiles: `124`
- seed-review families: `60860`
- promotion candidates: `147`
- identity-review candidates: `30`
- secondary candidates: `56734`
- deprioritized candidates: `3949`

### Local footprint

- size: `10.696 GiB`
- files: `10466`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3207`
- `edition-family`: `1866`
- `work-summary`: `1217`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `wellcome-qtbs8rc4`
  - `wellcome-k79vcnmu`
  - `nlm-61860730R`

## Selector state after this pass

The refreshed botanical-reference selector now shows a more clearly Wellcome-heavy next reserve:

- the NLM side has shrunk to 5 remaining candidates, all weaker immediate fits than the best current Wellcome pool
- `wellcome-hz9mwjjm`, `wellcome-ea93a269`, `wellcome-x4e5vzzu`, `wellcome-efy6q6j4`, `wellcome-pz2t9kxy`, `wellcome-wrd4fj88`, and `wellcome-ybfdn8ze` all now have manifest-derived live text confirmation
- `wellcome-n2yp92tq` and `wellcome-jkjv35ym` still fail the live text check
- the older route misses remain unchanged for `wellcome-takhmyez`, `wellcome-kw7su3cf`, and `wellcome-ww8gtwfv`

## Next move

The next lane should stay manually screened.

The strongest current shape is likely:

- `wellcome-hz9mwjjm` first
- `wellcome-ea93a269` second
- one optional third slot from `wellcome-x4e5vzzu`, `wellcome-efy6q6j4`, or `wellcome-pz2t9kxy`, depending on whether we want more manual depth, a narrower monograph, or a Latin-leading bridge witness
