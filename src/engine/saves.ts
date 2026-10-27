import { z } from 'zod';
import { getMentorAction, getStartingCapital, getStats } from './game';
import { STAT_KEYS } from './types';
import type { GameDefinition, GameState } from './types';

export const SAVE_KEY = 'roll-for-profit:save:v1';

const integer = z.number().int();
const statKey = z.enum(STAT_KEYS);
const stats = z.object({ CR: integer, TA: integer, RE: integer, NE: integer, TS: integer }).strict();
const dice = z.tuple([integer.min(1).max(6), integer.min(1).max(6)]);
const power = z.enum(['reroll-loss', 'halve-loss', 'neutral-result']);
const pending = z.object({
  id: z.string().min(1), sectionId: z.string().min(1), dice, stat: statKey, modifier: integer,
  total: integer, outcomeIndex: integer.min(0), previousDice: dice.optional(), power: power.optional(),
}).strict();
const history = z.object({
  id: z.string().min(1), sectionId: z.string().min(1), label: z.string(),
  capitalChange: integer, statChanges: stats.partial(),
}).strict();
const schema = z.object({
  schemaVersion: z.literal(1), gameId: z.string(), contentVersion: z.string(), runId: z.string().min(1),
  revision: integer.min(0), phase: z.enum(['creation', 'adventure', 'roll-result', 'boundary', 'game-over', 'victory']),
  creationStep: z.enum(['attributes', 'perk', 'mentor', 'summary']), name: z.string().max(80),
  baseStats: stats, rolled: z.array(statKey), perkId: z.string().nullable(), mentorId: z.string().nullable(),
  capital: integer, statChanges: stats, sectionId: z.string(), visit: integer.min(0),
  flags: z.record(z.string(), z.boolean()), history: z.array(history), applied: z.array(z.string()),
  powerUsed: z.boolean(), pendingRoll: pending.nullable(),
  boundary: z.object({ from: z.string(), target: z.string(), label: z.string() }).strict().nullable(),
  lastOutcome: z.object({ label: z.string(), capitalChange: integer, statChanges: stats.partial(), power: z.string().optional() }).strict().nullable(),
}).strict();

function semanticError(state: GameState, game: GameDefinition): string | null {
  if (state.gameId !== game.id) return 'This save belongs to another game.';
  if (state.contentVersion !== game.version) return 'This save uses another manuscript content version.';
  if (!game.scenes[state.sectionId]) return 'The saved story section is unavailable.';
  if (state.perkId && !game.perks.some(perk => perk.id === state.perkId)) return 'The saved bonus perk is unavailable.';
  if (state.mentorId && !game.mentors.some(mentor => mentor.id === state.mentorId)) return 'The saved mentor is unavailable.';
  if (new Set(state.rolled).size !== state.rolled.length || new Set(state.applied).size !== state.applied.length) return 'The save contains duplicate transaction or attribute records.';
  for (const key of STAT_KEYS) {
    if (state.rolled.includes(key) ? state.baseStats[key] < 1 || state.baseStats[key] > 6 : state.baseStats[key] !== 0) return 'The saved starting attributes are invalid.';
  }
  if (state.phase !== 'creation' && (state.rolled.length !== STAT_KEYS.length || !state.perkId || !state.mentorId)) return 'The saved character is incomplete.';
  if (state.phase === 'creation') {
    if (state.capital !== getStartingCapital(game, state)) return 'The saved starting Capital is inconsistent.';
    if (state.creationStep !== 'attributes' && state.rolled.length !== STAT_KEYS.length) return 'The saved character-creation step is incomplete.';
    if ((state.creationStep === 'mentor' || state.creationStep === 'summary') && !state.perkId) return 'The saved bonus-perk step is incomplete.';
    if (state.creationStep === 'summary' && !state.mentorId) return 'The saved mentor step is incomplete.';
  }
  if ((state.phase === 'boundary') !== (state.boundary !== null)) return 'The saved prototype boundary is inconsistent.';
  if (state.boundary && (state.boundary.from !== state.sectionId || game.scenes[state.boundary.target])) return 'The saved prototype destination is invalid.';
  if (state.boundary) {
    const scene = game.scenes[state.sectionId];
    const targets = [...scene.choices.map(choice => choice.target), ...(scene.check?.outcomes.map(outcome => outcome.target) ?? [])];
    if (!targets.includes(state.boundary.target)) return 'The saved prototype destination is not an authored branch.';
  }
  if ((state.phase === 'roll-result') !== (state.pendingRoll !== null)) return 'The saved dice phase is inconsistent.';
  if (state.phase === 'game-over' && state.capital > 0) return 'The saved game-over condition is inconsistent.';
  if (state.phase !== 'creation' && state.phase !== 'game-over' && state.capital <= 0) return 'This saved run has exhausted its Capital.';
  if (state.phase !== 'creation' && state.phase !== 'victory' && state.capital >= game.winCapital) return 'The saved Capital has already reached the victory threshold.';
  if (state.phase === 'victory' && game.scenes[state.sectionId].ending !== 'victory' && state.sectionId !== game.victorySection) return 'The saved victory section is invalid.';
  if (state.pendingRoll) {
    const roll = state.pendingRoll;
    const check = game.scenes[state.sectionId].check;
    const outcome = check?.outcomes[roll.outcomeIndex];
    if (!check || !outcome || roll.sectionId !== state.sectionId || roll.stat !== check.stat) return 'The saved dice check is unavailable.';
    if (roll.modifier !== getStats(game, state)[roll.stat] || roll.total !== roll.dice[0] + roll.dice[1] + roll.modifier) return 'The saved dice calculation is inconsistent.';
    if (roll.power) {
      const mentor = game.mentors.find(item => item.id === state.mentorId);
      if (!state.powerUsed || mentor?.power.kind !== roll.power) return 'The saved mentor activation is inconsistent.';
      const originalDice = roll.previousDice ?? roll.dice;
      const originalTotal = originalDice[0] + originalDice[1] + roll.modifier;
      const originalIndex = check.outcomes.findIndex(item => originalTotal >= (item.min ?? -Infinity) && originalTotal <= (item.max ?? Infinity));
      const beforePower: GameState = { ...state, powerUsed: false, pendingRoll: { ...roll, dice: originalDice, total: originalTotal, outcomeIndex: originalIndex, previousDice: undefined, power: undefined } };
      if (!getMentorAction(game, beforePower)) return 'The saved mentor power was unavailable for its original result.';
    }
    if (roll.power === 'neutral-result') {
      if (outcome.rank !== 'mixed') return 'The saved neutral outcome is inconsistent.';
      const original = check.outcomes.filter(item => roll.total >= (item.min ?? -Infinity) && roll.total <= (item.max ?? Infinity));
      if (original.length !== 1 || original[0].rank !== 'failure') return 'The saved mentor conversion did not begin with a failure.';
    } else if (roll.total < (outcome.min ?? -Infinity) || roll.total > (outcome.max ?? Infinity)) return 'The saved outcome does not match its dice.';
    if ((roll.power === 'reroll-loss') !== (roll.previousDice !== undefined)) return 'The saved reroll history is inconsistent.';
  }
  return null;
}

/** Serialize only validated, source-versioned engine state; storage is a UI adapter concern. */
export function serializeSave(state: GameState, game: GameDefinition): string {
  const parsed = schema.parse(state) as GameState;
  const error = semanticError(parsed, game);
  if (error) throw new Error(error);
  return JSON.stringify(parsed);
}

/** A failed load never mutates or removes the user's existing save. */
export function loadSave(raw: string, game: GameDefinition): {ok:true; state:GameState} | {ok:false; error:string} {
  try {
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success) return { ok: false, error: 'The save is damaged or uses an unsupported save format.' };
    const state = parsed.data as GameState;
    const error = semanticError(state, game);
    return error ? { ok: false, error } : { ok: true, state };
  } catch {
    return { ok: false, error: 'The save could not be read as valid JSON.' };
  }
}
