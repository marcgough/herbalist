# Botanical Forward Shortlist

Date: 2026-06-19

Purpose:

Capture the next clean Wellcome forward-acquisition lane after the cleaned post-nineteenth Wellcome follow-up completed successfully.

This note starts from the refreshed selector output after the manual, therapeutics, and Americana follow-up landed. It then prunes the remaining ranked list where it is still dominated by deep lexicon repeats, memoir framing, supplement-only witnesses, tract-like material, Latin-leading items, or direct Wellcome text routes that are currently failing with `404`.

## Recommended immediate Wellcome forward slice

1. `wellcome-z3vrmmat`
   - `An experimental history of the materia medica`
   - Why: uncovered book-scale materia-medica history with a direct official Wellcome text path that responds cleanly, making it the strongest replacement for the failed `wellcome-gj4s5ed2` lane.

2. `wellcome-qwu5nvnn`
   - `The Prescriber's pharmacopoeia`
   - Why: uncovered English prescriber reference with practical class-and-dose framing, and it remains directly retrievable from the official Wellcome text endpoint.

3. `wellcome-me9wem67`
   - `Assistant plates to the materia medica`
   - Why: controlled botanical-plate witness that can strengthen later plant-identification support; it is lighter and more plate-led than the first two books, but it remains book-shaped, uncovered, and directly retrievable.

## Reserve rather than immediate next pass

- `wellcome-x9wbqn69`
  - `Lexicon medicum`
  - Why held back: directly retrievable, but still another deep repeat from a heavily represented lexicon family.

- `wellcome-y6chc2az`
  - `Memoir of the late William Wright, M.D.`
  - Why held back: potentially useful extracts, but the memoir frame remains less direct than the selected reference books.

- `wellcome-zw57j8sb`
  - `Quincy's Lexicon-medicum`
  - Why held back: another repeat lexicon from a family already represented.

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

- `wellcome-gj4s5ed2`
  - `An experimental history of the materia medica ... In two volumes`
  - Why held back: now a manual retry case after the official Wellcome text route returned `404 Not Found`.

- `wellcome-p6afhue8`
  - `Appendix or supplement ...`
  - Why held back: supplement-only witness, less foundational than the selected book-scale references.

- `wellcome-fstcqcz6`
  - `Caroli a Linné ... Materia medica`
  - Why held back: Latin-leading witness that can wait until the English-accessible practical spine is deeper.

- `wellcome-kw7su3cf`
  - `Health restor'd ...`
  - Why held back: both more polemical in framing and currently returning `404` on the direct Wellcome text route.

- `wellcome-jkjv35ym`
  - `Bibliotheca pharmaceutico-medica ...`
  - Why held back: large Latin-leading witness that is better saved for a later multilingual deep-reference lane.

- `wellcome-f6f97kmm`
  - `La medicina pittoresca o museo medico-chirurgico`
  - Why held back: non-English and heavily plate-oriented, better deferred until the simpler English and botanical lane is deeper.

- `wellcome-ww8gtwfv`
  - `Materia medica`
  - Why held back: too bare and Latin-leading compared with the stronger selected witnesses.

## Lane status

Already completed in the latest Wellcome pass:

- `wellcome-xdwqj3xz`
- `wellcome-kkpnd6fh`
- `wellcome-eerza6hf`

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
- book-scale practical references before deeper lexicon repeats
- direct-retrieval witnesses before current `404` text-endpoint cases
- English or English-framed sources before Latin-leading or Italian-leading material
- no more than one controlled plate-heavy witness in the same slice
