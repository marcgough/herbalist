import { corpusHerbalKnowledgeEntries, corpusHerbalSourceWorks } from '../_generated/herbal-corpus.js'

export const herbalSourceWorks = [
  {
    id: 'culpeper-complete-herbal',
    title: 'The Complete Herbal',
    author: 'Nicholas Culpeper',
    year: '1653; Project Gutenberg edition released 2015',
    sourceUrl: 'https://www.gutenberg.org/ebooks/49513',
    licenseStatus: 'public_domain_usa',
    licenseLabel: 'Project Gutenberg: public domain in the USA',
    sourceType: 'public-domain reference',
    notes: 'Historical medicinal plant reference. Herbalisti uses short paraphrased index notes, not copied treatment instructions.',
  },
  {
    id: 'fernie-herbal-simples',
    title: 'Herbal Simples Approved for Modern Uses of Cure',
    author: 'William Thomas Fernie',
    year: '1895; Project Gutenberg edition released 2006',
    sourceUrl: 'https://www.gutenberg.org/ebooks/19352',
    licenseStatus: 'public_domain_usa',
    licenseLabel: 'Project Gutenberg: public domain in the USA',
    sourceType: 'public-domain book',
    notes: 'Victorian herbal simple reference. Herbalisti keeps the material historical and non-prescriptive.',
  },
  {
    id: 'young-guide-health',
    title: "Madame Young's Guide to Health",
    author: 'Amelia Young',
    year: '1858; Project Gutenberg edition released 2017',
    sourceUrl: 'https://www.gutenberg.org/ebooks/53875',
    licenseStatus: 'public_domain_usa',
    licenseLabel: 'Project Gutenberg: public domain in the USA',
    sourceType: 'public-domain guide',
    notes: 'Family herbal guide. Herbalisti indexes historical plant context without presenting historical claims as clinical advice.',
  },
  {
    id: 'northcote-book-herbs',
    title: 'The Book of Herbs',
    author: 'Rosalind Northcote',
    year: '1903; Project Gutenberg edition released 2019',
    sourceUrl: 'https://www.gutenberg.org/ebooks/60050',
    licenseStatus: 'public_domain_usa',
    licenseLabel: 'Project Gutenberg: public domain in the USA',
    sourceType: 'public-domain guide',
    notes: 'Culinary and garden herb reference used for herb identity, cultivation, kitchen use, and historical context.',
  },
  {
    id: 'kains-culinary-herbs',
    title: 'Culinary Herbs: Their Cultivation, Harvesting, Curing and Uses',
    author: 'M. G. Kains',
    year: '1912; Project Gutenberg edition released 2007',
    sourceUrl: 'https://www.gutenberg.org/ebooks/21414',
    licenseStatus: 'public_domain_usa',
    licenseLabel: 'Project Gutenberg: public domain in the USA',
    sourceType: 'public-domain guide',
    notes: 'Culinary herb guide used for plant handling, cultivation, and kitchen-use context.',
  },
]

export const herbalKnowledgeEntries = [
  {
    id: 'chamomile',
    name: 'Chamomile',
    botanicalName: 'Matricaria recutita / Chamaemelum nobile',
    commonNames: ['German chamomile', 'Roman chamomile', 'camomile'],
    plantParts: ['Flower heads'],
    categories: ['sleep ritual', 'digestion', 'aromatic flower'],
    mayHelpWith: ['evening tea traditions', 'digestive-comfort traditions', 'skin wash traditions'],
    preparations: ['infusion', 'compress', 'bath herb'],
    considerations: ['Asteraceae-family allergy review', 'sedative stacking caution', 'pregnancy review'],
    sourceIds: ['culpeper-complete-herbal', 'fernie-herbal-simples', 'northcote-book-herbs'],
    sourceNote:
      'Public-domain herbals repeatedly place chamomile/camomile among aromatic flowers used in household infusions and comfort rituals.',
  },
  {
    id: 'peppermint',
    name: 'Peppermint',
    botanicalName: 'Mentha x piperita',
    commonNames: ['mint', 'peppermint', 'mentha'],
    plantParts: ['Leaf', 'Aerial parts'],
    categories: ['digestion', 'aromatic leaf', 'culinary herb'],
    mayHelpWith: ['after-meal tea traditions', 'aromatic cooling traditions', 'kitchen herb use'],
    preparations: ['infusion', 'culinary herb', 'aromatic steam'],
    considerations: ['reflux sensitivity review', 'essential oil dilution and ingestion caution', 'infant use caution'],
    sourceIds: ['fernie-herbal-simples', 'northcote-book-herbs', 'kains-culinary-herbs'],
    sourceNote:
      'Public-domain culinary and herbal references index mint as a household aromatic with food, tea, and scent uses.',
  },
  {
    id: 'ginger',
    name: 'Ginger',
    botanicalName: 'Zingiber officinale',
    commonNames: ['ginger root', 'zingiber'],
    plantParts: ['Rhizome'],
    categories: ['warming spice', 'digestion', 'circulation tradition'],
    mayHelpWith: ['warming digestive traditions', 'travel-comfort traditions', 'cold-season kitchen use'],
    preparations: ['decoction', 'powder', 'culinary spice', 'syrup'],
    considerations: ['anticoagulant and surgery review', 'pregnancy context review', 'reflux or heat sensitivity'],
    sourceIds: ['fernie-herbal-simples', 'young-guide-health'],
    sourceNote:
      'Historical sources treat ginger as a warming rhizome and household spice; Herbalisti adds modern safety-review prompts.',
  },
  {
    id: 'dandelion',
    name: 'Dandelion',
    botanicalName: 'Taraxacum officinale',
    commonNames: ['dandelion', 'lion tooth'],
    plantParts: ['Leaf', 'Root'],
    categories: ['bitter herb', 'spring green', 'root'],
    mayHelpWith: ['bitter digestive traditions', 'spring tonic traditions', 'leaf-as-food traditions'],
    preparations: ['leaf food', 'infusion', 'root decoction'],
    considerations: ['bile duct or gallbladder review', 'diuretic medication review', 'Asteraceae-family allergy review'],
    sourceIds: ['culpeper-complete-herbal', 'northcote-book-herbs', 'kains-culinary-herbs'],
    sourceNote:
      'Public-domain herb and culinary guides index dandelion as both a bitter green and historical household plant.',
  },
  {
    id: 'nettle',
    name: 'Nettle',
    botanicalName: 'Urtica dioica',
    commonNames: ['stinging nettle', 'nettle leaf'],
    plantParts: ['Leaf', 'Aerial parts', 'Root'],
    categories: ['mineral-rich leaf', 'spring green', 'root'],
    mayHelpWith: ['spring green traditions', 'nutritive infusion traditions', 'hair-rinse traditions'],
    preparations: ['infusion', 'cooked green', 'rinse'],
    considerations: ['diuretic medication review', 'pregnancy review', 'fresh plant sting handling'],
    sourceIds: ['culpeper-complete-herbal', 'fernie-herbal-simples', 'young-guide-health'],
    sourceNote:
      'Historical herbals often describe nettle as a vigorous household plant; Herbalisti keeps the index safety-led.',
  },
  {
    id: 'elder',
    name: 'Elder',
    botanicalName: 'Sambucus nigra',
    commonNames: ['elderflower', 'elderberry'],
    plantParts: ['Flower', 'Berry'],
    categories: ['flower', 'berry', 'cold-season tradition'],
    mayHelpWith: ['flower infusion traditions', 'syrup traditions', 'seasonal household preparations'],
    preparations: ['infusion', 'syrup', 'cordial'],
    considerations: ['raw berry preparation caution', 'leaf and bark avoidance', 'immune-condition medication review'],
    sourceIds: ['culpeper-complete-herbal', 'fernie-herbal-simples', 'northcote-book-herbs'],
    sourceNote:
      'Elder appears across public-domain herbals as a household flower and berry plant, especially in seasonal preparations.',
  },
  {
    id: 'sage',
    name: 'Sage',
    botanicalName: 'Salvia officinalis',
    commonNames: ['garden sage'],
    plantParts: ['Leaf'],
    categories: ['aromatic leaf', 'culinary herb', 'throat tradition'],
    mayHelpWith: ['gargle traditions', 'culinary digestion traditions', 'aromatic household use'],
    preparations: ['infusion', 'gargle', 'culinary herb'],
    considerations: ['pregnancy caution', 'seizure-disorder review', 'essential oil caution'],
    sourceIds: ['culpeper-complete-herbal', 'fernie-herbal-simples', 'northcote-book-herbs', 'kains-culinary-herbs'],
    sourceNote:
      'Sage is common in public-domain culinary and medicinal herb references; modern use needs dose and oil-form caution.',
  },
  {
    id: 'thyme',
    name: 'Thyme',
    botanicalName: 'Thymus vulgaris',
    commonNames: ['garden thyme'],
    plantParts: ['Leaf', 'Flowering tops'],
    categories: ['aromatic leaf', 'culinary herb', 'respiratory tradition'],
    mayHelpWith: ['kitchen respiratory traditions', 'steam traditions', 'digestive aromatic use'],
    preparations: ['infusion', 'culinary herb', 'steam'],
    considerations: ['essential oil dilution and ingestion caution', 'thyroid medication review', 'pregnancy review'],
    sourceIds: ['northcote-book-herbs', 'kains-culinary-herbs', 'fernie-herbal-simples'],
    sourceNote:
      'Public-domain herb guides treat thyme as a strongly aromatic kitchen and garden herb.',
  },
  {
    id: 'rosemary',
    name: 'Rosemary',
    botanicalName: 'Salvia rosmarinus',
    commonNames: ['rosemary'],
    plantParts: ['Leaf', 'Flowering tops'],
    categories: ['aromatic leaf', 'culinary herb', 'circulation tradition'],
    mayHelpWith: ['culinary use', 'scalp-rinse traditions', 'aromatic focus traditions'],
    preparations: ['infusion', 'culinary herb', 'rinse'],
    considerations: ['pregnancy caution for concentrated use', 'seizure-disorder review', 'essential oil dilution caution'],
    sourceIds: ['culpeper-complete-herbal', 'northcote-book-herbs', 'kains-culinary-herbs'],
    sourceNote:
      'Rosemary is indexed in historical garden and household herb texts as an aromatic evergreen with culinary and household uses.',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    botanicalName: 'Lavandula angustifolia',
    commonNames: ['English lavender'],
    plantParts: ['Flowering tops'],
    categories: ['aromatic flower', 'sleep ritual', 'skin tradition'],
    mayHelpWith: ['linen and scent traditions', 'evening ritual traditions', 'skin wash traditions'],
    preparations: ['infusion', 'bath herb', 'aromatic sachet'],
    considerations: ['essential oil dilution and ingestion caution', 'sedative stacking review', 'skin sensitivity test'],
    sourceIds: ['culpeper-complete-herbal', 'fernie-herbal-simples', 'northcote-book-herbs'],
    sourceNote:
      'Lavender is a consistent public-domain household herb for scent, washing, and evening preparations.',
  },
  {
    id: 'yarrow',
    name: 'Yarrow',
    botanicalName: 'Achillea millefolium',
    commonNames: ['milfoil', 'yarrow'],
    plantParts: ['Flowering tops', 'Leaf'],
    categories: ['bitter aromatic', 'skin tradition', 'fever tradition'],
    mayHelpWith: ['sweating-tea traditions', 'external wash traditions', 'bitter tonic traditions'],
    preparations: ['infusion', 'wash', 'compress'],
    considerations: ['Asteraceae-family allergy review', 'pregnancy caution', 'anticoagulant review'],
    sourceIds: ['culpeper-complete-herbal', 'fernie-herbal-simples', 'young-guide-health'],
    sourceNote:
      'Older herbals give yarrow a prominent household role; Herbalisti surfaces it with allergy and medication-review prompts.',
  },
  {
    id: 'marshmallow',
    name: 'Marshmallow',
    botanicalName: 'Althaea officinalis',
    commonNames: ['mallow', 'marsh mallow'],
    plantParts: ['Root', 'Leaf'],
    categories: ['demulcent root', 'throat tradition', 'digestive comfort'],
    mayHelpWith: ['soothing mucilage traditions', 'throat-comfort preparations', 'digestive-comfort traditions'],
    preparations: ['cold infusion', 'decoction', 'syrup'],
    considerations: ['separate from medications by timing', 'blood sugar medication review', 'product quality review'],
    sourceIds: ['culpeper-complete-herbal', 'fernie-herbal-simples', 'northcote-book-herbs'],
    sourceNote:
      'Public-domain herbals index mallow and marshmallow as mucilage-rich plants; modern use should check medication timing.',
  },
]

const mergeNormalize = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const uniqueStrings = (...values) => {
  const output = []
  const seen = new Set()

  for (const value of values.flat()) {
    const normalized = String(value ?? '').trim()
    if (!normalized) {
      continue
    }

    const key = mergeNormalize(normalized)
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    output.push(normalized)
  }

  return output
}

const mergeHerbalSourceWorks = (...collections) => {
  const orderedIds = []
  const records = new Map()

  for (const collection of collections) {
    for (const record of collection ?? []) {
      if (!record?.id) {
        continue
      }

      if (!records.has(record.id)) {
        orderedIds.push(record.id)
      }

      records.set(record.id, record)
    }
  }

  return orderedIds.map((id) => records.get(id)).filter(Boolean)
}

const mergeHerbalKnowledgeEntries = (seedEntries, corpusEntries) => {
  const merged = new Map()

  for (const entry of seedEntries) {
    merged.set(mergeNormalize(entry.name), {
      ...entry,
      entryKind: entry.entryKind ?? 'seed',
    })
  }

  for (const entry of corpusEntries) {
    const key = mergeNormalize(entry.name)
    const existing = merged.get(key)
    if (!existing) {
      merged.set(key, entry)
      continue
    }

    const corpusSummary =
      entry.corpusWorkCount && entry.corpusChunkCount
        ? ` Historical corpus profile spans ${entry.corpusWorkCount.toLocaleString('en-US')} works and ${entry.corpusChunkCount.toLocaleString('en-US')} linked passages.`
        : ''

    merged.set(key, {
      ...existing,
      commonNames: uniqueStrings(existing.commonNames, entry.commonNames),
      plantParts: uniqueStrings(existing.plantParts, entry.plantParts).slice(0, 8),
      categories: uniqueStrings(existing.categories, entry.categories).slice(0, 8),
      mayHelpWith: uniqueStrings(existing.mayHelpWith, entry.mayHelpWith).slice(0, 8),
      preparations: uniqueStrings(existing.preparations, entry.preparations).slice(0, 8),
      considerations: uniqueStrings(existing.considerations, entry.considerations).slice(0, 8),
      sourceIds: uniqueStrings(existing.sourceIds, entry.sourceIds).slice(0, 12),
      sourceNote: `${existing.sourceNote}${corpusSummary}`.trim(),
      displayLabel: existing.displayLabel || entry.displayLabel,
      corpusWorkCount: entry.corpusWorkCount ?? existing.corpusWorkCount,
      corpusChunkCount: entry.corpusChunkCount ?? existing.corpusChunkCount,
      topicFamilies: uniqueStrings(existing.topicFamilies ?? [], entry.topicFamilies ?? []),
      catalogClass: existing.catalogClass || entry.catalogClass,
    })
  }

  return [...merged.values()].sort((left, right) => left.name.localeCompare(right.name))
}

export const allHerbalSourceWorks = mergeHerbalSourceWorks(herbalSourceWorks, corpusHerbalSourceWorks)
export const allHerbalKnowledgeEntries = mergeHerbalKnowledgeEntries(herbalKnowledgeEntries, corpusHerbalKnowledgeEntries)

const stopWords = new Set([
  'about',
  'also',
  'and',
  'are',
  'can',
  'for',
  'from',
  'help',
  'herb',
  'herbs',
  'may',
  'me',
  'of',
  'should',
  'tell',
  'the',
  'things',
  'to',
  'what',
  'with',
])

const normalize = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const tokensFor = (value) =>
  normalize(value)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token))

const entryText = (entry) =>
  [
    entry.name,
    entry.botanicalName,
    entry.displayLabel,
    entry.commonNames,
    entry.plantParts,
    entry.categories,
    entry.mayHelpWith,
    entry.preparations,
    entry.considerations,
    entry.topicFamilies,
    entry.sourceNote,
  ]
    .flat()
    .join(' ')

const sourceById = new Map(allHerbalSourceWorks.map((source) => [source.id, source]))

export const searchHerbalKnowledge = (query, limit = 5) => {
  const tokens = tokensFor(query)
  const normalizedQuery = normalize(query)

  return allHerbalKnowledgeEntries
    .map((entry) => {
      const text = normalize(entryText(entry))
      const exactName = normalize(entry.name) === normalizedQuery || entry.commonNames.some((name) => normalize(name) === normalizedQuery)
      const score =
        (exactName ? 12 : 0) +
        tokens.reduce((sum, token) => sum + (text.includes(token) ? 1 : 0), 0) +
        (text.includes(normalizedQuery) && normalizedQuery ? 3 : 0)

      return { entry, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit)
    .map((item) => item.entry)
}

const citationList = (matches) => {
  const ids = new Set(matches.flatMap((entry) => entry.sourceIds))
  return [...ids]
    .map((id) => sourceById.get(id))
    .filter(Boolean)
    .map((source) => ({
      sourceId: source.id,
      title: source.title,
      author: source.author,
      sourceUrl: source.sourceUrl,
      licenseLabel: source.licenseLabel,
    }))
}

const leadDisplayLabel = (entry) => {
  if (entry?.entryKind === 'corpus-profile') {
    return String(entry.displayLabel ?? entry.botanicalName ?? 'historical herb profile').trim()
  }

  if (entry?.botanicalName) {
    return `${entry.name} (${entry.botanicalName})`
  }

  return entry?.name ?? 'This herb'
}

export const buildHerbalChatResponse = (query) => {
  const cleanQuery = String(query ?? '').trim().slice(0, 180)
  const matches = searchHerbalKnowledge(cleanQuery, 3)
  const citations = citationList(matches)
  const policy =
    'Educational retrieval from public-domain historical herb sources. This is not medical advice, diagnosis, treatment, prescription, or a substitute for professional care.'

  if (!cleanQuery) {
    return {
      generatedAt: new Date().toISOString(),
      model: 'herbalisti-local-rag-small-v1',
      source: 'public-domain-herbal-index',
      query: cleanQuery,
      answer: 'Ask about an herb, a plant part, a traditional use, or a consideration to search the public-domain herbal index.',
      matches: [],
      citations: [],
      policy,
    }
  }

  if (!matches.length) {
    return {
      generatedAt: new Date().toISOString(),
      model: 'herbalisti-local-rag-small-v1',
      source: 'public-domain-herbal-index',
      query: cleanQuery,
      answer:
        'I could not find a strong match in the current public-domain herbal index. Try a specific herb such as ginger, nettle, elder, chamomile, peppermint, sage, thyme, lavender, or yarrow.',
      matches: [],
      citations: [],
      policy,
    }
  }

  const lead = matches[0]
  const supporting = matches.slice(1).map((entry) => entry.name)
  const leadSummary =
    lead.entryKind === 'corpus-profile'
      ? `${lead.name} is indexed as ${String(lead.displayLabel ?? 'a historical herb profile').toLowerCase()}.`
      : `${leadDisplayLabel(lead)} is indexed as ${lead.categories.join(', ')}.`
  const answer = [
    leadSummary,
    lead.corpusWorkCount && lead.corpusChunkCount
      ? `The rights-cleared Herbalisti corpus links ${lead.name} across ${lead.corpusWorkCount.toLocaleString('en-US')} works and ${lead.corpusChunkCount.toLocaleString('en-US')} source-linked passages.`
      : '',
    `Traditional contexts in the public-domain corpus include ${lead.mayHelpWith.join(', ')}.`,
    `Common preparation forms include ${lead.preparations.join(', ')}.`,
    `Considerations to review: ${lead.considerations.join(', ')}.`,
    supporting.length ? `Related index matches: ${supporting.join(', ')}.` : '',
    'Use this as historical research context only, then check a qualified professional for personal health decisions.',
  ]
    .filter(Boolean)
    .join(' ')

  return {
    generatedAt: new Date().toISOString(),
    model: 'herbalisti-local-rag-small-v1',
    source: 'public-domain-herbal-index',
    query: cleanQuery,
    answer,
    matches,
    citations,
    policy,
  }
}

export const getHerbalKnowledgePayload = (filters = {}) => {
  const query = String(filters.query ?? '').trim().slice(0, 120)
  const records = query ? searchHerbalKnowledge(query, 12) : allHerbalKnowledgeEntries

  return {
    generatedAt: new Date().toISOString(),
    source: 'public-domain-herbal-index',
    sourcePolicy:
      'Herbal database sources must be public domain, out of copyright, open access, or permissively licensed. Modern copyrighted books are not used as source text.',
    total: records.length,
    sources: allHerbalSourceWorks,
    records,
  }
}
