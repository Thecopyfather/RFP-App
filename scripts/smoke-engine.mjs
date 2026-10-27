/**
 * Dependency-free engine regression checks. Requires Node.js 24 or newer.
 * Run from the project directory:
 *   node --experimental-strip-types scripts/smoke-engine.mjs
 *
 * This loads the actual TypeScript content and engine through Node's native type
 * stripping. The resolution hook only appends .ts to project-relative imports.
 * No build products, dependencies, manuscript files, or saved games are changed.
 * Zod save validation, Vitest, and browser checks are separate test suites.
 */
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { extname } from 'node:path';

if (Number(process.versions.node.split('.')[0]) < 24) {
  throw new Error('This dependency-free suite requires Node.js 24+.');
}

const projectURL = new URL('../', import.meta.url).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (error.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.')
          && context.parentURL?.startsWith(projectURL) && !extname(specifier)) {
        return nextResolve(`${specifier}.ts`, context);
      }
      throw error;
    }
  },
});

const { GAME } = await import('../src/content/game.ts');
const {
  applyCommand, createInitialState, getAvailableChoices, getMentorAction,
  getStartingCapital, getStats, getVisibleParagraphs,
} = await import('../src/engine/game.ts');
const { readDie, rollD6, roll2D6 } = await import('../src/engine/dice.ts');

let assertions = 0;
let passed = 0;
let failed = 0;
let commandSequence = 0;
let runSequence = 0;

function equal(actual, expected, message) {
  assertions += 1;
  assert.deepStrictEqual(actual, expected, message);
}
function truthy(value, message) {
  assertions += 1;
  assert.ok(value, message);
}
function rejects(body, message) {
  assertions += 1;
  assert.throws(body, undefined, message);
}
function suite(name, body) {
  const before = assertions;
  try {
    body();
    passed += 1;
    console.log(`PASS ${name} (${assertions - before} assertions)`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}\n${error.stack ?? error}`);
  }
}
function faceSequence(...values) {
  let index = 0;
  return () => {
    if (index >= values.length) throw new Error('The test consumed unexpected extra randomness.');
    return values[index++];
  };
}
function act(state, command, rng = () => 1, game = GAME) {
  return applyCommand(game, state, { ...command, id: `native-command-${++commandSequence}` }, rng);
}
function ready({ mentorId = 'bootstrapper', perkId = 'born-closer', face = 1, game = GAME } = {}) {
  let state = createInitialState(game, `native-run-${++runSequence}`);
  for (const command of [
    { type: 'ROLL_ALL_ATTRIBUTES' },
    { type: 'SELECT_PERK', perkId },
    { type: 'SELECT_MENTOR', mentorId },
    { type: 'SET_CREATION_STEP', step: 'summary' },
    { type: 'START_ADVENTURE' },
  ]) state = act(state, command, () => face, game);
  return state;
}
function at(state, sectionId, capital = state.capital) {
  // Isolate a real manuscript check without inventing a playable shortcut.
  return { ...state, sectionId, capital };
}
function jsonRoundTrip(state) {
  // Persistence of engine data only; this intentionally does not import Zod.
  const restored = JSON.parse(JSON.stringify(state));
  equal(restored, state, 'Engine state must retain every committed field in JSON.');
  return restored;
}
function lossFixture(amount, category = 'setback') {
  const game = structuredClone(GAME);
  // Explicit test-only amounts verify generic rounding; this does not alter story content.
  game.scenes['85'].effects = [{
    id: 'native-fixed-loss', kind: 'capital', amount: -amount, category,
    reason: 'Test-only fixed loss for a generic engine calculation.',
  }];
  return game;
}

console.log(`Roll For Profit — native engine smoke checks on Node ${process.versions.node}`);
console.log('Actual TypeScript engine and manuscript prototype; no external packages.');

suite('unbiased crypto rejection, all d6 faces, and 2d6 boundaries', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis.crypto, 'getRandomValues');
  const samples = [0xffff_ffff, 0xffff_fffc, 0, 1, 2, 3, 4, 5];
  let draws = 0;
  Object.defineProperty(globalThis.crypto, 'getRandomValues', {
    configurable: true,
    value(array) {
      if (samples.length === 0) throw new Error('Unexpected crypto draw.');
      array[0] = samples.shift();
      draws += 1;
      return array;
    },
  });
  try {
    equal(Array.from({ length: 6 }, () => rollD6()), [1, 2, 3, 4, 5, 6]);
    equal(draws, 8, 'Both uint32 tail values must be rejected rather than mapped modulo six.');
  } finally {
    if (descriptor) Object.defineProperty(globalThis.crypto, 'getRandomValues', descriptor);
    else delete globalThis.crypto.getRandomValues;
  }
  equal(roll2D6(() => 1), [1, 1]);
  equal(roll2D6(() => 6), [6, 6]);
  equal(roll2D6(faceSequence(2, 5)), [2, 5], 'Individual dice must remain visible.');
  for (const invalid of [0, 7, -1, 1.25, NaN, Infinity]) rejects(() => readDie(() => invalid));
});

suite('creation accuracy for all 15 perk/mentor combinations', () => {
  const perks = [
    ['born-closer', { TA: 2 }, 1000],
    ['marketing-genius', { CR: 2 }, 1000],
    ['hustlers-work-ethic', { RE: 1, NE: 1 }, 1000],
    ['charismatic-leader', { NE: 2 }, 1000],
    ['investor-backed', { RE: -2 }, 2000],
  ];
  const mentors = [
    ['bootstrapper', { RE: 1 }], ['hustler', { RE: 2 }], ['deal-maker', { NE: 2 }],
  ];
  for (const [perkId, perkStats, capital] of perks) {
    for (const [mentorId, mentorStats] of mentors) {
      const state = ready({ perkId, mentorId, face: 6 });
      const expected = Object.fromEntries(['CR', 'TA', 'RE', 'NE', 'TS'].map(key =>
        [key, 6 + (perkStats[key] ?? 0) + (mentorStats[key] ?? 0)]));
      equal(getStats(GAME, state), expected, `${perkId} + ${mentorId}`);
      equal(state.baseStats, { CR: 6, TA: 6, RE: 6, NE: 6, TS: 6 });
      equal(state.capital, capital);
      equal(getStartingCapital(GAME, state), capital);
      equal(state.phase, 'adventure');
      equal(state.sectionId, '1');
    }
  }
  equal(getStats(GAME, ready({ perkId: 'investor-backed', mentorId: 'deal-maker' })).RE, -1,
    'The manuscript does not authorize clipping a negative attribute.');
  equal(getStats(GAME, ready({ perkId: 'charismatic-leader', mentorId: 'deal-maker', face: 6 })).NE, 10,
    'Starting d6 bounds do not cap modified attributes.');
});

suite('immutable creation, backward steps, name entry, and one roll per attribute', () => {
  let state = createInitialState(GAME, 'native-creation');
  const untouched = JSON.stringify(state);
  rejects(() => act(state, { type: 'START_ADVENTURE' }));
  rejects(() => act(state, { type: 'SET_CREATION_STEP', step: 'summary' }));
  rejects(() => act(state, { type: 'ROLL_ALL_ATTRIBUTES' }, faceSequence(1, 2, 7)));
  equal(JSON.stringify(state), untouched, 'A failed command must not partially mutate the input state.');
  state = act(state, { type: 'SET_NAME', name: 'Ada ' });
  equal(state.name, 'Ada ', 'Typing a space between names must remain possible.');
  state = act(state, { type: 'SET_NAME', name: 'Ada Lovelace' });
  equal(state.name, 'Ada Lovelace');
  state = act(state, { type: 'ROLL_ATTRIBUTE', stat: 'CR' }, () => 6);
  state = act(state, { type: 'ROLL_ALL_ATTRIBUTES' }, faceSequence(1, 2, 3, 4));
  equal(state.baseStats, { CR: 6, TA: 1, RE: 2, NE: 3, TS: 4 });
  rejects(() => act(state, { type: 'ROLL_ATTRIBUTE', stat: 'CR' }));
  state = act(state, { type: 'SELECT_PERK', perkId: 'investor-backed' });
  state = act(state, { type: 'SELECT_MENTOR', mentorId: 'hustler' });
  state = act(state, { type: 'SET_CREATION_STEP', step: 'summary' });
  state = act(state, { type: 'SET_CREATION_STEP', step: 'attributes' });
  state = act(state, { type: 'SELECT_PERK', perkId: 'born-closer' });
  state = act(state, { type: 'SELECT_MENTOR', mentorId: 'bootstrapper' });
  equal(state.capital, 1000, 'Changing away from Investor-Backed must remove its starting bonus.');
  equal(getStats(GAME, state), { CR: 6, TA: 3, RE: 3, NE: 3, TS: 4 });
  rejects(() => act(state, { type: 'START_ADVENTURE' }), 'Reviewing earlier steps must require returning to the summary.');
});

suite('all 144 ordered dice pairs across the four authored checks', () => {
  // Independent expected routes: physical PDF pp.19–21 and pp.32–33.
  const routes = {
    '7': ['22', '23', '24'],
    '9': ['28', '29', '30'],
    '10': ['31', '32', '33'],
    '24': ['83', '84', '85'],
  };
  const ranks = ['success', 'mixed', 'failure'];
  for (const [section, destinations] of Object.entries(routes)) {
    const source = at(ready({ mentorId: 'hustler' }), section);
    const modifier = section === '10' ? 3 : 1;
    const reached = new Set();
    for (let first = 1; first <= 6; first += 1) {
      for (let second = 1; second <= 6; second += 1) {
        const total = first + second + modifier;
        const band = total >= 11 ? 0 : total >= 8 ? 1 : 2;
        const target = destinations[band];
        const rolled = act(source, { type: 'ROLL_CHECK' }, faceSequence(first, second));
        const outcome = GAME.scenes[section].check.outcomes[rolled.pendingRoll.outcomeIndex];
        reached.add(outcome.rank);
        equal(rolled.pendingRoll.dice, [first, second]);
        equal(rolled.pendingRoll.modifier, modifier);
        equal(rolled.pendingRoll.total, total);
        equal(outcome.rank, ranks[band]);
        equal(outcome.target, target);
        equal(rolled.capital, 1000, 'A displayed roll must not apply its destination effects before confirmation.');
        const next = act(rolled, { type: 'CONFIRM_ROLL' });
        if (section === '7' && band < 2 || section === '9') {
          equal(next.phase, 'boundary');
          equal(next.sectionId, section);
          equal(next.boundary, { from: section, target, label: outcome.label });
        } else {
          equal(next.sectionId, target);
          equal(next.phase, section === '24' && band === 2 ? 'game-over' : 'adventure');
        }
        const capital = section === '10' ? [3000, 2000, 1000][band]
          : section === '24' ? [2500, 1000, 0][band] : 1000;
        equal(next.capital, capital);
        equal(next.statChanges.TA, section === '10' && band === 1 ? -1 : 0);
        equal(source.capital, 1000, 'Resolving a result must not mutate its source state.');
      }
    }
    equal([...reached].sort(), [...ranks].sort(), `All three outcomes of section ${section} must be exercised.`);
  }
});

suite('phase safety, command idempotency, and duplicate-effect prevention', () => {
  const source = at(ready(), '24');
  const rollCommand = { type: 'ROLL_CHECK', id: 'native-fixed-roll' };
  let draws = 0;
  const rng = () => { draws += 1; return 6; };
  let state = applyCommand(GAME, source, rollCommand, rng);
  equal(draws, 2);
  const duplicate = applyCommand(GAME, state, rollCommand, rng);
  truthy(duplicate === state, 'Replaying a committed command must return the existing state.');
  equal(draws, 2, 'Replaying a roll must not consume new randomness.');
  rejects(() => act(state, { type: 'ROLL_CHECK' }));
  const confirm = { type: 'CONFIRM_ROLL', id: 'native-fixed-confirmation' };
  state = applyCommand(GAME, state, confirm);
  equal(state.capital, 2500);
  equal(state.sectionId, '83');
  const historyLength = state.history.length;
  state = jsonRoundTrip(state);
  truthy(applyCommand(GAME, state, confirm) === state);
  equal(state.history.length, historyLength);
  rejects(() => act(state, { type: 'CONFIRM_ROLL' }), 'A double click with a new command id must also be rejected.');
  const before = JSON.stringify(state);
  rejects(() => act(state, { type: 'CHOOSE', choiceId: 'missing-choice' }));
  equal(JSON.stringify(state), before);
});

suite('conditional $997 purchase, affordability, once-per-run payment, and purchase bankruptcy', () => {
  const poor = act({ ...ready(), capital: 996 }, { type: 'CHOOSE', choiceId: '1-to-4' });
  equal(poor.capital, 996);
  equal(poor.flags.coursePurchased ?? false, false);
  equal(getAvailableChoices(GAME, poor).map(choice => choice.target), ['11', '12']);
  const courseCommand = { type: 'CHOOSE', choiceId: '1-to-4', id: 'native-course-purchase' };
  let paid = applyCommand(GAME, ready(), courseCommand);
  equal(paid.capital, 3, 'Frugality must not discount an intentional purchase.');
  equal(paid.flags.coursePurchased, true);
  equal(paid.flags.coursePaid, true);
  equal(getAvailableChoices(GAME, paid).map(choice => choice.target), ['13', '14', '15']);
  truthy(applyCommand(GAME, paid, courseCommand) === paid);
  paid = act(at(jsonRoundTrip(paid), '1'), { type: 'CHOOSE', choiceId: '1-to-4' });
  equal(paid.capital, 3, 'A real revisit must not repurchase a course already paid for this run.');
  const exact = act({ ...ready(), capital: 997 }, { type: 'CHOOSE', choiceId: '1-to-4' });
  equal(exact.capital, 0);
  equal(exact.phase, 'game-over');
});

suite('Bootstrapper passive floors, Shoestring trigger, new branches, and JSON resume', () => {
  for (const amount of [50, 100, 1000]) {
    const game = lossFixture(amount);
    let state = act(at(ready({ game }), '24'), { type: 'ROLL_CHECK' }, () => 1, game);
    state = act(state, { type: 'CONFIRM_ROLL' }, undefined, game);
    equal(state.capital, amount <= 100 ? 1000 : 100);
    equal(state.powerUsed, false);
  }
  const loseAll = lossFixture(1000, 'lose-all');
  let lost = act(at(ready({ game: loseAll }), '24'), { type: 'ROLL_CHECK' }, () => 1, loseAll);
  lost = act(lost, { type: 'CONFIRM_ROLL' }, undefined, loseAll);
  equal(lost.capital, 0, 'Frugality must not reduce a lose-all instruction.');
  equal(lost.phase, 'game-over');
  const six = act(at(ready(), '24'), { type: 'ROLL_CHECK' }, faceSequence(2, 3));
  equal(six.pendingRoll.total, 6);
  equal(getMentorAction(GAME, six)?.name, 'Shoestring Miracle');
  const seven = act(at(ready(), '24'), { type: 'ROLL_CHECK' }, faceSequence(3, 3));
  equal(seven.pendingRoll.total, 7);
  equal(getMentorAction(GAME, seven), null);
  const noLoss = act(at(ready(), '10'), { type: 'ROLL_CHECK' });
  equal(getMentorAction(GAME, noLoss), null);
  for (const [face, target, capital] of [[1, '85', 1000], [6, '83', 2500]]) {
    let state = act(at(ready(), '24'), { type: 'ROLL_CHECK' });
    equal(state.capital, 1000, 'Destination loss must remain pending while the power is offered.');
    state = jsonRoundTrip(state);
    state = act(state, { type: 'USE_MENTOR' }, () => face);
    equal(state.pendingRoll.previousDice, [1, 1]);
    equal(state.pendingRoll.dice, [face, face]);
    equal(state.powerUsed, true);
    state = jsonRoundTrip(state);
    equal(getMentorAction(GAME, state), null);
    rejects(() => act(state, { type: 'USE_MENTOR' }), 'The same Act power cannot be used twice.');
    state = act(state, { type: 'CONFIRM_ROLL' });
    equal(state.sectionId, target);
    equal(state.capital, capital);
    equal(state.phase, 'adventure');
  }
});

suite('Hustler halves only failed losses and rounds the remaining amount up to $100', () => {
  for (const [amount, remaining] of [[100, 100], [300, 200], [1000, 500]]) {
    const game = lossFixture(amount);
    let state = act(at(ready({ mentorId: 'hustler', game }), '24'), { type: 'ROLL_CHECK' }, () => 1, game);
    equal(getMentorAction(game, state)?.name, 'Grind It Out');
    equal(state.capital, 1000);
    state = act(state, { type: 'USE_MENTOR' }, undefined, game);
    state = jsonRoundTrip(state);
    state = act(state, { type: 'CONFIRM_ROLL' }, undefined, game);
    equal(state.capital, 1000 - remaining);
    equal(state.powerUsed, true);
  }
  const mixed = act(at(ready({ mentorId: 'hustler' }), '24'), { type: 'ROLL_CHECK' }, faceSequence(3, 4));
  equal(getMentorAction(GAME, mixed), null);
  rejects(() => act(mixed, { type: 'USE_MENTOR' }));
  const noLoss = act(at(ready({ mentorId: 'hustler' }), '10'), { type: 'ROLL_CHECK' });
  equal(getMentorAction(GAME, noLoss), null);
});

suite('Dealer conversion suppresses result/destination effects, ordinary mixed results remain intact', () => {
  let failed = act(at(ready({ mentorId: 'deal-maker' }), '10'), { type: 'ROLL_CHECK' });
  equal(getMentorAction(GAME, failed)?.name, 'The Big Play');
  failed = act(failed, { type: 'USE_MENTOR' });
  equal(failed.pendingRoll.total, 3, 'The original dice total must remain visible after a mentor conversion.');
  failed = jsonRoundTrip(failed);
  failed = act(failed, { type: 'CONFIRM_ROLL' });
  equal(failed.sectionId, '32');
  equal(failed.capital, 1000);
  equal(getStats(GAME, failed).TA, 3, 'Dealer must cancel the destination Tactics loss as well as Capital gain.');
  equal(failed.powerUsed, true);
  let mixed = act(at(ready({ mentorId: 'deal-maker' }), '10'), { type: 'ROLL_CHECK' }, faceSequence(3, 4));
  equal(getMentorAction(GAME, mixed), null);
  rejects(() => act(mixed, { type: 'USE_MENTOR' }));
  mixed = act(mixed, { type: 'CONFIRM_ROLL' });
  equal(mixed.sectionId, '32');
  equal(mixed.capital, 2000);
  equal(getStats(GAME, mixed).TA, 2);
  equal(mixed.powerUsed, false);

  const game = structuredClone(GAME);
  game.scenes['10'].check.outcomes[1].effects = [
    { id: 'native-result-money', kind: 'capital', amount: 250, category: 'gain', reason: 'Test-only direct result effect.' },
    { id: 'native-result-stat', kind: 'stat', stat: 'TA', amount: -2, reason: 'Test-only direct result effect.' },
  ];
  let both = act(at(ready({ mentorId: 'deal-maker', game }), '10'), { type: 'ROLL_CHECK' }, () => 1, game);
  both = act(both, { type: 'USE_MENTOR' }, undefined, game);
  both = act(both, { type: 'CONFIRM_ROLL' }, undefined, game);
  equal(both.capital, 1000, 'Converted result effects and entry effects must both be suppressed.');
  equal(getStats(game, both).TA, 3);
});

suite('mentor-gated choices and explicit encoded prototype boundaries', () => {
  for (const [mentorId, targets] of [
    ['bootstrapper', ['98', '99']], ['hustler', ['100', '101']], ['deal-maker', ['102', '103']],
  ]) {
    const state = at(ready({ mentorId }), '27');
    const choices = getAvailableChoices(GAME, state);
    equal(choices.map(choice => choice.target), targets);
    equal(getVisibleParagraphs(GAME, state).filter(text => text.startsWith('If you chose')).length, 1);
    const unauthorized = GAME.scenes['27'].choices.find(choice => !targets.includes(choice.target));
    rejects(() => act(state, { type: 'CHOOSE', choiceId: unauthorized.id }));
    const boundary = act(state, { type: 'CHOOSE', choiceId: choices[0].id });
    equal(boundary.phase, 'boundary');
    equal(boundary.sectionId, '27');
    equal(boundary.boundary, { from: '27', target: targets[0], label: choices[0].label });
    equal(boundary.capital, 1000, 'Unimplemented targets must not acquire invented effects.');
    const restored = jsonRoundTrip(boundary);
    equal(getAvailableChoices(GAME, restored), []);
    rejects(() => act(restored, { type: 'CHOOSE', choiceId: choices[1].id }));
  }
});

suite('zero/negative bankruptcy, exact-threshold victory, and fresh restart', () => {
  for (const [capital, expected] of [[1000, 0], [500, -500]]) {
    let state = act(at(ready({ mentorId: 'hustler' }), '24', capital), { type: 'ROLL_CHECK' });
    state = act(state, { type: 'CONFIRM_ROLL' });
    equal(state.capital, expected);
    equal(state.phase, 'game-over');
    equal(getAvailableChoices(GAME, state), []);
    rejects(() => act(state, { type: 'ROLL_CHECK' }));
  }
  let win = act(at(ready(), '10', 8000), { type: 'ROLL_CHECK' }, () => 6);
  win = act(win, { type: 'CONFIRM_ROLL' });
  equal(win.capital, 10000);
  equal(win.phase, 'victory');
  equal(win.sectionId, '280');
  equal(getAvailableChoices(GAME, win), []);
  rejects(() => act(win, { type: 'ROLL_CHECK' }));
  const fresh = createInitialState(GAME, 'native-restart');
  equal(fresh.phase, 'creation');
  equal(fresh.capital, 1000);
  equal(fresh.baseStats, { CR: 0, TA: 0, RE: 0, NE: 0, TS: 0 });
  equal(fresh.rolled, []);
  equal(fresh.applied, []);
  equal(fresh.history, []);
  equal(fresh.pendingRoll, null);
  equal(fresh.mentorId, null);
  equal(fresh.perkId, null);
  equal(fresh.powerUsed, false);
});

console.log(`\n${passed} suites passed; ${failed} failed; ${assertions} assertions executed.`);
console.log('Scope: native headless engine checks. Zod saves, Vitest, browser UI, and production build are not executed here.');
if (failed > 0) process.exitCode = 1;
