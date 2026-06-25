import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildConfiguredWranglerFiles } from './configure-cloudflare-bindings.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const pagesConfigPath = 'wrangler.toml'
const newsConfigPath = 'wrangler.news.toml'
const fakeD1DatabaseId = '12345678-1234-1234-1234-123456789abc'
const fakeR2BucketName = 'herbalisti-media'

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const fingerprint = (value) => createHash('sha256').update(value).digest('hex')

const assertHasActiveD1 = (label, toml) => {
  assert.match(toml, /^\s*\[\[d1_databases\]\]/m, `${label} should include an active D1 block`)
  assert.match(toml, /^\s*binding\s*=\s*"HERBALISTI_DB"\s*$/m, `${label} should bind HERBALISTI_DB`)
  assert.match(toml, /^\s*database_name\s*=\s*"herbalisti"\s*$/m, `${label} should target herbalisti`)
  assert.match(
    toml,
    new RegExp(`^\\s*database_id\\s*=\\s*"${fakeD1DatabaseId}"\\s*$`, 'm'),
    `${label} should contain the provided database ID`,
  )
}

const pagesTomlBefore = read(pagesConfigPath)
const newsTomlBefore = read(newsConfigPath)
const beforeHashes = {
  [pagesConfigPath]: fingerprint(pagesTomlBefore),
  [newsConfigPath]: fingerprint(newsTomlBefore),
}

const configured = buildConfiguredWranglerFiles({
  pagesToml: pagesTomlBefore,
  newsToml: newsTomlBefore,
  d1DatabaseId: fakeD1DatabaseId,
  r2BucketName: fakeR2BucketName,
})

assertHasActiveD1(pagesConfigPath, configured[pagesConfigPath])
assertHasActiveD1(newsConfigPath, configured[newsConfigPath])
assert.equal(
  configured[pagesConfigPath].match(/^\s*database_id\s*=\s*"([^"]+)"\s*$/m)?.[1],
  configured[newsConfigPath].match(/^\s*database_id\s*=\s*"([^"]+)"\s*$/m)?.[1],
  'Pages and News Worker should receive the same D1 database ID',
)
assert.match(configured[pagesConfigPath], /^\s*\[\[r2_buckets\]\]/m, 'Pages config should include R2 media block')
assert.match(configured[pagesConfigPath], /^\s*binding\s*=\s*"HERBALISTI_MEDIA"\s*$/m, 'Pages config should bind R2')
assert.match(
  configured[pagesConfigPath],
  /^\s*bucket_name\s*=\s*"herbalisti-media"\s*$/m,
  'Pages config should target herbalisti-media',
)
assert.doesNotMatch(configured[newsConfigPath], /^\s*\[\[r2_buckets\]\]/m, 'News Worker should not receive R2 binding')
assert.doesNotMatch(configured[pagesConfigPath], /replace-after|<replace/i, 'Pages config should not keep placeholder IDs')
assert.doesNotMatch(configured[newsConfigPath], /replace-after|<replace/i, 'News config should not keep placeholder IDs')

const afterHashes = {
  [pagesConfigPath]: fingerprint(read(pagesConfigPath)),
  [newsConfigPath]: fingerprint(read(newsConfigPath)),
}

assert.deepEqual(afterHashes, beforeHashes, 'Verification should not write Wrangler config files')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      safeToRun: 'Dry-run verification only. No files were written, and no Cloudflare API call, deployment, upload, or paid generation was attempted.',
      checked: {
        pagesD1Binding: true,
        sharedD1DatabaseId: true,
        pagesR2Binding: true,
        newsWorkerD1Binding: true,
        noFileWrites: true,
      },
    },
    null,
    2,
  ),
)
