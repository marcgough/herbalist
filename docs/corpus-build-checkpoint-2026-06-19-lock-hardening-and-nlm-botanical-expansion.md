# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the lock-hardening pass on the corpus builders, the proof that long Wellcome recovery work no longer blocks the rest of the archive, and the first successful post-hardening botanical NLM follow-up.

Main outcomes:

- works-registry writes are now short and atomic instead of spanning whole download and OCR runs
- request and command timeouts now bound slow fetch, text extraction, and OCR recovery paths
- long PDF OCR recovery is now observable and recoverable instead of silently monopolizing the pipeline
- 6 additional NLM works were acquired and chunked successfully
- the separate `Corpus Memory` archive was re-ingested and now matches the expanded corpus state exactly

## Hardening outcome

The Wellcome recovery lane exposed the main operational issue clearly: the old builder shape could hold the works-registry lock across a whole discovery plus processing run, which meant one slow PDF recovery could stall unrelated corpus work.

That behavior is now corrected.

The builders now merge discovery rows and per-work status updates in short atomic windows. During live verification, a heavy OCR recovery attempt for `wellcome-n2yp92tq` was allowed to run in the background while registry maintenance completed normally in parallel. That confirmed the broader corpus can continue moving even when one recovery candidate is slow.

`wellcome-n2yp92tq` remains in `discovered` state for a later dedicated heavy OCR pass. It is no longer treated as a shared lock failure.

## NLM botanical expansion completed

The first post-hardening botanical follow-up added these 6 NLM works successfully:

- `nlm-2558003RX3` - *An improved system of botanic medicine* (Volume 3)
- `nlm-2558004RX2` - *An improved system of botanic medicine* (Volume 3)
- `nlm-2661459RX4` - *Flora Londinensis* (Volume 2, Part 4)
- `nlm-2575010R` - *New guide to health, or Botanic family physician*
- `nlm-64230790R` - *New guide to health, or, Botanic family physician*
- `nlm-101646240` - *A manual of organic materia medica*

These additions were followed by a derived-layer rebuild and a registry reconcile pass.

## Retry lanes now explicit

Three additional NLM botanical targets did not complete in the same pass and now sit in explicit retry lanes instead of being left ambiguous:

- `nlm-2661459RX5` - browser-assisted OCR route failure during retrieval
- `nlm-2661459RX6` - browser-assisted OCR route failure during retrieval
- `nlm-64210320R` - NLM browser verification challenge still blocking OCR retrieval

Two earlier NLM records remain in manual retry state as well:

- `nlm-101139425`
- `nlm-101305069`

## Current corpus totals

- registered works: `2720`
- chunked works: `1085`
- discovered works: `1630`
- failed works: `5`
- chunk records: `1347546`
- paragraph records: `1547546`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `684` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1069`
- uncovered frontier families: `988`
- depth frontier families: `199`
- herb candidates: `74917`
- seed-ready herb families: `124`
- supporting families: `121`
- herb profiles: `124`
- seed-review families: `55927`
- promotion candidates: `112`
- identity-review candidates: `26`
- secondary candidates: `52081`
- deprioritized candidates: `3708`
- thin-work review flags: `141`

### Local footprint

- size: `9.20 GiB`
- files: `9308`

## Corpus Memory status

`Corpus Memory` remains separate from shared working memory and is live at `127.0.0.1:8766`.

Verified after the fresh ingest:

- total documents: `3075`
- `edition-family`: `1866`
- `work-summary`: `1085`
- `herb-profile`: `124`

Latest ingest result:

- received: `3075`
- inserted: `6`
- updated: `3069`
- pruned: `0`

Retrieval sanity check also passed after the ingest, with botanical queries resolving against the refreshed family and work-summary documents.

## Next move

Continue from the manual botanical shortlist and keep the slow or browser-fragile items in their own recovery lane. That preserves forward motion on rights-cleared book acquisition without letting a small number of awkward records dominate the build.
