import { closeCorpusMemoryDatabase, openCorpusMemoryDatabase, searchDocuments } from './lib.mjs'

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, ...rest] = argument.replace(/^--/, '').split('=')
    return [key, rest.join('=')]
  }),
)

const query = String(args.get('query') ?? args.get('q') ?? '').trim()
const kind = String(args.get('kind') ?? '').trim()
const limit = args.get('limit')

if (!query) {
  throw new Error('Missing required --query argument.')
}

const { db } = await openCorpusMemoryDatabase()

try {
  console.log(JSON.stringify(searchDocuments(db, { query, kind, limit }), null, 2))
} finally {
  closeCorpusMemoryDatabase(db)
}
