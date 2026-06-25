# Corpus Build Checkpoint - 2026-06-19 Selector Pruning and Second Twenty-Work Expansion

Date: 2026-06-19

## What changed

This pass continued the corpus-first build in three useful ways:

1. The curated-reference selector was tightened again so it now downranks more administrative, promotional, fragmentary, and repeat-heavy witnesses before acquisition.
2. Twenty additional rights-cleared works were acquired locally from the existing official no-key lanes.
3. The derived corpus layers and the separated `Corpus Memory` archive were refreshed from the expanded state.

## Selector hardening

Updated file:

- `scripts/corpus/select-curated-reference-candidates.mjs`

The selector now additionally penalizes:

- questions-and-answers and quiz-compend exam shapes
- pamphlets, memorials, trustee appeals, and convention minutes
- trade and manufacturer copy such as formula lists, price-and-dose labels, and product-specialty sheets
- farrier, horse, and other veterinary shapes
- reminiscence and repertory shapes that are less suitable for the public reference core
- deeper repeat-family witnesses through steeper family-representation penalties

After the post-batch rerun, the selector still found a substantial remaining frontier, but the lane is cleaner:

- discovered candidates considered: `940`
- unique family candidates ranked: `601`
- current selector worklist size: `72`
- current per-collection worklists:
  - NLM Digital Collections: `32`
  - Wellcome Collection: `40`

## New works acquired in this pass

### NLM Digital Collections

- `nlm-61631010RX2` - `The family flora and materia medica botanica` (Volume 2)
- `nlm-7704360` - `The botanist & physician`
- `nlm-101646219` - `A manual of organic materia medica`
- `nlm-2546032R` - `The family adviser, calculated to teach the principles of botany`
- `nlm-2932043R` - `Medical recipes and prescriptions`
- `nlm-63560530R` - `Family medical adviser`
- `nlm-63330560R` - `The physician's assistant`
- `nlm-2449056RX2` - `A curious herbal` (Volume 2)
- `nlm-2661459RX2` - `Flora Londinensis` (Volume 1, Part 2)
- `nlm-2556052R` - `A new and complete American medical family herbal`

### Wellcome Collection

- `wellcome-sheq8r6r` - `The Edinburgh new dispensatory`
- `wellcome-hnx4jyzh` - `Gray's supplement to the pharmacopoeia`
- `wellcome-c66j28sv` - `Royle's manual of materia medica and therapeutics`
- `wellcome-kpw6zk49` - `Medicines : their uses and mode of administration`
- `wellcome-jt4unq8f` - `American materia medica, therapeutics and pharmacognosy`
- `wellcome-zfc8rmzm` - `Pharmacopoeia pauperum, or the hospital dispensatory`
- `wellcome-ad3jb3wr` - `The British dispensatory`
- `wellcome-f9769f9b` - `The dispensatory and pharmacopoeia of North America and Great Britain`
- `wellcome-vbg4yw6u` - `A new medical dictionary`
- `wellcome-xkngngtr` - `The extra pharmacopoeia of unofficial drugs and chemical and pharmaceutical preparations`

All 20 processed successfully with no new failures.

## Verified corpus state after this pass

- registered works: 2,720
- chunked works: 1,058
- discovered works still queued: 1,660
- failed works: 2
- chunk records: 1,315,450
- paragraph records: 1,509,054

Collection mix:

- Project Gutenberg: 27 chunked of 27 total
- NLM Digital Collections: 358 chunked of 696 total
- Wellcome Collection: 673 chunked of 1,997 total

Derived layers after rebuild:

- edition families: 1,866
- multi-work families: 411
- actionable frontier families: 1,083
- uncovered frontier families: 996
- depth frontier families: 205
- herb candidates: 73,359
- high-confidence herb candidates: 4,753
- accepted term families: 68,520
- accepted plant families: 68,093
- accepted materia-medica families: 427
- seed-ready herb families: 124
- supporting families: 123
- total seed-review families: 53,574
- promotion candidates: 92
- identity-review candidates: 24
- secondary candidates: 49,872
- deprioritized candidates: 3,586
- thin-work review flags: 140

Local corpus footprint:

- 9,074 files
- 8.95 GB

## Corpus Memory refresh

The separated `Corpus Memory` archive was re-ingested and restarted after the rebuild.

Verified local service state:

- base URL: `http://127.0.0.1:8766`
- total documents: 3,048
- `edition-family`: 1,866
- `work-summary`: 1,058
- `herb-profile`: 124

Latest ingest result:

- received: `3,048`
- inserted: `20`
- updated: `3,028`
- pruned: `0`

Verification checks completed:

- HTTP stats endpoint returned the expected counts
- semantic query check returned the newly indexed `nlm-7704360` work summary alongside related medicinal-plant witnesses

## Notes

This pass kept the archive moving in the right direction:

- more botanical and materia-medica companion volumes were added locally
- the remaining discovered frontier is still broad
- the selector now wastes fewer high-ranking slots on convention material, manufacturer sheets, and similar noise

## Recommended next action

Continue with another curated book-only pass, but bias it slightly more toward:

- untouched herbal and medical-botany families
- medicinal-plant manuals and illustrated flora families
- stronger dictionary and glossary witnesses that help later semantic normalization
- fewer pharmacopoeia-adjacent administrative or hospital-internal witnesses
