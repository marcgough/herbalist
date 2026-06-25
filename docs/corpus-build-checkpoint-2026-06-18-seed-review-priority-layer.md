# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Turn the seed-catalog manual-review backlog into a more usable curation lane so the next public herb expansions can be chosen from a ranked, evidence-aware queue instead of a flat CSV dump.

This pass did not add new books. It improved the semantic archive layer that sits between the accepted plant-family evidence and later manual herb promotion.

## What changed

### 1. The seed-review-priority layer is now part of the live corpus workflow

The new builder is:

- `scripts/corpus/build-seed-review-priority.mjs`

It reads:

- `corpus/derived/seed-catalog/catalog.csv`
- `corpus/derived/evidence/chunk-signals.jsonl`
- registry metadata from `loadWorksRegistry()`

It now ranks every `catalog_status=review` family into four machine-readable buckets:

- `promotion-candidate`
- `identity-review`
- `secondary-candidate`
- `deprioritized`

Outputs now live in:

- `corpus/review/seed-catalog-priority/`

Key files:

- `all-ranked.csv`
- `promotion-candidates.csv`
- `identity-review.csv`
- `secondary-candidates.csv`
- `deprioritized.csv`
- `README.md`
- `exports/seed-review-priority-summary.json`

### 2. The ranking logic was tightened after a live sanity check

The first run proved the layer was useful, but it also exposed a quality problem: OCR fragments and broad materia medica substances were still surfacing too high in the promotion lane.

This pass tightened the ranking in two important ways:

- fixed a topic-scoring bug so topic-family arrays now score correctly instead of silently flattening to zero
- hardened lexical review rules so obvious fragments, suspect split words, stopword-led phrases, and non-botanical remedy substances drop into safer review lanes

Examples that now fall out of the promotion lane:

- `Com-Pound`
- `Peru-Vian`
- `Commonly Called`
- `Recommend Peruvian`
- `Arrow`
- `Sugar`
- `Tar`
- `Cod-Liver`
- `Lime-Water`

That makes the review queue materially more aligned to the eventual herb database.

### 3. The rebuild path now proves this layer is integrated, not ad hoc

`scripts/corpus/run-frontier-batch.mjs` already included the seed-review-priority builder in its derived rebuild chain.

This pass verified that integration with a zero-acquisition rebuild:

- `node scripts/corpus/run-frontier-batch.mjs --nlm-limit=0 --wellcome-limit=0`

The rebuild completed successfully with:

- `selectedNlm: 0`
- `selectedWellcome: 0`
- `failedCommand: null`

Executed command chain:

- `corpus:reconcile`
- `build-edition-families`
- `build-acquisition-frontier`
- `build-corpus-evidence`
- `build-thin-work-review`
- `build-term-families`
- `build-seed-catalog`
- `build-herb-profiles`
- `build-seed-review-priority`
- `corpus:status`

That means future no-key corpus expansion batches will automatically regenerate this review layer.

## Current seed-review-priority totals

From `exports/seed-review-priority-summary.json` after the tightened rerun:

- 47,621 total review families ranked
- 44 promotion candidates
- 21 identity-review candidates
- 44,385 secondary candidates
- 3,171 deprioritized families

Current top promotion candidates now begin with:

- `Prickly-Ash`
- `Elm`
- `Tolu`
- `Nux Vomica`
- `Lesser Cardamom`
- `Quassia`
- `Calumba`
- `Benzoin`
- `Tormentil`
- `Coffee`

This is not perfect yet, but it is materially cleaner than the earlier queue and much more usable for the next manual promotion pass.

## Current corpus snapshot during this pass

Verified current local totals:

- 2,720 registered works
- 870 locally acquired and chunked works
- 1,849 discovered works still queued
- 1 failed work
- 1,113,167 chunk records
- 1,286,185 paragraph records

Current local corpus footprint:

- 7.54 GB
- 7,525 files

Current source mix:

- 27 Project Gutenberg works
- 549 Wellcome Collection works
- 294 NLM Digital Collections works

## Files updated

Updated scripts:

- `scripts/corpus/build-seed-review-priority.mjs`

Updated project notes:

- `docs/knowledge-corpus-first-plan.md`
- `corpus/REGISTRY.md`

Regenerated outputs:

- `corpus/review/seed-catalog-priority/`
- `corpus/exports/seed-review-priority-summary.json`
- `corpus/exports/frontier-batch-summary.json`

## Why this matters

This pass makes the archive more editorially usable.

Before this layer, the seed catalog had a huge review backlog but no durable way to separate:

1. likely next herb promotions
2. naming and alias problems
3. weak or noisy families that should stay out of the public herb layer

Now the corpus has an intermediate semantic lane that behaves much more like the eventual website needs:

- source-grounded
- rerunnable
- reviewable
- narrow enough to curate

## Remaining rough edges

Some promotion-candidate rows are still too broad or non-botanical for direct public herb promotion. The queue is clearly better, but it still needs another refinement pass before it can be treated as fully clean.

That is acceptable at this stage because:

- the public herb layer still comes from manual promotion
- the new lane already reduces review noise substantially
- the next refinement can focus on botanical specificity instead of basic OCR cleanup

## Recommended next move

1. inspect the top `promotion-candidate` rows and manually promote only genuinely plant-forward families
2. harden the lexical rules again around remaining non-botanical substances and descriptor-led single-word survivors
3. keep growing the corpus with no-key book acquisitions so the evidence layer gets broader while this ranked review lane stays stable
