import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))

const failures = []

const assert = (condition, message) => {
  if (!condition) {
    failures.push(message)
  }
}

const packageJson = readJson('package.json')
const app = read('src/App.tsx')
const css = read('src/App.css')
const mediaManifestSource = read('src/data/mediaManifest.ts')
const publicManifest = readJson('public/data/media-manifest.json')

for (const token of [
  'function AmbientVideo',
  'mediaManifest.video.hero',
  'mediaManifest.video.research',
  'className="motion-grid"',
  'className="signal-lattice"',
  'className="signal-lattice image-band-lattice"',
  'className="scanline"',
  'className="image-band-copy"',
]) {
  assert(app.includes(token), `src/App.tsx is missing ${token}`)
}

for (const token of [
  '.ambient-video',
  '.motion-grid',
  '.signal-lattice',
  '.hero-section .signal-lattice',
  '.image-band-lattice',
  '.image-band-copy',
  '.scanline',
  '@keyframes floatImage',
  '@keyframes gridDrift',
  '@keyframes scanTravel',
  '@keyframes signalSweep',
  '@media (prefers-reduced-motion: reduce)',
]) {
  assert(css.includes(token), `src/App.css is missing ${token}`)
}

assert(
  css.includes('repeating-linear-gradient') && css.includes('mix-blend-mode: screen'),
  'procedural signal lattice should use layered data-line styling',
)
assert(css.includes('animation: signalSweep 26s'), 'signal lattice should use slow, subtle animation timing')
assert(css.includes('.ambient-video') && css.includes('display: none'), 'reduced-motion mode should hide ambient video')

assert(publicManifest.policy?.stockMedia === 'none', 'media manifest must keep stockMedia policy set to none')
assert(publicManifest.policy?.externalHotlinks === 'none', 'media manifest must keep externalHotlinks policy set to none')
assert(mediaManifestSource.includes("stockMedia: 'none'"), 'TypeScript manifest must keep stockMedia policy set to none')
assert(mediaManifestSource.includes("externalHotlinks: 'none'"), 'TypeScript manifest must keep externalHotlinks policy set to none')

const approvedVideoStatus = 'approved_for_local_launch_candidate'
const checkedSlots = Object.entries(publicManifest.video ?? {})

assert(checkedSlots.length === 2, 'media manifest should expose exactly the hero and research video slots')

for (const [slotName, slot] of checkedSlots) {
  assert(['hero', 'research'].includes(slotName), `unexpected motion-media slot ${slotName}`)
  assert(typeof slot.src === 'string' && slot.src.startsWith('/assets/'), `${slotName} video src must be a local asset path`)
  assert(
    typeof slot.poster === 'string' && slot.poster.startsWith('/assets/'),
    `${slotName} poster must be a local asset path`,
  )
  assert(slot.type === 'video/mp4', `${slotName} video type must be video/mp4`)
  assert(slot.provider === 'Kie.ai Seedance 2.0', `${slotName} provider must remain Kie.ai Seedance 2.0`)
  assert(!/^https?:\/\//i.test(slot.src), `${slotName} video src must not be a provider hotlink`)
  assert(!/^https?:\/\//i.test(slot.poster), `${slotName} poster must not be a provider hotlink`)

  if (slot.enabled) {
    assert(
      slot.reviewStatus === approvedVideoStatus,
      `${slotName} video cannot be enabled until reviewStatus is ${approvedVideoStatus}`,
    )
  }
}

for (const token of [
  "src: '/assets/herbalisti-hero-loop.mp4'",
  "poster: '/assets/herbalisti-hero.png'",
  "src: '/assets/herbalisti-research-loop.mp4'",
  "poster: '/assets/herbalisti-research.png'",
  "provider: 'Kie.ai Seedance 2.0'",
]) {
  assert(mediaManifestSource.includes(token), `src/data/mediaManifest.ts is missing ${token}`)
}

assert(
  Boolean(packageJson.scripts?.['verify:motion-system']),
  'package.json must expose npm run verify:motion-system',
)

if (failures.length > 0) {
  console.error(
    JSON.stringify(
      {
        status: 'fail',
        failures,
      },
      null,
      2,
    ),
  )
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      status: 'pass',
      motionLayers: ['floatImage', 'motion-grid', 'signal-lattice', 'scanline'],
      videoSlots: checkedSlots.map(([slotName, slot]) => ({
        slot: slotName,
        enabled: Boolean(slot.enabled),
        src: slot.src,
        provider: slot.provider,
        reviewStatus: slot.reviewStatus,
      })),
      policy: publicManifest.policy,
    },
    null,
    2,
  ),
)
