import { closeCorpusMemoryDatabase, getCorpusMemoryStats, openCorpusMemoryDatabase } from './lib.mjs'

const { db, config } = await openCorpusMemoryDatabase()

try {
  console.log(JSON.stringify(await getCorpusMemoryStats(db, config), null, 2))
} finally {
  closeCorpusMemoryDatabase(db)
}
