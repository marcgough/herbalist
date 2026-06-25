# Herbalisti Knowledge Corpus First Plan

Date: 2026-06-16
Last updated: 2026-06-22

## Active Goal

Build the Herbalisti corpus as a broad local library of appropriate rights-cleared books only.

Locked constraints:

- no web scraping
- no API-key-dependent sources at this stage
- collect works locally, not as linked placeholders
- go materially beyond a seed set; the aim is a real working corpus, not 25 showcase texts
- store and manage the corpus using a Corpus Memory semantic archive pattern so retrieval, review, and later chat/search can all sit on the same foundation

## Separation Architecture

The corpus is now explicitly split from the shared working-memory service.

- `corpus/`
  - the raw source archive and derived evidence layers
- `corpus-memory/`
  - the separate local semantic retrieval service for Herbalisti only
- shared working-memory service
  - briefs, checkpoints, handoffs, and operator context only

## Current State Snapshot

The goal above is now active and the corpus is already being built in that shape.

Current live archive totals:

- 2,720 registered works
- 1,318 locally acquired and chunked works
- 1,394 discovered works still queued
- 8 failed works
- 1,724,086 chunk records
- 1,945,625 paragraph records

Current collection mix:

- 27 Project Gutenberg works
- 854 Wellcome Collection works
- 437 NLM Digital Collections works

Current semantic-layer signals:

- 902 actionable frontier title families still available for acquisition
- 841 uncovered frontier families still available for first-witness acquisition
- 171 depth frontier title families still available for deliberate repeat-family expansion
- 1,308,529 chunk signals in the evidence layer
- 84,578 herb candidates in the evidence layer
- 83,230 term families compiled, with 79,208 accepted, 36 under review, and 3,986 rejected
- 124 seed-ready herb families in the curated catalog
- 145 supporting families in the curated catalog
- 124 herb profiles already compiled from the corpus
- 1,866 edition families compiled as a bibliographic dedupe layer
- 63,430 seed-catalog review families now ranked into:
  - 179 promotion candidates
  - 34 identity-review candidates
  - 59,161 secondary candidates
  - 4,056 deprioritized candidates

Current `Corpus Memory` semantic archive totals:

- 3,308 indexed retrieval documents
- 1,866 `edition-family` documents
- 1,318 `work-summary` documents
- 124 `herb-profile` documents

Current local corpus footprint:

- 11.65 GiB
- 11,318 files

The ingestion stack is now also more operationally stable:

- explicit Wellcome work-id batches now process from the local registry without rescanning catalogue discovery results
- the bounded frontier batch and campaign runners now resolve child scripts from the Herbalisti project root instead of the outer workspace root
- reusable frontier batch profiles now let us store curated acquisition bias in `corpus/review/frontier-profiles/` instead of rebuilding exclusion lists by hand
- frontier batch profiles can now express topic boosts, title-cluster boosts, title-phrase penalties, and explicit title exclusions for more deliberate lane-building
- a dedicated English-accessible intake profile now lives at `corpus/review/frontier-profiles/english-practical-reference-2026-06-18.json`
- a thin-work review layer now flags short or fragment-shaped chunked works into `corpus/review/thin-work-review/` before they silently steer later retrieval weighting
- the seed-catalog curation audit now verifies that manual seed promotions, supporting decisions, and alias merges still resolve after every rebuild
- the seed-review-priority layer now ranks the giant manual-review backlog into promotion, identity-review, secondary, and deprioritized lanes and is rebuilt automatically by `run-frontier-batch.mjs`
- `Corpus Memory` now indexes edition families as first-class retrieval documents and also enriches work summaries with family linkage metadata
- the works registry now sanitizes malformed rows and deduplicates repeated note fragments so repeated acquisition attempts do not poison later retrieval text
- `Corpus Memory` full ingests now prune stale scope documents, so edition-family and work-summary counts stay congruent with the latest derived corpus instead of drifting upward across rebuilds
- the frontier batch selector now also penalizes course-of-examinations titles, medical-book catalogues, revision-instruction witnesses, and additional lecture or convention shapes that were still leaking through English-reference dry runs
- the English-accessible intake profile now carries explicit exclusions for several persistent non-English or low-value reference stragglers that remained after the generic penalty pass
- the English-accessible intake profile was tightened again after later dry runs exposed testimonial, lecture-note, exam-sheet, nurse-diary, and jail-report witnesses that still looked numerically attractive but were poor public-reference candidates
- the curated-reference selector now also accepts reusable frontier-profile JSON directly, so the same editorial bias can steer both frontier campaigns and explicit discovered-work review
- a dedicated botanical-reference intake profile now lives at `corpus/review/frontier-profiles/botanical-reference-2026-06-19.json` and tilts the next pass toward herbals, floras, medico-botanical glossaries, vegetable materia medica, and plant-centered regional references
- the corpus builders no longer keep the works-registry lock across whole download and OCR passes; discovery merges and per-work status updates now happen in short atomic write windows, which lets reconcile and other corpus work proceed during long acquisitions
- fetches now have explicit request timeouts and the Wellcome PDF recovery path now has explicit command timeouts, so slow network or OCR fallbacks fail more cleanly instead of sitting indefinitely
- the PDF OCR helper now flushes progress messages more frequently, which makes long image-heavy Wellcome recoveries observable instead of silently opaque
- the Wellcome runner now keeps the root IIIF collection manifest available as an official fallback candidate while also traversing nested manifests, which allowed the archive to recover the previously failed Jonathan Pereira record `wellcome-skdfu5qa`
- the Wellcome runner now rewrites per-work `work.md` after registry status changes so recovered items no longer keep stale failure-state envelopes
- a later English-reference expansion committed 10 additional NLM works successfully, but the first 14-work Wellcome slice proved too slow for one live batch window; the stuck parent and child workers were stopped cleanly, the lock was cleared, and the derived archive was rebuilt from the committed state
- the latest curated reference expansion added 14 more rights-cleared works in one pass: 6 NLM titles and 8 Wellcome titles focused on materia medica, dispensatories, pharmacopoeias, medical botany, and medical dictionaries
- a reusable curated-reference selector now ranks discovered official-lane works before acquisition, cools repeated title series more aggressively, and writes per-collection review worklists so the next batch can stay book-heavy even when the raw frontier still contains noisy household or administrative witnesses
- the latest selector-driven expansion added 20 more rights-cleared works in one pass: 10 NLM titles and 10 Wellcome titles, bringing the chunked archive to 1,038 locally acquired works and the separate `Corpus Memory` archive to 3,028 retrieval documents
- the selector was hardened again to penalize questions-and-answers shapes, pamphlets, memorial and convention material, trade and manufacturer sheets, veterinary or farrier material, and deeper repeat-family witnesses that were still crowding the top of the review queue
- the latest acquisition pass added another 20 rights-cleared works in one pass: 10 NLM titles and 10 Wellcome titles, with a stronger mix of botanical companions, herbals, family-reference medicine books, dispensatories, pharmacognosy references, and medical dictionaries; the chunked archive now stands at 1,058 works and the separate `Corpus Memory` archive at 3,048 retrieval documents
- the latest botanical-reference expansion added 21 more rights-cleared works in practice: 10 NLM titles and 11 Wellcome titles, with a heavier mix of herbals, floras, glossaries, vegetable materia medica, and plant-centered regional books; the chunked archive now stands at 1,079 works and the separate `Corpus Memory` archive at 3,069 retrieval documents
- one additional Wellcome candidate, `wellcome-n2yp92tq`, exposed the old whole-run lock scope; after the registry-write hardening pass it remains in `discovered` state for a later heavy OCR recovery lane, but it no longer blocks other corpus maintenance or acquisitions
- a manual shortlist for the next stricter plant-centered acquisition pass now lives at `corpus/review/curated-reference-selector/botanical-manual-shortlist-2026-06-19.md`
- the first post-hardening botanical follow-up added 6 more rights-cleared NLM works and rebuilt the derived layers, bringing the chunked archive to 1,085 works and the separate `Corpus Memory` archive to 3,075 retrieval documents
- 3 further NLM botanical targets now sit in explicit retry lanes after browser-verification failures: `nlm-2661459RX5`, `nlm-2661459RX6`, and `nlm-64210320R`
- the next plant-centered Wellcome pass completed 8 more rights-cleared books from the same botanical shortlist, covering botanic-health guidance, United States and vegetable materia medica, and regional flora references for Britain, Scotland, the Alps, and New Zealand; the chunked archive now stands at 1,093 works and the separate `Corpus Memory` archive at 3,083 retrieval documents
- a second Wellcome forward pass then added 6 more rights-cleared books focused on dispensatories, botanic-principles medicine, Scottish flora, pharmacopoeia translation, and practical materia medica; the chunked archive now stands at 1,099 works and the separate `Corpus Memory` archive at 3,089 retrieval documents
- a third Wellcome forward pass then added 4 more rights-cleared books, mixing another full dispensatory witness with Flora Lapponica and two practical materia-medica references; the chunked archive now stands at 1,103 works and the separate `Corpus Memory` archive at 3,093 retrieval documents
- a fourth Wellcome forward pass then added 4 more rights-cleared books, dominated by large flora references plus another Edinburgh dispensatory witness; the chunked archive now stands at 1,107 works and the separate `Corpus Memory` archive at 3,097 retrieval documents
- a fifth Wellcome forward pass then added 4 more rights-cleared books, mixing another Edinburgh dispensatory witness with Flora Japonica, Flora Londinensis, and Flora Oxoniensis; the chunked archive now stands at 1,111 works and the separate `Corpus Memory` archive at 3,101 retrieval documents
- a sixth Wellcome forward pass then added 4 more rights-cleared books, mixing another Edinburgh dispensatory witness with Niger flora, The British flora, and Gray's supplement to the pharmacopoeia; the chunked archive now stands at 1,115 works and the separate `Corpus Memory` archive at 3,105 retrieval documents
- a seventh Wellcome forward pass then added 4 more rights-cleared books, mixing another Edinburgh dispensatory witness with a Pereira bridge text, a scientific-terms manual, and a multilingual terminology volume; the chunked archive now stands at 1,119 works and the separate `Corpus Memory` archive at 3,109 retrieval documents
- an eighth Wellcome forward pass then added 3 more rights-cleared books, mixing another Edinburgh dispensatory witness with a lighter-repeat medical dictionary and one substantive pharmacological-and-botanical paper volume; the chunked archive now stands at 1,122 works and the separate `Corpus Memory` archive at 3,112 retrieval documents
- a refined next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-eighth-wellcome-pass.md`, shrinking the next pass to two stronger remaining book-scale witnesses rather than padding it with plate-led, memoir-led, duplicate-paper, narrow-monograph, or foreign-language-leading dictionary material
- a ninth Wellcome forward pass then added 2 more rights-cleared books, pairing another Edinburgh dispensatory witness with a broader Chinese imperial maritime customs-service bridge volume spanning materia medica, epidemics, famine, and public health; the chunked archive now stands at 1,124 works and the separate `Corpus Memory` archive at 3,114 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-ninth-wellcome-pass.md`, reopening the immediate slice to three book-scale witnesses: one terminology anchor, one dispensatory witness, and one pharmacological-and-botanical papers volume while still holding back plate-led, memoir-led, narrow-monograph, and foreign-language-leading material
- a tenth Wellcome forward pass then added 3 more rights-cleared books, bringing in a deep lexicon witness, another large dispensatory, and a pharmacological-and-botanical papers volume; the chunked archive now stands at 1,127 works and the separate `Corpus Memory` archive at 3,117 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-tenth-wellcome-pass.md`, shifting the immediate slice toward one practical botanic-medicine manual, one controlled lexicon repeat, and one flora-and-botany companion while still holding back plate-led, memoir-led, narrow-monograph, and foreign-language-leading material
- an eleventh Wellcome forward pass then added 3 more rights-cleared books, bringing in a practical botanic-medicine manual, another deep lexicon witness, and a flora-and-botany companion; the chunked archive now stands at 1,130 works and the separate `Corpus Memory` archive at 3,120 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-eleventh-wellcome-pass.md`, tightening the immediate slice around one broad medical dictionary volume, one uncovered dispensatory supplement, and one narrower therapeutics monograph while still holding back plate-led, memoir-led, foreign-language-leading, and heavier repeat-dictionary material
- a twelfth Wellcome forward pass then added 3 more rights-cleared books, bringing in a large London medical dictionary volume, a substantive pharmacopoeia supplement, and a narrower therapeutics monograph; the chunked archive now stands at 1,133 works and the separate `Corpus Memory` archive at 3,123 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twelfth-wellcome-pass.md`, tightening the immediate slice around one controlled lexicon repeat, one uncovered pharmacology reference, and one uncovered dispensatory supplement variant while still holding back plate-led, memoir-led, and foreign-language-leading material
- a thirteenth Wellcome forward pass then added 3 more rights-cleared books, bringing in a pharmacology reference, a second pharmacopoeia supplement witness, and one controlled lexicon repeat; the chunked archive now stands at 1,136 works and the separate `Corpus Memory` archive at 3,126 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-thirteenth-wellcome-pass.md`, shifting the immediate slice toward a multilingual botanical-and-pharmaceutical dictionary lane plus one remaining controlled lexicon repeat while still holding back plate-led and memoir-led material
- a fourteenth Wellcome forward pass then added 3 more rights-cleared books, bringing in a botanical-and-pharmaceutical dictionary plus two French-language materia-medica references; the chunked archive now stands at 1,139 works and the separate `Corpus Memory` archive at 3,129 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-fourteenth-wellcome-pass.md`, rebalancing the immediate slice toward North American medical plants, one Spanish-language materia-medica dictionary, and one practical botanic-medicine witness while still holding back plate-led, memoir-led, and heavier repeat-dictionary material
- a fifteenth Wellcome forward pass then added 3 more rights-cleared books, bringing in a North American medical-plants reference, one Spanish-language materia-medica dictionary, and one practical botanic-medicine witness; the chunked archive now stands at 1,142 works and the separate `Corpus Memory` archive at 3,132 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-fifteenth-wellcome-pass.md`, shifting the immediate slice away from repeat lexicons, plate-led material, and memoir framing toward one broad English dispensatory, one Edinburgh dispensatory witness, and one prescriber-oriented pharmacopoeia while still holding back commentary-heavy and repeat-dictionary witnesses
- a sixteenth Wellcome forward pass then added 2 more rights-cleared books, bringing in one universal English dispensatory and one prescriber-oriented pharmacopoeia, while a parallel Edinburgh dispensatory witness surfaced a fresh official-text `404` and moved into manual retry; the chunked archive now stands at 1,144 works and the separate `Corpus Memory` archive at 3,134 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-sixteenth-wellcome-pass.md`, keeping the immediate slice centered on an alternate Edinburgh dispensatory witness plus one pharmacopoeia commentary bridge, with a controlled lexicon repeat only as the cleanest third-slot fallback while the failed `wellcome-bkdvy7wy` stays in manual retry
- a seventeenth Wellcome forward pass then added 3 more rights-cleared books, successfully recovering the alternate Edinburgh dispensatory witness, adding one uncovered pharmacopoeia commentary bridge, and taking one controlled lexicon repeat only as a deliberate fallback; the chunked archive now stands at 1,147 works and the separate `Corpus Memory` archive at 3,137 retrieval documents
- the selector window was then widened beyond the saturated top ranks so the next lane could move back toward uncovered book-scale materia-medica references instead of cycling through additional lexicon and pharmacopoeia near-duplicates
- an eighteenth Wellcome forward pass then added 3 more rights-cleared books, bringing in one experimental materia-medica history, one India-linked regional digest, and one practical clinical-pharmacopoeia bridge; the chunked archive now stands at 1,150 works and the separate `Corpus Memory` archive at 3,140 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-eighteenth-wellcome-pass.md`, shifting the immediate slice toward one practical therapeutics handbook, one uncovered homoeopathic pharmacopoeia and posology witness, and one broad natural-history bridge while continuing to hold back plate-led, memoir-led, administrative, supplement-only, Latin-leading, and heavier repeat-family material
- a nineteenth Wellcome forward pass then added 3 more rights-cleared books, bringing in one practical therapeutics handbook, one uncovered homoeopathic pharmacopoeia and posology witness, and one broad natural-history bridge; the chunked archive now stands at 1,153 works and the separate `Corpus Memory` archive at 3,143 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-nineteenth-wellcome-pass.md`, shifting the immediate slice toward one practical vegetable materia-medica manual, one plant-specific Seneca-root witness, and one two-volume experimental materia-medica bridge while continuing to hold back plate-led, memoir-led, supplement-only, Latin-leading, administrative, and heavier repeat-family material
- the staged post-nineteenth shortlist was then cleaned against the stricter book-only standard before acquisition, moving the tract-shaped `wellcome-c5t9cgqr` out of the immediate slice and bringing the more clearly book-shaped `wellcome-kkpnd6fh` into it
- that cleaned Wellcome follow-up then added 3 more rights-cleared books after one official-text failure surfaced: `wellcome-xdwqj3xz`, `wellcome-kkpnd6fh`, and `wellcome-eerza6hf`; the stalled bridge title `wellcome-gj4s5ed2` moved into manual retry after the official Wellcome text path returned `404 Not Found`, and the chunked archive now stands at 1,156 works with the separate `Corpus Memory` archive at 3,146 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twentieth-wellcome-pass.md`, now centered on one experimental materia-medica history, one prescriber-oriented pharmacopoeia, and one controlled botanical-plate witness while holding back deeper lexicon repeats, memoir framing, tract-like witnesses, supplement-only volumes, and current Wellcome `404` text-endpoint cases
- the next curated Wellcome pass then landed all 3 staged works cleanly: `wellcome-z3vrmmat`, `wellcome-qwu5nvnn`, and `wellcome-me9wem67`, adding one substantial experimental materia-medica history, one prescriber-oriented pharmacopoeia, and one lighter botanical-plate witness; the chunked archive now stands at 1,159 works with the separate `Corpus Memory` archive at 3,149 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twenty-first-wellcome-pass.md`, now centered on one uncovered vegetable-kingdom materia-medica reference, one controlled two-volume lexicon repeat, and one English-framed botanical memoir-and-papers witness while holding back Latin- and German-leading titles, tract-like witnesses, supplement-only volumes, and the current Wellcome `404` text-endpoint cases
- the next Wellcome pass then landed `wellcome-jd7wwg5w`, `wellcome-x9wbqn69`, and `wellcome-y6chc2az`, adding one plant-centered therapeutics volume, one very large general medical lexicon, and one English-framed botanical memoir-and-papers witness; the chunked archive then stood at 1,162 works with the separate `Corpus Memory` archive at 3,152 retrieval documents
- the follow-on Wellcome pass then landed `wellcome-je7nxmph`, `wellcome-zw57j8sb`, and `wellcome-kptt2h24`, extending the archive with a second Phillips therapeutics volume, one more controlled lexicon witness, and one Latin-leading botanical materia-medica reference; the chunked archive now stands at 1,165 works with the separate `Corpus Memory` archive at 3,155 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twenty-third-wellcome-pass.md`, now centered on one family-physician bridge, one Chinese materia-medica note set, and one German-leading deep reference while holding back very deep lexicon repeats, tract-like witnesses, supplement-only volumes, current Wellcome `404` text-endpoint cases, and reprinted article bundles that are weaker against the book-only standard
- the next Wellcome pass then landed `wellcome-jt7wyzcy`, `wellcome-rpvs9hh8`, and `wellcome-dczsx3at`, adding one family-physician bridge, one Chinese materia-medica note set, and one German-leading deep reference; the chunked archive now stands at 1,168 works with the separate `Corpus Memory` archive at 3,158 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twenty-fourth-wellcome-pass.md`, now centered on one practical late materia-medica vade mecum, one earlier practice-of-physic bridge, and one source-ready Linnaean materia-medica anchor while holding back deep lexicon repeats, supplement-only witnesses, administrative pamphlets, article-reprint bundles, and current Wellcome `404` text-endpoint cases
- the next Wellcome pass then landed `wellcome-y66g7ucd`, `wellcome-hgcgmrsu`, and `wellcome-fstcqcz6`, adding one practical late materia-medica vade mecum, one earlier practice-of-physic bridge, and one source-ready Linnaean materia-medica anchor; the chunked archive now stands at 1,171 works with the separate `Corpus Memory` archive at 3,161 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twenty-fifth-wellcome-pass.md`, now centered on one large American eclectic therapeutics anchor, one Brazilian vegetal materia-medica reference, and one compact tables-of-materia-medica handbook while holding back deep lexicon repeats, supplement-only witnesses, thin Latin pharmacopoeia, administrative pamphlets, article-reprint bundles, and current Wellcome `404` text-endpoint cases
- the next Wellcome pass then landed `wellcome-awbgqprm`, `wellcome-tjsrnm95`, and `wellcome-tse6znah`, adding one large American eclectic therapeutics anchor, one Brazilian vegetal materia-medica reference, and one compact tables-of-materia-medica handbook; the chunked archive now stands at 1,174 works with the separate `Corpus Memory` archive at 3,164 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twenty-sixth-wellcome-pass.md`, now centered on one American family medical guide, one Thomsonian book-of-health bridge, and one large prescriptions compendium while holding back deep lexicon repeats, supplement-only witnesses, thin Latin pharmacopoeia, administrative pamphlets, article-reprint bundles, and current Wellcome `404` text-endpoint cases
- the next Wellcome pass then landed `wellcome-rnpdxpd2`, `wellcome-cr3ah4dq`, and `wellcome-bsnmkdkc`, adding one American family medical guide, one Thomsonian book-of-health bridge, and one large prescriptions compendium; the chunked archive now stands at 1,177 works with the separate `Corpus Memory` archive at 3,167 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twenty-seventh-wellcome-pass.md`, now centered on one rewritten Beasley prescriptions witness, one chemists-and-dispensers vade mecum, and one Monro supplement as the cleanest remaining non-duplicate `200` route while holding back deep lexicon repeats, thin Latin pharmacopoeia, administrative pamphlets, article-reprint bundles, and current Wellcome `404` text-endpoint cases
- the next Wellcome pass then landed `wellcome-dnp36947`, `wellcome-sdq8m36q`, and `wellcome-p6afhue8`, adding one rewritten Beasley prescriptions witness, one chemists-and-dispensers vade mecum, and one Monro supplement bridge; the chunked archive now stands at 1,180 works with the separate `Corpus Memory` archive at 3,170 retrieval documents
- a refreshed next forward lane now lives at `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twenty-eighth-wellcome-pass.md`, now centered on one clinical pharmacopoeia pocket reference, one older Beasley prescriptions witness only as a deliberate family supplement, and one thin Latin pharmacopoeia witness as the cleanest remaining `200` route while explicitly holding back the prospectus-shaped homoeopathic item, deep lexicon repeats, administrative pamphlets, article-reprint bundles, and current Wellcome `404` text-endpoint cases
- that Wellcome-only forward lane was then deliberately superseded by a mixed-lane pass that landed `nlm-101602783`, `nlm-2561027R`, and `wellcome-bguddw3c`, adding one compact pharmacopoeia conspectus, one large Edinburgh dispensatory witness, and one substantial William Cullen bridge; the chunked archive now stands at 1,188 works with the separate `Corpus Memory` archive at 3,178 retrieval documents
- `Corpus Memory` work summaries were then hardened so the searchable retrieval text now carries the canonical `work_id` and metadata URL directly, and exact work-id lookups were re-verified after a full refresh for `nlm-101602783`, `nlm-2561027R`, and `wellcome-bguddw3c`
- the refreshed curated selector after that mixed pass still over-admits tract-shaped, prospectus-shaped, article-reprint, and repeat-family material in the remaining Wellcome lane, so the next campaign note now recommends manual screening and a mixed or NLM-led lane instead of another blind Wellcome-only three-book batch
- the next NLM-led pass then landed `nlm-101636373`, `nlm-61570610R`, `nlm-64230290R`, and `nlm-64210120RX1`, adding one Merck index reference, two practical botanic-family medicine works, and one large American practice-of-medicine volume; the chunked archive now stands at 1,192 works with the separate `Corpus Memory` archive at 3,182 retrieval documents
- exact `Corpus Memory` retrieval was re-verified after that refresh for all four new NLM works, confirming that the work-summary retrieval hardening is holding on fresh additions as the archive grows
- manual route checks on 2026-06-19 showed the current Wellcome text endpoints for `wellcome-zskkj287`, `wellcome-kyshj5hq`, and `wellcome-d5vq9tfn` still returning `404`, so the immediate next-lane guidance now keeps Wellcome book-scale leads in reserve until their route quality improves or a fallback lane is deliberately reopened
- the following NLM-led pass then landed `nlm-101509190X1`, `nlm-2555010R`, `nlm-07221330R`, and `nlm-64311130R`, adding one large therapeutics companion volume, one domestic physician and family assistant reference, one practical hygiene-leaning health guide, and one Hering repertory witness; the chunked archive now stands at 1,196 works with the separate `Corpus Memory` archive at 3,186 retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all four newly landed works, confirming that the work-summary retrieval layer remains stable through successive NLM-led passes
- the refreshed selector after that pass now surfaces a mix of companion volumes, deeper repeat dictionaries and dispensatories, and a few still-plausible uncovered NLM works, so the next manual screen should stay disciplined around companion volumes and uncovered family-physician or practical materia-medica works rather than defaulting to the highest remaining repeat-heavy ranks
- the following NLM-led pass then landed `nlm-101509190X2`, `nlm-64210120RX2`, `nlm-61650830R`, and `nlm-9804174`, completing two companion volumes while also adding one substantial botanic-medicine witness and one pharmacopoeia key; the chunked archive then stood at `1200` works with the separate `Corpus Memory` archive at `3190` retrieval documents
- the botanical-reference profile was then tightened to suppress several known route-bad or low-value Wellcome witnesses and one lecture-shaped phrase before the next manual screen, which materially shifted the shortlist away from some previously recycled failures
- a manually screened mixed pass then landed `nlm-9701530`, `nlm-61860720R`, `wellcome-jdw9d8sn`, and `wellcome-vhu7ubsh`, adding one uncovered pharmacy-and-new-drugs witness, one prescriber-oriented pharmacopoeia, one large practical-medicine cyclopaedia, and one flora reference with medicinal-use notes; the chunked archive now stands at `1204` works with the separate `Corpus Memory` archive at `3194` retrieval documents
- live route probes during that mixed pass showed several high-ranking Wellcome candidates still lack usable current text bodies through the text endpoint, including `wellcome-takhmyez`, `wellcome-kw7su3cf`, and `wellcome-ww8gtwfv`, while `wellcome-jdw9d8sn`, `wellcome-vhu7ubsh`, `wellcome-k79vcnmu`, `wellcome-nhx2ne6y`, and `wellcome-xy2guga9` all returned usable text responses
- the botanical-reference profile was then tightened again to suppress prospectus, institutional-removal, and veterinary false-positive shapes before refreshing the next-lane shortlist
- the following mixed pass then landed `nlm-101232588`, `nlm-7703236`, `nlm-64210120RX3`, and `wellcome-nhx2ne6y`, adding one uncovered recipe-book witness, one family-oriented herbal reference with medicinal recipes, one third American-practice companion volume, and one large route-proven pharmacopoeia supplement; the chunked archive now stands at `1208` works with the separate `Corpus Memory` archive at `3198` retrieval documents
- that same pass intentionally accepted one thin but still useful uncovered witness, `nlm-101232588`, which now appears in `thin-work-review` as `thin-general` manual-review material instead of being silently treated as a normal full-scale book
- the refreshed selector after that pass now shows the NLM side narrowing back toward deeper repeat pharmacopoeia, dictionary, and dispensatory families, while the live route-proven Wellcome reserve now includes `wellcome-ydxpwjpa` alongside `wellcome-xy2guga9` and `wellcome-k79vcnmu`
- the next mixed pass then landed `nlm-2567001R`, `nlm-9604420`, `wellcome-ydxpwjpa`, and `wellcome-xy2guga9`, adding one standards-oriented United States pharmacopoeia anchor, one uncovered herbal witness with stronger practical body text than its polemical title suggests, one thin but broad materia-medica and hygiene reference, and one large route-proven Wellcome therapeutics text; the chunked archive now stands at `1212` works with the separate `Corpus Memory` archive at `3202` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all four newly landed works, confirming the separate work-summary retrieval layer remains stable through the first post-separation mixed pass
- `nlm-2567001R` and `wellcome-ydxpwjpa` now surface explicitly in `thin-work-review` as `severe-thin-reference` and `thin-reference` witnesses, which keeps useful reference anchors visible without letting them masquerade as full-scale book witnesses
- the refreshed selector after that pass now shifts the strongest Wellcome reserve toward route-proven botany leads `wellcome-bxdn87b9` and `wellcome-vh28hz64`, while the NLM side grows even more repeat-heavy and the known no-text Wellcome holds remain `wellcome-takhmyez`, `wellcome-kw7su3cf`, and `wellcome-ww8gtwfv`
- the next route-proven Wellcome botany pass then landed `wellcome-bxdn87b9` and `wellcome-vh28hz64`, adding two John Lindley botanical references with explicit medical framing; the chunked archive now stands at `1214` works with the separate `Corpus Memory` archive at `3204` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for both newly landed Wellcome works, confirming the separated archive continues to expose exact work-id retrieval immediately after ingest
- the refreshed selector after that pass now replaces the consumed Lindley pair with `wellcome-qtbs8rc4` and `wellcome-n2yp92tq`, while live route checks show `wellcome-qtbs8rc4` and `wellcome-k79vcnmu` currently return text but `wellcome-n2yp92tq` still has no current text resource
- the next mixed reference pass then landed `wellcome-qtbs8rc4`, `wellcome-k79vcnmu`, and `nlm-61860730R`, adding one fifth-edition Lindley botanical reference, one large materia-medica and therapeutics manual, and one small prescriber-oriented pharmacopoeia anchor; the chunked archive now stands at `1217` works with the separate `Corpus Memory` archive at `3207` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed works, confirming the separated archive continues to expose exact work-id retrieval immediately after ingest across both Wellcome and NLM additions
- `nlm-61860730R` now surfaces explicitly in `thin-work-review` as a `severe-thin-reference` witness, which preserves its standards value while keeping its lighter practical body visible to later weighting decisions
- the refreshed selector after that pass now removes `nlm-61860730R` from the NLM side altogether and shifts the immediate route-proven Wellcome reserve toward `wellcome-hz9mwjjm`, `wellcome-ea93a269`, `wellcome-x4e5vzzu`, `wellcome-efy6q6j4`, `wellcome-pz2t9kxy`, `wellcome-wrd4fj88`, and `wellcome-ybfdn8ze`, while `wellcome-takhmyez`, `wellcome-kw7su3cf`, `wellcome-ww8gtwfv`, `wellcome-n2yp92tq`, and `wellcome-jkjv35ym` still lack usable current text bodies
- the next Wellcome-led therapeutics pass then landed `wellcome-hz9mwjjm`, `wellcome-ea93a269`, and `wellcome-efy6q6j4`, adding one dispensing-and-British-pharmacopoeia laboratory course, one large therapeutics-and-toxicology treatise, and one narrower phosphorus monograph; the chunked archive now stands at `1220` works with the separate `Corpus Memory` archive at `3210` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, confirming the separated archive still exposes precise work-id retrieval immediately after a full ingest refresh
- none of those three newly landed Wellcome works were flagged in `thin-work-review`, so the pass broadened the therapeutics lane without adding a new thin-reference witness
- widened manifest-derived route probing now points the next manual lane toward a richer source-ready Wellcome reserve including `wellcome-mazvcjjv`, `wellcome-zvb4nnsd`, `wellcome-zjkfqhnm`, `wellcome-ynsejrrk`, `wellcome-ybfdn8ze`, `wellcome-wrd4fj88`, `wellcome-pz2t9kxy`, and `wellcome-x4e5vzzu`, while `wellcome-takhmyez`, `wellcome-kw7su3cf`, `wellcome-ww8gtwfv`, `wellcome-n2yp92tq`, and `wellcome-jkjv35ym` still remain outside the immediate source-ready lane
- the next Wellcome-led botanical-reference pass then landed `wellcome-mazvcjjv`, `wellcome-zvb4nnsd`, and `wellcome-ynsejrrk`, adding one botanical-system family physician, one pharmacological-and-botanical papers volume, and one large prescriptions compendium; the chunked archive now stands at `1223` works with the separate `Corpus Memory` archive at `3213` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, confirming the separated archive continues to surface exact work-id retrieval immediately after the ingest completes
- none of those three newly landed Wellcome works were flagged in `thin-work-review`, so the pass materially widened practical botanical and prescription coverage without increasing the thin-work burden
- the refreshed selector is still noisy at the very top, but the current live route-proven reserve now includes `wellcome-zjkfqhnm`, `wellcome-g3mr6uq5`, `wellcome-za7rnxwq`, `wellcome-v765jzmt`, `wellcome-ybfdn8ze`, `wellcome-wrd4fj88`, `wellcome-pz2t9kxy`, and `wellcome-x4e5vzzu`, while `wellcome-takhmyez`, `wellcome-kw7su3cf`, `wellcome-jkjv35ym`, `wellcome-f6f97kmm`, `wellcome-ww8gtwfv`, `wellcome-xtum85vk`, `wellcome-bn68mk4f`, and `wellcome-n2yp92tq` remain outside the immediate source-ready lane
- the next Wellcome-led bridge-and-reference pass then landed `wellcome-zjkfqhnm`, `wellcome-g3mr6uq5`, and `wellcome-za7rnxwq`, adding one Pereira therapeutics abridgement, one broad profitable-plants botanical bridge, and one Chinese-maritime-customs-service medicine and public-health digest; the chunked archive now stands at `1226` works with the separate `Corpus Memory` archive at `3216` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, confirming the separated archive still exposes exact work-id retrieval immediately after the ingest completes
- none of those three newly landed Wellcome works were flagged in `thin-work-review`, so the pass widened botanical-use, therapeutics, and public-health bridge coverage without adding new thin-reference burden
- the refreshed selector remains noisy at the very top, but the current live route-proven reserve now includes `wellcome-hqjgqauu`, `wellcome-v765jzmt`, `wellcome-fy6758dg`, `wellcome-p5zukfq4`, `wellcome-ybfdn8ze`, `wellcome-wrd4fj88`, `wellcome-pz2t9kxy`, and `wellcome-x4e5vzzu`, while `wellcome-takhmyez`, `wellcome-kw7su3cf`, `wellcome-jkjv35ym`, `wellcome-f6f97kmm`, `wellcome-ww8gtwfv`, `wellcome-xtum85vk`, `wellcome-bn68mk4f`, and `wellcome-n2yp92tq` still remain outside the immediate source-ready lane
- the next Wellcome-led dispensatory-and-remedies pass then landed `wellcome-hqjgqauu`, `wellcome-v765jzmt`, and `wellcome-p5zukfq4`, adding one large eighteenth-century dispensatory, one remedies-and-mode-of-administration bridge, and one general therapeutics textbook volume; the chunked archive now stands at `1229` works with the separate `Corpus Memory` archive at `3219` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, confirming the separated archive still exposes exact work-id retrieval immediately after the ingest completes
- none of those three newly landed Wellcome works were flagged in `thin-work-review`, so the pass deepened the practical therapeutics and dispensatory layer without increasing the thin-work burden
- the refreshed selector remains noisy at the very top, but the current live route-proven reserve now includes `wellcome-fy6758dg`, `wellcome-gh8qckjz`, `wellcome-j47whxdc`, `wellcome-cd68uah7`, `wellcome-ybfdn8ze`, `wellcome-wrd4fj88`, `wellcome-pz2t9kxy`, and `wellcome-x4e5vzzu`, while `wellcome-takhmyez`, `wellcome-kw7su3cf`, `wellcome-jkjv35ym`, `wellcome-f6f97kmm`, `wellcome-ww8gtwfv`, `wellcome-xtum85vk`, `wellcome-bn68mk4f`, and `wellcome-n2yp92tq` still remain outside the immediate source-ready lane
- the next Wellcome-led cyclopaedia-and-pharmacologia pass then landed `wellcome-gh8qckjz`, `wellcome-j47whxdc`, and `wellcome-fy6758dg`, adding one large practical-medicine cyclopaedia volume, one scientific-terms bridge across botany and medicine, and one pharmacologia bridge volume aligned with the London pharmacopoeia; the chunked archive now stands at `1232` works with the separate `Corpus Memory` archive at `3222` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, confirming the separated archive continues to surface exact work-id retrieval immediately after the ingest completes
- none of those three newly landed Wellcome works were flagged in `thin-work-review`, so the pass widened the practical-reference, terminology, and pharmacologia layers without increasing the thin-work burden
- the refreshed selector remains noisy at the very top, but the current live route-proven reserve now includes `wellcome-ybfdn8ze`, `wellcome-wrd4fj88`, `wellcome-pz2t9kxy`, `wellcome-x4e5vzzu`, `wellcome-cd68uah7`, `wellcome-ax3xqr3q`, `wellcome-c5zgvvdt`, and `wellcome-tez8snwv`, while `wellcome-takhmyez`, `wellcome-kw7su3cf`, `wellcome-jkjv35ym`, `wellcome-f6f97kmm`, `wellcome-ww8gtwfv`, `wellcome-xtum85vk`, `wellcome-bn68mk4f`, and `wellcome-n2yp92tq` still remain outside the immediate source-ready lane
- the next Wellcome-led pharmacographia-and-chemistry pass then landed `wellcome-ax3xqr3q`, `wellcome-c5zgvvdt`, and `wellcome-tez8snwv`, adding one substantial plant-drug history witness, one general medical-and-pharmaceutical chemistry reference, and one narrower medicinal-preparations bridge focused on iron and pharmacopoeial practice; the chunked archive now stands at `1235` works with the separate `Corpus Memory` archive at `3225` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, confirming the separated archive continues to surface exact work-id retrieval immediately after the ingest completes
- none of those three newly landed Wellcome works were flagged in `thin-work-review`, so the pass deepened plant-drug history and pharmacopoeial chemistry coverage without increasing the thin-work burden
- the refreshed selector remains noisy at the very top, but the current live route-proven reserve now includes `wellcome-ybfdn8ze`, `wellcome-wrd4fj88`, `wellcome-pz2t9kxy`, `wellcome-x4e5vzzu`, `wellcome-cd68uah7`, `wellcome-fd94cd3h`, `wellcome-cygk9vrm`, and `wellcome-tq6p5txw`, while `wellcome-takhmyez`, `wellcome-kw7su3cf`, `wellcome-jkjv35ym`, `wellcome-f6f97kmm`, `wellcome-ww8gtwfv`, `wellcome-xtum85vk`, `wellcome-bn68mk4f`, and `wellcome-n2yp92tq` still remain outside the immediate source-ready lane
- the next Wellcome-led pharmacologia-and-us-chemistry pass then landed `wellcome-tq6p5txw`, `wellcome-fd94cd3h`, and `wellcome-cygk9vrm`, adding a companion first volume for the pharmacologia bridge, a broad U.S.-pharmacopoeia chemistry manual, and one chirurgical-pharmacy practical bridge; the chunked archive now stands at `1238` works with the separate `Corpus Memory` archive at `3228` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, confirming the separated archive continues to surface exact work-id retrieval immediately after the ingest completes
- none of those three newly landed Wellcome works were flagged in `thin-work-review`, so the pass deepened pharmacologia and pharmacy-practice coverage without increasing the thin-work burden
- the refreshed selector remains noisy at the very top, but the current live route-proven reserve now includes `wellcome-ybfdn8ze`, `wellcome-wrd4fj88`, `wellcome-pz2t9kxy`, `wellcome-x4e5vzzu`, `wellcome-cd68uah7`, `wellcome-t4cqgruq`, `wellcome-x5urdxkm`, and `wellcome-gyum2j5c`, while `wellcome-takhmyez`, `wellcome-kw7su3cf`, `wellcome-jkjv35ym`, `wellcome-f6f97kmm`, `wellcome-ww8gtwfv`, `wellcome-xtum85vk`, `wellcome-bn68mk4f`, and `wellcome-n2yp92tq` still remain outside the immediate source-ready lane
- the next Wellcome-led medicines-and-therapeutics pass then landed `wellcome-x5urdxkm`, `wellcome-gyum2j5c`, and `wellcome-cd68uah7`, adding one broad medicines-and-administration witness spanning the three British pharmacopoeias, one substantial therapeutics and toxicology treatise, and one narrower industrial-flora botanical witness; the chunked archive now stands at `1241` works with the separate `Corpus Memory` archive at `3231` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, confirming the separated archive continues to surface exact work-id retrieval immediately after the ingest completes
- none of those three newly landed Wellcome works were flagged in `thin-work-review`, so the pass deepened medicines, therapeutics, and botanical industrial-flora coverage without increasing the thin-work burden
- the refreshed selector remains noisy at the very top, but the current live route-proven reserve now includes `wellcome-ybfdn8ze`, `wellcome-wrd4fj88`, `wellcome-pz2t9kxy`, `wellcome-x4e5vzzu`, `wellcome-t4cqgruq`, `wellcome-gdh7c6kr`, `wellcome-xdthjw73`, and `wellcome-r82ueyna`, while `wellcome-takhmyez`, `wellcome-kw7su3cf`, `wellcome-jkjv35ym`, `wellcome-f6f97kmm`, `wellcome-ww8gtwfv`, `wellcome-xtum85vk`, `wellcome-bn68mk4f`, and `wellcome-n2yp92tq` still remain outside the immediate source-ready lane
- the next Wellcome-led translated-pharmacopoeia-and-dispensatory pass then landed `wellcome-xdthjw73`, `wellcome-r82ueyna`, and `wellcome-t4cqgruq`, adding one English pharmacopoeia translation, one broad extemporaneous-dispensatory practice witness, and one chirurgical-pharmacy manual witness; the chunked archive now stands at `1244` works with the separate `Corpus Memory` archive at `3234` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, confirming the separated archive continues to surface exact work-id retrieval immediately after the ingest completes
- none of those three newly landed Wellcome works were flagged in `thin-work-review`, so the pass deepened pharmacopoeia translation, compounding, and pharmacy-practice coverage without increasing the thin-work burden
- the refreshed selector remains noisy at the very top, but the current live route-proven reserve now includes `wellcome-ybfdn8ze`, `wellcome-wrd4fj88`, `wellcome-pz2t9kxy`, `wellcome-x4e5vzzu`, `wellcome-gdh7c6kr`, `wellcome-sxa9nnuw`, and `wellcome-jxb2z3u7`, while `wellcome-takhmyez`, `wellcome-kw7su3cf`, `wellcome-jkjv35ym`, `wellcome-f6f97kmm`, `wellcome-ww8gtwfv`, `wellcome-xtum85vk`, `wellcome-bn68mk4f`, `wellcome-n2yp92tq`, and `wellcome-vs9d8y7g` still remain outside the immediate source-ready lane
- the next Wellcome-led therapeutic-annotation, antidotaria, and homoeopathic-pharmacopoeia pass then landed `wellcome-sxa9nnuw`, `wellcome-jxb2z3u7`, and `wellcome-gdh7c6kr`, adding one prescriber-oriented pharmacopoeia handbook with therapeutic annotations, one plague-antidote and dispensatory-reform witness, and one homoeopathic pharmacopoeia bridge; the chunked archive now stands at `1247` works with the separate `Corpus Memory` archive at `3237` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, confirming the separated archive continues to surface exact work-id retrieval immediately after ingest
- none of those three newly landed Wellcome works were flagged in `thin-work-review`, so the pass deepened the pharmacopoeia lane without adding new thin-work burden even though `wellcome-jxb2z3u7` remained compact
- the refreshed selector remains noisy at the very top, but the current live route-proven reserve now includes `wellcome-ybfdn8ze`, `wellcome-wrd4fj88`, `wellcome-pz2t9kxy`, `wellcome-x4e5vzzu`, and `wellcome-wmk5vabn`, while `wellcome-takhmyez`, `wellcome-kw7su3cf`, `wellcome-jkjv35ym`, `wellcome-f6f97kmm`, `wellcome-ww8gtwfv`, `wellcome-xtum85vk`, `wellcome-bn68mk4f`, `wellcome-n2yp92tq`, `wellcome-kpjgpmdd`, `wellcome-vs9d8y7g`, and `wellcome-x9vpr68y` still remain outside the immediate source-ready lane
- the next Wellcome-led dispensatory-supplement, materia-medica manual, and Boerhaave bridge pass then landed `wellcome-wmk5vabn`, `wellcome-x4e5vzzu`, and `wellcome-pz2t9kxy`, adding one uncovered dispensatory supplement, one substantial materia-medica and therapeutics manual, and one uncovered Latin-leading Boerhaave bridge volume; the chunked archive then rose to `1250` works with the separate `Corpus Memory` archive at `3240` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, and none of those three works were flagged in `thin-work-review`
- a further Wellcome-led United States dispensatory, Edinburgh new dispensatory, and London medical dictionary volume pass then landed `wellcome-dkebu9hu`, `wellcome-efag9654`, and `wellcome-wrd4fj88`, adding one very large U.S. dispensatory witness, one substantial Edinburgh new dispensatory witness, and one lighter-repeat London medical dictionary companion volume; the chunked archive now stands at `1253` works with the separate `Corpus Memory` archive at `3243` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, and none of those three works were flagged in `thin-work-review`
- the refreshed selector remains noisy at the very top, but the current live route-proven reserve now includes `wellcome-ybfdn8ze`, `wellcome-an2hygfn`, `wellcome-zc9bsska`, and `wellcome-v6vrvfxq`, while `wellcome-takhmyez`, `wellcome-kw7su3cf`, `wellcome-jkjv35ym`, `wellcome-f6f97kmm`, `wellcome-ww8gtwfv`, `wellcome-xtum85vk`, `wellcome-bn68mk4f`, `wellcome-n2yp92tq`, `wellcome-vs9d8y7g`, `wellcome-x9vpr68y`, `wellcome-kpjgpmdd`, and `wellcome-j98e5bzy` still remain outside the immediate source-ready lane
- the evidence builder now streams `chunk-signals.jsonl` records directly to disk instead of accumulating the full signal set in memory first, which removed the heap ceiling that surfaced once the evidence layer crossed about 1.24 million chunk-signal rows
- the next source-ready Wellcome trio then landed `wellcome-ybfdn8ze`, `wellcome-xvhvxkhz`, and `wellcome-se3qvyvq`, adding one broad lexicon witness, one larger Phillips therapeutics volume, and one American eclectic materia-medica book; the chunked archive now stands at `1259` works and the separate `Corpus Memory` archive at `3249` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, and none of those three works were flagged in `thin-work-review`
- the refreshed selector remains noisy at the very top, but the current live route-proven reserve now includes `wellcome-z367wx5k`, `wellcome-xsx7hr3e`, and `wellcome-esx5mvqp`, while `wellcome-ubh77647` currently returns `404` on the official text endpoint and `wellcome-takhmyez`, `wellcome-kw7su3cf`, `wellcome-jkjv35ym`, `wellcome-f6f97kmm`, `wellcome-ww8gtwfv`, `wellcome-xtum85vk`, `wellcome-bn68mk4f`, `wellcome-n2yp92tq`, `wellcome-vs9d8y7g`, `wellcome-x9vpr68y`, `wellcome-kpjgpmdd`, and `wellcome-j98e5bzy` still remain outside the immediate source-ready lane
- the next source-ready Wellcome trio then landed `wellcome-xsx7hr3e`, `wellcome-esx5mvqp`, and `wellcome-z367wx5k`, adding one American lexicon witness, one practical prescriptions handbook, and one deeper Hooper lexicon repeat; the chunked archive now stands at `1262` works and the separate `Corpus Memory` archive at `3252` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, and none of those three works were flagged in `thin-work-review`
- the refreshed selector moved again after that rebuild; the cleanest current live route-proven Wellcome reserve now includes `wellcome-bjnepyda`, `wellcome-bkhg7djn`, and optional `wellcome-gy79dgeq`, while `wellcome-ubh77647` still returns `404` on the official text endpoint and `nlm-101526713` remains present as an NLM OCR-route candidate for a parallel cross-collection lane
- the next source-ready Wellcome trio then landed `wellcome-bjnepyda`, `wellcome-bkhg7djn`, and `wellcome-gy79dgeq`, adding one practical materia-medica and therapeutics manual, one Thomsonian-principles medicine and materia-medica bridge, and one further broad lexicon witness; the chunked archive now stands at `1265` works and the separate `Corpus Memory` archive at `3255` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, and none of those three works were flagged in `thin-work-review`
- the refresh cycle also confirmed a retrievable new-state archive after a timed-out ingest left two stale writer processes behind; stopping only those stale writers cleared the lock while the live `Corpus Memory` server stayed healthy on `127.0.0.1:8766`
- the refreshed selector moved again after that rebuild; the cleanest current live route-proven Wellcome reserve now includes `wellcome-aw843fyz`, `wellcome-ac4j48ht`, and optional `wellcome-gecedbpt`, while `wellcome-ubh77647` still returns `404` on the official text endpoint and `nlm-101526713` remains present as an NLM OCR-route candidate for a parallel cross-collection lane
- the next source-ready Wellcome trio then landed `wellcome-aw843fyz`, `wellcome-ac4j48ht`, and `wellcome-gecedbpt`, adding one reformed-or-botanic practice witness, one compact Irish pharmacopoeia witness, and one deeper Mayerne pharmacopoeia-and-formulas volume; the chunked archive now stands at `1268` works and the separate `Corpus Memory` archive at `3258` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed Wellcome works, and none of those three works were flagged in `thin-work-review`
- the refreshed selector moved again after that rebuild; `wellcome-ngf4vfpt`, `wellcome-gpp79sus`, and `wellcome-cek32jpp` are now source-ready on official text, but manual screening should hold back `wellcome-gpp79sus` because the title drifts into dental pathology rather than the stronger herbal and practical-medicine core, while `wellcome-ubh77647` still returns `404` and `nlm-101526713` remains present as a browser-assisted NLM OCR-route candidate for a parallel cross-collection lane
- the next manually screened mixed lane then landed `wellcome-ngf4vfpt`, `wellcome-cek32jpp`, and `nlm-101526713`, adding one substantial English chymical dispensatory, one thin pharmacopoeia compendium witness, and one browser-assisted NLM lexicon bridge; the chunked archive now stands at `1271` works and the separate `Corpus Memory` archive at `3261` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed mixed-lane works; `wellcome-ngf4vfpt` stayed out of `thin-work-review`, while `wellcome-cek32jpp` and `nlm-101526713` were both flagged as thin or severe-thin review candidates and should stay visible as lower-weight reference witnesses rather than unqualified core anchors
- the refreshed selector moved again after that rebuild; `wellcome-gfr7cke2`, `wellcome-gpp79sus`, and `wellcome-qk5mzrqw` are now source-ready on official text, but manual screening should hold back `wellcome-gpp79sus` because it drifts into dental pathology and `wellcome-qk5mzrqw` because it reads as a colonial trade-and-seamen health travel witness rather than a strong herbal or practical-reference book, while `wellcome-ubh77647` still returns `404` and `nlm-101526718` is present only as another browser-assisted NLM lexicon repeat
- the next mixed lane then landed `wellcome-gfr7cke2`, `nlm-64220630R`, and `nlm-63560990R`, adding one practical pharmaceutical-formula compend and two substantive NLM family physician witnesses; the chunked archive now stands at `1274` works and the separate `Corpus Memory` archive at `3264` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed works, and none of those three titles were flagged in `thin-work-review`
- the refreshed selector then rolled forward again; `wellcome-yhv25daq` has replaced `wellcome-gfr7cke2` in the selected Wellcome reserve, `wellcome-gpp79sus` remains an editorial hold for dental drift, `wellcome-qk5mzrqw` remains an editorial hold for trade-and-seamen-health drift, `wellcome-ubh77647` still returns `404` on the official text endpoint, and `nlm-101526718` remains visible only as an optional browser-assisted lexicon repeat while the strongest uncovered NLM family-physician follow-ups now include `nlm-63950560R` and `nlm-2672001R`
- the next mixed lane then landed `wellcome-yhv25daq`, `nlm-63950560R`, and `nlm-2672001R`, adding one broad study-of-physick bridge, one strong hydropathic family physician, and one lighter modern family physician witness; the chunked archive now stands at `1277` works and the separate `Corpus Memory` archive at `3267` retrieval documents
- exact `Corpus Memory` retrieval was re-verified again after that refresh for all three newly landed works; `wellcome-yhv25daq` and `nlm-63950560R` stayed out of `thin-work-review`, while `nlm-2672001R` surfaced as `thin-general` and should stay visible as a lower-weight domestic-medicine witness rather than a full-strength anchor
- the refreshed selector then rolled forward again; `wellcome-aqkb26gx` has replaced `wellcome-yhv25daq` in the selected Wellcome reserve and now returns official Wellcome text, while `nlm-61840770R` and `nlm-101125242` remain viable NLM OCR-route candidates, `wellcome-gpp79sus` remains an editorial hold for dental drift, `wellcome-qk5mzrqw` remains an editorial hold for trade-and-seamen-health drift, and `wellcome-ubh77647` still returns `404`
- the next mixed lane then landed `wellcome-aqkb26gx`, `nlm-61840770R`, and `nlm-101526718`, adding one route-proven botanical excursion witness, one practical family guide, and one deliberate lexicon-repeat fallback; the chunked archive now stands at `1280` works and the separate `Corpus Memory` archive at `3270` retrieval documents
- exact `Corpus Memory` retrieval and thin-work review were re-verified after that refresh: `wellcome-aqkb26gx` stayed clear, `nlm-61840770R` surfaced as `thin-reference`, and `nlm-101526718` surfaced as `severe-thin-reference`, so only the Wellcome witness should be treated as a full-strength new anchor
- `nlm-101125242` then moved into an explicit manual-retry lane after the official NLM OCR route failed to expose a trusted `<pre>` body; the registry now records `download_failed` plus `manual_retry_required`, and same-turn live probes showed an AWS WAF challenge pattern, so this reads more like upstream access variance than a simple parser miss
- the refreshed selector rolled again after that rebuild; `wellcome-yss258s7` has replaced `wellcome-aqkb26gx` in the selected Wellcome reserve, but the official Wellcome text endpoint currently returns no usable body in live checks, so the cleaner next acquisition lane is NLM-heavy around `nlm-64230300R`, `nlm-2578017R`, and optional `nlm-2557010R`
- the next NLM-heavy lane then landed `nlm-64230300R`, `nlm-2578017R`, and `nlm-2557010R`, adding one botanical family-use manual, one large family-medicine witness, and one major lexicon anchor; the chunked archive now stands at `1283` works and the separate `Corpus Memory` archive at `3273` retrieval documents
- exact `Corpus Memory` retrieval and thin-work review were re-verified after that refresh: `nlm-64230300R` surfaced as `severe-thin-reference`, while `nlm-2578017R` and `nlm-2557010R` stayed out of `thin-work-review`, so the lane materially deepened practical coverage despite one lighter botanical witness
- the refreshed selector rolled again after that rebuild; the remaining selected NLM reserve is now `nlm-2566033RX2`, `nlm-61740710RX2`, `nlm-2561024R`, `nlm-9717182`, and `nlm-64230310R`, while the Wellcome reserve is still dominated by no-text or editorial-hold cases including `wellcome-yss258s7`
- the cleaner next manual lane should now favor `nlm-2561024R`, `nlm-61740710RX2`, and optional `nlm-2566033RX2`, while `nlm-64230310R` is better treated as same-family depth after just landing `nlm-64230300R`, `nlm-9717182` remains a generic pharmacopoeia hold, and `nlm-101125242` stays in manual retry
- the next repeat-heavy NLM lane then landed `nlm-2561024R`, `nlm-61740710RX2`, and `nlm-2566033RX2`, bringing the archive to `1286` works and the separate `Corpus Memory` archive to `3276` retrieval documents; only `nlm-2561024R` surfaced as `severe-thin-reference`, while the pharmacologia and London-dictionary volumes landed as full-scale deep-reference witnesses
- that repeat-heavy lane also exposed a selector weakness: the remaining selected reserve narrowed to weak NLM repeats while stronger botanic-principles books were still hiding in the uncovered frontier under domestic-medicine and family-physician penalties
- a manual uncovered-frontier scout then surfaced and landed `nlm-2572013R`, `nlm-2572026R`, and `nlm-2574012R`, bringing the archive to `1289` works and the separate `Corpus Memory` archive to `3279` retrieval documents; `nlm-2572013R` surfaced as `severe-thin-reference`, while `nlm-2572026R` and `nlm-2574012R` landed as full-scale practical witnesses
- a tuned selector profile now lives at `corpus/review/frontier-profiles/botanical-practical-reference-2026-06-20.json`; it rescues practical botanic-principles, Thomsonian, and medicinal-plants family guides without reopening the noisiest Aristotle, sexual-physiology, veterinary, and prospectus lanes
- the next NLM lane under that tuned profile then landed `nlm-2575001R`, `nlm-64210710R`, and `nlm-63570030R`, bringing the archive to `1292` works and the separate `Corpus Memory` archive to `3282` retrieval documents; `nlm-2575001R` surfaced as `severe-thin-reference`, while `nlm-64210710R` and `nlm-63570030R` landed as full-scale uncovered practical witnesses
- the refreshed selector under the tuned profile now keeps the remaining NLM reserve at `nlm-64230310R`, `nlm-2561026R`, and `nlm-9717182`, while the Wellcome reserve is still dominated by route-bad or editorial-hold material, so the next widening move should stay manual or involve another profile-tightening pass rather than trusting the raw top frontier
- the next manual uncovered NLM lane then landed `nlm-101303235`, `nlm-2574040R`, and `nlm-63610710R`, bringing the archive to `1295` works and the separate `Corpus Memory` archive to `3285` retrieval documents; that batch added one homeopathic repertory and vade-mecum, one regional country-remedies treatise, and one substantial practical family-physician witness
- none of those 3 newly landed works surfaced in `thin-work-review`, which means the broader manual lane widened practical coverage without adding a new thin-reference burden
- the remaining selected NLM reserve is still `nlm-64230310R`, `nlm-2561026R`, and `nlm-9717182`, so the current tuned botanical profile is helpful for rescue work but still too narrow to steer the broader practical-remedies lane automatically
- a broader practical-remedies selector profile now lives at `corpus/review/frontier-profiles/practical-remedies-reference-2026-06-20.json`; it preserves the anti-noise brakes from the narrower botanical profile while giving stronger preference to repertories, vade-mecums, country-remedy books, family physicians, and practical domestic-medicine witnesses
- the first pass under that broader profile then landed `nlm-101513942`, `nlm-2571039R`, and `nlm-61820150R`, bringing the archive to `1298` works and the separate `Corpus Memory` archive to `3288` retrieval documents; `nlm-101513942` surfaced as `thin-general`, while `nlm-2571039R` and `nlm-61820150R` stayed out of `thin-work-review`
- a second manually screened family-physician lane then landed `nlm-64331080R`, `nlm-63620210R`, and `nlm-64220260R`, bringing the archive to `1301` works and the separate `Corpus Memory` archive to `3291` retrieval documents; none of those 3 newly landed works surfaced in `thin-work-review`
- another manual uncovered practical-manual lane then landed `nlm-2555050R`, `nlm-63570340R`, and `nlm-63360780R`, bringing the archive to `1304` works and the separate `Corpus Memory` archive to `3294` retrieval documents; none of those 3 newly landed works surfaced in `thin-work-review`
- that latest lane reinforced the current editorial lesson: manually screened uncovered breadth is still outperforming the remaining selected reserve, which remains skewed toward slower depth-family practical-reference holds
- the next uncovered practical-manual lane then landed `nlm-63620760R`, `nlm-63611310R`, and `nlm-63620740R`, bringing the archive to `1307` works and the separate `Corpus Memory` archive to `3297` retrieval documents; none of those 3 newly landed works surfaced in `thin-work-review`
- that latest trio added one full-scale household-practice witness and two substantial family-physician books, but it also pushed the remaining uncovered practical lane toward lighter almanac, receipt-book, and general-health conduct shapes, which makes the strongest selected depth pair more plausible as a near-term follow-on
- the refreshed selector after those two broader passes still keeps the remaining selected NLM reserve at `nlm-8206608`, `nlm-101306881`, `nlm-2561026R`, `nlm-64230310R`, and `nlm-9717182`, which confirms the broader profile is useful but still leans toward depth-family practical references over some manually screened uncovered family-physician books
- the next mixed NLM lane then landed `nlm-8206608`, `nlm-101306881`, and `nlm-2702091R`, bringing the archive to `1310` works and the separate `Corpus Memory` archive to `3300` retrieval documents
- exact `Corpus Memory` work-id retrieval was re-verified after that refresh for all 3 newly landed works; `nlm-8206608` surfaced as `severe-thin-reference`, while `nlm-101306881` and `nlm-2702091R` stayed out of `thin-work-review`
- that mixed batch shifted the editorial read on the selected-depth lane: deliberate depth can still produce one strong family-physician witness, but it is not uniformly reliable, and the same-family `medical companion` hold is now materially weaker after `nlm-8206608` landed thin
- the refreshed selector after that mixed batch now keeps the remaining selected NLM reserve at `nlm-101313340`, `nlm-2561026R`, `nlm-64230310R`, `nlm-9717182`, and `nlm-63570300R`, which argues for a more selective next pass rather than blindly continuing down the depth queue
- the next manually screened uncovered trio then landed `nlm-101178768`, `nlm-63810390R`, and `nlm-61761120R`, bringing the archive to `1313` works and the separate `Corpus Memory` archive to `3303` retrieval documents
- exact `Corpus Memory` work-id retrieval was re-verified after that refresh for all 3 newly landed works; `nlm-101178768` surfaced as `severe-thin-reference`, while `nlm-63810390R` and `nlm-61761120R` stayed out of `thin-work-review`
- that newest batch reinforced the current editorial lesson in a more specific way: direct hygiene and materia-medica books can still land as substantive uncovered witnesses, but almanac and guide-to-health shapes remain risky even when they look clean in the frontier
- the selector reserve itself is unchanged after that pass, which means the next improvement is less about discovering another hidden top-five hold and more about teaching the ranking to distrust thin almanac, receipt-book, and reference-shaped uncovered witnesses sooner
- a tighter practical-remedies selector profile now lives at `corpus/review/frontier-profiles/practical-remedies-reference-2026-06-21.json`; it cools almanac, receipt-book, and guide-to-health shapes while giving slightly more respect to direct hygiene and therapeutic-note books
- the first batch under that tighter profile then landed `nlm-101313340`, `wellcome-rhxrvc4u`, and `wellcome-kw7su3cf`, bringing the archive to `1316` works and the separate `Corpus Memory` archive to `3306` retrieval documents
- exact `Corpus Memory` work-id retrieval was re-verified after that refresh for all 3 newly landed works; `nlm-101313340` surfaced as `severe-thin-reference`, while `wellcome-rhxrvc4u` and `wellcome-kw7su3cf` stayed out of `thin-work-review`
- that result sharpened the route split: the tightened profile materially improved the curated Wellcome lane, but the same-family NLM depth reserve still over-values some thin reference witnesses
- after the refreshed selector pass the remaining NLM reserve is now `nlm-101313341`, `nlm-2561026R`, `nlm-64230310R`, `nlm-9717182`, and `nlm-63570300R`, while the Wellcome reserve now includes the alternate English `Health restor'd` witness `wellcome-wkhtmbyj` and the book-scale `wellcome-ubh77647` practical-medicine cyclopaedia
- the raw frontier batch dry run under the tighter profile was still noisier than the curated selector output, so the next pass should continue trusting the curated selector or manual screening over a blind raw-frontier batch for this practical-remedies lane
- the next Wellcome-led pass then landed `wellcome-wkhtmbyj` and `wellcome-ubh77647`, bringing the archive to `1318` works and the separate `Corpus Memory` archive to `3308` retrieval documents
- direct SQLite verification then confirmed both new Wellcome works as `work-summary` documents with the expected chunk and paragraph counts, while `wellcome-takhmyez` remained absent because its retry stalled before manifest and chunk output
- both landed Wellcome works stayed out of `thin-work-review`, which reinforces the editorial read that the curated Wellcome lane is currently yielding better public-reference depth than the same-family NLM reserve
- the partial `wellcome-takhmyez` attempt did still retain official raw-source artifacts and remains in `discovered` state, so it now sits in a cleaner retry lane rather than blocking the archive refresh
- after that two-work pass the refreshed selector still keeps the same NLM reserve, while the Wellcome reserve rolls forward to `wellcome-ndctabm6`, `wellcome-jkjv35ym`, `wellcome-f6f97kmm`, `wellcome-ww8gtwfv`, `wellcome-xtum85vk`, `wellcome-bn68mk4f`, `wellcome-pxvbjk85`, `wellcome-m7hb9km7`, `wellcome-takhmyez`, `wellcome-d6g6adwj`, `wellcome-qb3dkxup`, and `wellcome-wmrh7xf2`

The current frontier now also reflects a practical-reference bias with stronger English-accessibility hints for the first retrieval experience:

- stronger boosts for manuals, dictionaries, catalogues, handbooks, dispensatories, and practical companions
- stronger downranking for clearly foreign-language-leading titles, commercial advertising shapes, memoir/dissertation shapes, and low-value lecture or exam framing
- campaign memory that suppresses repeated title-series witnesses across adjacent acquisition cycles
- archive-level series cooling that now subtracts score from title families and creator-plus-series witnesses already heavily represented in the chunked archive
- slash-byline normalization so Wellcome edition witnesses collapse into the right repeat family instead of leaking author fragments into the series key
- ligature normalization so `homoeopathic` and `homœopathic` witnesses resolve into the same series key instead of splitting the frontier
- stronger suppression of thin witness shapes such as exam tables, assistant plates, specifications, patent-like records, and committee-report fragments
- stronger downranking for `questions and answers` titles, `ethereal fire`, annual-meeting or section-read papers, and thin foreign-language-leading witnesses that still surfaced in late dry runs
- same-batch series dedupe so one acquisition slice does not waste slots on multiple witnesses of the same title series
- extra pruning for `extracted from` fragments, `questions to be answered` leaflets, mixed farrier and receipt-book witnesses, narrow tract-style `distinctive characters` titles, and patent-office phrasing
- stronger pruning of known false-positive or low-value witnesses such as `Physic a-field`, lecture-derived fragments, sex-debility guide variants, extract catalogues, and the stray `The famous bird that speaks one word` record
- stronger downranking for travel-and-spa health-resort guides, compliment-led shop copy, phrenological chart books, academic opening addresses, and similar household-general witnesses that do not help the retrieval core
- stronger suppression of administrative removal pamphlets, patent-letter witnesses, Latin thesis forms, appendix-to-domestic-medicine fragments, and punctuation-varied lecture or syllabus titles that resurfaced after later frontier rebuilds
- stronger suppression of `inaugural lecture`, `opening address`, sale-catalogue phrasing such as `to be sold at the prices affixed`, and foreign-language-leading pharmacopoeia or catalog titles that still leaked into late 2026-06-18 previews

The storage layout is now explicitly library-shaped and aligned with Corpus Memory:

- `corpus/REGISTRY.md` as the orientation layer
- `corpus/registry/` for canonical work and rights records
- `corpus/works/` for per-work envelopes
- `corpus/raw/`, `corpus/normalized/`, and `corpus/chunks/` for the text pipeline
- `corpus/derived/` for evidence, term families, and herb profiles
- `corpus/derived/edition-families/` for bibliographic witness clustering
- `corpus/review/` for editorial and safety review

That means the project is no longer at the idea stage. The corpus-first archive, semantic layers, and repeatable acquisition workflow are already in motion.

## Core Decision

Build the corpus first, then build the public website on top of it.

Current scope:

- books only
- no web scraping
- no API-key-dependent sources at this stage

The main asset is not the interface. It is a rights-cleared, searchable, source-grounded body of historical and practical health knowledge collected locally from appropriate books, then organized so it can later power search, chat, structured herb pages, editorial notes, and country-aware discovery.

This means the immediate job is corpus accumulation and semantic organization, not copywriting, news, or surface polish.

## What We Are Actually Building

Herbalisti should become a source-first knowledge system with five layers:

1. A source registry
2. A local raw file archive
3. A normalized text corpus
4. A structured evidence database
5. A public search and chat interface

That order matters. If we skip straight to interface work, we end up designing around thin seed data and rebuilding the foundations later.

## Inclusion Standard

Only ingest full text when at least one of these is true:

- The work is clearly in the public domain in the relevant jurisdiction.
- The work is published under a permissive reuse license that fits a public website and derivative indexing workflow.
- The host explicitly allows download and reuse of the material under terms we can comply with.

For this stage, the work should also be book-like:

- bound book
- herbal
- materia medica
- domestic medicine manual
- public health handbook
- botanical guide
- pharmacopoeia
- household health reference

Exclude for now:

- newspapers
- general web pages
- blogs
- serial feed content
- image-only collections without a practical book-level acquisition path

For the core public corpus, prefer:

- Public domain
- CC0
- CC BY
- CC BY-SA

Avoid putting these into the core public-text corpus for now:

- CC BY-NC
- CC BY-ND
- uncertain rights
- platform-only access without clear reuse rights

Those can still be tracked as metadata-only leads.

## Best Source Lanes

### 1. US public-domain lane

Use first because it is the cleanest acquisition path.

- Project Gutenberg
  - Rights signal: most ebooks are public domain in the US.
  - Catalog data: machine-readable catalog data is public domain.
  - Access path: offline catalogs, mirrors, RDF, downloadable files.
  - Use for: herbals, domestic medicine, botany, household guides, older scientific and practical works.

- National Library of Medicine Digital Collections
  - Rights signal: much of the content is public domain and freely available worldwide.
  - Access path: Digital Collections plus the NLM web service.
  - Working acquisition note: the catalog pages expose official OCR and PDF routes per work. The OCR route is suitable for corpus intake, but NLM currently places a browser challenge in front of non-browser HTTP clients, so automated collection should use a local browser runtime rather than a plain fetch-only script.
  - Use for: medical history, historical public health, herbals, old medical manuals, pamphlets, archives.

### 2. UK health-history lane

- Wellcome Collection
  - Rights signal: digitised materials are downloadable under Creative Commons or Public Domain licenses depending on the item.
  - Access path: Catalogue API plus IIIF-linked digital items.
  - Working acquisition note: when the plain text endpoint is missing, the IIIF presentation data can still expose an official Wellcome text ZIP rendering, which is now the preferred fallback before any PDF-based recovery.
  - Use for: historical medicine, anatomy, public health, domestic health, illustrations, manuscripts, 19th-century books.

### 3. Later Australia lane

- Trove / National Library of Australia
  - Valuable, but deferred for now because the official API path requires a key and rights must still be checked item by item.
  - Revisit after the no-key corpus lanes are exhausted.

### 4. Later botanical deep-catalog lane

- Biodiversity Heritage Library
  - Valuable, but deferred for now because the most scalable structured acquisition path is API-oriented and rights still need item-level review.
  - Revisit after the initial no-key corpus lanes are in place.

### 5. Later modern open-access lane

- PubMed Central reusable subset
  - Use only where the article license explicitly allows reuse.
  - Use for: modern contextual notes, not the first historical corpus pass.

## What Not To Start With

- Do not begin with arbitrary web scraping.
- Do not begin with newspapers as the main corpus.
- Do not begin with modern copyrighted books.
- Do not treat Internet Archive as a blanket rights signal.
- Do not rely on API-key-gated sources in the first collection pass.

Start with books, manuals, pamphlets, herbals, and curated journals where rights are explicit and OCR is manageable.

## Recommended Acquisition Order

### Wave 1: full no-key corpus

Target: collect all meaningful no-key book sources we can clear and download locally from the initial approved lanes, not just a seed set.

Priority categories:

- classic herbals
- domestic medicine manuals
- plant identification and cultivation guides
- public health and hygiene handbooks
- food, kitchen, and convalescence manuals
- early pharmacopoeia and materia medica references

Primary source pools:

- Project Gutenberg
- NLM Digital Collections
- Wellcome Collection
- direct no-key book downloads from other clearly licensed collections only if their reuse terms are explicit

### Wave 2: deferred keyed and item-review lanes

Add later:

- Trove books
- Biodiversity Heritage Library
- other collections that are valuable but slower to clear at scale

### Wave 3: structured modern context

Add metadata-only or reusable full-text layers from:

- PubMed Central reusable articles
- selected public institutional fact sheets
- clearly licensed nonprofit research material

## Local Storage Layout

Use a corpus-first directory tree outside the public web assets.

The storage model should follow the same architectural pattern at a high level:

- one top-level semantic registry
- durable per-work records
- derived passage chunks
- extracted entities and relationships
- review notes and evidence trails

In practice, this should feel like a library-shaped sibling of the shared working-memory system:

- `REGISTRY.md` orients the archive
- `registry/` holds canonical work and rights records
- `works/<work-id>/` acts like a durable document envelope
- `chunks/` provides retrieval-ready passage units
- `derived/` holds semantic layers that can be recomputed without mutating the original source archive
- `review/` keeps editorial caution, rights review, and provenance notes close to the corpus itself

Proposed structure:

```text
corpus/
  REGISTRY.md
  registry/
    works.csv
    collections.csv
    rights-decisions/
  works/
    <work-id>/
      work.md
      manifest.json
  raw/
    <work-id>/
      source.pdf
      source.epub
      source.txt
  normalized/
    <work-id>/
      text.md
      pages.jsonl
      sections.jsonl
  chunks/
    <work-id>.jsonl
  derived/
    entities/
    claims/
    cautions/
    embeddings/
  review/
    flags/
    editor-notes/
  exports/
```

## Database Model

The database should not just store documents. It should store evidence.

Core tables:

- `sources`
- `source_files`
- `rights_reviews`
- `works`
- `editions`
- `passages`
- `entities`
- `entity_mentions`
- `claims`
- `claim_evidence`
- `cautions`
- `topics`
- `source_relationships`

Important rule:

Every extracted fact shown to the user should be traceable back to at least one passage and one source record.

## Ingestion Pipeline

### Step 1. Register

Create one work-registry row before downloading anything.

Store:

- title
- author
- publication year
- jurisdiction
- source collection
- rights basis
- download path
- review status

### Step 2. Acquire

Download the original file locally.

Prefer:

- TXT
- EPUB
- PDF
- IIIF manifest plus image set

Store a checksum and source URL.

### Step 3. Normalize

Extract text into a stable internal form:

- UTF-8 text
- page markers
- paragraph blocks
- section headings
- OCR confidence notes where available

### Step 4. Chunk

Create passage-sized records for retrieval.

Good chunk units:

- page segment
- paragraph group
- recipe/formula block
- herb entry
- chapter subsection

### Step 5. Extract

Derive structured fields:

- herb names
- botanical names
- preparations
- plant parts
- traditional uses
- cautions
- interactions
- diseases or symptoms mentioned
- household practices

### Step 6. Review

Flag passages for:

- toxic substances
- obsolete or dangerous treatments
- pregnancy risk
- child use
- infection claims
- cancer claims
- dosage instructions

### Step 7. Publish

Only publish:

- bibliographic metadata
- paraphrased summaries
- short evidence-linked notes
- clearly attributed passage excerpts where rights permit

## Search Strategy

The best search is layered, not single-mode.

Search types:

- bibliographic search
- full-text passage search
- herb/entity search
- caution search
- preparation search
- source collection search
- country scope search: US, UK, Australia

Country scope should be applied at the metadata layer first, not guessed from free text.

## Why This Is The Right First Move

If we gather and clear the knowledge first, we get:

- a durable proprietary asset
- cleaner search quality
- better chat answers
- clearer copyright governance
- a website that can expand without re-platforming

If we skip this, the site risks becoming a beautiful shell around thin or legally uncertain content.

## What We Need To Put In Place

### Required now

- a corpus registry file
- local storage path for raw downloads
- an ingestion script set
- a rights-review workflow
- a semantic registry layout modeled on Corpus Memory

### No-key source lanes we can act on now

- Project Gutenberg: no key required
- Wellcome Collection Catalogue API: public access, no special key visible in current docs
- NLM Digital Collections web service: public access

### Deferred until later

- Trove API key
- BHL API key
- OpenAI API key
- paid vector database
- production hosting changes

Those can come after acquisition and normalization.

## Recommended Immediate Build Sequence

1. Create the registry and folder structure.
2. Define the rights taxonomy and acceptance rules.
3. Build a downloader for Project Gutenberg, Wellcome, and NLM book records.
4. Collect all rights-cleared relevant works available through those no-key lanes, not just a seed sample.
5. Normalize and chunk them.
6. Build the evidence database and review flags.
7. Only then expand the public website search and chat around the real corpus.

## Recommended First Deliverable

The first milestone should not be a redesigned page.

It should be:

"A locally stored, rights-cleared no-key book corpus with complete registry coverage of the initial approved collections, normalized text, passage chunks, and source-linked metadata."

## Official Source Links

- Project Gutenberg permissions: https://www.gutenberg.org/policy/permission.html
- Project Gutenberg catalog and robot access: https://www.gutenberg.org/policy/robot_access.html
- Project Gutenberg offline catalogs: https://www.gutenberg.org/ebooks/offline_catalogs.html
- NLM Digital Projects: https://www.nlm.nih.gov/digitalprojects.html
- Wellcome Collection access: https://wellcomecollection.org/collections/accessing-our-collections
- Wellcome Collection catalogue API: https://developers.wellcomecollection.org/docs/catalogue
- Trove API: https://trove.nla.gov.au/about/create-something/using-api
- Trove copyright and reuse: https://trove.nla.gov.au/help/copyright/copyright-and-re-use
- Trove downloading: https://trove.nla.gov.au/help/using-trove/downloading
- BHL developer tools: https://about.biodiversitylibrary.org/tools-and-services/developer-and-data-tools/
- BHL copyright and reuse: https://about.biodiversitylibrary.org/help/copyright-and-reuse/
