import { describe, expect, it } from 'vitest';
import { GAME } from '../src/content/game';
import manuscript from '../manuscript/sections.json';

type ValidationResult = { errors: { code: string }[]; warnings: { code: string }[] };
// A computed import keeps this plain ESM CLI independent of the TypeScript app.
const { validateFullGraph, validatePrototype, cyclicComponents }: {
  validateFullGraph: (document: unknown) => ValidationResult;
  validatePrototype: (manifest: unknown, document: unknown) => ValidationResult;
  cyclicComponents: (graph: Map<string, string[]>) => string[][];
} = await import('../scripts/' + 'validate-story.mjs');

// PDF wrapping and invisible layout characters are not editorial changes.
const normalize = (text: string) => text.replace(/[\u200b\ufeff]/g, '').replace(/\s+/g, ' ').trim();
const sourceById = new Map(manuscript.sections.map((section) => [section.id, section]));

describe('the complete manuscript graph', () => {
  it('contains the 284 original section IDs rather than PDF page numbers', () => {
    expect(manuscript.source.pageCount).toBe(245);
    expect(manuscript.sections.map((section) => section.id)).toEqual(
      Array.from({ length: 284 }, (_, index) => String(index + 1)),
    );
    expect(sourceById.size).toBe(284);
    expect(sourceById.get('1')?.sourcePages).toEqual([14]);
  });

  it('resolves every extracted destination against the full manuscript database', () => {
    const missing = manuscript.sections.flatMap((section) =>
      section.destinationReferences
        .filter((reference) => !sourceById.has(reference.target))
        .map((reference) => `${section.id} → ${reference.target} (PDF ${reference.sourcePage})`),
    );
    expect(missing).toEqual([]);
  });
});

describe('graph validator failure reporting', () => {
  const document = {
    source: { pageCount: 2, storySectionCount: 2 },
    sections: [
      { id: '1', text: 'A choice.', sourcePages: [1], destinationReferences: [{ target: '2', sourcePage: 1 }] },
      { id: '2', text: 'You win!', sourcePages: [2], destinationReferences: [] },
    ],
  };
  const manifest = {
    sectionIds: ['1'], boundaryTargets: ['2'],
    scenes: [{ id: '1', choiceTargets: ['2'], rollTargets: [] }],
  };

  it('rejects missing destinations and duplicate section IDs with distinct issue codes', () => {
    const missing = structuredClone(document);
    missing.sections[0].destinationReferences[0].target = '999';
    expect(validateFullGraph(missing).errors.map((issue) => issue.code)).toContain('MISSING_DESTINATION');
    const duplicate = structuredClone(document);
    duplicate.sections.push(structuredClone(duplicate.sections[0]));
    expect(validateFullGraph(duplicate).errors.map((issue) => issue.code)).toContain('DUPLICATE_SECTION');
  });

  it('distinguishes a legitimate prototype boundary from an undeclared destination', () => {
    expect(validatePrototype(manifest, document).errors).toEqual([]);
    expect(validatePrototype({ ...manifest, boundaryTargets: [] }, document).errors.map((issue) => issue.code))
      .toContain('UNDECLARED_PROTOTYPE_BOUNDARY');
  });

  it('detects omitted or invented manuscript destinations in the playable adaptation', () => {
    const omitted = { ...manifest, scenes: [{ id: '1', choiceTargets: [], rollTargets: [] }] };
    expect(validatePrototype(omitted, document).errors.map((issue) => issue.code)).toContain('OMITTED_MANUSCRIPT_DESTINATION');
    const invented = { ...manifest, scenes: [{ id: '1', choiceTargets: ['2', '1'], rollTargets: [] }] };
    expect(validatePrototype(invented, document).errors.map((issue) => issue.code)).toContain('ALTERED_MANUSCRIPT_DESTINATION');
  });

  it('reports potential loops without classifying all cycles as missing content', () => {
    expect(cyclicComponents(new Map([
      ['1', ['2']], ['2', ['3']], ['3', ['2']], ['4', ['4']],
    ]))).toEqual([['2', '3'], ['4']]);
    const loop = structuredClone(document);
    loop.sections[1].destinationReferences.push({ target: '2', sourcePage: 2 });
    const report = validateFullGraph(loop);
    expect(report.errors).toEqual([]);
    expect(report.warnings.map((issue) => issue.code)).toContain('STORY_CYCLE');
  });
});

describe('the source-linked playable edition', () => {
  it('includes the requested numbered opening and only existing manuscript scenes', () => {
    for (let id = 1; id <= 10; id += 1) expect(GAME.scenes[String(id)]).toBeDefined();
    for (const scene of Object.values(GAME.scenes)) {
      const source = sourceById.get(scene.id);
      expect(source, `missing source for scene ${scene.id}`).toBeDefined();
      expect([normalize(source!.heading), normalize(source!.title)]).toContain(normalize(scene.heading));
      expect(scene.sourcePages).toEqual(source!.sourcePages);
    }
  });

  it('preserves original narrative words, punctuation, and humour', () => {
    for (const scene of Object.values(GAME.scenes)) {
      const source = normalize(sourceById.get(scene.id)!.text);
      for (const paragraph of scene.paragraphs) {
        expect(source, `edited prose in section ${scene.id}: ${paragraph.text}`).toContain(normalize(paragraph.text));
      }
      for (const choice of scene.choices) {
        expect(source, `edited choice in section ${scene.id}: ${choice.label}`).toContain(normalize(choice.label));
      }
      for (const text of scene.check ? [scene.check.intro, ...scene.check.outcomes.map((outcome) => outcome.label)] : []) {
        expect(source, `edited roll instruction in section ${scene.id}: ${text}`).toContain(normalize(text));
      }
    }
  });

  it('does not omit any original prose when converting instructions into interactions', () => {
    for (const scene of Object.values(GAME.scenes)) {
      let remaining = normalize(sourceById.get(scene.id)!.text);
      const fragments = [
        ...scene.paragraphs.map((paragraph) => paragraph.text),
        ...scene.choices.map((choice) => choice.label),
        ...(scene.check ? [scene.check.intro, ...scene.check.outcomes.map((outcome) => outcome.label)] : []),
      ];
      for (const fragment of fragments.sort((a, b) => b.length - a.length)) {
        remaining = remaining.replace(normalize(fragment), '');
      }
      // These source instructions are represented by target IDs, outcome ranges, or ending types.
      remaining = remaining
        .replace(/→\s*Go to\s+\d+/g, '')
        .replace(/\b(?:11\+|8-10|7 or below)\s*→/g, '')
        .replace(/→\s*You Win!/g, '')
        .replace(/[●\s]/g, '');
      expect(remaining, `omitted original content in section ${scene.id}`).toBe('');
    }
  });

  it('retains every original destination for each implemented section', () => {
    for (const scene of Object.values(GAME.scenes)) {
      const originalTargets = [...new Set(sourceById.get(scene.id)!.destinationReferences.map((ref) => ref.target))].sort();
      const playableTargets = [...new Set([
        ...scene.choices.map((choice) => choice.target),
        ...(scene.check?.outcomes.map((outcome) => outcome.target) ?? []),
      ])].sort();
      expect(playableTargets, `navigation changed in section ${scene.id}`).toEqual(originalTargets);
      for (const target of playableTargets) expect(sourceById.has(target)).toBe(true);
      expect(new Set(scene.choices.map((choice) => choice.id)).size).toBe(scene.choices.length);
    }
  });

  it('assigns every possible modified roll to exactly one original outcome', () => {
    const checks = Object.values(GAME.scenes).flatMap((scene) => scene.check ? [scene.check] : []);
    expect(checks.length).toBeGreaterThan(0);
    for (const check of checks) {
      // Deliberately cover negative modifiers and attributes above starting d6 values.
      for (let total = -20; total <= 40; total += 1) {
        const matches = check.outcomes.filter((outcome) =>
          (outcome.min === undefined || total >= outcome.min) &&
          (outcome.max === undefined || total <= outcome.max),
        );
        expect(matches.length, `${check.id}: modified total ${total}`).toBe(1);
      }
    }
  });

  it('contains all five original bonus perks with their exact mechanical effects', () => {
    const actual = GAME.perks.map(({ name, stats, capital }) => ({ name, stats, capital }));
    expect(actual).toHaveLength(5);
    expect(actual).toEqual(expect.arrayContaining([
      { name: 'Born Closer', stats: { TA: 2 }, capital: 0 },
      { name: 'Marketing Genius', stats: { CR: 2 }, capital: 0 },
      { name: 'Hustler’s Work Ethic', stats: { RE: 1, NE: 1 }, capital: 0 },
      { name: 'Charismatic Leader', stats: { NE: 2 }, capital: 0 },
      { name: 'Investor-Backed', stats: { RE: -2 }, capital: 1000 },
    ]));
  });

  it('offers precisely the three original mentors', () => {
    expect(GAME.mentors.map((mentor) => mentor.name).sort()).toEqual([
      'The Bootstrapper', 'The Deal Maker', 'The Hustler',
    ]);
  });
});
