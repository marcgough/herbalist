# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Keep broad book-only corpus acquisition moving while improving selector quality so the next campaigns favor practical English-language reference works over weaker lecture, advertising, or foreign-language-led candidates.

This pass stayed inside the locked constraints:

- books only
- no web scraping
- no API-key-dependent sources
- official or clearly rights-cleared source lanes only

## What changed

### 1. The frontier now has a stronger English-first practical-reference bias

`scripts/corpus/build-acquisition-frontier.mjs` now gives more credit to:

- manuals
- handbooks
- dictionaries
- catalogues
- companions
- pharmacopoeias
- practical domestic-health references

It now pushes down:

- clearly foreign-language-leading titles in the first retrieval wave
- memoir and dissertation shapes
- commercial advertising or diet-drink material
- lecture and exam framing

### 2. The live batch selector now mirrors that quality filter

`scripts/corpus/run-frontier-batch.mjs` now applies matching penalties during final batch choice, so the actual acquisition pass follows the improved frontier rather than drifting back toward weaker titles inside the selection window.

### 3. Series normalization is tighter again

Semicolon-led witness shapes such as `Lexicon medicum; or medical dictionary; ...` now collapse into a shorter stable series key.

That matters because it prevents near-identical dictionary witnesses from being selected in the same campaign slice just because one copy has a longer descriptive tail.

### 4. A narrow academic-admin suppression pass was added after the live run

The real campaign still surfaced one obvious admin artefact:

- `Address of the faculty, with the annual report, and catalogue ...`

So the selector was tightened again to suppress:

- faculty addresses
- annual reports
- session catalogues
- lecture syllabi

That follow-up change improved the next dry-run frontier without changing the archive that had already been acquired.

## Verification before live acquisition

Completed:

- syntax check for `build-acquisition-frontier.mjs`
- syntax check for `run-frontier-batch.mjs`
- frontier rebuild
- dry-run batch inspection

The dry-run improved materially:

- foreign-language-leading Wellcome titles were pushed down
- duplicate `Lexicon medicum` family witnesses no longer appeared in the same slice
- stronger practical titles rose into the selected batch

## Live campaign run completed

Executed:

- `node scripts/corpus/run-frontier-campaign.mjs --cycles=2 --nlm-limit=6 --wellcome-limit=8`

Result:

- 2 cycles completed
- 28 additional works acquired and chunked
- 0 new source failures

The remaining failed registry item is still:

- `nlm-101139425`

## Campaign outcome

### Starting state

- 605 chunked works
- 816,640 chunk records

### Ending state

- 633 chunked works
- 855,570 chunk records

Net gain:

- 28 additional chunked works
- 38,930 additional chunk records

### Cycle 1

- 6 NLM works
- 8 Wellcome works
- 14 new chunked works
- 27,871 additional chunk records

Representative additions:

- `A manual of organic materia medica and pharmacognosy`
- `The guide to health and married woman's companion`
- `The family doctor, or, Sick man's friend`
- `Lexicon medicum`
- `Indian medicinal plants`
- `The London dispensatory`

### Cycle 2

- 6 NLM works
- 8 Wellcome works
- 14 new chunked works
- 11,059 additional chunk records

Representative additions:

- `A clinical materia medica`
- `The ready adviser and family guide`
- `A hand-book of domestic medicine`
- `A manual of materia medica and therapeutics`
- `Joyfull newes out of the new-found worlde`
- `The pharmacopoeia of the Royal College of Physicians of London`

## Current authoritative corpus totals

After the campaign:

- 2,720 registered works
- 633 locally acquired and chunked works
- 2,086 discovered works still queued
- 1 failed work
- 855,570 total chunk records
- 1,002,890 total paragraph records

Current collection mix:

- 27 Project Gutenberg works / 14,221 chunks
- 390 Wellcome works / 584,656 chunks
- 216 NLM works / 256,693 chunks

## Current semantic layer totals

### Acquisition frontier

- 1,523 actionable title families
- 1,408 uncovered families
- 136 depth families
- 0 failed-only families

Remaining collection candidates:

- NLM: 314
- Wellcome: 1,209

After the follow-up academic-admin suppression pass:

- 1,519 actionable title families
- NLM: 312
- Wellcome: 1,207

### Evidence layer

- 673,918 chunk-signal records
- 51,153 herb candidates
- 3,095 high-confidence herb candidates
- 14,445 medium-confidence herb candidates
- 33,613 low-confidence herb candidates
- 51,221 graph nodes
- 294,863 graph edges

### Term-family layer

- 50,385 canonical families
- 47,628 accepted families
- 47,388 accepted plant families
- 240 accepted broader materia medica families
- 32 review families
- 2,725 rejected families

### Seed-catalog layer

- 112 seed-ready families
- 81 supporting families
- 37,864 review families
- 9,329 excluded noise families

### Herb-profile layer

- 112 herb profiles
- 56,231 matched chunks
- all 112 profiles still have preparation, condition, caution, and plant-part signals

## What this means

This pass improved two things at once:

1. the archive got larger again in a measurable way
2. the next acquisition slices should spend more effort on practical books and less on low-value edge cases

That is the right direction for the Herbalisti corpus-first strategy. We are still gathering broadly, but the gathering is becoming more selective in a way that helps the future search and chat experience.

## Recommended next move

1. keep running moderate frontier campaigns while the uncovered-family frontier remains this broad
2. add one more series-family suppression layer for duplicate dictionary and reference witnesses that still survive across deeper volume or edition variants
3. start a focused review pass on the largest accepted-but-not-seed-ready plant families so the corpus growth continues turning into a stronger public herbal database
