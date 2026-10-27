import { describe, expect, it, vi } from 'vitest';
import { GAME } from '../src/content/game';
import {
  applyCommand, createInitialState, getAvailableChoices, getMentorAction,
  getStats, getVisibleParagraphs, loadSave, serializeSave,
} from '../src/engine';
import type { CommandInput, GameState, Stats } from '../src/engine';

let sequence = 0;
const command = (state: GameState, input: CommandInput, rng: () => number = () => 3) =>
  applyCommand(GAME, state, { ...input, id: `navigation-${++sequence}` }, rng);

function newEntrepreneur(mentorName = 'The Deal Maker'): GameState {
  let state = createInitialState(GAME, `integration-${++sequence}`);
  state = command(state, { type: 'SET_NAME', name: 'Avery' });
  state = command(state, { type: 'ROLL_ALL_ATTRIBUTES' });
  state = command(state, { type: 'SELECT_PERK', perkId: GAME.perks.find((perk) => perk.name === 'Born Closer')!.id });
  state = command(state, { type: 'SELECT_MENTOR', mentorId: GAME.mentors.find((mentor) => mentor.name === mentorName)!.id });
  state = command(state, { type: 'SET_CREATION_STEP', step: 'summary' });
  return command(state, { type: 'START_ADVENTURE' });
}

function atSection(sectionId: string, options: { mentor?: string; capital?: number; baseStats?: Partial<Stats> } = {}): GameState {
  const state = newEntrepreneur(options.mentor);
  return {
    ...state, sectionId, capital: options.capital ?? 3000,
    baseStats: { ...state.baseStats, ...options.baseStats },
  };
}

function chooseTarget(state: GameState, target: string): GameState {
  const choice = getAvailableChoices(GAME, state).find((item) => item.target === target);
  expect(choice, `${state.sectionId} should offer destination ${target}`).toBeDefined();
  return command(state, { type: 'CHOOSE', choiceId: choice!.id });
}

function dice(...values: number[]) {
  let index = 0;
  return vi.fn(() => {
    if (index >= values.length) throw new Error('Test consumed an unexpected die.');
    return values[index++];
  });
}

function restore(state: GameState): GameState {
  const result = loadSave(serializeSave(state, GAME), GAME);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  return result.state;
}

describe('real manuscript navigation', () => {
  it('plays from character creation through the opening to an actual dice interaction', () => {
    let state = newEntrepreneur();
    expect(state.phase).toBe('adventure');
    expect(state.sectionId).toBe('1');
    expect(state.name).toBe('Avery');
    state = chooseTarget(state, '2');
    state = chooseTarget(state, '7');
    state = command(state, { type: 'ROLL_CHECK' }, dice(1, 1));
    expect(state.pendingRoll).toMatchObject({ dice: [1, 1], stat: 'CR', modifier: 3, total: 5 });
    state = command(state, { type: 'CONFIRM_ROLL' });
    expect(state.sectionId).toBe('24');
    expect(state.phase).toBe('adventure');
  });

  it.each([
    { diceValues: [4, 4], total: 11, target: '83', capital: 4500 },
    { diceValues: [2, 3], total: 8, target: '84', capital: 3000 },
    { diceValues: [1, 1], total: 5, target: '85', capital: 2000 },
  ])('resolves §24 total $total into §$target and its original consequence', ({ diceValues, total, target, capital }) => {
    const before = atSection('24');
    let state = command(before, { type: 'ROLL_CHECK' }, dice(...diceValues));
    expect(state.pendingRoll?.total).toBe(total);
    expect(state.capital).toBe(before.capital);
    state = command(state, { type: 'CONFIRM_ROLL' });
    expect(state.sectionId).toBe(target);
    expect(state.capital).toBe(capital);
    expect(before.sectionId).toBe('24');
    expect(before.capital).toBe(3000);
  });

  it.each([
    { section: '7', diceValues: [4, 4], target: '22', capital: 3000 },
    { section: '7', diceValues: [2, 3], target: '23', capital: 3000 },
    { section: '7', diceValues: [1, 1], target: '24', capital: 3000 },
    { section: '9', diceValues: [4, 4], target: '28', capital: 3000 },
    { section: '9', diceValues: [2, 3], target: '29', capital: 3000 },
    { section: '9', diceValues: [1, 1], target: '30', capital: 3000 },
    { section: '10', diceValues: [4, 4], target: '31', capital: 5000 },
    { section: '10', diceValues: [2, 3], target: '32', capital: 4000 },
    { section: '10', diceValues: [1, 1], target: '33', capital: 3000 },
  ])('resolves §$section dice $diceValues to its original destination §$target', ({ section, diceValues, target, capital }) => {
    // Deal Maker adds +2 NE, so a starting NE of 1 makes each tested modifier 3.
    let state = atSection(section, { baseStats: { NE: 1 } });
    state = command(state, { type: 'ROLL_CHECK' }, dice(...diceValues));
    expect(state.pendingRoll?.modifier).toBe(3);
    state = command(state, { type: 'CONFIRM_ROLL' });
    expect(GAME.scenes[target] ? state.sectionId : state.boundary?.target).toBe(target);
    expect(state.capital).toBe(capital);
  });

  it('takes every available original choice to an implemented destination or an explicit boundary', () => {
    let visited = 0;
    let boundaries = 0;
    for (const scene of Object.values(GAME.scenes)) {
      if (scene.check || scene.ending) continue;
      for (const mentor of GAME.mentors) {
        for (const capital of [500, 3000]) {
          const state = atSection(scene.id, { mentor: mentor.name, capital });
          for (const choice of getAvailableChoices(GAME, state)) {
            const next = command(state, { type: 'CHOOSE', choiceId: choice.id });
            visited += 1;
            if (GAME.scenes[choice.target]) {
              expect(next.sectionId, `${scene.id} → ${choice.target}`).toBe(choice.target);
              expect(['adventure', 'game-over', 'victory']).toContain(next.phase);
            } else {
              boundaries += 1;
              expect(next.phase).toBe('boundary');
              expect(next.boundary).toEqual({ from: scene.id, target: choice.target, label: choice.label });
              expect(next.capital).toBe(state.capital);
            }
          }
        }
      }
    }
    expect(visited).toBeGreaterThan(30);
    expect(boundaries).toBeGreaterThan(0);
  });

  it('does not treat a prototype boundary as an authored failure or victory', () => {
    const before = atSection('5');
    const next = chooseTarget(before, '16');
    expect(next.phase).toBe('boundary');
    expect(next.boundary?.target).toBe('16');
    expect(next.capital).toBe(before.capital);
    expect(next.pendingRoll).toBeNull();
  });
});

describe('source conditions and once-per-event consequences', () => {
  it('shows §4 insufficient-funds paths without charging $997', () => {
    const state = chooseTarget(atSection('1', { capital: 996 }), '4');
    expect(state.capital).toBe(996);
    expect(getAvailableChoices(GAME, state).map((choice) => choice.target)).toEqual(['11', '12']);
    expect(getVisibleParagraphs(GAME, state).join(' ')).toContain("If you don't have enough Capital");
    expect(getVisibleParagraphs(GAME, state).join(' ')).not.toContain('The next morning');
  });

  it('charges the original $997 purchase exactly once and preserves the purchased-course narrative', () => {
    const before = atSection('1', { mentor: 'The Bootstrapper', capital: 1000 });
    const choice = getAvailableChoices(GAME, before).find((item) => item.target === '4')!;
    const action = { type: 'CHOOSE' as const, choiceId: choice.id, id: 'purchase-once' };
    const purchased = applyCommand(GAME, before, action);
    expect(purchased.capital).toBe(3);
    expect(getAvailableChoices(GAME, purchased).map((item) => item.target)).toEqual(['13', '14', '15']);
    expect(getVisibleParagraphs(GAME, purchased).join(' ')).toContain('The next morning');
    expect(applyCommand(GAME, purchased, action)).toBe(purchased);
  });

  it('applies the approved bankruptcy threshold when exactly $997 is spent', () => {
    const state = chooseTarget(atSection('1', { capital: 997 }), '4');
    expect(state.capital).toBe(0);
    expect(state.phase).toBe('game-over');
  });

  it.each([
    ['The Bootstrapper', ['98', '99']],
    ['The Hustler', ['100', '101']],
    ['The Deal Maker', ['102', '103']],
  ])('restricts §27 choices and dialogue to %s', (mentor, targets) => {
    const state = atSection('27', { mentor: mentor as string });
    expect(getAvailableChoices(GAME, state).map((choice) => choice.target)).toEqual(targets);
    const text = getVisibleParagraphs(GAME, state).join(' ');
    for (const other of GAME.mentors.filter((item) => item.name !== mentor)) {
      expect(text).not.toContain(`If you chose ${other.name}:`);
    }
  });

  it('keeps a naturally mixed §10 result and its §32 effects distinct from Dealer conversion', () => {
    const before = atSection('10', { baseStats: { RE: 3 } });
    const originalTactics = getStats(GAME, before).TA;
    let state = command(before, { type: 'ROLL_CHECK' }, dice(2, 3));
    expect(state.pendingRoll?.total).toBe(8);
    expect(getMentorAction(GAME, state)).toBeNull();
    state = command(state, { type: 'CONFIRM_ROLL' });
    expect(state.sectionId).toBe('32');
    expect(state.capital).toBe(4000);
    expect(getStats(GAME, state).TA).toBe(originalTactics - 1);
  });

  it('suppresses both §32 effects only when Dealer converts a failed §10 check', () => {
    const before = atSection('10', { baseStats: { RE: 3 } });
    let state = command(before, { type: 'ROLL_CHECK' }, dice(1, 1));
    expect(getMentorAction(GAME, state)).not.toBeNull();
    state = command(state, { type: 'USE_MENTOR' });
    state = command(state, { type: 'CONFIRM_ROLL' });
    expect(state.sectionId).toBe('32');
    expect(state.capital).toBe(before.capital);
    expect(getStats(GAME, state).TA).toBe(getStats(GAME, before).TA);
    expect(state.powerUsed).toBe(true);
  });

  it('offers mentor protection before the §85 entry loss would cause bankruptcy', () => {
    let state = atSection('24', { mentor: 'The Hustler', capital: 1000 });
    state = command(state, { type: 'ROLL_CHECK' }, dice(1, 1));
    expect(state.phase).toBe('roll-result');
    expect(state.capital).toBe(1000);
    expect(getMentorAction(GAME, state)).not.toBeNull();
    state = command(state, { type: 'USE_MENTOR' });
    state = command(state, { type: 'CONFIRM_ROLL' });
    expect(state.sectionId).toBe('85');
    expect(state.capital).toBe(500);
    expect(state.phase).toBe('adventure');
  });
});

describe('committed navigation across retries and reloads', () => {
  it('reuses recorded dice and applies the §85 loss once after reload and duplicate confirmation', () => {
    const rng = dice(1, 1);
    const roll = { type: 'ROLL_CHECK' as const, id: 'persisted-roll' };
    const pending = applyCommand(GAME, atSection('24'), roll, rng);
    expect(applyCommand(GAME, pending, roll, rng)).toBe(pending);
    expect(rng).toHaveBeenCalledTimes(2);

    const loaded = restore(pending);
    expect(loaded).toEqual(pending);
    const confirm = { type: 'CONFIRM_ROLL' as const, id: 'persisted-confirmation' };
    const next = applyCommand(GAME, loaded, confirm, rng);
    expect(next.sectionId).toBe('85');
    expect(next.capital).toBe(2000);
    expect(applyCommand(GAME, next, confirm, rng)).toBe(next);
    expect(restore(next)).toEqual(next);
    expect(rng).toHaveBeenCalledTimes(2);
  });

  it('restores mentor activation without allowing it to be consumed a second time', () => {
    let state = atSection('24', { mentor: 'The Hustler' });
    state = command(state, { type: 'ROLL_CHECK' }, dice(1, 1));
    state = command(state, { type: 'USE_MENTOR' });
    state = restore(state);
    expect(state.pendingRoll?.power).toBe('halve-loss');
    expect(getMentorAction(GAME, state)).toBeNull();
    expect(() => command(state, { type: 'USE_MENTOR' })).toThrow();
    state = command(state, { type: 'CONFIRM_ROLL' });
    expect(state.capital).toBe(2500);
  });

  it('retains the purchased course when revisiting §4 without charging for the same course again', () => {
    let state = chooseTarget(atSection('1', { capital: 3000 }), '4');
    expect(state.capital).toBe(2003);
    // Simulate a future authored return link without inventing that link in the playable edition.
    state = { ...restore(state), sectionId: '1' };
    state = chooseTarget(state, '4');
    expect(state.capital).toBe(2003);
    expect(getAvailableChoices(GAME, state).map((choice) => choice.target)).toEqual(['13', '14', '15']);
  });
});
