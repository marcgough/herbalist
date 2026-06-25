# Botanical Forward Shortlist

Date: 2026-06-19

Purpose:

Capture the next manual-screening lane after the mixed route-screened pass landed `nlm-9701530`, `nlm-61860720R`, `wellcome-jdw9d8sn`, and `wellcome-vhu7ubsh`.

This note supersedes the earlier NLM therapeutics, domestic, hygiene, and repertory follow-up note as the current next-lane guidance.

## What changed

- the archive just added 4 more works cleanly, pushing the corpus to `1204` chunked works
- the mixed pass confirmed that some high-ranking Wellcome candidates are still false-ready at the text-endpoint level even when the registry looks healthy
- the botanical-reference profile was tightened again to suppress prospectus, institutional-removal, and veterinary false-positive shapes
- the refreshed selector now surfaces a narrower NLM lane plus a smaller set of route-proven Wellcome fallbacks

## Stronger current NLM manual-review leads

These are not yet a ready-to-run batch file. They are the cleaner remaining NLM leads for the next manual screen:

1. `nlm-101232588`
   - `[Medical recipe book]`
   - Why: still an uncovered family and directly aligned with the practical-remedy side of the corpus, even though the bibliographic envelope is thin enough that it deserves one more deliberate shape check before promotion.

2. `nlm-7703236`
   - `The Indian vegetable family instructer ...`
   - Why: already a represented family, but strongly on-theme for herbal identification, medicinal qualities, and household recipes.

3. `nlm-64210120RX3`
   - `The American practice of medicine ... (Volume 3)`
   - Why: a controlled companion-volume continuation if we want to keep deliberately completing the Beach practice lane.

Reserve after those:

- `nlm-2567001R`
  - `The pharmacopoeia of the United States of America : 1820`
  - Why reserved: useful as a standardized nomenclature anchor, but now a secondary slot rather than the first automatic choice.

- `nlm-61860730R`
  - `The Prescriber's pharmacopoeia ...`
  - Why reserved: another companion witness in a family now represented twice, so it is better used only if we deliberately want more dosing-reference depth.

- `nlm-9604420`
  - `A philosophical theory of an empiric, proved practically ...`
  - Why reserved: topical enough to keep, but still more polemical than reference-like.

- `nlm-101125242`
  - `Futsugo Yakushitsu hokan, [Tokyo]`
  - Why reserved: relevant and uncovered, but still foreign-language-leading for the first retrieval experience.

## Route-proven Wellcome reserve

These are the cleaner Wellcome candidates only because live text probes returned usable bodies:

- `wellcome-nhx2ne6y`
  - `Gray's supplement to the pharmacopoeia ...`
  - Why: route-proven and practically useful, though still a represented pharmacopoeia family.

- `wellcome-xy2guga9`
  - `Materia medica and therapeutics : for physicians and students`
  - Why: route-proven and broad, though the student framing and represented family make it a fallback rather than a first pick.

- `wellcome-k79vcnmu`
  - `A manual of materia medica and therapeutics ...`
  - Why: route-proven, but a deeper repeat family and the returned text body opens with noisy front matter, so it should stay behind the two cleaner options above.

## Hold back from the immediate lane

- `nlm-2557010R`
  - `Quincy's Lexicon-medicum`
  - Why held back: deep repeat dictionary family.

- `nlm-2561024R`
  - `The Edinburgh new dispensatory ...`
  - Why held back: another deep dispensatory repeat family.

- `nlm-64230300R`
  - `The sick man's friend ...`
  - Why held back: already represented twice in a family we strengthened recently.

- `nlm-9717182`
  - `Pharmacopoeia`
  - Why held back: too generic and thinly described to justify the next slot.

- `wellcome-takhmyez`
  - `Pharmacopoeia universalis ...`
  - Why held back: still attractive, but the live text probe returned no text resource.

- `wellcome-kw7su3cf`
  - `Health restor'd ...`
  - Why held back: the live text probe returned no text resource.

- `wellcome-ww8gtwfv`
  - `Materia medica`
  - Why held back: the live text probe returned no text resource.

- `wellcome-ybfdn8ze`
  - `Lexicon medicum, or, Medical dictionary`
  - Why held back: already a deep repeat family.

- `wellcome-jkjv35ym`
  - `Bibliotheca pharmaceutico-medica ...`
  - Why held back: large and potentially useful, but still Latin-leading and weaker for immediate public-facing retrieval.

- `wellcome-f6f97kmm`
  - `La medicina pittoresca o museo medico-chirurgico ...`
  - Why held back: plate-heavy and off the main botanical-reference path.

## Recommended batching shape

Next campaign should prefer:

- another manually screened slice
- one practical herbal or recipe-oriented NLM work
- one controlled companion or pharmacopoeia witness only if it clearly deepens a good family
- Wellcome titles only when the text body has been live-probed first
- no automatic `workids.txt` file until the next three or four works are manually route-checked
