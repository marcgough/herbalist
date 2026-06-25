# Acquisition Frontier

Generated: 2026-06-23T13:12:04.238Z

This folder ranks the next best book acquisitions by unique knowledge coverage rather than raw title backlog alone.

## Why it exists

- prefer one strong candidate from an uncovered book family before pulling more editions of already represented families
- keep the corpus broad across herbals, domestic medicine, medicinal-plant guides, and related practical references
- retain collection-aware worklists that can be fed directly into the official-source acquisition scripts
- cool off title-series that already have strong local representation, even when alternate witnesses make them appear as fresh families

## Current summary

- Families considered: 1866
- Frontier families: 899
- Uncovered families: 839
- Depth families: 170
- Failed-only families: 4
- Discovered works still sitting in uncovered families: 973
- Discovered works sitting in already represented families: 411

## Key files

- `frontier.csv`
- `frontier.json`
- `worklists/`

## Recommended next acquisitions

- 1. Aristotle's complete master-piece, in two parts -> `nlm-2541058R` (nlm-digital-collections; uncovered_family; domestic-medicine)
- 2. Aristotle's complete master-piece, in two parts, displaying the secrets of nature in the generation of man. Regularly digested into chapters, rendering it far more useful and easy than any yet extant. To which is added A treasure of health, or the family physician , being choice and approved remedies for all the several distempers incident to the human body -> `nlm-101199051` (nlm-digital-collections; uncovered_family; domestic-medicine)
- 3. Improved phreno-chart and compass of life -> `nlm-101179368` (nlm-digital-collections; uncovered_family; domestic-medicine)
- 4. The physiologist, or, Sexual physiology revealed -> `nlm-25940930R` (nlm-digital-collections; uncovered_family; domestic-medicine)
- 5. Ladies' home calisthenics -> `nlm-07420170R` (nlm-digital-collections; uncovered_family; domestic-medicine)
- 6. Aristotle's compleat master-piece -> `nlm-101135080` (nlm-digital-collections; uncovered_family; domestic-medicine)
- 7. Aristotle's complete master-piece -> `nlm-2541055R` (nlm-digital-collections; uncovered_family; domestic-medicine)
- 8. Aristotle's master-piece, or, The secrets of nature displayed in the generation of man -> `nlm-8206648` (nlm-digital-collections; uncovered_family; domestic-medicine)
- 9. The whole of Aristotle's compleat master-piece -> `nlm-2437030R` (nlm-digital-collections; uncovered_family; domestic-medicine)
- 10. Vivilore -> `wellcome-wv3pdutk` (wellcome-collection; uncovered_family; hygiene;materia-medica)
- 11. Draft of a metropolitan sanitary code -> `nlm-100961073` (nlm-digital-collections; uncovered_family; hygiene;public-health)
- 12. A course of examinations on anatomy and physiology, surgery, chemistry, materia medica , midwifery, and the practice of medicine -> `nlm-2546065R` (nlm-digital-collections; uncovered_family; materia-medica)

## Command hints

- `nlm-digital-collections` top list: `npm run corpus:nlm -- --work-ids-file=corpus/derived/acquisition-frontier/worklists/nlm-digital-collections-top.txt --limit=10`
- `wellcome-collection` top list: `npm run corpus:wellcome -- --work-ids-file=corpus/derived/acquisition-frontier/worklists/wellcome-collection-top.txt --limit=10`

## Notes

- This layer is acquisition-oriented and intentionally keeps only one recommended next work per family.
- The ranking favors uncovered families, practical herb and domestic-health topics, canonical members, and candidates that add new source-lane coverage.
- Archive-level series saturation is now part of the score so repeated Buchan-, Gunn-, pharmacopoeia-, and similar witness chains stop dominating the top frontier.
- Failed-only families are kept visible but deprioritized behind clean discovered candidates.

