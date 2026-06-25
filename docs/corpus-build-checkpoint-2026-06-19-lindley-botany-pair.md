# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the next route-proven Wellcome botany pass completed after the standards, herbal, and route-proven four checkpoint.

Main outcomes:

- 2 additional rights-cleared works were acquired and chunked successfully
- the pass added two John Lindley botany references with explicit medical framing and strong plant-identification value
- the derived corpus layers were rebuilt after the pass
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for both new works
- the immediate next-lane route picture is now clearer: one new Lindley reserve still lacks text, while a fifth-edition Lindley witness and one deeper manual remain live

## Lindley botany pair completed

The following 2 works are now acquired and chunked successfully:

- `wellcome-bxdn87b9` - *Elements of botany, structural, physiological, systematical, and medical ...* - `561` chunks, `562` paragraphs
- `wellcome-vh28hz64` - *Medical and economical botany ...* - `451` chunks, `455` paragraphs

Both processed successfully.

## Batch characteristics

Taken together, this pass did three useful jobs for the archive:

- strengthened the plant-identification and botanical-structure side of the corpus with large book-scale witnesses
- added explicit medical framing inside the same botany lane, which should help later evidence extraction connect plant description and medicinal context more cleanly
- validated that the official Wellcome text route is still a viable acquisition path for at least part of the Lindley family

## Current corpus totals

- registered works: `2720`
- chunked works: `1214`
- discovered works: `1499`
- failed works: `7`
- chunk records: `1556251`
- paragraph records: `1767972`

### By collection

- NLM Digital Collections: `395` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `792` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `976`
- uncovered frontier families: `899`
- depth frontier families: `188`
- herb candidates: `81125`
- seed-ready herb families: `124`
- supporting families: `138`
- herb profiles: `124`
- seed-review families: `60764`
- promotion candidates: `146`
- identity-review candidates: `29`
- secondary candidates: `56642`
- deprioritized candidates: `3947`

### Local footprint

- size: `10.675 GiB`
- files: `10441`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3204`
- `edition-family`: `1866`
- `work-summary`: `1214`
- `herb-profile`: `124`

Refresh status after this pass:

- `2` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `wellcome-bxdn87b9`
  - `wellcome-vh28hz64`

## Selector state after this pass

The refreshed botanical-reference selector now shows the next split more clearly:

- the just-consumed Lindley pair has dropped out of the queue, as expected
- `wellcome-qtbs8rc4` now stands out as the strongest remaining route-proven Lindley reserve
- `wellcome-k79vcnmu` remains a viable deeper repeat manual if we want one robust materia-medica anchor beside the botany lane
- `wellcome-n2yp92tq` still ranks in the selector, but the live text endpoint currently returns no text resource

## Next move

The next lane should stay manually screened.

The strongest current shape is likely:

- `wellcome-qtbs8rc4` first
- `wellcome-k79vcnmu` second if we deliberately want one deeper but text-rich manual
- `nlm-61860730R` only as an optional standards-depth third slot
