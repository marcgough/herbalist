# Botanical Forward Shortlist

Date: 2026-06-19

Purpose:

Capture the next clean Wellcome forward-acquisition lane after the experimental, prescriber, and plates follow-up completed successfully.

This note starts from the refreshed selector output after the latest Wellcome pass landed. It then prunes the remaining ranked list where it is still dominated by deeper lexicon repeats, tract-like witnesses, supplement-only volumes, or Latin- and German-leading material that is less suitable for the first public-reference spine.

## Recommended immediate Wellcome forward slice

1. `wellcome-jd7wwg5w`
   - `Materia medica and therapeutics : vegetable kingdom`
   - Why: uncovered English plant-centered therapeutics witness with direct public-reference value and a clean official Wellcome text route.

2. `wellcome-x9wbqn69`
   - `Lexicon medicum`
   - Why: a controlled two-volume lexicon repeat is acceptable here because it remains directly retrievable, broadens general lookup depth for public retrieval, and is stronger than taking another thin or foreign-language-led witness just to avoid all repeats.

3. `wellcome-y6chc2az`
   - `Memoir of the late William Wright, M.D.`
   - Why: uncovered English-framed botanical memoir-and-papers witness that can widen botanical and regional-use context without doubling down on another dictionary family in the same slice.

## Reserve rather than immediate next pass

- `wellcome-zw57j8sb`
  - `Quincy's Lexicon-medicum`
  - Why held back: if we take one lexicon repeat in the immediate slice, a second dictionary repeat should wait.

- `wellcome-kyshj5hq`
  - `Pharmacopoeia universalis`
  - Why held back: attractive English dispensatory witness, but the direct Wellcome text endpoint is currently returning `404`, so it belongs in a later fallback-recovery lane rather than the immediate clean pass.

- `wellcome-w885ba98`
  - `Pharmacopoeia, in usum valetudinarii ...`
  - Why held back: Latin-leading pharmacopoeia witness with less immediate public-reference value than the selected lane.

- `wellcome-ads4ufq3`
  - `A short account of the occurrences which led to the removal of Dr. John Redman Coxe ...`
  - Why held back: administrative dispute framing, not a practical reference core witness.

- `wellcome-c5t9cgqr`
  - `An epistle to Dr. Richard Mead ... Seneca rattle-snake root ...`
  - Why held back: tract or epistle framing keeps it outside the cleaner book-only lane for now.

- `wellcome-p6afhue8`
  - `Appendix or supplement ...`
  - Why held back: supplement-only witness, less foundational than the selected book-scale references.

- `wellcome-fstcqcz6`
  - `Caroli a Linné ... Materia medica`
  - Why held back: Latin-leading witness that can wait until the English-accessible practical spine is deeper.

- `wellcome-kw7su3cf`
  - `Health restor'd ...`
  - Why held back: more polemical in framing and still returning `404` on the direct Wellcome text route.

- `wellcome-jkjv35ym`
  - `Bibliotheca pharmaceutico-medica ...`
  - Why held back: large Latin-leading witness that is better saved for a later multilingual deep-reference lane.

- `wellcome-f6f97kmm`
  - `La medicina pittoresca o museo medico-chirurgico`
  - Why held back: non-English and heavily plate-oriented, better deferred until the simpler English and botanical lane is deeper.

- `wellcome-ww8gtwfv`
  - `Materia medica`
  - Why held back: too bare and Latin-leading compared with the stronger selected witnesses.

- `wellcome-kptt2h24`
  - `Materia medica botanica ...`
  - Why held back: directly retrievable but Latin-leading, so it can wait for a later multilingual botanical lane.

- `wellcome-dczsx3at`
  - `Materia medica oder gründliche abhandlung ...`
  - Why held back: directly retrievable but German-leading, so it is not the right next move for the first English-reference spine.

## Lane status

Already completed in the latest Wellcome pass:

- `wellcome-z3vrmmat`
- `wellcome-qwu5nvnn`
- `wellcome-me9wem67`

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
- one strong plant-centered practical witness first
- at most one controlled lexicon repeat in the same slice
- English or English-framed sources before Latin- or German-leading material
- directly retrievable witnesses before current `404` text-endpoint cases
