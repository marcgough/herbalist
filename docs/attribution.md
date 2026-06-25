# Herbalisti Attribution And Provenance

Date: 2026-06-16

## Launch Media

Herbalisti uses project-bound visual assets rather than stock imagery.

- `public/assets/herbalisti-hero.png`: generated with OpenAI image generation for the Herbalisti build. The brief requested OpenAI Image Gen 2. The asset is a local launch candidate for the hero background.
- `public/assets/herbalisti-home-background.png`: user-supplied project reference image from the Herbalisti review thread. The active home hero now uses the OpenAI-generated hero image.
- `public/assets/herbalisti-research.png`: generated with OpenAI image generation for the Herbalisti build. The brief requested OpenAI Image Gen 2. The asset is a local launch candidate for the research/knowledge interface band.
- `public/assets/herbalisti-logo.svg`: original project SVG no-icon Titanium botanical wordmark with a flowing baseline.
- `public/assets/herbalisti-mark.svg`: original project SVG standalone mark.
- `public/favicon.svg`: original project SVG favicon using the standalone mark.

Public machine-readable provenance:

- `/data/media-provenance.json`
- `/data/media-manifest.json`

Launch media restrictions:

- No stock-photo dependencies.
- No external media hotlinks.
- No third-party marks, readable medical claims, pills, syringes, hospital cues, pharmaceutical packaging, or people intentionally included.
- Future generated media requires human review before publication.
- Seedance video slots stay disabled until reviewed local files exist, are recorded in provenance, and are served from Herbalisti-owned storage.

## Direct Runtime Dependencies

Direct runtime dependencies used by the public site and Cloudflare functions:

| Package | Package spec | License | Role |
| --- | ---: | --- | --- |
| `adm-zip` | `^0.5.16` | MIT | ZIP handling for corpus and verification tooling |
| `react` | `^19.2.7` | MIT | UI runtime |
| `react-dom` | `^19.2.7` | MIT | UI rendering |
| `lucide-react` | `^1.18.0` | ISC | Interface icons |
| `fast-xml-parser` | `^5.9.0` | MIT | Feed parsing |

## Direct Build And Verification Dependencies

| Package | Package spec | License | Role |
| --- | ---: | --- | --- |
| `@eslint/js` | `^10.0.1` | MIT | ESLint base JavaScript rules |
| `@vitejs/plugin-react` | `^6.0.2` | MIT | Vite React build integration |
| `@types/node` | `^24.12.3` | MIT | Type definitions |
| `@types/react` | `^19.2.14` | MIT | Type definitions |
| `@types/react-dom` | `^19.2.3` | MIT | Type definitions |
| `eslint` | `^10.3.0` | MIT | Linting |
| `eslint-plugin-react-hooks` | `^7.1.1` | MIT | React hooks linting |
| `eslint-plugin-react-refresh` | `^0.5.2` | MIT | React refresh linting |
| `globals` | `^17.6.0` | MIT | Linting globals |
| `playwright-core` | `^1.61.0` | Apache-2.0 | Browser verification and release checks |
| `typescript` | `~6.0.2` | Apache-2.0 | Type checking |
| `typescript-eslint` | `^8.59.2` | MIT | TypeScript linting |
| `vite` | `^8.0.16` | MIT | Build tool |

## Launch Rule

Before production launch, run:

```bash
npm run verify:attribution
```

This verifies the public provenance file, motion-media manifest, referenced launch assets, direct dependency licenses, and this attribution note.
