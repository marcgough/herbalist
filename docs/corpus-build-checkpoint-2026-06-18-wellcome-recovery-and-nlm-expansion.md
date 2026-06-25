# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Keep the rights-cleared Herbalisti book corpus moving forward while improving the reliability of the official Wellcome acquisition path for complex multi-volume works.

This pass combined three kinds of work:

1. recover the active Wellcome failure cleanly from official fallback routes
2. harden the Wellcome runner so the recovery path is more reusable
3. commit the useful part of the next English-reference batch, then rebuild the semantic archive from the authoritative local state

## What changed

### 1. The failed Jonathan Pereira Wellcome record was recovered

Recovered work:

- `wellcome-skdfu5qa`
- `The elements of materia medica. Comprehending the natural history, preparation, properties, composition, effects and uses of medicines / [Jonathan Pereira].`

Result:

- now `chunked`
- `3,698` chunk records
- `3,707` paragraph records
- recovered through official Wellcome fallback routes as:
  - `sourceMode: wellcome_alto_fallback`
  - `selectedManifestId: b3309598x_0006`

Important effect:

- the corpus failure queue dropped from `2` failed works to `1`
- the frontier `failed_only_family` count dropped to `0`

### 2. The Wellcome runner was hardened around collection-level manifest handling

Updated file:

- `scripts/corpus/build-wellcome-corpus.mjs`

Two meaningful improvements landed:

1. `buildManifestCandidates(...)` now keeps the root IIIF collection manifest available as an official fallback candidate while also traversing nested manifests and nested collections.
2. the runner now rewrites per-work `work.md` after registry status updates, so recovered items do not keep stale failure-state envelopes.

This matters because some Wellcome records are structured as collection-level manifests with copy-level and volume-level descendants. The previous candidate walk was brittle in that shape.

### 3. The next English-reference expansion partially committed before the Wellcome leg was stopped

The next live English-reference slice did not finish end to end, but it still produced real committed progress before the first Wellcome work in the new slice became too slow for a single live batch window.

Committed part:

- `10` additional NLM works successfully acquired and chunked
- the first Wellcome record in that slice was started but did not commit

Newly committed NLM works:

- `nlm-09431320R`
- `nlm-61631000RX1`
- `nlm-101727470`
- `nlm-2561028R`
- `nlm-101208706`
- `nlm-07430880R`
- `nlm-101217227`
- `nlm-63580570R`
- `nlm-0027427`
- `nlm-101693692`

Operationally:

- a mistaken direct invocation of `build-wellcome-corpus.mjs --check` earlier in the turn launched a real writer process and held the registry lock
- that stale worker was identified, stopped, and its lock cleared safely
- the later live frontier run was also stopped cleanly once it was clear the Wellcome child was not going to finish inside the batch window

After stopping the live Wellcome child, the archive was rebuilt from committed local state with:

- `reconcile-registry-from-manifests.mjs`
- `build-edition-families.mjs`
- `build-acquisition-frontier.mjs`
- `build-corpus-evidence.mjs`
- `build-thin-work-review.mjs`
- `build-term-families.mjs`
- `build-seed-catalog.mjs`
- `build-herb-profiles.mjs`
- `build-seed-review-priority.mjs`
- `report-status.mjs`

## Current corpus totals after rebuild

- `2,720` registered works
- `968` locally acquired and chunked works
- `1,751` discovered works still queued
- `1` failed work
- `1,181,751` total chunk records
- `1,362,595` total paragraph records

Current source mix:

- `27` Project Gutenberg works
- `627` Wellcome Collection works
- `314` NLM Digital Collections works

Current local footprint:

- `8.17 GB`
- `8,332` files

Net change relative to the prior checkpoint:

- `+75` chunked works
- `-74` discovered works
- `-1` failed work
- `+54,738` chunk records
- `+59,592` paragraph records
- `+614` files

## Current semantic-archive totals after rebuild

### Acquisition frontier

- `1,151` actionable frontier title families
- `1,060` uncovered families
- `211` depth families
- `0` failed-only families

### Evidence layer

- `968` chunked works represented
- `918,585` chunk-signal records
- `67,146` herb candidates
- `4,243` high-confidence herb candidates
- `17,969` medium-confidence herb candidates
- `44,934` low-confidence herb candidates
- `67,214` graph nodes
- `388,716` graph edges

### Term-family layer

- `66,082` canonical families
- `62,651` accepted families
- `31` review families
- `3,400` rejected families

### Seed-catalog layer

- `124` seed-ready families
- `120` supporting families
- `49,941` review families
- `12,088` excluded families

### Herb-profile layer

- `124` herb profiles

### Seed-review-priority layer

- `67` promotion candidates
- `24` identity-review candidates
- `46,452` secondary candidates
- `3,398` deprioritized families

Current top promotion candidates now begin with:

- `Slippery-Elm`
- `Prickly-Ash`
- `Elm`
- `Tolu`
- `Quassia`
- `Nux Vomica`

## What remains rough

- the current wide English-reference Wellcome slice is still too heavy for a single live 14-work batch window
- the frontier still contains obvious domestic-medicine and low-value survivors at the raw recommendation layer, so the profile itself remains important
- some lexical noise still surfaces high in the ranked review backlog, including candidates such as `Tlie`

## Recommended next move

1. keep the recovered Wellcome runner as the new baseline
2. split future Wellcome live slices into smaller bounded groups rather than pairing 14-at-once with a full NLM block
3. continue English-reference or botany-led acquisition in smaller sequential windows
4. start a focused promotion pass from the upgraded `promotion-candidates.csv`, beginning with `Slippery-Elm`, `Prickly-Ash`, `Elm`, `Tolu`, `Quassia`, and `Nux Vomica`
