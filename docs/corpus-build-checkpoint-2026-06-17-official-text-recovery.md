# Herbalisti Corpus Checkpoint - 2026-06-17 Official Text Recovery

Date: 2026-06-17

## Summary

This pass moved the corpus forward materially, not just structurally.

The main outcomes were:

- Wellcome's active failure queue was cleared by adding an official text ZIP fallback.
- The NLM OCR lane was corrected so it no longer rejects valid book text because a normal sentence happens to include `not found`.
- Additional NLM and Wellcome books were locally acquired, normalized, and chunked.
- The corpus status report now surfaces the latest collection summary instead of pinning to an old Gutenberg export.

## Net Corpus Change

Start-of-pass chunked works: `144`

End-of-pass chunked works: `183`

Net gain this pass: `39` locally acquired and chunked books

Current registry totals:

- total registered works: `2,720`
- total chunked works: `183`
- total queued works: `2,533`
- total failed works: `4`

Current chunk totals:

- total chunk records: `241,246`
- Project Gutenberg: `14,221`
- Wellcome Collection: `194,119`
- NLM Digital Collections: `32,906`

## Collection State

### Project Gutenberg

- `27` total
- `27` chunked
- `0` failed

### Wellcome Collection

- `1,997` total
- `132` chunked
- `0` failed

### NLM Digital Collections

- `696` total
- `24` chunked
- `4` failed

## What Was Implemented

### 1. Wellcome official text ZIP fallback

The existing Wellcome lane already handled:

- catalogue discovery
- raw text endpoint
- ALTO fallback

But several important book records still failed because the plain text endpoint returned `404`.

The fix was to use another official source path already exposed by Wellcome's IIIF presentation data:

- `https://api.wellcomecollection.org/text/v1/<manifest-id>.zip`

This ZIP rendering is now the preferred fallback before a PDF-based recovery attempt.

It recovered the active Wellcome failures and brought the Wellcome failure count down from `21` to `0`.

### 2. Multi-part Wellcome text handling

The Wellcome ZIP fallback now distinguishes between:

- multi-volume works
- duplicate copy groupings

If the IIIF item labels indicate volumes, the fallback combines them in order.
If the labels indicate duplicate copies, it keeps one text source instead of merging duplicates.

### 3. NLM OCR false-negative fix

The initial NLM quality guard was too broad.

It correctly rejected short `Error: Resource ... not found` OCR pages, but it also rejected some genuine OCR pages because normal book text contained the words `not found` somewhere later in the text.

That check is now narrowed so only the true missing-resource response is rejected.

### 4. Status reporting improvement

`scripts/corpus/report-status.mjs` now scans all corpus summary exports and selects the most recent one as the live `latestSummary`, instead of always reading the old Gutenberg export.

## Recovery Results

### Wellcome books recovered through official ZIP text

Examples recovered in this pass include:

- *Outlines of medical botany*
- *Culpeper's English family physician*
- multiple *Medical botany* editions by Woodville and others
- *Vegetable materia medica of the United States*
- *Domestic medicine* variants

### NLM books added after the OCR guard fix

Examples added in this pass include:

- *Culpepper's family physician*
- multiple *Domestic medicine* and *family physician* editions
- additional public-domain domestic medicine references with herbal or regimen coverage

## Remaining NLM Failures

The remaining `4` failed NLM works are all in the same `American medical botany` family:

- `nlm-2543055R`
- `nlm-2543055RX1`
- `nlm-2543055RX2`
- `nlm-2543055RX3`

These appear to be true OCR-missing cases at the official OCR route, not parser errors.

For now they remain:

- marked `download_failed` in the registry
- documented in `corpus/review/quarantine/2026-06-17-nlm-ocr-missing/`

## Files Updated

- `scripts/corpus/build-wellcome-corpus.mjs`
- `scripts/corpus/build-nlm-corpus.mjs`
- `scripts/corpus/report-status.mjs`
- `corpus/REGISTRY.md`
- `corpus/review/quarantine/2026-06-17-nlm-ocr-missing/README.md`
- `docs/knowledge-corpus-first-plan.md`

## Recommended Next Steps

1. Continue batch acquisition across the discovered NLM and Wellcome queues.
2. Decide whether the final `American medical botany` NLM failures are recoverable through an official PDF/browser-led path.
3. Begin edition-family dedupe so repeated `Domestic medicine` and `Medical botany` variants can be grouped into canonical work families.
4. Start deriving evidence layers from the now-larger corpus:
   - herbs
   - plant parts
   - preparations
   - cautions
   - source-linked traditional-use passages
