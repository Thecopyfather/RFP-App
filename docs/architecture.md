# Architecture and structured game data

## Requirements and separation of responsibilities

The prototype adapts the original game text and mechanics into a React/TypeScript application built with Vite. Tailwind supplies styling and Motion supplies restrained interface animation. It runs locally, saves locally, and needs no backend or paid provider. A PWA manifest and service-worker architecture prepare the application for mobile installation and offline production use.

The engine is independent of React, the DOM, animation, and local storage. The same content model and state transition functions can drive another interface or interactive game. UI components display engine state and dispatch commands; they do not calculate their own Capital, apply prose-derived effects, or determine dice outcomes.

Four layers have separate responsibilities:

| Layer | Responsibility |
| --- | --- |
| Source extraction | Preserve the complete PDF text, original numbered sections, source pages, evidence and branch references. |
| Executable content | Encode reviewed choices, requirements, dice, effects and endings for the playable subset. |
| Headless engine | Validate commands, resolve random inputs, apply approved rules, maintain progression and produce the next state. |
| Browser adapters and UI | Store validated saves; render menus, setup, narrative, decisions, character sheet, dice and ending/boundary states. |

## Source database and provenance

The `manuscript/` exports are evidence, not a claim that the entire book has executable coverage:

- `source.json`: original PDF identity, SHA-256, 245-page count and extraction metadata.
- `pages.json`: the complete text extraction by physical PDF page.
- `sections.json`: all 284 numbered headings and section bodies, physical source pages, referenced destinations, and extraction/review status.
- `branching.json`: numeric branch references and graph statistics.

Physical PDF pages and story section IDs are different fields. Printed page labels are also distinct: in this copy they are generally one lower than the physical PDF page. Front matter, rules, mentors, glossary and other reference material stay in the full-page source export even when they have no numbered section ID.

Paragraph wrapping may be normalized for presentation, but punctuation, words, humour, headings and ordering must be checked against the PDF. A typography or extraction correction must have source evidence. New narrative and guessed rules are not allowed.

## Executable content contract

The following is the conceptual data model. Exact TypeScript names may differ, but these responsibilities must remain explicit.

| Record | Required information |
| --- | --- |
| Game definition | Game/content version, attribute definitions, setup rules, perks, mentors, available sections and source identity. |
| Section | Original ID, heading, text blocks and source pages; ordered interactions; entry effects; optional illustration reference; ending/boundary behavior. |
| Choice | Stable ID, original text, actual destination, eligibility and any explicit effects. |
| Dice check | Die count/sides, attribute modifier, any local mentor modifier, complete outcome ranges, original outcome explanations and destination/effects. |
| Condition | A typed predicate over mentor, perk, attributes, Capital or documented progression. |
| Effect | A typed Capital/stat/progression operation with identity, trigger and application scope. Purchases and adverse losses remain distinguishable. |
| Illustration | Stable asset ID, source/placeholder status, file or decorative composition, alternative text and suitable scene references. |
| Audit issue | Evidence, section/page, severity, impact, author question and resolution status. |

Effects are structured data; the engine never scans rendered prose to infer commands. A condition and its explanatory UI text must derive from the same rule. Original links beyond the executable subset are valid source destinations and explicit prototype boundaries, not missing-reference errors.

The five attributes are Creativity (`CR`), Tactics (`TA`), Resilience (`RE`), Networking (`NE`) and Tech Savviness (`TS`). Their base 1d6 results, perk effects, mentor passives and later changes must remain distinguishable enough to explain the displayed total.

## Runtime state, dice and persistence

State needs a run identifier, setup progress, character identity, attribute values, Capital, selected perk and mentor, current section, interaction phase, relevant flags, consumed mentor power, committed dice/outcome records and applied event identities. Save metadata includes schema/content versions so incompatible data can be handled visibly instead of silently reinterpreted.

The engine accepts explicit commands such as roll an unset starting attribute, select a perk, select a mentor, complete setup, choose a decision, perform a check, accept or decline an eligible mentor power, and restart. Invalid or already-applied commands cannot award additional effects.

Production dice use `crypto.getRandomValues` with rejection sampling before mapping to 1–6. Simple modulo of an arbitrary random integer is insufficient for unbiased results. Tests inject deterministic values. Each result retains individual dice, the attribute and local modifiers, the final total, selected band and original outcome explanation.

Roll resolution and effects are committed before the visual reveal completes. The animation reveals the recorded result; it is not another source of randomness. Saving and resuming an unresolved interaction restores its phase and recorded result. Repeated UI dispatches, React remounts and refreshes cannot apply one event twice.

An event being applied once is distinct from a later legitimate visit. Revisit policy follows the documented author rulings, and the full-book positive cycles remain audit findings. Globally making every reward once per run would change the game.

The browser storage adapter serializes the whole validated state after committed gameplay and setup actions. It reports unavailable/quota-exceeded storage and malformed or incompatible saves. It must not silently discard a save. There is one initial local run, with deliberate restart starting a new run; cross-device synchronization is outside this prototype.

## Verification and expansion

The full-source graph validator checks section identities, numeric destinations, reachability and cycles independently of playable coverage. The playable-content validator checks every executable destination or explicit boundary and the complete dice outcome ranges. A valid full-source graph does not prove the text’s mechanics are consistent.

Engine tests cover deterministic dice boundaries, calculations, perks, mentor conditions/powers, affordability, Capital, endings, navigation, idempotence and save round trips. Browser tests cover the complete setup-to-adventure loop, dice feedback, reload/resume, boundaries, bankruptcy, character information, mobile layout and keyboard/reduced-motion behavior.

Further sections should be added in reviewed groups with source-linked expected outcomes. Do not recursively implement every outgoing destination merely to conceal scope: the complete graph contains large interconnected components. Before a full-book release, resolve the audit’s material questions and verify each encoded interaction against its source.
