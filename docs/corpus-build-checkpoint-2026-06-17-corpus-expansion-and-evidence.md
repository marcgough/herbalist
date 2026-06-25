# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Continue growing the local Herbalisti book corpus from rights-cleared book sources only, while turning the archive into a Corpus Memory semantic store that can later drive search, chat, herb pages, and source-grounded retrieval.

## Current corpus state

- 2,720 registered works
- 359 locally acquired, normalized, and chunked works
- 2,353 queued works
- 8 failed works awaiting alternate official recovery

Chunk totals from local manifests:

- 531,530 total chunks
- 14,221 Project Gutenberg chunks
- 385,626 Wellcome Collection chunks
- 131,683 NLM Digital Collections chunks

Current collection mix:

- 27 Project Gutenberg works
- 241 Wellcome Collection works
- 91 NLM Digital Collections works

## Acquisition work completed in this pass

### NLM

- Processed 20 additional works
- No new failures
- Current local NLM count: 91 chunked works

### Wellcome

- Processed 30 additional works
- No new failures
- Current local Wellcome count: 241 chunked works

## Semantic archive progress

The local corpus now has two working semantic layers above raw text:

1. Edition families
2. Passage-linked evidence extraction

### Edition-family layer

Current totals:

- 1,917 edition families
- 394 multi-work families
- 299 high-confidence families

This remains a bibliographic layer. It groups likely copies and editions without assuming textual identity.

### Evidence layer

Generated outputs:

- `corpus/derived/evidence/chunk-signals.jsonl`
- `corpus/derived/evidence/herb-candidates.csv`
- `corpus/derived/evidence/herb-candidates.json`
- `corpus/derived/evidence/plant-parts.csv`
- `corpus/derived/evidence/preparations.csv`
- `corpus/derived/evidence/cautions.csv`
- `corpus/derived/evidence/conditions.csv`
- `corpus/derived/evidence/graph.json`
- `corpus/exports/corpus-evidence-summary.json`

Current evidence totals:

- 429,900 chunk-level signal records
- 34,974 extracted term candidates
- 1,896 high-confidence candidates
- 10,093 medium-confidence candidates
- 22,985 low-confidence candidates
- 194,823 graph edges

What this layer currently does:

- ties extracted terms back to source passages
- records plant-part, preparation, caution, and condition context
- keeps all signals source-linked rather than flattening them into claims
- now surfaces a top-ranked term list that is materially more plant-like after lexical cleanup, though variant merging and OCR cleanup are still needed

What it still needs:

- singular/plural and variant consolidation
- a second lexical cleanup pass for OCR fragments and malformed captures
- later herb-identity resolution above raw source terms

## Architecture note

This is now materially following the Corpus Memory pattern at a corpus level:

- one top-level semantic registry at `corpus/REGISTRY.md`
- durable raw and normalized source records
- derived semantic layers that remain traceable to passages
- summary exports that can feed later retrieval and UI layers

The guiding unit remains:

`work -> section -> passage -> term/caution/context`

That is the right shape for a public, source-grounded health archive because it preserves provenance and lets us build careful retrieval before we build interpretations.

## Recommended next moves

1. Keep running larger no-key acquisition passes until the chunked archive is materially deeper.
2. Add a candidate-normalization layer above the evidence output:
   - singular/plural merging
   - spelling variants
   - OCR-noise suppression
   - later synonym families
3. Start a review queue for terms and passages that should never surface without context or caution.
4. Build herb-profile assembly from evidence plus edition families, rather than from free text alone.
