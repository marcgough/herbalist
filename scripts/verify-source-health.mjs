import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  feedSourceDescriptors,
  fetchHerbalistiNews,
  getSourceHealthPayload,
} from '../functions/_lib/feed.js'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path) => readFileSync(resolve(root, path), 'utf8')
const exists = (path) => existsSync(resolve(root, path))

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const jsonResponse = (payload) =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })

const textResponse = (payload) =>
  new Response(payload, {
    status: 200,
    headers: { 'content-type': 'application/xml' },
  })

const fixtureFetch = async (input) => {
  const url = new URL(String(input))

  if (url.hostname === 'eutils.ncbi.nlm.nih.gov' && url.pathname.endsWith('/esearch.fcgi')) {
    return jsonResponse({ esearchresult: { idlist: ['401001'] } })
  }

  if (url.hostname === 'eutils.ncbi.nlm.nih.gov' && url.pathname.endsWith('/esummary.fcgi')) {
    return jsonResponse({
      result: {
        '401001': {
          uid: '401001',
          title: 'Longevity and healthspan signals in epigenetic aging research',
          fulljournalname: 'Independent Biomedical Research Index',
          sortpubdate: '2026/06/14',
        },
      },
    })
  }

  if (url.hostname === 'export.arxiv.org') {
    return textResponse(`<?xml version="1.0" encoding="UTF-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <id>https://arxiv.org/abs/2606.00001</id>
          <title>CRISPR gene editing and gene therapy methods for resilient cellular repair</title>
          <published>2026-06-13T00:00:00Z</published>
        </entry>
      </feed>`)
  }

  if (url.hostname === 'api.biorxiv.org') {
    return jsonResponse({
      collection: [
        {
          doi: '10.1101/2026.06.12.000001',
          version: '1',
          title: 'Peptide signaling and longevity pathways in tissue maintenance',
          abstract: 'A preprint on peptides, longevity, and healthspan biology.',
          category: 'Cell Biology',
          date: '2026-06-12',
        },
      ],
    })
  }

  if (url.hostname === 'api.crossref.org') {
    return jsonResponse({
      message: {
        items: [
          {
            DOI: '10.5555/herbalisti-source-health',
            title: ['Personalized health as a service for longevity and peptide research'],
            'container-title': ['Open Metadata Journal'],
            type: 'journal-article',
            URL: 'https://doi.org/10.5555/herbalisti-source-health',
            published: { 'date-parts': [[2026, 6, 11]] },
            abstract:
              '<jats:p>Public Crossref metadata about health as a service, longevity, and peptide discovery.</jats:p>',
          },
        ],
      },
    })
  }

  if (url.hostname === 'www.lifespan.io') {
    return textResponse(`<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <item>
            <title>Longevity research expands self-sovereign wellbeing tools</title>
            <link>https://www.lifespan.io/news/source-health-longevity/</link>
            <pubDate>Thu, 11 Jun 2026 00:00:00 GMT</pubDate>
            <description>Independent longevity coverage for health as a service, healthspan, and self-sovereign wellbeing.</description>
          </item>
        </channel>
      </rss>`)
  }

  if (url.hostname === 'www.fightaging.org') {
    return textResponse(`<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <item>
            <title>DNA modification and epigenetic repair in rejuvenation research</title>
            <link>https://www.fightaging.org/archives/2026/06/source-health-dna/</link>
            <pubDate>Wed, 10 Jun 2026 00:00:00 GMT</pubDate>
            <description>Independent commentary on DNA modification, methylation, and aging repair.</description>
          </item>
        </channel>
      </rss>`)
  }

  throw new Error(`Unexpected fixture fetch URL: ${url.href}`)
}

const feed = await fetchHerbalistiNews({ fetchImpl: fixtureFetch, limit: 24 })
assert(Array.isArray(feed.sourceHealth), 'Feed should expose sourceHealth records')
assert(feed.sourceHealth.length === feedSourceDescriptors.length, 'Every source descriptor should have a health record')
assert(feed.sourceHealth.every((source) => source.isAllowlisted), 'Source health should only include allowlisted sources')
assert(feed.sourceHealth.every((source) => !source.isBigPharmaRelated), 'Source health must not include Big Pharma sources')
assert(feed.sourceHealth.every((source) => source.status === 'ok'), 'Fixture source health should be ok for every source')
assert(feed.sourceHealth.every((source) => source.usableItemCount >= 1), 'Every fixture source should produce usable items')
assert(feed.warnings.length === 0, 'Fixture source health should not emit warnings')
assert(
  feed.sourceHealth.some((source) => source.id === 'pubmed') &&
    feed.sourceHealth.some((source) => source.id === 'fightaging'),
  'Source health should cover public research and independent longevity sources',
)

let arxivFetches = 0
let crossrefFetches = 0
const transientFetch = async (input, init) => {
  const url = new URL(String(input))

  if (url.hostname === 'export.arxiv.org') {
    arxivFetches += 1
    if (arxivFetches === 1) {
      throw new Error('transient arXiv socket hang up')
    }
  }

  if (url.hostname === 'api.crossref.org') {
    crossrefFetches += 1
    if (crossrefFetches === 1) {
      return new Response('temporarily unavailable', {
        status: 503,
        statusText: 'Service Unavailable',
      })
    }
  }

  return fixtureFetch(input, init)
}

const recoveredFeed = await fetchHerbalistiNews({ fetchImpl: transientFetch, limit: 24 })
assert(arxivFetches === 2, 'arXiv source fetch should retry once after a transient request failure')
assert(crossrefFetches === 2, 'Crossref source fetch should retry once after a retryable HTTP status')
assert(recoveredFeed.warnings.length === 0, 'Recovered transient source failures should not emit feed warnings')
assert(
  recoveredFeed.sourceHealth.find((source) => source.id === 'arxiv')?.status === 'ok',
  'Recovered arXiv source should report healthy status',
)
assert(
  recoveredFeed.sourceHealth.find((source) => source.id === 'crossref')?.status === 'ok',
  'Recovered Crossref source should report healthy status',
)

const sourceHealthPayload = await getSourceHealthPayload({ fetchImpl: fixtureFetch })
assert(sourceHealthPayload.total === feedSourceDescriptors.length, 'Source health API payload should report all sources')
assert(sourceHealthPayload.healthyCount === feedSourceDescriptors.length, 'Source health payload should report healthy sources')
assert(sourceHealthPayload.emptyCount === 0, 'Source health payload should report zero fixture empty sources')
assert(sourceHealthPayload.warningCount === 0, 'Source health payload should report zero fixture warnings')
assert(sourceHealthPayload.sourceHealthPolicy?.includes('allowlisted'), 'Source health payload should expose policy text')

assert(exists('functions/api/source-health.js'), 'Source health API endpoint is missing')
const healthApi = read('functions/api/health.js')
assert(healthApi.includes('sourceHealthApi: true'), 'Health API should expose sourceHealthApi surface')

const app = read('src/App.tsx')
assert(app.includes('/api/source-health'), 'Frontend should request the source health API')
assert(app.includes('source-health-strip'), 'Frontend should render the source health strip')

const packageJson = JSON.parse(read('package.json'))
assert(packageJson.scripts?.['verify:source-health'], 'package.json should expose verify:source-health')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      descriptors: feedSourceDescriptors.length,
      sourceHealthRecords: feed.sourceHealth.length,
      healthyCount: sourceHealthPayload.healthyCount,
      emptyCount: sourceHealthPayload.emptyCount,
      warningCount: sourceHealthPayload.warningCount,
      sources: feed.sourceHealth.map((source) => ({
        id: source.id,
        status: source.status,
        usableItemCount: source.usableItemCount,
      })),
    },
    null,
    2,
  ),
)
