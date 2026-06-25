# Herbalisti Corpus Summary - 2026-06-22

## What was decided

The Herbalisti book corpus remains managed as a separate `Corpus Memory` semantic archive rather than sharing the live Agent Memory database.

## Why it matters

This keeps the public-source corpus cleanly isolated from operator notes, project briefs, and general working memory while preserving the same style of semantic retrieval architecture.

## Current state

- `Corpus Memory` is represented in the local SQLite store at `corpus-memory/store/corpus-memory.sqlite3`
- the corpus now holds `1318` chunked works and `3308` retrieval documents
- the tighter practical-remedies selector profile now lives at `corpus/review/frontier-profiles/practical-remedies-reference-2026-06-21.json`
- the latest Wellcome-led lane landed:
  - `wellcome-wkhtmbyj`
  - `wellcome-ubh77647`
- `wellcome-wkhtmbyj` and `wellcome-ubh77647` both stayed out of `thin-work-review`
- direct SQLite verification confirmed both new `Corpus Memory` work-summary documents with the expected chunk and paragraph counts
- `wellcome-takhmyez` fetched official raw-source files but stalled before manifest and chunk output, so it remains a retry lane item in `discovered` state
- the practical-remedies profile continues to help the curated Wellcome lane more than the NLM depth lane: the newest pair both landed as substantive book-scale additions while the NLM reserve remains same-family and thin-risk heavy
- `nlm-101125242` remains parked in manual retry after the OCR route failed to expose a trusted `<pre>` body
- the earlier tuned botanical profile still matters as a rescue lane, but the practical-remedies profile is now the better steering layer for broader manual-widening work
- the derived corpus layers were refreshed again cleanly at the new archive size, including edition families, frontier, evidence, thin-work review, term families, seed catalog, seed priority, herb profiles, and the separate `Corpus Memory` archive

## Next action

The current position is stronger than the older `1316` state, and the latest Wellcome follow-up reinforced the same directional lesson: the next gain will come from protecting the curated lane from noisier student, exam-board, foreign-language-leading, and repeat-depth shapes rather than continuing blindly into the current reserve.

Current route note:

- the remaining selected NLM reserve is now `nlm-101313341`, `nlm-2561026R`, `nlm-64230310R`, `nlm-9717182`, and `nlm-63570300R`
- `nlm-101313341` is the next same-family hold surfaced by the tightened profile, but `nlm-101313340` landing thin means it should not be trusted blindly
- `nlm-2561026R` is still better treated as repeat-heavy dispensatory depth
- `nlm-64230310R` is still better treated as same-family botanical-principles depth
- `nlm-9717182` remains a generic pharmacopoeia hold pending a stronger reason to spend a batch slot there
- `nlm-63570300R` is now materially weaker after `nlm-8206608` from the same family landed as `severe-thin-reference`
- `nlm-101125242` remains a separate importer-recovery and manual-retry lane rather than a normal next-batch candidate
- the landed Wellcome pair removed the best current book-scale holds from the reserve, so the remaining Wellcome lane is now more mixed: `wellcome-takhmyez` still matters as a retry candidate, but `wellcome-ndctabm6`, `wellcome-jkjv35ym`, `wellcome-f6f97kmm`, `wellcome-qb3dkxup`, and `wellcome-wmrh7xf2` each carry either student, exam-board, foreign-language-leading, or repeat-depth drag
- raw uncovered-frontier top ranks are still too noisy and still over-admit Aristotle master-piece variants, sexual-physiology material, and other off-mission domestic-medicine witnesses
- `nlm-101178768` and `nlm-101313340` landing thin now lower confidence both in almanac / guide-to-health uncovered shapes and in the next same-family homoeopathic domestic-physician depth hold
- the safer next move is now either an isolated retry of `wellcome-takhmyez`, or a further selector-tightening pass that cools foreign-language-leading, student, and exam-board shapes before another Wellcome-led batch
- for this practical-remedies lane, the curated selector is now a safer steering layer than a raw frontier-batch dry run, which still surfaced noisier NLM uncovered candidates than the curated pass did

## Constraints

- books only
- no web scraping
- no API-key-dependent sources at this stage
- continue preferring public-domain or clearly permissive official collection routes
