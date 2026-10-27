import { describe, expect, it, vi } from 'vitest';
import { GAME } from '../src/content/game';
import { applyCommand, createInitialState, getMentorAction, loadSave, serializeSave } from '../src/engine';
import type { CommandInput, GameState } from '../src/engine';

let id = 0;
function act(state: GameState, payload: CommandInput, rng = () => 1): GameState {
  return applyCommand(GAME, state, { ...payload, id: `save-${++id}` }, rng);
}
function ready(mentorId = 'bootstrapper'): GameState {
  let state = createInitialState(GAME, 'saved-run');
  state = act(state, { type: 'ROLL_ALL_ATTRIBUTES' });
  state = act(state, { type: 'SELECT_PERK', perkId: 'born-closer' });
  state = act(state, { type: 'SELECT_MENTOR', mentorId });
  state = act(state, { type: 'SET_CREATION_STEP', step: 'summary' });
  return act(state, { type: 'START_ADVENTURE' });
}
function roundTrip(state: GameState): GameState {
  const loaded = loadSave(serializeSave(state, GAME), GAME);
  expect(loaded.ok).toBe(true);
  if (!loaded.ok) throw new Error(loaded.error);
  expect(loaded.state).toEqual(state);
  return loaded.state;
}

describe('versioned local-save payloads', () => {
  it('round trips partial character creation, ready adventures and boundaries', () => {
    let creation = createInitialState(GAME, 'partial');
    creation = act(creation, { type: 'ROLL_ATTRIBUTE', stat: 'CR' }, () => 6);
    roundTrip(creation);
    const adventure = roundTrip(ready());
    let boundary = act(adventure, { type: 'CHOOSE', choiceId: '1-to-2' });
    boundary = act(boundary, { type: 'CHOOSE', choiceId: '2-to-5' });
    const choice = GAME.scenes[boundary.sectionId].choices.find(item => !GAME.scenes[item.target])!;
    boundary = act(boundary, { type: 'CHOOSE', choiceId: choice.id });
    expect(boundary.phase).toBe('boundary');
    roundTrip(boundary);
  });

  it('preserves pending dice, optional mentor offers, rerolls and effect suppression', () => {
    let state = act({ ...ready(), sectionId: '24' }, { type: 'ROLL_CHECK' });
    state = roundTrip(state);
    expect(state.capital).toBe(1000);
    expect(getMentorAction(GAME, state)).not.toBeNull();
    state = act(state, { type: 'USE_MENTOR' });
    state = roundTrip(state);
    expect(state.powerUsed).toBe(true);
    expect(state.pendingRoll?.dice).toEqual([1, 1]);
    const action = { type: 'CONFIRM_ROLL', id: 'confirm-once' } as const;
    state = applyCommand(GAME, state, action);
    state = roundTrip(state);
    expect(state.capital).toBe(1000);
    expect(applyCommand(GAME, state, action)).toBe(state);
  });

  it('does not redraw randomness when replaying an already saved roll command', () => {
    const action = { type: 'ROLL_CHECK', id: 'saved-roll-id' } as const;
    const rolled = applyCommand(GAME, { ...ready(), sectionId: '24' }, action, () => 2);
    const loaded = roundTrip(rolled);
    const rng = vi.fn(() => 6);
    expect(applyCommand(GAME, loaded, action, rng)).toBe(loaded);
    expect(rng).not.toHaveBeenCalled();
  });

  it('preserves Dealer conversion provenance after reloading', () => {
    let state = act({ ...ready('deal-maker'), sectionId: '10' }, { type: 'ROLL_CHECK' });
    state = act(state, { type: 'USE_MENTOR' });
    state = roundTrip(state);
    state = act(state, { type: 'CONFIRM_ROLL' });
    expect(state.capital).toBe(1000);
    expect(state.statChanges.TA).toBe(0);
    roundTrip(state);
  });

  it.each([
    '', '{', 'null', '{}',
    JSON.stringify({ ...createInitialState(GAME, 'invalid'), schemaVersion: 2 }),
    JSON.stringify({ ...createInitialState(GAME, 'invalid'), contentVersion: 'other-edition' }),
    JSON.stringify({ ...createInitialState(GAME, 'invalid'), baseStats: { CR: 9, TA: 0, RE: 0, NE: 0, TS: 0 }, rolled: ['CR'] }),
  ])('returns a useful error for an unsupported or damaged save', raw => {
    const result = loadSave(raw, GAME);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.length).toBeGreaterThan(10);
  });

  it('rejects inconsistent pending dice, outcome, modifier and mentor state', () => {
    const state = act({ ...ready(), sectionId: '24' }, { type: 'ROLL_CHECK' });
    for (const patch of [{ dice: [0, 7] }, { total: 99 }, { modifier: 99 }, { outcomeIndex: 0 }, { power: 'neutral-result' }]) {
      const raw = JSON.stringify({ ...state, pendingRoll: { ...state.pendingRoll, ...patch } });
      expect(loadSave(raw, GAME).ok).toBe(false);
    }
  });

  it('rejects a saved reroll whose original dice never qualified for the power', () => {
    let state = act({ ...ready(), sectionId: '24' }, { type: 'ROLL_CHECK' });
    state = act(state, { type: 'USE_MENTOR' });
    const raw = JSON.stringify({ ...state, pendingRoll: { ...state.pendingRoll, previousDice: [6, 6] } });
    expect(loadSave(raw, GAME).ok).toBe(false);
  });

  it('fresh restart drops pending actions, power usage, history and prior effects', () => {
    let state = act({ ...ready(), sectionId: '24' }, { type: 'ROLL_CHECK' });
    state = act(state, { type: 'USE_MENTOR' });
    expect(state.applied.length).toBeGreaterThan(0);
    const restarted = roundTrip(createInitialState(GAME, 'fresh-run'));
    expect(restarted).toMatchObject({ phase: 'creation', capital: 1000, rolled: [], history: [], applied: [], powerUsed: false, pendingRoll: null, perkId: null, mentorId: null });
  });
});
