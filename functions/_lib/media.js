const httpUrl = (value) => (typeof value === 'string' && /^https?:\/\//i.test(value) ? value : undefined)

const parseResultJson = (value) => {
  if (!value) {
    return undefined
  }

  if (typeof value === 'object') {
    return value
  }

  if (typeof value !== 'string') {
    return undefined
  }

  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

const firstUrlFromList = (value) => (Array.isArray(value) ? value.find((item) => httpUrl(item)) : undefined)

export const extractKieTaskId = (result) => {
  const data = result?.data ?? {}
  return data.taskId ?? data.task_id ?? result?.taskId ?? result?.task_id
}

export const extractKieResultUrl = (result) => {
  const data = result?.data ?? {}
  const directUrl =
    httpUrl(data.resultUrl) ??
    httpUrl(data.videoUrl) ??
    httpUrl(data.url) ??
    firstUrlFromList(data.resultUrls) ??
    firstUrlFromList(data.urls)

  if (directUrl) {
    return directUrl
  }

  const resultJson = parseResultJson(data.resultJson)
  return (
    httpUrl(resultJson?.resultUrl) ??
    httpUrl(resultJson?.videoUrl) ??
    httpUrl(resultJson?.url) ??
    firstUrlFromList(resultJson?.resultUrls) ??
    firstUrlFromList(resultJson?.result_urls) ??
    firstUrlFromList(resultJson?.urls)
  )
}

