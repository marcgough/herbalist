# NLM OCR quarantine and recovery notes

These NLM works were removed from the active chunked corpus, or held out of further intake, because the official OCR route returned a missing-resource error page instead of book text.

Bigelow / `American medical botany` family:

- `nlm-2543055R`
- `nlm-2543055RX1`
- `nlm-2543055RX2`
- `nlm-2543055RX3`

Millspaugh / `Medicinal plants` family:

- `nlm-101636340`
- `nlm-101636340X1`
- `nlm-101636340X2`

Notes:

- `nlm-2543055R`, `nlm-2543055RX1`, and `nlm-2543055RX2` had active corpus files that were moved here during quarantine.
- `nlm-2543055RX3` and the Millspaugh `101636340*` records were confirmed later, but they had not yet produced active chunk files to move.
- As of 2026-06-17, all seven works have been recovered back into the active corpus by following alternate official NLM `-mvpart` OCR links exposed from the public resource page and `mvset` catalog page.
- The direct `-bk` OCR route still returns a missing-resource page for these combined records, so this quarantine folder remains useful as provenance for the original failure mode.
- There are now no active NLM `download_failed` works in the corpus. The remaining failed queue is outside this quarantine set.
