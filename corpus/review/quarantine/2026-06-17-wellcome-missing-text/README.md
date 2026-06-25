# Wellcome text quarantine and recovery notes

These Wellcome works were temporarily excluded from the active acquisition queue because the official text acquisition chain returned `404` responses during the 2026-06-17 batch expansions.

- `wellcome-zuph7pum` - `Ortus sanitatis.`
- `wellcome-t4jc2wma` - `Isagoges in rem herbariam libri duo / [Adriaan van de Spiegel].`

Notes:

- The rights status remains allowlisted as `pdm`.
- The current official text endpoint recorded in the registry is `https://api.wellcomecollection.org/text/v1/b12954500`.
- The additional official text endpoint now failing in the same way is `https://api.wellcomecollection.org/text/v1/b12062820`.
- As of 2026-06-17, both works have been recovered into the active corpus by resolving their copy-level IIIF manifests, downloading the official Wellcome PDF rendering, and applying local OCR to that official PDF.
- `wellcome-zuph7pum` recovered from copy manifest `b12954500_0003`.
- `wellcome-t4jc2wma` recovered from copy manifest `b12062820_0002`.
- The original text endpoints still return `404`, so this quarantine folder remains useful as provenance for the earlier failure mode.
- There are now no active Wellcome `download_failed` works in the corpus.
