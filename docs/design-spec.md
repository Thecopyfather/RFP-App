# Visual design specification

## Direction and palette

Create a premium illustrated business adventure with a warm editorial reading surface, tactile decisions and compact game feedback. The story remains the focus. Avoid corporate dashboard grids, fantasy ornament and dense resource panels.

| Token | Value / intent |
| --- | --- |
| Paper | `#F7F1E8`, warm cream for the main reading surface. |
| Accent | `#C96F43`, burnt orange for emphasis and selected actions. |
| Ink | Dark charcoal, approximately `#2B2926`, for narrative and controls. |
| Secondary colors | Muted sage, ochre and dusty blue for secondary illustration and status details. |
| Gain/loss | Distinct symbols, signed amounts and text in addition to color. |

Use a readable serif for narrative and headings, with a clean sans-serif for controls, numbers and metadata. Prefer locally available or self-hosted open-source fonts. The interface must remain attractive with system font fallbacks and without network access.

Body copy should start around 18px with generous line height and a restrained desktop reading measure. Preserve original emphasis and paragraph structure where extractable; do not rewrite long paragraphs into summaries. Decorative labels and interface explanations must be distinguishable from manuscript text.

## Screen behavior

- **Main menu:** expressive Roll For Profit wordmark, subtitle, New Game, Continue, How to Play and Settings. Continue reflects actual saved-state availability. Replacing progress requires a deliberate restart interaction.
- **Character creation:** five visible 1d6 attribute results, original perk descriptions, three selectable mentor cards and a final summary. Show each rule’s contribution to final attributes and Capital. Do not add unlimited rerolls, stat trading or other unapproved character rules.
- **Adventure:** section number/heading, optional reusable illustration, original narrative, ordered full-width decisions and any required dice interaction. A compact status strip shows Capital and access to the character sheet without crowding the reading column.
- **Character sheet:** five attributes, current Capital, mentor/passive/power availability, perk and current progress. Present information in a responsive drawer or dedicated view with an obvious return action.
- **Dice result:** distinct individual dice, base sum, named modifier(s), final total and original outcome explanation. Animate only the reveal of a committed result. Offer applicable mentor abilities at the rule-defined point before finalizing their consequence.
- **Ending:** original authored ending text and character summary, with restart. Bankruptcy has a clear cause and final balance. A prototype boundary is labelled as development scope and must not masquerade as victory or an authored ending.

On small screens use a single column, touch targets of at least 44px, comfortable bottom spacing and no required horizontal scrolling. Desktop width may reveal a secondary stat area but must retain a readable story measure. Narrative must never sit under fixed controls.

## Motion and accessibility

Use brief scene fades, small button responses, subtle dice movement and concise signed Capital feedback. Do not delay gameplay behind long animations. Respect `prefers-reduced-motion`; all state changes and outcomes remain understandable without motion.

Support keyboard operation, visible focus, labelled controls, meaningful headings, focus placement after navigation and screen-reader announcements for committed dice/Capital changes. Test at 320–430px widths and enlarged text. Check contrast for every foreground/background pair; burnt orange alone does not guarantee readable white small text. State and eligibility must never rely on color alone.

## Illustration system and source assets

The manuscript’s reusable embedded artwork is its **character-sheet image** on physical PDF pages 243–245, including the existing branding. It is a source asset for a downloadable/reference sheet and brand inspection. It is not a scene illustration and must not be presented as newly commissioned game art.

Each scene-asset entry records its ID, intended sections, source, status (`source`, `placeholder`, or future commissioned art), alternative text, aspect ratio and focal point. Several sections may share one appropriate composition. Decorative CSS/SVG placeholder compositions are acceptable when clearly labelled as placeholders and when they contain no invented narrative facts.

No external copyrighted image search, random stock photography or unapproved final AI scene art is needed for this prototype. Source-page extraction must preserve the author’s artwork and attribution. Record any future generated asset’s status and obtain the author’s approval before calling it final.

## Asset briefs for later artwork

| Asset | Intended use | Brief |
| --- | --- | --- |
| Startup desk | Opening and main menu | Warm editorial illustration of a notebook, laptop and cold coffee; ample negative space for the original title. No added slogans or readable fictional business content. |
| Office cubicle | Section 1 | Fluorescent office, laptop and coffee, with the mood of an entrepreneur considering a first move. Match facts in the section without adding characters or plot. |
| First commitment | Sections 2–3 | Reusable home-working/business-start composition. Represent the tension between a job and a side project through objects and layout rather than invented events. |
| Guru course | Section 4 and related early choices | Satirical online-course laptop composition, with no real personality, third-party brand or rewritten quotation. |
| Funding decisions | Early funding sections and 31–33 | Notebook, calculations and modest desk setting. Avoid implying a particular reward before the player resolves its roll. |
| Mentor: Bootstrapper | Mentor selection | Resourceful, grounded entrepreneur; warm, practical shapes and frugal workspace. Personality derives from the original profile. |
| Mentor: Hustler | Mentor selection | Energetic entrepreneur and coffee; lively composition without introducing story action. |
| Mentor: Deal Maker | Mentor selection | Poised, personable entrepreneur; restrained networking cues. Do not assign biographical details absent from the profile. |
| Setback | Bankruptcy/result presentation | Quiet desk and subdued light, with no comedic text that overwrites the author’s ending. |

Use a consistent cream/orange/charcoal palette, textured flat shapes and restrained line work. A 16:9 composition with a safe central crop should work across mobile and desktop. Placeholders should make the application cohesive while leaving future art easy to replace.
