import { readLatestFeedRefreshRunFromD1, sourcePolicyText } from '../_lib/feed.js'

const json = (payload, status = 200) =>
  Response.json(payload, {
    status,
    headers: {
      'cache-control': 'no-store',
    },
  })

const readFeedRefresh = async (env) => {
  if (!env.HERBALISTI_DB) {
    return null
  }

  return readLatestFeedRefreshRunFromD1(env.HERBALISTI_DB)
}

export async function onRequestGet({ env = {} }) {
  const latestFeedRefresh = await readFeedRefresh(env)

  return json({
    name: 'Herbalisti operational health',
    status: 'ok',
    generatedAt: new Date().toISOString(),
    domain: 'herbalisti.com',
    surfaces: {
      homepage: true,
      booksApi: true,
      herbalKnowledgeApi: true,
      herbalChatApi: true,
      citationNotesApi: true,
      remediesApi: true,
      graphApi: true,
      searchApi: true,
      searchDiscovery: true,
      newsApi: true,
      signalsRssApi: true,
      signalIntelligenceApi: true,
      sourcesApi: true,
      sourceHealthApi: true,
      feedStatusApi: true,
      dataExports: true,
      discoveryMetadata: true,
      apiCatalog: true,
      governancePolicy: true,
      mediaManifest: true,
    },
    bindings: {
      d1: Boolean(env.HERBALISTI_DB),
      r2Media: Boolean(env.HERBALISTI_MEDIA),
    },
    protectedFeatures: {
      seedanceMediaJobs: env.KIE_API_KEY && env.MEDIA_ADMIN_TOKEN ? 'configured' : 'disabled',
      serverSideOpenAiImages: env.OPENAI_API_KEY ? 'configured' : 'not_required',
      serverSideOpenAiHerbalChat: env.OPENAI_API_KEY ? 'configured' : 'fallback_only',
    },
    feed: {
      sourcePolicy: sourcePolicyText,
      latestRefresh: latestFeedRefresh,
    },
    launchBoundary: {
      medicalAdvice: 'disabled',
      publicAccounts: 'disabled',
      sourceMode: 'allowlist_first',
    },
  })
}
