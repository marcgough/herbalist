import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { createServer } from 'node:net'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import { chromium } from 'playwright-core'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const providedBaseUrl = process.argv[2] || process.env.HERBALISTI_BASE_URL || ''
const outputDir = resolve(root, 'output', 'playwright', 'herbalisti-visual-smoke')
const localWranglerCli = resolve(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js')
const wranglerCli = existsSync(localWranglerCli)
  ? localWranglerCli
  : process.env.APPDATA
    ? resolve(process.env.APPDATA, 'npm', 'node_modules', 'wrangler', 'bin', 'wrangler.js')
    : process.env.USERPROFILE
      ? resolve(process.env.USERPROFILE, 'AppData', 'Roaming', 'npm', 'node_modules', 'wrangler', 'bin', 'wrangler.js')
      : ''
const localWranglerCmd = resolve(root, 'node_modules', '.bin', 'wrangler.cmd')
const wranglerCmd = existsSync(localWranglerCmd)
  ? localWranglerCmd
  : process.env.APPDATA
    ? resolve(process.env.APPDATA, 'npm', 'wrangler.cmd')
    : process.env.USERPROFILE
      ? resolve(process.env.USERPROFILE, 'AppData', 'Roaming', 'npm', 'wrangler.cmd')
      : ''

const browserCandidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].filter(Boolean)

const viewports = [
  { id: 'desktop', width: 1440, height: 1000 },
  { id: 'mobile', width: 390, height: 844, isMobile: true },
]

const routes = [
  {
    id: 'home',
    path: '/',
    selectors: ['.site-header', '.home-chat-panel', '.home-news-section', '.site-footer'],
    text: ['Herbalisti', 'Ask the herbal archive.', 'Independent public-source signals.'],
    interact: async (page) => {
      await page.locator('#home-herbal-search').fill('CRISPR')
      await page.locator('.home-chat-form button[type="submit"]').click()
      await page.locator('.home-search-preview, .chat-citations').first().waitFor({ state: 'visible', timeout: 12000 })
    },
  },
  {
    id: 'search',
    path: '/search?q=CRISPR',
    selectors: ['.console-section', '.search-group'],
    text: ['One interface for books, notes, remedies, sources, and signals.'],
  },
  {
    id: 'library',
    path: '/library?q=ginger&region=US',
    selectors: ['.library-section', '.book-card'],
    text: ['Searchable references for natural medicine and longevity research.'],
  },
  {
    id: 'signals',
    path: '/signals?topic=CRISPR',
    selectors: ['.signals-section', '.signal-intelligence-panel', '.source-health-panel', '.news-card'],
    text: ['A self-updating feed for longevity and frontier biology.'],
  },
  {
    id: 'source-policy',
    path: '/source-policy',
    selectors: ['.source-section', '.source-license-panel', '.site-footer'],
    text: ['Public, independent, auditable by default.'],
  },
]

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const commandString = (parts) =>
  parts
    .map((value) => {
      if (/^[A-Za-z0-9_@%+=:,./\\-]+$/.test(value)) {
        return value
      }

      return `"${String(value).replace(/"/g, '\\"')}"`
    })
    .join(' ')

const getOpenPort = async () =>
  new Promise((resolvePort, rejectPort) => {
    const server = createServer()
    server.on('error', rejectPort)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      server.close(() => {
        if (address && typeof address === 'object') {
          resolvePort(address.port)
        } else {
          rejectPort(new Error('Could not reserve an open local port'))
        }
      })
    })
  })

const fetchWithTimeout = async (url, timeoutMs = 10000) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

const waitForServer = async (url, timeoutMs = 45000) => {
  const started = Date.now()
  let lastError = ''

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetchWithTimeout(url, 4000)
      if (response.ok) {
        return
      }
      lastError = `HTTP ${response.status}`
    } catch (error) {
      lastError = error.message
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 1000))
  }

  throw new Error(`Timed out waiting for Pages dev server: ${lastError}`)
}

const stopProcessTree = (childProcess) => {
  if (!childProcess?.pid) {
    return
  }

  if (process.platform === 'win32') {
    spawnSync(`taskkill /pid ${childProcess.pid} /t /f`, { shell: true, stdio: 'ignore' })
  } else {
    childProcess.kill('SIGTERM')
  }
}

const startPagesServer = async () => {
  assert(wranglerCli, 'Could not find a local or global Wrangler CLI entrypoint for visual smoke verification.')

  const port = await getOpenPort()
  const baseUrl = `http://127.0.0.1:${port}`
  let stdout = ''
  let stderr = ''

  const server =
    process.platform === 'win32'
      ? spawn(
          process.env.ComSpec || 'cmd.exe',
          [
            '/d',
            '/s',
            '/c',
            `${wranglerCmd || 'wrangler.cmd'} pages dev dist --port ${String(port)} --compatibility-date 2026-06-15 --log-level error`,
          ],
          {
            cwd: root,
            stdio: ['ignore', 'pipe', 'pipe'],
          },
        )
      : spawn(
          process.execPath,
          [
            wranglerCli,
            'pages',
            'dev',
            'dist',
            '--port',
            String(port),
            '--compatibility-date',
            '2026-06-15',
            '--log-level',
            'error',
          ],
          {
            cwd: root,
            stdio: ['ignore', 'pipe', 'pipe'],
          },
        )

  server.stdout.on('data', (chunk) => {
    stdout += chunk.toString()
  })
  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString()
  })

  try {
    await waitForServer(baseUrl)
  } catch (error) {
    stopProcessTree(server)
    const logExcerpt = [stdout.trim(), stderr.trim()].filter(Boolean).join('\n').slice(-4000)
    throw new Error([error.message, logExcerpt ? `Pages dev log excerpt:\n${logExcerpt}` : ''].filter(Boolean).join('\n'))
  }

  return {
    baseUrl,
    stop: () => stopProcessTree(server),
  }
}

const findBrowserExecutable = () => browserCandidates.find((candidate) => existsSync(candidate))

const ensureVisible = async (page, selector, label) => {
  await page.locator(selector).first().waitFor({ state: 'visible', timeout: 15000 })
  const count = await page.locator(selector).count()
  assert(count > 0, `${label} expected selector ${selector}`)
}

const waitForText = async (page, text, label) => {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout: 15000 })
}

const inspectLayout = async (page) =>
  page.evaluate(() => {
    const documentElement = document.documentElement
    const body = document.body
    const clientWidth = documentElement.clientWidth
    const scrollWidth = Math.max(documentElement.scrollWidth, body?.scrollWidth ?? 0)
    const images = Array.from(document.images).map((image) => ({
      src: image.currentSrc || image.src,
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    }))

    const isDecorativeMotionLayer = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false
      }

      const className = typeof element.className === 'string' ? element.className : ''
      return (
        className.includes('hero-image') ||
        className.includes('hero-video') ||
        className.includes('signal-lattice') ||
        className.includes('motion-grid') ||
        className.includes('scanline') ||
        (element.closest('.hero-section')?.contains(element) && element.tagName.toLowerCase() === 'img') ||
        (element.closest('.image-band')?.contains(element) && element.tagName.toLowerCase() === 'img')
      )
    }

    const isInsideScrollableInlineRegion = (element) => {
      let current = element.parentElement
      while (current && current !== document.body) {
        const style = window.getComputedStyle(current)
        if (['auto', 'scroll'].includes(style.overflowX)) {
          return true
        }
        current = current.parentElement
      }

      return false
    }

    const protrudingElements = Array.from(document.body.querySelectorAll('*'))
      .filter((element) => !isDecorativeMotionLayer(element))
      .filter((element) => !isInsideScrollableInlineRegion(element))
      .map((element) => {
        const rect = element.getBoundingClientRect()
        const style = window.getComputedStyle(element)
        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === 'string' ? element.className : '',
          id: element.id,
          text: String(element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 90),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          overflowX: style.overflowX,
          display: style.display,
          visibility: style.visibility,
        }
      })
      .filter((item) => {
        if (item.display === 'none' || item.visibility === 'hidden' || item.width < 2 || item.height < 2) {
          return false
        }

        return item.left < -2 || item.right > clientWidth + 2
      })
      .slice(0, 8)

    return {
      clientWidth,
      scrollWidth,
      images,
      protrudingElements,
    }
  })

const runVisualSmoke = async (baseUrl) => {
  const executablePath = findBrowserExecutable()
  assert(
    executablePath,
    `Could not find Edge or Chrome for Playwright visual smoke. Checked: ${browserCandidates.join(', ')}`,
  )

  await mkdir(outputDir, { recursive: true })
  const browser = await chromium.launch({
    executablePath,
    headless: true,
  })
  const results = []

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: Boolean(viewport.isMobile),
        deviceScaleFactor: 1,
      })

      for (const route of routes) {
        const page = await context.newPage()
        const messages = []

        page.on('console', (message) => {
          if (['error', 'warning'].includes(message.type())) {
            messages.push(`${message.type()}: ${message.text()}`)
          }
        })
        page.on('pageerror', (error) => {
          messages.push(`pageerror: ${error.message}`)
        })

        const targetUrl = new URL(route.path, baseUrl).toString()
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded' })
        await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {})

        for (const selector of route.selectors) {
          await ensureVisible(page, selector, `${viewport.id}/${route.id}`)
        }

        for (const text of route.text) {
          await waitForText(page, text, `${viewport.id}/${route.id}`)
        }

        if (route.interact) {
          await route.interact(page)
          await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {})
        }

        const layout = await inspectLayout(page)
        const brokenImages = layout.images.filter(
          (image) => image.src && (!image.complete || image.naturalWidth < 1 || image.naturalHeight < 1),
        )
        assert(
          layout.scrollWidth <= layout.clientWidth + 2,
          `${viewport.id}/${route.id} has horizontal page overflow: ${layout.scrollWidth}px > ${layout.clientWidth}px`,
        )
        assert(
          layout.protrudingElements.length === 0,
          `${viewport.id}/${route.id} has elements outside the viewport: ${JSON.stringify(layout.protrudingElements)}`,
        )
        assert(
          brokenImages.length === 0,
          `${viewport.id}/${route.id} has broken images: ${brokenImages.map((image) => image.src).join(', ')}`,
        )
        assert(messages.length === 0, `${viewport.id}/${route.id} console warnings/errors: ${messages.join('\n')}`)

        const screenshotPath = resolve(outputDir, `${viewport.id}-${route.id}.png`)
        await mkdir(dirname(screenshotPath), { recursive: true })
        await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' })
        results.push({
          viewport: viewport.id,
          route: route.id,
          path: route.path,
          screenshot: screenshotPath,
          clientWidth: layout.clientWidth,
          scrollWidth: layout.scrollWidth,
          imageCount: layout.images.length,
        })
        await page.close()
      }

      await context.close()
    }
  } finally {
    await browser.close()
  }

  return results
}

let server
try {
  server = providedBaseUrl ? { baseUrl: providedBaseUrl, stop: () => {} } : await startPagesServer()
  const results = await runVisualSmoke(server.baseUrl)

  console.log(
    JSON.stringify(
      {
        status: 'pass',
        baseUrl: server.baseUrl,
        outputDir,
        checkedRoutes: routes.length,
        checkedViewports: viewports.map((viewport) => viewport.id),
        screenshots: results.map((result) => result.screenshot),
        results,
        safeToRun:
          'This verifier opens the local site in Edge/Chrome, checks layout and console state, and writes local screenshots only. It does not deploy, mutate DNS, call paid APIs, or print secret values.',
      },
      null,
      2,
    ),
  )
} finally {
  server?.stop()
}
