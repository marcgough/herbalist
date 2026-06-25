const normalizeWhitespace = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const readProcessEnv = (name) => {
  if (typeof process === 'undefined' || !process?.env) {
    return ''
  }

  return String(process.env[name] ?? '')
}

const readEnvValue = (env = {}, name) => normalizeWhitespace(env[name] ?? readProcessEnv(name) ?? '')

const defaultModel = 'gpt-5.4-mini'

export const hasOpenAiHerbalChatConfig = (env = {}) => Boolean(readEnvValue(env, 'OPENAI_API_KEY'))

export const resolveOpenAiHerbalChatModel = (env = {}) => readEnvValue(env, 'OPENAI_HERBAL_CHAT_MODEL') || defaultModel

const buildArchiveContext = (payload) => ({
  query: payload.query,
  policy: payload.policy,
  matches: (payload.matches ?? []).slice(0, 3).map((match) => ({
    name: match.name,
    botanicalName: match.botanicalName,
    commonNames: (match.commonNames ?? []).slice(0, 8),
    plantParts: (match.plantParts ?? []).slice(0, 8),
    categories: (match.categories ?? []).slice(0, 8),
    mayHelpWith: (match.mayHelpWith ?? []).slice(0, 8),
    preparations: (match.preparations ?? []).slice(0, 8),
    considerations: (match.considerations ?? []).slice(0, 8),
    sourceNote: match.sourceNote ?? '',
  })),
  citations: (payload.citations ?? []).slice(0, 6).map((citation) => ({
    title: citation.title,
    author: citation.author,
    licenseLabel: citation.licenseLabel,
    sourceUrl: citation.sourceUrl,
  })),
})

const extractOutputText = (responsePayload) => {
  const direct = normalizeWhitespace(responsePayload?.output_text ?? '')
  if (direct) {
    return direct
  }

  const fragments = []
  for (const item of responsePayload?.output ?? []) {
    for (const contentItem of item?.content ?? []) {
      const text = normalizeWhitespace(contentItem?.text ?? '')
      if (text) {
        fragments.push(text)
      }
    }
  }

  return normalizeWhitespace(fragments.join(' '))
}

export const maybeBuildOpenAiHerbalChatResponse = async (env = {}, retrievalPayload) => {
  const apiKey = readEnvValue(env, 'OPENAI_API_KEY')
  if (!apiKey) {
    return null
  }

  const payload = retrievalPayload ?? null
  const query = normalizeWhitespace(payload?.query ?? '')
  if (!payload || !query || !Array.isArray(payload.matches) || payload.matches.length === 0) {
    return null
  }

  const model = resolveOpenAiHerbalChatModel(env)
  const archiveContext = buildArchiveContext(payload)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        reasoning: {
          effort: 'low',
        },
        instructions:
          'You are Herbalisti, a calm archive guide for public-domain and permissively usable historical herbal sources. Use only the supplied archive context. Do not invent facts, dosages, diagnoses, or treatment claims. Write in two short paragraphs or fewer. Explain what the archive suggests, mention cautions if present, and end in an educational-not-medical-advice frame.',
        input: `User query: ${query}\n\nArchive context:\n${JSON.stringify(archiveContext, null, 2)}`,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      return null
    }

    const responsePayload = await response.json()
    const answer = extractOutputText(responsePayload)
    if (!answer) {
      return null
    }

    return {
      ...payload,
      generatedAt: new Date().toISOString(),
      model,
      answer,
      answerMode: 'hosted-synthesis',
    }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}
