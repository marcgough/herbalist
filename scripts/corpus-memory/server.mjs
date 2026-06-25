import { createCorpusMemoryHttpServer } from './lib.mjs'

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, rawValue = 'true'] = argument.replace(/^--/, '').split('=')
    return [key, rawValue]
  }),
)

const host = args.get('host')
const port = args.get('port')
const storeDir = args.get('store-dir')

const { server, config } = await createCorpusMemoryHttpServer({
  host,
  port,
  storeDir,
})

await new Promise((resolvePromise) => {
  server.listen(config.port, config.host, resolvePromise)
})

console.log(
  JSON.stringify(
    {
      ok: true,
      service: config.name,
      baseUrl: `http://${config.host}:${config.port}`,
      databasePath: config.databasePath,
    },
    null,
    2,
  ),
)
