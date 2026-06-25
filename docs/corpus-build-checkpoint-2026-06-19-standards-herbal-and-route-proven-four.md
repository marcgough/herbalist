# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the next mixed acquisition pass completed after the recipe, herbal, companion, and supplement four checkpoint.

Main outcomes:

- 4 additional rights-cleared works were acquired and chunked successfully
- the pass widened the corpus with one standards-oriented pharmacopoeia anchor, one uncovered herbal witness, one thin but useful materia-medica and hygiene reference, and one large route-proven Wellcome therapeutics text
- the derived corpus layers were rebuilt after the pass
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 4 new works
- 2 of the newly landed works were immediately surfaced by thin-work review as reference-shaped witnesses, which is valuable editorial context rather than hidden retrieval noise

## Standards, herbal, and route-proven four completed

The following 4 works are now acquired and chunked successfully:

- `nlm-2567001R` - *The pharmacopoeia of the United States of America : 1820* - `29` chunks, `30` paragraphs
- `nlm-9604420` - *A philosophical theory of an "empiric," proved practically ...* - `163` chunks, `589` paragraphs
- `wellcome-ydxpwjpa` - *Materia medica, therapeutics, hygiene.* - `64` chunks, `65` paragraphs
- `wellcome-xy2guga9` - *Materia medica and therapeutics : for physicians and students / by John B. Biddle.* - `1675` chunks, `1696` paragraphs

All 4 processed successfully.

## Batch characteristics

Taken together, this pass did four different jobs for the archive:

- added one compact standards witness that helps with nomenclature, preparations, and pharmacopoeia cross-reference
- kept one uncovered herbal lane moving with a work that turned out to have more substantive body text than its title alone suggested
- accepted one thin but broad Wellcome reference because it still contributes practical materia-medica, therapeutics, and hygiene coverage
- added one large route-proven Wellcome therapeutics text that materially deepens retrieval breadth

## Editorial note on thin-work review

Two of the newly landed works were immediately flagged in thin-work review:

- `nlm-2567001R`
  - review class: `severe-thin-reference`
  - recommendation: keep as a standards anchor, but treat as a reference witness rather than a full-scale practical manual
- `wellcome-ydxpwjpa`
  - review class: `thin-reference`
  - recommendation: keep for breadth, but weight it more carefully than the larger therapeutic and materia-medica books

That does not make either acquisition a mistake. It means the archive is now classifying light reference witnesses openly instead of letting them blend invisibly into the same retrieval bucket as book-scale works.

## Current corpus totals

- registered works: `2720`
- chunked works: `1212`
- discovered works: `1501`
- failed works: `7`
- chunk records: `1555239`
- paragraph records: `1766955`

### By collection

- NLM Digital Collections: `395` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `790` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `978`
- uncovered frontier families: `901`
- depth frontier families: `188`
- herb candidates: `81010`
- seed-ready herb families: `124`
- supporting families: `138`
- herb profiles: `124`
- seed-review families: `60678`
- promotion candidates: `146`
- identity-review candidates: `29`
- secondary candidates: `56562`
- deprioritized candidates: `3941`

### Local footprint

- size: `10.668 GiB`
- files: `10424`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3202`
- `edition-family`: `1866`
- `work-summary`: `1212`
- `herb-profile`: `124`

Refresh status after this pass:

- `4` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `nlm-2567001R`
  - `nlm-9604420`
  - `wellcome-ydxpwjpa`
  - `wellcome-xy2guga9`

## Selector state after this pass

The refreshed botanical-reference selector now shows a sharper split:

- the NLM side has narrowed further toward repeat-heavy pharmacopoeia, dictionary, and dispensatory witnesses
- the Wellcome side now has two stronger route-proven botany leads ready for the next screen: `wellcome-bxdn87b9` and `wellcome-vh28hz64`
- the known no-text Wellcome holds remain unchanged for `wellcome-takhmyez`, `wellcome-kw7su3cf`, and `wellcome-ww8gtwfv`

## Next move

The next lane should stay manually screened.

The strongest current shape is likely:

- one or two route-proven Wellcome botany witnesses first
- one NLM slot only if it adds real family value rather than more repeat pharmacopoeia depth
- keep the foreign-language-leading NLM herbal reserve (`nlm-101125242`) on hold for now
