# Botanical Forward Shortlist

Date: 2026-06-20

Purpose:

Capture the next manual-screening lane after the source-ready Wellcome trio landed `wellcome-aw843fyz`, `wellcome-ac4j48ht`, and `wellcome-gecedbpt`.

This note supersedes the earlier shortlist that was built before those three source-ready books were acquired.

## What changed

- the archive just added 3 more works cleanly, pushing the corpus to `1268` chunked works
- the consumed trio removed one reformed-or-botanic practice witness, one compact Irish pharmacopoeia witness, and one deeper Mayerne pharmacopoeia volume from the reserve
- the refreshed selector moved again after the rebuild and still shows `24` selected reference candidates across Wellcome and NLM
- current route checks show:
  - `wellcome-ngf4vfpt` returns official text
  - `wellcome-gpp79sus` returns official text
  - `wellcome-cek32jpp` returns official text
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
- `nlm-101526713` remains present as a browser-assisted NLM OCR-route candidate if we want a cross-collection lane

## Stronger current manual-review leads

These are not yet a ready-to-run batch file. They are the cleaner remaining leads for the next manual screen:

1. `wellcome-ngf4vfpt`
   - `The compleat chymical dispensatory, in five books`
   - Why: source-ready and materially closer to the dispensatory, formulas, and preparations core than the weaker drift title that also surfaced this round.

2. `wellcome-cek32jpp`
   - `Compendium pharmaceuticum : militaribus gallorum nosocomiis, in orbo novo boreali adscriptum`
   - Why: source-ready and still useful as a pharmacopoeia and compendium witness, even though it is Latin-leading.

3. One optional third slot:
   - `nlm-101526713`
     - Why: the official OCR route is present through the NLM browser-assisted lane, and the title remains a stronger botany and materia-medica bridge than the source-ready dental drift title.

## Hold back from the immediate lane

- `wellcome-gpp79sus`
  - `A compend of dental pathology and dental medicine`
  - Why held back: source-ready, but the topic drifts away from the current herbal, botanical, and practical-medicine retrieval core.

- `wellcome-ubh77647`
  - `The cyclopædia of practical medicine ...`
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

- `wellcome-aw843fyz`
  - `The practice of medicine, according to the plan most approved by the Reformed or Botanic Colleges of the U. S`
  - Why held back: now acquired.

- `wellcome-ac4j48ht`
  - `Pharmacopœia collegi mediocorum Regis et Reginae in Hibernia`
  - Why held back: now acquired.

- `wellcome-gecedbpt`
  - `Theo. Turquet Mayernii ... opera medica`
  - Why held back: now acquired.

## Parallel cross-collection lead

- `nlm-101526713`
  - `Lexicon medicum, or, Medical dictionary : containing an explanation of the terms in anatomy, botany, chemistry, materia medica...`
  - Why worth keeping visible: the official NLM OCR route is present, so it remains a clean non-Wellcome candidate if we decide to rotate the next lane across collections instead of continuing only inside Wellcome.

## Recommended batching shape

Next campaign should prefer:

- a manually screened slice that is not limited to Wellcome if the cleaner third slot lives in NLM
- `wellcome-ngf4vfpt` first
- `wellcome-cek32jpp` second
- `nlm-101526713` as the optional third slot if we want to avoid spending the third place on the source-ready but less relevant dental title
