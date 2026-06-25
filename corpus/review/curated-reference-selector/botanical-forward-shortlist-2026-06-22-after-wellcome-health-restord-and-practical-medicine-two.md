# Botanical Forward Shortlist

Date: 2026-06-22

Purpose:

Capture the next move after the Wellcome-led follow-up landed two substantive practical-reference books and exposed one stalled retry.

This note supersedes the earlier shortlist that centered the `1316`-work state after `wellcome-rhxrvc4u`, `wellcome-kw7su3cf`, and `nlm-101313340`.

## What changed

- the archive now stands at `1318` chunked works
- `Corpus Memory` now holds `3308` retrieval documents
- `wellcome-wkhtmbyj` and `wellcome-ubh77647` both landed cleanly and SQLite verification confirmed them as `work-summary` documents
- `wellcome-wkhtmbyj` stayed out of `thin-work-review`
- `wellcome-ubh77647` stayed out of `thin-work-review`
- `wellcome-takhmyez` fetched official raw-source artifacts but stalled before manifest and chunk output, so it remains a retry lane item in `discovered` state
- the Wellcome lane again outperformed the same-family NLM depth lane

## Current reserve state

The selected NLM reserve still stands at:

1. `nlm-101313341`
   - *Homoeopathic domestic physician*
   - Why slower now: the previous same-family witness `nlm-101313340` landed thin, so this next edition still does not have a strong enough reason to spend a slot yet.

2. `nlm-2561026R`
   - *The Edinburgh new dispensatory ...*
   - Why slower: repeat-heavy dispensatory depth rather than practical widening.

3. `nlm-64230310R`
   - *The sick man's friend*
   - Why slower: same-family botanical-principles depth after earlier related witnesses already landed.

4. `nlm-9717182`
   - *Pharmacopoeia*
   - Why slower: still too generic to outrank cleaner practical books.

5. `nlm-63570300R`
   - *The medical companion, or family physician*
   - Why still weaker: the same family already produced `nlm-8206608` as `severe-thin-reference`.

The selected Wellcome reserve now looks weaker than the pair that just landed. The current head of that lane is:

1. `wellcome-ndctabm6`
   - *The medical student's vade mecum*
   - Why slower: more student-compend framing than public practical-reference value.

2. `wellcome-jkjv35ym`
   - *Bibliotheca pharmaceutico-medica*
   - Why slower: foreign-language-leading and less aligned to the first public retrieval experience.

3. `wellcome-f6f97kmm`
   - *La medicina pittoresca o museo medico-chirurgico*
   - Why slower: foreign-language-leading and less direct for the current public corpus shape.

4. `wellcome-takhmyez`
   - *Pharmacopoeia universalis: or, a new universal English dispensatory*
   - Why still viable: English practical title and uncovered family value.
   - Why still slower: the current retry stalled before chunk output, so it should be treated as a route-recovery item before it is treated as a normal batch hold.

5. `wellcome-qb3dkxup`
   - *G. H. G. Jahr's Manual of homoeopathic medicine*
   - Why slower: repeat-depth from a family already represented.

6. `wellcome-wmrh7xf2`
   - *A medical manual for Apothecaries' Hall and other medical boards*
   - Why slower: exam-board framing rather than reader-facing practical wisdom.

## Stronger next-step guidance

The safest next move should now be one of these:

1. tighten the practical-remedies selector again around English-accessible public-reference value
   - Why: after the two best current Wellcome holds landed, the reserve drifted back toward student, exam-board, foreign-language-leading, and repeat-depth shapes.

2. retry `wellcome-takhmyez` in an isolated recovery lane
   - Why: it still looks better on title and mission fit than much of the current remaining Wellcome reserve, but it should not share a batch with other work until the stall point is understood.

3. manually screen a fresh NLM uncovered trio only if it is more direct than the current same-family depth reserve
   - Why: the standing NLM reserve remains depth-heavy and the most recent quality wins are still coming from curated Wellcome or clearly direct uncovered practical books.

## Holds and cautions

- keep trusting the curated selector over the raw frontier for this practical-remedies lane
- keep `wellcome-takhmyez` as a retry lane item until it produces a manifest and chunk file
- treat foreign-language-leading and exam-board manual shapes as lower-confidence for the first public corpus experience
- keep the same-family `Homoeopathic domestic physician` NLM depth lane under lower confidence until another witness lands with more than thin reference value
