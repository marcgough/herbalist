# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next Wellcome-led medicines, therapeutics, and industrial-flora pass completed after the pharmacologia, U.S.-pharmacopoeia chemistry, and chirurgical-pharmacy three checkpoint.

Main outcomes:

- 3 additional rights-cleared Wellcome works were acquired and chunked successfully
- the pass added one broad medicines-and-administration witness spanning the three British pharmacopoeias, one substantial therapeutics and toxicology treatise, and one narrower industrial-flora botanical witness
- the derived corpus layers were rebuilt again at the new `1241`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- the next source-ready reserve shifted again toward English pharmacopoeia translation, extemporaneous dispensatory practice, homoeopathic pharmacopoeia, and remaining deep reference families, while the no-text Wellcome holds remain unchanged

## Medicines, therapeutics, and industrial flora three completed

The following 3 works are now acquired and chunked successfully:

- `wellcome-x5urdxkm` - *Medicines : their uses and mode of administration ...* - `2153` chunks, `2187` paragraphs
- `wellcome-gyum2j5c` - *A treatise on therapeutics ...* - `2431` chunks, `2451` paragraphs
- `wellcome-cd68uah7` - *Contribucion al estudio de la flora industrial Mexicana. Cuaderno 1, La candelilla.* - `54` chunks, `59` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this pass did four useful jobs for the archive:

- added a broad medicines-and-administration witness that should help later retrieval around use patterns, comparative pharmacopoeias, and formulae
- widened the therapeutics layer with a substantial clinical reference rather than another narrow supplement lane
- added one uncovered botanical-industrial flora witness to keep the corpus from narrowing too far into English-only reference families
- stayed inside the current source-ready Wellcome text lane without spending effort on route-bad witnesses

## Editorial note on thin-work review

None of the newly landed works were flagged in `thin-work-review`.

That matters because this pass deepened medicines, therapeutics, and botanical industrial-flora coverage without adding new thin-reference burden.

## Current corpus totals

- registered works: `2720`
- chunked works: `1241`
- discovered works: `1472`
- failed works: `7`
- chunk records: `1602130`
- paragraph records: `1814598`

### By collection

- NLM Digital Collections: `396` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `818` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `959`
- uncovered frontier families: `889`
- depth frontier families: `181`
- herb candidates: `81962`
- chunk signals: `1222832`
- graph nodes: `82030`
- graph edges: `470278`
- accepted term families: `76743`
- review term families: `36`
- rejected term families: `3880`
- seed-ready herb families: `124`
- supporting families: `139`
- herb profiles: `124`
- seed-review families: `61416`
- promotion candidates: `153`
- identity-review candidates: `31`
- secondary candidates: `57263`
- deprioritized candidates: `3969`

### Thin-work review

- total chunked works reviewed: `1241`
- flagged works: `153`
- severe thin works: `82`
- fragment flags: `23`
- reference flags: `94`
- multi-work-family flags: `74`

### Local footprint

- size: `10.95 GiB`
- files: `10666`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3231`
- `edition-family`: `1866`
- `work-summary`: `1241`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `wellcome-x5urdxkm` - total `1`, kind `work-summary`, chunk `2153`, paragraph `2187`
  - `wellcome-gyum2j5c` - total `1`, kind `work-summary`, chunk `2431`, paragraph `2451`
  - `wellcome-cd68uah7` - total `1`, kind `work-summary`, chunk `54`, paragraph `59`

## Selector state after this pass

The refreshed selector remains noisy at the very top, so the next lane should stay manually screened.

Current route-ready reserve:

- `wellcome-ybfdn8ze`
- `wellcome-wrd4fj88`
- `wellcome-pz2t9kxy`
- `wellcome-x4e5vzzu`
- `wellcome-t4cqgruq`
- `wellcome-gdh7c6kr`
- `wellcome-xdthjw73`
- `wellcome-r82ueyna`

Current no-text hold list:

- `wellcome-takhmyez`
- `wellcome-kw7su3cf`
- `wellcome-jkjv35ym`
- `wellcome-f6f97kmm`
- `wellcome-ww8gtwfv`
- `wellcome-xtum85vk`
- `wellcome-bn68mk4f`
- `wellcome-n2yp92tq`

## Recommended next move

Next Wellcome-led manually screened lane should prefer:

- `wellcome-xdthjw73`
- `wellcome-r82ueyna`
- one optional third slot from `wellcome-t4cqgruq` or `wellcome-gdh7c6kr`

Why this is the cleaner next lane now:

- `wellcome-xdthjw73` is source-ready and strong for first-pass retrieval because it is an English translation of a broad pharmacopoeia witness
- `wellcome-r82ueyna` is source-ready and broad, with a practical extemporaneous-dispensatory profile rather than a narrow appendicial witness
- `wellcome-t4cqgruq` stays source-ready and English-accessible, but it deepens the chirurgical-pharmacy family that is already represented
- `wellcome-gdh7c6kr` is source-ready but narrower and title-leading toward a homoeopathic pharmacopoeia lane
- `wellcome-ybfdn8ze` and `wellcome-wrd4fj88` remain substantial, but both deepen already represented dictionary families
- `wellcome-pz2t9kxy` is source-ready but Latin-leading
- `wellcome-x4e5vzzu` is source-ready and substantial, but it deepens a manual family that is already well represented
