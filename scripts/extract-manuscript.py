#!/usr/bin/env python3
"""Extract the supplied Roll For Profit PDF without interpreting unresolved rules.

Requires Python 3.10+ and PyMuPDF (``python -m pip install PyMuPDF``).
Usage: python scripts/extract-manuscript.py /absolute/path/to/manuscript.pdf

The exact PyMuPDF text of every physical page is retained in pages.json. The
section view removes only identified printed page footers. It preserves wording,
punctuation, line breaks and PDF text artifacts, including zero-width characters.
Evidence matches are extraction aids, never executable rule interpretations.
"""

from __future__ import annotations

import argparse
from bisect import bisect_right
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import sys

try:
    import fitz
except ImportError:
    raise SystemExit("PyMuPDF is required: python -m pip install PyMuPDF")


HEADING = re.compile(r"^[ \t]*(\d+)[.:][ \t]+([^\n]+)")
REFERENCE = re.compile(
    r"\b(?P<verb>go(?:\s+back)?\s+to|head\s+to|restart\s+from\s+section|"
    r"turn\s+to\s+section|turn\s+the\s+page\s+to|turn\s+to\s+begin|"
    r"turn\s+to\s+your\s+final\s+roll\s+of\s+act\s+1)\s+(?P<target>\d+)",
    re.IGNORECASE,
)
RESTART = re.compile(r"\brestart\s+Act\s+1\b", re.IGNORECASE)
EVIDENCE_PATTERNS = {
    "dice": r"\bRoll\s+[12]d6(?:\s*\+\s*(?:Creativity|Tactics|Resilience|Networking|Tech\s+Savviness)\s*\([A-Z]{2}\))?",
    "capital": r"\$[\d,]+(?:\.\d+)?|\b(?:all|no)\s+Capital\b",
    "attributes": r"\b(?:Creativity|Tactics|Resilience|Networking|Tech\s+Savviness)\b|\((?:CR|TA|RE|NE|TS)\)",
    "mentors": r"\bThe\s+(?:Bootstrapper|Hustler|Deal\s+Maker)\b",
    "perks": r"Born\s+Closer|Marketing\s+Genius|Hustler[’']s\s+Work\s+Ethic|Charismatic\s+Leader|Investor[–-]Backed",
    "conditions": r"\b(?:if|unless|otherwise)\b",
    "gambles": r"\b(?:optional\s+gamble|[\w–-]+(?:\s+[\w–-]+){0,3}\s+gamble)\b",
    "endings": r"\brestart\b|\byou\s+win\b|\bgame\s+over\b|\band\s+you\s+win\b",
}


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def source_excerpt(text: str, start: int, end: int) -> str:
    return text[max(0, start - 130): min(len(text), end + 150)]


def strongly_connected(graph: dict[str, list[str]]) -> list[list[str]]:
    indices: dict[str, int] = {}
    low: dict[str, int] = {}
    stack: list[str] = []
    on_stack: set[str] = set()
    result: list[list[str]] = []

    def visit(node: str) -> None:
        indices[node] = low[node] = len(indices)
        stack.append(node)
        on_stack.add(node)
        for target in set(graph[node]):
            if target not in graph:
                continue
            if target not in indices:
                visit(target)
                low[node] = min(low[node], low[target])
            elif target in on_stack:
                low[node] = min(low[node], indices[target])
        if low[node] == indices[node]:
            component = []
            while True:
                member = stack.pop()
                on_stack.remove(member)
                component.append(member)
                if member == node:
                    break
            result.append(sorted(component, key=int))

    for node in graph:
        if node not in indices:
            visit(node)
    return sorted(result, key=lambda component: (-len(component), int(component[0])))


def extract(pdf_path: Path, output: Path) -> None:
    pdf = fitz.open(pdf_path)
    source = {
        "fileName": pdf_path.name,
        "sha256": hashlib.sha256(pdf_path.read_bytes()).hexdigest(),
        "pageCount": len(pdf),
        "pdfTitle": pdf.metadata.get("title", ""),
        "extractionTool": "PyMuPDF",
        "extractionToolVersion": fitz.VersionBind,
        "storySectionCount": 284,
        "reviewStatus": "extracted-unreviewed",
        "notes": [
            "The PDF is the sole source of story text and mechanics.",
            "Physical PDF pages, printed page labels, and numbered story sections are distinct.",
            "Evidence matches are not complete semantic rules and must not be executed as mechanics.",
            "No ambiguous rule, destination, or spelling has been silently corrected.",
        ],
    }
    pages = []
    records = []
    for page_index, page in enumerate(pdf):
        raw_text = page.get_text()
        page_lines = []
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                spans = line.get("spans", [])
                line_text = "".join(span["text"] for span in spans)
                is_footer = (
                    bool(re.fullmatch(r"\s*\d+\s*", line_text))
                    and line["bbox"][0] > page.rect.width * 0.75
                    and line["bbox"][1] > page.rect.height * 0.85
                )
                page_lines.append({
                    "text": line_text,
                    "sourcePage": page_index + 1,
                    "isFooter": is_footer,
                    "isHeadingStyle": any(
                        abs(span["size"] - 13) < 0.05 and "Bold" in span["font"]
                        for span in spans if span["text"].strip()
                    ),
                })
        footer = next((line["text"].strip() for line in page_lines if line["isFooter"]), None)
        clean_lines = [line for line in page_lines if not line["isFooter"]]
        records.extend(clean_lines)
        pages.append({
            "physicalPage": page_index + 1,
            "printedLabel": footer,
            "rawText": raw_text,
            "textWithoutFooter": "\n".join(line["text"] for line in clean_lines) + "\n",
            "widthPt": page.rect.width,
            "heightPt": page.rect.height,
            "embeddedImageCount": len(page.get_images(full=True)),
        })

    story_start = next(
        index for index, line in enumerate(records)
        if re.match(r"^1\.\s+The Call to Adventure\s*$", line["text"])
    )
    story_end = next(
        index for index in range(story_start + 1, len(records))
        if records[index]["text"].strip() == "Game Rules & Mechanics"
    )
    story_records = records[story_start:story_end]
    heading_indices = [
        index for index, line in enumerate(story_records)
        if HEADING.match(line["text"]) and line["isHeadingStyle"]
    ]
    ids = [HEADING.match(story_records[index]["text"])[1] for index in heading_indices]
    duplicates = [key for key, count in Counter(ids).items() if count > 1]
    missing_ids = sorted(set(map(str, range(1, 285))) - set(ids), key=int)
    if duplicates or missing_ids or len(ids) != 284:
        raise SystemExit(f"Section headings require inspection: duplicates={duplicates}, missing={missing_ids}, count={len(ids)}")

    sections = []
    for position, start in enumerate(heading_indices):
        end = heading_indices[position + 1] if position + 1 < len(heading_indices) else len(story_records)
        section_lines = story_records[start:end]
        heading_line_count = 1
        while heading_line_count < len(section_lines):
            candidate = section_lines[heading_line_count]
            if not candidate["text"].strip() or not candidate["isHeadingStyle"]:
                break
            heading_line_count += 1
        heading_lines = [line["text"] for line in section_lines[:heading_line_count]]
        body_lines = section_lines[heading_line_count:]
        raw_text = "\n".join(line["text"] for line in section_lines) + "\n"
        text = "\n".join(line["text"] for line in body_lines) + "\n"
        offsets = []
        cursor = 0
        for line in body_lines:
            offsets.append(cursor)
            cursor += len(line["text"]) + 1

        def physical_page(offset: int) -> int:
            index = max(0, bisect_right(offsets, offset) - 1)
            return body_lines[index]["sourcePage"] if body_lines else section_lines[0]["sourcePage"]

        references = []
        for match in REFERENCE.finditer(text):
            verb = re.sub(r"\s+", " ", match["verb"]).lower()
            kind = "restart" if "restart" in verb else "goBack" if "back" in verb else "goTo" if verb.startswith("go") else "turnTo"
            references.append({
                "target": match["target"],
                "kind": kind,
                "explicitTarget": True,
                "sourcePage": physical_page(match.start()),
                "quote": match.group(),
                "context": source_excerpt(text, match.start(), match.end()),
            })
        restart = RESTART.search(text)
        if restart and not any(reference["target"] == "1" for reference in references):
            references.append({
                "target": "1",
                "kind": "restart",
                "explicitTarget": False,
                "sourcePage": physical_page(restart.start()),
                "quote": restart.group(),
                "context": source_excerpt(text, restart.start(), restart.end()),
            })
        evidence = {}
        for category, pattern in EVIDENCE_PATTERNS.items():
            evidence[category] = [
                {"sourcePage": physical_page(match.start()), "quote": match.group(), "context": source_excerpt(text, match.start(), match.end())}
                for match in re.finditer(pattern, text, re.IGNORECASE)
            ]
        heading = "\n".join(line.rstrip() for line in heading_lines)
        title = re.sub(r"^\d+[.:]\s*", "", " ".join(line.strip() for line in heading_lines))
        sections.append({
            "id": ids[position],
            "heading": heading,
            "title": title,
            "headingLines": heading_lines,
            "text": text,
            "rawText": raw_text,
            "sourcePages": sorted({line["sourcePage"] for line in section_lines if line["text"].strip()}),
            "destinationReferences": references,
            "evidence": evidence,
            "reviewStatus": "extracted-unreviewed",
        })

    graph = {section["id"]: [reference["target"] for reference in section["destinationReferences"]] for section in sections}
    seen = set()
    pending = ["1"]
    while pending:
        node = pending.pop()
        if node in seen or node not in graph:
            continue
        seen.add(node)
        pending.extend(graph[node])
    edges = [{"source": section["id"], **reference} for section in sections for reference in section["destinationReferences"]]
    non_restart_graph = {node: [target for target in targets if target != "1"] for node, targets in graph.items()}
    components = strongly_connected(non_restart_graph)
    cyclic = [component for component in components if len(component) > 1 or component[0] in non_restart_graph[component[0]]]
    branching = {
        "schemaVersion": 1,
        "source": source,
        "entrySectionId": "1",
        "sectionIds": ids,
        "edges": edges,
        "statistics": {
            "sectionCount": len(ids),
            "explicitNumericReferenceCount": sum(edge["explicitTarget"] for edge in edges),
            "explicitUniqueEdgeCount": len({(edge["source"], edge["target"]) for edge in edges if edge["explicitTarget"]}),
            "referenceCountIncludingRestarts": len(edges),
            "uniqueEdgeCountIncludingRestarts": sum(len(set(targets)) for targets in graph.values()),
        },
        "missingDestinations": [{"source": edge["source"], "target": edge["target"]} for edge in edges if edge["target"] not in graph],
        "unreachableSectionIds": sorted(set(ids) - seen, key=int),
        "sectionsWithNoOutgoingNavigation": [node for node, targets in graph.items() if not targets],
        "cyclicComponentsExcludingRestarts": cyclic,
        "reviewNotes": [
            "Reachability ignores eligibility and dice probabilities; this is a structural audit.",
            "Restart Act 1 references have target 1 and explicitTarget=false when no numeric reset reference already exists in that section.",
            "Cycles are warnings, not proof of invalid gameplay. Effect repetition needs author review.",
            "Section 284 resolves victory directly rather than navigating successful results to 280.",
        ],
    }
    output.mkdir(parents=True, exist_ok=True)
    story_physical_pages = {line["sourcePage"] for line in story_records if line["text"].strip()}
    rule_source_pages = [page for page in pages if page["physicalPage"] not in story_physical_pages]
    rule_evidence = {
        category: [
            {
                "sourcePage": page["physicalPage"],
                "quote": match.group(),
                "context": source_excerpt(page["textWithoutFooter"], match.start(), match.end()),
            }
            for page in rule_source_pages
            for match in re.finditer(pattern, page["textWithoutFooter"], re.IGNORECASE)
        ]
        for category, pattern in EVIDENCE_PATTERNS.items()
    }
    write_json(output / "source.json", source)
    write_json(output / "pages.json", {"schemaVersion": 1, "source": source, "pages": pages})
    write_json(output / "sections.json", {"schemaVersion": 1, "source": source, "sections": sections})
    write_json(output / "branching.json", branching)
    write_json(output / "rules.json", {
        "schemaVersion": 1,
        "source": source,
        "sourcePages": [page["physicalPage"] for page in rule_source_pages],
        "evidence": rule_evidence,
        "reviewStatus": "extracted-unreviewed",
        "notes": ["Source-linked setup and appendix evidence only; verified executable perk, mentor, and global rules are authored separately."]
    })
    print(json.dumps({"source": source, "statistics": branching["statistics"], "unreachableSectionIds": branching["unreachableSectionIds"], "cyclicComponentSizes": [len(component) for component in cyclic]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path, help="The complete supplied manuscript PDF")
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parent.parent / "manuscript")
    args = parser.parse_args()
    if not args.pdf.is_file():
        sys.exit(f"PDF not found: {args.pdf}")
    extract(args.pdf, args.output)
