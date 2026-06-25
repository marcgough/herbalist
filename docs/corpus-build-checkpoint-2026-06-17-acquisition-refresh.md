# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Push the rights-cleared local corpus further toward broad coverage by acquiring another batch of official-source books, then refresh the semantic layers so the archive remains internally consistent.

## What was done

Two acquisition lanes were expanded:

1. Wellcome Collection batch refresh
2. NLM Digital Collections batch refresh

After intake, the derived semantic layers were rebuilt:

- `corpus:evidence`
- `corpus:terms`
- `corpus:seed-catalog`

## Newly acquired works in this refresh

- 19 additional Wellcome works
- 10 additional NLM works
- 29 additional chunked works total

Notable additions include:

- `Pharmacographia`
- `The British flora medica`
- `Origin and history of all the pharmacopeial vegetable drugs`
- `The experienced botanist or Indian physician`
- `A new and complete American medical family herbal`
- `New guide to health, or, Botanic family physician`
- `Hortus, botanicus americanus`
- `The family and ship medicine chest companion`

## Current corpus totals

- 2,720 registered works
- 388 locally acquired and chunked works
- 2,323 discovered works still queued
- 9 failed works requiring alternate official routes or manual review

Current chunk totals:

- 566,561 total chunk records
- 14,221 Project Gutenberg chunks
- 405,849 Wellcome chunks
- 146,491 NLM chunks

Current chunked works by collection:

- 27 Project Gutenberg works
- 260 Wellcome works
- 101 NLM works

## Current semantic totals after refresh

Evidence layer:

- 454,224 chunk-signal records
- 36,418 herb candidates
- 36,486 graph nodes
- 202,331 graph edges

Term-family layer:

- 35,930 canonical families
- 33,857 accepted families
- 33,745 accepted plant-like families
- 112 accepted broader materia medica families
- 2,043 rejected families

Seed-catalog layer:

- 103 curated seed-ready families
- 57 supporting families
- 27,063 review families
- 6,522 excluded noise families

## New outlier

One additional Wellcome work now sits in quarantine because the official text route returned `404`:

- `wellcome-t4jc2wma` - `Isagoges in rem herbariam libri duo / [Adriaan van de Spiegel].`

This has been added to the existing Wellcome missing-text quarantine note rather than left as an undocumented failure.

## Why this matters

This refresh improved both halves of the corpus goal:

1. the local archive is materially larger and richer
2. the semantic layers were rebuilt immediately, so retrieval and later database assembly remain grounded in the current corpus instead of an older snapshot

## Recommended next move

There are now two strong next-step paths:

1. continue high-priority batch acquisition from Wellcome and NLM until the next natural checkpoint
2. start promoting the highest-frequency `candidate-specific-family` rows from the seed-catalog review lane into the curated shortlist

Given the user priority of gathering the knowledge first, the acquisition path still has the stronger claim on the next pass.
