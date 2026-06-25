# Herbalisti Corpus Build Checkpoint

Date: 2026-06-23

## Objective

Finish the stalled `wellcome-takhmyez` retry cleanly, keep `Corpus Memory` separate from shared Agent Memory, and leave the local corpus pipeline more resilient than before.

## What changed

### 1. The stalled Wellcome retry was recovered locally

`wellcome-takhmyez` is now fully landed:

- `wellcome-takhmyez`
  - *Pharmacopoeia universalis: or, a new universal English dispensatory / [R. James].*
  - topic family: `pharmacopoeia`
  - source mode: `wellcome_text_zip_fallback`
  - recovery mode: reused previously saved official Wellcome zip artifacts from `corpus/raw/wellcome-takhmyez/`
  - `7307` chunks
  - `7571` paragraphs

The work now has:

- local raw text at `corpus/raw/wellcome-takhmyez/source.txt`
- normalized text at `corpus/normalized/wellcome-takhmyez/text.md`
- chunk output at `corpus/chunks/wellcome-takhmyez.jsonl`
- manifest metadata at `corpus/works/wellcome-takhmyez/manifest.json`

### 2. The Wellcome ingester is sturdier now

`scripts/corpus/build-wellcome-corpus.mjs` was improved so retries can reuse already-downloaded official local artifacts before trying the network again.

That includes:

- reusing local `source-text*.zip` files
- reusing local extracted OCR or `pdftotext` text files
- avoiding a false positive in the "volume-heading only" guard that was incorrectly rejecting a very large real text file
- clearing stale failure-note text from successful registry rows on future successful retries

This matters because it turns interrupted official-source acquisitions into resumable local work instead of forcing another fragile remote attempt.

### 3. Derived corpus layers were rebuilt

After the retry landed, the following derived layers were refreshed:

- registry reconciliation
- edition families
- acquisition frontier
- corpus evidence
- thin-work review
- term families
- seed catalog
- herb profiles
- seed review priority
- site-facing reference catalog
- site-facing herbal corpus export

## Current corpus totals

- registered works: `2720`
- chunked works: `1319`
- discovered works: `1393`
- failed works: `8`
- chunk records: `1731393`
- paragraph records: `1953196`

### By collection

- NLM Digital Collections: `437` chunked of `696`
- Wellcome Collection: `855` chunked of `1997`
- Project Gutenberg: `27` chunked of `27`

### Derived state

- edition families: `1866`
- multi-work families: `411`
- actionable frontier families: `901`
- uncovered frontier families: `840`
- depth frontier families: `171`
- failed-only frontier families: `4`
- herb candidates: `84999`
- chunk signals: `1314279`
- graph nodes: `85067`
- graph edges: `489009`
- accepted term families: `79604`
- review families: `36`
- rejected families: `4004`
- seed-ready families: `124`
- supporting families: `146`
- review seed families: `63759`
- excluded seed families: `15043`
- herb profiles: `124`
- herb-profile matched chunks: `120950`

### Thin-work review

- total chunked works reviewed: `1319`
- flagged works: `166`
- severe-thin works: `92`
- fragment-flagged works: `23`
- reference-flagged works: `104`
- multi-work-family flagged works: `83`

## Corpus Memory

`Corpus Memory` remains separate from shared Agent Memory.

Current live endpoint:

- `http://127.0.0.1:8766`

Current local store:

- `corpus-memory/store/corpus-memory.sqlite3`

Current semantic totals:

- total documents: `3309`
- `edition-family`: `1866`
- `work-summary`: `1319`
- `herb-profile`: `124`

Latest full ingest result:

- `receivedCount`: `3309`
- `insertedCount`: `0`
- `updatedCount`: `3309`
- `prunedCount`: `0`

Retrieval proof for the recovered family:

- `edition-family-pharmacopoeia-universalis-or-a-new-universal-eng-0422b2b560`
  - `chunked_count`: `1`
  - `discovered_count`: `0`
  - `failed_count`: `0`
- `work-wellcome-takhmyez`
  - present in `Corpus Memory`
  - `7307` chunks
  - `7571` paragraphs

## Site-facing catalog state

The generated reference catalog now reflects `1319` locally archived rights-cleared works:

- National Library of Medicine: `437`
- Wellcome Collection: `855`
- Project Gutenberg: `27`

## Outcome

This was a good cleanup-and-progress turn:

- the separate `Corpus Memory` boundary remains intact
- the stalled Wellcome retry is now a real archived work, not a dangling partial attempt
- the retry path is more robust for future official-source recoveries
- the derived corpus layers and semantic layer are back in sync with the live archive

## Recommended next move

Continue with a curated acquisition pass rather than a raw frontier pass, and give first preference to:

1. explicit retry candidates that already have official raw files locally
2. strong uncovered pharmacopoeia, materia-medica, dispensatory, herbal, and practical-reference witnesses
3. candidates that do not expand the thin-work burden disproportionately
