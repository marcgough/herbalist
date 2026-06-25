# Frontier Batch Profiles

These JSON files capture reusable acquisition preferences for `run-frontier-batch.mjs` and `run-frontier-campaign.mjs`.

Use them when a batch should preserve a known editorial bias instead of rebuilding the same exclusion list by hand.

Supported fields:

- `profileId`
- `description`
- `stage`
- `selectionStrategy`
- `diversityScanWindow`
- `nlmLimit`
- `wellcomeLimit`
- `excludeWorkIds`
- `excludeSeriesKeys`
- `excludeCreatorSeriesKeys`
- `excludeTitlePhrases`
- `topicBoosts`
- `clusterBoosts`
- `titleScoreAdjustments`
- `notes`

CLI flags still win over profile defaults.

Example:

```powershell
node outputs/herbalisti-site/scripts/corpus/run-frontier-batch.mjs --profile=diverse-broadening-2026-06-18 --dry-run=true
```

Current useful profiles:

- `diverse-broadening-2026-06-18`
- `botany-pharmacopoeia-deepening-2026-06-18`
- `english-practical-reference-2026-06-18`
- `botanical-reference-2026-06-19`
