# Botanical Forward Shortlist

Date: 2026-06-20

Purpose:

Capture the next manual-screening lane after `nlm-64230300R`, `nlm-2578017R`, and `nlm-2557010R` were acquired successfully.

This note supersedes the earlier shortlist that still centered `nlm-64230300R`, `nlm-2578017R`, and `nlm-2557010R` as the immediate NLM lane.

## What changed

- the archive just added 3 more NLM works cleanly, pushing the corpus to `1283` chunked works
- `Corpus Memory` was refreshed to `3273` retrieval documents and exact work-id retrieval was re-verified for all 3 newly landed works
- `nlm-64230300R` surfaced as `severe-thin-reference` and should stay visible as a lighter botanical witness rather than a full anchor
- `nlm-2578017R` and `nlm-2557010R` stayed out of `thin-work-review`
- the refreshed selector moved again and now leaves only 5 selected NLM reserve candidates, all of them deeper repeat or reference-family witnesses

## Stronger current manual-review leads

These are the cleaner remaining leads for the next manual screen:

1. `nlm-2561024R`
   - *The Edinburgh new dispensatory*
   - Why: strong practical pharmacopoeia and dispensatory fit with a broad, book-scale reference shape.

2. `nlm-61740710RX2`
   - *Pharmacologia: corrected and extended (Volume 2)*
   - Why: strong deep-reference bridge across pharmacopoeia, chemistry, and materia medica.

3. `nlm-2566033RX2`
   - *The London medical dictionary (Volume 2)*
   - Why: still useful as a deep dictionary witness, but it should stay the optional third slot because it is another repeat-heavy reference family.

## Keep slower or separate from the normal lane

- `nlm-64230310R`
  - *The sick man's friend ... in six parts*
  - Why slower: same-family depth right after landing `nlm-64230300R`, so it is better treated as a deliberate repeat rather than the immediate next slot.

- `nlm-9717182`
  - *Pharmacopoeia*
  - Why slower: the title is too generic to outrank the stronger identified deep-reference witnesses above.

- `nlm-101125242`
  - *Futsugo Yakushitsu hokan, [Tokyo]*
  - Why separate: the official OCR route failed to expose a trusted text body and the registry still records `download_failed` plus `manual_retry_required`.

## Hold back from the immediate lane

- `wellcome-yss258s7`
  - *An arrangement of British plants*
  - Why held back: selector-positive, but the official text route is still not yielding a usable live body.

- `wellcome-gpp79sus`
  - *A compend of dental pathology and dental medicine*
  - Why held back: source-ready, but the topic still drifts away from the current herbal, botanical, and practical-medicine retrieval core.

- `wellcome-qk5mzrqw`
  - *A description of the island of Anno-Bona ... on the causes and prevention of sickness and mortality among seamen employed in the African trade*
  - Why held back: source-ready, but the work still reads as a trade, seamen-health, and travel-station witness rather than a strong herbal or practical-reference book.

- `wellcome-ubh77647`
  - *The cyclopaedia of practical medicine ...*
  - Why held back: selector-positive, but the official text endpoint still returns `404`.

## Recommended batching shape

Next campaign should prefer:

- `nlm-2561024R`
- `nlm-61740710RX2`
- `nlm-2566033RX2` only as the cleanest optional third slot

Keep `nlm-64230310R` as same-family depth, `nlm-9717182` as a generic pharmacopoeia hold, and `nlm-101125242` as a separate importer-recovery and manual-retry lane rather than forcing any of them into the immediate acquisition batch.
