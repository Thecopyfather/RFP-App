import { readDie, roll2D6, rollD6 } from './dice';
import { STAT_KEYS } from './types';
import type { Choice, Condition, DiceSource, Effect, GameCommand, GameDefinition, GameState, PendingRoll, RollOutcome, Stats } from './types';

const emptyStats = (): Stats => ({ CR: 0, TA: 0, RE: 0, NE: 0, TS: 0 });
function requireRule(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function createInitialState(game: GameDefinition, runId = globalThis.crypto.randomUUID()): GameState {
  return {
    schemaVersion: 1, gameId: game.id, contentVersion: game.version, runId, revision: 0,
    phase: 'creation', creationStep: 'attributes', name: '', baseStats: emptyStats(), rolled: [],
    perkId: null, mentorId: null, capital: game.initialCapital, statChanges: emptyStats(),
    sectionId: game.startSection, visit: 0, flags: {}, history: [], applied: [], powerUsed: false,
    pendingRoll: null, boundary: null, lastOutcome: null,
  };
}

export function getStats(game: GameDefinition, state: GameState): Stats {
  const perk = game.perks.find(item => item.id === state.perkId);
  const mentor = game.mentors.find(item => item.id === state.mentorId);
  return Object.fromEntries(STAT_KEYS.map(key => [key,
    state.baseStats[key] + state.statChanges[key] + (perk?.stats[key] ?? 0) + (mentor?.passive.stats[key] ?? 0),
  ])) as Stats;
}

export function getStartingCapital(game: GameDefinition, state: GameState): number {
  return game.initialCapital + (game.perks.find(item => item.id === state.perkId)?.capital ?? 0);
}

export function conditionMet(condition: Condition | undefined, state: GameState): boolean {
  if (!condition) return true;
  if (condition.kind === 'mentor') return state.mentorId === condition.id;
  if (condition.kind === 'flag') return (state.flags[condition.key] ?? false) === condition.value;
  if (condition.kind === 'capital') return condition.operator === 'gte' ? state.capital >= condition.value : state.capital < condition.value;
  return condition.conditions.every(item => conditionMet(item, state));
}

export function getAvailableChoices(game: GameDefinition, state: GameState): Choice[] {
  if (state.phase !== 'adventure' || game.scenes[state.sectionId]?.check) return [];
  return game.scenes[state.sectionId]?.choices.filter(choice => conditionMet(choice.condition, state)) ?? [];
}

export function getVisibleParagraphs(game: GameDefinition, state: GameState): string[] {
  return game.scenes[state.sectionId]?.paragraphs.filter(block => conditionMet(block.condition, state)).map(block => block.text) ?? [];
}

function pendingOutcome(game: GameDefinition, state: GameState): RollOutcome | undefined {
  const pending = state.pendingRoll;
  return pending ? game.scenes[pending.sectionId]?.check?.outcomes[pending.outcomeIndex] : undefined;
}

function capitalAmount(game: GameDefinition, state: GameState, effect: Extract<Effect, {kind:'capital'}>, power?: PendingRoll['power']): number {
  const amount = effect.category === 'lose-all' ? -state.capital : effect.amount;
  if (power === 'neutral-result') return 0;
  if (amount >= 0 || effect.category === 'purchase') return amount;
  if (power === 'reroll-loss') return 0;
  if (power === 'halve-loss') return -Math.ceil((-amount / 2) / 100) * 100;
  const reduction = game.mentors.find(item => item.id === state.mentorId)?.passive.lossReduction ?? 0;
  return effect.category === 'setback' ? Math.min(0, amount + reduction) : amount;
}

function hasPendingLoss(game: GameDefinition, state: GameState, outcome: RollOutcome): boolean {
  const simulation = structuredClone(state);
  const effects = [...(outcome.effects ?? []), ...(game.scenes[outcome.target]?.effects ?? [])];
  for (const effect of effects) {
    if (!conditionMet(effect.when, simulation)) continue;
    if (effect.kind === 'flag') simulation.flags[effect.key] = effect.value;
    if (effect.kind === 'capital') {
      const amount = capitalAmount(game, simulation, effect);
      if (amount < 0 && effect.category !== 'purchase') return true;
      simulation.capital += amount;
    }
  }
  return false;
}

export function getMentorAction(game: GameDefinition, state: GameState): {name:string; description:string} | null {
  if (state.phase !== 'roll-result' || state.powerUsed || !state.pendingRoll) return null;
  const mentor = game.mentors.find(item => item.id === state.mentorId);
  const outcome = pendingOutcome(game, state);
  if (!mentor || outcome?.rank !== 'failure') return null;
  if (mentor.power.kind !== 'neutral-result' && !hasPendingLoss(game, state, outcome)) return null;
  if (mentor.power.kind === 'reroll-loss' && state.pendingRoll.total > 6) return null;
  return { name: mentor.power.name, description: mentor.power.text };
}

function findOutcome(game: GameDefinition, sectionId: string, total: number): number {
  const outcomes = game.scenes[sectionId]?.check?.outcomes ?? [];
  const matches = outcomes.flatMap((outcome, index) =>
    total >= (outcome.min ?? -Infinity) && total <= (outcome.max ?? Infinity) ? [index] : []);
  requireRule(matches.length === 1, `Section ${sectionId} has no unique outcome for a total of ${total}.`);
  return matches[0];
}

function applyEffects(game: GameDefinition, state: GameState, effects: Effect[], token: string, power?: PendingRoll['power']): void {
  for (const effect of effects) {
    const id = `effect:${token}:${effect.id}`;
    if (state.applied.includes(id) || !conditionMet(effect.when, state)) continue;
    state.applied.push(id);
    if (effect.kind === 'flag') state.flags[effect.key] = effect.value;
    if (effect.kind === 'capital') state.capital += capitalAmount(game, state, effect, power);
    if (effect.kind === 'stat' && power !== 'neutral-result') state.statChanges[effect.stat] += effect.amount;
  }
}

function resolveTerminal(game: GameDefinition, state: GameState): boolean {
  if (state.capital <= 0) {
    state.phase = 'game-over';
    return true;
  }
  if (game.scenes[state.sectionId]?.ending === 'victory') {
    state.phase = 'victory';
    return true;
  }
  if (state.capital >= game.winCapital) {
    requireRule(game.scenes[game.victorySection], 'The victory section is unavailable.');
    state.sectionId = game.victorySection;
    state.visit += 1;
    state.phase = 'victory';
    return true;
  }
  return false;
}

function enterScene(game: GameDefinition, state: GameState, target: string, label: string, power?: PendingRoll['power']): void {
  const scene = game.scenes[target];
  if (!scene) {
    state.phase = 'boundary';
    state.boundary = { from: state.sectionId, target, label };
    return;
  }
  state.sectionId = target;
  state.visit += 1;
  state.phase = 'adventure';
  state.boundary = null;
  applyEffects(game, state, scene.effects ?? [], `${state.runId}:visit:${state.visit}`, power);
  resolveTerminal(game, state);
}

function recordTransition(state: GameState, before: GameState, label: string, power?: string): void {
  const statChanges: Partial<Stats> = {};
  for (const key of STAT_KEYS) {
    const amount = state.statChanges[key] - before.statChanges[key];
    if (amount) statChanges[key] = amount;
  }
  const capitalChange = state.capital - before.capital;
  state.lastOutcome = { label, capitalChange, statChanges, ...(power ? { power } : {}) };
  state.history.push({ id: `${state.runId}:${state.revision + 1}`, sectionId: state.sectionId, label, capitalChange, statChanges });
}

/** A command commits one immutable transaction, including any random values it produces. */
export function applyCommand(game: GameDefinition, state: GameState, command: GameCommand, rng: DiceSource = rollD6): GameState {
  requireRule(state.gameId === game.id && state.contentVersion === game.version, 'This game state belongs to another content version.');
  requireRule(command.id.trim(), 'Every command requires an id.');
  const commandId = `command:${command.id}`;
  if (state.applied.includes(commandId)) return state;
  const next = structuredClone(state);
  const creationOnly = () => requireRule(next.phase === 'creation', 'Character creation is already complete.');
  const attributesReady = () => STAT_KEYS.every(key => next.rolled.includes(key));
  switch (command.type) {
    case 'SET_NAME':
      creationOnly(); next.name = command.name.slice(0, 80); break;
    case 'ROLL_ATTRIBUTE':
      creationOnly();
      requireRule(STAT_KEYS.includes(command.stat) && !next.rolled.includes(command.stat), 'This attribute cannot be rolled again.');
      next.baseStats[command.stat] = readDie(rng); next.rolled.push(command.stat); break;
    case 'ROLL_ALL_ATTRIBUTES':
      creationOnly();
      requireRule(next.rolled.length < STAT_KEYS.length, 'All attributes have already been rolled.');
      for (const key of STAT_KEYS) if (!next.rolled.includes(key)) { next.baseStats[key] = readDie(rng); next.rolled.push(key); }
      break;
    case 'SET_CREATION_STEP': {
      creationOnly();
      const allowed = command.step === 'attributes'
        || (attributesReady() && command.step === 'perk')
        || (attributesReady() && next.perkId && command.step === 'mentor')
        || (attributesReady() && next.perkId && next.mentorId && command.step === 'summary');
      requireRule(allowed, 'Complete the previous character-creation steps first.');
      next.creationStep = command.step; break;
    }
    case 'SELECT_PERK':
      creationOnly();
      requireRule(attributesReady() && game.perks.some(perk => perk.id === command.perkId), 'Choose an available bonus perk after rolling attributes.');
      next.perkId = command.perkId; next.capital = getStartingCapital(game, next); break;
    case 'SELECT_MENTOR':
      creationOnly();
      requireRule(attributesReady() && next.perkId && game.mentors.some(mentor => mentor.id === command.mentorId), 'Choose an available mentor after selecting a perk.');
      next.mentorId = command.mentorId; break;
    case 'START_ADVENTURE':
      creationOnly();
      requireRule(attributesReady() && next.perkId && next.mentorId && next.creationStep === 'summary', 'Complete your character before starting.');
      next.capital = getStartingCapital(game, next);
      enterScene(game, next, game.startSection, game.scenes[game.startSection]?.heading ?? game.title);
      recordTransition(next, state, game.scenes[game.startSection]?.heading ?? game.title); break;
    case 'CHOOSE': {
      const choice = getAvailableChoices(game, next).find(item => item.id === command.choiceId);
      requireRule(choice, 'That choice is unavailable in the current scene.');
      enterScene(game, next, choice.target, choice.label);
      recordTransition(next, state, choice.label); break;
    }
    case 'ROLL_CHECK': {
      const check = game.scenes[next.sectionId]?.check;
      requireRule(next.phase === 'adventure' && check, 'There is no available dice check.');
      const dice = roll2D6(rng);
      const modifier = getStats(game, next)[check.stat];
      const total = dice[0] + dice[1] + modifier;
      next.pendingRoll = { id: command.id, sectionId: next.sectionId, dice, stat: check.stat, modifier, total, outcomeIndex: findOutcome(game, next.sectionId, total) };
      next.phase = 'roll-result'; next.lastOutcome = null; break;
    }
    case 'USE_MENTOR': {
      requireRule(getMentorAction(game, next), 'Your mentor power is unavailable for this result.');
      const power = game.mentors.find(item => item.id === next.mentorId)!.power.kind;
      const pending = next.pendingRoll!;
      if (power === 'reroll-loss') {
        pending.previousDice = pending.dice;
        pending.dice = roll2D6(rng);
        pending.total = pending.dice[0] + pending.dice[1] + pending.modifier;
        pending.outcomeIndex = findOutcome(game, pending.sectionId, pending.total);
      } else if (power === 'neutral-result') {
        const outcomes = game.scenes[pending.sectionId].check!.outcomes;
        const mixed = outcomes.flatMap((outcome, index) => outcome.rank === 'mixed' ? [index] : []);
        requireRule(mixed.length === 1, 'This check has no unique neutral outcome.');
        pending.outcomeIndex = mixed[0];
      }
      pending.power = power; next.powerUsed = true; break;
    }
    case 'CONFIRM_ROLL': {
      requireRule(next.phase === 'roll-result' && next.pendingRoll, 'There is no dice result to confirm.');
      const pending = next.pendingRoll;
      const outcome = pendingOutcome(game, next);
      requireRule(outcome, 'The recorded dice outcome is unavailable.');
      applyEffects(game, next, outcome.effects ?? [], `${next.runId}:roll:${pending.id}`, pending.power);
      next.pendingRoll = null;
      if (!resolveTerminal(game, next)) enterScene(game, next, outcome.target, outcome.label, pending.power);
      recordTransition(next, state, outcome.label, pending.power); break;
    }
    default:
      throw new Error('Unknown game command.');
  }
  next.revision += 1;
  next.applied.push(commandId);
  return next;
}
