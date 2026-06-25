# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the NLM-led acquisition pass completed after the mixed NLM and Wellcome checkpoint.

Main outcomes:

- 4 additional rights-cleared NLM works were acquired and chunked successfully
- the pass stayed NLM-led because manually checked Wellcome direct text routes were still returning `404`
- the batch broadened the archive with practical botanic-family medicine and reference-heavy materia-medica coverage
- the derived corpus layers were rebuilt after the pass
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 4 new works

## NLM Merck, botanic, and practice four completed

The following 4 works are now acquired and chunked successfully:

- `nlm-101636373` - *Merck's 1896 index ...* - `27` chunks
- `nlm-61570610R` - *The experienced botanist or Indian physician ...* - `295` chunks
- `nlm-64230290R` - *The sick man's friend ...* - `499` chunks
- `nlm-64210120RX1` - *The American practice of medicine ... (Volume 1)* - `2348` chunks

All 4 processed successfully through the current official NLM acquisition path.

## Batch characteristics

Taken together, this pass broadened the archive along four useful axes:

- one compact Merck encyclopedia-style index that strengthens formula, dosage, caution, and drug-reference coverage
- one practical botanic-family medicine work aimed at families and practitioners
- one plain-language botanical-principles medical guide with family-use framing
- one large American practice-of-medicine volume that expands the broader practical-treatment lane

This was a cleaner next step than forcing a mixed batch with Wellcome works whose direct text routes were still unstable at screening time.

## Current corpus totals

- registered works: `2720`
- chunked works: `1192`
- discovered works: `1521`
- failed works: `7`
- chunk records: `1530216`
- paragraph records: `1736660`

### By collection

- NLM Digital Collections: `380` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `785` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `990`
- uncovered frontier families: `907`
- depth frontier families: `196`
- herb candidates: `80507`
- high-confidence herb candidates: `5181`
- medium-confidence herb candidates: `22796`
- low-confidence herb candidates: `52530`
- seed-ready herb families: `124`
- supporting families: `138`
- herb profiles: `124`
- seed-review families: `60304`
- promotion candidates: `141`
- identity-review candidates: `27`
- secondary candidates: `56197`
- deprioritized candidates: `3939`

### Local footprint

- size: `10.529 GiB`
- files: `10260`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3182`
- `edition-family`: `1866`
- `work-summary`: `1192`
- `herb-profile`: `124`

Refresh status after this pass:

- the full refresh completed successfully
- `4` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `nlm-101636373`
  - `nlm-61570610R`
  - `nlm-64230290R`
  - `nlm-64210120RX1`

## Lane status after this pass

Completed in this pass:

- `nlm-101636373`
- `nlm-61570610R`
- `nlm-64230290R`
- `nlm-64210120RX1`

Manual route findings that shaped this pass:

- `wellcome-zskkj287` direct text route returned `404`
- `wellcome-kyshj5hq` direct text route returned `404`
- `wellcome-d5vq9tfn` direct text route returned `404`

That kept the immediate lane NLM-led rather than reopening a Wellcome-heavy batch on weaker route footing.

## Next move

The refreshed selector still offers usable NLM-led growth and also keeps several book-scale Wellcome titles in reserve. The next campaign should remain manually screened rather than blindly automatic.

Best current direction:

- continue NLM-led or mixed only after route verification
- prefer uncovered or lightly represented family-physician, therapeutics, and materia-medica works
- keep deep repeat dictionaries and dispensatory witnesses controlled
- keep Wellcome reserve titles behind another route-quality check or an explicit fallback-lane decision
