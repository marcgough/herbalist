const encoder = new TextEncoder()

const digestSha256 = async (value) => {
  if (!globalThis.crypto?.subtle?.digest) {
    throw new Error('Web Crypto digest support is required for protected admin token checks.')
  }

  return new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', encoder.encode(value)))
}

const fixedLengthByteEqual = (left, right) => {
  let difference = left.length ^ right.length
  const length = Math.max(left.length, right.length)

  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0)
  }

  return difference === 0
}

export const extractBearerToken = (request) => {
  const authorization = request.headers.get('authorization')
  const match = authorization?.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || undefined
}

export const timingSafeTokenEqual = async (candidate, expected) => {
  if (typeof candidate !== 'string' || typeof expected !== 'string') {
    return false
  }

  const normalizedCandidate = candidate.trim()
  const normalizedExpected = expected.trim()

  if (!normalizedCandidate || !normalizedExpected) {
    return false
  }

  const [candidateDigest, expectedDigest] = await Promise.all([
    digestSha256(normalizedCandidate),
    digestSha256(normalizedExpected),
  ])

  if (typeof globalThis.crypto.subtle.timingSafeEqual === 'function') {
    return globalThis.crypto.subtle.timingSafeEqual(candidateDigest, expectedDigest)
  }

  return fixedLengthByteEqual(candidateDigest, expectedDigest)
}

export const authorizedByAdminToken = async (
  request,
  expectedToken,
  { headerName = 'x-herbalisti-admin-token' } = {},
) => {
  const candidates = [extractBearerToken(request), request.headers.get(headerName)]
  const results = await Promise.all(candidates.map((candidate) => timingSafeTokenEqual(candidate, expectedToken)))
  return results.some(Boolean)
}
