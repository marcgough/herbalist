# Thin-work review layer

This folder flags chunked works that are short or fragment-shaped enough to warrant a manual review before they influence later retrieval weighting, public search defaults, or edition-family promotion.

The heuristic does not auto-remove anything from the archive.

It is designed to surface:

- very short pharmacopoeia addenda
- report, note, lecture, appendix, or supplement shaped witnesses
- thin one-section items inside larger repeated title families
- small reference works that may still be valid but should be weighted deliberately

Current thresholds:

- micro: <= 12 chunks or <= 16 paragraphs
- severe-thin: <= 40 chunks or <= 50 paragraphs
- thin: <= 120 chunks or <= 160 paragraphs

Primary outputs:

- `candidates.csv`
- `../../exports/thin-work-review-summary.json`

Review classes are advisory:

- `micro-fragment`
- `severe-thin-fragment`
- `severe-thin-reference`
- `thin-fragment`
- `thin-reference`
- `thin-general`
