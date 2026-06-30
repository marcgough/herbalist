# Herbalisti Checkpoint: GitHub Release Evidence Verifier

Date: 2026-07-01

## Summary

Added a read-only launch evidence verifier for the public GitHub repository. The verifier checks that the intended launch commit has both:

- a fresh successful `Herbalisti CI` run
- a fresh successful manual `Herbalisti Manual Release Gate` run
- an unexpired `herbalisti-visual-smoke` artifact with a SHA-256 digest

This closes a launch-readiness gap between "the workflows exist" and "the exact commit we intend to launch has public CI/manual-release evidence."

## What Changed

- Added `scripts/verify-github-release-evidence.mjs`.
- Added `npm run verify:github-release-evidence`.
- Added the evidence verifier to launch preflight scripts, production contract checks, goal-readiness evidence, generated launch-packet content, README, deployment runbook, and production launch packet docs.

## Safety Boundary

The verifier reads GitHub Actions run and artifact metadata only. It does not deploy, mutate DNS, create Cloudflare resources, set secrets, download artifacts, call paid APIs, or print credential values.

## Important Sequencing

The verifier is not run inside the manual release workflow itself, because that would create a circular condition where the manual release run must already be complete while it is still executing.

Correct launch sequence:

1. Push the intended launch commit.
2. Confirm normal GitHub CI passes.
3. Trigger the manual release gate for that same commit.
4. Run `npm run verify:github-release-evidence`.
5. Continue to Cloudflare production setup only after the evidence gate passes.

## Remaining Production Gates

The full Herbalisti goal remains active until Cloudflare D1, secrets, Pages/Worker deployment, `herbalisti.com` DNS/custom-domain routing, and strict live verification are complete.
