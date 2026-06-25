import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildKnowledgeGraph, graphRelationTypes } from '../functions/_lib/knowledge-graph.js'
import { fallbackRemedies } from '../functions/_lib/remedies.js'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path) => readFileSync(resolve(root, path), 'utf8')
const exists = (path) => existsSync(resolve(root, path))

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const graph = buildKnowledgeGraph(fallbackRemedies)
const remedyNodes = graph.nodes.filter((node) => node.type === 'Remedy')
const relationSet = new Set(graph.edges.map((edge) => edge.relation))

assert(exists('functions/api/graph.js'), 'Graph API endpoint is missing')
assert(exists('functions/_lib/knowledge-graph.js'), 'Shared knowledge graph adapter is missing')
assert(remedyNodes.length >= 20, 'Knowledge graph should include the core remedy nodes')
assert(graph.edgeCount >= 200, 'Knowledge graph should include plant-part, preparation, context, safety, and relation edges')
assert(
  graphRelationTypes.every((relation) => relationSet.has(relation)),
  'Knowledge graph should include every expected relation type',
)
assert(!relationSet.has('TREATS'), 'Knowledge graph must not expose a treatment-claim relation')

const gingerGraph = buildKnowledgeGraph(fallbackRemedies, { query: 'ginger' })
const gingerNodeIds = new Set(gingerGraph.nodes.map((node) => node.id))
for (const id of ['ginger', 'turmeric', 'peppermint-oil', 'garlic']) {
  assert(gingerNodeIds.has(id), `Ginger graph should include ${id}`)
}
for (const preparation of ['Tea', 'Capsule', 'Food', 'Tincture']) {
  assert(
    gingerGraph.nodes.some((node) => node.type === 'Preparation' && node.label === preparation),
    `Ginger graph should include ${preparation} preparation context`,
  )
}
assert(
  gingerGraph.nodes.some((node) => node.type === 'Plant part' && node.label === 'Rhizome'),
  'Ginger graph should include rhizome plant-part context',
)

const plantPartGraph = buildKnowledgeGraph(fallbackRemedies, {
  query: 'ginger',
  relation: 'HAS_PART',
})
assert(
  plantPartGraph.edges.length > 0 && plantPartGraph.edges.every((edge) => edge.relation === 'HAS_PART'),
  'Relation filter should return only plant-part edges',
)
assert(
  plantPartGraph.nodes.some((node) => node.type === 'Plant part' && node.label === 'Rhizome'),
  'Plant-part relation filter should include the rhizome node',
)

const safetyGraph = buildKnowledgeGraph(fallbackRemedies, {
  query: "St. John's",
  relation: 'SAFETY_WATCH',
})
assert(
  safetyGraph.edges.every((edge) => edge.relation === 'SAFETY_WATCH'),
  'Relation filter should return only safety-watch edges',
)
assert(
  safetyGraph.nodes.some((node) => node.type === 'Safety' && node.label.includes('Antidepressant')),
  "St. John's wort graph should include antidepressant safety-watch context",
)

const app = read('src/App.tsx')
assert(app.includes('/api/graph'), 'Frontend should request the graph API')
assert(app.includes('id="map"'), 'Frontend should expose the Relationship map section')
assert(app.includes('Relationship map'), 'Frontend should label the relationship map')
assert(app.includes("'Plant part'"), 'Frontend graph stats should include plant-part nodes')
assert(app.includes('Has part'), 'Frontend should label the plant-part relation')
assert(app.includes('Traditional context'), 'Frontend should use non-treatment relation language')

const health = read('functions/api/health.js')
assert(health.includes('graphApi: true'), 'Health API should expose graphApi surface')

const packageJson = JSON.parse(read('package.json'))
assert(packageJson.scripts?.['verify:knowledge-graph'], 'package.json should expose verify:knowledge-graph')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      remedyNodes: remedyNodes.length,
      graphNodes: graph.nodeCount,
      graphEdges: graph.edgeCount,
      relations: [...relationSet].sort(),
      gingerNodes: gingerGraph.nodeCount,
      gingerEdges: gingerGraph.edgeCount,
      plantPartEdges: plantPartGraph.edgeCount,
      safetyEdges: safetyGraph.edgeCount,
    },
    null,
    2,
  ),
)
