import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const pagesConfigPath = 'wrangler.toml'
const newsConfigPath = 'wrangler.news.toml'

const parseArgs = (argv) => {
  const options = {
    apply: false,
    d1DatabaseId: process.env.HERBALISTI_D1_DATABASE_ID ?? '',
    r2BucketName: process.env.HERBALISTI_R2_BUCKET ?? '',
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--apply') {
      options.apply = true
    } else if (arg === '--d1') {
      options.d1DatabaseId = argv[index + 1] ?? ''
      index += 1
    } else if (arg.startsWith('--d1=')) {
      options.d1DatabaseId = arg.slice('--d1='.length)
    } else if (arg === '--r2') {
      options.r2BucketName = argv[index + 1] ?? ''
      index += 1
    } else if (arg.startsWith('--r2=')) {
      options.r2BucketName = arg.slice('--r2='.length)
    } else if (arg === '--no-r2') {
      options.r2BucketName = ''
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return options
}

const assertValidD1DatabaseId = (value) => {
  const id = String(value ?? '').trim()

  if (!id || id.includes('<') || /replace-after|todo/i.test(id) || /\s/.test(id)) {
    throw new Error('Provide a real Cloudflare D1 database ID with --d1 or HERBALISTI_D1_DATABASE_ID')
  }

  if (!/^[a-z0-9-]{12,}$/i.test(id)) {
    throw new Error('Cloudflare D1 database ID format looks invalid')
  }

  return id
}

const assertValidR2BucketName = (value) => {
  const bucket = String(value ?? '').trim()

  if (!bucket) {
    return ''
  }

  if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/i.test(bucket)) {
    throw new Error('R2 bucket name should be a DNS-style bucket name')
  }

  return bucket
}

const d1Block = (databaseId) => `[[d1_databases]]
binding = "HERBALISTI_DB"
database_name = "herbalisti"
database_id = "${databaseId}"
`

const r2Block = (bucketName) => `[[r2_buckets]]
binding = "HERBALISTI_MEDIA"
bucket_name = "${bucketName}"
`

const stripTemplateTail = (text) =>
  text
    .replace(/\n# Add these bindings after the Cloudflare resources exist:[\s\S]*$/m, '\n')
    .replace(/\n# Uncomment after creating the D1 database:[\s\S]*$/m, '\n')

const stripActiveBindingBlocks = (text) =>
  text
    .replace(/(^|\n)\[\[d1_databases\]\][\s\S]*?(?=\n\[[^\n]*\]|$)/g, '\n')
    .replace(/(^|\n)\[\[r2_buckets\]\][\s\S]*?(?=\n\[[^\n]*\]|$)/g, '\n')

const normalizeTrailingNewline = (text) => `${text.trimEnd()}\n`

export const buildConfiguredWranglerFiles = ({ pagesToml, newsToml, d1DatabaseId, r2BucketName = '' }) => {
  const databaseId = assertValidD1DatabaseId(d1DatabaseId)
  const bucketName = assertValidR2BucketName(r2BucketName)

  const pagesBase = normalizeTrailingNewline(stripActiveBindingBlocks(stripTemplateTail(pagesToml)))
  const newsBase = normalizeTrailingNewline(stripActiveBindingBlocks(stripTemplateTail(newsToml)))

  return {
    [pagesConfigPath]: `${pagesBase}\n${d1Block(databaseId)}${bucketName ? `\n${r2Block(bucketName)}` : ''}`,
    [newsConfigPath]: `${newsBase}\n${d1Block(databaseId)}`,
  }
}

const redactDatabaseId = (value) => `${value.slice(0, 6)}...${value.slice(-4)}`

const main = () => {
  const options = parseArgs(process.argv.slice(2))
  const pagesToml = readFileSync(resolve(root, pagesConfigPath), 'utf8')
  const newsToml = readFileSync(resolve(root, newsConfigPath), 'utf8')
  const configured = buildConfiguredWranglerFiles({
    pagesToml,
    newsToml,
    d1DatabaseId: options.d1DatabaseId,
    r2BucketName: options.r2BucketName,
  })
  const databaseId = assertValidD1DatabaseId(options.d1DatabaseId)
  const bucketName = assertValidR2BucketName(options.r2BucketName)
  const changedFiles = Object.entries(configured)
    .filter(([file, contents]) => contents !== (file === pagesConfigPath ? pagesToml : newsToml))
    .map(([file]) => file)

  if (options.apply) {
    for (const [file, contents] of Object.entries(configured)) {
      writeFileSync(resolve(root, file), contents)
    }
  }

  console.log(
    JSON.stringify(
      {
        status: options.apply ? 'applied' : 'dry-run',
        safeToRun: options.apply
          ? 'Local Wrangler config files were updated. No Cloudflare API call, deployment, upload, or paid generation was attempted.'
          : 'Dry run only. No files were written, and no Cloudflare API call, deployment, upload, or paid generation was attempted.',
        d1DatabaseId: redactDatabaseId(databaseId),
        r2BucketName: bucketName || null,
        changedFiles,
        nextActions: options.apply
          ? [
              'Run npm run verify:launch -- --soft.',
              'Apply D1 migrations remotely with npx wrangler d1 migrations apply herbalisti --remote.',
              'Set Cloudflare secrets.',
              'Run npm run verify:release before deployment.',
            ]
          : [
              'Review the dry-run output.',
              'Run the same command with --apply to update wrangler.toml and wrangler.news.toml locally.',
            ],
      },
      null,
      2,
    ),
  )
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
