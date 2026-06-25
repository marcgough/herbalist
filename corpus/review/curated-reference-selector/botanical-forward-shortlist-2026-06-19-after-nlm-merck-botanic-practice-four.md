# Botanical Forward Shortlist

Date: 2026-06-19

Purpose:

Capture the next manual-screening lane after the NLM-led pass landed `nlm-101636373`, `nlm-61570610R`, `nlm-64230290R`, and `nlm-64210120RX1`.

This note supersedes the earlier mixed-pass follow-on note as the current next-lane guidance.

## What changed

- the archive just added 4 NLM works cleanly, pushing the corpus to `1192` chunked works
- the refreshed selector still surfaces several useful NLM candidates
- checked Wellcome direct text routes for `wellcome-zskkj287`, `wellcome-kyshj5hq`, and `wellcome-d5vq9tfn` were still returning `404` on 2026-06-19
- that means the next lane should still be screened manually and should remain NLM-led unless Wellcome route quality materially improves

## Stronger current NLM manual-review leads

These are not yet a ready-to-run batch file. They are the cleaner remaining NLM leads for the next manual screen:

1. `nlm-101509190X1`
   - `General therapeutics and materia medica : adapted for a medical textbook (Volume 1)`
   - Why: substantial book-scale materia-medica volume with only one chunked family witness so far.

2. `nlm-2555010R`
   - `The domestic physician, and family assistant ...`
   - Why: uncovered family with explicit materia-medica, medicinal-vegetable, and pharmacy sections, even if its domestic-medicine framing needs watching.

3. `nlm-07221330R`
   - `Optimistic medicine : or, the early treatment of simple problems rather than the late treatment of serious problems`
   - Why: practical health and hygiene framing, lighter family repetition, and still book-scale rather than pamphlet-shaped.

Reserve after those:

- `nlm-64311130R`
  - `Repertory to Hering's Condensed materia medica`
  - Why reserved: uncovered and relevant, but repertory framing makes it a more specialized follow-up rather than the next default slot.

- `nlm-101232588`
  - `[Medical recipe book]`
  - Why reserved: potentially useful, but the bibliographic envelope is thin enough that it deserves a manual shape check before promotion.

## Hold back from the immediate lane

- `nlm-61650830R`
  - `An improved system of botanic medicine ...`
  - Why held back: strong book, but now a deeper repeat family with `3` chunked family witnesses already present.

- `nlm-2561024R`
  - `The Edinburgh new dispensatory ...`
  - Why held back: useful, but another deep Edinburgh dispensatory repeat family after recent related additions.

- `nlm-2557010R`
  - `Quincy's Lexicon-medicum`
  - Why held back: deep repeat dictionary family.

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
- uncovered or lightly represented family-physician, therapeutics, and materia-medica works
- no automatic `workids.txt` file until the next three or four works are manually route-checked
- Wellcome titles only after route quality improves or a deliberate fallback lane is reopened
