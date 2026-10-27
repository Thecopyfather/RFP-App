# Manuscript integrity report

## Source, coverage and limits

Source: **Roll For Profit_ The Start Up Phase (A5 Print Version) (2).pdf**, title metadata **Roll For Profit: The Start Up Phase (A5 Print Version)**, **245 physical PDF pages**. The exact source SHA-256 and extraction tool/version are recorded in [source.json](../manuscript/source.json).

The complete PDF has been read across the analysis team. Full-page text, all numbered section text and a numeric branching graph have been extracted. The manuscript contains **284 unique numbered sections, 1–284**. Physical PDF page numbers, printed page labels and numbered story sections are not interchangeable; all page citations below are **physical PDF pages**.

This is a structural and initial semantic audit. Full-source records are marked `extracted-unreviewed`: the complete executable translation of all full-book mechanics has **not** been verified. The playable prototype is a separate, mechanically encoded 19-section subset. See [implementation decisions](implementation-decisions.md) for author-approved rulings and current scope.

## Structural results

| Check | Finding |
| --- | --- |
| Section identifiers | 284 unique IDs, with none missing from 1–284. |
| Explicit numeric references | 738 occurrences, representing 735 distinct source/destination pairs. |
| Restart references | Including authored non-numeric restart instructions gives 742 reference occurrences / 739 distinct pairs. |
| Missing numeric destinations | None detected in the complete extracted database. |
| Unreachable from section 1 | **43, 153, 159, 160**. Sections 43 and 153 have no incoming story links; 159 and 160 are entered only from unreachable 43. |
| Unrecognized dead ends | None detected by the structural extraction. Explicit endings remain distinct from ordinary outgoing links. |
| Cycles | Non-reset strongly connected components have sizes 155, 2, 2 and 2. The isolated two-section components are 39↔147, 134↔161 and 176↔199. Cycles require review; a cycle alone is not an error. |

The [branching report](branching-graph.md) and validation script reproduce the graph findings. Graph reachability does not imply that a conditional path is mechanically achievable with a particular character.

The profitable 170↔198 loop is contained within the large 155-section component. It is a simple loop, not a separate maximal strongly connected component.

## Material open gameplay questions

**Open** means a full-book implementation must obtain a ruling or preserve an explicit boundary. **Prototype clarified** refers only to the recorded author ruling; it does not silently amend the source PDF.

| ID / status | Evidence | Impact and decision required |
| --- | --- | --- |
| A01 — Open | §104, pp95–96, optional All In Gamble specifies 10+ and 6 or less but no 7–9 result. | A legal modified result has no stated outcome. Specify the middle result and whether the normal $3,000 gain follows it. |
| A02 — Open | §112, pp100–101: “Lose $1,000”; optional 10+ “Gain $3,000 … instead of losing $1,000”; 7–9 “You recover $500.” | Determine the middle result’s net Capital and whether the initial loss is provisional until the optional gamble resolves. Otherwise bankruptcy timing can prevent the offered recovery. |
| A03 — Open | §92, pp87–88, grants mentor-dependent benefits for the “next” applicable roll/spend. | Define qualifying sales/marketing/negotiation/expense checks, timing, consumption and whether an ineligible check leaves the benefit available. |
| A04 — Open | §15, pp24–26, loses $4,997 on outcomes leading to §§50–51; §§50–51, pp53–55, explicitly lose $4,997 again. | Are these two separate charges or one repeated description? Literal cumulative cost is $9,994 before other effects. |
| A05 — Open | §50, pp53–54, grants +1 TA; every successor, §§182–184, pp147–149, says TA “have permanently increased by +1.” | Is the successor text a reminder or an additional increase? |
| A06 — Open | §51, p55, grants +1 NE; §185, pp149–150, explicitly grants +1 NE for the contact. | Confirm cumulative +2 NE versus repeated narration of one increase. |
| A07 — Open | §134, p115 (+$2,000) → §161, p133 → §134. | Guaranteed reward loop if each re-entry grants the reward. Specify reward frequency or the intended link; do not silently suppress it. |
| A08 — Open | §170, pp138–139 (+$4,000) → §198, p161 (−$1,000) → §170. | Guaranteed net +$3,000 per circuit. Confirm revisit semantics/intended destination. |
| A09 — Open | §176, pp142–143 (+$4,000) → §199, p161 → §176 “choose again.” | Guaranteed +$4,000 per circuit. §199 mentions wasted money but supplies no amount; do not invent a loss. |
| A10 — Open | §140, pp119–120, failed check loses $2,000 → §236, p188, which loses another $2,000 for failed crowdfunding. | Confirm intended total loss and whether the marketing-to-crowdfunding destination is correct. |
| A11 — Open | §245, p194: +$3,000→258 (+$3,000); +$1,000→259 (+$1,000); −$2,000→260 (−$2,000), pp203–205. | Confirm whether source and destination amounts are cumulative or repeated descriptions of the same result. |
| A12 — Open | §§224–225, pp178–179, and §229, pp182–183, apply outcome changes before destinations §§243–244 and 246 apply more Capital. | Confirm cumulative effects individually; a global deduplication guess would alter legitimate sequential rewards. |
| A13 — Open | §270, p211, failure loses $1,000 → §283, pp219–220, another $1,000 loss. | Confirm total $2,000 loss versus repeated accounting. |
| A14 — Open | §254, pp200–201, success gains $3,000→260; §§274–275, pp214–215, also send successes to260. §260, p205, opens “The bold launch? It flopped” and loses $2,000. | Success prose leads to a failed-launch consequence. Confirm links and intended additional losses. |
| A15 — Open | §§270–271, pp211–212, send success directly to victory §280; §284, pp220–221, declares a win for +$5,000 as well as +$10,000. | Appendix pp222–224 establishes the $10,000 threshold and allows explicit section exceptions. Confirm how these explicit authored victories interact with an actual balance below $10,000. Do not replace them with guessed threshold checks. |

## Narrative continuity and rule-encoding review

These findings are retained as source issues. They are not invitations to rewrite the author’s prose.

| Evidence | Review finding |
| --- | --- |
| §165, p135, “Focus on expanding your circle and meet as many new people as possible” → §143, pp121–122. | Destination instead describes urgently repaying an investor/family member. |
| §§170–171, pp138–139 → §173, pp140–141. | Generic viral-content outcomes enter a story assuming a public confession about a guru scam. |
| §235, pp187–188, audience survey → §182, pp147–148. | Destination assumes an overpriced-course purchase and a useful tactic from it. |
| §236, p188, crowdfunding recovery → §182, pp147–148. | Same course-purchase prerequisite mismatch. |
| §247, pp195–196, mentor help with investor pressure → §186, pp150–151. | Destination assumes nearly $5,000 was lost buying a course. |
| §245, p194, reached from §§233 or246. | Negotiation/debt-collection setup may not match the incoming path. |
| §209 and §238 failure → §240, pp190–191. | Failed outreach/ad spending leads to “Strong Systems” context. |
| §260, p205. | Upbeat heading “Hitting $10K – Almost There!” precedes a failed-launch narrative and loss. |
| §70, pp70–71. | Contains two TA checks: an initial 7+/≤6 test and a later 11+/8–10/≤7 table. Preserve both until their sequencing is reviewed; do not collapse the section to one generic roll. |
| §§119,123,124, pp107–111. | Spending/funding is sometimes described without a numeric amount. Do not invent an expenditure, award, equity percentage or crowdfunding target effect. |
| §§98→74 and99→77. | Adjacent rewards may be legitimate cumulative gains. Repeated prose/effect detection is an audit prompt, not permission to deduplicate every reward pair. |

## Prototype clarifications and direct rules

The author has clarified the section-4 $997 purchase, the mentor powers’ eligibility/effects, optional once-per-Act use and fresh-character restart. The exact approved behavior is preserved in [implementation decisions](implementation-decisions.md#author-approved-interpretations).

- Section4’s affordability test precedes its once-only $997 purchase charge. Bootstrapper’s adverse-loss reduction does not discount a purchase.
- Bootstrapper reduces ordinary adverse losses by $100, floor zero; its reroll power requires a modified total ≤6 with a pending Capital loss.
- Hustler’s power halves a failed-roll Capital loss and rounds the remainder up to the nearest $100.
- Deal Maker’s power is available only on a failed check and uses the existing middle branch, neutralizing that event’s Capital and stat effects, including its destination-entry consequences. Normal mixed results are unchanged.
- Restart returns to fresh character creation. No future-loop reward-frequency policy has been approved.

Other source facts must not be mistaken for contradictory rules or invented approvals:

- Appendix pp222 and224 specifies $1,000 starting Capital and immediate section280 at $10,000 unless the section explicitly says otherwise.
- Appendix p224 says zero Capital ends the run; the application treats zero or negative Capital as running out, after applicable optional mitigation.
- Attributes have no documented floor or cap. Preserve signed arithmetic rather than imposing a familiar RPG convention.
- Local printed dice tables take precedence for their own checks. Section21’s 12+/10–11/7–9/≤6 and section284’s unmodified 10+/7–9/≤6 are explicit tables, not automatically appendix errors.
- In §137, p118, $3,000 normally or $4,000 with Hustler are alternative totals. The preceding “extra $1,000” explanation is not an additional third award.
- In §85, pp82–83, the narrative and explicit instruction refer to one $1,000 loss; similarly §107, p98, describes one $500 loss twice. Do not double-charge narrative restatements.
- Section228, pp181–182, explicitly permits bypassing its roll to push harder on sales→109. Optional interactions must be offered before committing their dice.

## Extraction and illustration notes

Headings use both periods and colons. Links may wrap between “Go” and “to,” and page breaks may split section bodies or outcomes. Section284 spans physical pages220–221. A parser must recognize genuine heading lines before normalizing whitespace, or a wrapped destination such as `104.` can be mistaken for a new heading.

Not every bullet is a choice. Narrative examples, optional-roll explanations, nested choices after an outcome and mentor-specific forced routes need separate semantic treatment. Do not turn ordinary bullets into buttons or flatten multiple checks into a single roll.

The extracted source artwork is the branded character-sheet image repeated on physical pages243–245. It is suitable for source reference/download and brand inspection. It is not a collection of scene illustrations. New scene artwork is represented by labelled placeholders and briefs in [the design specification](design-spec.md).

## Required verification before a complete release

Resolve material open questions with the author; encode every check, choice, condition, optional gamble and effect with source evidence; verify all legal outcome totals and event ordering; exercise authored win/restart/failure routes; and test save compatibility as content expands. Re-run graph validation after each source update and compare the source checksum. No complete-game claim is justified by extraction or successful graph validation alone.
