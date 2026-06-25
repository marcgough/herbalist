# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next Wellcome-led therapeutic-annotation pharmacopoeia, antidotaria, and homoeopathic-pharmacopoeia pass completed after the translated-pharmacopoeia, extemporaneous-dispensatory, and chirurgical-pharmacy three checkpoint.

Main outcomes:

- 3 additional rights-cleared Wellcome works were acquired and chunked successfully
- the pass added one prescriber-oriented pharmacopoeia handbook with therapeutic annotations, one plague-antidote and dispensatory-reform witness, and one homoeopathic pharmacopoeia bridge
- the derived corpus layers were rebuilt again at the new `1247`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- the next source-ready reserve now narrows toward one dispensatory supplement, one substantial materia-medica manual repeat, and a small set of deeper dictionary or Latin-leading holdovers

## Therapeutic annotations, antidotaria, and homoeopathic pharmacopoeia three completed

The following 3 works are now acquired and chunked successfully:

- `wellcome-sxa9nnuw` - *A pharmacopoeia of selected remedies with therapeutic annotations ...* - `740` chunks, `745` paragraphs
- `wellcome-jxb2z3u7` - *Antidotaria; or, a collection of antidotes against the plague ...* - `60` chunks, `68` paragraphs
- `wellcome-gdh7c6kr` - *Pharmacopoeia homoeopathica* - `189` chunks, `189` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this pass did four useful jobs for the archive:

- added a broader prescriber-facing pharmacopoeia witness with therapeutic annotations and supplementary remedial notes
- added a practical antidote and dispensatory-reform witness instead of another generic repeat shell
- brought in one narrower homoeopathic pharmacopoeia bridge without spending a slot on route-bad witnesses
- advanced the pharmacopoeia lane while still keeping the archive grounded in rights-cleared official text routes

## Editorial note on thin-work review

None of the newly landed works were flagged in `thin-work-review`.

That matters because even the more compact `wellcome-jxb2z3u7` stayed outside the current thin-work alert lane, so this pass deepened the pharmacopoeia cluster without adding new thin-work burden.

## Current corpus totals

- registered works: `2720`
- chunked works: `1247`
- discovered works: `1466`
- failed works: `7`
- chunk records: `1604888`
- paragraph records: `1817416`

### By collection

- NLM Digital Collections: `396` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `824` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `953`
- uncovered frontier families: `884`
- depth frontier families: `180`
- herb candidates: `82035`
- chunk signals: `1224702`
- graph nodes: `82103`
- graph edges: `470689`
- accepted term families: `76811`
- review term families: `36`
- rejected term families: `3884`
- seed-ready herb families: `124`
- supporting families: `141`
- herb profiles: `124`
- seed-review families: `61472`
- promotion candidates: `154`
- identity-review candidates: `31`
- secondary candidates: `57318`
- deprioritized candidates: `3969`

### Thin-work review

- total chunked works reviewed: `1247`
- flagged works: `153`
- severe thin works: `82`
- fragment flags: `23`
- reference flags: `94`
- multi-work-family flags: `74`

### Local footprint

- size: `10.97 GiB`
- files: `10716`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3237`
- `edition-family`: `1866`
- `work-summary`: `1247`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `wellcome-sxa9nnuw` - total `1`, kind `work-summary`, chunk `740`, paragraph `745`
  - `wellcome-jxb2z3u7` - total `1`, kind `work-summary`, chunk `60`, paragraph `68`
  - `wellcome-gdh7c6kr` - total `1`, kind `work-summary`, chunk `189`, paragraph `189`

## Selector state after this pass

The refreshed selector remains noisy at the very top, so the next lane should stay manually screened.

Current route-ready reserve:

- `wellcome-ybfdn8ze`
- `wellcome-wrd4fj88`
- `wellcome-pz2t9kxy`
- `wellcome-x4e5vzzu`
- `wellcome-wmk5vabn`

Current no-text hold list:

- `wellcome-takhmyez`
- `wellcome-kw7su3cf`
- `wellcome-jkjv35ym`
- `wellcome-f6f97kmm`
- `wellcome-ww8gtwfv`
- `wellcome-xtum85vk`
- `wellcome-bn68mk4f`
- `wellcome-n2yp92tq`
- `wellcome-kpjgpmdd`
- `wellcome-vs9d8y7g`
- `wellcome-x9vpr68y`

## Recommended next move

Next Wellcome-led manually screened lane should prefer:

- `wellcome-wmk5vabn`
- `wellcome-x4e5vzzu`
- one optional third slot from `wellcome-wrd4fj88` or `wellcome-pz2t9kxy`

Why this is the cleaner next lane now:

- `wellcome-wmk5vabn` is source-ready and uncovered, with a dispensatory-supplement shape that adds breadth without needing OCR recovery
- `wellcome-x4e5vzzu` is source-ready and substantial, even though it deepens an already represented materia-medica manual family
- `wellcome-wrd4fj88` is source-ready and broad, but it deepens a dictionary family
- `wellcome-pz2t9kxy` is source-ready and uncovered, but Latin-leading and weaker for first-pass retrieval experience
- `wellcome-ybfdn8ze` remains useful as a broad lexicon anchor, but it is a heavier repeat family than `wellcome-wrd4fj88`
