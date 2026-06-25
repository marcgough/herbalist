# Botanical Forward Shortlist

Date: 2026-06-20

Purpose:

Capture the next manual-screening lane after `wellcome-yhv25daq`, `nlm-63950560R`, and `nlm-2672001R` were acquired successfully.

This note supersedes the earlier shortlist that still centered `wellcome-yhv25daq`.

## What changed

- the archive just added 3 more works cleanly, pushing the corpus to `1277` chunked works
- the consumed lane removed one broad study-of-physick bridge and two family-physician witnesses from reserve
- `Corpus Memory` was refreshed to `3267` retrieval documents and exact work-id retrieval was re-verified for all 3 newly landed works
- `wellcome-yhv25daq` and `nlm-63950560R` stayed out of `thin-work-review`
- `nlm-2672001R` surfaced as `thin-general` and should stay visible as a lighter witness rather than a full anchor
- the refreshed selector moved again and now places `wellcome-aqkb26gx` into the selected Wellcome reserve in place of `wellcome-yhv25daq`

## Stronger current manual-review leads

These are the cleaner remaining leads for the next manual screen:

1. `wellcome-aqkb26gx`
   - `Account of a botanical excursion to the Mull of Cantyre, and the island of Islay`
   - Why: selector-positive, already registered with an official Wellcome text endpoint that now returns `200 text/plain`, and more plant-centered than the held dental and travel-drift titles.

2. `nlm-61840770R`
   - `Dr. John Williams' last legacy, and useful family guide`
   - Why: already registered with an official NLM OCR route, practical-family-guide framing, and a cleaner fit for the practical reference lane than the newly exposed Aristotle cluster.

3. `nlm-101125242`
   - `Futsugo Yakushitsu hokan, [Tokyo]`
   - Why: already registered with an official NLM OCR route and one of the more explicitly herbal uncovered-family candidates still visible after the current family-physician slice.

## Optional cross-collection repeat

- `nlm-101526718`
  - `Lexicon medicum, or, Medical dictionary ...`
  - Why keep visible: the official NLM OCR route is already present, but it is still another lexicon-family repeat and should stay optional rather than crowding out less repeated witnesses.

## Hold back from the immediate lane

- `wellcome-gpp79sus`
  - `A compend of dental pathology and dental medicine`
  - Why held back: source-ready, but the topic still drifts away from the current herbal, botanical, and practical-medicine retrieval core.

- `wellcome-qk5mzrqw`
  - `A description of the island of Anno-Bona ... on the causes and prevention of sickness and mortality among seamen employed in the African trade`
  - Why held back: source-ready, but the work still reads as a trade, seamen-health, and travel-station witness rather than a strong herbal or practical-reference book.

- `wellcome-ubh77647`
  - `The cyclopaedia of practical medicine ...`
  - Why held back: selector-positive, but the official text endpoint still returns `404`.

## Recommended batching shape

Next campaign should prefer:

- `wellcome-aqkb26gx`
- `nlm-61840770R`
- `nlm-101125242`

Keep `nlm-101526718` only as an optional fourth-slot or fallback witness if we deliberately want another lexicon-family repeat after the stronger or less repeated practical titles are exhausted.
