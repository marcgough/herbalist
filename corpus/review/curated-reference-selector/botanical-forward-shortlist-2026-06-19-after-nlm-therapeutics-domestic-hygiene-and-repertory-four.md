# Botanical Forward Shortlist

Date: 2026-06-19

Purpose:

Capture the next manual-screening lane after the NLM-led pass landed `nlm-101509190X1`, `nlm-2555010R`, `nlm-07221330R`, and `nlm-64311130R`.

This note supersedes the earlier NLM Merck, botanic, and practice follow-up note as the current next-lane guidance.

## What changed

- the archive just added 4 more NLM works cleanly, pushing the corpus to `1196` chunked works
- the refreshed selector now surfaces a mix of useful companion volumes, uncovered practical works, and deeper repeat families
- checked Wellcome direct text routes for `wellcome-zskkj287`, `wellcome-kyshj5hq`, and `wellcome-d5vq9tfn` were still returning `404` on 2026-06-19
- that means the next lane should remain manually screened and NLM-led unless Wellcome route quality materially improves

## Stronger current NLM manual-review leads

These are not yet a ready-to-run batch file. They are the cleaner remaining NLM leads for the next manual screen:

1. `nlm-101509190X2`
   - `General therapeutics and materia medica : adapted for a medical textbook (Volume 2)`
   - Why: the natural companion to the newly landed Volume 1 and still a substantial practical reference work.

2. `nlm-64210120RX2`
   - `The American practice of medicine ... (Volume 2)`
   - Why: the natural companion to the newly landed Volume 1 and a reasonable way to complete that practical-treatment lane deliberately.

3. `nlm-9701530`
   - `The ethical relations existing between medicine and pharmacy ... investigation of new drugs`
   - Why: uncovered family, still relevant to medical agents and pharmacy, and less repetition-heavy than the remaining deep dictionary and dispensatory ranks.

Reserve after those:

- `nlm-101232588`
  - `[Medical recipe book]`
  - Why reserved: potentially useful, but the bibliographic envelope is still thin enough that it deserves a deliberate shape check before promotion.

- `nlm-9604420`
  - `A philosophical theory of an empiric, proved practically ...`
  - Why reserved: relevant and uncovered, but the argumentative framing makes it a slightly less straightforward fit than the top three leads.

## Hold back from the immediate lane

- `nlm-2557010R`
  - `Quincy's Lexicon-medicum`
  - Why held back: deep repeat dictionary family.

- `nlm-61650830R`
  - `An improved system of botanic medicine ...`
  - Why held back: strong book, but now a deeper repeat family with `3` chunked family witnesses already present.

- `nlm-2561024R`
  - `The Edinburgh new dispensatory ...`
  - Why held back: useful, but another deep Edinburgh dispensatory repeat family after recent related additions.

- `nlm-64230300R`
  - `The sick man's friend ...`
  - Why held back: now another companion repeat in a family already strengthened this turn.

- `wellcome-kyshj5hq`
  - `Pharmacopoeia universalis`
  - Why held back: still attractive, but the checked direct text route returned `404`.

- `wellcome-zskkj287`
  - `Therapeutics and materia medica`
  - Why held back: book-scale and relevant, but the checked direct text route returned `404`.

- `wellcome-d5vq9tfn`
  - `The works of William Cullen, M.D. ...`
  - Why held back: substantive, but the checked direct text route returned `404`.

- `wellcome-ynsejrrk`
  - `The book of prescriptions`
  - Why held back: still only a controlled Beasley-family supplement, not the next automatic slot.

## Recommended batching shape

Next campaign should prefer:

- another manually screened NLM-led slice
- at most one or two companion volumes when they deliberately complete a newly opened family
- one uncovered practical or materia-medica work in the same slice
- no automatic `workids.txt` file until the next three or four works are manually route-checked
- Wellcome titles only after route quality improves or a deliberate fallback lane is reopened
