# Botanical Forward Shortlist

Date: 2026-06-20

Purpose:

Capture the next manual-screening lane after `wellcome-aqkb26gx`, `nlm-61840770R`, and `nlm-101526718` were acquired successfully.

This note supersedes the earlier shortlist that still centered `wellcome-aqkb26gx` as the immediate Wellcome lead.

## What changed

- the archive just added 3 more works cleanly, pushing the corpus to `1280` chunked works
- `Corpus Memory` was refreshed to `3270` retrieval documents and exact work-id retrieval was re-verified for all 3 newly landed works
- `wellcome-aqkb26gx` stayed out of `thin-work-review`
- `nlm-61840770R` surfaced as `thin-reference` and should stay visible as a lighter practical-guide witness rather than a full anchor
- `nlm-101526718` surfaced as `severe-thin-reference` and should stay visible only as a lower-weight lexicon witness
- `nlm-101125242` failed on the same run and now belongs to a separate manual-retry lane
- the refreshed selector moved again and now places `wellcome-yss258s7` into the selected Wellcome reserve in place of `wellcome-aqkb26gx`

## Why the next lane should not start with Wellcome

- `wellcome-yss258s7`
  - *An arrangement of British plants*
  - Why not immediate: it is selector-positive, but live checks still do not yield a usable official text body, so it is not currently the cleanest next-batch move.

## Stronger current manual-review leads

These are the cleaner remaining leads for the next manual screen:

1. `nlm-64230300R`
   - *The sick man's friend : being a plain, practical medical work designed for the use of families and individuals on vegetable, or botanical principles*
   - Why: strong botanical framing, official NLM OCR route already registered, and a good fit for the practical herbal and family-reference lane.

2. `nlm-2578017R`
   - *Wright's Family medicine, or system of domestic practice*
   - Why: strong uncovered family-medicine lead still visible from the live frontier and cleaner than most of the remaining repeat-heavy selector reserve.

3. `nlm-2557010R`
   - *Quincy's Lexicon-medicum : a new medical dictionary*
   - Why: official NLM OCR route already registered and still a useful standards witness, but it should stay the optional third slot because it is another lexicon-family repeat.

## Keep separate from the normal lane

- `nlm-101125242`
  - *Futsugo Yakushitsu hokan, [Tokyo]*
  - Why separate: the official OCR route failed to expose a trusted text body and the registry now records `download_failed` plus `manual_retry_required`.

## Hold back from the immediate lane

- `wellcome-gpp79sus`
  - *A compend of dental pathology and dental medicine*
  - Why held back: source-ready, but the topic still drifts away from the current herbal, botanical, and practical-medicine retrieval core.

- `wellcome-qk5mzrqw`
  - *A description of the island of Anno-Bona ... on the causes and prevention of sickness and mortality among seamen employed in the African trade*
  - Why held back: source-ready, but the work still reads as a trade, seamen-health, and travel-station witness rather than a strong herbal or practical-reference book.

- `wellcome-ubh77647`
  - *The cyclopaedia of practical medicine ...*
  - Why held back: selector-positive, but the official text endpoint still returns `404`.

- `wellcome-yss258s7`
  - *An arrangement of British plants*
  - Why held back: selector-positive, but the official text route is still not yielding a usable live body.

## Recommended batching shape

Next campaign should prefer:

- `nlm-64230300R`
- `nlm-2578017R`
- `nlm-2557010R` only as the cleanest optional third slot

Keep `nlm-101125242` as a separate importer-recovery and manual-retry lane rather than forcing it back into the normal acquisition batch.
