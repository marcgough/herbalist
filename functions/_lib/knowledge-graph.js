import { fallbackRemedies, filterRemedies, readRemediesFromD1 } from './remedies.js'

export const graphRelationTypes = ['RELATED_TO', 'HAS_PART', 'PREPARED_AS', 'TRADITIONAL_CONTEXT', 'SAFETY_WATCH']

const normalizeQuery = (value) => String(value ?? '').trim().slice(0, 120)
const normalizeRelation = (value) => (graphRelationTypes.includes(value) ? value : 'All relations')

const slug = (value) =>
  String(value ?? '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)

const addNode = (nodes, node) => {
  if (!nodes.has(node.id)) {
    nodes.set(node.id, node)
  }
}

const addEdge = (edges, edge) => {
  if (!edges.has(edge.id)) {
    edges.set(edge.id, edge)
  }
}

const buildNameMap = (remedies) => {
  const map = new Map()

  for (const remedy of remedies) {
    map.set(remedy.name.toLowerCase(), remedy.id)
    map.set(remedy.id.toLowerCase(), remedy.id)
    for (const commonName of remedy.commonNames ?? []) {
      map.set(commonName.toLowerCase(), remedy.id)
    }
  }

  return map
}

const remedyMatchesFocus = (remedy, focus) => {
  const normalizedFocus = focus.toLowerCase()
  return (
    remedy.id.toLowerCase() === normalizedFocus ||
    remedy.name.toLowerCase() === normalizedFocus ||
    remedy.name.toLowerCase().includes(normalizedFocus) ||
    remedy.botanicalName.toLowerCase().includes(normalizedFocus) ||
    (remedy.commonNames ?? []).some((name) => name.toLowerCase().includes(normalizedFocus))
  )
}

const relationMatches = (edge, relation) => relation === 'All relations' || edge.relation === relation

export const buildKnowledgeGraph = (remedies, filters = {}) => {
  const query = normalizeQuery(filters.query)
  const focus = normalizeQuery(filters.focus)
  const relation = normalizeRelation(filters.relation)
  const allNodes = new Map()
  const allEdges = new Map()
  const nameMap = buildNameMap(remedies)

  for (const remedy of remedies) {
    addNode(allNodes, {
      id: remedy.id,
      type: 'Remedy',
      label: remedy.name,
      summary: remedy.safetySummary,
      sourceName: remedy.sourceName,
      sourceUrl: remedy.sourceUrl,
      sourceStatus: remedy.sourceStatus,
      tags: remedy.tags ?? [],
    })
  }

  for (const remedy of remedies) {
    for (const relatedName of remedy.related ?? []) {
      const targetId = nameMap.get(String(relatedName).toLowerCase())
      if (!targetId || targetId === remedy.id) {
        continue
      }

      addEdge(allEdges, {
        id: `${remedy.id}-RELATED_TO-${targetId}`,
        source: remedy.id,
        target: targetId,
        relation: 'RELATED_TO',
        label: 'Related to',
        evidence: `${remedy.name} records ${relatedName} as a related remedy.`,
        sourceUrl: remedy.sourceUrl,
      })
    }

    for (const preparation of remedy.preparations ?? []) {
      const targetId = `preparation-${slug(preparation)}`
      addNode(allNodes, {
        id: targetId,
        type: 'Preparation',
        label: preparation,
        summary: 'Public preparation context from the remedy source index.',
      })
      addEdge(allEdges, {
        id: `${remedy.id}-PREPARED_AS-${targetId}`,
        source: remedy.id,
        target: targetId,
        relation: 'PREPARED_AS',
        label: 'Prepared as',
        evidence: `${remedy.name} includes ${preparation} as a preparation context.`,
        sourceUrl: remedy.sourceUrl,
      })
    }

    for (const part of remedy.plantParts ?? []) {
      const targetId = `part-${slug(part)}`
      addNode(allNodes, {
        id: targetId,
        type: 'Plant part',
        label: part,
        summary: 'Plant-part context from the public remedy index.',
      })
      addEdge(allEdges, {
        id: `${remedy.id}-HAS_PART-${targetId}`,
        source: remedy.id,
        target: targetId,
        relation: 'HAS_PART',
        label: 'Has part',
        evidence: `${remedy.name} is indexed with ${part} plant-part context.`,
        sourceUrl: remedy.sourceUrl,
      })
    }

    for (const context of remedy.traditionalUses ?? []) {
      const targetId = `context-${slug(context)}`
      addNode(allNodes, {
        id: targetId,
        type: 'Context',
        label: context,
        summary: 'Traditional-use context from the public remedy index; not a treatment claim.',
      })
      addEdge(allEdges, {
        id: `${remedy.id}-TRADITIONAL_CONTEXT-${targetId}`,
        source: remedy.id,
        target: targetId,
        relation: 'TRADITIONAL_CONTEXT',
        label: 'Traditional context',
        evidence: `${remedy.name} is indexed with ${context}.`,
        sourceUrl: remedy.sourceUrl,
      })
    }

    for (const flag of remedy.interactionFlags ?? []) {
      const targetId = `safety-${slug(flag)}`
      addNode(allNodes, {
        id: targetId,
        type: 'Safety',
        label: flag,
        summary: 'Safety-watch context from the public remedy index.',
      })
      addEdge(allEdges, {
        id: `${remedy.id}-SAFETY_WATCH-${targetId}`,
        source: remedy.id,
        target: targetId,
        relation: 'SAFETY_WATCH',
        label: 'Safety watch',
        evidence: `${remedy.name} carries a ${flag.toLowerCase()} safety watch.`,
        sourceUrl: remedy.sourceUrl,
      })
    }
  }

  const allRemedyIds = new Set(remedies.map((remedy) => remedy.id))
  const selectedRemedyIds = new Set()

  if (focus) {
    for (const remedy of remedies) {
      if (remedyMatchesFocus(remedy, focus)) {
        selectedRemedyIds.add(remedy.id)
      }
    }
  } else if (query) {
    for (const remedy of filterRemedies(remedies, { query, preparation: 'All preparations' })) {
      selectedRemedyIds.add(remedy.id)
    }
  } else {
    for (const remedyId of allRemedyIds) {
      selectedRemedyIds.add(remedyId)
    }
  }

  const filteredEdges = []
  const allowedNodeIds = new Set()

  for (const edge of allEdges.values()) {
    if (!relationMatches(edge, relation)) {
      continue
    }

    const includeEdge =
      !query && !focus
        ? true
        : selectedRemedyIds.has(edge.source) ||
          (edge.relation === 'RELATED_TO' && selectedRemedyIds.has(edge.target))

    if (includeEdge) {
      filteredEdges.push(edge)
      allowedNodeIds.add(edge.source)
      allowedNodeIds.add(edge.target)
    }
  }

  for (const remedyId of selectedRemedyIds) {
    allowedNodeIds.add(remedyId)
  }

  const nodes = [...allowedNodeIds]
    .map((id) => allNodes.get(id))
    .filter(Boolean)
    .sort((a, b) => {
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type)
      }
      return a.label.localeCompare(b.label)
    })

  filteredEdges.sort((a, b) => {
    if (a.relation !== b.relation) {
      return a.relation.localeCompare(b.relation)
    }
    return a.id.localeCompare(b.id)
  })

  return {
    filters: { query, focus, relation },
    nodeCount: nodes.length,
    edgeCount: filteredEdges.length,
    policy: 'Source-led relationship graph. Traditional context edges are not treatment claims.',
    nodes,
    edges: filteredEdges,
  }
}

export const getKnowledgeGraphPayload = async (env, filters = {}) => {
  let remedies = fallbackRemedies
  let source = 'static-fallback'

  if (env.HERBALISTI_DB) {
    const d1Remedies = await readRemediesFromD1(env.HERBALISTI_DB)
    if (d1Remedies.length) {
      remedies = d1Remedies
      source = 'd1'
    }
  }

  const graph = buildKnowledgeGraph(remedies, filters)

  return {
    generatedAt: new Date().toISOString(),
    source,
    ...graph,
  }
}
