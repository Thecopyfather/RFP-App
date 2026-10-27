# Roll For Profit: The Startup Phase

A local-first, mobile-first adaptation of Mark “The Copy Father” Kington’s gamebook. This repository contains an initial playable prototype and a separate extraction of the complete 245-page source PDF. It is **not the complete digital game**.

## Run locally

Use a current Node.js LTS release and npm. From this directory:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. For a production preview:

```sh
npm run build
npm run preview
```

## Validate

```sh
npm test
npm run test:native
npm run validate:story
npm run build
npm run test:e2e
```

Browser tests require the Playwright browser runtime. If it is not installed, install the browser requested by the test runner using Playwright’s documented installation command. See [the acceptance checklist](docs/implementation-decisions.md#acceptance-checklist) for the recorded validation status; the commands above are instructions, not a claim that they have already passed on every machine.

Native engine checks require Node 24 or later and run without installing packages: **11 suites and 1,904 assertions passed**. The branching validator also passed with zero errors. Full Vitest, build, browser, and offline verification remain pending because dependency installation was blocked by this workspace’s network permissions. The complete verification workflow is included in `.github/workflows/verify.yml`.

## What is playable

The mechanically encoded subset contains **19 sections**: **1–10, 24, 27, 31–33, 83–85, and 280**. It includes character creation, all five original perks, the three original mentors and their approved abilities, individual animated dice, automatic attributes and Capital, a character sheet, local saving/resuming, and restart.

Choices leaving this subset retain their original wording and destination number. They stop at an explicitly labelled **prototype boundary**, rather than navigating to an absent scene or displaying invented story text. Normal play currently reaches a boundary or bankruptcy. The original section-280 victory renderer and threshold logic are included, but **$10,000 is not reachable through the current prototype’s ordinary paths**.

The source extraction contains all **284 numbered sections**, with original text, source-page references and numeric destinations. Extraction and graph validation do **not** establish that every full-book rule has been translated into executable mechanics. Only the playable subset has that implementation scope.

## Saves and offline use

Progress is stored in this browser’s local storage. Saves stay on the current device/browser; there is no account, cloud sync, database, analytics, or paid service. Clearing site data removes local saves. The PWA structure supports installation and a cached production app after its initial load; development-server behavior is not an offline guarantee.

Committed dice and effects are saved as game state, so refreshing during an animation does not generate a new roll or award the same effect again. Deliberate manuscript revisits remain distinct from duplicate delivery of one action.

## Source and documentation

- [Source identity and checksum](manuscript/source.json)
- [Manuscript integrity audit](docs/manuscript-audit.md)
- [Complete branching graph report](docs/branching-graph.md)
- [Architecture and data model](docs/architecture.md)
- [Visual design and illustration briefs](docs/design-spec.md)
- [Implementation decisions and author rulings](docs/implementation-decisions.md)

The PDF is the single source of story content. Author-approved interpretations are documented separately and do not rewrite the source extraction. Unresolved full-book inconsistencies remain visible in the audit.

Remaining work includes the rest of the executable story, resolution of outstanding manuscript questions, commissioned scene artwork, broader device testing, and complete path verification. The extracted manuscript remains the author’s copyrighted work; its inclusion here is for this adaptation.
