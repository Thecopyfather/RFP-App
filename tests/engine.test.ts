import { afterEach, describe, expect, it, vi } from 'vitest';
import { GAME } from '../src/content/game';
import { applyCommand, createInitialState, getAvailableChoices, getMentorAction, getStartingCapital, getStats, roll2D6, rollD6 } from '../src/engine';
import type { CommandInput, GameDefinition, GameState } from '../src/engine';

let sequence = 0;
function command(state: GameState, input: CommandInput, rng = () => 1, game = GAME): GameState {
  return applyCommand(game, state, { ...input, id: `unit-${++sequence}` }, rng);
}
function ready(mentorId = 'bootstrapper', perkId = 'born-closer', game = GAME): GameState {
  let state = createInitialState(game, 'test-run');
  state = command(state, { type: 'ROLL_ALL_ATTRIBUTES' }, () => 1, game);
  state = command(state, { type: 'SELECT_PERK', perkId }, undefined, game);
  state = command(state, { type: 'SELECT_MENTOR', mentorId }, undefined, game);
  state = command(state, { type: 'SET_CREATION_STEP', step: 'summary' }, undefined, game);
  return command(state, { type: 'START_ADVENTURE' }, undefined, game);
}
function withLoss(amount: number, category: 'setback' | 'purchase' | 'lose-all' = 'setback'): GameDefinition {
  const game = structuredClone(GAME);
  game.scenes['2'].effects = [{ id: 'test-loss', reason: 'Test-only loss fixture', kind: 'capital', amount: -amount, category }];
  return game;
}

afterEach(() => vi.restoreAllMocks());

describe('dice and immutable character creation', () => {
  it('rejects the biased uint32 tail and produces all six faces', () => {
    const samples = [0xffff_ffff, 0xffff_fffc, 0, 1, 2, 3, 4, 5];
    const fill = vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation(array => {
      (array as unknown as Uint32Array)[0] = samples.shift()!;
      return array;
    });
    expect(Array.from({ length: 6 }, () => rollD6())).toEqual([1, 2, 3, 4, 5, 6]);
    expect(fill).toHaveBeenCalledTimes(8);
  });

  it('preserves individual dice and their boundaries', () => {
    expect(roll2D6(() => 1)).toEqual([1, 1]);
    expect(roll2D6(() => 6)).toEqual([6, 6]);
    for (const value of [0, 7, 1.5, NaN]) expect(() => roll2D6(() => value)).toThrow();
  });

  it('never rerolls a committed attribute, including after a duplicated command', () => {
    const source = createInitialState(GAME, 'immutable');
    const rng = vi.fn(() => 6);
    const action = { type: 'ROLL_ATTRIBUTE', stat: 'CR', id: 'one-attribute' } as const;
    const rolled = applyCommand(GAME, source, action, rng);
    expect(source.baseStats.CR).toBe(0);
    expect(rolled.baseStats.CR).toBe(6);
    expect(applyCommand(GAME, rolled, action, rng)).toBe(rolled);
    expect(rng).toHaveBeenCalledTimes(1);
    expect(() => command(rolled, { type: 'ROLL_ATTRIBUTE', stat: 'CR' })).toThrow();
  });

  it.each([
    ['born-closer', { CR: 1, TA: 3, RE: 1, NE: 3, TS: 1 }, 1000],
    ['marketing-genius', { CR: 3, TA: 1, RE: 1, NE: 3, TS: 1 }, 1000],
    ['hustlers-work-ethic', { CR: 1, TA: 1, RE: 2, NE: 4, TS: 1 }, 1000],
    ['charismatic-leader', { CR: 1, TA: 1, RE: 1, NE: 5, TS: 1 }, 1000],
    ['investor-backed', { CR: 1, TA: 1, RE: -1, NE: 3, TS: 1 }, 2000],
  ])('applies the original %s perk without clipping signed attributes', (perk, stats, capital) => {
    const state = ready('deal-maker', perk);
    expect(getStats(GAME, state)).toEqual(stats);
    expect(getStartingCapital(GAME, state)).toBe(capital);
    expect(state.capital).toBe(capital);
  });

  it('supports backward creation steps without stacking perk or mentor bonuses', () => {
    let state = createInitialState(GAME, 'backtrack');
    state = command(state, { type: 'ROLL_ALL_ATTRIBUTES' });
    state = command(state, { type: 'SELECT_PERK', perkId: 'investor-backed' });
    state = command(state, { type: 'SELECT_MENTOR', mentorId: 'hustler' });
    state = command(state, { type: 'SET_CREATION_STEP', step: 'attributes' });
    state = command(state, { type: 'SELECT_PERK', perkId: 'born-closer' });
    state = command(state, { type: 'SELECT_MENTOR', mentorId: 'bootstrapper' });
    expect(getStats(GAME, state)).toEqual({ CR: 1, TA: 3, RE: 2, NE: 1, TS: 1 });
    expect(state.capital).toBe(1000);
    expect(() => command(state, { type: 'START_ADVENTURE' })).toThrow();
  });
});

describe('Capital, event scope and terminal conditions', () => {
  it.each([[50, 1000], [100, 1000], [1000, 100]])('reduces an ordinary $%i loss without creating money', (amount, expected) => {
    const game = withLoss(amount);
    const state = command(ready('bootstrapper', 'born-closer', game), { type: 'CHOOSE', choiceId: '1-to-2' }, undefined, game);
    expect(state.capital).toBe(expected);
  });

  it('does not reduce purchases or lose-all effects', () => {
    for (const category of ['purchase', 'lose-all'] as const) {
      const game = withLoss(1000, category);
      const state = command(ready('bootstrapper', 'born-closer', game), { type: 'CHOOSE', choiceId: '1-to-2' }, undefined, game);
      expect(state.capital).toBe(0);
      expect(state.phase).toBe('game-over');
    }
  });

  it('applies entry rewards once per actual visit and rejects duplicate navigation', () => {
    const game = structuredClone(GAME);
    game.scenes['1'].choices = [{ id: 'visit-reward', label: 'test fixture', target: '31' }];
    game.scenes['31'].choices = [{ id: 'return', label: 'test fixture', target: '1' }];
    let state = ready('bootstrapper', 'born-closer', game);
    const action = { type: 'CHOOSE', choiceId: 'visit-reward', id: 'first-visit' } as const;
    state = applyCommand(game, state, action);
    expect(state.capital).toBe(3000);
    expect(applyCommand(game, state, action)).toBe(state);
    state = command(state, { type: 'CHOOSE', choiceId: 'return' }, undefined, game);
    state = command(state, { type: 'CHOOSE', choiceId: 'visit-reward' }, undefined, game);
    expect(state.capital).toBe(5000);
  });

  it('moves to the original victory scene at the $10,000 threshold', () => {
    let state = ready();
    state = { ...state, sectionId: '10', capital: 8000 };
    state = command(state, { type: 'ROLL_CHECK' }, () => 6);
    state = command(state, { type: 'CONFIRM_ROLL' });
    expect(state.capital).toBe(10000);
    expect(state.sectionId).toBe('280');
    expect(state.phase).toBe('victory');
    expect(getAvailableChoices(GAME, state)).toEqual([]);
  });
});

describe('optional mentor powers', () => {
  it('offers Shoestring only for a modified total at most 6 and a pending adverse loss', () => {
    let low = { ...ready(), sectionId: '24' };
    const lowFaces = [2, 3];
    low = command(low, { type: 'ROLL_CHECK' }, () => lowFaces.shift()!);
    expect(low.pendingRoll?.total).toBe(6);
    expect(getMentorAction(GAME, low)?.name).toBe('Shoestring Miracle');
    const faces = [3, 3];
    const seven = command({ ...ready(), sectionId: '24' }, { type: 'ROLL_CHECK' }, () => faces.shift()!);
    expect(seven.pendingRoll?.total).toBe(7);
    expect(getMentorAction(GAME, seven)).toBeNull();
    const noLoss = command({ ...ready(), sectionId: '10' }, { type: 'ROLL_CHECK' }, () => 1);
    expect(getMentorAction(GAME, noLoss)).toBeNull();
  });

  it.each([[1, '85', 1000], [6, '83', 2500]])('rerolls to a new branch and ignores remaining loss on a %i-face reroll', (face, target, capital) => {
    let state = command({ ...ready(), sectionId: '24' }, { type: 'ROLL_CHECK' }, () => 1);
    expect(state.capital).toBe(1000);
    state = command(state, { type: 'USE_MENTOR' }, () => face);
    expect(state.pendingRoll?.previousDice).toEqual([1, 1]);
    expect(state.powerUsed).toBe(true);
    expect(getMentorAction(GAME, state)).toBeNull();
    state = command(state, { type: 'CONFIRM_ROLL' });
    expect(state.sectionId).toBe(target);
    expect(state.capital).toBe(capital);
    expect(state.phase).toBe('adventure');
  });

  it.each([[100, 100], [300, 200], [1000, 500]])('rounds Hustler protection for a $%i failure to a $%i loss', (amount, loss) => {
    const game = structuredClone(GAME);
    game.scenes['85'].effects![0] = { ...game.scenes['85'].effects![0], kind: 'capital', amount: -amount, category: 'setback' };
    let state = command({ ...ready('hustler', 'born-closer', game), sectionId: '24' }, { type: 'ROLL_CHECK' }, () => 1, game);
    state = command(state, { type: 'USE_MENTOR' }, undefined, game);
    state = command(state, { type: 'CONFIRM_ROLL' }, undefined, game);
    expect(state.capital).toBe(1000 - loss);
  });

  it('keeps Dealer-converted and naturally mixed destination effects distinct', () => {
    let failed = command({ ...ready('deal-maker'), sectionId: '10' }, { type: 'ROLL_CHECK' }, () => 1);
    expect(getMentorAction(GAME, failed)?.name).toBe('The Big Play');
    failed = command(failed, { type: 'USE_MENTOR' });
    failed = command(failed, { type: 'CONFIRM_ROLL' });
    expect(failed.sectionId).toBe('32');
    expect(failed.capital).toBe(1000);
    expect(getStats(GAME, failed).TA).toBe(3);
    const faces = [3, 4];
    let mixed = command({ ...ready('deal-maker'), sectionId: '10' }, { type: 'ROLL_CHECK' }, () => faces.shift()!);
    expect(getMentorAction(GAME, mixed)).toBeNull();
    mixed = command(mixed, { type: 'CONFIRM_ROLL' });
    expect(mixed.capital).toBe(2000);
    expect(getStats(GAME, mixed).TA).toBe(2);
    expect(mixed.powerUsed).toBe(false);
  });
});
