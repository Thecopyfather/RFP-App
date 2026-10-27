#!/usr/bin/env node
/** Validate manuscript links and the separately declared playable subset. */
import {readFile, access} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const numericSort = (a, b) => Number(a) - Number(b);
const issue = (code, message, details = {}) => ({code, message, ...details});

export function cyclicComponents(graph) {
  const indices = new Map();
  const low = new Map();
  const stack = [];
  const active = new Set();
  const components = [];
  function visit(node) {
    indices.set(node, indices.size);
    low.set(node, indices.get(node));
    stack.push(node);
    active.add(node);
    for (const target of new Set(graph.get(node) ?? [])) {
      if (!graph.has(target)) continue;
      if (!indices.has(target)) {
        visit(target);
        low.set(node, Math.min(low.get(node), low.get(target)));
      } else if (active.has(target)) {
        low.set(node, Math.min(low.get(node), indices.get(target)));
      }
    }
    if (low.get(node) === indices.get(node)) {
      const component = [];
      let member;
      do {
        member = stack.pop();
        active.delete(member);
        component.push(member);
      } while (member !== node);
      component.sort(numericSort);
      if (component.length > 1 || graph.get(component[0])?.includes(component[0])) components.push(component);
    }
  }
  for (const node of graph.keys()) if (!indices.has(node)) visit(node);
  return components.sort((a, b) => b.length - a.length || numericSort(a[0], b[0]));
}

export function validateFullGraph(document) {
  const errors = [];
  const warnings = [];
  if (!Array.isArray(document.sections)) return {errors:[issue('INVALID_DATABASE', 'Expected a sections array.')], warnings, statistics:{}};
  const sections = new Map();
  for (const section of document.sections) {
    const id = String(section.id);
    if (!/^\d+$/.test(id)) errors.push(issue('INVALID_SECTION_ID', `Invalid story section ID: ${id}.`, {sectionId:id}));
    if (sections.has(id)) errors.push(issue('DUPLICATE_SECTION', `Duplicate section ${id}.`, {sectionId:id}));
    sections.set(id, section);
  }
  if (document.source?.storySectionCount && sections.size !== document.source.storySectionCount) {
    errors.push(issue('SECTION_COUNT', `Source declares ${document.source.storySectionCount} sections; database contains ${sections.size}.`));
  }
  const graph = new Map([...sections.keys()].map(id => [id, []]));
  let referenceCount = 0;
  let explicitNumericReferenceCount = 0;
  const explicitEdges = new Set();
  for (const [id, section] of sections) {
    if (!Array.isArray(section.destinationReferences)) {
      errors.push(issue('INVALID_REFERENCES', `Section ${id} has no destinationReferences array.`, {sectionId:id}));
      continue;
    }
    for (const reference of section.destinationReferences) {
      const target = String(reference.target);
      referenceCount += 1;
      if (reference.explicitTarget !== false) {
        explicitNumericReferenceCount += 1;
        explicitEdges.add(`${id}:${target}`);
      }
      graph.get(id).push(target);
      if (!sections.has(target)) errors.push(issue('MISSING_DESTINATION', `Section ${id} references nonexistent section ${target}.`, {sectionId:id, target, sourcePage:reference.sourcePage, quote:reference.quote}));
    }
    for (const physicalPage of section.sourcePages ?? []) {
      if (!Number.isInteger(physicalPage) || physicalPage < 1 || (document.source?.pageCount && physicalPage > document.source.pageCount)) {
        errors.push(issue('INVALID_SOURCE_PAGE', `Section ${id} has an invalid physical PDF page: ${physicalPage}.`, {sectionId:id}));
      }
    }
    if (!section.destinationReferences.length && !/\byou\s+win\b|\brestart\b|\bgame\s+over\b/i.test(section.text ?? '')) {
      warnings.push(issue('UNEXPLAINED_DEAD_END', `Section ${id} has no outgoing destination or detected ending instruction.`, {sectionId:id}));
    }
  }
  if (!sections.has('1')) errors.push(issue('MISSING_ENTRY', 'The entry section 1 is missing.'));
  const visited = new Set();
  const queue = ['1'];
  while (queue.length) {
    const node = queue.pop();
    if (visited.has(node) || !graph.has(node)) continue;
    visited.add(node);
    queue.push(...graph.get(node));
  }
  const unreachableSectionIds = [...sections.keys()].filter(id => !visited.has(id)).sort(numericSort);
  if (unreachableSectionIds.length) warnings.push(issue('UNREACHABLE_SECTIONS', `Structurally unreachable from section 1: ${unreachableSectionIds.join(', ')}.`, {sectionIds:unreachableSectionIds}));
  const withoutRestarts = new Map([...graph].map(([id, targets]) => [id, targets.filter(target => target !== '1')]));
  const cycles = cyclicComponents(withoutRestarts);
  for (const component of cycles) warnings.push(issue('STORY_CYCLE', `Potential loop component (${component.length} sections): ${component.join(', ')}.`, {sectionIds:component}));
  for (const [first, second, effect] of [['134','161','+$2,000 per re-entry'],['170','198','+$3,000 net per cycle'],['176','199','+$4,000 per re-entry']]) {
    if (graph.get(first)?.includes(second) && graph.get(second)?.includes(first)) {
      warnings.push(issue('REVISIT_REWARD_AMBIGUITY', `${first} → ${second} → ${first}: ${effect} if entry rewards repeat. Preserve the manuscript and obtain an author ruling.`, {sectionIds:[first,second]}));
    }
  }
  return {
    errors, warnings,
    statistics:{sectionCount:sections.size, explicitNumericReferenceCount, explicitUniqueEdgeCount:explicitEdges.size, referenceCountIncludingRestarts:referenceCount, uniqueEdgeCountIncludingRestarts:[...graph.values()].reduce((sum, targets) => sum + new Set(targets).size, 0)},
    unreachableSectionIds,
    cyclicComponentsExcludingRestarts:cycles,
  };
}

export function validatePrototype(manifest, document) {
  const errors = [];
  const warnings = [];
  const allIds = new Set(document.sections.map(section => String(section.id)));
  const originalTargets = new Map(document.sections.map(section => [String(section.id), new Set((section.destinationReferences ?? []).map(reference => String(reference.target)))]));
  const sectionIds = (manifest.sectionIds ?? manifest.playableSectionIds ?? []).map(String);
  const implemented = new Set(sectionIds);
  const boundaries = new Set((manifest.boundaryTargets ?? []).map(String));
  if (!sectionIds.length) errors.push(issue('EMPTY_PROTOTYPE', 'Prototype manifest contains no section IDs.'));
  if (implemented.size !== sectionIds.length) errors.push(issue('DUPLICATE_PROTOTYPE_SECTION', 'Prototype manifest contains duplicate section IDs.'));
  for (const id of implemented) if (!allIds.has(id)) errors.push(issue('UNKNOWN_PROTOTYPE_SECTION', `Prototype section ${id} does not exist in the manuscript.`, {sectionId:id}));
  for (const target of boundaries) if (!allIds.has(target)) errors.push(issue('UNKNOWN_BOUNDARY_TARGET', `Prototype boundary ${target} does not exist in the manuscript.`, {target}));
  let outgoingCount = 0;
  const boundaryReferences = [];
  if (Array.isArray(manifest.scenes)) {
    const sceneIds = new Set(manifest.scenes.map(scene => String(scene.id)));
    for (const id of implemented) if (!sceneIds.has(id)) errors.push(issue('MISSING_PROTOTYPE_SCENE', `Manifest lists section ${id}, but its authored navigation is missing.`, {sectionId:id}));
    for (const scene of manifest.scenes) {
      const id = String(scene.id);
      if (!implemented.has(id)) errors.push(issue('UNDECLARED_PROTOTYPE_SCENE', `Authored scene ${id} is absent from the playable section list.`, {sectionId:id}));
      const targets = [...(scene.choiceTargets ?? []), ...(scene.rollTargets ?? [])].map(String);
      const sourceTargets = originalTargets.get(id);
      for (const target of targets) {
        outgoingCount += 1;
        if (!allIds.has(target)) errors.push(issue('MISSING_PROTOTYPE_DESTINATION', `Playable section ${id} references nonexistent section ${target}.`, {sectionId:id, target}));
        else if (!implemented.has(target)) {
          boundaryReferences.push({source:id,target});
          if (!boundaries.has(target)) errors.push(issue('UNDECLARED_PROTOTYPE_BOUNDARY', `Playable section ${id} points to ${target}, which is neither implemented nor declared as a prototype boundary.`, {sectionId:id,target}));
        }
        if (sourceTargets && !sourceTargets.has(target)) errors.push(issue('ALTERED_MANUSCRIPT_DESTINATION', `Playable section ${id} routes to ${target}, which is not an original destination of this section.`, {sectionId:id,target}));
      }
      for (const target of sourceTargets ?? []) if (!targets.includes(target)) errors.push(issue('OMITTED_MANUSCRIPT_DESTINATION', `Playable section ${id} omits its original destination ${target}. Preserve the choice with an explicit boundary when necessary.`, {sectionId:id,target}));
    }
  } else {
    warnings.push(issue('PROTOTYPE_IDS_ONLY', 'Prototype IDs are valid; provide a JSON scenes manifest to validate the authored choice and roll targets.'));
  }
  return {errors,warnings,statistics:{playableSectionCount:implemented.size,authoredOutgoingReferenceCount:outgoingCount,declaredBoundaryTargetCount:boundaries.size,boundaryReferenceCount:boundaryReferences.length},boundaryReferences};
}

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

async function readManifest(file) {
  const source = await readFile(file, 'utf8');
  if (file.endsWith('.json')) return JSON.parse(source);
  const literalArray = name => {
    const match = source.match(new RegExp(`(?:export\\s+)?const\\s+${name}\\s*=\\s*(\\[[\\s\\S]*?\\])`));
    return match ? JSON.parse(match[1].replaceAll("'", '"').replace(/,\s*]/g, ']')) : undefined;
  };
  const ids = literalArray('PLAYABLE_SECTION_IDS');
  const boundaries = literalArray('PROTOTYPE_BOUNDARY_TARGETS') ?? [];
  const initializer = /export\s+const\s+GAME\s*:\s*GameDefinition\s*=\s*(?=\{)/.exec(source);
  if (initializer) {
    // The content module deliberately serializes GAME as a JSON literal. Locate
    // its balanced object without importing TypeScript or executing application
    // code. Ignore braces and semicolons inside quoted manuscript text.
    const start = initializer.index + initializer[0].length;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let cursor = start; cursor < source.length; cursor += 1) {
      const char = source[cursor];
      if (inString) {
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === '"') inString = false;
      } else if (char === '"') inString = true;
      else if (char === '{') depth += 1;
      else if (char === '}' && --depth === 0) {
        const game = JSON.parse(source.slice(start, cursor + 1));
        return {
          sectionIds:ids ?? Object.keys(game.scenes),
          boundaryTargets:boundaries,
          scenes:Object.values(game.scenes).map(scene => ({
            id:scene.id,
            choiceTargets:(scene.choices ?? []).map(choice => choice.target),
            rollTargets:(scene.check?.outcomes ?? []).map(outcome => outcome.target),
          })),
        };
      }
    }
    throw new Error(`${file}: GAME JSON initializer is not balanced.`);
  }
  if (!ids) throw new Error(`${file}: export a literal PLAYABLE_SECTION_IDS array or provide a JSON prototype manifest.`);
  return {sectionIds:ids,boundaryTargets:boundaries};
}

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const valueAfter = name => {
    const index = args.indexOf(name);
    if (index < 0) return undefined;
    if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${name} requires a path.`);
    return path.resolve(args[index + 1]);
  };
  const sectionsFile = valueAfter('--sections') ?? path.join(projectRoot, 'manuscript/sections.json');
  const document = JSON.parse(await readFile(sectionsFile, 'utf8'));
  const full = validateFullGraph(document);
  let prototypeFile = valueAfter('--prototype');
  if (!prototypeFile) {
    for (const candidate of ['src/content/prototype-manifest.json','src/content/game.ts']) {
      const file = path.join(projectRoot, candidate);
      if (await exists(file)) { prototypeFile = file; break; }
    }
  }
  const prototype = prototypeFile ? validatePrototype(await readManifest(prototypeFile), document) : null;
  const report = {
    status:full.errors.length || prototype?.errors.length ? 'error' : 'pass-with-warnings',
    sourceSha256:document.source?.sha256,
    full,
    prototype,
    notes:['Graph validation does not resolve manuscript ambiguities or prove state-dependent reachability.','A declared prototype boundary is distinct from a missing manuscript destination.'],
  };
  if (jsonOutput) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Manuscript: ${full.statistics.sectionCount ?? 0} sections; ${full.statistics.explicitNumericReferenceCount ?? 0} explicit numeric references; ${full.errors.length} errors.`);
    if (prototype) console.log(`Prototype: ${prototype.statistics.playableSectionCount} scenes; ${prototype.statistics.authoredOutgoingReferenceCount} authored references; ${prototype.statistics.boundaryReferenceCount} declared boundary references; ${prototype.errors.length} errors.`);
    else console.log('Prototype content not present yet; full manuscript graph checked.');
    for (const item of [...full.errors,...(prototype?.errors ?? [])]) console.error(`ERROR [${item.code}] ${item.message}`);
    for (const item of [...full.warnings,...(prototype?.warnings ?? [])]) console.warn(`WARNING [${item.code}] ${item.message}`);
    console.log(report.status === 'error' ? 'Graph validation FAILED.' : 'Graph validation passed. Manuscript review warnings remain open.');
  }
  if (report.status === 'error') process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => { console.error(`Graph validation failed: ${error.message}`); process.exitCode = 1; });
}
