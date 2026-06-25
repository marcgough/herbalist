# Wellcome thin-text quarantine and recovery notes

This quarantine folder preserves the earlier bad-capture state for:

- `wellcome-qc9bzfnh` - `A complete dictionary of the whole materia medica ... / by William Lewis.`

Why it was quarantined:

- the official Wellcome text endpoint returned `404`
- the official ZIP fallback exposed only empty placeholder files
- the first fallback pass accepted only copy-volume labels rather than actual work text

Recovery outcome:

- as of 2026-06-18, the work has been recovered back into the active corpus through the official Wellcome copy PDF plus local OCR
- the active work now lives again under the normal corpus paths and is marked `chunked`
- the recovered source mode is `wellcome_pdf_local_ocr`
- the recovered active manifest reports `1,065` chunks and `1,802` paragraphs

Why this quarantine still matters:

- it preserves the provenance of the earlier thin capture
- it documents that the official text and ALTO lanes for this work were not reliable at recovery time
- it gives us a concrete example of the `thin text -> quarantine -> official PDF OCR recovery` path
