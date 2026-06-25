# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the mixed-lane acquisition pass completed after the rewritten prescriptions, vade mecum, and Monro supplement checkpoint.

Main outcomes:

- 3 additional rights-cleared works were acquired and chunked successfully
- the pass deliberately pivoted away from a thinning Wellcome-only queue
- 2 NLM reference works and 1 Wellcome bridge work were added in the same batch
- the derived corpus layers were rebuilt after the pass
- `Corpus Memory` was refreshed and work summaries now carry explicit canonical work ids in retrieval text

## Mixed NLM conspectus, Edinburgh, and Cullen three completed

The following 3 works are now acquired and chunked successfully:

- `nlm-101602783` - *A conspectus of the pharmacopoeias ...* - `44` chunks
- `nlm-2561027R` - *The Edinburgh new dispensatory ...* - `1730` chunks
- `wellcome-bguddw3c` - *The works of William Cullen ...* - `3816` chunks

All 3 processed successfully through the current official-source acquisition paths.

## Batch characteristics

Taken together, this pass broadened the archive along three useful axes:

- one compact pharmacopoeia and materia-medica conspectus with strong index value
- one large Edinburgh dispensatory witness that deepens the pharmacopoeia and formulary lane materially
- one substantial Cullen bridge work that strengthens the practice-of-physic and materia-medica connection without padding the batch with weaker Wellcome residue

This was a better use of the next acquisition cycle than forcing another pure-Wellcome trio after the remaining Wellcome queue had become more repetition-prone and editorially noisy.

## Current corpus totals

- registered works: `2720`
- chunked works: `1188`
- discovered works: `1525`
- failed works: `7`
- chunk records: `1527047`
- paragraph records: `1731631`

### By collection

- NLM Digital Collections: `376` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `785` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `992`
- uncovered frontier families: `909`
- depth frontier families: `196`
- herb candidates: `80438`
- high-confidence herb candidates: `5168`
- medium-confidence herb candidates: `22785`
- low-confidence herb candidates: `52485`
- seed-ready herb families: `124`
- supporting families: `138`
- herb profiles: `124`
- seed-review families: `60251`
- promotion candidates: `140`
- identity-review candidates: `27`
- secondary candidates: `56143`
- deprioritized candidates: `3941`
- thin-work review flags: `146`

### Local footprint

- size: `10.511 GiB`
- files: `10227`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3178`
- `edition-family`: `1866`
- `work-summary`: `1188`
- `herb-profile`: `124`

Refresh status after this pass:

- the full refresh completed successfully
- work summaries now embed the literal canonical `work_id` in searchable text
- metadata URLs are now also carried in retrieval text for work summaries
- exact work-id retrieval was re-verified for:
  - `nlm-101602783`
  - `nlm-2561027R`
  - `wellcome-bguddw3c`

## Lane status after this pass

Completed in this pass:

- `nlm-101602783`
- `nlm-2561027R`
- `wellcome-bguddw3c`

Superseded as the immediate next-lane note:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twenty-eighth-wellcome-pass.md`

Manual retry lane still includes:

- `wellcome-bkdvy7wy`
- `wellcome-gj4s5ed2`

Existing separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The current refreshed selector output still produces a usable review queue, but not a trustworthy blind batch. The remaining Wellcome lane now mixes some real book-scale candidates with tract-shaped, prospectus-shaped, article-reprint, and repeat-family witnesses.

That means the next campaign should:

- stay mixed-lane or NLM-led by default
- keep manual screening in front of any new Wellcome three-book batch
- prefer book-scale herbals, dispensatories, therapeutics, and durable reference works
- avoid creating another automatic `workids.txt` batch until the next shortlist is manually route-verified
