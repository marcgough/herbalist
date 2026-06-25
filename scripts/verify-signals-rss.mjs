import { readFileSync } from 'node:fs'
import { XMLParser } from 'fast-xml-parser'

import {
  escapeXml,
  signalsRssContentType,
  signalsRssUrl,
  signalsRssXmlFromItems,
} from '../functions/_lib/signals-rss.js'

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  trimValues: true,
})

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const cssSource = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')

const items = [
  {
    id: 'verify-crispr-sovereignty',
    title: 'CRISPR & peptide signal for self-sovereign health',
    sourceName: 'Crossref',
    sourceType: 'public-research-index',
    url: 'https://doi.org/10.1000/herbalisti?source=verify&topic=crispr',
    publishedAt: '2026-06-16T00:00:00.000Z',
    summary: 'Public metadata with XML-sensitive characters: <frontier> & "health".',
    topics: ['CRISPR', 'Peptides', 'Self-sovereign wellbeing'],
  },
  {
    id: 'verify-longevity-service',
    title: 'Longevity as a service metadata brief',
    sourceName: 'Lifespan.io',
    sourceType: 'independent-longevity',
    url: 'https://www.lifespan.io/news/example-longevity-service/',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary: 'Independent longevity coverage from an allowlisted source.',
    topics: ['Longevity', 'Health as a service'],
  },
  {
    id: 'verify-blocked-source',
    title: 'Peptide metadata from blocked source',
    sourceName: 'Pfizer example source',
    sourceType: 'blocked-source',
    url: 'https://example.com/blocked',
    publishedAt: '2026-06-14T00:00:00.000Z',
    summary: 'This should never enter the public RSS output.',
    topics: ['Peptides'],
  },
]

const xml = signalsRssXmlFromItems(items, {
  generatedAt: '2026-06-16T01:00:00.000Z',
  filters: {
    topic: 'CRISPR',
    source: 'Crossref',
    query: 'sovereign',
  },
  source: 'verify-fixture',
})
const parsed = parser.parse(xml)
const channel = parsed?.rss?.channel
const channelItems = Array.isArray(channel?.item) ? channel.item : [channel?.item].filter(Boolean)

assert(signalsRssContentType === 'application/rss+xml; charset=utf-8', 'RSS content type is incorrect')
assert(signalsRssUrl === 'https://herbalisti.com/api/signals.xml', 'RSS canonical URL is incorrect')
assert(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'RSS XML declaration is missing')
assert(xml.includes('<rss version="2.0"'), 'RSS root element is missing')
assert(xml.includes(`href="${signalsRssUrl}"`), 'RSS atom self link is missing')
assert(channel?.title === 'Herbalisti Signals', 'RSS channel title is incorrect')
assert(channel?.link === 'https://herbalisti.com/signals', 'RSS channel link should point to the Signals page')
assert(channel?.description?.includes('Herbalisti allowlist'), 'RSS channel description should include source policy')
assert(channel?.description?.includes('not medical advice'), 'RSS channel description should preserve medical boundary')
assert(channel?.description?.includes('Filtered by topic: CRISPR'), 'RSS channel should describe active filters')
assert(channelItems.length === 2, `Expected blocked source to be filtered out, got ${channelItems.length} RSS items`)
assert(
  channelItems.some((item) => item.category?.includes?.('Crossref') || item.category === 'Crossref'),
  'RSS items should include source categories',
)
assert(xml.includes('CRISPR &amp; peptide signal'), 'RSS titles should be XML escaped')
assert(xml.includes('https://doi.org/10.1000/herbalisti?source=verify&amp;topic=crispr'), 'RSS URLs should be XML escaped')
assert(xml.includes('&lt;frontier&gt; &amp; &quot;health&quot;'), 'RSS descriptions should be XML escaped')
assert(!/pfizer|moderna|novartis|roche|merck|gsk|astrazeneca|sanofi|bayer/i.test(xml), 'RSS XML should not include blocked source text')
assert(escapeXml(`Health & "agency"`) === 'Health &amp; &quot;agency&quot;', 'escapeXml should escape core XML entities')
assert(appSource.includes('signalsRssHref'), 'Signals UI should build a filter-aware RSS href')
assert(appSource.includes('Signals RSS'), 'Signals UI should expose a visible RSS subscription link')
assert(appSource.includes('/api/signals.xml'), 'Signals UI should link to the public RSS endpoint')
assert(cssSource.includes('.rss-action'), 'Signals RSS subscription link should have dedicated styling')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      contentType: signalsRssContentType,
      feedUrl: signalsRssUrl,
      itemCount: channelItems.length,
      sourcePolicy: channel.description.includes('Herbalisti allowlist'),
      medicalBoundary: channel.description.includes('not medical advice'),
      blockedSourceFiltered: true,
      visibleSubscriptionLink: true,
      safeToRun: 'This verifier uses deterministic local fixtures only. It does not fetch live sources or call paid APIs.',
    },
    null,
    2,
  ),
)
