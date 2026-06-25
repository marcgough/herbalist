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

assert(exists('public/data/governance.json'), 'Missing public governance policy')

const governance = JSON.parse(read('public/data/governance.json'))
const app = read('src/App.tsx')
const css = read('src/App.css')
const runbook = read('docs/deployment-runbook.md')
const projectPlan = read('docs/herbalisti-project-plan.md')

assert(governance.name === 'Herbalisti launch governance', 'Governance policy has the wrong name')
assert(governance.medicalBoundary?.status === 'educational_research_interface', 'Missing educational boundary status')
assert(
  governance.medicalBoundary?.summary?.includes('does not diagnose, treat, prescribe'),
  'Medical boundary summary must be explicit',
)
assert(governance.medicalBoundary?.requiresProfessionalCare === true, 'Professional-care boundary must be true')
assert(governance.sourcePolicy?.mode === 'allowlist_first', 'Source policy must be allowlist-first')
assert(
  governance.sourcePolicy?.bigPharmaDefault === 'excluded_unless_explicitly_approved',
  'Big Pharma source default must be explicit',
)
assert(
  governance.sourcePolicy?.reviewCadence === 'quarterly_or_before_source_expansion',
  'Source policy must include the review cadence',
)
assert(
  governance.sourcePolicy?.conflictHandling?.includes('commentary'),
  'Source policy must include disclosed-conflict handling',
)
assert(
  governance.privacy?.publicLaunchDefault?.includes('No user accounts'),
  'Privacy restraint must mention no user accounts',
)
assert(governance.editorialReview?.automatedAdvice === 'disabled', 'Automated advice must be disabled')

for (const text of [
  "path: '/governance'",
  'Research boundaries',
  'Educational boundary',
  'Traceable sources',
  'Privacy by restraint',
  'Human review',
  'does not diagnose, treat',
  'professional care',
]) {
  assert(app.includes(text), `Visible governance surface is missing: ${text}`)
}

assert(css.includes('.governance-section'), 'CSS should style the governance section')
assert(css.includes('.governance-grid'), 'CSS should style the governance grid')
assert(runbook.includes('Governance policy'), 'Deployment runbook should mention governance verification')
assert(projectPlan.includes('Launch governance'), 'Project plan should record governance work')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      policy: governance.name,
      version: governance.version,
      ui: {
        section: 'governance-section',
        cards: 4,
      },
      boundaries: {
        medical: governance.medicalBoundary.status,
        sourcePolicy: governance.sourcePolicy.mode,
        automatedAdvice: governance.editorialReview.automatedAdvice,
      },
    },
    null,
    2,
  ),
)
