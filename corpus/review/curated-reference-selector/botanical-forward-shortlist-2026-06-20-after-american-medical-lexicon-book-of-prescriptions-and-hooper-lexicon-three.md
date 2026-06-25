# Botanical Forward Shortlist

Date: 2026-06-20

Purpose:

Capture the next manual-screening lane after the source-ready Wellcome trio landed `wellcome-xsx7hr3e`, `wellcome-esx5mvqp`, and `wellcome-z367wx5k`.

This note supersedes the earlier shortlist that was built before those three source-ready books were acquired.

## What changed

- the archive just added 3 more works cleanly, pushing the corpus to `1262` chunked works
- the consumed trio removed the practical American lexicon witness, the practical prescriptions handbook, and the optional Hooper lexicon fallback from the reserve
- the refreshed selector moved again after the rebuild and now shows `24` selected reference candidates across Wellcome and NLM
- current route checks show:
  - `wellcome-gy79dgeq` returns official text
  - `wellcome-bjnepyda` returns official text
  - `wellcome-bkhg7djn` returns official text
  - `wellcome-ubh77647` returns `404` on the official text endpoint
  - `wellcome-takhmyez` returns no text resource
  - `wellcome-kw7su3cf` returns no text resource
  - `wellcome-jkjv35ym` returns no text resource
  - `wellcome-f6f97kmm` returns no text resource
  - `wellcome-ww8gtwfv` returns no text resource
  - `wellcome-xtum85vk` returns no text resource
  - `wellcome-bn68mk4f` returns no text resource
  - `wellcome-n2yp92tq` returns no text resource
  - `wellcome-vs9d8y7g` returns no text resource
  - `wellcome-x9vpr68y` returns no text resource
  - `wellcome-kpjgpmdd` returns no text resource
  - `wellcome-j98e5bzy` returns no text resource
- `nlm-101526713` remains present as an official NLM OCR-route candidate if we want a cross-collection lane

## Stronger current manual-review leads

These are not yet a ready-to-run batch file. They are the cleaner remaining leads for the next manual screen:

1. `wellcome-bjnepyda`
   - `The essentials of materia medica and therapeutics`
   - Why: source-ready, practical, and closer to the retrieval core than another broad lexicon repeat.

2. `wellcome-bkhg7djn`
   - `The practice of medicine on Thomsonian principles : and a materia medica, adapted to the work`
   - Why: source-ready and strongly aligned with botanic and practical herbal-reference themes.

3. One optional third slot:
   - `wellcome-gy79dgeq`
     - Why: source-ready and broad, but it is another large `Lexicon medicum` family repeat and should stay optional.

## Hold back from the immediate lane

- `wellcome-ubh77647`
  - `The cyclopaedia of practical medicine ...`
  - Why held back: selector-positive, but the official text endpoint currently returns `404`.

- `wellcome-takhmyez`
  - `Pharmacopoeia universalis ...`
  - Why held back: the live text probe still returns no text resource.

- `wellcome-kw7su3cf`
  - `Health restor'd ...`
  - Why held back: the live text probe still returns no text resource.

- `wellcome-jkjv35ym`
  - `Bibliotheca pharmaceutico-medica ...`
  - Why held back: still not source-ready and still Latin-leading.

- `wellcome-f6f97kmm`
  - `La medicina pittoresca ...`
  - Why held back: still not source-ready.

- `wellcome-ww8gtwfv`
  - `Materia medica`
  - Why held back: the live text probe still returns no text resource.

- `wellcome-xtum85vk`
  - `Materia medica, liber I. De plantis ...`
  - Why held back: still not source-ready.

- `wellcome-bn68mk4f`
  - `Pedanii Dioscoridis ...`
  - Why held back: still not source-ready.

- `wellcome-n2yp92tq`
  - `The elements of botany ... sixth ed.`
  - Why held back: selector-positive, but not currently source-ready.

- `wellcome-vs9d8y7g`
  - `Pharmacopoeia chirurgica ...`
  - Why held back: the live text probe currently returns no text resource.

- `wellcome-x9vpr68y`
  - `Medulla medicinae universae ...`
  - Why held back: still not source-ready.

- `wellcome-kpjgpmdd`
  - `The dispensatory of the Royal College of Physicians in London ...`
  - Why held back: still not source-ready.

- `wellcome-j98e5bzy`
  - `The dispensatory of the Royal College of Physicians, London, translated into English ...`
  - Why held back: still not source-ready.

- `wellcome-xsx7hr3e`
  - `The American medical lexicon`
  - Why held back: now acquired.

- `wellcome-esx5mvqp`
  - `The book of prescriptions`
  - Why held back: now acquired.

- `wellcome-z367wx5k`
  - `Lexicon medicum`
  - Why held back: now acquired.

## Parallel cross-collection lead

- `nlm-101526713`
  - `Lexicon medicum, or, Medical dictionary : containing an explanation of the terms in anatomy, botany, chemistry, materia medica...`
  - Why worth keeping visible: the official NLM OCR route is present, so it remains a clean non-Wellcome candidate if we decide to rotate the next lane across collections instead of continuing only inside Wellcome.

## Recommended batching shape

Next campaign should prefer:

- a Wellcome-led manually screened slice
- `wellcome-bjnepyda` first
- `wellcome-bkhg7djn` second
- `wellcome-gy79dgeq` only as the optional third slot if we want one more broad lexicon witness in exchange for taking on a deeper repeat family
