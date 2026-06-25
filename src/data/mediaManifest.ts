export type MotionMediaSlot = {
  enabled: boolean
  src: string
  poster: string
  type: string
  label: string
  provider: string
  workflow: string
  reviewStatus: string
}

export type MediaManifest = {
  name: string
  version: string
  policy: {
    stockMedia: string
    externalHotlinks: string
    publishRule: string
  }
  video: {
    hero: MotionMediaSlot
    research: MotionMediaSlot
  }
}

export const defaultMediaManifest: MediaManifest = {
  name: 'Herbalisti motion media manifest',
  version: '2026-06-16',
  policy: {
    stockMedia: 'none',
    externalHotlinks: 'none',
    publishRule: 'Video slots stay disabled until reviewed local assets exist with provenance.',
  },
  video: {
    hero: {
      enabled: false,
      src: '/assets/herbalisti-hero-loop.mp4',
      poster: '/assets/herbalisti-hero.png',
      type: 'video/mp4',
      label: 'Hero cinematic loop',
      provider: 'Kie.ai Seedance 2.0',
      workflow: 'Pending generation',
      reviewStatus: 'pending_generation',
    },
    research: {
      enabled: false,
      src: '/assets/herbalisti-research-loop.mp4',
      poster: '/assets/herbalisti-research.png',
      type: 'video/mp4',
      label: 'Research interface cinematic loop',
      provider: 'Kie.ai Seedance 2.0',
      workflow: 'Pending generation',
      reviewStatus: 'pending_generation',
    },
  },
}
