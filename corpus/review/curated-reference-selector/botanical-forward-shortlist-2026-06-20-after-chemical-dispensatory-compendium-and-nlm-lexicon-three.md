# Botanical Forward Shortlist

Date: 2026-06-20

Purpose:

Capture the next manual-screening lane after the mixed source-ready lane landed `wellcome-ngf4vfpt`, `wellcome-cek32jpp`, and `nlm-101526713`.

This note supersedes the earlier shortlist that was built before those mixed-lane works were acquired.

## What changed

- the archive just added 3 more works cleanly, pushing the corpus to `1271` chunked works
- the consumed lane removed one strong chymical dispensatory, one thin pharmacopoeia compendium, and one thin NLM lexicon bridge from the reserve
- the refreshed selector moved again after the rebuild and still shows `24` selected reference candidates across Wellcome and NLM
- current route checks show:
  - `wellcome-gfr7cke2` returns official text
  - `wellcome-gpp79sus` returns official text
  - `wellcome-qk5mzrqw` returns official text
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
- `nlm-101526718` remains present as a browser-assisted NLM OCR-route candidate if we want a cross-collection lane

## Stronger current manual-review leads

These are not yet a ready-to-run batch file. They are the cleaner remaining leads for the next manual screen:

1. `wellcome-gfr7cke2`
   - `Physicians' medical compend and pharmaceutical formulae`
   - Why: source-ready and closely aligned with practical medical-compend and pharmaceutical-formula reference needs.

2. One optional cross-collection third slot:
   - `nlm-101526718`
     - Why: the official OCR route is present through the NLM browser-assisted lane, but it appears to be another lexicon-family repeat and should stay optional rather than automatic.

## Hold back from the immediate lane

- `wellcome-gpp79sus`
  - `A compend of dental pathology and dental medicine`
  - Why held back: source-ready, but the topic drifts away from the current herbal, botanical, and practical-medicine retrieval core.

- `wellcome-qk5mzrqw`
  - `A description of the island of Anno-Bona ... on the causes and prevention of sickness and mortality among seamen employed in the African trade`
  - Why held back: source-ready, but the work reads as a trade, seamen-health, and travel-station witness rather than a strong herbal or practical-reference book.

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

- `wellcome-ngf4vfpt`
  - `The compleat chymical dispensatory, in five books`
  - Why held back: now acquired.

- `wellcome-cek32jpp`
  - `Compendium pharmaceuticum`
  - Why held back: now acquired and also flagged as thin-general.

- `nlm-101526713`
  - `Lexicon medicum, or, Medical dictionary ...`
  - Why held back: now acquired and also flagged as severe-thin-reference.

## Parallel cross-collection lead

- `nlm-101526718`
  - `Lexicon medicum, or, Medical dictionary : containing an explanation of the terms in anatomy, botany, chemistry, materia medica...`
  - Why worth keeping visible: the official NLM OCR route is present, but it looks like another lexicon-family repeat and should stay optional rather than crowding out stronger practical witnesses.

## Recommended batching shape

Next campaign should prefer:

- a manually screened slice with `wellcome-gfr7cke2` as the strongest immediate move
- `nlm-101526718` only as an optional third slot if we deliberately want another cross-collection lexicon witness
- a widened manual search for additional source-ready practical compend, pharmacopoeia, or formula books rather than spending slots on the source-ready but weaker dental and travel drift titles
