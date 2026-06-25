# Herbalisti Checkpoint: High-Tech Motion System

Date: 2026-06-16

## Summary

Added a governed high-tech procedural motion layer so Herbalisti feels more like a contemporary health intelligence interface while Seedance video generation remains optional and disabled until reviewed owned MP4 assets exist.

The change supports Marc's direction: Star Trek meets holistic health, airy Japanese Zen, high-tech rather than old-school or low-tech.

## Files Changed

- `src/App.tsx`: added decorative signal-lattice layers to the hero and research image band, and named the research copy block as `image-band-copy`.
- `src/App.css`: added the procedural signal-lattice visual system and `signalSweep` animation.
- `scripts/verify-motion-system.mjs`: added a motion-system verifier for procedural layers, reduced-motion support, manifest-governed video slots, local-only media paths, and no provider hotlinks.
- `package.json`: added `npm run verify:motion-system`.
- `scripts/verify-release.mjs`: added high-tech motion-system verification to the release gate.
- `scripts/verify-launch-config.mjs`: added the motion verifier to required launch files and scripts.
- `scripts/verify-goal-readiness.mjs`: added a full-goal requirement group for the high-tech motion system.
- `README.md`, `docs/deployment-runbook.md`, `docs/goal-readiness.md`, `docs/herbalisti-project-plan.md`: documented the new check and checkpoint.

## Verification

Passed:

- `npm run verify:motion-system`
- `npm run verify:goal-readiness`
- `npm run verify:launch -- --soft`
- `npm run lint`
- `npm run build`
- `npm run verify:release`

Browser QA:

- Desktop local page rendered two signal-lattice layers.
- Mobile 390 px viewport had no page-level horizontal overflow.
- Disabled Seedance slots rendered no `<video>` elements.
- Browser console warnings/errors were empty.

Goal readiness after this checkpoint:

- Status: `local-ready-production-pending`
- Passing local requirement groups: 11
- Production-pending groups: 3

## Remaining Production Setup

The goal remains active and not complete until the production environment exists and passes live verification.

Still needed:

- Create the Cloudflare D1 database named `herbalisti`.
- Run `npm run configure:cloudflare -- --d1 <database_id> --apply`.
- Set required Cloudflare secrets.
- Deploy Cloudflare Pages and the scheduled news Worker.
- Connect `herbalisti.com` DNS/custom domain.
- Run `npm run verify:live-readiness -- --strict`.
- Run `npm run verify:production -- https://herbalisti.com`.

## Guardrails

No deployment, DNS mutation, external API write, paid OpenAI generation, Seedance/Kie.ai generation, upload, or secret use was performed in this checkpoint.
