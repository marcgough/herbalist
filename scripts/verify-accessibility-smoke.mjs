import { existsSync } from 'node:fs'
import { createServer } from 'node:net'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import { chromium } from 'playwright-core'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const providedBaseUrl = process.argv[2] || process.env.HERBALISTI_BASE_URL || ''
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
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].filter(Boolean)

const routes = [
  { id: 'home', path: '/', expectedText: 'Herbalisti' },
  { id: 'search', path: '/search?q=CRISPR', expectedText: 'One interface for books, notes, remedies, sources, and signals.' },
  { id: 'library', path: '/library?q=ginger&region=US', expectedText: 'Searchable references for natural medicine and longevity research.' },
  { id: 'notes', path: '/notes?q=ginger', expectedText: 'Source traces for the knowledge layer.' },
  { id: 'remedies', path: '/remedies?q=ginger', expectedText: 'Core herbs structured for source-led discovery.' },
  { id: 'map', path: '/map?map=ginger', expectedText: 'Plant records as a source-led intelligence layer.' },
  { id: 'signals', path: '/signals?topic=CRISPR', expectedText: 'A self-updating feed for longevity and frontier biology.' },
  { id: 'source-policy', path: '/source-policy', expectedText: 'Public, independent, auditable by default.' },
  { id: 'governance', path: '/governance', expectedText: 'A clear boundary for self-sovereign research.' },
]

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

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
  assert(wranglerCli, 'Could not find a local or global Wrangler CLI entrypoint for accessibility smoke verification.')

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

const auditPage = async (page, route) =>
  page.evaluate((routeId) => {
    const failures = []
    const warnings = []
    const text = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
    const isElementVisible = (element) => {
      if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
    }
    const labelledBy = (element) =>
      text(
        String(element.getAttribute('aria-labelledby') ?? '')
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent ?? '')
          .join(' '),
      )
    const controlLabel = (element) => {
      if ('labels' in element && element.labels?.length) {
        return text(Array.from(element.labels).map((label) => label.textContent ?? '').join(' '))
      }
      return ''
    }
    const accessibleName = (element) =>
      text(
        element.getAttribute('aria-label') ||
          labelledBy(element) ||
          controlLabel(element) ||
          (element instanceof HTMLImageElement ? element.getAttribute('alt') : '') ||
          element.textContent ||
          element.getAttribute('title') ||
          '',
      )

    const visibleInteractive = Array.from(
      document.querySelectorAll(
        'a[href], button, input:not([type="hidden"]), textarea, select, summary, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => isElementVisible(element) && !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true')

    for (const element of visibleInteractive) {
      const name = accessibleName(element)
      if (!name) {
        failures.push(`Interactive element has no accessible name: ${element.outerHTML.slice(0, 180)}`)
      }
      if (element instanceof HTMLAnchorElement && !element.getAttribute('href')) {
        failures.push(`Link has no href: ${name || element.outerHTML.slice(0, 80)}`)
      }
      if (element instanceof HTMLAnchorElement && element.target === '_blank') {
        const rel = element.rel.toLowerCase()
        if (!rel.includes('noreferrer') && !rel.includes('noopener')) {
          failures.push(`External link missing safe rel: ${name}`)
        }
      }
      if (element instanceof HTMLButtonElement && !element.getAttribute('type')) {
        failures.push(`Button missing explicit type: ${name}`)
      }
    }

    const formControls = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, select')).filter(isElementVisible)
    for (const control of formControls) {
      const hasProgrammaticLabel =
        Boolean(control.getAttribute('aria-label')) ||
        Boolean(labelledBy(control)) ||
        Boolean(controlLabel(control))
      if (!hasProgrammaticLabel) {
        failures.push(`Form control has no programmatic label: ${control.outerHTML.slice(0, 160)}`)
      }
    }

    for (const image of Array.from(document.images)) {
      if (!image.hasAttribute('alt')) {
        failures.push(`Image is missing alt attribute: ${image.src}`)
      }
    }

    const h1s = Array.from(document.querySelectorAll('h1'))
    if (h1s.length !== 1) {
      failures.push(`Expected exactly one h1 on ${routeId}, found ${h1s.length}`)
    }
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((heading) => ({
      level: Number(heading.tagName.slice(1)),
      text: text(heading.textContent),
    }))
    headings.forEach((heading, index) => {
      if (!heading.text) {
        failures.push(`Heading has no text at position ${index}`)
      }
      if (index > 0 && heading.level - headings[index - 1].level > 1) {
        failures.push(`Heading level jumps from h${headings[index - 1].level} to h${heading.level}: ${heading.text}`)
      }
    })

    if (!document.querySelector('header')) failures.push('Missing header landmark')
    if (!document.querySelector('main')) failures.push('Missing main landmark')
    if (!document.querySelector('footer')) failures.push('Missing footer landmark')
    if (!document.querySelector('nav[aria-label="Primary navigation"]')) failures.push('Missing labelled primary navigation')
    if (!document.querySelector('a.skip-link[href="#top"]')) failures.push('Missing skip link to main content')
    if (!document.querySelector('main#top[tabindex="-1"]')) failures.push('Main content target should be focusable for skip link')
    if (!document.documentElement.lang) failures.push('html lang is missing')
    if (!document.querySelector('meta[name="viewport"]')) failures.push('Viewport meta tag is missing')

    const primaryActiveLinks = Array.from(document.querySelectorAll('header nav a[aria-current="page"]'))
    if (routeId !== 'home' && primaryActiveLinks.length !== 1) {
      failures.push(`Expected one active primary-nav link on ${routeId}, found ${primaryActiveLinks.length}`)
    }

    const motionElements = Array.from(document.querySelectorAll('*')).filter((element) => {
      if (!isElementVisible(element)) return false
      const style = window.getComputedStyle(element)
      const duration = style.animationDuration
        .split(',')
        .map((value) => Number.parseFloat(value) || 0)
        .reduce((max, value) => Math.max(max, value), 0)
      const iteration = style.animationIterationCount
      return style.animationName !== 'none' && (duration > 0.02 || iteration.includes('infinite'))
    })
    if (motionElements.length) {
      failures.push(`Reduced-motion context still has animated elements: ${motionElements.slice(0, 5).map((element) => element.className || element.tagName).join(', ')}`)
    }
    if (Array.from(document.querySelectorAll('video')).some(isElementVisible)) {
      failures.push('Reduced-motion context should not show ambient video elements')
    }

    const parseColor = (value) => {
      const match = String(value).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/)
      if (!match) return null
      const alpha = match[4] == null ? 1 : Number(match[4])
      return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), alpha }
    }
    const luminance = ({ r, g, b }) => {
      const convert = (channel) => {
        const value = channel / 255
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * convert(r) + 0.7152 * convert(g) + 0.0722 * convert(b)
    }
    const contrastRatio = (a, b) => {
      const lighter = Math.max(luminance(a), luminance(b))
      const darker = Math.min(luminance(a), luminance(b))
      return (lighter + 0.05) / (darker + 0.05)
    }
    const effectiveBackground = (element) => {
      let current = element
      while (current && current !== document.documentElement) {
        const color = parseColor(window.getComputedStyle(current).backgroundColor)
        if (color && color.alpha >= 0.85) {
          return color
        }
        current = current.parentElement
      }
      return { r: 251, g: 250, b: 246, alpha: 1 }
    }
    const textElements = Array.from(document.querySelectorAll('h1,h2,h3,h4,p,a,button,span,small,strong,label,input')).filter(
      (element) => isElementVisible(element) && text(element.textContent || element.getAttribute('value') || element.getAttribute('placeholder')).length > 0,
    )
    for (const element of textElements.slice(0, 180)) {
      const style = window.getComputedStyle(element)
      const foreground = parseColor(style.color)
      if (!foreground || foreground.alpha < 0.85) continue
      const ratio = contrastRatio(foreground, effectiveBackground(element))
      const fontSize = Number.parseFloat(style.fontSize) || 16
      const fontWeight = Number.parseInt(style.fontWeight, 10) || 400
      const largeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700)
      const minimum = largeText ? 3 : 3.8
      if (ratio < minimum) {
        warnings.push(`Low basic contrast ${ratio.toFixed(2)} for "${text(element.textContent).slice(0, 60)}"`)
      }
    }

    return {
      routeId,
      failures,
      warnings: warnings.slice(0, 8),
      interactiveCount: visibleInteractive.length,
      formControlCount: formControls.length,
      headingCount: headings.length,
      h1: h1s[0] ? text(h1s[0].textContent) : '',
    }
  }, route.id)

const verifySkipLink = async (page) => {
  await page.keyboard.press('Tab')
  const focusedText = await page.evaluate(() => document.activeElement?.textContent?.replace(/\s+/g, ' ').trim() ?? '')
  assert(focusedText === 'Skip to main content', `First Tab should focus skip link, got "${focusedText}"`)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(100)
  const focusedId = await page.evaluate(() => document.activeElement?.id ?? '')
  assert(focusedId === 'top', `Skip link should move focus to main content, got "${focusedId}"`)
}

const runAccessibilitySmoke = async (baseUrl) => {
  const executablePath = findBrowserExecutable()
  assert(
    executablePath,
    `Could not find Edge or Chrome for Playwright accessibility smoke. Checked: ${browserCandidates.join(', ')}`,
  )

  const browser = await chromium.launch({
    executablePath,
    headless: true,
  })
  const results = []

  try {
    const context = await browser.newContext({
      viewport: { width: 1360, height: 940 },
      reducedMotion: 'reduce',
    })

    for (const route of routes) {
      const page = await context.newPage()
      const consoleMessages = []
      page.on('console', (message) => {
        if (['error', 'warning'].includes(message.type())) {
          consoleMessages.push(`${message.type()}: ${message.text()}`)
        }
      })
      page.on('pageerror', (error) => {
        consoleMessages.push(`pageerror: ${error.message}`)
      })

      await page.goto(new URL(route.path, baseUrl).toString(), { waitUntil: 'domcontentloaded' })
      await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {})
      await page.getByText(route.expectedText, { exact: false }).first().waitFor({ state: 'attached', timeout: 15000 })

      if (route.id === 'home') {
        await verifySkipLink(page)
      }

      const audit = await auditPage(page, route)
      assert(audit.failures.length === 0, `${route.id} accessibility failures:\n${audit.failures.join('\n')}`)
      assert(consoleMessages.length === 0, `${route.id} console warnings/errors:\n${consoleMessages.join('\n')}`)
      results.push(audit)
      await page.close()
    }

    await context.close()
  } finally {
    await browser.close()
  }

  return results
}

let server
try {
  server = providedBaseUrl ? { baseUrl: providedBaseUrl, stop: () => {} } : await startPagesServer()
  const results = await runAccessibilitySmoke(server.baseUrl)
  const warnings = results.flatMap((result) => result.warnings.map((warning) => `${result.routeId}: ${warning}`))

  console.log(
    JSON.stringify(
      {
        status: 'pass',
        baseUrl: server.baseUrl,
        checkedRoutes: routes.map((route) => route.id),
        reducedMotion: true,
        warnings,
        results: results.map((result) => ({
          route: result.routeId,
          h1: result.h1,
          headings: result.headingCount,
          interactiveElements: result.interactiveCount,
          formControls: result.formControlCount,
        })),
        safeToRun:
          'This verifier opens the local site in Edge/Chrome, checks accessibility semantics and keyboard basics, and reads local pages only. It does not deploy, mutate DNS, call paid APIs, or print secret values.',
      },
      null,
      2,
    ),
  )
} finally {
  server?.stop()
}
