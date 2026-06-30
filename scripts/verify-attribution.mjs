import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const exists = (path) => statSync(resolve(root, path)).isFile()

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const packagePath = (name) => resolve(root, 'node_modules', ...name.split('/'), 'package.json')
const packageMetadata = (name) => JSON.parse(readFileSync(packagePath(name), 'utf8'))

const pngDimensions = (path) => {
  const buffer = readFileSync(resolve(root, path))
  const signature = buffer.subarray(0, 8).toString('hex')
  assert(signature === '89504e470d0a1a0a', `${path} is not a PNG file`)
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

const packageJson = JSON.parse(read('package.json'))
const attribution = read('docs/attribution.md')
const mediaProvenance = JSON.parse(read('public/data/media-provenance.json'))
const app = read('src/App.tsx')
const index = read('index.html')
const manifest = read('public/manifest.webmanifest')
const mediaManifest = JSON.parse(read('public/data/media-manifest.json'))

for (const file of [
  'docs/attribution.md',
  'public/data/media-provenance.json',
  'public/data/media-manifest.json',
  'public/assets/herbalisti-hero.png',
  'public/assets/herbalisti-home-background.png',
  'public/assets/herbalisti-research.png',
  'public/assets/herbalisti-logo.svg',
  'public/assets/herbalisti-mark.svg',
  'public/favicon.svg',
]) {
  assert(exists(file), `Missing attribution/provenance file: ${file}`)
}

assert(mediaProvenance.name === 'Herbalisti media provenance', 'Media provenance name is incorrect')
assert(mediaProvenance.policy?.stockMedia === 'none', 'Media provenance should reject stock media')
assert(mediaProvenance.policy?.externalHotlinks === 'none', 'Media provenance should reject external hotlinks')
assert(Array.isArray(mediaProvenance.assets), 'Media provenance should list assets')
assert(mediaManifest.name === 'Herbalisti motion media manifest', 'Motion media manifest name is incorrect')
assert(mediaManifest.policy?.stockMedia === 'none', 'Motion media manifest should reject stock media')
assert(mediaManifest.policy?.externalHotlinks === 'none', 'Motion media manifest should reject external hotlinks')
assert(mediaManifest.video?.hero && mediaManifest.video?.research, 'Motion media manifest should define hero and research slots')

const provenancePaths = new Set(mediaProvenance.assets.map((asset) => asset.path))
for (const assetPath of [
  '/assets/herbalisti-hero.png',
  '/assets/herbalisti-home-background.png',
  '/assets/herbalisti-research.png',
  '/assets/herbalisti-logo.svg',
  '/assets/herbalisti-mark.svg',
]) {
  assert(provenancePaths.has(assetPath), `Missing media provenance for ${assetPath}`)
}

for (const asset of mediaProvenance.assets) {
  assert(asset.role, `${asset.path} is missing a role`)
  assert(asset.provider, `${asset.path} is missing a provider`)
  assert(asset.generationWorkflow, `${asset.path} is missing generation workflow`)
  assert(asset.usageRightsNote, `${asset.path} is missing usage rights note`)
  assert(asset.reviewStatus === 'approved_for_local_launch_candidate', `${asset.path} is not approved for local launch candidate use`)
}

const openAiAssets = mediaProvenance.assets.filter((asset) => asset.provider === 'OpenAI image generation')
assert(openAiAssets.length >= 2, 'Expected at least two OpenAI image generation launch assets')
assert(
  openAiAssets.every((asset) => asset.generationWorkflow.includes('Image Gen 2')),
  'OpenAI launch assets should record the requested Image Gen 2 workflow',
)

assert(app.includes('/assets/herbalisti-hero.png'), 'Hero image is not used by the app')
assert(app.includes('/assets/herbalisti-research.png'), 'Research image is not used by the app')
assert(app.includes('/assets/herbalisti-logo.svg'), 'Logo asset is not used by the app')
assert(app.includes('/data/media-manifest.json'), 'Motion media manifest is not used by the app')
assert(app.includes('ambient-video'), 'App should render the ambient video component when enabled')
assert(manifest.includes('/assets/herbalisti-mark.svg'), 'Manifest should reference the Herbalisti mark')
assert(index.includes('https://herbalisti.com/assets/herbalisti-hero.png'), 'Social metadata should reference the hero image')

const videoSlots = Object.entries(mediaManifest.video)
for (const [name, slot] of videoSlots) {
  assert(slot.src?.startsWith('/assets/'), `${name} video slot should use a local asset path`)
  assert(slot.poster?.startsWith('/assets/'), `${name} video slot should use a local poster path`)
  assert(slot.type === 'video/mp4', `${name} video slot should be MP4 for broad browser support`)
  assert(slot.provider === 'Kie.ai Seedance 2.0', `${name} video slot should document Seedance as provider`)
  assert(provenancePaths.has(slot.poster), `${name} video poster should have media provenance`)
  assert(exists(`public${slot.poster}`), `${name} video poster file is missing`)
  assert(
    !slot.enabled || slot.reviewStatus === 'approved_for_local_launch_candidate',
    `${name} video slot is enabled without launch-candidate approval`,
  )
  assert(!slot.enabled || exists(`public${slot.src}`), `${name} video slot is enabled but the local asset is missing`)
}

const hero = pngDimensions('public/assets/herbalisti-hero.png')
const research = pngDimensions('public/assets/herbalisti-research.png')
assert(hero.width >= 1200 && hero.height >= 800, 'Hero image is too small for launch use')
assert(research.width >= 1200 && research.height >= 800, 'Research image is too small for launch use')

const directSpecs = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
}
const allowedLicenses = new Set(['MIT', 'ISC', 'Apache-2.0', 'MIT OR Apache-2.0'])
const dependencyReport = []

for (const [name, spec] of Object.entries(directSpecs)) {
  const metadata = packageMetadata(name)
  const license = Array.isArray(metadata.license) ? metadata.license.join(', ') : metadata.license
  assert(allowedLicenses.has(license), `${name} has unreviewed license: ${license}`)
  assert(attribution.includes(`\`${name}\``), `Attribution note is missing ${name}`)
  assert(attribution.includes(`\`${spec}\``), `Attribution note is missing ${name} package spec ${spec}`)
  assert(attribution.includes(license), `Attribution note is missing ${name} license ${license}`)
  dependencyReport.push({
    name,
    spec,
    installedVersion: metadata.version,
    license,
  })
}

assert(attribution.includes('/data/media-provenance.json'), 'Attribution note should link public media provenance')
assert(attribution.includes('No stock-photo dependencies'), 'Attribution note should state stock-photo boundary')
assert(attribution.includes('Future generated media requires human review'), 'Attribution note should state human review for future media')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      media: {
        provenance: 'public/data/media-provenance.json',
        manifest: 'public/data/media-manifest.json',
        assets: mediaProvenance.assets.length,
        openAiAssets: openAiAssets.length,
        videoSlots: videoSlots.length,
        enabledVideoSlots: videoSlots.filter(([, slot]) => slot.enabled).length,
        hero,
        research,
      },
      licenses: {
        checkedDirectPackages: dependencyReport.length,
        allowedLicenses: Array.from(allowedLicenses),
        packages: dependencyReport,
      },
    },
    null,
    2,
  ),
)
