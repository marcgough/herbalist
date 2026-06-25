# Botanical Forward Shortlist

Date: 2026-06-19

Purpose:

Capture the next clean Wellcome forward-acquisition lane after the family guide, Thomsonian, and prescriptions pass completed successfully.

This note starts from the refreshed selector output after the latest three Wellcome books landed. It then prunes the remaining ranked list where it is still dominated by deep lexicon repeats, thin pharmacopoeia witnesses, administrative pamphlets, article-reprint bundles, or current `404` text-endpoint cases.

## Recommended immediate Wellcome forward slice

1. `wellcome-dnp36947`
   - `The book of prescriptions (Beasley)`
   - Why: directly retrievable rewritten and expanded Beasley prescriptions witness with explicit pharmacology, therapeutics, dose systems, and disease-remedy indexing, making it the strongest remaining practical compendium in the queue.

2. `wellcome-sdq8m36q`
   - `The chemists' and dispensers' vade mecum`
   - Why: directly retrievable practical pharmacy and therapeutics handbook with prescribing and formulary value that strengthens the applied-materia-medica lane.

3. `wellcome-p6afhue8`
   - `Appendix or supplement to Dr. D. Monro's Treatise ...`
   - Why: directly retrievable and still book-scale, with omitted materia-medica articles and an index structure that make it the cleanest remaining non-duplicate `200` route despite its supplement framing.

## Reserve rather than immediate next pass

- `wellcome-msdf56k9`
  - `The book of prescriptions`
  - Why held back: directly retrievable and substantial, but now a repeat Beasley family after the stronger rewritten `wellcome-dnp36947` witness.

- `wellcome-ybfdn8ze`
  - `Lexicon medicum`
  - Why held back: directly retrievable and extremely large, but now a deep repeat family after the recently landed `wellcome-x9wbqn69`.

- `wellcome-w885ba98`
  - `Pharmacopoeia, in usum valetudinarii ...`
  - Why held back: directly retrievable, but comparatively thin and Latin-leading beside the stronger selected witnesses.

- `wellcome-ads4ufq3`
  - `A short account of the occurrences which led to the removal of Dr. John Redman Coxe ...`
  - Why held back: directly retrievable, but administrative dispute framing keeps it outside the cleaner book-reference lane.

- `wellcome-bmfm8te9`
  - `On the science of easy chairs ...`
  - Why held back: directly retrievable, but clearly an article-reprint bundle and too slight for the book-only standard.

- `wellcome-kyshj5hq`
  - `Pharmacopoeia universalis`
  - Why held back: attractive English dispensatory witness, but the direct Wellcome text endpoint is still returning `404`.

- `wellcome-c5t9cgqr`
  - `An epistle to Dr. Richard Mead ... Seneca rattle-snake root ...`
  - Why held back: tract or epistle framing plus a current direct-text `404` keeps it outside the immediate clean pass.

- `wellcome-kw7su3cf`
  - `Health restor'd ...`
  - Why held back: more polemical in framing and still returning `404` on the direct Wellcome text route.

- `wellcome-jkjv35ym`
  - `Bibliotheca pharmaceutico-medica ...`
  - Why held back: large Latin-leading witness, but the direct Wellcome text path is currently returning `404`.

- `wellcome-f6f97kmm`
  - `La medicina pittoresca o museo medico-chirurgico`
  - Why held back: plate-heavy and currently `404` on the direct Wellcome text route.

- `wellcome-ww8gtwfv`
  - `Materia medica`
  - Why held back: thematically relevant, but the direct Wellcome text path is currently returning `404`.

- `wellcome-xtum85vk`
  - `Materia medica, liber I. De plantis ...`
  - Why held back: directly relevant in theme, but the direct Wellcome text path is currently returning `404`.

- `wellcome-bn68mk4f`
  - `Pedanii Dioscoridis Anazarbei De materia medica libri quinque ...`
  - Why held back: a strong classical candidate in principle, but the direct Wellcome text path is currently returning `404`.

## Lane status

Already completed in the latest pass:

- `wellcome-rnpdxpd2`
- `wellcome-cr3ah4dq`
- `wellcome-bsnmkdkc`

Manual retry lane still active:

- `wellcome-bkdvy7wy`
- `wellcome-gj4s5ed2`

Remaining separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Recommended batching shape

Next pass should prefer:

- 3 Wellcome works rather than padding beyond the cleaner lane
- one rewritten prescriptions compendium first
- one practical dispensers' vade mecum second
- one supplement witness only as the cleanest remaining non-duplicate `200` route third
- direct `200` text-route witnesses before current `404` cases
- no repeat lexicons, thin Latin pharmacopoeia, administrative disputes, or article-reprint bundles in the immediate slice
