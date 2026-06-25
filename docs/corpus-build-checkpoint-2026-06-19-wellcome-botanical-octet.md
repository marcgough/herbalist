# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the first clean plant-centered Wellcome follow-up after the lock-hardening pass and NLM botanical expansion.

Main outcomes:

- 8 additional rights-cleared Wellcome books were acquired successfully with no failures
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1093` work summaries
- the botanical shortlist has now cleanly split into a completed Wellcome forward lane and a remaining NLM retry lane

## Wellcome botanical expansion completed

The following 8 Wellcome works were acquired and chunked successfully:

- `wellcome-jksmvzyw` - *A botanic guide to health and the natural pathology of disease*
- `wellcome-vgjy5u3h` - *A botanical guide to the flowering plants, ferns, mosses, and algae ... with medicinal and other uses*
- `wellcome-es4df5km` - *A materia medica of the United States*
- `wellcome-fea33gst` - *The vegetable materia medica and practice of medicine*
- `wellcome-u44r9mdb` - *The northern flora*
- `wellcome-ky8xjkys` - *The English flora*
- `wellcome-n2xtpfzt` - *The flora of the Alps*
- `wellcome-ukd65cej` - *The students' flora of New Zealand and the outlying islands*

All 8 processed successfully.

## Batch characteristics

The first four titles added a strong blend of:

- botanic-health framing
- plant-use context
- materia medica coverage
- practical remedy language

The second four titles deepened the archive with broader flora coverage across:

- Scotland
- England
- the Alps
- New Zealand

This is useful for later plant normalization, family linkage, and country-aware source discovery without leaving the rights-cleared book lane.

## Current corpus totals

- registered works: `2720`
- chunked works: `1093`
- discovered works: `1622`
- failed works: `5`
- chunk records: `1353961`
- paragraph records: `1554027`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `692` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1062`
- uncovered frontier families: `984`
- depth frontier families: `196`
- herb candidates: `75455`
- seed-ready herb families: `124`
- supporting families: `121`
- herb profiles: `124`
- seed-review families: `56366`
- promotion candidates: `113`
- identity-review candidates: `26`
- secondary candidates: `52477`
- deprioritized candidates: `3750`
- thin-work review flags: `142`

### Local footprint

- size: `9.25 GiB`
- files: `9378`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Verified after the refresh:

- total documents: `3083`
- `edition-family`: `1866`
- `work-summary`: `1093`
- `herb-profile`: `124`

Latest ingest result:

- received: `3083`
- inserted: `8`
- updated: `3075`
- pruned: `0`

Retrieval sanity check also passed with `English flora`, which now resolves to both edition-family and work-summary records in the refreshed semantic layer.

## Lane status after this pass

Completed clean forward lane:

- the full 8-book Wellcome half of the manual botanical shortlist

Remaining retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`
- older manual retry records already called out in the previous checkpoint

## Next move

Either:

- generate a fresh plant-centered forward shortlist from the updated Wellcome frontier, or
- take a dedicated NLM retry pass if the goal is to close the remaining botanical family gaps before widening again

For corpus growth alone, the next best move is another clean forward shortlist rather than spending the whole lane on browser-fragile NLM recovery.
