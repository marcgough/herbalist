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

const pngDimensions = (path) => {
  const buffer = readFileSync(resolve(root, path))
  const signature = buffer.subarray(0, 8).toString('hex')
  assert(signature === '89504e470d0a1a0a', `${path} is not a PNG file`)
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

for (const file of [
  'public/assets/herbalisti-logo.svg',
  'public/assets/herbalisti-mark.svg',
  'public/assets/herbalisti-hero.png',
  'public/assets/herbalisti-home-background.png',
  'public/assets/herbalisti-research.png',
  'public/favicon.svg',
  'public/manifest.webmanifest',
  'docs/brand-system.md',
]) {
  assert(exists(file), `Missing brand file: ${file}`)
}

const logo = read('public/assets/herbalisti-logo.svg')
const mark = read('public/assets/herbalisti-mark.svg')
const favicon = read('public/favicon.svg')
const index = read('index.html')
const app = read('src/App.tsx')
const css = read('src/App.css')
const manifest = JSON.parse(read('public/manifest.webmanifest'))
const brandDoc = read('docs/brand-system.md')

assert(logo.includes('<title>herbalisti</title>'), 'Primary logo should include the lowercase herbalisti wordmark')
assert(!logo.includes('Self-sovereign health intelligence'), 'Primary logo should be a wordmark without tagline text')
assert(logo.includes('viewBox="0 0 520 118"'), 'Primary logo should use the no-icon wordmark viewBox')
assert(logo.includes('#667b82'), 'Primary logo should use brand Titanium')
assert(!logo.includes('signal leaf mark'), 'Primary logo should not include the removed icon mark')
assert(mark.includes('Herbalisti monogram'), 'Standalone app tile should use the updated monogram accessibility label')
assert(mark.includes('#667b82'), 'Standalone app tile should use brand Titanium')
assert(favicon.includes('rx="22"'), 'Favicon should use the rounded app-tile treatment')
assert(
  !/\b(?:href|src)=["']https?:\/\//i.test(logo),
  'Logo SVG should not depend on external image/link assets',
)

assert(index.includes('<link rel="canonical" href="https://herbalisti.com/"'), 'Missing canonical URL')
assert(index.includes('<link rel="manifest" href="/manifest.webmanifest"'), 'Missing manifest link')
assert(index.includes('<meta name="theme-color" content="#cfe8e7"'), 'Missing brand theme colour')
assert(index.includes('https://herbalisti.com/assets/herbalisti-hero.png'), 'Missing absolute Open Graph/Twitter image path')

assert(app.includes('/assets/herbalisti-logo.svg'), 'React logo component should use the primary logo asset')
assert(app.includes('/assets/herbalisti-hero.png'), 'Homepage should use the generated hero image background')
assert(app.includes('Self-sovereign health intelligence'), 'Homepage should render the tagline as live text above search')
assert(!app.includes('Leaf,'), 'React logo should not use the generic leaf icon import')
assert(!app.includes('Brand system'), 'Brand system should remain internal, not visible in the React UI')
assert(app.includes("path: '/signals'"), 'Primary navigation should use routed pages')
assert(css.includes('.brand-logo-image'), 'CSS should define primary logo image sizing')

assert(manifest.name === 'Herbalisti', 'Manifest app name should be Herbalisti')
assert(manifest.theme_color === '#cfe8e7', 'Manifest should use the brand theme colour')
assert(
  manifest.icons?.some((icon) => icon.src === '/assets/herbalisti-mark.svg' && icon.purpose === 'maskable'),
  'Manifest should include the maskable Herbalisti mark',
)

assert(brandDoc.includes('Star Trek clarity'), 'Brand guide should preserve the high-tech direction')
assert(brandDoc.includes('not feel rustic'), 'Brand guide should reject old-school visual cues')

const hero = pngDimensions('public/assets/herbalisti-hero.png')
const homeBackground = pngDimensions('public/assets/herbalisti-home-background.png')
const research = pngDimensions('public/assets/herbalisti-research.png')
assert(hero.width >= 1200 && hero.height >= 800, 'Hero image should be large enough for launch use')
assert(homeBackground.width >= 600 && homeBackground.height >= 250, 'Home background reference should be usable for the search hero')
assert(research.width >= 1200 && research.height >= 800, 'Research image should be large enough for launch use')

console.log(
  JSON.stringify(
    {
      logo: 'public/assets/herbalisti-logo.svg',
      appTile: 'public/assets/herbalisti-mark.svg',
      favicon: 'public/favicon.svg',
      manifest: manifest.name,
      hero,
      homeBackground,
      research,
      metadata: {
        canonical: 'https://herbalisti.com/',
        themeColor: manifest.theme_color,
      },
    },
    null,
    2,
  ),
)
