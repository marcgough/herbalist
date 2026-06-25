import { fetchHerbalistiNews } from '../functions/_lib/feed.js'
import { writeStaticNewsRefresh } from './lib/static-news-refresh.mjs'

const feed = await fetchHerbalistiNews({ limit: 24 })
const result = await writeStaticNewsRefresh(feed)

for (const warning of result.statusPayload.latestRefresh.warnings) {
  console.warn(warning)
}

if (result.newsWritten) {
  console.log(`Wrote ${feed.items.length} feed items to public/data/news.json`)
} else {
  console.log(
    `Preserved existing public/data/news.json with ${result.statusPayload.publicSnapshot.itemCount} feed items`,
  )
}
console.log('Wrote refresh heartbeat to public/data/feed-status.json')
