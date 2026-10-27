# Implementation decisions and author rulings

## Fidelity and prototype boundary

The 245-page PDF is the sole source of story text and mechanics. The source identity and SHA-256 are recorded in [the source manifest](../manuscript/source.json). No source text is silently corrected. Executable interpretations are separate from the preserved extraction.

The prototype encodes 19 sections: **1–10, 24, 27, 31–33, 83–85, 280**. This provides the opening, original character creation, several dice branches and their consequences. Other original destinations are explicitly labelled prototype boundaries. The complete 284-section extraction is available for analysis, but does not make those sections mechanically playable.

Normal prototype paths reach a boundary or bankruptcy. Section 280 and victory-threshold handling are present, but the current ordinary paths cannot accumulate $10,000. Do not claim a complete victory route in this vertical slice.

## Author-approved interpretations

These rulings were supplied during the adaptation discussion. They clarify executable behavior while leaving the original manuscript export unchanged.

| Topic | Approved implementation |
| --- | --- |
| Section 4 course purchase | Check affordability **before** charging. An affordable purchase costs **$997 once**, on entry to the purchased-course path. Record the purchase so the same event cannot charge twice. Unaffordable players receive the original free-resource/borrowing choices. |
| Bootstrapper passive | Reduce an ordinary adverse Capital loss by $100, with the reduced loss floored at zero. Do not discount purchases or instructions to lose all Capital. The original +1 RE mentor passive remains applicable. |
| Shoestring Miracle eligibility | The **modified check total** must be 6 or below and a Capital loss must be pending. The ability is optional and usable once per Act. |
| Shoestring Miracle resolution | Reroll the check, use the new outcome branch, and suppress the applicable Capital loss even if the reroll still fails. Do not substitute a guessed fixed result. |
| Grind It Out | On a failed check that would lose Capital, optionally halve the amount lost and round the amount still lost **up to the nearest $100**. This consumes the once-per-Act power. |
| The Big Play eligibility | Offer only for a **failed check**. A normal middle outcome is not eligible merely because it has a penalty. |
| The Big Play resolution | Use the check’s existing middle outcome and its destination. Treat the whole event as neutral: suppress Capital **and attribute** changes, including destination-entry effects belonging to that outcome. Do not invent a fourth destination or outcome. |
| Ordinary middle result with Deal Maker | The ability is not offered or consumed. For example, an ordinary mixed result of 10 leading to section 32 is resolved normally; it is not automatically neutralized. |
| Mentor powers | All three powers are optional and may be used once per Act. Do not consume a power merely because it is eligible or declined. |
| Restart | Start a fresh character-creation run: reroll the original five attributes, choose a perk and mentor, restore starting resources and clear run-specific progression/power consumption. |

Future loop reward frequency and the repeated effects identified in the full-book audit remain **unresolved**. The prototype does not implement those loops. Do not claim that once-per-action protection is an author-approved once-per-run reward policy.

## Manuscript rules and technical defaults

These are direct source rules or implementation choices, not additional author approvals:

- Start with $1,000 Capital (physical PDF pp222 and 224). Investor-Backed adds $1,000 and applies its original −2 RE.
- Roll one d6 for each starting attribute. Apply the selected original perk and mentor passive. The manuscript does not state attribute floors or caps, so attributes use signed integer arithmetic; an Investor-Backed character can have negative RE. Do not silently clamp it to zero or one.
- Use each section’s printed dice formula and outcome bands. The appendix’s generic 11+/8–10/≤7 explanation does not erase local tables such as section 21’s critical-success band or section 284’s unmodified final roll.
- Capital of zero or below means the character has run out of Capital and the run ends, after resolving any eligible optional mitigation. Negative balances are not silently treated as debt-based continuing play.
- At $10,000 or more, follow the original immediate transition to section 280 unless a section explicitly provides an exception. Explicit authored endings elsewhere in the full book require source-specific implementation rather than a guessed override.
- React components dispatch engine commands. Only the engine resolves dice, modifiers, effects, affordability and eligibility.
- Generate unbiased random dice with Web Crypto and rejection sampling. Animation displays recorded dice; it never determines them.
- Run/command IDs use the native UUID API when available, with a Web Crypto random-byte UUID fallback for LAN HTTP browsers where that API is absent. Never substitute `Math.random` for secure dice or identifiers. The fallback regression tests passed in the recorded green CI baseline below.
- Save committed state and dice, then animate their reveal. Use stable event/action identities to reject duplicate delivery, including double taps, remounts and reloads.
- Keep one initial local save in the current browser. Report invalid saves and unavailable storage visibly. No accounts, cloud synchronization, analytics, paid dependencies or external database are needed.
- Full-book extraction evidence is marked `extracted-unreviewed`. This means preserved text and detected references, not completed semantic verification.

The five original perks (physical PDF pp12–13) are:

| Perk | Original effect |
| --- | --- |
| Born Closer | +2 TA |
| Marketing Genius | +2 CR |
| Hustler’s Work Ethic | +1 RE and +1 NE |
| Charismatic Leader | +2 NE |
| Investor-Backed | +$1,000 starting Capital and −2 RE |

The mentors additionally supply their original passive attributes: Bootstrapper +1 RE; Hustler +2 RE; Deal Maker +2 NE. Section-specific mentor bonuses apply where the printed section says so; they are not substituted for the passive.

## Acceptance checklist

The checklist records the green [GitHub Actions run 40556710722](https://github.com/Thecopyfather/RFP-App/actions/runs/40556710722), [job 122374591728](https://github.com/Thecopyfather/RFP-App/actions/runs/40556710722/job/122374591728), at commit **`48f7f2d36e3c6bd2e2cdaaa678c94c5be7862e11`**. A checked item is backed by that completed run or the stated earlier analysis, not implementation intent alone.

| Check | Recorded status |
| --- | --- |
| Extract all 245 physical pages and 284 numbered sections | Source exports created; extraction is explicitly unreviewed. |
| Complete-source numeric destinations | PASS: validator reports 284 sections, 738 references and 0 errors. Prototype: 19 scenes, 56 references, 39 declared boundary references. |
| Report unreachable sections and profitable loops | Documented in the manuscript audit and branching report. |
| Native headless engine checks | PASS on Node 24.19.0: 11 suites, 1,904 assertions, 0 failures. Run `npm run test:native`. |
| Vitest unit and integration suites | PASS: 84 tests, including eight secure-ID regression cases. |
| Playable choice/dice paths against the manuscript | PASS: graph destinations and source-fidelity checks; native engine exercises all 144 ordered dice pairs across four checks. |
| Perks and all mentor passive/power cases | PASS in native checks, including all 15 perk/mentor combinations. |
| Affordability, Capital, stat calculations and bankruptcy | PASS in native checks, including zero and negative balances and the victory threshold. |
| Duplicate commands and refresh during dice | PASS: native state/idempotency checks and browser reload retain committed dice and consequences. |
| Save/load and malformed/incompatible saves | PASS: Vitest validation and browser save/resume/invalid-save recovery scenarios. |
| Unavailable browser storage | PASS: browser scenario keeps the run playable in memory with an explicit save warning. |
| Mobile and desktop setup/play | PASS: 18 development-browser checks across the baseline 390px mobile and 1440px desktop Chromium projects. The new 320px project is tracked by the current PR checks. |
| Keyboard operation and reduced motion | PASS for the automated settings, focus, Escape-dismissal and preference-persistence scenarios; this is not a complete manual accessibility audit. |
| Production TypeScript/Vite build | PASS after correcting TS2345 UUID parameter inference. |
| Production service worker, offline reload and manifest | PASS within eight production PWA/LAN browser checks, including cached fonts/assets and persisted dice. |
| Phone-style private LAN HTTP preview | PASS: secure-ID fallback tests and automated HTTP LAN browser scenario. Plain HTTP LAN is not a guarantee of PWA installation or offline caching. |
| Dependency audit | Zero vulnerabilities reported in the green baseline, after updating Vitest to 4.1.12. Use the committed lockfile with `npm ci`; future audits can change. |
| Public deployment / PR merge | Not authorized; keep changes on the draft branch and PR unmerged. |
| Victory route attainable through ordinary prototype play | No; deliberately outside the current vertical slice. |
| Entire original game mechanically implemented/verified | No; remaining work. |

Initial local dependency installation was blocked by network `EPERM` to the session proxy. The [initial GitHub Actions run 40553456742](https://github.com/Thecopyfather/RFP-App/actions/runs/40553456742) passed the original 76 Vitest tests before exposing a TypeScript inference issue in UUID-defaulted identifiers. That failure was corrected; the later green baseline records the passing build, all 84 unit tests, and completed development/production browser scenarios.

The current configuration runs **27 development-browser checks and 12 production PWA/LAN checks** across **320px, 390px and 1440px Chromium projects**. The baseline above ran 18 + 8 checks before adding the 320px project; do not describe the expanded 39-check matrix as passed based on that earlier run. Consult [the latest PR checks](https://github.com/Thecopyfather/RFP-App/pull/1/checks) for the current commit’s result. Browser automation is not a claim of complete device/Safari coverage, full-game verification or physical-phone installation testing.

The draft implementation lives on `codex/startup-prototype` in [RFP-App](https://github.com/Thecopyfather/RFP-App), with [draft PR #1](https://github.com/Thecopyfather/RFP-App/pull/1). The user has explicitly excluded public deployment and PR merging. A local preview on the user’s computer and trusted Wi-Fi is documented in [private-preview.md](private-preview.md); no public tunnel, router forwarding, hosted preview or private HTTPS provisioning is part of that procedure.

## Next implementation stages

Add reviewed groups of original sections to the executable content, write tests for their actual consequences, and retain explicit boundaries until each destination is ready. Resolve material full-book audit questions before implementing affected paths. Replace labelled illustration placeholders with approved assets through the shared illustration manifest. Validate complete end-to-end win/failure routes and production offline behavior before calling the full adaptation complete.
