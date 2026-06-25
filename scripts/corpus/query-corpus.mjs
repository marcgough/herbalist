import { createReadStream } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import readline from 'node:readline'
import { chunksDir, derivedDir, loadWorksRegistry, readCsvFile } from './lib.mjs'

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, ...rest] = argument.replace(/^--/, '').split('=')
    return [key, rest.join('=')]
  }),
)

const query = String(args.get('query') ?? '').trim()
const scope = String(args.get('scope') ?? 'works').trim().toLowerCase()
const limit = Math.max(1, Number(args.get('limit') ?? 10) || 10)
const collectionFilter = String(args.get('collection') ?? '').trim()
const topicFilter = String(args.get('topic') ?? '').trim().toLowerCase()
const workIdFilter = String(args.get('work-id') ?? '').trim()

if (!query) {
  throw new Error('Missing required --query argument.')
}

if (!['works', 'chunks', 'herbs', 'profiles', 'all'].includes(scope)) {
  throw new Error('Unsupported --scope value. Use works, chunks, herbs, profiles, or all.')
}

const queryLower = query.toLowerCase()
const queryTerms = queryLower.split(/\s+/).filter(Boolean)
const works = await loadWorksRegistry()
const worksById = new Map(works.map((work) => [work.work_id, work]))

const matchesFilters = (work) => {
  if (!work) {
    return false
  }

  if (collectionFilter && work.collection_id !== collectionFilter) {
    return false
  }

  if (workIdFilter && work.work_id !== workIdFilter) {
    return false
  }

  if (topicFilter) {
    const topics = String(work.topic_family ?? '').toLowerCase()
    if (!topics.includes(topicFilter)) {
      return false
    }
  }

  return true
}

const scoreText = (value) => {
  const haystack = String(value ?? '').toLowerCase()
  if (!haystack) {
    return 0
  }

  const matchedTerms = queryTerms.filter((term) => haystack.includes(term))
  if (matchedTerms.length === 0) {
    return 0
  }

  let score = matchedTerms.length * 4
  if (haystack.includes(queryLower)) {
    score += 20
  }
  if (matchedTerms.length === queryTerms.length) {
    score += 8
  }
  return score
}

const includesWholeQueryOrAllTerms = (value) => {
  const haystack = String(value ?? '').toLowerCase()
  if (!haystack) {
    return false
  }

  if (haystack.includes(queryLower)) {
    return true
  }

  return queryTerms.every((term) => haystack.includes(term))
}

const buildSnippet = (text) => {
  const normalized = String(text ?? '').replace(/\s+/g, ' ').trim()
  if (!normalized) {
    return ''
  }

  const index = normalized.toLowerCase().indexOf(queryLower)
  if (index === -1) {
    return normalized.slice(0, 240)
  }

  const start = Math.max(0, index - 120)
  const end = Math.min(normalized.length, index + query.length + 120)
  const prefix = start > 0 ? '...' : ''
  const suffix = end < normalized.length ? '...' : ''
  return `${prefix}${normalized.slice(start, end)}${suffix}`
}

const searchWorks = async () => {
  const results = works
    .filter(matchesFilters)
    .map((work) => {
      const searchableText = [work.title, work.creator, work.topic_family].join(' | ')
      if (!includesWholeQueryOrAllTerms(searchableText)) {
        return null
      }

      const titleScore = scoreText(work.title) * 5
      const topicScore = scoreText(work.topic_family) * 3
      const creatorScore = scoreText(work.creator)
      const statusBonus = work.ingest_status === 'chunked' ? 4 : 0
      const score = titleScore + topicScore + creatorScore + statusBonus

      return {
        score,
        work_id: work.work_id,
        title: work.title,
        creator: work.creator,
        publication_year: work.publication_year,
        collection_id: work.collection_id,
        rights_status: work.rights_status,
        topic_family: work.topic_family,
        ingest_status: work.ingest_status,
        source_url: work.source_url,
      }
    })
    .filter((result) => result && result.score > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))

  return {
    totalMatches: results.length,
    results: results.slice(0, limit),
  }
}

const searchHerbs = async () => {
  const herbCandidatesPath = resolve(derivedDir, 'evidence', 'herb-candidates.csv')
  const herbCandidates = await readCsvFile(herbCandidatesPath)
  const confidenceRank = { high: 3, medium: 2, low: 1 }

  const results = herbCandidates
    .map((candidate) => {
      const score = scoreText(
        [
          candidate.name,
          candidate.normalized_name,
          candidate.topic_families,
          candidate.collections,
          candidate.basis,
        ].join(' | '),
      )

      return {
        score,
        herb_id: candidate.herb_id,
        name: candidate.name,
        normalized_name: candidate.normalized_name,
        confidence: candidate.confidence,
        mention_count: Number(candidate.mention_count ?? 0),
        chunk_count: Number(candidate.chunk_count ?? 0),
        work_count: Number(candidate.work_count ?? 0),
        collections: candidate.collections,
        topic_families: candidate.topic_families,
        sample_work_ids: candidate.sample_work_ids,
      }
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => {
      const confidenceDelta = (confidenceRank[right.confidence] ?? 0) - (confidenceRank[left.confidence] ?? 0)
      if (confidenceDelta !== 0) {
        return confidenceDelta
      }
      return right.work_count - left.work_count || right.score - left.score
    })

  return {
    totalMatches: results.length,
    results: results.slice(0, limit),
  }
}

const searchProfiles = async () => {
  const profilesIndexPath = resolve(derivedDir, 'herb-profiles', 'index.csv')
  const profiles = await readCsvFile(profilesIndexPath)

  const results = profiles
    .map((profile) => {
      const searchableText = [
        profile.canonical_name,
        profile.canonical_key,
        profile.catalog_class,
        profile.catalog_reason,
        profile.collections,
        profile.topic_families,
        profile.variants,
        profile.top_plant_parts,
        profile.top_preparations,
        profile.top_conditions,
        profile.top_cautions,
      ].join(' | ')

      const score = scoreText(searchableText)
      if (score === 0) {
        return null
      }

      return {
        score,
        profile_id: profile.profile_id,
        canonical_name: profile.canonical_name,
        canonical_key: profile.canonical_key,
        catalog_class: profile.catalog_class,
        total_chunks: Number(profile.total_chunks ?? 0),
        total_works: Number(profile.total_works ?? 0),
        collections: profile.collections,
        topic_families: profile.topic_families,
        top_preparations: profile.top_preparations,
        top_conditions: profile.top_conditions,
        top_cautions: profile.top_cautions,
      }
    })
    .filter(Boolean)
    .sort((left, right) => right.total_chunks - left.total_chunks || right.score - left.score || left.canonical_name.localeCompare(right.canonical_name))

  return {
    totalMatches: results.length,
    results: results.slice(0, limit),
  }
}

const searchChunks = async () => {
  const files = (await readdir(chunksDir)).filter((name) => name.endsWith('.jsonl')).sort()
  const matches = []

  for (const file of files) {
    const chunkPath = resolve(chunksDir, file)
    const lineReader = readline.createInterface({
      input: createReadStream(chunkPath, 'utf8'),
      crlfDelay: Infinity,
    })

    for await (const line of lineReader) {
      if (!line.trim()) {
        continue
      }

      let chunk
      try {
        chunk = JSON.parse(line)
      } catch {
        continue
      }

      const work = worksById.get(chunk.work_id)
      if (!matchesFilters(work)) {
        continue
      }

      const score = scoreText([chunk.title, chunk.section_heading, chunk.text, chunk.topic_family].join(' | '))
      if (score === 0) {
        continue
      }

      matches.push({
        score,
        chunk_id: chunk.chunk_id,
        work_id: chunk.work_id,
        title: chunk.title,
        creator: chunk.creator,
        collection_id: work?.collection_id ?? '',
        topic_family: chunk.topic_family,
        section_heading: chunk.section_heading,
        paragraph_start: chunk.paragraph_start,
        source_url: chunk.source_url,
        snippet: buildSnippet(chunk.text),
      })
    }
  }

  matches.sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))

  return {
    totalMatches: matches.length,
    results: matches.slice(0, limit),
  }
}

const output = {
  query,
  scope,
  limit,
  filters: {
    collection: collectionFilter || null,
    topic: topicFilter || null,
    work_id: workIdFilter || null,
  },
}

if (scope === 'works' || scope === 'all') {
  output.works = await searchWorks()
}

if (scope === 'herbs' || scope === 'all') {
  output.herbs = await searchHerbs()
}

if (scope === 'profiles' || scope === 'all') {
  output.profiles = await searchProfiles()
}

if (scope === 'chunks' || scope === 'all') {
  output.chunks = await searchChunks()
}

console.log(JSON.stringify(output, null, 2))
