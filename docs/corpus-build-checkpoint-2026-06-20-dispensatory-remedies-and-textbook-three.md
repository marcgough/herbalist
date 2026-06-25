# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next Wellcome-led dispensatory, remedies, and therapeutics-textbook pass completed after the bridge, textbook, and profitable-plants three checkpoint.

Main outcomes:

- 3 additional rights-cleared Wellcome works were acquired and chunked successfully
- the pass added one large dispensatory, one remedies-and-mode-of-administration bridge, and one general therapeutics textbook volume
- the derived corpus layers were rebuilt again at the new `1229`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- the next source-ready reserve shifted again toward a mix of broader cyclopaedia, scientific-terms, pharmacologia, and one industrial-flora witness, while the no-text Wellcome holds remain unchanged

## Dispensatory, remedies, and textbook three completed

The following 3 works are now acquired and chunked successfully:

- `wellcome-hqjgqauu` - *The new dispensatory ...* - `2386` chunks, `2435` paragraphs
- `wellcome-v765jzmt` - *Medicines, their uses and mode of administration ...* - `1723` chunks, `1740` paragraphs
- `wellcome-p5zukfq4` - *General therapeutics and materia medica: adapted for a medical textbook (Volume 1).* - `2143` chunks, `2175` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this pass did four useful jobs for the archive:

- added a large dispensatory witness that strengthens the practical pharmacy and materia-medica backbone
- deepened the remedies-and-administration lane with a text that is especially helpful for later retrieval around use patterns and preparations
- added a broad therapeutics textbook volume that strengthens the teaching and synthesis layer
- widened the practical-reference core without burning slots on current route-bad Wellcome witnesses

## Editorial note on thin-work review

None of the newly landed works were flagged in `thin-work-review`.

That matters because this pass deepened the practical therapeutics and dispensatory layer without adding new thin-reference burden.

## Current corpus totals

- registered works: `2720`
- chunked works: `1229`
- discovered works: `1484`
- failed works: `7`
- chunk records: `1579082`
- paragraph records: `1791073`

### By collection

- NLM Digital Collections: `396` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `806` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `966`
- uncovered frontier families: `895`
- depth frontier families: `182`
- herb candidates: `81673`
- chunk signals: `1207201`
- graph nodes: `81741`
- graph edges: `468784`
- accepted term families: `76459`
- review term families: `35`
- rejected term families: `3876`
- seed-ready herb families: `124`
- supporting families: `139`
- herb profiles: `124`
- seed-review families: `61020`
- promotion candidates: `150`
- identity-review candidates: `31`
- secondary candidates: `56880`
- deprioritized candidates: `3959`

### Thin-work review

- total chunked works reviewed: `1229`
- flagged works: `153`
- severe thin works: `82`
- fragment flags: `23`
- reference flags: `94`
- multi-work-family flags: `74`

### Local footprint

- size: `10.82 GiB`
- files: `10566`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3219`
- `edition-family`: `1866`
- `work-summary`: `1229`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `wellcome-hqjgqauu`
  - `wellcome-v765jzmt`
  - `wellcome-p5zukfq4`

## Selector state after this pass

The refreshed selector remains noisy at the very top, so the next lane should stay manually screened.

Current route-ready reserve:

- `wellcome-fy6758dg`
- `wellcome-gh8qckjz`
- `wellcome-j47whxdc`
- `wellcome-cd68uah7`
- `wellcome-ybfdn8ze`
- `wellcome-wrd4fj88`
- `wellcome-pz2t9kxy`
- `wellcome-x4e5vzzu`

Current route-bad or non-ready holds:

- `wellcome-takhmyez`
- `wellcome-kw7su3cf`
- `wellcome-jkjv35ym`
- `wellcome-f6f97kmm`
- `wellcome-ww8gtwfv`
- `wellcome-xtum85vk`
- `wellcome-bn68mk4f`
- `wellcome-n2yp92tq`

## Next move

The strongest current shape is likely:

- `wellcome-gh8qckjz` first
- `wellcome-j47whxdc` second
- one optional third slot from `wellcome-fy6758dg` or `wellcome-cd68uah7`, depending on whether we want a stronger pharmacologia bridge or a narrower Spanish-leading industrial-flora witness
